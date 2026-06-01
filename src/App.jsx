import { useState } from 'react';
import Header from './components/Header';
import GardenGrid from './components/GardenGrid';
import ZoneLookup from './components/ZoneLookup';
import PlantSearch from './components/PlantSearch';
import AuthGate from './components/AuthGate';
import { useGarden } from './hooks/useGarden';
import { useAuth } from './hooks/useAuth';

function Dashboard() {
  const { userMeta, addPlant }          = useGarden();
  const { user: authUser, logout }      = useAuth();

  const [confirmedZone, setConfirmedZone]     = useState(null);
  const [showZoneLookup, setShowZoneLookup]   = useState(false);
  const [showPlantSearch, setShowPlantSearch] = useState(false);

  const displayMeta = confirmedZone
    ? { ...userMeta, zipCode: confirmedZone.zipCode, hardinessZone: confirmedZone.zone }
    : userMeta;

  const currentZone = displayMeta?.hardinessZone ?? '';

  function handleZoneConfirmed(zoneData) {
    setConfirmedZone(zoneData);
    setShowZoneLookup(false);
  }

  async function handleAddPlant(plantData) {
    await addPlant({ ...plantData, hardinessZone: currentZone });
    setShowPlantSearch(false);
  }

  return (
    <div className="min-h-screen bg-leaf-50">
      <Header
        userMeta={displayMeta}
        authUser={authUser}
        onChangeZone={() => {
          setShowZoneLookup((v) => !v);
          setShowPlantSearch(false);
        }}
        onSignOut={logout}
      />

      <main className="max-w-screen-xl mx-auto px-4 py-8">

        {/* Panels row */}
        {(showZoneLookup || showPlantSearch) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {showZoneLookup && (
              <div className="w-full sm:max-w-sm">
                <ZoneLookup
                  onZoneConfirmed={handleZoneConfirmed}
                  initialZip={displayMeta?.zipCode ?? ''}
                />
              </div>
            )}
            {showPlantSearch && (
              <div className="w-full sm:max-w-md">
                <PlantSearch
                  onAddPlant={handleAddPlant}
                  currentZone={currentZone}
                  onClose={() => setShowPlantSearch(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* Page intro + Add plant button */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-leaf-800 mb-1">
              Monthly Care Plan
            </h2>
            <p className="text-gray-500 text-sm">
              Your personalised month-by-month schedule for every plant in your garden.
              Click any month to highlight it across all plants.
            </p>
          </div>
          <button
            onClick={() => {
              setShowPlantSearch((v) => !v);
              setShowZoneLookup(false);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-leaf-600 text-white
                       text-sm font-medium hover:bg-leaf-700 transition-colors shadow-sm"
          >
            <span aria-hidden="true">＋</span>
            Add plant
          </button>
        </div>

        <GardenGrid />
      </main>

      <footer className="mt-12 py-6 border-t border-leaf-100 text-center text-xs text-gray-400">
        PlantApp · {new Date().getFullYear()} · Built on AWS
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}
