# Infrastructure Overview

## Purpose

`infra/` contains the AWS CDK app that provisions hosting, DNS, certificates,
and the DynamoDB cache used by the application.

## Main Entry Points

- `app.py` creates the CDK app and instantiates `InfraStack`.
- `infra_stack.py` defines the AWS resources.
- `deployment_env.py` merges `config-base.json` with `config-dev.json` or
  `config-prod.json`.

## Provisioned Resources

Current stack resources include:

- DynamoDB cache table with partition key `key` and TTL attribute `ttl`
- S3 assets bucket with lifecycle transition to infrequent access after `60`
  days and expiration after `5` years
- S3 hosting bucket for the static frontend
- CloudFront distribution with:
  - TLS 1.2 minimum
  - S3 origin access control
  - viewer-request URL rewrite function
  - SPA-style `403` and `404` fallback to `/index.html`
- Route 53 alias record to the CloudFront distribution
- ACM certificate reference loaded from config
- optional `BucketDeployment` from `../web/web-build/<env>`

## Resource Behavior By Environment

- `prod` retains buckets and the DynamoDB table on stack deletion
- non-`prod` environments destroy those resources and may auto-delete bucket
  objects

## Notes For Agents

- The stack currently assumes AWS region `ap-southeast-1` in the helper
  scripts.
- Domain names, certificate ARNs, and hosted zone IDs come from the JSON
  config files rather than being discovered dynamically.
