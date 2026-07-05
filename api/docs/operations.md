# API Operations

## Deployment Helper

`deploy.sh` currently:

- sets `AWS_PROFILE=convexset`;
- activates `../pr-venv/bin/activate`;
- requires `dev` or `prod`;
- exports `API_ENV`;
- sets the AWS account and region (`ap-southeast-1`); and
- runs `chalice deploy --stage $API_ENV`.

## Operational Assumptions

- The API expects its backing DynamoDB table to exist already.
- The infrastructure package currently provisions the cache table.
- The frontend uses environment-specific hostnames from `web/config/app-config.ts`
  rather than reading the API URL from this package directly.

## Documentation Gaps

The repository does not currently include a checked-in local API setup guide
that explains:

- how `CACHE_TABLE_NAME` is wired into Chalice stages;
- whether `.chalice/config.json` is the authoritative config surface for all
  environments; or
- the intended local test command for this package.

Do not invent those details until the team standardizes them in source.
