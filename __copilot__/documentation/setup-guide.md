# Setup Guide

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd program-rig
```

### 2. Infrastructure Setup

```bash
cd infra

# Create Python virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
```

### 3. Web Application Setup

#### Option A: If web folder already exists

```bash
cd web
npm install
```

#### Option B: Bootstrap new NextJS application

```bash
# From repository root
cd /Users/jeremychen/repositories/program-rig

# Create NextJS app with TypeScript, Tailwind CSS, App Router
npx create-next-app@latest web --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Navigate to web folder
cd web

# Install additional dependencies for API calls
npm install axios
```

**Configure next.config.js:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for S3
  distDir: process.env.NODE_ENV === 'production' ? '../web-build/prod' : '../web-build/dev',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig
```

**Update package.json scripts:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:dev": "NODE_ENV=development next build",
    "build:prod": "NODE_ENV=production next build"
  }
}
```

### 4. API Setup

#### Option A: If api folder already exists

```bash
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Option B: Bootstrap new AWS Chalice API

```bash
# From repository root
cd /Users/jeremychen/repositories/program-rig

# Install Chalice
pip install chalice

# Create new Chalice project
chalice new-project api

# Navigate to api folder
cd api

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Chalice in the virtual environment
pip install chalice

# Create requirements.txt
echo "chalice" > requirements.txt
```

**Basic Chalice app.py structure:**

```python
from chalice import Chalice

app = Chalice(app_name='api')

@app.route('/')
def index():
    return {'hello': 'world'}

@app.route('/health')
def health():
    return {'status': 'healthy'}
```

## AWS Configuration

### 1. Install AWS CLI

```bash
# macOS
brew install awscli

# Or download from AWS
```

### 2. Configure Credentials

```bash
aws configure
```

Provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region
- Default output format (json)

### 3. Verify Access

```bash
aws sts get-caller-identity
```

### 4. CDK Bootstrap (first time only)

```bash
cd infra
cdk bootstrap aws://ACCOUNT-ID/REGION
```

## Development Environment

### Python Virtual Environment (Recommended)

```bash
# Create
python3 -m venv pr-venv

# Activate
source pr-venv/bin/activate  # macOS/Linux

# Deactivate when done
deactivate
```

### Environment Configuration

1. Copy example configs (if they exist):
   ```bash
   cp config-dev.json.example config-dev.json
   cp config-prod.json.example config-prod.json
   ```

2. Edit configuration files with your settings

## Verification

### Test Infrastructure Synthesis

```bash
cd infra
./synth.sh
```

Should complete without errors.

### Test Web Build

```bash
cd web
npm run build
```

Check that output appears in `../web-build/dev/` or `../web-build/prod/`

## Common Issues

### CDK Not Found
```bash
npm install -g aws-cdk
```

### Python Dependencies
Ensure you're using Python 3.7+ and have activated your virtual environment.

### AWS Permissions
Ensure your AWS user has permissions for:
- CloudFormation
- S3
- CloudFront (if used)
- IAM
- Any other services in the stack

## Next Steps

1. Review configuration files in `infra/`
2. Customize for your AWS account and regions
3. Deploy to dev environment: `cd infra && ./deploy.sh dev`
4. Test the deployment
5. When ready, deploy to prod: `./deploy.sh prod`
