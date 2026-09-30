import type { Capability } from '../../../data';
import { cn } from '../../../lib/cn';

/**
 * Line glyphs for "What I build". 1.5px ink strokes, one accent detail each.
 * They come alive when their column (the closest `.group`) is hovered or
 * holds focus: accent traces draw along the wires (stroke-dashoffset with
 * pathLength=1), small parts move (transform only). No JS, no loop.
 */

const ON = 'group-hover:[stroke-dashoffset:0] group-focus-within:[stroke-dashoffset:0]';
/** An accent path that draws itself on hover. */
const trace = cn(
  'stroke-accent [stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-700 ease-out-expo',
  ON,
);
const delay = (ms: number) => ({ transitionDelay: `${ms}ms` });
const fillBox = '[transform-box:fill-box] [transform-origin:center]';

const Agents = () => {
  const hub = { x: 80, y: 50 };
  const nodes = [
    { x: 24, y: 28 },
    { x: 36, y: 82 },
    { x: 118, y: 16 },
    { x: 140, y: 58 },
    { x: 102, y: 88 },
  ];
  return (
    <>
      <g className="stroke-ink">
        <path d="M24 28 L36 82 M118 16 L140 58 M140 58 L102 88" />
        {nodes.map((n, i) => (
          <path key={i} d={`M${hub.x} ${hub.y} L${n.x} ${n.y}`} />
        ))}
      </g>
      <g fill="none" strokeWidth={1.6}>
        {nodes.map((n, i) => (
          <path key={i} d={`M${hub.x} ${hub.y} L${n.x} ${n.y}`} pathLength={1} className={trace} style={delay(i * 70)} />
        ))}
      </g>
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={4} className="fill-bg stroke-ink" />
      ))}
      <circle
        cx={hub.x}
        cy={hub.y}
        r={13}
        className={cn(
          'fill-none stroke-accent opacity-0 transition-[opacity,transform] duration-700 ease-out-expo scale-50 group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:scale-100 group-hover:opacity-100',
          fillBox,
        )}
      />
      <circle cx={hub.x} cy={hub.y} r={7} className="fill-accent stroke-none" />
    </>
  );
};

const Product = () => (
  <>
    <g className="stroke-ink">
      <rect x={14} y={12} width={132} height={76} />
      <path d="M14 26 H146 M48 26 V88" />
      <path d="M22 37 H40 M22 45 H35 M22 53 H40" />
      <path d="M58 38 H116 M58 47 H134 M58 56 H100" />
    </g>
    <g className="fill-ink stroke-none">
      <circle cx={21} cy={19} r={1.8} />
      <circle cx={28} cy={19} r={1.8} />
      <circle cx={35} cy={19} r={1.8} />
    </g>
    <rect x={58} y={67} width={30} height={11} className="fill-accent stroke-none" />
    <rect
      x={54.5}
      y={63.5}
      width={37}
      height={18}
      className="fill-none stroke-accent opacity-0 transition-opacity delay-300 duration-500 group-focus-within:opacity-100 group-hover:opacity-100"
      strokeWidth={1}
    />
    {/* Cursor: travels to the button */}
    <g className="transition-transform duration-700 ease-out-expo group-focus-within:-translate-x-[40px] group-focus-within:translate-y-[12px] group-hover:-translate-x-[40px] group-hover:translate-y-[12px]">
      <path
        d="M116 58 V71 L119.4 67.6 L122 73.4 L124.2 72.4 L121.7 66.8 H126.2 Z"
        className="fill-bg stroke-ink"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </g>
  </>
);

const System = () => (
  <>
    {/* Packet: sits between steps 1 and 2, travels behind step 2 to reach step 3 */}
    <rect
      x={49.5}
      y={46}
      width={6}
      height={6}
      className="fill-accent stroke-none transition-transform duration-[900ms] ease-in-out-quart group-focus-within:translate-x-[55px] group-hover:translate-x-[55px]"
    />
    <g className="stroke-ink">
      <path d="M42 49 H63 M97 49 H118" />
      <path d="M59 45.5 L62.5 49 L59 52.5 M114 45.5 L117.5 49 L114 52.5" strokeLinejoin="miter" />
      <path d="M135 62 V80 H25 V63" strokeDasharray="2 3" />
      <path d="M21.5 66.5 L25 63 L28.5 66.5" />
    </g>
    <path d="M135 62 V80 H25 V63" pathLength={1} className={trace} style={delay(350)} fill="none" />
    <g className="fill-bg stroke-ink">
      <rect x={8} y={36} width={34} height={26} />
      <rect x={63} y={36} width={34} height={26} />
      <rect x={118} y={36} width={34} height={26} />
    </g>
    <g className="stroke-ink">
      <path d="M14 45 H34 M14 53 H26" />
      <path d="M69 45 H91 M69 53 H83" />
      <path d="M124 45 H140 M124 53 H146" />
    </g>
    <path d="M80 12 V36" className="stroke-ink" strokeDasharray="2 3" />
    <rect x={77} y={7} width={6} height={6} className="fill-bg stroke-ink" />
  </>
);

const Hardware = () => {
  const pins = [62, 71, 80, 89, 98];
  const rows = [32, 41, 50, 59, 68];
  const traces = ['M112 41 H126 L134 33 H148', 'M112 59 H130 L138 67 H148', 'M48 50 H30 L22 58 H12'];
  return (
    <>
      <g className="stroke-ink">
        {pins.map((x) => (
          <path key={`t${x}`} d={`M${x} 18 V26 M${x} 74 V82`} />
        ))}
        {rows.map((y) => (
          <path key={`s${y}`} d={`M48 ${y} H56 M104 ${y} H112`} />
        ))}
        {traces.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill="none" strokeWidth={1.6}>
        {traces.map((d, i) => (
          <path key={d} d={d} pathLength={1} className={trace} style={delay(i * 110)} />
        ))}
      </g>
      <g className="fill-bg stroke-ink">
        <circle cx={150.5} cy={33} r={2.5} />
        <circle cx={150.5} cy={67} r={2.5} />
        <circle cx={9.5} cy={58} r={2.5} />
      </g>
      <rect x={56} y={26} width={48} height={48} className="fill-bg stroke-ink" />
      <rect x={68} y={38} width={24} height={24} className="fill-none stroke-ink" />
      <path d="M68 44 L74 38" className="stroke-ink" />
      <circle
        cx={62.5}
        cy={32.5}
        r={2.2}
        className={cn(
          'fill-accent stroke-none transition-transform duration-500 ease-out-expo group-focus-within:scale-[1.7] group-hover:scale-[1.7]',
          fillBox,
        )}
      />
    </>
  );
};

const GLYPHS: Record<Capability['glyph'], () => JSX.Element> = {
  agents: Agents,
  product: Product,
  system: System,
  hardware: Hardware,
};

export const Glyph = ({ name, className }: { name: Capability['glyph']; className?: string }) => {
  const Cmp = GLYPHS[name];
  return (
    <svg
      viewBox="0 0 160 100"
      aria-hidden="true"
      fill="none"
      strokeWidth={1.5}
      className={cn('h-auto overflow-visible', className)}
    >
      <Cmp />
    </svg>
  );
};
