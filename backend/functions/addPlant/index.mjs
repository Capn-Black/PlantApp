/**
 * addPlant Lambda
 *
 * POST /gardens/{userId}/plants
 *
 * Accepts a plant object in the request body, writes it to DynamoDB,
 * and returns the saved plant view-model.
 *
 * Body (JSON):
 *   {
 *     name, commonName, scientificName, emoji,
 *     location, hardinessZone, datePlanted, customNotes,
 *     care: { Jan: [...], Feb: [...], ... }
 *   }
 *
 * Response: 201 { plant: { id, name, ... } }
 */

import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../../shared/dynamoClient.mjs';
import { created, badRequest, serverError } from '../../shared/response.mjs';
import { randomUUID } from 'crypto';

// Short month name → full month name for DynamoDB storage
const MONTH_MAP = {
  Jan: 'January',  Feb: 'February', Mar: 'March',
  Apr: 'April',    May: 'May',      Jun: 'June',
  Jul: 'July',     Aug: 'August',   Sep: 'September',
  Oct: 'October',  Nov: 'November', Dec: 'December',
};

function toCareSchedule(care = {}) {
  const schedule = {};
  for (const [short, tasks] of Object.entries(care)) {
    const full = MONTH_MAP[short];
    if (full) schedule[full] = { tasks };
  }
  return schedule;
}

export async function handler(event) {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) return badRequest('Missing userId path parameter');

    let body;
    try {
      body = JSON.parse(event.body ?? '{}');
    } catch {
      return badRequest('Invalid JSON body');
    }

    const { name, commonName } = body;
    if (!name || !commonName) {
      return badRequest('name and commonName are required');
    }

    const plantId  = `plt_${randomUUID().replace(/-/g, '').slice(0, 8)}`;
    const now      = new Date().toISOString();

    const item = {
      PK:             `USER#${userId}`,
      SK:             `PLANT#${plantId}`,
      PlantName:      name,
      CommonName:     commonName,
      ScientificName: body.scientificName ?? '',
      Emoji:          body.emoji ?? '🌿',
      DatePlanted:    body.datePlanted ?? now.split('T')[0],
      Location:       body.location ?? '',
      HardinessZone:  body.hardinessZone ?? '',
      CustomNotes:    body.customNotes ?? '',
      CareSchedule:   toCareSchedule(body.care),
      CreatedAt:      now,
    };

    await docClient.send(
      new PutCommand({ TableName: TABLE_NAME, Item: item })
    );

    // Return the saved plant in the same view-model shape the UI expects
    const plant = {
      id:             plantId,
      name:           item.PlantName,
      commonName:     item.CommonName,
      scientificName: item.ScientificName,
      emoji:          item.Emoji,
      location:       item.Location,
      hardinessZone:  item.HardinessZone,
      datePlanted:    item.DatePlanted,
      customNotes:    item.CustomNotes,
      care:           body.care ?? {},
    };

    return created({ plant });

  } catch (err) {
    return serverError(err);
  }
}
