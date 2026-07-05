# Documentation Reorganization Workstream

- Status: complete for the first migration pass
- Date: 2026-07-05
- Objective: move canonical project documentation out of `__copilot__/` and
  into code-adjacent locations, while updating repository steering so future
  agents read the new map first
- Affected areas: `web/`, `api/`, `infra/`, `project-steering/`, `__copilot__/`

## Scope

This workstream covers:

- replacing stale template-heavy docs with source-backed docs;
- establishing code-adjacent documentation roots under `web/docs/`,
  `api/docs/`, and `infra/docs/`;
- moving sample artifacts and legacy prompt outputs out of `__copilot__/` and
  then removing that tree entirely; and
- updating agent-oriented repository context to point to the new locations.

## Decisions

- Canonical technical docs now live next to the owning code.
- sample program artifacts live under `web/docs/examples/`.
- historical Copilot prompt artifacts live under
  `project-intelligence/work-archive/copilot-prompts/`.
- `project-steering/PROJECT_CONTEXT.md` is the primary agent orientation file
  and must point at the new doc layout.

## Verification

- Documentation content was checked against current source in `web/`, `api/`,
  and `infra/`.
- Shared repository-reference validation was attempted, but the shared tools
  currently fail in this repository because the expected shared
  `config/context-config.json` is not configured.

## Follow-up Candidates

- Add API local-development and deployment notes once the team settles the
  expected Chalice workflow and required environment setup.
- Add tests or generated indexes for documentation ownership if this repo
  starts using more of the shared steering tooling.
- If the archived prompt history is no longer useful, it can be pruned later
  from `project-intelligence/work-archive/copilot-prompts/`.
