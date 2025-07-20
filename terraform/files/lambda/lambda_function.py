from decimal import Decimal
import json
import os
import datetime
import random
import boto3


def ks_statistic(data):
    """
    Calculate the Kolmogorov-Smirnov D statistic for a sample against the uniform distribution.
    """
    n = len(data)
    data_sorted = sorted(data)
    d_plus = max((i + 1) / n - x for i, x in enumerate(data_sorted))
    d_minus = max(x - i / n for i, x in enumerate(data_sorted))
    d_statistic = max(d_plus, d_minus)
    return d_statistic


def lambda_handler(event, context):
    """
    Lambda function that generates random numbers, calculates the D-value using the K-S test (without scipy or numpy), and stores it in DynamoDB.
    Also stores the 'recordType' attribute according to the new schema.
    """
    # Get DynamoDB table name from environment variable
    table_name = os.environ.get("DYNAMODB_TABLE_NAME")

    if not table_name:
        print("Error: DYNAMODB_TABLE_NAME environment variable not set.")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "DynamoDB table name not configured."}),
        }

    # Initialize DynamoDB resource
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    # Generate random numbers (uniform distribution between 0 and 1)
    random_numbers = [random.random() for _ in range(100)]

    # Calculate D-value using custom K-S statistic function
    d_statistic = ks_statistic(random_numbers)

    # Get current time in ISO 8601 format (UTC)
    current_time_iso = (
        datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds") + "Z"
    )

    try:
        table.put_item(
            Item={
                "recordType": "D_VALUE_RECORD",
                "timestamp": current_time_iso,
                "d_value": Decimal(str(round(d_statistic, 4))),
            }
        )
        return {
            "statusCode": 200,
            "body": json.dumps(
                {"message": "D value stored successfully.", "d_value": d_statistic}
            ),
        }
    except Exception as e:
        print(f"Error storing data in DynamoDB: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }
