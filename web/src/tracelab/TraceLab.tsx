import { useEffect, useMemo, useRef, useState } from 'react';
import { loadModel } from './model/loadModel';
import { run } from './model/inference';
import type { Model, TokenTrace, Trace } from './model/types';
import { formulas } from './formulas';
import Comparison from './components/Comparison';
import { tokenize } from './model/tokenizer';
import './tracelab.css';

// Inline replacements for the lucide-react icons the standalone app used.
// Installing a package on presentation day is avoidable risk.
type IconProps = { size?: number };
const svg = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

const ChevronLeft = ({ size = 15 }: IconProps) => <svg {...svg(size)}><polyline points="15 18 9 12 15 6" /></svg>;
const ChevronRight = ({ size = 15 }: IconProps) => <svg {...svg(size)}><polyline points="9 18 15 12 9 6" /></svg>;
const Delete = ({ size = 15 }: IconProps) => <svg {...svg(size)}><path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>;
const Microscope = ({ size = 15 }: IconProps) => <svg {...svg(size)}><path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1" /><path d="M9 14h2M9 12a2 2 0 0 1-2-2V6h4v4a2 2 0 0 1-2 2zM12 6V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3" /></svg>;
const Pause = ({ size = 15 }: IconProps) => <svg {...svg(size)}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
const Play = ({ size = 15 }: IconProps) => <svg {...svg(size)} fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const RotateCcw = ({ size = 15 }: IconProps) => <svg {...svg(size)}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>;
const ScanSearch = ({ size = 15 }: IconProps) => <svg {...svg(size)}><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="3" /><path d="m16 16-1.9-1.9" /></svg>;
const Sparkles = ({ size = 13 }: IconProps) => <svg {...svg(size)}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" /></svg>;
const Trash2 = ({ size = 15 }: IconProps) => <svg {...svg(size)}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;

const examples = ['The red robot picked up the blue key. It walked toward the door.', 'The dog dropped the ball. It rolled under the table.', 'The dog chased the ball. It barked loudly.', 'Alice handed the map to Bob. He thanked Alice.'];
const wordGroups = [
  ['Pronouns', ['i', 'it', 'he', 'she']],
  ['Names', ['alice', 'bob', 'maya', 'liam', 'noah', 'emma', 'olivia']],
  ['Nouns', ['robot', 'android', 'dog', 'cat', 'fox', 'astronaut', 'key', 'ball', 'book', 'map', 'coin', 'letter', 'camera', 'box', 'door', 'table', 'desk', 'garden', 'room', 'moon', 'telescope']],
  ['Verbs', ['picked', 'walked', 'dropped', 'rolled', 'chased', 'barked', 'handed', 'gave', 'thanked', 'placed', 'opened', 'carried', 'found', 'held', 'moved', 'saw', 'looked', 'read', 'closed']],
  ['Descriptors', ['red', 'blue', 'green', 'yellow', 'small', 'big', 'loudly', 'carefully']],
  ['Connectors', ['the', 'a', 'an', 'and', 'to', 'up', 'toward', 'under', 'on', 'in', 'with', 'because', 'so', 'but', 'then', 'before', 'after']],
  ['Punctuation', ['.', ',']],
] as const;
const fmt = (v: number) => v.toFixed(3);
const Vector = ({ values, name }: { values: Float32Array; name: string }) => { const shown = [...values]; const max = Math.max(...shown.map(Math.abs), .0001); return <div className="vector visual-vector" aria-label={name}>{shown.map((v, i) => <span key={i} title={`${name}[${i}] = ${v}`} style={{ '--height': `${Math.max(8, Math.abs(v) / max * 100)}%`, '--sign': v < 0 ? '#FF6164' : '#28baff' } as React.CSSProperties}><i/ ><small>{i}</small><b>{fmt(v)}</b></span>)}<em>all {values.length}</em></div>; };
// `arriving` carries the contribution C. The cells it changes most are faded in
// on a stagger so the write reads as an event rather than three static grids.
const GHOST_CELLS = 8;

const Matrix = ({ values, rows, cols, name, arriving, animKey, onCell }: {
  values: Float32Array; rows: number; cols: number; name: string;
  arriving?: Float32Array; animKey?: string;
  onCell?: (cell: { row: number; col: number; name: string }) => void;
}) => {
  const visibleRows = Math.min(rows, 6), visibleCols = Math.min(cols, 8);
  const max = Math.max(...[...values].map(Math.abs), .0001);

  const ghostRank = useMemo(() => {
    if (!arriving) return null;
    const cells: { index: number; magnitude: number }[] = [];
    for (let r = 0; r < visibleRows; r++) for (let c = 0; c < visibleCols; c++) {
      cells.push({ index: r * visibleCols + c, magnitude: Math.abs(arriving[r * cols + c]) });
    }
    cells.sort((a, b) => b.magnitude - a.magnitude);
    const rank = new Map<number, number>();
    cells.slice(0, GHOST_CELLS).forEach((cell, order) => { if (cell.magnitude > 1e-6) rank.set(cell.index, order); });
    return rank;
  }, [arriving, cols, visibleRows, visibleCols]);

  return (
    <figure className="matrix-plot">
      <div className="matrix heatmap heatmap-8" aria-label={name} key={animKey}>
        {Array.from({ length: visibleRows * visibleCols }, (_, i) => {
          const row = Math.floor(i / visibleCols), col = i % visibleCols;
          const value = values[row * cols + col];
          const order = ghostRank?.get(i);
          return (
            <span
              key={i}
              className={order === undefined ? undefined : 'cell-arriving'}
              style={{
                opacity: .18 + Math.abs(value) / max * .82,
                background: value < 0 ? '#FF6164' : '#28baff',
                animationDelay: order === undefined ? undefined : `${order * 55}ms`,
                cursor: onCell ? 'pointer' : undefined,
              }}
              title={`${name}[${row},${col}] = ${value}`}
              onClick={onCell ? () => onCell({ row, col, name }) : undefined}
            >
              {fmt(value)}
            </span>
          );
        })}
      </div>
      <figcaption><i /> negative <i /> positive · {visibleRows}×{visibleCols} view</figcaption>
    </figure>
  );
};
// B2: the model's answer, drawn where the tokens actually are. The influence
// bars below say the same thing in numbers, but a curve between two words is
// the thing a room reads without being told how.
const PredictionArc = ({ containerRef, from, to, label }: {
  containerRef: React.RefObject<HTMLElement | null>; from: number; to: number; label: string;
}) => {
  const [geom, setGeom] = useState<{ w: number; h: number; x1: number; x2: number; y: number }>();

  useEffect(() => {
    const measure = () => {
      const host = containerRef.current;
      if (!host) return setGeom(undefined);
      const chips = host.querySelectorAll('button');
      const a = chips[from], b = chips[to];
      if (!a || !b) return setGeom(undefined);
      const base = host.getBoundingClientRect();
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      setGeom({
        w: base.width, h: base.height,
        x1: ra.left - base.left + ra.width / 2,
        x2: rb.left - base.left + rb.width / 2,
        y: ra.top - base.top,
      });
    };
    measure();
    addEventListener('resize', measure);
    const t = setTimeout(measure, 60); // after the timeline settles its scroll width
    return () => { removeEventListener('resize', measure); clearTimeout(t); };
  }, [containerRef, from, to]);

  if (!geom) return null;
  const { x1, x2, y } = geom;
  const peak = Math.max(6, y - Math.min(46, Math.abs(x2 - x1) * .28));
  const mid = (x1 + x2) / 2;

  return (
    <svg className="tl-arc" width={geom.w} height={geom.h} aria-hidden="true">
      <path d={`M ${x2} ${y} Q ${mid} ${peak} ${x1} ${y}`} />
      <circle cx={x2} cy={y} r="3.5" />
      <text x={mid} y={Math.max(9, peak - 5)} textAnchor="middle">{label}</text>
    </svg>
  );
};

const FlowOverview = ({ token, data, kind }: { token: TokenTrace; data: TokenTrace['layers'][number]; kind?: string; eventIndex: number }) => { const paths = ['M98 88 H237', 'M323 88 H372', 'M458 88 H602', 'M688 88 H742', 'M828 88 H887', 'M415 131 C415 165 645 165 645 131']; const pathFor: Record<string, number> = { embedding_lookup: 0, q_projection: 1, k_projection: 1, v_projection: 1, feature_map_q: 2, feature_map_k: 2, outer_product: 5, state_s_update: 5, state_z_update: 5, state_read_numerator: 3, state_read_denominator: 3, context_divide: 3, prediction: 4, reconstructed_influence: 4 }; const activePath = kind ? pathFor[kind] : undefined; return <section className="panel flow-overview"><h2>Live computation map</h2><svg viewBox="0 0 1000 180" role="img" aria-label="Token flows through embedding, Q K V, recurrent state, readout, and prediction"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#75d8ca"/></marker></defs>{paths.map((path, i) => <g key={path}><path className={`flow-path ${i === 5 ? 'secondary' : ''} ${i === activePath ? 'active-flow' : ''}`} d={path}/>{i === activePath && <circle className={`tensor-packet packet-${i}`} r="5"><animateMotion dur="1.35s" repeatCount="indefinite" path={path}/></circle>}</g>)}{[['TOKEN',token.token,55],['EMBED','32D',280],['Q / K / V','16 / 16 / 32',415],['S + Z','memory',645],['READ','context',785],['PREDICT','antecedent',930]].map(([label,value,x]) => <g key={String(label)} transform={`translate(${x},88)`}><circle r="43"/><text y="-4">{label}</text><text y="15" className="flow-value">{value}</text></g>)}</svg><div className="flow-caption"><span>Q strength <b style={{ width: `${Math.min(100, Math.abs(data.q[0]) * 18)}%` }}/></span><span>memory write <b style={{ width: `${Math.min(100, Math.abs(data.contribution[0]) * 30)}%` }}/></span><span>current operation: {kind ?? 'idle'}</span></div></section>; };

export default function TraceLab() {
  const [model, setModel] = useState<Model>(); const [error, setError] = useState(''); const [text, setText] = useState(examples[0]); const [trace, setTrace] = useState<Trace>(); const [step, setStep] = useState(0); const [layer, setLayer] = useState(1); const [playing, setPlaying] = useState(false); const [speed, setSpeed] = useState(1); const [difference, setDifference] = useState(false); const [microscope, setMicroscope] = useState(false); const [pinnedId, setPinnedId] = useState<string>();
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
  const [cell, setCell] = useState<{ row: number; col: number; name: string }>();
  const timelineRef = useRef<HTMLElement>(null);
  useEffect(() => { try { const m = loadModel(); setModel(m); setTrace(run(m, text)); } catch (e) { setError((e as Error).message); } }, []);
  useEffect(() => { const onResize = () => setNarrow(window.innerWidth < 900); addEventListener('resize', onResize); return () => removeEventListener('resize', onResize); }, []);
  useEffect(() => { if (!playing || !trace) return; const timer = window.setInterval(() => setStep(s => s >= trace.events.length - 1 ? (setPlaying(false), s) : s + 1), 550 / speed); return () => clearInterval(timer); }, [playing, trace, speed]);
  useEffect(() => { const keys = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') setStep(s => Math.min((trace?.events.length ?? 1) - 1, s + 1)); if (e.key === 'ArrowLeft') setStep(s => Math.max(0, s - 1)); if (e.key === ' ') { e.preventDefault(); setPlaying(value => !value); } if (e.key.toLowerCase() === 'r') setStep(0); }; addEventListener('keydown', keys); return () => removeEventListener('keydown', keys); }, [trace]);
  const event = trace?.events[step]; const tokenIndex = event?.tokenIndex ?? 0; const token = trace?.tokens[tokenIndex]; const activeLayer = Math.min(layer, (token?.layers.length ?? 1) - 1); const data = token?.layers[activeLayer];
  const inspected = trace && (pinnedId ? trace.artifacts[pinnedId] : event?.outputIds[0] ? trace.artifacts[event.outputIds[0]] : undefined);
  const prediction = useMemo(() => token?.prediction && [...token.prediction.probabilities].map((p, i) => ({ label: token.prediction!.labels[i], p })).sort((a,b) => b.p-a.p).slice(0, 4), [token]);
  const winner = useMemo(() => {
    const p = token?.prediction;
    if (!p || !p.positions.length) return undefined;
    let best = 0;
    for (let i = 1; i < p.probabilities.length; i++) if (p.probabilities[i] > p.probabilities[best]) best = i;
    return { index: p.positions[best], confidence: p.probabilities[best] };
  }, [token]);
  const requestedTokens = tokenize(text); const oovCount = requestedTokens.filter(word => !model?.vocab.includes(word)).length;
  const execute = () => { if (!model) return; const next = run(model, text); setTrace(next); setStep(0); setPlaying(false); };
  if (narrow) return <div className="tracelab"><main className="tl-narrow"><h2>The trace view needs a wider screen</h2><p>This view lays six matrices side by side to show one write into the synaptic state. It needs at least 900 pixels. Open it on a laptop, or use the coverage view, which works at any width.</p></main></div>;
  if (error) return <div className="tracelab"><main className="error">Model loading error: {error}</main></div>;
  if (!model || !trace || !data) return <div className="tracelab"><main className="loading">Loading the trained linear-attention model…</main></div>;
  const jumpPronoun = () => { const i = trace.events.findIndex(e => trace.tokens[e.tokenIndex ?? -1]?.prediction); if (i >= 0) setStep(i); };
  const renderTokens = (tokens: string[]) => tokens.join(' ').replaceAll(' .', '.').replaceAll(' ,', ',');
  const addToken = (word: string) => setText(current => renderTokens([...tokenize(current), word]));
  const removeToken = () => setText(current => renderTokens(tokenize(current).slice(0, -1)));
  return <div className="tracelab"><main>
    <header><div><p className="eyebrow">BDH SYNAPTIC WRITE · LIVE TRACE</p><h1>What the memory holds.</h1><p className="tl-sub">Every number below is computed in your browser from trained weights. The write rule is <b>S ← S + φ(K) ⊗ V</b>, the form Pathway derives in BDH Explainer Chapter 2.</p></div><div className="legend"><span className="learned">● Learned</span><span className="computed">● Computed</span><span className="reconstructed">● Reconstructed</span></div></header>
    <section className="input panel"><div className="sentence-builder" aria-label="Selected input words">{requestedTokens.length ? requestedTokens.map((word, index) => <span key={`${word}-${index}`}>{word}</span>) : <small>Choose words below</small>}</div><button className="run" onClick={execute} title="Run trace" aria-label="Run trace"><Play size={15}/><span>Run</span></button><button className="icon-button" onClick={removeToken} disabled={!requestedTokens.length} title="Remove last word" aria-label="Remove last word"><Delete size={15}/></button><button className="icon-button" onClick={() => setText('')} disabled={!requestedTokens.length} title="Clear sentence" aria-label="Clear sentence"><Trash2 size={15}/></button><select aria-label="Examples" onChange={e => { setText(e.target.value); }} value={examples.includes(text) ? text : ''}><option value="" disabled>Examples</option>{examples.concat('I saw an astronaut in the moon with a telescope.').map(x => <option key={x}>{x}</option>)}</select><small>Word bank only · max {model.config.maxLength} tokens</small><div className="word-bank" aria-label="Supported word bank">{wordGroups.map(([group, words]) => <div className="word-group" key={group}><label>{group}</label><div>{words.filter(word => model.vocab.includes(word)).map(word => <button key={word} onClick={() => addToken(word)}>{word}</button>)}</div></div>)}</div>{requestedTokens.length > model.config.maxLength && <p className="input-warning">Only the first {model.config.maxLength} tokens can be traced.</p>}</section>
    <section className="timeline panel" aria-label="Token timeline" ref={timelineRef}>{trace.tokens.map((item, i) => <button key={`${item.token}-${i}`} onClick={() => setStep(trace.events.findIndex(e => e.tokenIndex === i))} className={`${i === tokenIndex ? 'current' : i < tokenIndex ? 'processed' : ''}${winner && i === winner.index ? ' antecedent' : ''}`}>{item.token}<small>#{i}{item.oov && ' · OOV'}</small></button>)}{winner && <PredictionArc containerRef={timelineRef} from={tokenIndex} to={winner.index} label={`${(winner.confidence * 100).toFixed(0)}%`}/>}</section>
    <nav className="controls panel"><button className="icon-button" onClick={() => setStep(Math.max(0, step - 1))} title="Previous operation" aria-label="Previous operation"><ChevronLeft/></button><button className="icon-button primary" onClick={() => setPlaying(!playing)} title={playing ? 'Pause' : 'Play'} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause/> : <Play/>}</button><button className="icon-button" onClick={() => setStep(Math.min(trace.events.length - 1, step + 1))} title="Next operation" aria-label="Next operation"><ChevronRight/></button><button className="icon-button" onClick={jumpPronoun} title="Jump to pronoun" aria-label="Jump to pronoun"><ScanSearch/></button><button className="icon-button" onClick={() => setStep(0)} title="Restart" aria-label="Restart"><RotateCcw/></button><button className={`icon-button ${microscope ? 'active' : ''}`} onClick={() => setMicroscope(!microscope)} title="Toggle microscope mode" aria-label="Toggle microscope mode"><Microscope/></button><label className="speed" title="Playback speed"><Sparkles size={13}/><select aria-label="Playback speed" value={speed} onChange={e => setSpeed(+e.target.value)}><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label><span>Step {step + 1} / {trace.events.length} · {event?.shortLabel}</span></nav>
    <section className="layers"><button className={activeLayer === 0 ? 'selected' : ''} onClick={() => setLayer(0)}>Layer 1</button><span>Embedding → Layer 1 → Layer 2 → Task head</span><button className={activeLayer === 1 ? 'selected' : ''} onClick={() => setLayer(1)}>Layer 2</button></section>
    <FlowOverview token={token!} data={data} kind={event?.kind} eventIndex={step}/>
    <div className="workspace">
      <section className="panel embed"><h2>Token / Embed <b>Learned</b></h2><strong>{token?.token} <small>id {token?.id}</small></strong><Vector name="embedding" values={Float32Array.from(model.embeddings[token!.id])}/><p>Lookup row → layer input</p></section>
      <section className="panel qkv"><h2>Q / K / V laboratory <b>Computed</b></h2><div className="lanes"><div><label>Q = xWq + bq</label><Vector name="Q" values={data.q}/><label>φ(Q)</label><Vector name="phi Q" values={data.qphi}/></div><div><label>K = xWk + bk</label><Vector name="K" values={data.k}/><label>φ(K)</label><Vector name="phi K" values={data.kphi}/></div><div><label>V = xWv + bv</label><Vector name="V" values={data.v}/></div></div></section>
      <section className="panel contribution"><h2>Contribution <b>Computed</b></h2><code>C = φ(K) ⊗ V</code><Matrix name="contribution" values={data.contribution} rows={model.config.dFeature} cols={model.config.dModel} onCell={setCell}/>{(() => { const r = cell?.row ?? 0, c = cell?.col ?? 0; return microscope || cell ? <p className="tl-scope">C[{r},{c}] = φ(K)[{r}] × V[{c}] = {fmt(data.kphi[r])} × {fmt(data.v[c])} = <b>{fmt(data.contribution[r * model.config.dModel + c])}</b></p> : <p className="tl-hint">Click any cell to see the multiplication that produced it.</p>; })()}</section>
      <section className="panel readout"><h2>Read before write</h2><code>N = φ(Q)ᵀSₜ₋₁</code><Vector name="numerator" values={data.numerator}/><code>D = φ(Q)ᵀZₜ₋₁ + ε = {fmt(data.denominator)}</code><Vector name="context" values={data.context}/></section>
      <section className="panel state"><h2>State memory S / Z <b>Computed</b></h2><button className="minor" onClick={() => setDifference(!difference)}>{difference ? 'Combined state' : 'Difference view ΔS'}</button><div className="state-grid"><div><label>S before</label><Matrix name="S before" values={data.beforeS} rows={model.config.dFeature} cols={model.config.dModel}/></div><div className="plus">＋</div><div><label>C</label><Matrix name="C" values={data.contribution} rows={model.config.dFeature} cols={model.config.dModel}/></div><div className="equals">＝</div><div><label>{difference ? 'ΔS = C' : 'S after'}</label><Matrix name="S after" values={difference ? data.contribution : data.afterS} rows={model.config.dFeature} cols={model.config.dModel} arriving={data.contribution} animKey={`${tokenIndex}-${activeLayer}-${difference}`}/></div></div><label>Z before → after</label><Vector name="Z" values={data.afterZ}/><p>History: S0 → … → S{tokenIndex} ({token?.token})</p></section>
      <section className="panel prediction"><h2>Prediction / influence</h2>{prediction ? <><p>{token.prediction!.fullSentence ? 'Full-sentence resolver' : 'Causal resolver'} prediction for “{token?.token}”</p>{prediction.map(row => <div className="score" key={row.label}><span>{row.label}</span><i style={{ width: `${row.p * 100}%` }}/><strong>{(row.p * 100).toFixed(1)}%</strong></div>)}<div className="influence">{token.prediction!.influence.map((value, i) => <button key={i} title={`Reconstructed φ(Q)·φ(K): ${value.toFixed(4)}`} style={{ height: `${Math.max(8, value * 170)}px` }} onClick={() => setStep(trace.events.findIndex(e => e.tokenIndex === i))}><small>{trace.tokens[i].token}</small></button>)}</div><p className="reconstructed">{token.prediction!.fullSentence ? 'Uses a second reverse linear pass after the sentence ends; the bars above may include later entities. The chart remains forward causal influence.' : 'Reconstructed kernel influence — forward inference uses S/Z, not this history.'}</p></> : <p>Prediction activates on supported pronouns.</p>}</section>
    </div>
    <section className="panel inspector"><h2>Inspector / provenance</h2>{inspected ? <><strong>{inspected.label} <b className={inspected.source}>{inspected.source}</b></strong><p>shape [{inspected.shape.join(' × ') || 'scalar'}] · token {inspected.tokenIndex ?? '—'} · layer {(inspected.layerIndex ?? -1) + 1 || '—'}</p><Vector name={inspected.label} values={typeof inspected.values === 'number' ? new Float32Array([inspected.values]) : inspected.values}/><p>Parents</p><div className="parents">{(inspected.parentIds ?? []).length ? inspected.parentIds!.map(id => <button key={id} onClick={() => setPinnedId(id)}>{trace.artifacts[id]?.label ?? id}</button>) : 'No prior tensor: learned parameter or trace root.'}</div><button className="minor" onClick={() => setPinnedId(undefined)}>Follow active operation</button></> : <p>Select an operation to inspect its output and lineage.</p>}<p className="event-links">Active inputs: {event?.inputIds.map(id => <button key={id} onClick={() => setPinnedId(id)}>{trace.artifacts[id]?.label ?? id}</button>)}</p></section>
    <Comparison/><footer className="formula"><strong>{formulas[event?.formulaKey ?? 'tokenize'].math}</strong><small>{formulas[event?.formulaKey ?? 'tokenize'].detail}</small></footer>
  </main></div>;
}
