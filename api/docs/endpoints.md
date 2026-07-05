# API Endpoints

## Base Behavior

The API configures CORS in `app.py` using `CORS_ORIGIN`, defaulting to `*`,
with `allow_credentials=True`.

## `GET /`

Simple health-style response:

```json
{
  "hello": "world"
}
```

## `GET /workout-state/{workout_code}`

Reads DynamoDB key `workout-state:{workout_code}` and returns the `state`
object.

Success response:

```json
{
  "startDateTime": "2026-01-01T10:00:00+08:00"
}
```

If the record is missing, Chalice returns a `NotFoundError`.

## `POST /workout-state/{workout_code}/{api_key}`

Authenticates by reading DynamoDB key `api-key:{workout_code}` and comparing
its `api_key` value against the path parameter.

### Clear State

If the JSON request body is `null`, the endpoint deletes
`workout-state:{workout_code}` and returns:

```json
{
  "success": true,
  "message": "Workout state cleared for code: <workout_code>"
}
```

### Set State

Valid request body:

```json
{
  "startDateTime": "2026-01-01T10:00:00+08:00"
}
```

Validation rules:

- the body must contain exactly one key: `startDateTime`;
- `startDateTime` must be a string; and
- it must parse as a timezone-aware ISO 8601 datetime.

Success response:

```json
{
  "success": true,
  "message": "Workout state updated for code: <workout_code>",
  "startDateTime": "2026-01-01T10:00:00+08:00"
}
```

## Failure Modes

- `UnauthorizedError` for missing or incorrect API key configuration
- `BadRequestError` for invalid body shape or datetime content
- `NotFoundError` for missing workout-state reads

Unexpected exceptions are logged and then wrapped in `BadRequestError` by the
current implementation.
