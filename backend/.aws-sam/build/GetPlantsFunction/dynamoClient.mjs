/**
 * dynamoClient.mjs
 *
 * Shared DynamoDB Document Client used by all Lambda functions.
 * Using the v3 AWS SDK which is included in the Lambda runtime — no bundling needed.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAME = process.env.TABLE_NAME ?? 'GardeningAppData';
