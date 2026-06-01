import { useState } from 'react';
import PlantRow from './PlantRow';
import { useGarden } from '../hooks/useGarden';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * GardenGrid
 * Fetches plant data via useGarden → gardenService → mockDb.
 * When Step 3 lands, only gardenService changes — this component stays the same.
 */
export default function GardenGrid() {
  const currentMonthIndex = new Date().getMonth();
  const currentMonth = MONTHS[currentMonthIndex];
  const [highlightMonth, setHighlightMonth] = useState(currentMonth);

  const { plants, loading, error, removePlant } = useGarden();

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section aria-label="Monthly garden care plan" aria-busy="true">
        <div className="flex items-center justify-center py-24 text-leaf-600 gap-3">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">Loading your garden…</span>
        </div>
      </section>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <section aria-label="Monthly garden care plan">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load garden data</p>
          <p className="text-red-400 text-sm">{error.message}</p>
        </div>
      </section>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (plants.length === 0) {
    return (
      <section aria-label="Monthly garden care plan">
        <div className="rounded-2xl border border-leaf-100 bg-white px-6 py-16 text-center">
          <span className="text-5xl block mb-4" aria-hidden="true">🌱</span>
          <p className="text-leaf-700 font-medium mb-1">Your garden is empty</p>
          <p className="text-gray-400 text-sm">Add your first plant to get started.</p>
        </div>
      </section>
    );
  }

  // ── Main grid ───────────────────────────────────────────────────────────────
  return (
    <section aria-label="Monthly garden care plan">

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Highlighted month:</span>
          <span className="text-xs font-semibold bg-leaf-600 text-white px-3 py-1 rounded-full">
            {highlightMonth}
          </span>
        </div>
        {highlightMonth !== currentMonth && (
          <button
            onClick={() => setHighlightMonth(currentMonth)}
            className="text-xs text-leaf-600 underline hover:text-leaf-800 transition-colors"
          >
            Reset to current month
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto hidden sm:block">
          Tap a month header to highlight it
        </span>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto rounded-2xl shadow-md border border-leaf-100 grid-scroll">
        <table className="w-full border-collapse bg-white text-sm">

          <thead>
            <tr className="bg-leaf-700 text-white">
              <th
                scope="col"
                className="sticky left-0 z-20 bg-leaf-700 px-4 py-3 text-left font-semibold min-w-[160px] border-r border-leaf-600"
              >
                Plant
              </th>
              {MONTHS.map((month, i) => (
                <th
                  key={month}
                  scope="col"
                  onClick={() => setHighlightMonth(month)}
                  className={`
                    min-w-[130px] px-2 py-3 font-semibold text-center cursor-pointer select-none
                    transition-colors duration-150
                    ${month === highlightMonth ? 'bg-leaf-400 text-leaf-900' : 'hover:bg-leaf-600'}
                  `}
                >
                  {month}
                  {i === currentMonthIndex && (
                    <span className="block text-[10px] font-normal opacity-75">now</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {plants.map((plant) => (
              <PlantRow
                key={plant.id}
                plant={plant}
                months={MONTHS}
                highlightMonth={highlightMonth}
                onRemove={removePlant}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400 text-right">
        {plants.length} plant{plants.length !== 1 ? 's' : ''} · 12 months
      </p>
    </section>
  );
}
