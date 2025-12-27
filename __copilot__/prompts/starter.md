# Starter Prompt

The folder `./__copilot__` contains contextual information on the entire application.

 - `./__copilot__/prompts` contains a history of prompts
 - `./__copilot__/prompts` contains project documentation
 - `./__copilot__/specifications/` will contain technical specs


This is a multi-component application consisting of:

1. **Web Application** (`./web`): NextJS front-end application
   - Pure front-end, no backend
   - Builds to `../web-build/dev` or `../web-build/prod`
   - Deployed to S3

2. **API** (`./api`): AWS Chalice serverless API
   - Python-based RESTful API
   - Deployed to AWS Lambda + API Gateway
   - Separate from web application

3. **Infrastructure** (`./infra`): AWS CDK infrastructure
   - Python-based CDK stack
   - Manages S3, CloudFront, and other AWS resources
   - Multi-environment support (dev/prod)

