/**
 * Displays whether the current output is LIVE (ONNX) or PRECOMPUTED.
 */
export default function LiveBadge({ isLive }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
        ${isLive
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-amber-100 text-amber-800 border border-amber-300'
        }
      `}
    >
      <span
        className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-amber-500'}`}
      />
      {isLive ? 'Live' : 'Precomputed'}
    </span>
  )
}
