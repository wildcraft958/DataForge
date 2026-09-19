export default function KVCacheViz({ demoCount = 0, maxSlots = 24 }) {
  const filled = Math.min(demoCount * 3, maxSlots)

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-[280px]">
      <div className="bg-navy-800/60 border border-navy-700/40 rounded-2xl p-6">
        <h4 className="text-base font-bold text-white tracking-wide mb-1">
          Transformer KV Cache
        </h4>
        <p className="text-sm text-navy-300 mb-4">
          Each token adds a key-value pair. Cost grows linearly.
        </p>
        <div className="flex flex-col-reverse gap-1 h-72 w-full bg-navy-900/60 rounded-xl p-3 overflow-hidden border border-navy-700/20">
          {Array.from({ length: filled }, (_, i) => (
            <div
              key={i}
              className="w-full rounded transition-all duration-300"
              style={{
                height: `${100 / maxSlots}%`,
                backgroundColor: barColor(i),
                opacity: 0.9,
                boxShadow: `0 0 8px ${barColor(i)}50`,
              }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white font-mono">
            {filled}
            <span className="text-base text-navy-400 font-normal"> / {maxSlots} slots</span>
          </span>
          <span className="text-xs text-navy-400 font-mono">
            {filled > 0 ? `${(filled / maxSlots * 100).toFixed(0)}% full` : 'empty'}
          </span>
        </div>
        <p className="text-sm text-navy-400 mt-3 leading-relaxed">
          Attention re-reads every stored slot on each step.
          More demonstrations means more memory and more compute.
        </p>
        <p className="text-xs text-navy-500 mt-2 italic">
          Illustrative. Token count estimated from demo count, not from live KV tensors.
        </p>
      </div>
    </div>
  )
}

const CACHE_COLORS = [
  '#1e6bdd', '#15803D', '#F59E0B', '#D6383B',
  '#A855F7', '#DB2777', '#0a85eb', '#65A30D',
]

function barColor(i) {
  return CACHE_COLORS[i % CACHE_COLORS.length]
}
