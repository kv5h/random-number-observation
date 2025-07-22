# Random Number Observation

This project observes and analyzes the bias of random numbers using the Kolmogorov-Smirnov (K-S) D statistic. It consists of an AWS Lambda backend for generating random numbers and calculating D values, and a frontend for visualizing the results.

## Features

- Periodically generates random numbers and calculates the K-S D statistic
- Stores results in DynamoDB with timestamps
- Provides an API to retrieve D values for a specified period
- Visualizes D values over time using a web frontend (Chart.js)

## Structure

- `terraform/` : Infrastructure as Code (Lambda, DynamoDB, EventBridge, IAM, etc.)
- `netlify/` : Frontend code (HTML, JS, CSS)
- `lambda/` : Lambda function code (Python, Dockerfile)

## Usage

1. Deploy backend resources using Terraform
2. Build and push the Lambda container image
3. Access the frontend to view D value trends and filter by date

## License

MIT
