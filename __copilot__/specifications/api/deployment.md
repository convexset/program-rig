# API Deployment Guide

## Prerequisites

- Python 3.9+ installed
- AWS CLI configured with credentials
- AWS Chalice installed (`pip install chalice`)
- Appropriate AWS IAM permissions

## Initial Setup

### 1. Create Chalice Project

```bash
# From repository root
cd /Users/jeremychen/repositories/program-rig

# Create new Chalice project
chalice new-project api

# Navigate to api directory
cd api
```

### 2. Project Structure

After creation, you'll have:

```
api/
├── .chalice/
│   └── config.json
├── app.py
└── requirements.txt
```

### 3. Configure Requirements

Edit `requirements.txt` to include dependencies:

```
chalice>=1.29.0
boto3
```

## Configuration

### .chalice/config.json

Configure multiple stages (dev/prod):

```json
{
  "version": "2.0",
  "app_name": "api",
  "stages": {
    "dev": {
      "api_gateway_stage": "dev",
      "autogen_policy": true,
      "environment_variables": {
        "ENVIRONMENT": "dev",
        "DEBUG": "true"
      }
    },
    "prod": {
      "api_gateway_stage": "prod",
      "autogen_policy": true,
      "environment_variables": {
        "ENVIRONMENT": "prod",
        "DEBUG": "false"
      }
    }
  }
}
```

### Advanced Configuration Options

```json
{
  "version": "2.0",
  "app_name": "api",
  "stages": {
    "prod": {
      "api_gateway_stage": "prod",
      "autogen_policy": false,
      "iam_policy_file": "policy-prod.json",
      "environment_variables": {
        "TABLE_NAME": "prod-table"
      },
      "lambda_timeout": 60,
      "lambda_memory_size": 256,
      "reserved_concurrency": 10,
      "subnet_ids": ["subnet-xxx", "subnet-yyy"],
      "security_group_ids": ["sg-xxx"]
    }
  }
}
```

## Local Development

### Start Local Server

```bash
# From api directory
chalice local --port 8000
```

This starts a local development server at `http://localhost:8000`.

### Test Locally

```bash
# In another terminal
curl http://localhost:8000/health
```

### Live Reloading

Chalice automatically reloads when you change files (similar to Flask).

## Deployment

### Deploy to Dev

```bash
# From api directory
chalice deploy --stage dev
```

Output will include:
```
Creating deployment package.
Creating IAM role: api-dev
Creating lambda function: api-dev
Creating Rest API
Resources deployed:
  - Lambda ARN: arn:aws:lambda:us-east-1:xxx:function:api-dev
  - Rest API URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/
```

### Deploy to Prod

```bash
chalice deploy --stage prod
```

### Get API URL

```bash
# After deployment
chalice url --stage dev
# Output: https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/

chalice url --stage prod
# Output: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

### Save API URL for Web App

After deployment, update the NextJS environment variables:

```bash
# .env.production in web directory
NEXT_PUBLIC_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

## Deployment Package

### What Gets Deployed

Chalice packages:
- `app.py`
- `chalicelib/` directory (entire package)
- Dependencies from `requirements.txt`
- `.chalice/config.json` settings

### What Doesn't Get Deployed

- `tests/` directory
- `requirements-dev.txt` dependencies
- Any files in `.chaliceignore`

### .chaliceignore

Create `.chaliceignore` to exclude files:

```
tests/
*.pyc
__pycache__/
.git/
.env
*.md
```

## Managing Deployments

### View Deployed Resources

```bash
chalice deploy --stage dev
```

Output shows:
- Lambda function name
- API Gateway URL
- IAM role created
- CloudWatch log group

### View Logs

```bash
# Tail logs in real-time
chalice logs --stage dev --name api-dev

# View recent logs
chalice logs --stage dev --name api-dev --max-entries 100
```

### Delete Deployment

```bash
# WARNING: This deletes all resources
chalice delete --stage dev
```

## IAM Permissions

### Auto-Generated Policy

Chalice automatically generates IAM policies based on AWS SDK calls in your code:

```python
# This code:
import boto3
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('my-table')

# Generates policy:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/my-table"
    }
  ]
}
```

### Custom IAM Policy

Create `.chalice/policy-<stage>.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

Update config:

```json
{
  "stages": {
    "prod": {
      "autogen_policy": false,
      "iam_policy_file": "policy-prod.json"
    }
  }
}
```

## Environment-Specific Deployment

### Development Workflow

```bash
# 1. Develop locally
chalice local

# 2. Test locally
curl http://localhost:8000/endpoint

# 3. Deploy to dev
chalice deploy --stage dev

# 4. Test dev deployment
curl https://xxx.execute-api.xxx.amazonaws.com/dev/endpoint

# 5. When ready, deploy to prod
chalice deploy --stage prod
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy API

on:
  push:
    branches:
      - main
    paths:
      - 'api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          cd api
          pip install chalice
          pip install -r requirements.txt
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to Dev
        run: |
          cd api
          chalice deploy --stage dev
      
      - name: Deploy to Prod
        if: github.ref == 'refs/heads/main'
        run: |
          cd api
          chalice deploy --stage prod
```

## Monitoring and Debugging

### CloudWatch Logs

```bash
# View logs
chalice logs --stage dev

# Follow logs
chalice logs --stage dev --follow
```

### CloudWatch Metrics

Available metrics:
- Invocation count
- Duration
- Error count
- Throttle count

### Enable X-Ray Tracing

In `.chalice/config.json`:

```json
{
  "stages": {
    "prod": {
      "api_gateway_stage": "prod",
      "lambda_tracing": "Active"
    }
  }
}
```

## Troubleshooting

### Common Issues

**1. Import Errors**

Ensure dependencies are in `requirements.txt` and code is in `chalicelib/`.

**2. Permission Denied**

Check IAM role has necessary permissions. Review generated policy or create custom policy.

**3. Timeout**

Increase Lambda timeout in config:

```json
{
  "lambda_timeout": 300
}
```

**4. Memory Issues**

Increase Lambda memory:

```json
{
  "lambda_memory_size": 512
}
```

**5. API Gateway Errors**

Check CloudWatch logs for detailed error messages.

### Debug Mode

```python
# app.py
app = Chalice(app_name='api')
app.debug = True  # Enable debug mode (dev only!)
```

## Rollback

### Using AWS Console

1. Go to CloudFormation console
2. Find stack: `<app-name>-<stage>`
3. Select "Rollback"

### Redeployment

Deploy previous version:

```bash
# Checkout previous commit
git checkout <previous-commit>

# Redeploy
cd api
chalice deploy --stage prod
```

## Best Practices

1. **Test Locally First**: Always test with `chalice local` before deploying
2. **Use Stages**: Separate dev/prod stages
3. **Environment Variables**: Use for configuration, never hardcode
4. **IAM Permissions**: Follow least privilege principle
5. **Logging**: Add comprehensive logging for debugging
6. **Monitoring**: Set up CloudWatch alarms
7. **Dependencies**: Keep `requirements.txt` up to date
8. **Version Control**: Commit `.chalice/config.json`, not `deployed/`
9. **Documentation**: Document all endpoints and configuration
10. **Testing**: Write unit tests before deployment

## Cost Optimization

- Use appropriate Lambda memory (lower = cheaper)
- Optimize cold start time (smaller package)
- Use CloudWatch Logs retention policy
- Consider Lambda provisioned concurrency for frequently-used endpoints
- Monitor unused resources and delete old deployments
