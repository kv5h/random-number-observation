output "dynamodb_table_arn" {
  description = "The ARN of the DynamoDB table."
  value       = aws_dynamodb_table.randomness_d_values.arn
}

output "dynamodb_table_name" {
  description = "The name of the DynamoDB table."
  value       = aws_dynamodb_table.randomness_d_values.name
}

output "ecr_repo_name" {
  description = "The name of the ECR repository for Lambda functions."
  value       = aws_ecr_repository.lambda_function.name
}

output "ecr_repo_uri" {
  description = "The URI of the ECR repository for Lambda functions."
  value       = aws_ecr_repository.lambda_function.repository_url
}
