import TaskBadge from './TaskBadge';

/**
 * PlantRow
 * One row in the care grid.
 * Receives `months` as a prop (from GardenGrid) so it has no data dependencies.
 */
export default function PlantRow({ plant, months, highlightMonth, onRemove }) {
  return (
    <tr className="border-b border-leaf-100 hover:bg-leaf-50 transition-colors duration-150 group">

      {/* Plant identity — sticky left */}
      <td className="sticky left-0 z-10 bg-white min-w-[160px] px-4 py-3 border-r border-leaf-100 group-hover:bg-leaf-50 transition-colors duration-150">
        <div className="flex items-start gap-2">
          <span className="text-2xl leading-none select-none mt-0.5" aria-hidden="true">
            {plant.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-leaf-800 text-sm leading-tight truncate">
              {plant.name}
            </p>
            <p className="text-xs text-gray-400 truncate italic">
              {plant.scientificName}
            </p>
            <p className="text-xs text-gray-400 truncate">
              📍 {plant.location}
            </p>
            {/* Remove button — only visible on row hover */}
            {onRemove && (
              <button
                onClick={() => onRemove(plant.id)}
                className="mt-1 text-[10px] text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${plant.name} from garden`}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </td>

      {/* Month cells */}
      {months.map((month) => {
        const tasks = plant.care[month] ?? [];
        const isHighlighted = month === highlightMonth;

        return (
          <td
            key={month}
            className={`
              min-w-[130px] px-2 py-2 align-top transition-colors duration-150
              ${isHighlighted ? 'bg-leaf-100' : ''}
            `}
          >
            {tasks.length > 0 ? (
              <div className="flex flex-col gap-1">
                {tasks.map((task, i) => (
                  <TaskBadge key={i} task={task} />
                ))}
              </div>
            ) : (
              <span className="text-gray-200 text-lg select-none" aria-hidden="true">·</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}
