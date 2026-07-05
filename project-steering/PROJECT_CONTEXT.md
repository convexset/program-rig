# Program Rig Project Context

This document is the primary orientation entry point for developers and AI
agents working in this repository. Read it together with
`project-steering/GUARDRAILS.md` before making changes.

The `project-steering/` directory is the repository-local bridge to the shared
steering layer under `/.project-shared/`. Repository-specific context for this
codebase lives here and in the code-adjacent documentation under `web/docs/`,
`api/docs/`, and `infra/docs/`.

## Purpose

Program Rig is a workout-program delivery system with three main layers:

- a static Next.js frontend that parses and runs workout programs in the
  browser;
- a Chalice API that stores and clears synchronized workout state in DynamoDB;
  and
- an AWS CDK stack that provisions the hosting, API backing store, and related
  AWS infrastructure.

The source code is authoritative. Repository documentation provides
orientation, observations, and workflow guidance, but it may lag behind the
implementation. Verify material claims against the referenced source before
changing behavior.

## Fast Bootstrap

For a fresh agent session, use this startup order:

1. Read `project-steering/GUARDRAILS.md`.
2. Read this file.
3. Identify the subsystem you are changing:
   - frontend: `web/`
   - API: `api/`
   - infrastructure: `infra/`
4. Open the matching package README and docs index:
   - `web/README.md` and `web/docs/README.md`
   - `api/README.md` and `api/docs/README.md`
   - `infra/README.md` and `infra/docs/README.md`
5. Open the primary source entry points listed in the relevant application-area
   section below.

If the task spans multiple layers, read all three docs indexes before making
changes.

## Canonical Documentation Locations

Documentation is no longer centralized in a separate project-doc tree. The
canonical docs now live next to the code they describe:

- `web/docs/` - frontend behavior, runtime, and examples
- `api/docs/` - API purpose, endpoints, and operations notes
- `infra/docs/` - infrastructure overview, environments, and deployment flow
- `project-intelligence/work/` - active work-stream records
- `project-intelligence/work-archive/` - archived work products and older
  prompt history

For example assets used by the frontend docs, use:

- `web/docs/examples/program001-input.md`
- `web/docs/examples/program001-parsed.json`

## Current Sources of Truth

Use the following precedence when gathering context:

1. Executable source code, configuration, and tests.
2. [`project-steering/GUARDRAILS.md`](./GUARDRAILS.md).
3. Local README and `.md` documents near the feature being changed.
4. Git history when available for the relevant subproject.

When documentation is missing or stale, prefer verified behavior from code.

Portable process documents and shared steering tools should be treated as
canonical under [`../.project-shared/`](../.project-shared/). The local
`project-steering/` directory is only a bridge for repository-local
orientation and configuration:

- repository-local orientation:
  [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)
- repository-local steering configuration:
  [`config/context-config.json`](./config/context-config.json)

Most other files in `project-steering/` are symbolic links into
[`../.project-shared/`](../.project-shared/). During bootstrap, agents should
resolve and read those linked targets rather than treating the local bridge
paths as missing or repository-local duplicates. References in this document
or in linked bootstrap material may intentionally point at those local bridge
paths even when the underlying files live in the shared layer, and some of
those referenced documents may themselves be symbolic links. Agents should
follow those links and inspect the resolved target before concluding that a
referenced document is absent, duplicated, or repository-local. In particular,
`project-steering/GUARDRAILS.md` and `project-steering/BOOTSTRAP.md` are
expected to exist through that symlink bridge.

When Telegram notification configuration is available, agents should send a
bootstrap Telegram message after loading the required steering and tooling
context. Treat that message as a lightweight operational signal that bootstrap
completed successfully and that the shared tool-loading path is working in the
current repository. Prefer the canonical shared helper path
[`../.project-shared/tools/send_telegram_message.py`](../.project-shared/tools/send_telegram_message.py)
for that notification.


## Required AI-Agent Guidance

Use `project-steering/BOOTSTRAP.md` for the lightweight shared bootstrap
sequence. This repository does not currently define an additional
repository-local AI workflow guide beyond this project context and the shared
steering layer.

If you need shared onboarding text for another agent, use
`project-steering/AGENT_ONBOARDING_PROMPT.md`.

Telegram notification workflow is not configured or documented in this
repository. Do not assume it is part of the expected local workflow.

When bootstrapping a new agent, optimize for the shortest path to the owning
code and owning docs rather than reading every markdown file in the
repository.

## Application Areas

### Web Frontend: `web/`

Static Next.js application that renders and runs workout programs in the
browser. This is the primary user-facing surface.

Docs:

- `web/README.md`
- `web/docs/README.md`
- `web/docs/overview.md`
- `web/docs/runtime-and-state.md`
- `web/docs/program-format.md`

Start with:

- `web/app/page.tsx` - home route entry point
- `web/components/features/ProgramExecutor.tsx` - main runtime orchestration
- `web/components/features/ProgramParser.tsx` - program input and parse flow
- `web/lib/parsers/program-parser.ts` - parsing rules for the workout format
- `web/lib/validators/program-validator.ts` - validation logic
- `web/types/program.ts` - canonical frontend program data types
- `web/config/app-config.ts` - app-level runtime configuration

Notes:

- The frontend runs on Next.js App Router and is built as a static export.
- `npm run dev` serves locally on port `3030`.
- Build output is written under `web/web-build/<env>/` and consumed by the
  infrastructure deployment.
- There are currently no dedicated frontend test files in the repository.
- Example program artifacts live under `web/docs/examples/`.

### API Service: `api/`

AWS Chalice application that exposes workout-state endpoints backed by
DynamoDB. The API is authoritative for persisted synchronized workout state.

Docs:

- `api/README.md`
- `api/docs/README.md`
- `api/docs/overview.md`
- `api/docs/endpoints.md`
- `api/docs/operations.md`

Start with:

- `api/app.py` - all current API routes and validation logic
- `api/requirements.txt` - runtime dependencies

Notes:

- Current routes are `/`, `GET /workout-state/{workout_code}`, and
  `POST /workout-state/{workout_code}/{api_key}`.
- The API expects `CACHE_TABLE_NAME` in the runtime environment.
- Workout-state records are stored in DynamoDB with a 14-day TTL.
- There are no API test files checked into this repository today.
- Most current API behavior lives directly in `api/app.py`, so source review is
  usually faster than broad document reading.

### Infrastructure: `infra/`

AWS CDK application that provisions the web hosting and persistence layer. This
area is authoritative for deployment-time AWS resources and environment
configuration.

Docs:

- `infra/README.md`
- `infra/docs/README.md`
- `infra/docs/overview.md`
- `infra/docs/environments.md`
- `infra/docs/deployment.md`

Start with:

- `infra/app.py` - CDK app entry point
- `infra/infra_stack.py` - main stack definition
- `infra/deployment_env.py` - environment selection and config merge logic
- `infra/config-base.json` - shared configuration defaults
- `infra/config-dev.json` - development overrides
- `infra/config-prod.json` - production overrides
- `infra/tests/unit/test_infra_stack.py` - current automated test coverage

Notes:

- `CDK_ENV` selects `dev` or `prod`; `DO_S3_DEPLOY` can override the config
  flag for static asset deployment.
- The stack provisions the S3 hosting bucket, CloudFront distribution, Route
  53 alias, ACM certificate reference, DynamoDB cache table, and an assets
  bucket.
- `infra/outputs-dev.json` and `infra/outputs-prod.json` are generated
  deployment artifacts and should not be treated as the primary source of
  behavior.

## Recommended Reading By Task Type

- UI behavior, program parsing, timers, or workout controls:
  read `web/docs/README.md` first, then open `ProgramExecutor.tsx`,
  `ProgramParser.tsx`, and `ProgramScreen.tsx`.
- Workout-state API changes:
  read `api/docs/README.md` first, then open `api/app.py`, and finally confirm
  any DynamoDB assumptions in `infra/infra_stack.py`.
- Deployment, domain, bucket, or CDN changes:
  read `infra/docs/README.md` first, then open `infra/infra_stack.py` and
  `infra/deployment_env.py`.
- Cross-layer changes:
  read all three package docs indexes and then verify the integration points in
  source.

## Cross-Layer Integration

The dependency direction is:

1. `web/` defines the client behavior and browser-side state flow.
2. `api/` exposes the persisted workout-state contract consumed by the web
   client.
3. `infra/` provisions the AWS resources required by the web deployment and
   API backing store.

Concrete integration points:

- `web/` is deployed as static assets to the hosting bucket provisioned by
  `infra/infra_stack.py`.
- `infra/infra_stack.py` optionally deploys `../web/web-build/<env>` into S3
  through `aws_s3_deployment.BucketDeployment`.
- `api/app.py` reads and writes workout-state data in the DynamoDB cache table
  provisioned by `infra/infra_stack.py`.
- Environment-specific deployment behavior is driven by
  `infra/config-base.json`, `infra/config-dev.json`, and
  `infra/config-prod.json`, merged by `infra/deployment_env.py`.

When changing behavior across layers, verify all affected roots directly in
source. A change to the workout-state contract can require coordinated updates
to the frontend request flow, API validation, and infrastructure environment
configuration.

## Documentation Map

Canonical technical documentation now lives next to the code it describes.

Start with:

- `project-steering/` - local bridge to the shared steering layer
- `project-steering/PROJECT_CONTEXT.md` - repository orientation
- `project-steering/BOOTSTRAP.md` - minimal shared startup sequence
- `web/docs/README.md` - frontend documentation index
- `api/docs/README.md` - API documentation index
- `infra/docs/README.md` - infrastructure documentation index
- `web/README.md`, `api/README.md`, `infra/README.md` - local package entry
  points
- `web/docs/examples/README.md` - sample workout artifact index
- `project-intelligence/work/` - active work-stream records
- `project-intelligence/work-archive/` - archived work summaries
- `project-intelligence/work-archive/copilot-prompts/README.md` - archived
  prompt-history note for older Copilot artifacts
- `/.project-shared/` - shared steering, tooling, and process layer

When using these documents:

1. Start with the package README or docs index nearest the code you are
   changing.
2. Follow links into the implementation roots in `web/`, `api/`, or `infra/`.
3. Confirm behavior and interfaces against current source and tests.
4. Update affected docs when code changes invalidate them.
5. Treat archived prompt artifacts as historical only, not as current
   requirements.

## Work Documentation Process

This repository now uses the shared work-documentation structure:

- active work: `project-intelligence/work/`
- archive: `project-intelligence/work-archive/`

Use `project-steering/WORK_DOCUMENTATION.md` as the process baseline for when
to create, update, and archive those records.

## Documentation Update Process

Documentation maintenance is part of implementation work when code changes
invalidate existing docs.

In this repository, documentation updates are usually needed when work affects:

- workout program parsing or execution behavior in `web/`;
- the workout-state API contract in `api/app.py`;
- deployment configuration, AWS resources, or environment assumptions in
  `infra/`; or
- developer setup and deployment workflow described under `web/docs/`,
  `api/docs/`, `infra/docs/`, and the package READMEs.

When updating docs:

1. Inspect the current diff or worktree status first.
2. Classify changed files by application area (`web/`, `api/`, `infra/`).
3. Read the owning source files before editing the matching package docs.
4. Update the relevant repository-local docs.
5. If shared steering tools are later added to this repository, run the
   applicable validation tooling at that time.

## Tooling Map

There are no repository-local steering tools or `project-steering/config/`
artifacts checked in today.

Useful repository tooling currently lives in the application roots:

- `web/package.json` scripts - frontend dev, build, deploy, and lint commands
- `web/set-env.sh` and `web/sync-web-content.py` - frontend environment and
  static-build sync helpers
- `infra/deploy.sh`, `infra/diff.sh`, `infra/synth.sh`, `infra/destroy.sh` -
  infrastructure workflow scripts
- `api/deploy.sh` - API deployment helper

Useful shared references remain under `/.project-shared/`, especially:

- `/.project-shared/TOOLING_AND_PROCESS_INVENTORY.md`
- `/.project-shared/tools/README.md`
- `/.project-shared/development-practices/README.md`

If this repository later adopts shared validation or diff-first context tools,
document the expected default usage here.
