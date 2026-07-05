# Starter Prompt

The folder `./__copilot__` contains helper assets, not the canonical
documentation set.

- `./__copilot__/prompts` contains historical prompt fragments
- `./__copilot__/sample-programs` contains example workout inputs and outputs
- canonical technical docs live in:
  - `./web/docs`
  - `./api/docs`
  - `./infra/docs`
  - `./project-steering/PROJECT_CONTEXT.md`


This is a multi-component application consisting of:

1. **Web Application** (`./web`): NextJS front-end application
   - Pure front-end, no backend
   - Builds to `./web/web-build/dev` or `./web/web-build/prod`
   - Deployed to S3

2. **API** (`./api`): AWS Chalice serverless API
   - Python-based RESTful API
   - Deployed to AWS Lambda + API Gateway
   - Separate from web application

3. **Infrastructure** (`./infra`): AWS CDK infrastructure
   - Python-based CDK stack
   - Manages S3, CloudFront, and other AWS resources
   - Multi-environment support (dev/prod)
