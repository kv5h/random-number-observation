resource "aws_lambda_function" "lambda" {
  # Basic settings
  function_name = "${local.prefix}-lambda"
  description   = "Calculates the D-value using the K-S test"
  architectures = ["arm64"]
  memory_size   = 128 # Minimum
  timeout       = 900 # Maximum, 15 minutes
  role          = aws_iam_role.lambda.arn

  # Deployment / Code
  package_type = "Image"
  image_uri    = "${aws_ecr_repository.lambda_function.repository_url}:latest"

  # Environment variables
  environment {
    variables = {
      DYNAMODB_TABLE_NAME = var.dynamodb_table_name
    }
  }

  # Logging
  logging_config {
    application_log_level = "INFO"
    log_format            = "JSON"
    log_group             = aws_cloudwatch_log_group.lambda.name
    system_log_level      = "INFO"
  }
}
