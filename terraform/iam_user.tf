module "iam_user_vercel" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-user"
  version = "~> 5.59.0"

  name                          = "${local.prefix}-vercel"
  create_iam_access_key         = true
  create_iam_user_login_profile = false
}

resource "aws_iam_user_policy" "vercel" {
  name   = "${local.prefix}-vercel"
  user   = module.iam_user_vercel.iam_user_name
  policy = data.aws_iam_policy_document.vercel.json
}

data "aws_iam_policy_document" "vercel" {
  statement {
    sid = "AllowDynamoDBRead"
    actions = [
      "dynamodb:BatchGetItem",
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:Scan"
    ]
    resources = [aws_dynamodb_table.randomness_d_values.arn]
  }
}
