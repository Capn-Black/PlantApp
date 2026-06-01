/**
 * getPlants Lambda
 *
 * GET /gardens/{userId}/plants
 *
 * Queries DynamoDB for all PLANT# items belonging to a user and returns
 * them as an array of plant view-model objects.
 *
 * Path parameter : userId  (will come from Cognito authorizer in Step 6)
 * Response       : 200 { plants: [...] }
 */

import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from './dynamoClient.mjs';
import { ok, badRequest, serverError } from './response.mjs';

// Full month name → short name for the UI grid
const MONTH_MAP = {
  January: 'Jan', February: 'Feb', March: 'Mar',
  April: 'Apr',   May: 'May',      June: 'Jun',
  July: 'Jul',    August: 'Aug',   September: 'Sep',
  October: 'Oct', November: 'Nov', December: 'Dec',
};

/**
 * Convert a raw DynamoDB plant record to the UI view-model shape.
 * Mirrors the toPlantViewModel() function in gardenService.js.
 */
function toViewModel(record) {
  const care = {};
  for (const [fullMonth, { tasks }] of Object.entries(record.CareSchedule ?? {})) {
    const short = MONTH_MAP[fullMonth];
    if (short) care[short] = tasks;
  }

  return {
    id:             record.SK.replace('PLANT#', ''),
    name:           record.PlantName,
    commonName:     record.CommonName,
    scientificName: record.ScientificName,
    emoji:          record.Emoji,
    location:       record.Location,
    hardinessZone:  record.HardinessZone,
    datePlanted:    record.DatePlanted,
    customNotes:    record.CustomNotes ?? '',
    care,
  };
}

export async function handler(event) {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) return badRequest('Missing userId path parameter');

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk':     `USER#${userId}`,
          ':prefix': 'PLANT#',
        },
      })
    );

    const plants = (result.Items ?? []).map(toViewModel);
    return ok({ plants });

  } catch (err) {
    return serverError(err);
  }
}
