/**
 * removePlant Lambda
 *
 * DELETE /gardens/{userId}/plants/{plantId}
 *
 * Deletes a single plant record from DynamoDB.
 * Response: 204 No Content
 */

import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../../shared/dynamoClient.mjs';
import { noContent, badRequest, serverError } from '../../shared/response.mjs';

export async function handler(event) {
  try {
    const { userId, plantId } = event.pathParameters ?? {};
    if (!userId || !plantId) {
      return badRequest('Missing userId or plantId path parameter');
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `PLANT#${plantId}`,
        },
      })
    );

    return noContent();

  } catch (err) {
    return serverError(err);
  }
}
