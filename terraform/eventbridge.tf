resource "aws_cloudwatch_event_rule" "trigger_lambda" {
  name                = "${local.prefix}-trigger-lambda"
  description         = "Trigger Lambda function"
  schedule_expression = "rate(30 minutes)"
}

resource "aws_cloudwatch_event_target" "trigger_lambda" {
  arn       = aws_lambda_function.lambda.arn
  rule      = aws_cloudwatch_event_rule.trigger_lambda.name
  target_id = aws_lambda_function.lambda.function_name
}

resource "aws_lambda_permission" "trigger_lambda" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.trigger_lambda.arn
  statement_id  = aws_lambda_function.lambda.function_name
}
