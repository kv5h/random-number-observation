# build_and_push_lambda_image.sh

#!/bin/bash
set -euo pipefail

ECR_REPO_NAME=${ECR_REPO_NAME}
ECR_REPO_URI=${ECR_REPO_URI}
IMAGE_TAG="latest"

# Validation
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed or not in PATH."
    exit 1
fi

echo "Authenticating to ECR..."
aws ecr get-login-password | docker login --username AWS --password-stdin "${ECR_REPO_URI}"

ECR_FULL_IMAGE_NAME="${ECR_REPO_URI}:${IMAGE_TAG}"

echo "Building Docker image: ${ECR_FULL_IMAGE_NAME}"
docker build --provenance=false -t "${ECR_FULL_IMAGE_NAME}" .

echo "Pushing Docker image to ECR..."
docker push "${ECR_FULL_IMAGE_NAME}"

echo "Docker image pushed to ECR: ${ECR_FULL_IMAGE_NAME}"
