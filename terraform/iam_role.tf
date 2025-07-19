resource "aws_iam_role" "lambda" {
  name               = "${local.prefix}-lambda"
  description        = "AWS Lambda execution role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

locals {
  lambda_managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole",
  ]
}

resource "aws_iam_role_policy_attachment" "lambda" {
  for_each = toset(local.lambda_managed_policy_arns)

  role       = aws_iam_role.lambda.name
  policy_arn = each.key
}

resource "aws_iam_role_policy" "lambda" {
  name   = "${local.prefix}-lambda"
  role   = aws_iam_role.lambda.name
  policy = data.aws_iam_policy_document.lambda.json
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "lambda" {
  statement {
    sid = "AllowCloudWatchLogsOperations"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [aws_cloudwatch_log_group.lambda.arn]
  }

  statement {
    sid       = "AllowDynamoDBWrite"
    actions   = ["dynamodb:PutItem"]
    resources = [aws_dynamodb_table.randomness_d_values.arn]
  }
}
