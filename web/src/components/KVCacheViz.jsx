export default function KVCacheViz({ demoCount = 0, maxSlots = 24 }) {
  const filled = Math.min(demoCount * 3, maxSlots)

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-navy-300 tracking-wide">
        Transformer KV Cache
      </h4>
      <div className="flex flex-col-reverse gap-0.5 h-48 w-16 bg-navy-800/50 rounded-lg p-1.5 overflow-hidden border border-navy-700/30">
        {Array.from({ length: filled }, (_, i) => (
          <div
            key={i}
            className="w-full rounded-sm transition-all duration-300"
            style={{
              height: `${100 / maxSlots}%`,
              backgroundColor: barColor(i),
              opacity: 0.85,
              boxShadow: `0 0 4px ${barColor(i)}40`,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-navy-400 font-mono text-center">
        {filled} / {maxSlots} slots
      </span>
      <p className="text-xs text-navy-500 max-w-[10rem] leading-relaxed">
        Cost grows with each token. Attention re-reads every slot on each step.
      </p>
    </div>
  )
}

const CACHE_COLORS = [
  '#5468FF', '#34D399', '#F59E0B', '#F87171',
  '#A855F7', '#EC4899', '#06B6D4', '#84CC16',
]

function barColor(i) {
  return CACHE_COLORS[i % CACHE_COLORS.length]
}
