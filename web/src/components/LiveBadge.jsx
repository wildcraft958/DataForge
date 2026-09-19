export default function LiveBadge({ isLive, progress }) {
  const inferring = progress !== null
  return (
    <div className="flex flex-col items-end gap-1">
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
        <span className="text-[9px] font-normal text-navy-400 tracking-normal">
          Greedy · 1024 max
        </span>
      </span>
      {inferring && (
        <span className="text-[10px] font-mono text-pw-accent/70 animate-pulse">
          Generating token {progress.step}/{progress.total}
        </span>
      )}
    </div>
  )
}
