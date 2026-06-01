/**
 * PlantSearch
 *
 * Search the Perenual plant database and add results to the user's garden.
 *
 * Props:
 *   onAddPlant    - (plant) => void  called when user clicks "Add to garden"
 *   currentZone   - string  e.g. "8b" — shown on the result card
 *   onClose       - () => void  close the panel
 */

import { usePlantSearch } from '../hooks/usePlantSearch';

// Watering frequency → colour badge
const WATERING_COLOUR = {
  Minimum:  'bg-blue-50   text-blue-600   border-blue-200',
  Average:  'bg-sky-50    text-sky-600    border-sky-200',
  Frequent: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

function wateringColour(w) {
  return WATERING_COLOUR[w] ?? 'bg-gray-50 text-gray-500 border-gray-200';
}

function PlantCard({ plant, onAdd }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-leaf-200 hover:bg-leaf-50 transition-colors group">

      {/* Emoji / image */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-leaf-100 flex items-center justify-center text-2xl overflow-hidden">
        {plant.imageUrl ? (
          <img
            src={plant.imageUrl}
            alt={plant.commonName}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <span aria-hidden="true" style={{ display: plant.imageUrl ? 'none' : 'flex' }}>
          {plant.emoji}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">{plant.commonName}</p>
        <p className="text-xs text-gray-400 italic truncate mb-1.5">{plant.scientificName}</p>

        <div className="flex flex-wrap gap-1">
          {plant.cycle && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
              {plant.cycle}
            </span>
          )}
          {plant.watering && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${wateringColour(plant.watering)}`}>
              💧 {plant.watering}
            </span>
          )}
          {plant.sunlight && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200 truncate max-w-[120px]">
              ☀️ {plant.sunlight}
            </span>
          )}
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => onAdd(plant)}
        className="flex-shrink-0 self-center px-3 py-1.5 rounded-lg bg-leaf-600 text-white text-xs font-medium
                   hover:bg-leaf-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label={`Add ${plant.commonName} to garden`}
      >
        + Add
      </button>
    </div>
  );
}

export default function PlantSearch({ onAddPlant, currentZone, onClose }) {
  const {
    query, setQuery,
    results, loading, error,
    pagination,
    nextPage, prevPage,
    clearSearch,
  } = usePlantSearch();

  function handleAdd(plant) {
    // Build a minimal plant object ready for addPlant() in gardenService
    onAddPlant({
      name:           plant.commonName,
      commonName:     plant.commonName,
      scientificName: plant.scientificName,
      emoji:          plant.emoji,
      hardinessZone:  currentZone ?? '',
      location:       '',
      customNotes:    `Added via plant search. Perenual ID: ${plant.perenualId}`,
      care:           {}, // care schedule populated by Perenual data in a future step
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-leaf-800">
          🔍 Search Plants
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="Close plant search"
          >
            ×
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Search thousands of plants from the Perenual database and add them to your garden.
      </p>

      {/* Search input */}
      <div className="relative mb-4">
        <label htmlFor="plant-search-input" className="sr-only">Search plants</label>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
          🔍
        </span>
        <input
          id="plant-search-input"
          type="search"
          placeholder="e.g. Rose, Tomato, Lavender…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-sm
                     focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent
                     placeholder:text-gray-300"
          autoFocus
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 gap-2 text-leaf-600">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Searching…</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error.message}
        </div>
      )}

      {/* Empty state — query entered but no results */}
      {!loading && !error && query.trim() && results.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <span className="text-3xl block mb-2">🌾</span>
          <p className="text-sm">No plants found for "{query}"</p>
          <p className="text-xs mt-1">Try a different name or scientific name</p>
        </div>
      )}

      {/* Prompt — no query yet */}
      {!loading && !query.trim() && (
        <div className="text-center py-8 text-gray-300">
          <span className="text-3xl block mb-2">🌱</span>
          <p className="text-sm">Start typing to search</p>
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <>
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto pr-1">
            {results.map((plant) => (
              <PlantCard key={plant.perenualId} plant={plant} onAdd={handleAdd} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.lastPage > 1 && (
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
              <button
                onClick={prevPage}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.lastPage}
                {pagination.total > 0 && ` · ${pagination.total} results`}
              </span>
              <button
                onClick={nextPage}
                disabled={pagination.currentPage >= pagination.lastPage}
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
