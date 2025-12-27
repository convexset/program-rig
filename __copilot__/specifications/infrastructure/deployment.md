# Deployment Guide

## Prerequisites

- AWS CLI configured with appropriate credentials
- Python 3.x installed
- AWS CDK installed (`npm install -g aws-cdk`)
- Python virtual environment (recommended)
- Python dependencies installed (`pip install -r requirements.txt`)

## Deployment Scripts

### synth.sh
Synthesizes the CloudFormation template without deploying.

```bash
./synth.sh
```

This validates your CDK code and generates the CloudFormation template.

### diff.sh
Shows differences between current deployed stack and local changes.

```bash
./diff.sh
```

Use this before deployment to review what will change.

### deploy.sh
Deploys the stack to AWS.

```bash
./deploy.sh <environment>
```

Where `<environment>` is either `dev` or `prod`.

Example:
```bash
./deploy.sh dev
```

### destroy.sh
Destroys the stack (use with caution).

```bash
./destroy.sh <environment>
```

### set-aws-profile.sh
Sets the AWS profile for deployment.

```bash
source ./set-aws-profile.sh <profile-name>
```

## Deployment Process

1. Make changes to `infra_stack.py` or configuration files
2. Run `./synth.sh` to validate syntax
3. Run `./diff.sh` to review changes
4. Run `./deploy.sh <env>` to deploy
5. Verify deployment outputs in `outputs-<env>.json`

## Multi-Environment Deployment

To deploy to both environments:

```bash
./deploy.sh dev && ./deploy.sh prod
```

To deploy with web build sync:

```bash
DO_S3_DEPLOY=TRUE ./deploy.sh dev && DO_S3_DEPLOY=TRUE ./deploy.sh prod
# or
export DO_S3_DEPLOY=TRUE
./deploy.sh dev && ./deploy.sh prod
```

**Note**: The `DO_S3_DEPLOY` environment variable controls whether the web build is synced to S3 during deployment. Set it to `TRUE` to enable automatic deployment of `../web/web-build/{env}` contents.

## Deployment Outputs

After successful deployment, outputs are saved to:
- `outputs-dev.json` (for development)
- `outputs-prod.json` (for production)

These outputs contain:
- **AWSAccountNumber**: AWS account ID
- **AWSRegion**: AWS region
- **WebDomain**: Custom domain name
- **WebBucketName**: S3 hosting bucket name  
- **WebDistributionId**: CloudFront distribution ID
- **WebDistributionDomainName**: CloudFront domain (*.cloudfront.net)
- **HostedZoneId**: Route 53 hosted zone ID
- **HostedZoneName**: Route 53 hosted zone name
- **CacheTableName**: DynamoDB cache table name
- **ProgramRigAssetsDataBucketName**: S3 assets bucket name

These outputs can be consumed by:
- Web application configuration
- API configuration
- CI/CD pipelines
- Operational scripts

## Rollback

If a deployment fails or causes issues:

1. Via CDK:
```bash
cdk rollback <stack-name>
```

2. Via AWS Console:
   - Navigate to CloudFormation
   - Select the stack
   - Choose "Rollback"

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your AWS credentials have sufficient permissions
2. **Stack Already Exists**: Check if you're deploying to the correct environment
3. **Resource Conflicts**: Check for naming conflicts with existing resources
4. **Configuration Errors**: Validate JSON configuration files

### Debug Mode

Run CDK commands with verbose output:
```bash
cdk deploy --verbose
```
