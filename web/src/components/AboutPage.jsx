import { useEffect } from 'react'

function ArchDiagram() {
  const boxes = [
    { x: 20, label: 'Demo Pairs', sub: '3 input/output grids', color: '#5468FF' },
    { x: 170, label: 'Tokenizer', sub: 'Grid to sequence', color: '#6D7EFF' },
    { x: 320, label: 'Transformer', sub: '6 layers, 4.2M params', color: '#06B6D4' },
    { x: 470, label: 'Decoder', sub: 'Autoregressive', color: '#06B6D4' },
    { x: 620, label: 'Output Grid', sub: 'Predicted sort order', color: '#22C55E' },
  ]
  const w = 770
  const h = 100
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-2xl" role="img" aria-label="Model architecture: demo pairs go through tokenizer, transformer, decoder, to output grid">
      {boxes.map((b, i) => (
        <g key={b.label}>
          <rect x={b.x} y={16} width={120} height={54} rx={10} fill={b.color + '18'} stroke={b.color + '60'} strokeWidth={1.5} />
          <text x={b.x + 60} y={38} textAnchor="middle" fill={b.color} fontSize={11} fontWeight={600} fontFamily="Inter, system-ui, sans-serif">{b.label}</text>
          <text x={b.x + 60} y={56} textAnchor="middle" fill="#8B9DC3" fontSize={9} fontFamily="Inter, system-ui, sans-serif">{b.sub}</text>
          {i < boxes.length - 1 && (
            <g>
              <line x1={b.x + 120} y1={43} x2={boxes[i + 1].x} y2={43} stroke="#3B4F7A" strokeWidth={1.5} />
              <polygon points={`${boxes[i + 1].x},43 ${boxes[i + 1].x - 6},39 ${boxes[i + 1].x - 6},47`} fill="#3B4F7A" />
            </g>
          )}
        </g>
      ))}
      <text x={w / 2} y={90} textAnchor="middle" fill="#4A5E83" fontSize={10} fontFamily="Inter, system-ui, sans-serif">
        Query input appended after demos. Model predicts output grid token by token.
      </text>
    </svg>
  )
}

function CoverageDiagram() {
  return (
    <svg viewBox="0 0 640 210" className="w-full max-w-2xl" role="img" aria-label="Covered vs uncovered: same query, different demonstrations, different results">
      <text x={320} y={16} textAnchor="middle" fill="#8B9DC3" fontSize={10} fontWeight={600} fontFamily="Inter, system-ui, sans-serif" letterSpacing={1}>SAME QUERY, DIFFERENT DEMONSTRATIONS</text>

      {/* Covered path */}
      <rect x={20} y={32} width={280} height={160} rx={14} fill="#22C55E08" stroke="#22C55E30" strokeWidth={1} />
      <text x={160} y={52} textAnchor="middle" fill="#22C55E" fontSize={11} fontWeight={700} fontFamily="Inter, system-ui, sans-serif">COVERED</text>

      <rect x={36} y={64} width={100} height={40} rx={8} fill="#22C55E14" stroke="#22C55E40" strokeWidth={1} />
      <text x={86} y={80} textAnchor="middle" fill="#86EFAC" fontSize={9} fontFamily="Inter, system-ui, sans-serif">Demos include</text>
      <text x={86} y={94} textAnchor="middle" fill="#86EFAC" fontSize={9} fontWeight={600} fontFamily="Inter, system-ui, sans-serif">8-bar example</text>

      <line x1={136} y1={84} x2={162} y2={84} stroke="#22C55E50" strokeWidth={1.5} />
      <polygon points="162,84 156,80 156,88" fill="#22C55E50" />

      <rect x={162} y={64} width={60} height={40} rx={8} fill="#06B6D414" stroke="#06B6D440" strokeWidth={1} />
      <text x={192} y={80} textAnchor="middle" fill="#67E8F9" fontSize={9} fontFamily="Inter, system-ui, sans-serif">Model</text>
      <text x={192} y={94} textAnchor="middle" fill="#67E8F9" fontSize={9} fontFamily="Inter, system-ui, sans-serif">sees pattern</text>

      <line x1={222} y1={84} x2={248} y2={84} stroke="#22C55E50" strokeWidth={1.5} />
      <polygon points="248,84 242,80 242,88" fill="#22C55E50" />

      <rect x={248} y={70} width={40} height={28} rx={6} fill="#22C55E20" stroke="#22C55E60" strokeWidth={1.5} />
      <text x={268} y={89} textAnchor="middle" fill="#22C55E" fontSize={14} fontWeight={700} fontFamily="Inter, system-ui, sans-serif">✓</text>

      <text x={160} y={130} textAnchor="middle" fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">The model sees how 8 bars are sorted.</text>
      <text x={160} y={144} textAnchor="middle" fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">It applies the same rule to the query.</text>

      {/* Bar chart for covered */}
      {[2, 3, 5, 4, 6, 7, 8].map((h, i) => (
        <rect key={`c${i}`} x={62 + i * 16} y={152 + (8 - h) * 3} width={10} height={h * 3} rx={2}
          fill={h === 8 ? '#22C55E' : '#22C55E40'} />
      ))}
      <text x={118} y={182} textAnchor="middle" fill="#4A5E83" fontSize={8} fontFamily="Inter, system-ui, sans-serif">demo complexities</text>

      {/* Uncovered path */}
      <rect x={340} y={32} width={280} height={160} rx={14} fill="#EF444408" stroke="#EF444430" strokeWidth={1} />
      <text x={480} y={52} textAnchor="middle" fill="#EF4444" fontSize={11} fontWeight={700} fontFamily="Inter, system-ui, sans-serif">UNCOVERED</text>

      <rect x={356} y={64} width={100} height={40} rx={8} fill="#EF444414" stroke="#EF444440" strokeWidth={1} />
      <text x={406} y={80} textAnchor="middle" fill="#FCA5A5" fontSize={9} fontFamily="Inter, system-ui, sans-serif">Demos only show</text>
      <text x={406} y={94} textAnchor="middle" fill="#FCA5A5" fontSize={9} fontWeight={600} fontFamily="Inter, system-ui, sans-serif">2-3 bar examples</text>

      <line x1={456} y1={84} x2={482} y2={84} stroke="#EF444450" strokeWidth={1.5} />
      <polygon points="482,84 476,80 476,88" fill="#EF444450" />

      <rect x={482} y={64} width={60} height={40} rx={8} fill="#06B6D414" stroke="#06B6D440" strokeWidth={1} />
      <text x={512} y={80} textAnchor="middle" fill="#67E8F9" fontSize={9} fontFamily="Inter, system-ui, sans-serif">Model</text>
      <text x={512} y={94} textAnchor="middle" fill="#67E8F9" fontSize={9} fontFamily="Inter, system-ui, sans-serif">no reference</text>

      <line x1={542} y1={84} x2={568} y2={84} stroke="#EF444450" strokeWidth={1.5} />
      <polygon points="568,84 562,80 562,88" fill="#EF444450" />

      <rect x={568} y={70} width={40} height={28} rx={6} fill="#EF444420" stroke="#EF444460" strokeWidth={1.5} />
      <text x={588} y={89} textAnchor="middle" fill="#EF4444" fontSize={14} fontWeight={700} fontFamily="Inter, system-ui, sans-serif">✗</text>

      <text x={480} y={130} textAnchor="middle" fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">The model never saw 8 bars being sorted.</text>
      <text x={480} y={144} textAnchor="middle" fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">It still has the capability, but cannot apply it.</text>

      {/* Bar chart for uncovered */}
      {[2, 3, 2].map((h, i) => (
        <rect key={`u${i}`} x={430 + i * 16} y={152 + (8 - h) * 3} width={10} height={h * 3} rx={2}
          fill="#EF444440" />
      ))}
      <rect x={430 + 3 * 16} y={152 + (8 - 8) * 3} width={10} height={8 * 3} rx={2}
        fill="none" stroke="#EF444440" strokeWidth={1} strokeDasharray="2 2" />
      <text x={458} y={182} textAnchor="middle" fill="#4A5E83" fontSize={8} fontFamily="Inter, system-ui, sans-serif">demo complexities (query = 8)</text>
    </svg>
  )
}

function HebbianDiagram() {
  return (
    <svg viewBox="0 0 520 170" className="w-full max-w-lg" role="img" aria-label="Hebbian write and read equations visualized as matrix operations">
      {/* Write */}
      <text x={18} y={20} fill="#D946EF" fontSize={11} fontWeight={700} fontFamily="Inter, system-ui, sans-serif">Write (store a demo)</text>
      <rect x={18} y={30} width={230} height={56} rx={10} fill="#D946EF08" stroke="#D946EF30" strokeWidth={1} />

      <rect x={30} y={40} width={36} height={36} rx={4} fill="#D946EF18" stroke="#D946EF40" strokeWidth={1} />
      <text x={48} y={62} textAnchor="middle" fill="#E879F9" fontSize={10} fontWeight={600} fontFamily="JetBrains Mono, monospace">{'σ'}</text>

      <text x={78} y={62} textAnchor="middle" fill="#8B9DC3" fontSize={14} fontFamily="JetBrains Mono, monospace">=</text>

      <rect x={92} y={40} width={36} height={36} rx={4} fill="#D946EF18" stroke="#D946EF40" strokeWidth={1} />
      <text x={110} y={62} textAnchor="middle" fill="#E879F9" fontSize={10} fontWeight={600} fontFamily="JetBrains Mono, monospace">{'σ'}</text>

      <text x={140} y={62} textAnchor="middle" fill="#8B9DC3" fontSize={14} fontFamily="JetBrains Mono, monospace">+</text>

      <rect x={154} y={44} width={16} height={28} rx={3} fill="#5468FF18" stroke="#5468FF40" strokeWidth={1} />
      <text x={162} y={62} textAnchor="middle" fill="#93A3FF" fontSize={8} fontWeight={600} fontFamily="JetBrains Mono, monospace">x</text>
      <text x={162} y={52} textAnchor="middle" fill="#93A3FF" fontSize={6} fontFamily="JetBrains Mono, monospace">T</text>

      <text x={180} y={62} textAnchor="middle" fill="#8B9DC3" fontSize={10} fontFamily="JetBrains Mono, monospace">{'×'}</text>

      <rect x={192} y={48} width={42} height={16} rx={3} fill="#06B6D418" stroke="#06B6D440" strokeWidth={1} />
      <text x={213} y={60} textAnchor="middle" fill="#67E8F9" fontSize={8} fontWeight={600} fontFamily="JetBrains Mono, monospace">v</text>

      {/* Read */}
      <text x={288} y={20} fill="#06B6D4" fontSize={11} fontWeight={700} fontFamily="Inter, system-ui, sans-serif">Read (answer a query)</text>
      <rect x={288} y={30} width={210} height={56} rx={10} fill="#06B6D408" stroke="#06B6D430" strokeWidth={1} />

      <rect x={302} y={48} width={42} height={16} rx={3} fill="#06B6D418" stroke="#06B6D440" strokeWidth={1} />
      <text x={323} y={60} textAnchor="middle" fill="#67E8F9" fontSize={8} fontWeight={600} fontFamily="JetBrains Mono, monospace">o</text>

      <text x={356} y={62} textAnchor="middle" fill="#8B9DC3" fontSize={14} fontFamily="JetBrains Mono, monospace">=</text>

      <rect x={370} y={48} width={42} height={16} rx={3} fill="#5468FF18" stroke="#5468FF40" strokeWidth={1} />
      <text x={391} y={60} textAnchor="middle" fill="#93A3FF" fontSize={8} fontWeight={600} fontFamily="JetBrains Mono, monospace">x</text>

      <text x={424} y={62} textAnchor="middle" fill="#8B9DC3" fontSize={10} fontFamily="JetBrains Mono, monospace">{'×'}</text>

      <rect x={438} y={40} width={36} height={36} rx={4} fill="#D946EF18" stroke="#D946EF40" strokeWidth={1} />
      <text x={456} y={62} textAnchor="middle" fill="#E879F9" fontSize={10} fontWeight={600} fontFamily="JetBrains Mono, monospace">{'σ'}</text>

      {/* Labels */}
      <text x={18} y={110} fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">
        {'σ'} = synaptic weight matrix (16 x 16)
      </text>
      <text x={18} y={125} fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">
        x = input vector (demo or query encoded to 16 dims)
      </text>
      <text x={18} y={140} fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">
        v = value vector (demo output encoded to 16 dims)
      </text>
      <text x={18} y={160} fill="#6B7B9E" fontSize={8} fontStyle="italic" fontFamily="Inter, system-ui, sans-serif">
        Simplified illustration. Omits low-rank compression, positional operators, and gating.
      </text>
    </svg>
  )
}

function TokenizerDiagram() {
  const colors = ['#172A4A', '#3B82F6', '#EF4444', '#22C55E', '#EAB308', '#9CA3AF', '#D946EF', '#F97316', '#06B6D4', '#A855F7']
  const exampleRow = [0, 0, 3, 0, 1, 0, 0, 2, 0, 0]
  const tokenLabels = ['0', '0', '3', '0', '1', '0', '0', '2', '0', '0', 'RS']
  return (
    <svg viewBox="0 0 540 110" className="w-full max-w-lg" role="img" aria-label="Grid row tokenized to a sequence of color indices with a row separator">
      <text x={10} y={14} fill="#8B9DC3" fontSize={10} fontWeight={600} fontFamily="Inter, system-ui, sans-serif">Grid row</text>
      {exampleRow.map((v, i) => (
        <rect key={i} x={10 + i * 20} y={22} width={18} height={18} rx={3} fill={colors[v]} stroke="#1A2844" strokeWidth={0.8} />
      ))}

      <path d="M230,32 L250,32" stroke="#3B4F7A" strokeWidth={1.5} />
      <polygon points="250,32 244,28 244,36" fill="#3B4F7A" />

      <text x={264} y={14} fill="#8B9DC3" fontSize={10} fontWeight={600} fontFamily="Inter, system-ui, sans-serif">Token sequence</text>
      {tokenLabels.map((t, i) => (
        <g key={i}>
          <rect x={264 + i * 24} y={22} width={20} height={20} rx={4}
            fill={t === 'RS' ? '#F9731618' : colors[parseInt(t)] + '30'}
            stroke={t === 'RS' ? '#F97316' + '60' : '#3B4F7A'}
            strokeWidth={1} />
          <text x={264 + i * 24 + 10} y={36} textAnchor="middle"
            fill={t === 'RS' ? '#F97316' : '#8B9DC3'}
            fontSize={t === 'RS' ? 7 : 9} fontWeight={t === 'RS' ? 700 : 400}
            fontFamily="JetBrains Mono, monospace">{t}</text>
        </g>
      ))}

      <text x={10} y={66} fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">
        Each cell becomes its color index (0-9). ROW_SEP (10) separates rows.
      </text>
      <text x={10} y={80} fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">
        GRID_SEP (11) separates grids. PAD (12) fills to max length.
      </text>
      <text x={10} y={96} fill="#4A5E83" fontSize={9} fontFamily="Inter, system-ui, sans-serif">
        Full task: [demo1_in RS ... GS demo1_out GS ... query_in] = ~776 tokens.
      </text>
    </svg>
  )
}

function LadderChart() {
  const data = [
    { x: 2, y: 36, max: 36 },
    { x: 3, y: 36, max: 36 },
    { x: 4, y: 36, max: 36 },
    { x: 5, y: 36, max: 36 },
    { x: 6, y: 29, max: 36 },
    { x: 7, y: 8, max: 24 },
    { x: 8, y: 1, max: 24 },
  ]
  const chartW = 340
  const chartH = 140
  const padL = 34
  const padB = 22
  const padT = 22
  const barW = 28
  const gap = (chartW - padL - data.length * barW) / (data.length + 1)

  function yPos(val) {
    return padT + (chartH - padT - padB) * (1 - val / 36)
  }

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + 10}`} className="w-full max-w-sm" role="img" aria-label="BDH-CQ ladder experiment: ordering pass rate drops sharply at length 6 through 8">
      {/* Y axis */}
      <line x1={padL} y1={padT} x2={padL} y2={chartH - padB} stroke="#1A2844" strokeWidth={1} />
      {[0, 12, 24, 36].map(v => (
        <g key={v}>
          <line x1={padL - 4} y1={yPos(v)} x2={padL} y2={yPos(v)} stroke="#2A4570" strokeWidth={1} />
          <text x={padL - 8} y={yPos(v) + 3} textAnchor="end" fill="#4A5E83" fontSize={8} fontFamily="JetBrains Mono, monospace">{v}</text>
          <line x1={padL} y1={yPos(v)} x2={chartW} y2={yPos(v)} stroke="#1A284440" strokeWidth={0.5} strokeDasharray="3 3" />
        </g>
      ))}
      {/* X axis */}
      <line x1={padL} y1={chartH - padB} x2={chartW} y2={chartH - padB} stroke="#1A2844" strokeWidth={1} />

      {/* Bars */}
      {data.map((d, i) => {
        const bx = padL + gap + i * (barW + gap)
        const ratio = d.y / d.max
        const barColor = ratio >= 0.9 ? '#22C55E' : ratio >= 0.5 ? '#EAB308' : '#EF4444'
        return (
          <g key={d.x}>
            <rect x={bx} y={yPos(d.y)} width={barW} height={yPos(0) - yPos(d.y)} rx={4} fill={barColor + '40'} stroke={barColor + '80'} strokeWidth={1} />
            <text x={bx + barW / 2} y={yPos(d.y) - 4} textAnchor="middle" fill={barColor} fontSize={8} fontWeight={600} fontFamily="JetBrains Mono, monospace">{d.y}/{d.max}</text>
            <text x={bx + barW / 2} y={chartH - padB + 12} textAnchor="middle" fill="#6B7B9E" fontSize={9} fontFamily="Inter, system-ui, sans-serif">{d.x}</text>
          </g>
        )
      })}
      <text x={chartW / 2} y={chartH + 8} textAnchor="middle" fill="#4A5E83" fontSize={8} fontFamily="Inter, system-ui, sans-serif">Ordering length (BDH-CQ ladder experiment, arXiv:2608.09888)</text>
    </svg>
  )
}

export default function AboutPage({ onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/98 backdrop-blur-md overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-mono text-pw-cyan tracking-wider mb-1">DataForge 2026</p>
            <h1 className="text-2xl font-bold text-white">Demonstration Coverage and Extrapolation</h1>
          </div>
          <button
            onClick={onClose}
            className="text-navy-400 hover:text-white transition-colors text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-700/50 hover:border-navy-600"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Close <span className="text-navy-500 text-xs ml-1">Esc</span>
          </button>
        </div>

        {/* Hypothesis */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Hypothesis</h2>
          <div className="rounded-xl border border-pw-blue/20 bg-pw-blue/[0.04] px-5 py-4 mb-4">
            <p className="text-base text-navy-100 leading-relaxed font-medium">
              A model that learns a rule from demonstrations applies it only within the complexity
              range those demonstrations covered. Adding a single demonstration at the harder level
              restores performance.
            </p>
          </div>
          <p className="text-sm text-navy-300 leading-relaxed">
            This is not a claim about model size, training data, or architecture. It is a claim
            about the relationship between what the model sees at inference time and what it can do.
          </p>
        </section>

        {/* Architecture */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Model Architecture</h2>
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/30 p-5 mb-5 overflow-x-auto">
            <ArchDiagram />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { val: '6', label: 'Layers' },
              { val: '8', label: 'Attn Heads' },
              { val: '256', label: 'd_model' },
              { val: '4.2M', label: 'Parameters' },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-navy-700/40 bg-navy-900/30 px-4 py-3 text-center">
                <div className="text-xl font-bold text-white font-mono">{s.val}</div>
                <div className="text-xs text-navy-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Vocabulary', '13 tokens (colors 0-9, ROW_SEP, GRID_SEP, PAD)'],
                  ['Max sequence', '1024 tokens (~776 per task)'],
                  ['Training data', '~10,000 tasks, complexity 2-8, all covered'],
                  ['Optimizer', 'AdamW, lr 3e-4, cosine warmup'],
                  ['Batch size', '32'],
                  ['Training', '~30 epochs on a T4 GPU'],
                ].map(([label, value], i) => (
                  <tr key={label} className={i % 2 === 0 ? 'bg-navy-800/20' : ''}>
                    <td className="px-4 py-2 text-navy-400 font-mono text-xs w-36">{label}</td>
                    <td className="px-4 py-2 text-navy-200">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tokenization */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Tokenization</h2>
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/30 p-5 overflow-x-auto">
            <TokenizerDiagram />
          </div>
        </section>

        {/* Coverage vs Uncovered */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Covered vs Uncovered</h2>
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/30 p-5 mb-4 overflow-x-auto">
            <CoverageDiagram />
          </div>
          <p className="text-sm text-navy-300 leading-relaxed">
            The query grid stays identical between conditions. Only the demonstrations change.
            The model trains on all complexities with covered demonstrations, so it has the
            capability. The variable is whether the inference-time demonstrations reach the
            query difficulty.
          </p>
        </section>

        {/* Meta-Learning and Scale */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Meta-Learning and Scale</h2>
          <div className="rounded-xl border border-pw-blue/20 bg-pw-blue/[0.04] px-5 py-4 mb-4">
            <p className="text-sm text-navy-200 leading-relaxed mb-3">
              In-context learning is implicit meta-learning. Von Oswald et al.{' '}
              <span className="text-pw-cyan font-mono text-xs">arXiv:2212.07677, ICML 2023</span>{' '}
              showed that a transformer forward pass implements gradient-descent-style weight updates
              on its internal representations. The demonstrations are not passive context. They are a
              training signal processed in a single pass.
            </p>
            <p className="text-sm text-navy-200 leading-relaxed mb-3">
              Min et al.{' '}
              <span className="text-pw-cyan font-mono text-xs">arXiv:2202.12837, EMNLP 2022</span>{' '}
              found that the distribution of demonstrations matters more than label correctness. This
              predicts the coverage cliff: what breaks in-context learning is not wrong examples but
              missing difficulty levels.
            </p>
            <p className="text-sm text-navy-200 leading-relaxed">
              The same problem appears at frontier scale. GPT-6 Astra (OpenAI, Sep 2026) and Claude
              Opus 5 (Anthropic, 2026) both use in-context learning. When a user provides examples
              that do not cover the difficulty of the actual question, the same coverage failure
              applies. Our 4.2M toy model makes the effect visible. Frontier models make it
              consequential.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-navy-700/30 bg-navy-900/20 px-4 py-3 text-center">
              <div className="text-lg font-bold text-white font-mono">4.2M</div>
              <div className="text-xs text-navy-400 mt-0.5">Our toy model</div>
              <div className="text-xs text-navy-500 mt-1">100pp coverage gap</div>
            </div>
            <div className="rounded-lg border border-navy-700/30 bg-navy-900/20 px-4 py-3 text-center">
              <div className="text-lg font-bold text-white font-mono">150M</div>
              <div className="text-xs text-navy-400 mt-0.5">BDH-CQ</div>
              <div className="text-xs text-navy-500 mt-1">Same cliff, same task</div>
            </div>
            <div className="rounded-lg border border-navy-700/30 bg-navy-900/20 px-4 py-3 text-center">
              <div className="text-lg font-bold text-white font-mono">Frontier</div>
              <div className="text-xs text-navy-400 mt-0.5">GPT-6 Astra, Opus 5</div>
              <div className="text-xs text-navy-500 mt-1">Same mechanism</div>
            </div>
          </div>
        </section>

        {/* Precomputed-first */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Precomputed-First Design</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 rounded-xl border border-navy-700/40 bg-navy-900/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PRECOMPUTED</span>
              </div>
              <p className="text-xs text-navy-300 leading-relaxed">
                Predictions generated offline from the same model weights. Always available.
                The UI works from the first page load.
              </p>
            </div>
            <div className="flex items-center justify-center text-navy-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="hidden sm:block">
                <path d="M5 12h14M15 7l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="sm:hidden rotate-90">
                <path d="M5 12h14M15 7l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 rounded-xl border border-navy-700/40 bg-navy-900/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LIVE</span>
              </div>
              <p className="text-xs text-navy-300 leading-relaxed">
                ONNX Runtime loads the model in the browser. When ready, the badge flips and
                live predictions replace precomputed. The badge is always honest.
              </p>
            </div>
          </div>
        </section>

        {/* Week 1 Gate */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Week 1 Gate</h2>
          <p className="text-sm text-navy-200 leading-relaxed mb-4">
            Before building the interface, we validated that the trained model shows a coverage cliff.
          </p>
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700/40">
                  <th className="px-4 py-2.5 text-left text-xs font-mono text-navy-400">Metric at complexity 8</th>
                  <th className="px-4 py-2.5 text-left text-xs font-mono text-navy-400">Threshold</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-navy-800/20">
                  <td className="px-4 py-2.5 text-navy-200">Covered exact match</td>
                  <td className="px-4 py-2.5 text-emerald-400 font-mono font-bold">&#8805; 50%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-navy-200">Uncovered exact match</td>
                  <td className="px-4 py-2.5 text-red-400 font-mono font-bold">&#8804; 20%</td>
                </tr>
                <tr className="bg-navy-800/20">
                  <td className="px-4 py-2.5 text-navy-200">Gap</td>
                  <td className="px-4 py-2.5 text-pw-cyan font-mono font-bold">&#8805; 30pp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* BDH Connection */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">BDH Connection</h2>
          <p className="text-sm text-navy-200 leading-relaxed mb-5">
            BDH-CQ (arXiv:2608.09888) shows the same coverage cliff at a larger scale. The ladder
            experiment reveals a gradual falloff in the ordering task family:
          </p>
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/30 p-5 mb-5 flex justify-center overflow-x-auto">
            <LadderChart />
          </div>
          <p className="text-sm text-navy-300 leading-relaxed mb-5">
            Saturated through length 5, then a sharp drop. Our toy model reproduces this shape at
            a smaller scale.
          </p>

          <h3 className="text-sm font-semibold text-navy-200 mb-3">Hebbian Memory (Simplified)</h3>
          <div className="rounded-xl border border-navy-700/40 bg-navy-900/30 p-5 overflow-x-auto">
            <HebbianDiagram />
          </div>
        </section>

        {/* Task Family */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Task Family</h2>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex-1">
              <p className="text-sm text-navy-200 leading-relaxed mb-3">
                The ordering task: colored bars of varying heights on a 10x10 grid. The rule is to
                sort bars left-to-right by ascending height.
              </p>
              <p className="text-sm text-navy-300 leading-relaxed">
                Complexity = number of bars (2 through 8). Sorting is unambiguous, visually readable,
                and scales in difficulty with bar count. A human can see whether the output is correct
                at a glance.
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-navy-700/40 bg-navy-900/30 p-4">
              <svg viewBox="0 0 128 80" width={128} height={80} role="img" aria-label="Example: 4 colored bars unsorted becoming sorted by height">
                <text x={30} y={10} textAnchor="middle" fill="#6B7B9E" fontSize={7} fontFamily="Inter, system-ui, sans-serif">Input</text>
                <text x={94} y={10} textAnchor="middle" fill="#6B7B9E" fontSize={7} fontFamily="Inter, system-ui, sans-serif">Output</text>
                {/* Input bars (unsorted) */}
                {[
                  { x: 8, h: 40, c: '#3B82F6' },
                  { x: 22, h: 20, c: '#EF4444' },
                  { x: 36, h: 55, c: '#22C55E' },
                  { x: 50, h: 30, c: '#EAB308' },
                ].map((b, i) => (
                  <rect key={`i${i}`} x={b.x} y={75 - b.h} width={10} height={b.h} rx={2} fill={b.c} opacity={0.85} />
                ))}
                {/* Arrow */}
                <line x1={64} y1={45} x2={72} y2={45} stroke="#3B4F7A" strokeWidth={1.5} />
                <polygon points="72,45 68,42 68,48" fill="#3B4F7A" />
                {/* Output bars (sorted) */}
                {[
                  { x: 76, h: 20, c: '#EF4444' },
                  { x: 90, h: 30, c: '#EAB308' },
                  { x: 104, h: 40, c: '#3B82F6' },
                  { x: 118, h: 55, c: '#22C55E' },
                ].map((b, i) => (
                  <rect key={`o${i}`} x={b.x - 4} y={75 - b.h} width={10} height={b.h} rx={2} fill={b.c} opacity={0.85} />
                ))}
              </svg>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Limitations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '⚖️', text: 'The toy model is ~4.2M parameters. BDH-CQ operates at billions.' },
              { icon: '📄', text: 'We did not run BDH-CQ. All numbers are developer-reported from arXiv:2608.09888.' },
              { icon: '🧩', text: 'The ordering task is one family. Coverage sensitivity varies across task types.' },
              { icon: '⏱️', text: 'Adaptation is session-scoped. The model does not retain demonstrations across sessions.' },
              { icon: '🔬', text: 'The Hebbian module is a simplified illustration, not the full BDH architecture.' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3 rounded-lg border border-navy-700/30 bg-navy-900/20 px-4 py-3">
                <span className="text-base leading-none mt-0.5 shrink-0">{icon}</span>
                <span className="text-xs text-navy-300 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Citations */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-pw-cyan mb-4">Key References</h2>
          <div className="flex flex-col gap-2">
            {[
              ['BDH-CQ Report', 'arXiv:2608.09888', 'Table 3, ladder experiments (developer-reported)'],
              ['Dragon Hatchling', 'arXiv:2509.26507', 'Architecture, Hebbian derivation'],
              ['Coconut', 'arXiv:2412.06769', 'Latent reasoning baseline'],
              ['Von Oswald et al.', 'arXiv:2212.07677', 'ICL as implicit meta-learning (ICML 2023)'],
              ['Min et al.', 'arXiv:2202.12837', 'Demo distribution over label correctness (EMNLP 2022)'],
              ['HRM', 'arXiv:2506.21734', 'Adaptation by optimization (contrast)'],
              ['Transformer Explainer', 'CHI 2026', 'Design precedent (live ONNX in browser)'],
            ].map(([name, ref, note]) => (
              <div key={name} className="flex items-baseline gap-3 text-sm">
                <span className="text-navy-200 font-medium shrink-0 w-40">{name}</span>
                <span className="text-pw-cyan font-mono text-xs shrink-0">{ref}</span>
                <span className="text-navy-400 text-xs">{note}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-navy-800 pt-6 flex items-center justify-between">
          <span className="text-xs text-navy-500">
            DataForge 2026, Pathway Track
          </span>
          <span className="text-xs text-navy-500">
            Team NamoFans
          </span>
        </footer>
      </div>
    </div>
  )
}
