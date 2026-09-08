/**
 * Transformer KV cache visualization: a growing vertical stack of bars,
 * one per demo token added to the cache.
 */
export default function KVCacheViz({ demoCount = 0, maxSlots = 24 }) {
  const filled = Math.min(demoCount * 3, maxSlots)

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        Transformer KV Cache
      </h4>
      <div className="flex flex-col-reverse gap-0.5 h-48 w-16 bg-gray-100 rounded p-1 overflow-hidden">
        {Array.from({ length: filled }, (_, i) => (
          <div
            key={i}
            className="w-full rounded-sm transition-all duration-300"
            style={{
              height: `${100 / maxSlots}%`,
              backgroundColor: barColor(i),
              opacity: 0.8,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 font-mono text-center">
        {filled} / {maxSlots} slots
      </span>
      <p className="text-xs text-gray-400 max-w-[10rem]">
        Cost grows with each token. Attention re-reads every slot on each step.
      </p>
    </div>
  )
}

const CACHE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
]

function barColor(i) {
  return CACHE_COLORS[i % CACHE_COLORS.length]
}
