const ROW_SEP_COUNT = 9
const GRID_SEP_COUNT = 1

function tokenEstimate(complexity, demoCount = 3) {
  const gridTokens = 10 * 10 + ROW_SEP_COUNT
  const demoTokens = demoCount * (gridTokens * 2 + GRID_SEP_COUNT)
  const queryTokens = gridTokens + GRID_SEP_COUNT
  return demoTokens + queryTokens
}

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
        <label htmlFor="complexity-slider" className="text-sm font-medium text-navy-200">
          Complexity
        </label>
        <input
          id="complexity-slider"
          type="range"
          min={2}
          max={8}
          value={complexity}
          onChange={(e) => onComplexityChange(Number(e.target.value))}
          disabled={disabled}
          aria-valuemin={2}
          aria-valuemax={8}
          aria-valuenow={complexity}
          aria-valuetext={`${complexity} bars`}
          className="w-44 styled-slider"
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
        <label htmlFor="coverage-toggle" className="text-sm font-medium text-navy-200">
          Coverage
        </label>
        <button
          id="coverage-toggle"
          role="switch"
          aria-checked={covered}
          aria-label="Demonstration coverage"
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

      <div className="text-[10px] font-mono text-navy-500 mt-1 ml-1">
        Context: ~{tokenEstimate(complexity)} / 1024 tokens
      </div>

      <style>{`
        .styled-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(
            to right,
            #5468FF 0%,
            #5468FF ${((complexity - 2) / 6) * 100}%,
            #1A2844 ${((complexity - 2) / 6) * 100}%,
            #1A2844 100%
          );
          outline: none;
        }
        .styled-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 0 3px #5468FF, 0 2px 6px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }
        .styled-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border: none;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 0 3px #5468FF, 0 2px 6px rgba(0, 0, 0, 0.3);
          cursor: pointer;
        }
        .styled-slider:disabled::-webkit-slider-thumb {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .styled-slider:disabled::-moz-range-thumb {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
