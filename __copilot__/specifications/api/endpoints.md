# API Endpoints Specification

## Base URL

- **Development**: `https://pr-api-dev.helpfulowl.com`
- **Production**: `https://pr-api.helpfulowl.com`
- **Local**: `http://localhost:8000`

## CORS Configuration

- Configurable via `CORS_ORIGIN` environment variable
- Default: `*` (all origins)
- Allows credentials: `true`
- Max age: 600 seconds

## Authentication

Workout state endpoints use API key authentication:
- API keys stored in DynamoDB with pattern: `api-key:{workout_code}`
- API key provided in URL path for POST requests
- No authentication required for GET requests

## Common Response Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required/failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Implemented Endpoints

### GET /

Basic health check endpoint.

**Response:**
```json
{
  "hello": "world"
}
```

### GET /workout-state/{workout_code}

Get the current workout state (start time) for a specific workout code.

**Path Parameters:**
- `workout_code` (string): Unique identifier for the workout

**Response (200 OK):**
```json
{
  "startDateTime": "2025-12-28T10:00:00+08:00"
}
```

**Error Response (404 Not Found):**
```json
{
  "Code": "NotFoundError",
  "Message": "Workout state not found for code: test"
}
```

**Example:**
```bash
curl https://pr-api.helpfulowl.com/workout-state/test
```

### POST /workout-state/{workout_code}/{api_key}

Set the workout state (start time) for a specific workout code. Requires API key authentication.

**Path Parameters:**
- `workout_code` (string): Unique identifier for the workout
- `api_key` (string): API key for authentication

**Request Body:**
```json
{
  "startDateTime": "2025-12-28T10:00:00+08:00"
}
```

**Validation Rules:**
1. Must contain only `startDateTime` field (no extra fields)
2. `startDateTime` must be a valid timezone-aware ISO 8601 datetime string
3. API key must match stored key for the workout code

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Workout state updated for code: test",
  "startDateTime": "2025-12-28T10:00:00+08:00"
}
```

**Error Responses:**

*400 Bad Request - Invalid Schema:*
```json
{
  "Code": "BadRequestError",
  "Message": "Invalid workout state schema. Must contain only \"startDateTime\" field."
}
```

*400 Bad Request - Invalid DateTime:*
```json
{
  "Code": "BadRequestError",
  "Message": "startDateTime must be a valid timezone-aware ISO 8601 datetime string"
}
```

*401 Unauthorized - Invalid API Key:*
```json
{
  "Code": "UnauthorizedError",
  "Message": "Invalid API key"
}
```

**Example:**
```bash
curl -X POST https://pr-api.helpfulowl.com/workout-state/test/your-api-key \
  -H "Content-Type: application/json" \
  -d '{"startDateTime": "2025-12-28T10:00:00+08:00"}'
```

## DynamoDB Schema

### Cache Table

**Table Name**: Configured via `CACHE_TABLE_NAME` environment variable

**Partition Key**: `key` (String)

**TTL Attribute**: `ttl` (Number, Unix timestamp)

### Record Types

**Workout State Record:**
```json
{
  "key": "workout-state:{workout_code}",
  "state": {
    "startDateTime": "2025-12-28T10:00:00+08:00"
  },
  "ttl": 1735468800
}
```

**API Key Record:**
```json
{
  "key": "api-key:{workout_code}",
  "api_key": "your-secret-key"
}
```

## TTL Policy

- Workout state records expire after **14 days**
- TTL calculated as: `current_time + (14 * 24 * 60 * 60)` seconds
- DynamoDB automatically deletes expired records

## Setup

### Creating API Keys

To create an API key for a workout code, add a record to the DynamoDB cache table:

```python
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('your-cache-table-name')

table.put_item(
    Item={
        'key': 'api-key:test',
        'api_key': 'your-secret-key-here'
    }
)
```

### Testing

**Read workout state:**
```bash
curl https://pr-api.helpfulowl.com/workout-state/test
```

**Write workout state:**
```bash
curl -X POST https://pr-api.helpfulowl.com/workout-state/test/your-api-key \
  -H "Content-Type: application/json" \
  -d '{"startDateTime": "2025-12-28T15:00:00+08:00"}'
```

## Integration with Web Application

The web application (`ProgramExecutor` component) can use these endpoints by:

1. Setting state source to "API"
2. Providing GET URL: `https://pr-api.helpfulowl.com/workout-state/{code}`
3. Enabling state setter
4. Providing POST URL: `https://pr-api.helpfulowl.com/workout-state/{code}/{key}`

The application will:
- Poll GET endpoint every 5-15 seconds for state updates
- POST to endpoint when setting workout start time via controls

### Users

#### GET /users

List all users (with pagination).

**Query Parameters:**
- `limit` (integer, optional): Number of results (default: 10, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

#### GET /users/{user_id}

Get a specific user by ID.

**Path Parameters:**
- `user_id` (string): User ID

**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T00:00:00Z"
}
```

**Error Response (404):**
```json
{
  "Code": "NotFoundError",
  "Message": "User not found"
}
```

#### POST /users

Create a new user.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "id": "user-456",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "created_at": "2025-12-15T10:30:00Z"
}
```

**Error Response (422):**
```json
{
  "Code": "ValidationError",
  "Message": "Email already exists"
}
```

#### PUT /users/{user_id}

Update an existing user.

**Path Parameters:**
- `user_id` (string): User ID

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Response:**
```json
{
  "id": "user-123",
  "name": "John Updated",
  "email": "john.updated@example.com",
  "updated_at": "2025-12-15T10:30:00Z"
}
```

#### DELETE /users/{user_id}

Delete a user.

**Path Parameters:**
- `user_id` (string): User ID

**Response:**
```json
{
  "message": "User deleted successfully",
  "id": "user-123"
}
```

## Implementation Example

### app.py

```python
from chalice import Chalice, Response, NotFoundError, BadRequestError
from chalicelib.services.user_service import UserService
from typing import Dict, Any
import json

app = Chalice(app_name='api')
user_service = UserService()

# CORS configuration
cors_config = {
    'allow_origin': '*',  # Configure appropriately
    'allow_headers': ['Content-Type', 'Authorization'],
    'max_age': 600
}

@app.route('/health', methods=['GET'], cors=True)
def health():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'version': '1.0.0'
    }

@app.route('/users', methods=['GET'], cors=True)
def list_users():
    """List all users with pagination"""
    request = app.current_request
    limit = int(request.query_params.get('limit', '10'))
    offset = int(request.query_params.get('offset', '0'))
    
    if limit > 100:
        raise BadRequestError('Limit cannot exceed 100')
    
    result = user_service.list_users(limit=limit, offset=offset)
    return result

@app.route('/users/{user_id}', methods=['GET'], cors=True)
def get_user(user_id: str):
    """Get a specific user"""
    user = user_service.get_user(user_id)
    
    if not user:
        raise NotFoundError(f'User {user_id} not found')
    
    return user

@app.route('/users', methods=['POST'], cors=True)
def create_user():
    """Create a new user"""
    request = app.current_request
    data = request.json_body
    
    # Validation
    if not data.get('email') or not data.get('name'):
        raise BadRequestError('Email and name are required')
    
    user = user_service.create_user(data)
    
    return Response(
        body=json.dumps(user),
        status_code=201,
        headers={'Content-Type': 'application/json'}
    )

@app.route('/users/{user_id}', methods=['PUT'], cors=True)
def update_user(user_id: str):
    """Update a user"""
    request = app.current_request
    data = request.json_body
    
    user = user_service.update_user(user_id, data)
    
    if not user:
        raise NotFoundError(f'User {user_id} not found')
    
    return user

@app.route('/users/{user_id}', methods=['DELETE'], cors=True)
def delete_user(user_id: str):
    """Delete a user"""
    success = user_service.delete_user(user_id)
    
    if not success:
        raise NotFoundError(f'User {user_id} not found')
    
    return {
        'message': 'User deleted successfully',
        'id': user_id
    }
```

### chalicelib/services/user_service.py

```python
from typing import Dict, List, Optional
import uuid
from datetime import datetime

class UserService:
    """Service for user operations"""
    
    def __init__(self):
        # In real app, this would be a database
        self.users_db = {}
    
    def list_users(self, limit: int = 10, offset: int = 0) -> Dict:
        """List users with pagination"""
        users = list(self.users_db.values())
        total = len(users)
        paginated = users[offset:offset + limit]
        
        return {
            'users': paginated,
            'total': total,
            'limit': limit,
            'offset': offset
        }
    
    def get_user(self, user_id: str) -> Optional[Dict]:
        """Get a user by ID"""
        return self.users_db.get(user_id)
    
    def create_user(self, data: Dict) -> Dict:
        """Create a new user"""
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat() + 'Z'
        
        user = {
            'id': user_id,
            'name': data['name'],
            'email': data['email'],
            'created_at': now,
            'updated_at': now
        }
        
        self.users_db[user_id] = user
        return user
    
    def update_user(self, user_id: str, data: Dict) -> Optional[Dict]:
        """Update a user"""
        user = self.users_db.get(user_id)
        
        if not user:
            return None
        
        user.update({
            'name': data.get('name', user['name']),
            'email': data.get('email', user['email']),
            'updated_at': datetime.utcnow().isoformat() + 'Z'
        })
        
        return user
    
    def delete_user(self, user_id: str) -> bool:
        """Delete a user"""
        if user_id in self.users_db:
            del self.users_db[user_id]
            return True
        return False
```

## Error Response Format

All errors follow Chalice's standard format:

```json
{
  "Code": "ErrorType",
  "Message": "Human-readable error message"
}
```

## Testing Endpoints

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# List users
curl http://localhost:8000/users?limit=5&offset=0

# Get user
curl http://localhost:8000/users/user-123

# Create user
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Update user
curl -X PUT http://localhost:8000/users/user-123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# Delete user
curl -X DELETE http://localhost:8000/users/user-123
```

### Using Postman

Import collection with base URL and endpoints defined above.

### Using Python requests

```python
import requests

BASE_URL = "http://localhost:8000"

# Health check
response = requests.get(f"{BASE_URL}/health")
print(response.json())

# Create user
response = requests.post(
    f"{BASE_URL}/users",
    json={
        "name": "Test User",
        "email": "test@example.com"
    }
)
print(response.json())
```

## Documentation

Consider adding API documentation using:
- **Swagger/OpenAPI**: Generate from route definitions
- **Postman Collection**: Export and share
- **API Blueprint**: Markdown-based documentation

## Versioning Strategy

For future API versions:

```python
# Version in path
@app.route('/v1/users')
def list_users_v1():
    pass

@app.route('/v2/users')
def list_users_v2():
    pass

# Or version in header
@app.route('/users')
def list_users():
    version = app.current_request.headers.get('API-Version', 'v1')
    # Route to appropriate version
```
