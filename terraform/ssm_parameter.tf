resource "aws_ssm_parameter" "vercel_user_credentials" {
  name        = "${local.prefix}-vercel-user-credentials"
  description = "Vercel IAM User credentials in key:secret format"
  type        = "SecureString"
  value       = "${module.iam_user_vercel.iam_access_key_id}:${module.iam_user_vercel.iam_access_key_secret}"
}
