/**
 * TaskBadge
 * Renders a single care task as a colour-coded pill.
 * Colour is derived from the leading emoji / keyword in the task string.
 */

const COLOUR_MAP = [
  { match: /✂️|prune|deadhead|pinch/i,   cls: 'bg-rose-100 text-rose-700 border-rose-200' },
  { match: /🌱|fertilize|feed|compost/i,  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { match: /💧|water/i,                   cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  { match: /🍅|harvest/i,                 cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  { match: /🌿|transplant|plant/i,        cls: 'bg-green-100 text-green-700 border-green-200' },
  { match: /🪵|mulch/i,                   cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  { match: /🪝|stake|cage/i,              cls: 'bg-teal-100 text-teal-700 border-teal-200' },
  { match: /🔍|check|monitor/i,           cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  { match: /dormant/i,                    cls: 'bg-gray-100 text-gray-400 border-gray-200' },
];

function getColour(task) {
  const match = COLOUR_MAP.find(({ match }) => match.test(task));
  return match ? match.cls : 'bg-slate-100 text-slate-600 border-slate-200';
}

export default function TaskBadge({ task }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border leading-snug ${getColour(task)}`}
    >
      {task}
    </span>
  );
}
