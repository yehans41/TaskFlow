# TaskFlow AWS Deployment Guide

This guide walks through deploying TaskFlow to AWS using ECS Fargate, RDS MySQL, and ElastiCache Redis.

## Prerequisites

- AWS Account
- AWS CLI configured with appropriate credentials
- Docker installed locally
- GitHub repository set up

## Deployment Steps

### 1. Set Up AWS Infrastructure

Using CloudFormation (recommended):

```bash
cd infra/aws
aws cloudformation create-stack \
  --stack-name taskflow-infrastructure \
  --template-body file://cloudformation-template.yml \
  --parameters ParameterKey=Environment,ParameterValue=production \
               ParameterKey=DBPassword,ParameterValue=YOUR_SECURE_PASSWORD \
  --capabilities CAPABILITY_IAM
```

Or using the setup script:

```bash
chmod +x setup-infrastructure.sh
./setup-infrastructure.sh
```

### 2. Configure AWS Secrets Manager

Store sensitive configuration in AWS Secrets Manager:

```bash
# JWT Secret
aws secretsmanager create-secret \
  --name taskflow/jwt-secret \
  --secret-string "your-secure-jwt-secret-key"

# MySQL Connection String
aws secretsmanager create-secret \
  --name taskflow/mysql-connection \
  --secret-string "Server=your-rds-endpoint;Database=taskflow;User=admin;Password=your-password;"

# Redis URL
aws secretsmanager create-secret \
  --name taskflow/redis-url \
  --secret-string "your-redis-endpoint:6379"
```

### 3. Set Up ECR Repositories

Create repositories for Docker images:

```bash
aws ecr create-repository --repository-name taskflow-client
aws ecr create-repository --repository-name taskflow-gateway
aws ecr create-repository --repository-name taskflow-core
```

### 4. Update Task Definitions

Replace `YOUR_ACCOUNT_ID` in the task definition files with your AWS Account ID:

- `ecs-task-definition-client.json`
- `ecs-task-definition-gateway.json`
- `ecs-task-definition-core.json`

Register task definitions:

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition-client.json
aws ecs register-task-definition --cli-input-json file://ecs-task-definition-gateway.json
aws ecs register-task-definition --cli-input-json file://ecs-task-definition-core.json
```

### 5. Create ECS Services

Create services for each component:

```bash
# Core API Service
aws ecs create-service \
  --cluster taskflow-cluster \
  --service-name taskflow-core \
  --task-definition taskflow-core \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"

# Gateway Service
aws ecs create-service \
  --cluster taskflow-cluster \
  --service-name taskflow-gateway \
  --task-definition taskflow-gateway \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"

# Client Service
aws ecs create-service \
  --cluster taskflow-cluster \
  --service-name taskflow-client \
  --task-definition taskflow-client \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### 6. Set Up Application Load Balancer

Create an ALB to route traffic:

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name taskflow-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# Create target groups for each service
# Create listeners and rules
```

### 7. Configure GitHub Actions

Add the following secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

The CI/CD pipeline will automatically:
1. Run tests on pull requests
2. Build and push Docker images on merge to main
3. Deploy updated services to ECS

## Monitoring

- **CloudWatch Logs**: View logs at `/ecs/taskflow-*`
- **CloudWatch Metrics**: Monitor ECS service health
- **RDS Metrics**: Database performance monitoring
- **ElastiCache Metrics**: Redis cache performance

## Scaling

Update service desired count:

```bash
aws ecs update-service \
  --cluster taskflow-cluster \
  --service taskflow-core \
  --desired-count 4
```

Enable auto-scaling:

```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/taskflow-cluster/taskflow-core \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10
```

## Cost Optimization

- Use Fargate Spot for non-production environments
- Enable RDS auto-scaling storage
- Use CloudWatch alarms for cost monitoring
- Consider Reserved Instances for predictable workloads

## Troubleshooting

### Service won't start
- Check CloudWatch logs for errors
- Verify security group rules
- Confirm secrets are accessible
- Check task definition IAM roles

### Database connection issues
- Verify RDS security group allows ECS tasks
- Check connection string in Secrets Manager
- Ensure RDS is in the same VPC

### Redis connection issues
- Verify ElastiCache security group
- Check Redis endpoint in Secrets Manager
- Ensure Redis is in private subnets

## Backup and Disaster Recovery

- RDS automated backups enabled (7-day retention)
- Consider cross-region replication for production
- Regular database snapshots
- Export critical data to S3
