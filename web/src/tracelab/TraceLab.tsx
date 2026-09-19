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
//
// One 24x24 grid, one stroke weight, one pair of terminals. Outlines stroke at
// 1.75 with round caps and joins; the two transport glyphs are solid so the
// primary action reads first at 15px. Geometry is lucide's, scaled about the
// centre of the box so every glyph sits inside the same optical margin.
type IconProps = { size?: number };
const line = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});
const solid = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor', stroke: 'currentColor',
  strokeWidth: 2, strokeLinejoin: 'round' as const, 'aria-hidden': true,
});

const ChevronLeft = ({ size = 15 }: IconProps) => <svg {...line(size)}><path d="M14.7 17.4 9.3 12l5.4-5.4" /></svg>;
const ChevronRight = ({ size = 15 }: IconProps) => <svg {...line(size)}><path d="M9.3 6.6 14.7 12l-5.4 5.4" /></svg>;
const Delete = ({ size = 15 }: IconProps) => <svg {...line(size)}><path d="M18.4 5.2H9.8L3.6 12l6.2 6.8h8.6a2 2 0 0 0 2-2V7.2a2 2 0 0 0-2-2z" /><path d="M16.4 9.8 11.8 14.4M11.8 9.8l4.6 4.6" /></svg>;
const Microscope = ({ size = 15 }: IconProps) => <svg {...line(size)}><path d="M6.9 17.1h6.8" /><path d="M4.4 20.5h15.3" /><path d="M13.7 20.5a5.95 5.95 0 1 0 0-11.9h-.85" /><path d="M9.5 13.7h1.7" /><path d="M9.5 12a1.7 1.7 0 0 1-1.7-1.7V6.9h3.4v3.4A1.7 1.7 0 0 1 9.5 12z" /><path d="M12 6.9V4.4a.85.85 0 0 0-.85-.85H9.5a.85.85 0 0 0-.85.85v2.5" /></svg>;
const Pause = ({ size = 15 }: IconProps) => <svg {...solid(size)} strokeWidth={1.6}><rect x="7.6" y="5.8" width="3" height="12.4" rx="1" /><rect x="13.4" y="5.8" width="3" height="12.4" rx="1" /></svg>;
const Play = ({ size = 15 }: IconProps) => <svg {...solid(size)}><path d="M7.9 5.3 18.4 12 7.9 18.7z" /></svg>;
const RotateCcw = ({ size = 15 }: IconProps) => <svg {...line(size)}><path d="M4.35 12a7.65 7.65 0 1 0 7.65-7.65 8.29 8.29 0 0 0-5.73 2.33L4.35 8.6" /><path d="M4.35 4.35v4.25H8.6" /></svg>;
const ScanSearch = ({ size = 15 }: IconProps) => <svg {...line(size)}><path d="M4 8.6V6.2A2.2 2.2 0 0 1 6.2 4h2.4M15.4 4h2.4A2.2 2.2 0 0 1 20 6.2v2.4M20 15.4v2.4a2.2 2.2 0 0 1-2.2 2.2h-2.4M8.6 20H6.2A2.2 2.2 0 0 1 4 17.8v-2.4" /><circle cx="11.3" cy="11.3" r="3.1" /><path d="m13.6 13.6 3 3" /></svg>;
const Sparkles = ({ size = 13 }: IconProps) => <svg {...line(size)}><path d="M12 4.2l-1.657 5.038a1.73 1.73 0 0 1-1.105 1.105L4.2 12l5.038 1.657a1.73 1.73 0 0 1 1.105 1.105L12 19.8l1.657-5.038a1.73 1.73 0 0 1 1.105-1.105L19.8 12l-5.038-1.657a1.73 1.73 0 0 1-1.105-1.105z" /></svg>;
const Trash2 = ({ size = 15 }: IconProps) => <svg {...line(size)}><path d="M4.1 6.7h15.8" /><path d="M8.5 6.7V5a1.8 1.8 0 0 1 1.8-1.8h3.5A1.8 1.8 0 0 1 15.6 5v1.7" /><path d="M18.2 6.7v12.3a1.8 1.8 0 0 1-1.8 1.8H7.6a1.8 1.8 0 0 1-1.8-1.8V6.7" /><path d="M10.2 11.1v5.3M13.8 11.1v5.3" /></svg>;

// Pathway's wordmark, inlined from the deck (deck/slides.jsx, PathwayLogo) so
// this view needs no network. Monochrome by design: it recolours, never tints.
const PathwayLogo = ({ h = 18, color = '#000000' }: { h?: number; color?: string }) => (
  <svg viewBox="0 0 650 190" height={h} width={h * (650 / 190)} fill={color} role="img" aria-label="Pathway" className="tl-wordmark">
    <path d="M215,120h-5a10,10,0,0,1-10-10V45a5,5,0,0,0-5-5H185A5,5,0,0,0,181,42.07,30,30,0,0,0,170,40H160a30,30,0,0,0-30,30v40a30,30,0,0,0,30,30h10a30,30,0,0,0,20-7.64A30,30,0,0,0,210,140h5a5,5,0,0,0,5-5V125A5,5,0,0,0,215,120Zm-35-10a10,10,0,0,1-10,10H160a10,10,0,0,1-10-10h0V70a10,10,0,0,1,10-10h10a10,10,0,0,1,10,10Z" />
    <path d="M90,40H80A30,30,0,0,0,50,70v50H35a5,5,0,0,0-5,5v10a5,5,0,0,0,5,5H50v20a10,10,0,0,1-10,10H35a5,5,0,0,0-5,5v10a5,5,0,0,0,5,5h5a30,30,0,0,0,30-30V140H90a30,30,0,0,0,30-30V70A30,30,0,0,0,90,40Zm10,70a10,10,0,0,1-10,10H70V70A10,10,0,0,1,80,60H90a10,10,0,0,1,10,10Z" />
    <rect y="120" width="20" height="20" rx="5" />
    <path d="M265,40H250V5a5,5,0,0,0-5-5H235a5,5,0,0,0-5,5V40H215a5,5,0,0,0-5,5V55a5,5,0,0,0,5,5h15v75a5,5,0,0,0,5,5h10a5,5,0,0,0,5-5V60h15a5,5,0,0,0,5-5V45A5,5,0,0,0,265,40Z" />
    <path d="M645,40H635a5,5,0,0,0-5,5v75H610a10,10,0,0,1-10-10h0V45a5,5,0,0,0-5-5H585a5,5,0,0,0-5,5v65a30,30,0,0,0,30,30h20v10a10,10,0,0,1-10,10H585a5,5,0,0,0-5,5v10a5,5,0,0,0,5,5h35a30,30,0,0,0,30-30V45A5,5,0,0,0,645,40Z" />
    <path d="M475,40H465a5,5,0,0,0-5,5v75H440a10,10,0,0,1-10-10h0V45a5,5,0,0,0-5-5H415a5,5,0,0,0-5,5v75H390a10,10,0,0,1-10-10h0V45a5,5,0,0,0-5-5H365a5,5,0,0,0-5,5v65a30,30,0,0,0,30,30h35a5,5,0,0,0,4.05-2.07A30,30,0,0,0,440,140h35a5,5,0,0,0,5-5V45A5,5,0,0,0,475,40Z" />
    <path d="M580,125a5,5,0,0,0-5-5h-5a10,10,0,0,1-10-10V45a5,5,0,0,0-5-5H545a5,5,0,0,0-4,2.07A30,30,0,0,0,530,40H520a30,30,0,0,0-30,30v40a30,30,0,0,0,30,30h10a30,30,0,0,0,20-7.64A30,30,0,0,0,570,140h5a5,5,0,0,0,5-5Zm-40-15a10,10,0,0,1-10,10H520a10,10,0,0,1-10-10h0V70a10,10,0,0,1,10-10h10a10,10,0,0,1,10,10Z" />
    <path d="M320,40H300V5a5,5,0,0,0-5-5H285a5,5,0,0,0-5,5V135a5,5,0,0,0,5,5h10a5,5,0,0,0,5-5V60h20a10,10,0,0,1,10,10v65a5,5,0,0,0,5,5h10a5,5,0,0,0,5-5V70A30,30,0,0,0,320,40Z" />
  </svg>
);

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
// A vector whose values are all non-negative (a feature map, for instance) gets
// a baseline on the floor so the bars use the full height. A signed vector gets
// the baseline through the middle, so the sign is readable from its side of the
// line as well as from its colour.
const Vector = ({ values, name }: { values: Float32Array; name: string }) => {
  const shown = [...values];
  const max = Math.max(...shown.map(Math.abs), .0001);
  const signed = shown.some(v => v < 0);
  return (
    <div className={`vector visual-vector${signed ? ' signed' : ''}`} aria-label={name}>
      {shown.map((v, i) => (
        <span
          key={i}
          title={`${name}[${i}] = ${v}`}
          data-neg={v < 0 ? '' : undefined}
          style={{ '--height': `${Math.max(signed ? 4 : 8, Math.abs(v) / max * 100)}%`, '--sign': v < 0 ? '#FF6164' : '#28baff' } as React.CSSProperties}
        >
          <i /><small>{i}</small><b>{fmt(v)}</b>
        </span>
      ))}
      <em>all {values.length}</em>
    </div>
  );
};
// `arriving` carries the contribution C. The cells it changes most are faded in
// on a stagger so the write reads as an event rather than three static grids.
const GHOST_CELLS = 8;

const Matrix = ({ values, rows, cols, name, arriving, animKey, onCell, selected }: {
  values: Float32Array; rows: number; cols: number; name: string;
  arriving?: Float32Array; animKey?: string;
  onCell?: (cell: { row: number; col: number; name: string }) => void;
  selected?: { row: number; col: number; name: string };
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
          const isSelected = selected?.name === name && selected.row === row && selected.col === col;
          return (
            <span
              key={i}
              className={[order === undefined ? '' : 'cell-arriving', isSelected ? 'cell-selected' : ''].filter(Boolean).join(' ') || undefined}
              style={{
                opacity: .18 + Math.abs(value) / max * .82,
                background: value < 0 ? '#FF6164' : '#28baff',
                animationDelay: order === undefined ? undefined : `${order * 55}ms`,
                cursor: onCell ? 'pointer' : undefined,
              }}
              title={`${name}[${row},${col}] = ${value}`}
              role={onCell ? 'button' : undefined}
              tabIndex={onCell ? 0 : undefined}
              aria-label={onCell ? `${name} row ${row} column ${col}, value ${value.toFixed(3)}` : undefined}
              onClick={onCell ? () => onCell({ row, col, name }) : undefined}
              onKeyDown={onCell ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCell({ row, col, name }); }
              } : undefined}
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
// One readout for every clickable matrix. Which arithmetic to show depends on
// which matrix was clicked: a contribution cell decomposes into the product
// that made it, a post-write state cell into the sum. Handoff section 58.13
// asks that any important number can be traced, and the state panel is the
// one the spec calls most important.
const CellScope = ({ cell, data, dModel, fallback }: {
  cell?: { row: number; col: number; name: string };
  data: TokenTrace['layers'][number]; dModel: number; fallback: string;
}) => {
  if (!cell) return <p className="tl-hint">{fallback}</p>;
  const { row: r, col: c, name } = cell;
  const at = (m: Float32Array) => m[r * dModel + c];

  if (name === 'S after') return (
    <p className="tl-scope">
      S[{r},{c}] = S<sub>before</sub>[{r},{c}] + C[{r},{c}] ={' '}
      {fmt(at(data.beforeS))} + {fmt(at(data.contribution))} = <b>{fmt(at(data.afterS))}</b>
    </p>
  );
  if (name === 'S before') return (
    <p className="tl-scope">
      S<sub>before</sub>[{r},{c}] = <b>{fmt(at(data.beforeS))}</b>, the sum of every earlier write into this cell.
    </p>
  );
  return (
    <p className="tl-scope">
      C[{r},{c}] = φ(K)[{r}] × V[{c}] = {fmt(data.kphi[r])} × {fmt(data.v[c])} = <b>{fmt(at(data.contribution))}</b>
    </p>
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

// The map of everything below it: six bordered stages in the deck's card
// language, joined by short arrows. `pathFor` maps an operation to the edge it
// travels; the stage that edge arrives at is the one that lights. The write
// branch from Q/K/V back into S is the one curve, kept dashed and violet so it
// reads as the secondary path it is.
const FLOW_BOX = 148, FLOW_GAP = 38, FLOW_X0 = 11, FLOW_STEP = FLOW_BOX + FLOW_GAP;
const stageLeft = (i: number) => FLOW_X0 + i * FLOW_STEP;
const stageMid = (i: number) => stageLeft(i) + FLOW_BOX / 2;

const FlowOverview = ({ token, data, kind }: { token: TokenTrace; data: TokenTrace['layers'][number]; kind?: string; eventIndex: number }) => {
  const pathFor: Record<string, number> = { embedding_lookup: 0, q_projection: 1, k_projection: 1, v_projection: 1, feature_map_q: 2, feature_map_k: 2, outer_product: 5, state_s_update: 5, state_z_update: 5, state_read_numerator: 3, state_read_denominator: 3, context_divide: 3, prediction: 4, reconstructed_influence: 4 };
  const activePath = kind ? pathFor[kind] : undefined;
  const activeStage = activePath === undefined ? undefined : activePath === 5 ? 3 : activePath + 1;
  const stages: [string, string][] = [['TOKEN', token.token], ['EMBED', '32D'], ['Q / K / V', '16 / 16 / 32'], ['S + Z', 'memory'], ['READ', 'context'], ['PREDICT', 'antecedent']];

  return (
    <section className="panel flow-overview">
      <h2>Live computation map <b className="pres">Presentation</b></h2>
      <svg viewBox="0 0 1100 134" role="img" aria-label="Token flows through embedding, Q K V, recurrent state, readout, and prediction">
        <defs>
          {[['tl-tip', '#c8c8c8'], ['tl-tip-on', '#1e6bdd'], ['tl-tip-write', '#C061FF']].map(([id, stroke]) => (
            <marker key={id} id={id} markerWidth="7" markerHeight="7" refX="4.6" refY="3.5" orient="auto">
              <path d="M1 1 4.6 3.5 1 6" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          ))}
        </defs>

        {[0, 1, 2, 3, 4].map(i => (
          <line
            key={i}
            className={`tl-edge${i === activePath ? ' on' : ''}`}
            x1={stageLeft(i) + FLOW_BOX + 6} y1={44}
            x2={stageLeft(i + 1) - 9} y2={44}
            markerEnd={`url(#${i === activePath ? 'tl-tip-on' : 'tl-tip'})`}
          />
        ))}

        <path className={`tl-edge tl-write${activePath === 5 ? ' on' : ''}`} d={`M${stageMid(2)} 84 C${stageMid(2)} 114 ${stageMid(3)} 114 ${stageMid(3)} 86`} markerEnd="url(#tl-tip-write)" />
        <text className="tl-write-label" x={(stageMid(2) + stageMid(3)) / 2} y={129}>write</text>

        {stages.map(([label, value], i) => (
          <g key={label} className={`tl-stage${i === activeStage ? ' on' : ''}`}>
            <rect x={stageLeft(i)} y={8} width={FLOW_BOX} height={72} rx={16} />
            <text className="tl-stage-label" x={stageMid(i)} y={32}>{label}</text>
            <text className="tl-stage-value" x={stageMid(i)} y={58}>{value}</text>
          </g>
        ))}
      </svg>
      <div className="flow-caption">
        <span>Q strength <i className="meter"><b style={{ width: `${Math.min(100, Math.abs(data.q[0]) * 18)}%` }} /></i></span>
        <span>memory write <i className="meter"><b style={{ width: `${Math.min(100, Math.abs(data.contribution[0]) * 30)}%` }} /></i></span>
        <span className="op">current operation: {kind ?? 'idle'}</span>
        <span className="pres-note">Boxes and arrows are a fixed diagram. The two bars and the highlight are live.</span>
      </div>
    </section>
  );
};

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
  const requestedTokens = tokenize(text);
  const execute = () => { if (!model) return; const next = run(model, text); setTrace(next); setStep(0); setPlaying(false); };
  if (narrow) return <div className="tracelab"><main className="tl-narrow"><h2>The trace view needs a wider screen</h2><p>This view lays six matrices side by side to show one write into the synaptic state. It needs at least 900 pixels. Open it on a laptop, or use the coverage view, which works at any width.</p></main></div>;
  if (error) return <div className="tracelab"><main className="error">Model loading error: {error}</main></div>;
  if (!model || !trace || !data) return <div className="tracelab"><main className="loading">Loading the trained linear-attention model…</main></div>;
  const jumpPronoun = () => { const i = trace.events.findIndex(e => trace.tokens[e.tokenIndex ?? -1]?.prediction); if (i >= 0) setStep(i); };
  const renderTokens = (tokens: string[]) => tokens.join(' ').replaceAll(' .', '.').replaceAll(' ,', ',');
  const addToken = (word: string) => setText(current => renderTokens([...tokenize(current), word]));
  const removeToken = () => setText(current => renderTokens(tokenize(current).slice(0, -1)));
  return <div className="tracelab"><main>
    <header><div><p className="eyebrow">BDH SYNAPTIC WRITE · LIVE TRACE</p><h1>What the memory holds.</h1><p className="tl-sub">Every number below is computed in your browser from trained weights. The write rule is <b>S ← S + φ(K) ⊗ V</b>, the form Pathway derives in BDH Explainer Chapter 2.</p></div><div className="tl-brand"><PathwayLogo/><div className="legend"><span className="learned">● Learned</span><span className="computed">● Computed</span><span className="reconstructed">● Reconstructed</span><span className="presentation">● Presentation</span></div></div></header>

    {/* Composing tool, not a permanent fixture: sentence, run and examples on
        one row, with the word bank behind a disclosure. */}
    <section className="input panel"><div className="sentence-builder" aria-label="Selected input words">{requestedTokens.length ? requestedTokens.map((word, index) => <span key={`${word}-${index}`}>{word}</span>) : <small>Choose words below</small>}</div><button className="run" onClick={execute} title="Run trace" aria-label="Run trace"><Play size={15}/><span>Run</span></button><button className="icon-button" onClick={removeToken} disabled={!requestedTokens.length} title="Remove last word" aria-label="Remove last word"><Delete size={15}/></button><button className="icon-button" onClick={() => setText('')} disabled={!requestedTokens.length} title="Clear sentence" aria-label="Clear sentence"><Trash2 size={15}/></button><select aria-label="Examples" onChange={e => { setText(e.target.value); }} value={examples.includes(text) ? text : ''}><option value="" disabled>Examples</option>{examples.concat('I saw an astronaut in the moon with a telescope.').map(x => <option key={x}>{x}</option>)}</select><details className="wordbank"><summary><small>Word bank only · max {model.config.maxLength} tokens</small></summary><div className="word-bank" aria-label="Supported word bank">{wordGroups.map(([group, words]) => <div className="word-group" key={group}><label>{group}</label><div>{words.filter(word => model.vocab.includes(word)).map(word => <button key={word} onClick={() => addToken(word)}>{word}</button>)}</div></div>)}</div></details>{requestedTokens.length > model.config.maxLength && <p className="input-warning">Only the first {model.config.maxLength} tokens can be traced.</p>}</section>

    <FlowOverview token={token!} data={data} kind={event?.kind} eventIndex={step}/>

    <section className="timeline panel" aria-label="Token timeline" ref={timelineRef}>{trace.tokens.map((item, i) => <button key={`${item.token}-${i}`} onClick={() => setStep(trace.events.findIndex(e => e.tokenIndex === i))} className={`${i === tokenIndex ? 'current' : i < tokenIndex ? 'processed' : ''}${winner && i === winner.index ? ' antecedent' : ''}`}>{item.token}<small>#{i}{item.oov && ' · OOV'}</small></button>)}{winner && <PredictionArc containerRef={timelineRef} from={tokenIndex} to={winner.index} label={`${(winner.confidence * 100).toFixed(0)}%`}/>}</section>

    <div className="tl-transport">
      <nav className="controls panel"><button className="icon-button" onClick={() => setStep(Math.max(0, step - 1))} title="Previous operation" aria-label="Previous operation"><ChevronLeft/></button><button className="icon-button primary" onClick={() => setPlaying(!playing)} title={playing ? 'Pause' : 'Play'} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause/> : <Play/>}</button><button className="icon-button" onClick={() => setStep(Math.min(trace.events.length - 1, step + 1))} title="Next operation" aria-label="Next operation"><ChevronRight/></button><button className="icon-button" onClick={jumpPronoun} title="Jump to pronoun" aria-label="Jump to pronoun"><ScanSearch/></button><button className="icon-button" onClick={() => setStep(0)} title="Restart" aria-label="Restart"><RotateCcw/></button><button className={`icon-button ${microscope ? 'active' : ''}`} onClick={() => setMicroscope(!microscope)} title="Toggle microscope mode" aria-label="Toggle microscope mode"><Microscope/></button><label className="speed" title="Playback speed"><Sparkles size={13}/><select aria-label="Playback speed" value={speed} onChange={e => setSpeed(+e.target.value)}><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label><span>Step {step + 1} / {trace.events.length} · {event?.shortLabel}</span></nav>
      <footer className="formula"><strong>{formulas[event?.formulaKey ?? 'tokenize'].math}</strong><small>{formulas[event?.formulaKey ?? 'tokenize'].detail}</small></footer>
    </div>

    <section className="layers"><button className={activeLayer === 0 ? 'selected' : ''} onClick={() => setLayer(0)}>Layer 1</button><span>Embedding → Layer 1 → Layer 2 → Task head</span><button className={activeLayer === 1 ? 'selected' : ''} onClick={() => setLayer(1)}>Layer 2</button></section>

    {/* Panels in the order the computation runs: embed, project, form the
        contribution, write it into S, read it back, then predict. */}
    <div className="workspace">
      <section className="panel embed"><h2>Token / Embed <b>Learned</b></h2><strong>{token?.token} <small>id {token?.id}</small></strong><Vector name="embedding" values={Float32Array.from(model.embeddings[token!.id])}/><p>Lookup row → layer input</p></section>
      <section className="panel qkv"><h2>Q / K / V laboratory <b>Computed</b></h2><div className="lanes"><div><label>Q = xWq + bq</label><Vector name="Q" values={data.q}/><label>φ(Q)</label><Vector name="phi Q" values={data.qphi}/></div><div><label>K = xWk + bk</label><Vector name="K" values={data.k}/><label>φ(K)</label><Vector name="phi K" values={data.kphi}/></div><div><label>V = xWv + bv</label><Vector name="V" values={data.v}/></div></div></section>
      <section className="panel contribution"><h2>Contribution <b>Computed</b></h2><code>C = φ(K) ⊗ V</code><Matrix name="contribution" values={data.contribution} rows={model.config.dFeature} cols={model.config.dModel} onCell={setCell} selected={cell}/><CellScope cell={cell ?? (microscope ? { row: 0, col: 0, name: 'contribution' } : undefined)} data={data} dModel={model.config.dModel} fallback="Click any cell to see the multiplication that produced it."/></section>
      <section className="panel state"><h2>State memory S / Z <b>Computed</b></h2><button className="minor" onClick={() => setDifference(!difference)}>{difference ? 'Combined state' : 'Difference view ΔS'}</button><div className="state-grid"><div><label>S before</label><Matrix name="S before" values={data.beforeS} rows={model.config.dFeature} cols={model.config.dModel} onCell={setCell} selected={cell}/></div><div className="plus">＋</div><div><label>C</label><Matrix name="C" values={data.contribution} rows={model.config.dFeature} cols={model.config.dModel} onCell={setCell} selected={cell}/></div><div className="equals">＝</div><div><label>{difference ? 'ΔS = C' : 'S after'}</label><Matrix name={difference ? 'C' : 'S after'} values={difference ? data.contribution : data.afterS} rows={model.config.dFeature} cols={model.config.dModel} arriving={data.contribution} animKey={`${tokenIndex}-${activeLayer}-${difference}`} onCell={setCell} selected={cell}/></div></div><CellScope cell={cell} data={data} dModel={model.config.dModel} fallback="Click any cell in S before, C or S after to see the arithmetic behind it."/><label>Z before → after</label><Vector name="Z" values={data.afterZ}/><p>History: S0 → … → S{tokenIndex} ({token?.token})</p></section>
      <section className="panel readout"><h2>Read before write</h2><code>N = φ(Q)ᵀSₜ₋₁</code><Vector name="numerator" values={data.numerator}/><code>D = φ(Q)ᵀZₜ₋₁ + ε = {fmt(data.denominator)}</code><Vector name="context" values={data.context}/></section>
      <section className={`panel prediction${prediction ? '' : ' resting'}`}><h2>Prediction / influence</h2>{prediction ? <><p>{token.prediction!.fullSentence ? 'Full-sentence resolver' : 'Causal resolver'} prediction for “{token?.token}”</p>{prediction.map(row => <div className="score" key={row.label}><span>{row.label}</span><em className="score-rail"><i style={{ width: `${row.p * 100}%` }}/></em><strong>{(row.p * 100).toFixed(1)}%</strong></div>)}<div className="influence">{token.prediction!.influence.map((value, i) => <button key={i} title={`Reconstructed φ(Q)·φ(K): ${value.toFixed(4)}`} style={{ height: `${Math.max(8, value * 170)}px` }} onClick={() => setStep(trace.events.findIndex(e => e.tokenIndex === i))}><small>{trace.tokens[i].token}</small></button>)}</div><p className="reconstructed">{token.prediction!.fullSentence ? 'Uses a second reverse linear pass after the sentence ends; the bars above may include later entities. The chart remains forward causal influence.' : 'Reconstructed kernel influence — forward inference uses S/Z, not this history.'}</p></> : <p>Prediction activates on supported pronouns.</p>}</section>
    </div>

    <section className={`panel inspector${inspected ? '' : ' resting'}`}>
      <h2>Inspector / provenance</h2>
      {inspected ? <>
        <div className="insp-head">
          <strong>{inspected.label}</strong>
          <b className={inspected.source}>{inspected.source}</b>
        </div>
        <div className="insp-facts">
          <div><label>Shape</label><span>{inspected.shape.join(' × ') || 'scalar'}</span></div>
          <div><label>Token</label><span>{inspected.tokenIndex !== undefined
            ? `${inspected.tokenIndex} · ${trace.tokens[inspected.tokenIndex]?.token ?? ''}` : 'not token bound'}</span></div>
          <div><label>Layer</label><span>{inspected.layerIndex !== undefined && inspected.layerIndex >= 0
            ? `${inspected.layerIndex + 1} of ${model.config.layers}` : 'not layer bound'}</span></div>
        </div>
        <div className="insp-values">
          <label>Values <span>all {typeof inspected.values === 'number' ? 1 : inspected.values.length}</span></label>
          <Vector name={inspected.label} values={typeof inspected.values === 'number' ? new Float32Array([inspected.values]) : inspected.values}/>
          {/* Every bar sits on the minimum height when the tensor is all zeros,
              which reads as a broken chart rather than as the real answer. */}
          {(typeof inspected.values === 'number' ? inspected.values === 0 : inspected.values.every(v => v === 0))
            && <p className="insp-zero">Every value is exactly zero. Before the first write, the memory is empty, so the read returns nothing.</p>}
        </div>
        <div className="insp-lineage">
          <div>
            <label>Comes from</label>
            <div className="parents">{(inspected.parentIds ?? []).length
              ? inspected.parentIds!.map(id => <button key={id} onClick={() => setPinnedId(id)}>{trace.artifacts[id]?.label ?? id}</button>)
              : <em>No prior tensor. This is a learned parameter or the start of the trace.</em>}</div>
          </div>
          <div>
            <label>Active inputs</label>
            <div className="parents event-links">{event?.inputIds.length
              ? event.inputIds.map(id => <button key={id} onClick={() => setPinnedId(id)}>{trace.artifacts[id]?.label ?? id}</button>)
              : <em>None for this operation.</em>}</div>
          </div>
        </div>
        <button className="minor insp-follow" onClick={() => setPinnedId(undefined)}>Follow active operation</button>
      </> : <p>Click any tensor name, or any parent below, to inspect its values and trace where it came from.</p>}
    </section>

    <Comparison/>
  </main></div>;
}
