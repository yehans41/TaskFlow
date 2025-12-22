#!/bin/bash

# TaskFlow AWS Infrastructure Setup Script
# This script sets up the necessary AWS resources for TaskFlow deployment

set -e

# Configuration
AWS_REGION="us-east-1"
CLUSTER_NAME="taskflow-cluster"
VPC_NAME="taskflow-vpc"
SUBNET_NAME="taskflow-subnet"

echo "Setting up TaskFlow infrastructure in AWS region: $AWS_REGION"

# Create ECR repositories
echo "Creating ECR repositories..."
aws ecr create-repository --repository-name taskflow-client --region $AWS_REGION || echo "Repository taskflow-client already exists"
aws ecr create-repository --repository-name taskflow-gateway --region $AWS_REGION || echo "Repository taskflow-gateway already exists"
aws ecr create-repository --repository-name taskflow-core --region $AWS_REGION || echo "Repository taskflow-core already exists"

# Create ECS cluster
echo "Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION || echo "Cluster already exists"

# Create CloudWatch Log Groups
echo "Creating CloudWatch log groups..."
aws logs create-log-group --log-group-name /ecs/taskflow-client --region $AWS_REGION || echo "Log group already exists"
aws logs create-log-group --log-group-name /ecs/taskflow-gateway --region $AWS_REGION || echo "Log group already exists"
aws logs create-log-group --log-group-name /ecs/taskflow-core --region $AWS_REGION || echo "Log group already exists"

echo "Infrastructure setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up RDS MySQL database"
echo "2. Set up ElastiCache Redis cluster"
echo "3. Configure AWS Secrets Manager with:"
echo "   - taskflow/jwt-secret"
echo "   - taskflow/mysql-connection"
echo "   - taskflow/redis-url"
echo "4. Update task definitions with your AWS Account ID"
echo "5. Create ECS services using the task definitions"
echo "6. Set up Application Load Balancer"
echo "7. Configure GitHub Actions secrets:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
