# API Overview

## Technology Stack

- **Framework**: AWS Chalice
- **Language**: Python 3.9+
- **Deployment**: AWS Lambda + API Gateway
- **Architecture**: Serverless

## What is AWS Chalice?

AWS Chalice is a Python serverless microframework for AWS. It allows you to quickly create and deploy applications that use AWS Lambda and API Gateway.

### Key Benefits

- **Rapid Development**: Decorator-based routing similar to Flask
- **AWS Integration**: Built-in support for Lambda, API Gateway, S3, DynamoDB, etc.
- **Simple Deployment**: Single command deployment (`chalice deploy`)
- **Local Testing**: Built-in local development server
- **IAM Management**: Automatic IAM role generation
- **Type Safety**: Works well with Python type hints

## Project Structure

```
api/
├── .chalice/
│   ├── config.json           # Chalice configuration
│   ├── deployed/             # Deployment artifacts
│   └── policy-dev.json       # IAM policies (generated)
├── app.py                    # Main application entry point
├── chalicelib/               # Application code (imported by app.py)
│   ├── __init__.py
│   ├── models/               # Data models
│   ├── services/             # Business logic
│   ├── utils/                # Utility functions
│   └── db.py                 # Database connection
├── requirements.txt          # Python dependencies
├── requirements-dev.txt      # Development dependencies
└── tests/                    # Unit tests
    └── test_app.py
```

## Basic Application Structure

### app.py (Entry Point)

```python
from chalice import Chalice

app = Chalice(app_name='api')

@app.route('/')
def index():
    return {'hello': 'world'}

@app.route('/health')
def health():
    return {
        'status': 'healthy',
        'version': '1.0.0'
    }
```

## Routing

### HTTP Methods

```python
# GET
@app.route('/items')
def list_items():
    return {'items': []}

# POST
@app.route('/items', methods=['POST'])
def create_item():
    request = app.current_request
    data = request.json_body
    return {'created': data}

# PUT
@app.route('/items/{item_id}', methods=['PUT'])
def update_item(item_id):
    request = app.current_request
    data = request.json_body
    return {'updated': item_id, 'data': data}

# DELETE
@app.route('/items/{item_id}', methods=['DELETE'])
def delete_item(item_id):
    return {'deleted': item_id}
```

### Path Parameters

```python
@app.route('/users/{user_id}')
def get_user(user_id):
    return {'user_id': user_id}

@app.route('/posts/{post_id}/comments/{comment_id}')
def get_comment(post_id, comment_id):
    return {
        'post_id': post_id,
        'comment_id': comment_id
    }
```

### Query Parameters

```python
@app.route('/search')
def search():
    request = app.current_request
    query = request.query_params.get('q', '')
    limit = request.query_params.get('limit', '10')
    
    return {
        'query': query,
        'limit': int(limit)
    }
```

## Request/Response Handling

### Accessing Request Data

```python
@app.route('/example', methods=['POST'])
def example():
    request = app.current_request
    
    # JSON body
    body = request.json_body
    
    # Headers
    content_type = request.headers.get('content-type')
    
    # Query parameters
    params = request.query_params
    
    # Path parameters
    # Available as function arguments
    
    return {'received': body}
```

### Response Types

```python
from chalice import Response

# JSON response (default)
@app.route('/json')
def json_response():
    return {'key': 'value'}

# Custom response
@app.route('/custom')
def custom_response():
    return Response(
        body='Custom body',
        status_code=201,
        headers={'Content-Type': 'text/plain'}
    )

# Binary response
@app.route('/binary')
def binary_response():
    return Response(
        body=b'binary data',
        status_code=200,
        headers={'Content-Type': 'application/octet-stream'}
    )
```

## Error Handling

```python
from chalice import BadRequestError, NotFoundError, ChaliceViewError

@app.route('/users/{user_id}')
def get_user(user_id):
    if not user_id.isdigit():
        raise BadRequestError('Invalid user ID format')
    
    # Fetch user...
    user = fetch_user(user_id)
    
    if not user:
        raise NotFoundError('User not found')
    
    return user

# Custom error
class ValidationError(ChaliceViewError):
    STATUS_CODE = 422

@app.route('/validate', methods=['POST'])
def validate_data():
    data = app.current_request.json_body
    
    if not data.get('email'):
        raise ValidationError('Email is required')
    
    return {'valid': True}
```

## CORS Configuration

```python
from chalice import Chalice, CORSConfig

cors_config = CORSConfig(
    allow_origin='https://yourdomain.com',
    allow_headers=['Content-Type', 'Authorization'],
    max_age=600,
    expose_headers=['X-Custom-Header'],
    allow_credentials=True
)

app = Chalice(app_name='api')

@app.route('/items', methods=['GET'], cors=cors_config)
def get_items():
    return {'items': []}

# Or apply globally in .chalice/config.json
```

## Configuration

### .chalice/config.json

```json
{
  "version": "2.0",
  "app_name": "api",
  "stages": {
    "dev": {
      "api_gateway_stage": "dev",
      "environment_variables": {
        "DB_NAME": "dev_database",
        "DEBUG": "true"
      }
    },
    "prod": {
      "api_gateway_stage": "prod",
      "environment_variables": {
        "DB_NAME": "prod_database",
        "DEBUG": "false"
      }
    }
  }
}
```

## Environment Variables

```python
import os

DB_NAME = os.environ.get('DB_NAME', 'default_db')
DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'

@app.route('/config')
def get_config():
    return {
        'db_name': DB_NAME,
        'debug': DEBUG
    }
```

## Deployment

### Local Development

```bash
# Start local server
chalice local --port 8000

# Access at http://localhost:8000
```

### Deploy to AWS

```bash
# Deploy to dev stage
chalice deploy --stage dev

# Deploy to prod stage
chalice deploy --stage prod
```

### View Deployment Info

```bash
# Get API Gateway URL
chalice url --stage dev

# View logs
chalice logs --stage dev
```

### Undeploy

```bash
chalice delete --stage dev
```

## IAM Permissions

Chalice automatically generates IAM policies based on AWS resources you use in your code. You can also define custom policies in `.chalice/policy-<stage>.json`.

## Integration with Web Application

The NextJS web application calls this API:

```typescript
// In NextJS app (lib/api.ts)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // API Gateway URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getItems = async () => {
  const response = await apiClient.get('/items');
  return response.data;
};
```

## Best Practices

1. **Separate Business Logic**: Keep logic in `chalicelib/`, not `app.py`
2. **Type Hints**: Use Python type hints for better code quality
3. **Error Handling**: Use appropriate HTTP status codes
4. **Environment Variables**: Use for configuration, never hardcode secrets
5. **Testing**: Write unit tests for business logic
6. **Logging**: Use Python logging module
7. **CORS**: Configure appropriately for your frontend
8. **Validation**: Validate all input data
9. **Documentation**: Document all endpoints
10. **Versioning**: Consider API versioning strategy

## Limitations

- **Cold Starts**: Lambda functions have cold start latency
- **Execution Time**: 15-minute maximum execution time
- **Payload Size**: 6 MB request/response limit
- **Stateless**: No persistent state between invocations
- **Region**: Must be deployed in specific AWS region

## Monitoring

- **CloudWatch Logs**: Automatic logging to CloudWatch
- **CloudWatch Metrics**: Lambda and API Gateway metrics
- **X-Ray**: Enable for distributed tracing
- **Alarms**: Set up CloudWatch alarms for errors/latency

## Common Patterns

### Database Connection

```python
# chalicelib/db.py
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('my-table')

def get_item(item_id):
    response = table.get_item(Key={'id': item_id})
    return response.get('Item')
```

### Authentication

```python
from chalice import UnauthorizedError

def get_user_from_token(token):
    # Validate token and return user
    pass

@app.route('/protected', methods=['GET'])
def protected_route():
    request = app.current_request
    token = request.headers.get('Authorization')
    
    if not token:
        raise UnauthorizedError('Missing authentication token')
    
    user = get_user_from_token(token)
    
    if not user:
        raise UnauthorizedError('Invalid token')
    
    return {'user': user}
```

### Background Jobs

```python
# Using Lambda events
@app.on_s3_event(bucket='my-bucket', events=['s3:ObjectCreated:*'])
def handle_s3_event(event):
    # Process S3 upload
    pass

@app.schedule('rate(1 hour)')
def periodic_task(event):
    # Run every hour
    pass
```
