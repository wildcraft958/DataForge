export default function Controls({
  complexity,
  onComplexityChange,
  covered,
  onCoveredChange,
  disabled = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-navy-800/60 rounded-xl border border-navy-700/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-navy-200">
          Complexity
        </label>
        <input
          type="range"
          min={2}
          max={8}
          value={complexity}
          onChange={(e) => onComplexityChange(Number(e.target.value))}
          disabled={disabled}
          className="w-44"
        />
        <span className="text-xl font-mono font-bold text-white w-7 text-center">
          {complexity}
        </span>
        <span className="text-xs text-navy-400 font-mono">
          bars
        </span>
      </div>

      <div className="w-px h-6 bg-navy-700 hidden sm:block" />

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-navy-200">
          Coverage
        </label>
        <button
          onClick={() => onCoveredChange(!covered)}
          disabled={disabled}
          className={`
            relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300
            ${covered
              ? 'bg-pw-success/80 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
              : 'bg-pw-error/60 shadow-[0_0_12px_rgba(248,113,113,0.2)]'
            }
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-5 w-5 rounded-full bg-white transition-transform duration-300 shadow-sm
              ${covered ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        <span className={`text-sm font-semibold ${covered ? 'text-pw-success' : 'text-pw-error'}`}>
          {covered ? 'Covered' : 'Uncovered'}
        </span>
      </div>
    </div>
  )
}
