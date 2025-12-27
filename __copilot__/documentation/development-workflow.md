# Development Workflow

## Daily Development

### 1. Start Development

```bash
# Activate virtual environment
cd program-rig
source pr-venv/bin/activate  # or infra/venv/bin/activate

# Pull latest changes
git pull origin main
```

### 2. Web Development

```bash
cd web

# Start development server
npm run dev

# Make changes to components, pages, etc.

# Build for testing
npm run build
```

The build output will go to `../web-build/dev/` or `../web-build/prod/` depending on configuration.

### 3. Infrastructure Changes

```bash
cd infra

# Make changes to infra_stack.py or config files

# Validate changes
./synth.sh

# Review what will change
./diff.sh

# Deploy to dev
./deploy.sh dev

# Test the deployment

# If good, deploy to prod
./deploy.sh prod
```

### 4. API Development (when implemented)

```bash
cd api

# Run API locally
python main.py  # or appropriate command

# Make changes

# Test locally

# Deploy changes
```

## Testing Workflow

### Local Testing

1. **Web Application**: Use `npm run dev` for local development server
2. **API**: Run locally with test database/configuration
3. **Integration**: Point web app to local API during development

### Dev Environment Testing

1. Deploy to dev environment
2. Test all functionality
3. Verify integrations
4. Check logs and monitoring

### Production Deployment

1. Ensure all tests pass in dev
2. Review changes carefully
3. Deploy during low-traffic period if possible
4. Monitor closely after deployment
5. Be ready to rollback if needed

## Git Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/my-feature

# Create pull request
# After review and approval, merge to main
```

### Commit Messages

Use clear, descriptive commit messages:
- `feat: Add new user dashboard component`
- `fix: Resolve S3 bucket policy issue`
- `docs: Update infrastructure deployment guide`
- `refactor: Simplify API error handling`

## Deployment Workflow

### Standard Deployment

```bash
# 1. Ensure you're on main branch with latest changes
git checkout main
git pull

# 2. Web Application
cd web
npm run build  # Builds to ../web-build/dev or prod

# 3. Infrastructure (syncs web-build to S3)
cd ../infra
./deploy.sh dev

# 4. Verify
# Check outputs-dev.json for URLs
# Test the deployed application

# 5. Deploy to production
./deploy.sh prod
```

### Hotfix Workflow

For urgent production fixes:

```bash
# 1. Create hotfix branch
git checkout -b hotfix/issue-description

# 2. Make minimal changes to fix issue
# ... make changes ...

# 3. Test in dev
./deploy.sh dev
# ... test thoroughly ...

# 4. Deploy to prod
./deploy.sh prod

# 5. Merge back to main
git checkout main
git merge hotfix/issue-description
git push
```

## Code Review

### Before Submitting PR

- [ ] Code builds without errors
- [ ] Tests pass locally
- [ ] Tested in dev environment
- [ ] Updated documentation if needed
- [ ] Followed project conventions
- [ ] No sensitive data committed

### Reviewing PRs

- Review code changes
- Check for security issues
- Verify tests are included
- Ensure documentation is updated
- Test the changes if possible

## Monitoring and Debugging

### Check Deployment Status

```bash
# CDK/CloudFormation
aws cloudformation describe-stacks --stack-name program-rig-dev

# S3 sync status
aws s3 ls s3://your-bucket-name --recursive
```

### View Logs

```bash
# CloudFormation events
aws cloudformation describe-stack-events --stack-name program-rig-dev

# CloudWatch logs (if configured)
aws logs tail /aws/... --follow
```

### Debugging Infrastructure Issues

1. Check CloudFormation console for stack status
2. Review CDK synthesis output
3. Verify IAM permissions
4. Check resource limits and quotas
5. Review configuration files for errors

## Best Practices

1. **Always test in dev first** before deploying to production
2. **Use pull requests** for code review
3. **Keep commits atomic** - one logical change per commit
4. **Write meaningful commit messages**
5. **Update documentation** as you make changes
6. **Monitor deployments** especially in production
7. **Keep dependencies updated** but test thoroughly
8. **Use virtual environments** for Python projects
9. **Don't commit secrets** - use AWS Secrets Manager
10. **Backup before major changes** - export configs, data, etc.
