# Stack Configuration

## Configuration Files

### config-dev.json
Development environment configuration.

### config-prod.json
Production environment configuration.

## Configuration Loading

### deployment_env.py
This module loads environment-specific configuration from the JSON files and makes it available to the CDK stack.

### config.py
Utility functions for configuration management.

## Environment Variables

The deployment scripts use environment variables to determine which configuration to load. The environment is typically passed as a command-line argument to the deployment scripts.

## Stack Parameters

The stack uses the following parameters:

### From Configuration Files
- **Web Domain Name**: Custom domain for the application
- **Web Certificate Arn**: ACM certificate for HTTPS
- **Web Hosted Zone Id**: Route 53 hosted zone for DNS

### From Environment
- **CDK_ENV**: Environment name (dev/prod), defaults to 'dev'
- **CDK_DEFAULT_ACCOUNT**: AWS account ID (from AWS CLI/credentials)
- **CDK_DEFAULT_REGION**: AWS region (from AWS CLI/credentials)
- **DO_S3_DEPLOY**: Whether to deploy web build to S3 (true/false)

### Resource Naming Pattern

Resources follow these naming patterns:
- Stack: `{APP_NAME}-Stack-{env}` (e.g., `ProgramRig-Stack-dev`)
- Resources: `{APP_RESOURCE_NAME_PREFIX}-{resource}-{env}` (e.g., `program-rig-cache-dev`)
- CloudFormation logical IDs: `{APP_NAME}{ResourceType}` (e.g., `ProgramRigCacheTable`)

## Configuration Structure

Based on the actual implementation, each environment configuration has the following structure:

```json
{
  "Web Domain Name": "domain.example.com",
  "Web Certificate Arn": "arn:aws:acm:region:account:certificate/cert-id",
  "Web Hosted Zone Id": "Z..."
}
```

### Configuration Parameters

#### Web Domain Name
- **Type**: String
- **Purpose**: Custom domain for CloudFront distribution
- **Example**: `pr-dev.helpfulowl.com` (dev), `pr.helpfulowl.com` (prod)

#### Web Certificate Arn
- **Type**: String (ARN)
- **Purpose**: ACM certificate ARN for HTTPS
- **Region**: Must be in us-east-1 for CloudFront
- **Example**: `arn:aws:acm:us-east-1:123456789012:certificate/...`

#### Web Hosted Zone Id
- **Type**: String
- **Purpose**: Route 53 hosted zone ID for DNS record creation
- **Example**: `Z04049911V0UU69C4IWGR`

### Configuration Constants (config.py)

```python
APP_NAME = 'ProgramRig'
APP_RESOURCE_NAME_PREFIX = 'program-rig'
DO_S3_DEPLOY = os.getenv('DO_S3_DEPLOY', 'false').lower() in ('true', '1', 't')
```

- **APP_NAME**: Used for resource naming (PascalCase)
- **APP_RESOURCE_NAME_PREFIX**: Used for resource naming (kebab-case)
- **DO_S3_DEPLOY**: Controls whether to deploy web build to S3 during CDK deployment

## Best Practices

1. Never commit sensitive credentials to configuration files
2. Use AWS Secrets Manager or Parameter Store for secrets
3. Keep environment configurations consistent in structure
4. Document all configuration parameters
5. Use descriptive naming conventions that include environment prefix
6. Validate configuration before deployment
