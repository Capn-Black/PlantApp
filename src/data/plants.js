/**
 * Sample plant data modelled after the DynamoDB schema in README.md.
 * Shape mirrors the CareSchedule structure from the README:
 *   PK: "USER#<id>" / SK: "PLANT#<id>"
 *
 * The `care` object uses short month names as keys for easy grid lookup.
 * Each value is an array of task strings matching the README emoji format.
 */

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const PLANTS = [
  {
    id: 'plt_rose_01',
    name: 'Knockout Rose',
    commonName: 'Rose',
    scientificName: "Rosa 'Radrazz'",
    emoji: '🌹',
    location: 'Front Yard',
    hardinessZone: '8b',
    datePlanted: '2026-03-15',
    care: {
      Jan: ['Dormant – no action needed'],
      Feb: ['✂️ Prune back canes by 1/3', '🧹 Clear debris around base'],
      Mar: ['🌱 Apply balanced slow-release fertilizer'],
      Apr: ['💧 Water deeply once per week'],
      May: ['💧 Water deeply once per week', '🔍 Check for aphids'],
      Jun: ['✂️ Deadhead spent blooms'],
      Jul: ['💧 Water twice per week in high heat'],
      Aug: ['💧 Monitor soil moisture closely'],
      Sep: ['🌱 Apply light late-season fertilizer'],
      Oct: ['✂️ Deadhead final blooms'],
      Nov: ['🪵 Add 2 inches of mulch for winter insulation'],
      Dec: ['Dormant – no action needed'],
    },
  },
  {
    id: 'plt_tomato_01',
    name: 'Cherry Tomato',
    commonName: 'Tomato',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    emoji: '🍅',
    location: 'Back Garden',
    hardinessZone: '8b',
    datePlanted: '2026-04-01',
    care: {
      Jan: ['Dormant – plan varieties for spring'],
      Feb: ['🌱 Start seeds indoors 6–8 weeks before last frost'],
      Mar: ['🌱 Transplant seedlings to larger pots', '💧 Water lightly'],
      Apr: ['🌿 Plant outdoors after last frost', '🪝 Install stakes or cages'],
      May: ['🌱 Fertilize with balanced feed', '💧 Water consistently'],
      Jun: ['💧 Water deeply 2–3× per week', '🌱 Side-dress with compost'],
      Jul: ['💧 Water daily in heat', '🍅 Begin harvesting ripe fruit'],
      Aug: ['🍅 Peak harvest season', '💧 Maintain consistent moisture'],
      Sep: ['🍅 Harvest remaining fruit', '✂️ Pinch new flowers to focus energy'],
      Oct: ['🧹 Remove plants after first frost', '🪵 Compost healthy foliage'],
      Nov: ['📋 Plan crop rotation for next year'],
      Dec: ['📋 Order seeds for next season'],
    },
  },
  {
    id: 'plt_lavender_01',
    name: 'English Lavender',
    commonName: 'Lavender',
    scientificName: 'Lavandula angustifolia',
    emoji: '💜',
    location: 'Side Border',
    hardinessZone: '8b',
    datePlanted: '2026-05-01',
    care: {
      Jan: ['Dormant – no action needed'],
      Feb: ['🔍 Check for winter damage'],
      Mar: ['✂️ Light prune to remove dead wood'],
      Apr: ['💧 Water sparingly – drought tolerant'],
      May: ['🪵 Apply light mulch around base'],
      Jun: ['💧 Water only if very dry'],
      Jul: ['✂️ Harvest flower spikes for drying'],
      Aug: ['✂️ Hard prune after flowering'],
      Sep: ['💧 Water if dry spell continues'],
      Oct: ['🪵 Add light mulch for winter'],
      Nov: ['Dormant – no action needed'],
      Dec: ['Dormant – no action needed'],
    },
  },
  {
    id: 'plt_basil_01',
    name: 'Sweet Basil',
    commonName: 'Basil',
    scientificName: 'Ocimum basilicum',
    emoji: '🌿',
    location: 'Kitchen Garden',
    hardinessZone: '8b',
    datePlanted: '2026-04-15',
    care: {
      Jan: ['📋 Order seeds for spring'],
      Feb: ['🌱 Start seeds indoors under grow lights'],
      Mar: ['🌱 Pot on seedlings, keep warm'],
      Apr: ['🌿 Transplant outdoors after last frost'],
      May: ['💧 Water regularly', '🌱 Fertilize lightly'],
      Jun: ['💧 Water daily', '✂️ Pinch flowers to encourage leaf growth', '🌿 Harvest leaves regularly'],
      Jul: ['💧 Water daily in heat', '🌿 Harvest generously'],
      Aug: ['🌿 Peak harvest', '✂️ Keep pinching flowers'],
      Sep: ['🌿 Final harvests before cold', '🌱 Take cuttings to overwinter indoors'],
      Oct: ['🧹 Remove plants after first frost'],
      Nov: ['📋 Review what worked this season'],
      Dec: ['📋 Plan next year\'s herb garden'],
    },
  },
];
