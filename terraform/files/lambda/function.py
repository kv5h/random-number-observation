import json
import os
import datetime
import random
import boto3
from scipy.stats import kstest


def lambda_handler(event, context):
    """
    Lambda function that generates 10,000 random numbers, calculates the D-value using the K-S test, and stores it in DynamoDB.
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

    # Generate 10,000 random numbers (uniform distribution between 0 and 1)
    random_numbers = [random.random() for _ in range(10000)]

    # Perform K-S test (compare with uniform distribution)
    # Null hypothesis: data comes from a uniform distribution
    d_statistic, p_value = kstest(random_numbers, "uniform")

    # Get current time in ISO 8601 format (UTC)
    current_time_iso = (
        datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds") + "Z"
    )

    try:
        table.put_item(
            Item={
                "recordType": "D_VALUE_RECORD",
                "timestamp": current_time_iso,
                "d_value": float(f"{d_statistic:.4f}"),  # Store D value as float
                "p_value": float(f"{p_value:.4f}"),  # Also store p value
            }
        )
        print(
            f"Successfully stored D-value: {d_statistic:.4f} at {current_time_iso} with recordType: 'D_VALUE_RECORD'"
        )
        return {
            "statusCode": 200,
            "body": json.dumps(
                {
                    "message": "D-value calculated and stored successfully.",
                    "recordType": "D_VALUE_RECORD",
                    "d_value": d_statistic,
                    "timestamp": current_time_iso,
                }
            ),
        }
    except Exception as e:
        print(f"Error storing D-value: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
