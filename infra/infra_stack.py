from constructs import Construct

import aws_cdk as cdk
from aws_cdk import (
    aws_iam,
    
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as cf_origins,
    aws_route53 as route53,
    aws_route53_targets as r53_targets,
    aws_certificatemanager as acm,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,

    aws_dynamodb as dynamodb,
)

import deployment_env
env_config = deployment_env.load_config()

class InfraStack(cdk.Stack):
    def __init__(self, scope: Construct, id: str, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        env = deployment_env.get_env()

        app_name = env_config.get("App Name")
        app_name_prefix = env_config.get("App Name Prefix")
        app_resource_name_prefix = env_config.get("App Resource Name Prefix")
        do_s3_deploy = env_config.get("Do S3 Deploy")
        web_domain_name = env_config.get("Web Domain Name")
        web_cert_arn = env_config.get("Web Certificate Arn")
        web_hosted_zone_id = env_config.get("Web Hosted Zone Id")

        print(f'{env = }')

        print(f'{web_domain_name = }')
        print(f'{web_cert_arn = }')
        print(f'{web_hosted_zone_id = }')

        # DynamoDB table for key-value cache
        cache_table = dynamodb.Table(
            self,
            f"{app_name_prefix}CacheTable",
            table_name=f"{app_resource_name_prefix}-cache-{env}",
            partition_key=dynamodb.Attribute(
                name="key",
                type=dynamodb.AttributeType.STRING
            ),
            time_to_live_attribute="ttl",
            removal_policy=cdk.RemovalPolicy.DESTROY if env != "prod" else cdk.RemovalPolicy.RETAIN
        )

        # S3 Bucket for Storing Assets
        program_rig_assets_data_bucket = s3.Bucket(
            self,
            f"{app_name_prefix}AssetsDataBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ACLS,
            enforce_ssl=True,
            auto_delete_objects=False if env == "prod" else True,
            removal_policy=cdk.RemovalPolicy.RETAIN if env == "prod" else cdk.RemovalPolicy.DESTROY,
            lifecycle_rules=[
                s3.LifecycleRule(
                    enabled=True,
                    transitions=[
                        s3.Transition(
                            storage_class=s3.StorageClass.INFREQUENT_ACCESS,
                            transition_after=cdk.Duration.days(60)
                        )
                    ],
                    expiration=cdk.Duration.days(365 * 5)
                )
            ]
        )

        # S3 Bucket for Static Hosting
        hosting_bucket = s3.Bucket(
            self,
            f"{app_name_prefix}WebsiteBucket",
            block_public_access=s3.BlockPublicAccess.BLOCK_ACLS,
            enforce_ssl=True,
            auto_delete_objects=False if env == "prod" else True,
            removal_policy=cdk.RemovalPolicy.RETAIN if env == "prod" else cdk.RemovalPolicy.DESTROY
        )

        # ACM Certificate
        certificate = acm.Certificate.from_certificate_arn(self, "Certificate", web_cert_arn)

        # Origin Access Control (OAC)
        oac = cloudfront.S3OriginAccessControl(self, "OAC")
        
        # Create S3BucketOrigin with OAC
        origin = cf_origins.S3BucketOrigin.with_origin_access_control(hosting_bucket, origin_access_control=oac)

        # CloudFront Function for URL rewriting
        url_rewrite_function = cloudfront.Function(
            self,
            f"{app_name_prefix}UrlRewriteFunction",
            code=cloudfront.FunctionCode.from_inline(
                """
                function handler(event) {
                    var request = event.request;
                    var uri = request.uri;

                    // Serve the homepage correctly
                    if (uri === '/') {
                        request.uri = '/index.html';
                    } else if (uri.endsWith('/')) {
                        // If the URI ends with a slash, remove it and append .html
                        // turns "/foo/" to "/foo.html"
                        request.uri = uri.slice(0, -1) + '.html';
                    } else if (!uri.endsWith('.html') && !uri.includes('.')) {
                        // If URI doesn't end with .html and isn't a file (doesn't contain a dot), append .html
                        request.uri = uri + '.html';
                    }

                    return request;
                }
                """.strip()
            )
        )
        
        # CloudFront Distribution
        distribution = cloudfront.Distribution(
            self,
            f"{app_name_prefix}CloudFrontDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origin,
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowed_methods=cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                function_associations=[
                    cloudfront.FunctionAssociation(
                        event_type=cloudfront.FunctionEventType.VIEWER_REQUEST,
                        function=url_rewrite_function
                    )
                ]
            ),
            domain_names=[web_domain_name],
            certificate=certificate,
            default_root_object="index.html",
            # Custom error responses:
            # For a React app with client-side routing, sends the index.html for the 404 errors that arise
            error_responses = [
                cloudfront.ErrorResponse(
                    http_status = 404,
                    response_http_status = 200,
                    response_page_path = "/index.html"
                ),
                cloudfront.ErrorResponse(
                    http_status = 403,
                    response_http_status = 200,
                    response_page_path = "/index.html"
                ),
            ],
            minimum_protocol_version=cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021
        )
        
        # Grant CloudFront access to S3 bucket
        hosting_bucket.add_to_resource_policy(
            aws_iam.PolicyStatement(
                actions=["s3:GetObject"],
                resources=[hosting_bucket.arn_for_objects("*")],
                principals=[aws_iam.ServicePrincipal("cloudfront.amazonaws.com")],
                conditions={
                    "StringEquals": {
                        "AWS:SourceArn": f"arn:aws:cloudfront::{self.account}:distribution/{distribution.distribution_id}"
                    }
                }
            )
        )

        # Route 53 Hosted Zone
        hosted_zone = route53.HostedZone.from_hosted_zone_attributes(
            self, f"{app_name_prefix}HostedZone",
            hosted_zone_id=web_hosted_zone_id,
            zone_name=web_domain_name
        )

        # Route 53 Record
        route53.ARecord(
            self,
            f"{app_name_prefix}AliasRecord",
            zone=hosted_zone,
            target=route53.RecordTarget.from_alias(r53_targets.CloudFrontTarget(distribution))
        )

        # S3 Deployment (Optional)
        if do_s3_deploy:
            s3deploy.BucketDeployment(
                self,
                "DeployWebsite",
                sources=[s3deploy.Source.asset(f'../web/web-build/{env}')],  # Change to your static files directory
                destination_bucket=hosting_bucket
            )

        # Outputs
        cdk.CfnOutput(self, "AWSAccountNumber", value=self.account)
        cdk.CfnOutput(self, "AWSRegion", value=self.region)
        
        cdk.CfnOutput(self, "WebDomain", value=web_domain_name)
        cdk.CfnOutput(self, "WebBucketName", value=hosting_bucket.bucket_name)
        cdk.CfnOutput(self, "WebDistributionId", value=distribution.distribution_id)
        cdk.CfnOutput(self, "WebDistributionDomainName", value=distribution.distribution_domain_name)
        cdk.CfnOutput(self, "HostedZoneId", value=hosted_zone.hosted_zone_id)
        cdk.CfnOutput(self, "HostedZoneName", value=hosted_zone.zone_name)

        cdk.CfnOutput(self, "CacheTableName", value=cache_table.table_name, description="The name of the Program Rig Cache DynamoDB table")

        cdk.CfnOutput(self, f"{app_name_prefix}AssetsDataBucketName", value=program_rig_assets_data_bucket.bucket_name, description="The name of the S3 bucket for storing Program Rig assets data")

