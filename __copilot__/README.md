# Copilot Documentation

This folder contains documentation, specifications, and prompts to help GitHub Copilot understand the project structure and requirements.

## Structure

- **prompts/**: Starter prompts for different components
- **specifications/**: Detailed technical specifications
  - **api/**: API endpoint documentation
  - **infrastructure/**: AWS CDK infrastructure specs
  - **web/**: Web application specifications
- **documentation/**: General project documentation
- **sample-programs/**: Example workout programs

## Recent Updates (December 2025)

### Sound System
- Added Web Audio API integration for audio feedback during workouts
- Tick sounds (800Hz, 50ms) for each second during countdown/workout
- Beep sounds (1200Hz, 250ms) for major events (start, group changes, cyclic text transitions, completion)
- Sound injection pattern to separate preview mode (silent) from live mode (with sounds)

### API Endpoints
- Implemented workout state management endpoints
- GET `/workout-state/{workout_code}` - Retrieve workout start time
- POST `/workout-state/{workout_code}/{api_key}` - Set workout start time with authentication
- DynamoDB integration with 14-day TTL for automatic cleanup
- CORS support configurable via environment variable

### Polling Improvements
- Fixed rapid polling issue with `lastPollTimeRef` enforcement
- LocalStorage: 1 second poll interval for near real-time updates
- API: 5 seconds (waiting) / 15 seconds (running) intervals
- Removed `programState` from dependency array to prevent re-initialization

### UI Enhancements
- Added Rewind (10s) and Fast-Forward (10s) buttons for workout control
- Sample workout loading buttons in ProgramParser
- Improved preview with auto-advance and time slider
- Confirm button positioned above preview section

### Infrastructure
- Deployed to production with custom domains
- Development: `pr-api-dev.helpfulowl.com`
- Production: `pr-api.helpfulowl.com`
- Web: Deployed via CloudFront with S3 static hosting

## Usage

Reference these files in your Copilot chat using `@workspace` to get context-aware assistance.
