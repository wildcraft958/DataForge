export default function LiveBadge({ isLive, progress }) {
  const inferring = progress !== null
  return (
    <div className="relative flex flex-col items-end">
      <span
        className={`
          inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold font-mono
          tracking-[0.08em] border-2
          ${isLive
            ? 'bg-pw-success/10 text-pw-success border-pw-success'
            : 'bg-[#fff] text-navy-200 border-navy-700'
          }
        `}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLive ? 'bg-pw-success' : 'bg-navy-400'}`}
          style={isLive ? { animation: 'livePulse 2s ease-in-out infinite' } : {}}
        />
        {isLive ? 'LIVE' : 'PRECOMPUTED'}
        <span className="text-[11px] font-normal text-navy-500 tracking-normal hidden md:inline">
          Greedy · 1024 max
        </span>
      </span>
      {inferring && (
        <span className="absolute top-full right-0 mt-1 whitespace-nowrap text-[11px] font-mono text-pw-accent animate-pulse">
          Generating token {progress.step}/{progress.total}
        </span>
      )}
    </div>
  )
}
