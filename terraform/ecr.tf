resource "aws_ecr_repository" "lambda_function" {
  name                 = "${local.prefix}-lambda-function"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
