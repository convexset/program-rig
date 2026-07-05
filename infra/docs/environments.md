# Infrastructure Environments

## Environment Selection

`deployment_env.py` reads `CDK_ENV` and defaults to `dev`.

It loads:

1. `config-base.json`
2. `config-<env>.json`

Then it optionally overrides `Do S3 Deploy` with the `DO_S3_DEPLOY`
environment variable.

## Supported Environments

### `dev`

- selected with `CDK_ENV=dev`
- non-production removal policies use `DESTROY`
- the optional web deployment source is `../web/web-build/dev`

### `prod`

- selected with `CDK_ENV=prod`
- production removal policies use `RETAIN`
- the optional web deployment source is `../web/web-build/prod`

## Important Config Keys

The stack reads these keys from the merged config:

- `App Name`
- `App Name Prefix`
- `App Resource Name Prefix`
- `Do S3 Deploy`
- `Web Domain Name`
- `Web Certificate Arn`
- `Web Hosted Zone Id`

Those values drive naming, certificate lookup, Route 53 configuration, and
whether the web build is deployed during `cdk deploy`.
