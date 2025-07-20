# Lambda Function for Randomness D Value Calculation

This AWS Lambda function generates random numbers, calculates the Kolmogorov-Smirnov (K-S) D statistic (without using scipy or numpy), and stores the result in DynamoDB.

## Features

- Generates 100 (or configurable) random numbers (uniform distribution between 0 and 1)
- Calculates the K-S D statistic using a custom implementation
- Stores the result in a DynamoDB table with a timestamp and record type

## Environment Variables

- `DYNAMODB_TABLE_NAME`: The name of the DynamoDB table to store results

## Deployment

This function is designed to be deployed as a container image on AWS Lambda. See the Dockerfile in this directory for build instructions.

## Usage

- The Lambda handler is `lambda_function.lambda_handler`.
- The function expects no input and will generate and store a new D value each time it is invoked.

## Example Item in DynamoDB

```
{
  "recordType": "D_VALUE_RECORD",
  "timestamp": "2025-07-20T11:45:04+00:00",
  "d_value": 0.0832
}
```

## License

MIT
