from chalice import Chalice, BadRequestError, UnauthorizedError, NotFoundError
import boto3
import os
import time
from datetime import datetime
from typing import Dict, Any

from chalice import CORSConfig
CORS_ORIGIN = os.environ.get('CORS_ORIGIN', '*')

app = Chalice(app_name='program-rig-api')
app.api.cors = CORSConfig(
    allow_origin=CORS_ORIGIN,
    allow_headers=[],
    max_age=600,
    expose_headers=[],
    allow_credentials=True
)


# Get DynamoDB table name from environment
CACHE_TABLE_NAME = os.environ.get('CACHE_TABLE_NAME')
if not CACHE_TABLE_NAME:
    raise ValueError('CACHE_TABLE_NAME environment variable must be set')

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
cache_table = dynamodb.Table(CACHE_TABLE_NAME)


def validate_iso_datetime(dt_string: str) -> bool:
    """Validate that a string is a valid timezone-aware ISO datetime."""
    try:
        dt = datetime.fromisoformat(dt_string.replace('Z', '+00:00'))
        # Check if timezone-aware
        return dt.tzinfo is not None
    except (ValueError, AttributeError):
        return False


def validate_workout_state_schema(data: Dict[str, Any]) -> bool:
    """Validate that data matches the workout state schema exactly."""
    # Schema should only have startDateTime field
    if set(data.keys()) != {'startDateTime'}:
        return False
    # startDateTime must be a string
    if not isinstance(data['startDateTime'], str):
        return False
    return True


@app.route('/')
def index():
    return {'hello': 'world'}


@app.route('/workout-state/{workout_code}', methods=['GET'])
def get_workout_state(workout_code: str):
    """Get workout state for a given workout code."""
    try:
        response = cache_table.get_item(
            Key={'key': f'workout-state:{workout_code}'}
        )
        
        if 'Item' not in response:
            raise NotFoundError(f'Workout state not found for code: {workout_code}')
        
        item = response['Item']
        return item.get('state')
    
    except NotFoundError:
        raise
    except Exception as e:
        app.log.error(f'Error getting workout state: {str(e)}')
        raise BadRequestError(f'Error retrieving workout state: {str(e)}')


@app.route('/workout-state/{workout_code}/{api_key}', methods=['POST'])
def set_workout_state(workout_code: str, api_key: str):
    """Set workout state for a given workout code. Requires API key authentication."""
    try:
        request_body = app.current_request.json_body
        
        if not api_key:
            raise UnauthorizedError('api_key is required')
        
        # Verify API key
        api_key_response = cache_table.get_item(
            Key={'key': f'api-key:{workout_code}'}
        )
        
        if 'Item' not in api_key_response:
            raise UnauthorizedError('Invalid workout code or API key not configured')
        
        stored_api_key = api_key_response['Item'].get('api_key')
        if not stored_api_key or stored_api_key != api_key:
            raise UnauthorizedError('Invalid API key')
        
        if request_body is None:
            # Write to DynamoDB
            cache_table.delete_item(
                Key={
                    'key': f'workout-state:{workout_code}',
                }
            )

            return {
                'success': True,
                'message': f'Workout state cleared for code: {workout_code}',
            }
        else:
            # Extract workout state data (excluding api_key)
            workout_state = { k: v for k, v in request_body.items() }
            
            # Validate schema
            if not validate_workout_state_schema(workout_state):
                raise BadRequestError(
                    'Invalid workout state schema. Must contain only "startDateTime" field.'
                )
            
            # Validate ISO datetime
            if not validate_iso_datetime(workout_state['startDateTime']):
                raise BadRequestError(
                    'startDateTime must be a valid timezone-aware ISO 8601 datetime string'
                )
            
            # Calculate TTL: 14 days from now (in seconds since epoch)
            ttl = int(time.time()) + (14 * 24 * 60 * 60)
            
            # Write to DynamoDB
            cache_table.put_item(
                Item={
                    'key': f'workout-state:{workout_code}',
                    'state': {
                        'startDateTime': workout_state['startDateTime']
                    },
                    'ttl': ttl
                }
            )
        
            return {
                'success': True,
                'message': f'Workout state updated for code: {workout_code}',
                'startDateTime': workout_state['startDateTime']
            }
    
    except (BadRequestError, UnauthorizedError):
        raise
    except Exception as e:
        app.log.error(f'Error setting workout state: {str(e)}')
        raise BadRequestError(f'Error updating workout state: {str(e)}')
