# Architecture Overview

## System Components

### 1. Web Application (./web)
- **Technology**: NextJS
- **Type**: Static front-end application (no backend within app)
- **Build Output**: 
  - Development: `../web-build/dev/`
  - Production: `../web-build/prod/`
- **Hosting**: AWS S3 + CloudFront
- **API Calls**: Makes calls to external API service (not bundled with app)

### 2. API (./api)
- **Technology**: Python + AWS Chalice
- **Type**: RESTful API service (serverless)
- **Hosting**: AWS Lambda + API Gateway
- **Purpose**: Backend logic, data processing, external integrations
- **Deployment**: Managed by Chalice CLI

### 3. Infrastructure (./infra)
- **Technology**: AWS CDK (Python)
- **Purpose**: Provision and manage all AWS resources
- **Environments**: dev, prod
- **Version Control**: Infrastructure as Code

## High-Level Architecture

```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ↓
┌─────────────────────────┐
│  CloudFront (CDN)       │
│  - HTTPS                │
│  - Edge Caching         │
│  - Global Distribution  │
└──────┬──────────────────┘
       │
       ↓
┌─────────────────────────┐
│  S3 Bucket              │
│  - Static Hosting       │
│  - NextJS Build Output  │
│  - web-build/dev|prod   │
└─────────────────────────┘

       ↓ (API Calls)
       
┌─────────────────────────┐
│  API Service            │
│  - Python Backend       │
│  - RESTful Endpoints    │
│  - Business Logic       │
└─────────────────────────┘
```

## Data Flow

1. **User Request**
   - User navigates to application URL
   - Request hits CloudFront edge location

2. **Static Content Delivery**
   - CloudFront checks cache
   - If cached, serves from edge
   - If not, fetches from S3 origin
   - Caches for future requests

3. **Dynamic Data Requests**
   - Web app makes API calls (client-side)
   - Requests go to separate API service
   - API processes and returns data
   - Web app updates UI

## Deployment Architecture

```
Developer Machine
       ↓
┌─────────────────────────┐
│  Web Build Process      │
│  npm run build          │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  web-build/dev|prod     │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  CDK Deploy             │
│  ./deploy.sh <env>      │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  CloudFormation         │
│  - Creates/Updates      │
│  - S3 Bucket            │
│  - CloudFront           │
│  - IAM Roles            │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  S3 Sync                │
│  Upload build files     │
└──────┬──────────────────┘
       ↓
┌─────────────────────────┐
│  CloudFront Invalidation│
│  Clear cache            │
└─────────────────────────┘
```

## Infrastructure Components

### S3 Buckets
- **Purpose**: Host static website files
- **Configuration**: 
  - Static website hosting enabled
  - Public read access (or via CloudFront OAI)
  - Versioning (optional)
  - Lifecycle policies (optional)

### CloudFront Distribution
- **Purpose**: Content delivery network
- **Features**:
  - HTTPS/SSL certificates
  - Custom domain support
  - Edge caching
  - Origin access identity (OAI)
  - Cache invalidation

### IAM Roles and Policies
- **Purpose**: Security and access control
- **Policies**:
  - S3 bucket access
  - CloudFront permissions
  - Deployment permissions

### Route 53 (Optional)
- **Purpose**: DNS management
- **Configuration**:
  - Domain registration
  - Record sets pointing to CloudFront

## Security Architecture

### Web Application Security
- HTTPS enforced via CloudFront
- S3 bucket not publicly accessible (via OAI)
- Content Security Policy headers
- XSS protection

### API Security
- Authentication/Authorization (TBD)
- API rate limiting
- Input validation
- CORS configuration

### Infrastructure Security
- IAM least privilege principle
- No hardcoded credentials
- Secrets in AWS Secrets Manager
- VPC isolation (if applicable)
- Security groups and NACLs

## Environment Separation

### Development Environment
- `config-dev.json`
- Separate AWS resources
- `web-build/dev/` → S3 bucket (dev)
- Lower cost configurations
- Test data

### Production Environment
- `config-prod.json`
- Separate AWS resources
- `web-build/prod/` → S3 bucket (prod)
- High availability
- Production data
- Stricter security

## Scalability Considerations

### Web Application
- Static files scale automatically via CloudFront
- Global edge locations
- No server scaling required

### API
- Horizontal scaling (based on implementation)
- Load balancing
- Auto-scaling groups (if on EC2/ECS)
- Lambda concurrency (if serverless)

### Database (Future)
- Managed services (RDS, DynamoDB)
- Read replicas
- Caching layer (ElastiCache)

## Monitoring and Observability

### AWS CloudWatch
- CloudFront metrics
- S3 metrics
- API metrics (when implemented)
- Custom application metrics

### Logging
- CloudFront access logs
- S3 access logs
- API logs
- CloudWatch Logs

### Alerting
- CloudWatch Alarms
- SNS notifications
- Error rate monitoring
- Performance monitoring

## Disaster Recovery

### Backup Strategy
- S3 versioning
- Cross-region replication (optional)
- Infrastructure as Code (CDK) for quick rebuild

### Recovery Process
1. Identify issue
2. Rollback CloudFormation stack (if infra issue)
3. Redeploy previous version (if app issue)
4. Restore from S3 versions if needed

## Cost Optimization

- CloudFront caching reduces S3 requests
- S3 Intelligent-Tiering for older objects
- Appropriate CloudFront price class
- Resource tagging for cost allocation
- Regular review of unused resources

## Future Enhancements

- CI/CD pipeline (GitHub Actions, CodePipeline)
- Automated testing
- Blue-green deployments
- WAF for additional security
- API Gateway for API management
- Database integration
- Monitoring dashboards
- Automated backups
