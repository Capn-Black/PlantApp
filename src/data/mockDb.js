/**
 * mockDb.js
 *
 * In-memory simulation of the DynamoDB single-table design from README.md.
 *
 * Table name : GardeningAppData
 * PK         : USER#<userId>
 * SK         : METADATA  |  PLANT#<plantId>
 *
 * This module is the ONLY place that knows about the raw DynamoDB record shape.
 * The service layer (gardenService.js) translates these records into the
 * friendlier shape the UI consumes.
 */

// Simulated current user — will come from Cognito in Step 6
export const CURRENT_USER_ID = 'usr_98765';

/**
 * The raw table items, exactly as they would be stored in / returned from DynamoDB.
 * CareSchedule keys use full month names to match the README schema.
 */
const TABLE_ITEMS = [
  // ── User metadata record ──────────────────────────────────────────────────
  {
    PK: 'USER#usr_98765',
    SK: 'METADATA',
    ZipCode: '92128',
    HardinessZone: '10a',
    CreatedAt: '2026-05-23T12:00:00Z',
  },

  // ── Plant records ─────────────────────────────────────────────────────────
  {
    PK: 'USER#usr_98765',
    SK: 'PLANT#plt_rose_01',
    CommonName: 'Rose',
    PlantName: 'Knockout Rose',
    ScientificName: "Rosa 'Radrazz'",
    Emoji: '🌹',
    DatePlanted: '2026-03-15',
    Location: 'Front Yard',
    HardinessZone: '8b',
    CustomNotes: 'Planted along the front fence.',
    CareSchedule: {
      January:   { tasks: ['Dormant – no action needed'] },
      February:  { tasks: ['✂️ Prune back canes by 1/3', '🧹 Clear debris around base'] },
      March:     { tasks: ['🌱 Apply balanced slow-release fertilizer'] },
      April:     { tasks: ['💧 Water deeply once per week'] },
      May:       { tasks: ['💧 Water deeply once per week', '🔍 Check for aphids'] },
      June:      { tasks: ['✂️ Deadhead spent blooms'] },
      July:      { tasks: ['💧 Water twice per week in high heat'] },
      August:    { tasks: ['💧 Monitor soil moisture closely'] },
      September: { tasks: ['🌱 Apply light late-season fertilizer'] },
      October:   { tasks: ['✂️ Deadhead final blooms'] },
      November:  { tasks: ['🪵 Add 2 inches of mulch for winter insulation'] },
      December:  { tasks: ['Dormant – no action needed'] },
    },
  },
  {
    PK: 'USER#usr_98765',
    SK: 'PLANT#plt_tomato_01',
    CommonName: 'Tomato',
    PlantName: 'Cherry Tomato',
    ScientificName: 'Solanum lycopersicum var. cerasiforme',
    Emoji: '🍅',
    DatePlanted: '2026-04-01',
    Location: 'Back Garden',
    HardinessZone: '8b',
    CustomNotes: 'Grown in raised bed #2.',
    CareSchedule: {
      January:   { tasks: ['Dormant – plan varieties for spring'] },
      February:  { tasks: ['🌱 Start seeds indoors 6–8 weeks before last frost'] },
      March:     { tasks: ['🌱 Transplant seedlings to larger pots', '💧 Water lightly'] },
      April:     { tasks: ['🌿 Plant outdoors after last frost', '🪝 Install stakes or cages'] },
      May:       { tasks: ['🌱 Fertilize with balanced feed', '💧 Water consistently'] },
      June:      { tasks: ['💧 Water deeply 2–3× per week', '🌱 Side-dress with compost'] },
      July:      { tasks: ['💧 Water daily in heat', '🍅 Begin harvesting ripe fruit'] },
      August:    { tasks: ['🍅 Peak harvest season', '💧 Maintain consistent moisture'] },
      September: { tasks: ['🍅 Harvest remaining fruit', '✂️ Pinch new flowers to focus energy'] },
      October:   { tasks: ['🧹 Remove plants after first frost', '🪵 Compost healthy foliage'] },
      November:  { tasks: ['📋 Plan crop rotation for next year'] },
      December:  { tasks: ['📋 Order seeds for next season'] },
    },
  },
  {
    PK: 'USER#usr_98765',
    SK: 'PLANT#plt_lavender_01',
    CommonName: 'Lavender',
    PlantName: 'English Lavender',
    ScientificName: 'Lavandula angustifolia',
    Emoji: '💜',
    DatePlanted: '2026-05-01',
    Location: 'Side Border',
    HardinessZone: '8b',
    CustomNotes: 'Borders the driveway.',
    CareSchedule: {
      January:   { tasks: ['Dormant – no action needed'] },
      February:  { tasks: ['🔍 Check for winter damage'] },
      March:     { tasks: ['✂️ Light prune to remove dead wood'] },
      April:     { tasks: ['💧 Water sparingly – drought tolerant'] },
      May:       { tasks: ['🪵 Apply light mulch around base'] },
      June:      { tasks: ['💧 Water only if very dry'] },
      July:      { tasks: ['✂️ Harvest flower spikes for drying'] },
      August:    { tasks: ['✂️ Hard prune after flowering'] },
      September: { tasks: ['💧 Water if dry spell continues'] },
      October:   { tasks: ['🪵 Add light mulch for winter'] },
      November:  { tasks: ['Dormant – no action needed'] },
      December:  { tasks: ['Dormant – no action needed'] },
    },
  },
  {
    PK: 'USER#usr_98765',
    SK: 'PLANT#plt_basil_01',
    CommonName: 'Basil',
    PlantName: 'Sweet Basil',
    ScientificName: 'Ocimum basilicum',
    Emoji: '🌿',
    DatePlanted: '2026-04-15',
    Location: 'Kitchen Garden',
    HardinessZone: '8b',
    CustomNotes: 'Grows in the pot by the back door.',
    CareSchedule: {
      January:   { tasks: ['📋 Order seeds for spring'] },
      February:  { tasks: ['🌱 Start seeds indoors under grow lights'] },
      March:     { tasks: ['🌱 Pot on seedlings, keep warm'] },
      April:     { tasks: ['🌿 Transplant outdoors after last frost'] },
      May:       { tasks: ['💧 Water regularly', '🌱 Fertilize lightly'] },
      June:      { tasks: ['💧 Water daily', '✂️ Pinch flowers to encourage leaf growth', '🌿 Harvest leaves regularly'] },
      July:      { tasks: ['💧 Water daily in heat', '🌿 Harvest generously'] },
      August:    { tasks: ['🌿 Peak harvest', '✂️ Keep pinching flowers'] },
      September: { tasks: ['🌿 Final harvests before cold', '🌱 Take cuttings to overwinter indoors'] },
      October:   { tasks: ['🧹 Remove plants after first frost'] },
      November:  { tasks: ['📋 Review what worked this season'] },
      December:  { tasks: ["📋 Plan next year's herb garden"] },
    },
  },
];

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Simulate DynamoDB Query: fetch all items for a given PK.
 * Returns a shallow copy so callers can't mutate the store directly.
 */
export function queryByPK(pk) {
  return TABLE_ITEMS.filter((item) => item.PK === pk).map((item) => ({ ...item }));
}

/**
 * Simulate DynamoDB GetItem: fetch a single item by PK + SK.
 */
export function getItem(pk, sk) {
  const item = TABLE_ITEMS.find((i) => i.PK === pk && i.SK === sk);
  return item ? { ...item } : null;
}

/**
 * Simulate DynamoDB PutItem: insert or replace an item.
 */
export function putItem(item) {
  const idx = TABLE_ITEMS.findIndex((i) => i.PK === item.PK && i.SK === item.SK);
  if (idx >= 0) {
    TABLE_ITEMS[idx] = { ...item };
  } else {
    TABLE_ITEMS.push({ ...item });
  }
}

/**
 * Simulate DynamoDB DeleteItem: remove an item by PK + SK.
 */
export function deleteItem(pk, sk) {
  const idx = TABLE_ITEMS.findIndex((i) => i.PK === pk && i.SK === sk);
  if (idx >= 0) TABLE_ITEMS.splice(idx, 1);
}
