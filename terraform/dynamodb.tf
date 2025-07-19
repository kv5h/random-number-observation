resource "aws_dynamodb_table" "randomness_d_values" {
  name         = var.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "recordType"
  range_key = "timestamp"

  attribute {
    name = "recordType"
    type = "S" # String
  }
  attribute {
    name = "timestamp"
    type = "S" # String
  }
}
