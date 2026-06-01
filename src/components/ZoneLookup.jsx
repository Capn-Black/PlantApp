/**
 * ZoneLookup
 *
 * Zip code → USDA hardiness zone lookup form.
 * Calls useZoneLookup hook which routes through gardenService → getZone Lambda.
 *
 * Props:
 *   onZoneConfirmed - (zoneData) => void  called when user clicks "Use this zone"
 *   initialZip      - string  pre-fills the input (from saved user metadata)
 */

import { useState } from 'react';
import { useZoneLookup } from '../hooks/useZoneLookup';

// Map zone string to a friendly colour for the badge
function zoneColour(zone = '') {
  const num = parseInt(zone, 10);
  if (num <= 4)  return 'bg-blue-100   text-blue-800   border-blue-200';
  if (num <= 6)  return 'bg-sky-100    text-sky-800    border-sky-200';
  if (num <= 8)  return 'bg-green-100  text-green-800  border-green-200';
  if (num <= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return             'bg-orange-100 text-orange-800 border-orange-200';
}

export default function ZoneLookup({ onZoneConfirmed, initialZip = '' }) {
  const [zip, setZip] = useState(initialZip);
  const { zoneData, loading, error, lookupZone, clearZone } = useZoneLookup();

  function handleSubmit(e) {
    e.preventDefault();
    lookupZone(zip.trim());
  }

  function handleConfirm() {
    if (zoneData && onZoneConfirmed) {
      onZoneConfirmed(zoneData);
      clearZone();
    }
  }

  function handleZipChange(e) {
    // Only allow digits, max 5
    const val = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZip(val);
    if (zoneData) clearZone(); // reset result when user edits zip
  }

  return (
    <div className="bg-white rounded-2xl border border-leaf-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-leaf-800 mb-1">
        🗺️ Find Your Hardiness Zone
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Enter your US zip code to get your USDA Plant Hardiness Zone.
        This helps tailor care schedules to your local climate.
      </p>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <label htmlFor="zip-input" className="sr-only">US Zip Code</label>
        <input
          id="zip-input"
          type="text"
          inputMode="numeric"
          placeholder="e.g. 92128"
          value={zip}
          onChange={handleZipChange}
          maxLength={5}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-leaf-400 focus:border-transparent
                     placeholder:text-gray-300"
          aria-label="US zip code"
        />
        <button
          type="submit"
          disabled={loading || zip.length !== 5}
          className="px-4 py-2 rounded-lg bg-leaf-600 text-white text-sm font-medium
                     hover:bg-leaf-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Looking up…
            </>
          ) : (
            'Look up'
          )}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
        >
          {error.message}
        </div>
      )}

      {/* Result card */}
      {zoneData && !error && (
        <div className="rounded-xl border border-leaf-100 bg-leaf-50 p-4 space-y-3">

          {/* Zone badge + zip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl font-bold px-3 py-1 rounded-xl border ${zoneColour(zoneData.zone)}`}
                aria-label={`Hardiness zone ${zoneData.zone}`}
              >
                {zoneData.zone}
              </span>
              <div>
                <p className="text-sm font-semibold text-leaf-800">
                  USDA Zone {zoneData.zone}
                </p>
                <p className="text-xs text-gray-400">Zip code {zoneData.zipCode}</p>
              </div>
            </div>
          </div>

          {/* Temperature range */}
          {zoneData.temperature_range && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>🌡️</span>
              <span>Average annual minimum: <strong>{zoneData.temperature_range}</strong></span>
            </div>
          )}

          {/* Coordinates */}
          {zoneData.coordinates && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>📍</span>
              <span>
                {zoneData.coordinates.lat?.toFixed(2)}°N,{' '}
                {Math.abs(zoneData.coordinates.lon)?.toFixed(2)}°W
              </span>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            className="w-full mt-1 py-2 rounded-lg bg-leaf-600 text-white text-sm font-medium
                       hover:bg-leaf-700 transition-colors"
          >
            Use Zone {zoneData.zone} for my garden
          </button>
        </div>
      )}
    </div>
  );
}
