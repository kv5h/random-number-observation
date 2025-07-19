import { Handler, APIGatewayEvent, Context } from 'aws-lambda';
import AWS from 'aws-sdk';

// AWS SDK configuration (get credentials from Netlify environment variables)
AWS.config.update({
    region: process.env.NETLIFY_AWS_REGION,
    accessKeyId: process.env.NETLIFY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NETLIFY_AWS_SECRET_ACCESS_KEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME;

export const handler: Handler = async (event: APIGatewayEvent, context: Context) => {
    try {
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Method Not Allowed' }),
            };
        }

        const queryParams = event.queryStringParameters || {};
        let startDateStr = queryParams.startDate;
        let endDateStr = queryParams.endDate;

        let startDateIso: string;
        let endDateIso: string;

        // If date parameters are not provided, get data for the last 7 days by default
        if (!startDateStr || !endDateStr) {
            const now = new Date();
            const endDt = new Date(now.toISOString()); // UTC
            const startDt = new Date(endDt.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

            startDateIso = startDt.toISOString().split('.')[0] + 'Z';
            endDateIso = endDt.toISOString().split('.')[0] + 'Z';
        } else {
            // Convert date string from frontend (YYYY-MM-DD) to ISO format
            startDateIso = `${startDateStr}T00:00:00Z`;
            endDateIso = `${endDateStr}T23:59:59Z`;
        }

        if (!tableName) {
            throw new Error('DynamoDB table name is not configured.');
        }

        const params: AWS.DynamoDB.DocumentClient.QueryInput = {
            TableName: tableName,
            KeyConditionExpression: 'recordType = :rt AND #ts BETWEEN :startTs AND :endTs',
            ExpressionAttributeNames: {
                '#ts': 'timestamp', // Use alias for 'timestamp' in case it is a reserved word
            },
            ExpressionAttributeValues: {
                ':rt': 'D_VALUE_RECORD',
                ':startTs': startDateIso,
                ':endTs': endDateIso,
            },
        };

        const result = await docClient.query(params).promise();
        const items = result.Items || [];

        const formattedData = items.map((item) => ({
            timestamp: item.timestamp,
            d_value: item.d_value,
        }));

        // Sort by timestamp (DynamoDB Query sorts by sort key, but do it just in case)
        formattedData.sort((a, b) => {
            if (a.timestamp < b.timestamp) return -1;
            if (a.timestamp > b.timestamp) return 1;
            return 0;
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // In production, restrict to frontend domain
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify(formattedData),
        };
    } catch (error: any) {
        console.error('Error fetching data from DynamoDB:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: error.message || 'Unknown error' }),
        };
    }
};
