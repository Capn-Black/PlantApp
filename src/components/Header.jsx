/**
 * Header
 *
 * Props:
 *   userMeta     - { zipCode, hardinessZone } from service layer
 *   authUser     - { email } from Cognito / mock auth
 *   onChangeZone - () => void  toggles the ZoneLookup panel
 *   onSignOut    - () => void
 */
export default function Header({ userMeta, authUser, onChangeZone, onSignOut }) {
  return (
    <header className="bg-leaf-700 text-white shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between gap-4">

        {/* Logo + title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-3xl leading-none" aria-hidden="true">🌱</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">PlantApp</h1>
            <p className="text-xs text-leaf-200 leading-tight">Garden Care Planner</p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 text-sm min-w-0">

          {/* Zone info */}
          {userMeta && (
            <div className="hidden md:flex items-center gap-2 text-leaf-200 text-xs">
              <span>📍 {userMeta.zipCode}</span>
              <span className="text-leaf-400">·</span>
              <span>Zone {userMeta.hardinessZone}</span>
            </div>
          )}

          {/* Change zone button */}
          <button
            onClick={onChangeZone}
            className="text-xs bg-leaf-600 hover:bg-leaf-500 transition-colors
                       px-3 py-1.5 rounded-lg font-medium whitespace-nowrap"
            aria-label={userMeta ? 'Change hardiness zone' : 'Set your hardiness zone'}
          >
            {userMeta ? 'Change zone' : 'Set zone'}
          </button>

          {/* User email + sign out */}
          {authUser && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:block text-xs text-leaf-200 truncate max-w-[140px]" title={authUser.email}>
                {authUser.email}
              </span>
              <button
                onClick={onSignOut}
                className="text-xs text-leaf-300 hover:text-white transition-colors whitespace-nowrap"
                aria-label="Sign out"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
