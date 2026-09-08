/**
 * Complexity slider (2-8) and coverage toggle.
 */
export default function Controls({
  complexity,
  onComplexityChange,
  covered,
  onCoveredChange,
  disabled = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          Complexity
        </label>
        <input
          type="range"
          min={2}
          max={8}
          value={complexity}
          onChange={(e) => onComplexityChange(Number(e.target.value))}
          disabled={disabled}
          className="w-40 accent-blue-600"
        />
        <span className="text-lg font-mono font-bold text-gray-900 w-6 text-center">
          {complexity}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          Coverage
        </label>
        <button
          onClick={() => onCoveredChange(!covered)}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${covered ? 'bg-green-500' : 'bg-red-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 rounded-full bg-white transition-transform
              ${covered ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        <span className={`text-sm font-medium ${covered ? 'text-green-700' : 'text-red-600'}`}>
          {covered ? 'Covered' : 'Uncovered'}
        </span>
      </div>
    </div>
  )
}
