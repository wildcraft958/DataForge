export default function LiveBadge({ isLive }) {
  return (
    <span
      className={`
        inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide
        ${isLive
          ? 'bg-pw-success/10 text-pw-success border border-pw-success/30'
          : 'bg-navy-800/60 text-navy-300 border border-navy-700/50'
        }
      `}
    >
      <span
        className={`w-2 h-2 rounded-full ${isLive ? 'bg-pw-success' : 'bg-navy-400'}`}
        style={isLive ? { animation: 'livePulse 2s ease-in-out infinite' } : {}}
      />
      {isLive ? 'LIVE' : 'PRECOMPUTED'}
    </span>
  )
}
