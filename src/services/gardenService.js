/**
 * gardenService.js
 *
 * Service layer for all garden data operations.
 *
 * Controlled by the VITE_API_URL environment variable:
 *
 *   Not set  → uses the in-memory mockDb (local dev, Step 2)
 *   Set      → calls real Lambda functions via API Gateway (Step 3+)
 *
 * To switch to real AWS:
 *   1. Deploy the SAM template:  cd backend && sam build && sam deploy --guided
 *   2. Copy the ApiBaseUrl from the deploy output
 *   3. Create .env.local in the project root:
 *        VITE_API_URL=https://<id>.execute-api.<region>.amazonaws.com
 *   4. Restart the dev server — the mock is bypassed automatically
 */

import { nanoid } from 'nanoid';

// ── Determine which backend to use ───────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = !API_URL;

// Lazy-load the mock so it's tree-shaken out of production builds
let mockDb;
async function getMock() {
  if (!mockDb) mockDb = await import('../data/mockDb.js');
  return mockDb;
}

// Month name translation tables
const SHORT_TO_FULL = {
  Jan: 'January',  Feb: 'February', Mar: 'March',
  Apr: 'April',    May: 'May',      Jun: 'June',
  Jul: 'July',     Aug: 'August',   Sep: 'September',
  Oct: 'October',  Nov: 'November', Dec: 'December',
};

const FULL_TO_SHORT = Object.fromEntries(
  Object.entries(SHORT_TO_FULL).map(([s, f]) => [f, s])
);

function fakeDelay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Mock helpers (mirrors Lambda logic locally) ───────────────────────────────

function toPlantViewModel(record) {
  const care = {};
  for (const [fullMonth, { tasks }] of Object.entries(record.CareSchedule ?? {})) {
    const short = FULL_TO_SHORT[fullMonth];
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

function toDbRecord(userId, plant) {
  const careSchedule = {};
  for (const [short, tasks] of Object.entries(plant.care ?? {})) {
    const full = SHORT_TO_FULL[short];
    if (full) careSchedule[full] = { tasks };
  }
  return {
    PK:             `USER#${userId}`,
    SK:             `PLANT#${plant.id}`,
    CommonName:     plant.commonName,
    PlantName:      plant.name,
    ScientificName: plant.scientificName ?? '',
    Emoji:          plant.emoji ?? '🌿',
    DatePlanted:    plant.datePlanted ?? new Date().toISOString().split('T')[0],
    Location:       plant.location ?? '',
    HardinessZone:  plant.hardinessZone ?? '',
    CustomNotes:    plant.customNotes ?? '',
    CareSchedule:   careSchedule,
  };
}

// ── Real API helpers ──────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  // Attach Cognito JWT token when available
  const { getAccessToken } = await import('./authService');
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }
  // 204 No Content has no body
  if (res.status === 204) return null;
  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch the current user's metadata (zone, zip code, etc.)
 */
export async function getUserMetadata(userId = 'usr_98765') {
  if (USE_MOCK) {
    await fakeDelay(150);
    const db = await getMock();
    const record = db.getItem(`USER#${userId}`, 'METADATA');
    if (!record) throw new Error(`User ${userId} not found`);
    return {
      userId,
      zipCode:       record.ZipCode,
      hardinessZone: record.HardinessZone,
      createdAt:     record.CreatedAt,
    };
  }
  // Real API — user metadata endpoint (added in Step 6 with Cognito)
  return apiFetch(`/gardens/${userId}/metadata`);
}

/**
 * Fetch all plants for a user.
 * @returns {Promise<Array>}
 */
export async function getPlants(userId = 'usr_98765') {
  if (USE_MOCK) {
    await fakeDelay(300);
    const db = await getMock();
    const items = db.queryByPK(`USER#${userId}`);
    return items
      .filter((i) => i.SK.startsWith('PLANT#'))
      .map(toPlantViewModel);
  }
  const data = await apiFetch(`/gardens/${userId}/plants`);
  return data.plants;
}

/**
 * Add a new plant to the user's garden.
 * @returns {Promise<object>} Saved plant view-model
 */
export async function addPlant(plant, userId = 'usr_98765') {
  if (USE_MOCK) {
    await fakeDelay(400);
    const db = await getMock();
    const newPlant = { ...plant, id: plant.id ?? `plt_${nanoid(8)}` };
    const record = toDbRecord(userId, newPlant);
    db.putItem(record);
    return toPlantViewModel(record);
  }
  const data = await apiFetch(`/gardens/${userId}/plants`, {
    method: 'POST',
    body: JSON.stringify(plant),
  });
  return data.plant;
}

/**
 * Remove a plant from the user's garden.
 * @returns {Promise<void>}
 */
export async function removePlant(plantId, userId = 'usr_98765') {
  if (USE_MOCK) {
    await fakeDelay(300);
    const db = await getMock();
    db.deleteItem(`USER#${userId}`, `PLANT#${plantId}`);
    return;
  }
  await apiFetch(`/gardens/${userId}/plants/${plantId}`, { method: 'DELETE' });
}

/**
 * Look up a USDA hardiness zone by US zip code.
 * @returns {Promise<{ zipCode, zone, coordinates, temperature_range }>}
 */
export async function getZone(zipCode) {
  if (USE_MOCK) {
    await fakeDelay(200);
    // Return a plausible mock response so the UI can be built against it
    return {
      zipCode,
      zone: '8b',
      coordinates: { lat: 32.9, lon: -117.1 },
      temperature_range: '15 to 20 °F',
    };
  }
  const data = await apiFetch(`/zone/${zipCode}`);
  return data;
}

// ── Mock plant search data ────────────────────────────────────────────────────

const MOCK_PLANTS = [
  { perenualId: 1,   commonName: 'European Fan Palm',      scientificName: 'Chamaerops humilis',              emoji: '🌴', cycle: 'Perennial', watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 2,   commonName: 'Rough Horsetail',        scientificName: 'Equisetum hyemale',               emoji: '🌿', cycle: 'Perennial', watering: 'Frequent', sunlight: 'Full sun, part shade' },
  { perenualId: 3,   commonName: 'Dwarf Umbrella Tree',    scientificName: 'Schefflera arboricola',           emoji: '🌳', cycle: 'Perennial', watering: 'Average',  sunlight: 'Part shade' },
  { perenualId: 4,   commonName: 'Sago Palm',              scientificName: 'Cycas revoluta',                  emoji: '🌴', cycle: 'Perennial', watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 5,   commonName: 'Fiddle-Leaf Fig',        scientificName: 'Ficus lyrata',                    emoji: '🌱', cycle: 'Perennial', watering: 'Average',  sunlight: 'Full sun, part shade' },
  { perenualId: 6,   commonName: 'Monstera',               scientificName: 'Monstera deliciosa',              emoji: '🌿', cycle: 'Perennial', watering: 'Average',  sunlight: 'Part shade' },
  { perenualId: 7,   commonName: 'Knockout Rose',          scientificName: "Rosa 'Radrazz'",                  emoji: '🌹', cycle: 'Perennial', watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 8,   commonName: 'Cherry Tomato',          scientificName: 'Solanum lycopersicum',            emoji: '🍅', cycle: 'Annual',    watering: 'Frequent', sunlight: 'Full sun' },
  { perenualId: 9,   commonName: 'English Lavender',       scientificName: 'Lavandula angustifolia',          emoji: '💜', cycle: 'Perennial', watering: 'Minimum',  sunlight: 'Full sun' },
  { perenualId: 10,  commonName: 'Sweet Basil',            scientificName: 'Ocimum basilicum',                emoji: '🌿', cycle: 'Annual',    watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 11,  commonName: 'Sunflower',              scientificName: 'Helianthus annuus',               emoji: '🌻', cycle: 'Annual',    watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 12,  commonName: 'Strawberry',             scientificName: 'Fragaria × ananassa',             emoji: '🍓', cycle: 'Perennial', watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 13,  commonName: 'Blueberry',              scientificName: 'Vaccinium corymbosum',            emoji: '🫐', cycle: 'Perennial', watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 14,  commonName: 'Rosemary',               scientificName: 'Salvia rosmarinus',               emoji: '🌿', cycle: 'Perennial', watering: 'Minimum',  sunlight: 'Full sun' },
  { perenualId: 15,  commonName: 'Mint',                   scientificName: 'Mentha spicata',                  emoji: '🌿', cycle: 'Perennial', watering: 'Frequent', sunlight: 'Part shade' },
  { perenualId: 16,  commonName: 'Chilli Pepper',          scientificName: 'Capsicum annuum',                 emoji: '🌶️', cycle: 'Annual',    watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 17,  commonName: 'Zucchini',               scientificName: 'Cucurbita pepo',                  emoji: '🥒', cycle: 'Annual',    watering: 'Frequent', sunlight: 'Full sun' },
  { perenualId: 18,  commonName: 'Carrot',                 scientificName: 'Daucus carota subsp. sativus',    emoji: '🥕', cycle: 'Annual',    watering: 'Average',  sunlight: 'Full sun' },
  { perenualId: 19,  commonName: 'Hydrangea',              scientificName: 'Hydrangea macrophylla',           emoji: '💐', cycle: 'Perennial', watering: 'Frequent', sunlight: 'Part shade' },
  { perenualId: 20,  commonName: 'Peace Lily',             scientificName: 'Spathiphyllum wallisii',          emoji: '🌸', cycle: 'Perennial', watering: 'Average',  sunlight: 'Part shade' },
];

/**
 * Search the Perenual plant database by name.
 * @returns {Promise<{ results, currentPage, lastPage, total }>}
 */
export async function searchPlants(query, page = 1) {
  if (USE_MOCK) {
    await fakeDelay(350);
    if (!query.trim()) return { results: [], currentPage: 1, lastPage: 1, total: 0 };

    const q = query.toLowerCase();
    const filtered = MOCK_PLANTS.filter(
      (p) =>
        p.commonName.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q)
    );
    return {
      results:     filtered,
      currentPage: 1,
      lastPage:    1,
      total:       filtered.length,
    };
  }
  const data = await apiFetch(`/plants/search?q=${encodeURIComponent(query)}&page=${page}`);
  return data;
}
