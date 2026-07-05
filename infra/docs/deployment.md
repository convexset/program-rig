# Infrastructure Deployment

## Helper Scripts

`set-aws-profile.sh` exports:

```bash
AWS_PROFILE=convexset
```

`deploy.sh`, `diff.sh`, and `synth.sh` all:

- move into the `infra/` directory;
- source `set-aws-profile.sh`;
- require `dev` or `prod`;
- resolve the AWS account with `aws sts get-caller-identity`;
- set `CDK_DEFAULT_REGION=ap-southeast-1`; and
- run the corresponding CDK command.

## Typical Flow

```bash
cd infra
./synth.sh dev
./diff.sh dev
./deploy.sh dev
```

To publish the static frontend as part of the stack deployment:

```bash
DO_S3_DEPLOY=true ./deploy.sh dev
```

Outputs are written to `outputs-dev.json` or `outputs-prod.json`.

## Verification Surface

- `tests/unit/test_infra_stack.py` is the current automated test entry point.
- `outputs-*.json` are generated artifacts, not the source of truth.

## Caution

The scripts use `--require-approval never` for deploys. Review diffs before
deploying changes that affect data retention, DNS, certificates, or bucket
contents.
