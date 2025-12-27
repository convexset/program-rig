# Infrastructure Overview

## Technology Stack

- **Framework**: AWS CDK (Python)
- **Cloud Provider**: AWS
- **IaC Language**: Python 3.x

## Project Structure

```
infra/
├── app.py                 # CDK app entry point
├── infra_stack.py        # Main stack definition
├── deployment_env.py     # Environment configuration loader
├── config.py             # Configuration utilities
├── config-dev.json       # Development environment config
├── config-prod.json      # Production environment config
├── deploy.sh             # Deployment script
├── diff.sh               # Stack diff script
├── synth.sh              # Synthesize script
├── destroy.sh            # Stack destruction script
├── set-aws-profile.sh    # AWS profile configuration
├── outputs-dev.json      # Development outputs
├── outputs-prod.json     # Production outputs
└── tests/                # Unit tests
```

## Environments

The infrastructure supports two environments:
- **dev**: Development environment
- **prod**: Production environment

Each environment has its own configuration file (`config-dev.json`, `config-prod.json`).

## Key Resources

Based on the actual infrastructure stack, the following resources are provisioned:

### Storage
- **S3 Hosting Bucket**: Static website hosting for NextJS build output
- **S3 Assets Bucket**: Storage for program rig assets with lifecycle policies
  - Transitions to Infrequent Access after 60 days
  - Expires after 5 years

### Content Delivery
- **CloudFront Distribution**: CDN for serving static content
  - Custom domain support
  - HTTPS/TLS 1.2+ enforcement
  - URL rewriting function for clean URLs
  - Error responses for SPA routing (404/403 → index.html)
- **Origin Access Control (OAC)**: Secure S3 access from CloudFront

### DNS & Certificates
- **Route 53 A Record**: DNS alias to CloudFront distribution
- **ACM Certificate**: SSL/TLS certificate (referenced, not created)

### Database
- **DynamoDB Table**: Key-value cache with TTL support
  - Partition key: `key` (STRING)
  - TTL attribute: `ttl`

### Deployment
- **S3 Bucket Deployment**: Optional deployment of web build (controlled by `DO_S3_DEPLOY` env var)
  - Source: `../web/web-build/{env}`
  - Destination: Hosting bucket

## Deployment Outputs

Deployment outputs are stored in JSON files:
- `outputs-dev.json` for development environment
- `outputs-prod.json` for production environment

### Output Values

- **AWSAccountNumber**: AWS account ID
- **AWSRegion**: AWS region
- **WebDomain**: Custom domain name (e.g., pr-dev.helpfulowl.com)
- **WebBucketName**: S3 hosting bucket name
- **WebDistributionId**: CloudFront distribution ID
- **WebDistributionDomainName**: CloudFront domain name (*.cloudfront.net)
- **HostedZoneId**: Route 53 hosted zone ID
- **HostedZoneName**: Route 53 hosted zone name
- **CacheTableName**: DynamoDB cache table name
- **ProgramRigAssetsDataBucketName**: S3 assets bucket name

These contain resource identifiers, URLs, and other deployment artifacts needed by other components.
