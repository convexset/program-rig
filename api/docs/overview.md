# API Overview

## Purpose

`api/` provides the shared workout-state service used by the frontend when the
state source is set to `api`.

## Runtime Shape

- Framework: AWS Chalice
- Main file: `app.py`
- Deployment target: AWS Lambda and API Gateway
- Storage dependency: DynamoDB table referenced by `CACHE_TABLE_NAME`

## Current Responsibilities

- return the persisted workout state for a workout code;
- validate and persist a new workout state;
- clear the state when the POST body is `null`; and
- validate API keys stored in the same DynamoDB table.

## Data Model

Workout state records:

```json
{
  "key": "workout-state:<workout_code>",
  "state": {
    "startDateTime": "2026-01-01T10:00:00+08:00"
  },
  "ttl": 1735468800
}
```

API key records:

```json
{
  "key": "api-key:<workout_code>",
  "api_key": "secret"
}
```

Workout-state writes use a `14` day TTL.

## Notes For Agents

- `requirements.txt` is currently empty in the repo, so do not infer a fully
  documented local Python workflow from package metadata alone.
- The API module raises at import time if `CACHE_TABLE_NAME` is unset.
- Current docs should stay close to `app.py` because almost all behavior lives
  in that single file.
