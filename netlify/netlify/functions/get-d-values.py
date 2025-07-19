import json
import os
import boto3
from decimal import Decimal
import datetime

 # Initialize DynamoDB client
dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.environ.get("AWS_REGION"),
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
)
table_name = os.environ.get("DYNAMODB_TABLE_NAME")
table = dynamodb.Table(table_name)
dynamodb = boto3.resource(
    "dynamodb",
    region_name=os.environ.get("AWS_REGION"),
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
)
table_name = os.environ.get("DYNAMODB_TABLE_NAME")
table = dynamodb.Table(table_name)


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return json.JSONEncoder.default(self, o)


def handler(event, context):
    try:
        if event["httpMethod"] != "GET":
            return {
                "statusCode": 405,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Method Not Allowed"}),
            }

        query_params = event.get("queryStringParameters", {})
        start_date_str = query_params.get("startDate")
        end_date_str = query_params.get("endDate")

        # If date parameters are not provided, get data for the last 7 days by default
        if not start_date_str or not end_date_str:
            end_dt = datetime.datetime.now(datetime.timezone.utc)
            start_dt = end_dt - datetime.timedelta(days=7)
            start_date_iso = start_dt.isoformat(timespec="seconds") + "Z"
            end_date_iso = end_dt.isoformat(timespec="seconds") + "Z"
        else:
            # Convert date string from frontend to ISO format (e.g., "YYYY-MM-DD" -> "YYYY-MM-DDT00:00:00Z")
            start_date_iso = start_date_str + "T00:00:00Z"
            end_date_iso = end_date_str + "T23:59:59Z"

        # Execute DynamoDB Query (specify range with partition key and sort key)
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("recordType").eq(
                "D_VALUE_RECORD"
            )
            & boto3.dynamodb.conditions.Key("timestamp").between(
                start_date_iso, end_date_iso
            )
        )
        items = response["Items"]

        formatted_data = []
        for item in items:
            formatted_data.append(
                {"timestamp": item.get("timestamp"), "d_value": item.get("d_value")}
            )

        formatted_data.sort(key=lambda x: x.get("timestamp", ""))

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",  # TODO: Restrict to frontend domain
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps(formatted_data, cls=DecimalEncoder),
        }

    except Exception as e:
        print(f"Error fetching data from DynamoDB: {e}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
