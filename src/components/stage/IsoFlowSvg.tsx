import { useId } from 'react';
import type {
  AccentTone,
  IsoCallout,
  IsoEdge,
  IsoFlowScene,
  IsoMiniChart,
  IsoNode,
  IsoNodeTone,
  IsoZone,
  StageTone,
} from '../../types/lesson';

export interface IsoFlowSvgProps {
  scene: IsoFlowScene;
  isPlaying: boolean;
  reducedMotion?: boolean;
}

interface TonePalette {
  face: string;
  lip: string;
  stroke: string;
  text: string;
  subtext: string;
  badgeBg: string;
  zoneTint: string;
}

const NODE_TONES: Record<IsoNodeTone, TonePalette> = {
  neutral: {
    face: 'var(--sheet)',
    lip: 'var(--iso-lip-neutral)',
    stroke: 'var(--edge)',
    text: 'var(--ink)',
    subtext: 'var(--muted)',
    badgeBg: 'var(--paper-2)',
    zoneTint: 'var(--paper-2)',
  },
  green: {
    face: 'var(--green)',
    lip: 'var(--iso-lip-green)',
    stroke: 'var(--green-stroke)',
    text: 'var(--ink)',
    subtext: 'var(--ink-2)',
    badgeBg: 'var(--mint)',
    zoneTint: 'var(--green)',
  },
  violet: {
    face: 'var(--violet)',
    lip: 'var(--iso-lip-violet)',
    stroke: 'var(--violet-stroke)',
    text: 'var(--ink)',
    subtext: 'var(--ink-2)',
    badgeBg: 'var(--sheet)',
    zoneTint: 'var(--violet)',
  },
  blue: {
    face: 'var(--blue)',
    lip: 'var(--iso-lip-blue)',
    stroke: 'var(--blue-stroke)',
    text: 'var(--ink)',
    subtext: 'var(--ink-2)',
    badgeBg: 'var(--sheet)',
    zoneTint: 'var(--blue)',
  },
  orange: {
    face: 'var(--orange)',
    lip: 'var(--iso-lip-orange)',
    stroke: 'var(--orange-stroke)',
    text: 'var(--ink)',
    subtext: 'var(--ink-2)',
    badgeBg: 'var(--sheet)',
    zoneTint: 'var(--orange)',
  },
  rose: {
    face: 'var(--rose)',
    lip: 'var(--iso-lip-rose)',
    stroke: 'var(--rose-stroke)',
    text: 'var(--ink)',
    subtext: 'var(--ink-2)',
    badgeBg: 'var(--sheet)',
    zoneTint: 'var(--rose)',
  },
  dark: {
    face: 'var(--iso-face-dark)',
    lip: 'var(--iso-lip-dark)',
    stroke: 'var(--edge)',
    text: 'var(--iso-ink-dark)',
    subtext: 'var(--iso-muted-dark)',
    badgeBg: 'var(--green)',
    zoneTint: 'var(--paper-2)',
  },
};

const ACCENT_STROKE: Record<AccentTone, string> = {
  green: 'var(--green-stroke)',
  violet: 'var(--violet-stroke)',
  blue: 'var(--blue-stroke)',
  orange: 'var(--orange-stroke)',
  rose: 'var(--rose-stroke)',
};

const ACCENT_FILL: Record<AccentTone, string> = {
  green: 'var(--green)',
  violet: 'var(--violet)',
  blue: 'var(--blue)',
  orange: 'var(--orange)',
  rose: 'var(--rose)',
};

function resolveStageColor(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  switch (raw.trim().toLowerCase()) {
    case 'green':
    case 'sage':
      return 'var(--green-stroke)';
    case 'violet':
    case 'purple':
      return 'var(--violet-stroke)';
    case 'blue':
      return 'var(--blue-stroke)';
    case 'orange':
    case 'amber':
      return 'var(--orange-stroke)';
    case 'rose':
    case 'red':
    case 'coral':
      return 'var(--rose-stroke)';
    case 'neutral':
    case 'gray':
      return 'var(--edge)';
    default:
      return raw;
  }
}

function measureTextPx(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0x2e80) {
      units += 1.02;
    } else if (ch >= 'A' && ch <= 'Z') {
      units += 0.66;
    } else if (ch === ' ' || ch === '.' || ch === ':' || ch === '/' || ch === '-') {
      units += 0.36;
    } else {
      units += 0.58;
    }
  }
  return units * fontSize;
}

function truncateLine(text: string, maxWidthPx: number, fontSize: number): string {
  if (measureTextPx(text, fontSize) <= maxWidthPx) {
    return text;
  }
  let truncated = '';
  for (const ch of text) {
    if (measureTextPx(truncated + ch + '…', fontSize) > maxWidthPx) {
      break;
    }
    truncated += ch;
  }
  return truncated ? truncated.trimEnd() + '…' : '…';
}

function wrapText(text: string, maxWidthPx: number, fontSize: number, maxLines = 2): string[] {
  if (measureTextPx(text, fontSize) <= maxWidthPx) {
    return [text];
  }
  if (maxLines <= 1) {
    return [truncateLine(text, maxWidthPx, fontSize)];
  }

  const lines: string[] = [];
  let idx = 0;
  while (idx < text.length && lines.length < maxLines - 1) {
    let current = '';
    while (idx < text.length) {
      const ch = text[idx];
      const next = current + ch;
      if (measureTextPx(next, fontSize) > maxWidthPx && current.length > 0) {
        break;
      }
      current = next;
      idx++;
    }
    lines.push(current.trimEnd());
    while (idx < text.length && text[idx] === ' ') {
      idx++;
    }
  }

  const rest = text.slice(idx).trim();
  if (rest) {
    lines.push(truncateLine(rest, maxWidthPx, fontSize));
  }
  return lines.slice(0, maxLines);
}

interface NodeBox {
  w: number;
  h: number;
  depth: number;
  rx: number;
  labelLines: string[];
  subLines: string[];
  hasIcon: boolean;
}

function computeNodeBox(node: IsoNode): NodeBox {
  const size = node.size ?? 'md';
  const hasIcon = Boolean(node.icon);
  const iconPad = hasIcon ? 30 : 0;

  const base =
    size === 'sm'
      ? { minW: 118, maxW: 166, minH: 52, depth: 6, rx: 10, titleFs: 11.5, subFs: 9.6 }
      : size === 'lg'
        ? { minW: 174, maxW: 224, minH: 76, depth: 9, rx: 12, titleFs: 13, subFs: 10.2 }
        : size === 'platform'
          ? { minW: 214, maxW: 274, minH: 84, depth: 10, rx: 13, titleFs: 13.5, subFs: 10.5 }
          : { minW: 146, maxW: 196, minH: 66, depth: 8, rx: 11, titleFs: 12.2, subFs: 9.8 };

  const titleRaw = measureTextPx(node.label, base.titleFs) + 28 + iconPad;
  const subRaw = node.sublabel ? measureTextPx(node.sublabel, base.subFs) + 26 + iconPad : 0;
  const w = Math.round(Math.max(base.minW, Math.min(base.maxW, Math.max(titleRaw, subRaw))));

  const textAvailW = w - 22 - iconPad;
  const labelLines = wrapText(node.label, textAvailW, base.titleFs, 2);
  const subLines = node.sublabel ? wrapText(node.sublabel, textAvailW, base.subFs, 2) : [];

  const contentH =
    labelLines.length * (base.titleFs + 3.5) +
    (subLines.length > 0 ? 4 + subLines.length * (base.subFs + 2.5) : 0) +
    20;

  const h = Math.round(Math.max(base.minH, contentH));

  return { w, h, depth: base.depth, rx: base.rx, labelLines, subLines, hasIcon };
}

function resolveBorderPoint(
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  tx: number,
  ty: number,
  pad: number
): [number, number] {
  const dx = tx - cx;
  const dy = ty - cy;
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    return [cx, cy];
  }
  const ex = hw + pad;
  const ey = hh + pad;
  const scaleX = Math.abs(dx) > 0.001 ? ex / Math.abs(dx) : Infinity;
  const scaleY = Math.abs(dy) > 0.001 ? ey / Math.abs(dy) : Infinity;
  const t = Math.min(scaleX, scaleY);
  return [cx + dx * t, cy + dy * t];
}

interface ComputedEdge {
  d: string;
  midX: number;
  midY: number;
  length: number;
}

function computeEdgeGeometry(
  fromNode: IsoNode,
  fromBox: NodeBox,
  toNode: IsoNode,
  toBox: NodeBox,
  edge: IsoEdge,
  bidirectionalSign: number
): ComputedEdge {
  const waypoints = edge.via ?? [];
  const firstTarget = waypoints.length > 0 ? waypoints[0] : [toNode.x, toNode.y];
  const lastOrigin = waypoints.length > 0 ? waypoints[waypoints.length - 1] : [fromNode.x, fromNode.y];

  const [sx, sy] = resolveBorderPoint(
    fromNode.x,
    fromNode.y + fromBox.depth * 0.25,
    fromBox.w / 2,
    fromBox.h / 2 + fromBox.depth * 0.4,
    firstTarget[0],
    firstTarget[1],
    3
  );

  const [ex, ey] = resolveBorderPoint(
    toNode.x,
    toNode.y + toBox.depth * 0.25,
    toBox.w / 2,
    toBox.h / 2 + toBox.depth * 0.4,
    lastOrigin[0],
    lastOrigin[1],
    7
  );

  if (waypoints.length > 0) {
    const pts: [number, number][] = [[sx, sy], ...waypoints, [ex, ey]];
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    let totalLen = 0;
    const segLengths: number[] = [];

    for (let i = 0; i < pts.length - 1; i++) {
      const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segLengths.push(len);
      totalLen += len;
    }

    const cornerR = 14;
    for (let i = 1; i < pts.length - 1; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const next = pts[i + 1];
      const d1 = Math.hypot(curr[0] - prev[0], curr[1] - prev[1]);
      const d2 = Math.hypot(next[0] - curr[0], next[1] - curr[1]);
      const r = Math.min(cornerR, d1 * 0.4, d2 * 0.4);
      const p1x = curr[0] - ((curr[0] - prev[0]) / (d1 || 1)) * r;
      const p1y = curr[1] - ((curr[1] - prev[1]) / (d1 || 1)) * r;
      const p2x = curr[0] + ((next[0] - curr[0]) / (d2 || 1)) * r;
      const p2y = curr[1] + ((next[1] - curr[1]) / (d2 || 1)) * r;
      d += ` L ${p1x.toFixed(1)} ${p1y.toFixed(1)} Q ${curr[0].toFixed(1)} ${curr[1].toFixed(1)} ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
    }
    d += ` L ${ex.toFixed(1)} ${ey.toFixed(1)}`;

    // Find point at 50% total length for label placement
    let half = totalLen * 0.5;
    let midX = (sx + ex) / 2;
    let midY = (sy + ey) / 2;
    for (let i = 0; i < segLengths.length; i++) {
      if (half <= segLengths[i] || i === segLengths.length - 1) {
        const frac = segLengths[i] > 0 ? Math.max(0, Math.min(1, half / segLengths[i])) : 0.5;
        midX = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * frac;
        midY = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * frac;
        break;
      }
      half -= segLengths[i];
    }

    return { d, midX, midY, length: Math.max(40, totalLen) };
  }

  const dx = ex - sx;
  const dy = ey - sy;
  const dist = Math.hypot(dx, dy);

  // Self-loop without explicit via waypoints: draw clean overhead arc
  if (fromNode.id === toNode.id || dist < 1) {
    const lx1 = fromNode.x + fromBox.w * 0.28;
    const ly1 = fromNode.y - fromBox.h / 2 - 2;
    const lx2 = fromNode.x - fromBox.w * 0.28;
    const ly2 = fromNode.y - fromBox.h / 2 - 6;
    const topY = Math.max(16, ly1 - 46);
    const d = `M ${lx1.toFixed(1)} ${ly1.toFixed(1)} C ${(lx1 + 26).toFixed(1)} ${topY.toFixed(1)}, ${(lx2 - 26).toFixed(1)} ${topY.toFixed(1)}, ${lx2.toFixed(1)} ${ly2.toFixed(1)}`;
    return { d, midX: fromNode.x, midY: topY + 6, length: 120 };
  }

  const shouldCurve = Boolean(edge.curved) || bidirectionalSign !== 0;

  if (shouldCurve) {
    const dir = bidirectionalSign !== 0 ? bidirectionalSign : 1;
    const bend = Math.min(44, Math.max(20, dist * 0.16)) * dir;
    const nx = -dy / dist;
    const ny = dx / dist;
    const cx = (sx + ex) / 2 + nx * bend;
    const cy = (sy + ey) / 2 + ny * bend;
    const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    // Quadratic Bézier midpoint at t = 0.5
    const midX = 0.25 * sx + 0.5 * cx + 0.25 * ex;
    const midY = 0.25 * sy + 0.5 * cy + 0.25 * ey;
    return { d, midX, midY, length: Math.max(40, dist * 1.1) };
  }

  const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  return { d, midX: (sx + ex) / 2, midY: (sy + ey) / 2, length: Math.max(40, dist) };
}

function renderNodeIcon(iconKey: string | undefined, x: number, y: number, color: string) {
  if (!iconKey) return null;
  const key = iconKey.toLowerCase();
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: 1.65,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  let glyph: React.ReactNode;
  switch (key) {
    case 'brain':
    case 'sparkles':
      glyph = (
        <>
          <path d="M7 1.5l1.3 3.5L11.8 6.3 8.3 7.6 7 11.1 5.7 7.6 2.2 6.3 5.7 5z" {...common} />
          <circle cx="11.5" cy="2.3" r="0.9" fill={color} />
        </>
      );
      break;
    case 'cpu':
    case 'server':
      glyph = (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" {...common} />
          <path d="M5.5 1.5v2M8.5 1.5v2M5.5 10.5v2M8.5 10.5v2M1.5 5.5h2M1.5 8.5h2M10.5 5.5h2M10.5 8.5h2" {...common} />
        </>
      );
      break;
    case 'terminal':
      glyph = (
        <>
          <rect x="1.5" y="2.2" width="11" height="9.6" rx="1.6" {...common} />
          <path d="M4 5.2L6.2 7 4 8.8M7.5 8.8h2.6" {...common} />
        </>
      );
      break;
    case 'file':
    case 'book':
      glyph = (
        <>
          <path d="M3.2 1.8h5l2.6 2.6v7.8a1 1 0 0 1-1 1H3.2a1 1 0 0 1-1-1V2.8a1 1 0 0 1 1-1z" {...common} />
          <path d="M8 1.8v2.8h2.8M4.6 7.5h4.8M4.6 9.9h3.2" {...common} />
        </>
      );
      break;
    case 'edit':
      glyph = (
        <>
          <path d="M8.8 2.4l2.8 2.8-6.4 6.4H2.4V8.8z" {...common} />
          <path d="M7.4 3.8l2.8 2.8" {...common} />
        </>
      );
      break;
    case 'layers':
      glyph = (
        <>
          <path d="M7 2L1.8 4.8 7 7.6 12.2 4.8z" {...common} />
          <path d="M1.8 7.6L7 10.4l5.2-2.8M1.8 10.1L7 12.8l5.2-2.7" {...common} />
        </>
      );
      break;
    case 'queue':
    case 'filter':
      glyph = (
        <>
          <rect x="1.8" y="2.5" width="10.4" height="2.4" rx="0.9" {...common} />
          <rect x="1.8" y="6.1" width="10.4" height="2.4" rx="0.9" {...common} />
          <rect x="1.8" y="9.7" width="6.8" height="2.4" rx="0.9" {...common} />
        </>
      );
      break;
    case 'shield':
    case 'lock':
      glyph = (
        <>
          <path d="M7 1.6L11.8 3.5v3.3c0 3-2 4.8-4.8 5.8-2.8-1-4.8-2.8-4.8-5.8V3.5z" {...common} />
          <path d="M5 7l1.4 1.5L9.3 5.5" {...common} />
        </>
      );
      break;
    case 'loop':
    case 'arrow-repeat':
      glyph = (
        <>
          <path d="M10.8 4.6A4.7 4.7 0 0 0 3 5.2" {...common} />
          <path d="M11 2.2v2.6H8.4" {...common} />
          <path d="M3.2 9.4A4.7 4.7 0 0 0 11 8.8" {...common} />
          <path d="M3 11.8V9.2h2.6" {...common} />
        </>
      );
      break;
    case 'database':
      glyph = (
        <>
          <ellipse cx="7" cy="3.5" rx="4.6" ry="1.8" {...common} />
          <path d="M2.4 3.5v7c0 1 2.1 1.8 4.6 1.8s4.6-.8 4.6-1.8v-7" {...common} />
          <path d="M2.4 7c0 1 2.1 1.8 4.6 1.8s4.6-.8 4.6-1.8" {...common} />
        </>
      );
      break;
    case 'code':
      glyph = (
        <>
          <path d="M4.6 4.2L1.8 7l2.8 2.8M9.4 4.2L12.2 7 9.4 9.8M7.8 2.8L6.2 11.2" {...common} />
        </>
      );
      break;
    case 'user':
      glyph = (
        <>
          <circle cx="7" cy="4.4" r="2.3" {...common} />
          <path d="M2.5 11.8c.5-2.3 2.2-3.4 4.5-3.4s4 1.1 4.5 3.4" {...common} />
        </>
      );
      break;
    case 'git-branch':
    case 'git-merge':
      glyph = (
        <>
          <circle cx="4" cy="3.2" r="1.5" {...common} />
          <circle cx="4" cy="10.8" r="1.5" {...common} />
          <circle cx="10.4" cy="5.4" r="1.5" {...common} />
          <path d="M4 4.7v4.6M10.4 6.9c0 2.3-2 2.9-6.4 2.9" {...common} />
        </>
      );
      break;
    case 'package':
    case 'box':
      glyph = (
        <>
          <path d="M7 1.8L12 4.4v5.2L7 12.2 2 9.6V4.4z" {...common} />
          <path d="M2 4.4L7 7l5-2.6M7 7v5.2" {...common} />
        </>
      );
      break;
    case 'zap':
    case 'activity':
      glyph = <path d="M8 1.5L3 7.6h3.8L6 12.5l5-6.1H7.2z" {...common} />;
      break;
    case 'wrench':
    case 'sliders':
      glyph = (
        <>
          <path d="M9.6 2.2a2.8 2.8 0 0 0-3.4 3.6L2.4 9.6a1.3 1.3 0 0 0 1.9 1.9l3.8-3.8a2.8 2.8 0 0 0 3.6-3.4l-1.5 1.5-1.9-.5-.5-1.9z" {...common} />
        </>
      );
      break;
    case 'search':
      glyph = (
        <>
          <circle cx="6.2" cy="6.2" r="3.9" {...common} />
          <path d="M9.2 9.2l3 3" {...common} />
        </>
      );
      break;
    case 'message':
      glyph = (
        <>
          <path d="M2.2 3h9.6a1.2 1.2 0 0 1 1.2 1.2v5a1.2 1.2 0 0 1-1.2 1.2H5.6L2.6 12.4V10.4H2.2A1.2 1.2 0 0 1 1 9.2v-5A1.2 1.2 0 0 1 2.2 3z" {...common} />
          <path d="M4.5 6.4h5M4.5 8.4h3.2" {...common} />
        </>
      );
      break;
    case 'clock':
      glyph = (
        <>
          <circle cx="7" cy="7" r="5.1" {...common} />
          <path d="M7 4.2V7l2.2 1.4" {...common} />
        </>
      );
      break;
    case 'alert':
      glyph = (
        <>
          <path d="M7 2L12.3 11.4H1.7z" {...common} />
          <path d="M7 5.7v2.7" {...common} />
          <circle cx="7" cy="10" r="0.7" fill={color} />
        </>
      );
      break;
    case 'check':
      glyph = (
        <>
          <circle cx="7" cy="7" r="5.1" {...common} />
          <path d="M4.6 7.1l1.7 1.7 3.2-3.4" {...common} />
        </>
      );
      break;
    case 'plug':
    case 'key':
      glyph = (
        <>
          <path d="M5 2v3M9 2v3M3.5 5h7v2a3.5 3.5 0 0 1-7 0zM7 10.5v2" {...common} />
        </>
      );
      break;
    default:
      glyph = (
        <>
          <rect x="2.4" y="2.4" width="9.2" height="9.2" rx="2.2" {...common} />
          <circle cx="7" cy="7" r="1.8" fill={color} />
        </>
      );
      break;
  }

  return <g transform={`translate(${x}, ${y})`}>{glyph}</g>;
}

function renderZone(zone: IsoZone, idx: number) {
  const tone: StageTone = zone.tone ?? 'neutral';
  const palette = NODE_TONES[tone];
  const labelW = Math.max(66, Math.min(zone.w - 16, measureTextPx(zone.label, 10.5) + 22));
  const items = zone.items ?? [];

  return (
    <g
      key={zone.id ?? `zone-${idx}`}
      className="stage-edge-enter"
      style={{ animationDelay: `${idx * 35}ms` }}
    >
      {/* Tinted backdrop */}
      <rect
        x={zone.x}
        y={zone.y}
        width={zone.w}
        height={zone.h}
        rx={12}
        fill={palette.zoneTint}
        fillOpacity={tone === 'neutral' ? 0.42 : 0.24}
        stroke={tone === 'neutral' ? 'var(--line-strong)' : palette.stroke}
        strokeWidth={1.5}
        strokeDasharray={zone.dashed === false ? undefined : '6 5'}
      />

      {/* Top floating label tag */}
      <g transform={`translate(${zone.x + 12}, ${zone.y - 10})`}>
        <rect
          x={0}
          y={0}
          width={labelW}
          height={20}
          rx={6}
          fill="var(--sheet)"
          stroke={tone === 'neutral' ? 'var(--edge)' : palette.stroke}
          strokeWidth={1.2}
        />
        <circle
          cx={9}
          cy={10}
          r={3}
          fill={tone === 'neutral' ? 'var(--muted)' : palette.stroke}
        />
        <text
          x={17}
          y={13.5}
          fontSize={10.2}
          fontWeight={700}
          fill="var(--ink)"
        >
          {zone.label}
        </text>
      </g>

      {/* Queue / bucket slot items */}
      {items.length > 0 && (() => {
        const innerX = zone.x + 12;
        const innerW = Math.max(40, zone.w - 24);
        const hasTextLabels = items.some((it) => Boolean(it.label));
        const itemY = Math.max(zone.y + 15, zone.y + zone.h - (hasTextLabels ? 30 : 24));

        if (hasTextLabels) {
          const gap = 6;
          const slotW = Math.max(
            38,
            Math.min(116, (innerW - gap * (items.length - 1)) / items.length)
          );
          const totalRowW = items.length * slotW + gap * (items.length - 1);
          const startX = innerX + Math.max(0, (innerW - totalRowW) / 2);

          return (
            <g>
              {items.map((item, itemIdx) => {
                const ix = startX + itemIdx * (slotW + gap);
                const filled = item.filled !== false;
                const fillColor = resolveStageColor(item.color, palette.face);
                const display = item.label
                  ? wrapText(item.label, slotW - 14, 9.5, 1)[0]
                  : '';
                return (
                  <g key={`zitem-${itemIdx}`} transform={`translate(${ix}, ${itemY})`}>
                    <rect
                      x={0}
                      y={0}
                      width={slotW}
                      height={22}
                      rx={6}
                      fill={filled ? fillColor : 'var(--stage-bg)'}
                      fillOpacity={filled ? 0.92 : 0.6}
                      stroke={filled ? 'var(--edge)' : 'var(--line-strong)'}
                      strokeWidth={1.1}
                      strokeDasharray={filled ? undefined : '3 2.5'}
                    />
                    <text
                      x={slotW / 2}
                      y={14.5}
                      textAnchor="middle"
                      fontSize={9.4}
                      fontWeight={700}
                      fill={filled ? 'var(--ink)' : 'var(--muted)'}
                    >
                      {display}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        }

        // Compact dot/slot indicator strip
        const dotSize = 14;
        const gap = 7;
        const totalW = items.length * dotSize + (items.length - 1) * gap;
        const startX = innerX + Math.max(0, (innerW - totalW) / 2);
        return (
          <g>
            {items.map((item, itemIdx) => {
              const filled = item.filled !== false;
              const ix = startX + itemIdx * (dotSize + gap);
              return (
                <rect
                  key={`zdot-${itemIdx}`}
                  x={ix}
                  y={itemY}
                  width={dotSize}
                  height={dotSize}
                  rx={4}
                  fill={filled ? resolveStageColor(item.color, palette.stroke) : 'var(--stage-bg)'}
                  stroke={filled ? 'var(--edge)' : 'var(--line-strong)'}
                  strokeWidth={1.1}
                  strokeDasharray={filled ? undefined : '2.5 2'}
                />
              );
            })}
          </g>
        );
      })()}
    </g>
  );
}

function renderCallout(callout: IsoCallout, idx: number) {
  const tone: StageTone = callout.tone ?? 'neutral';
  const palette = NODE_TONES[tone];
  const lines = wrapText(callout.text, 220, 10.6, 2);
  const textW = Math.max(...lines.map((l) => measureTextPx(l, 10.6)));
  const w = Math.round(Math.max(76, textW + 24));
  const h = lines.length > 1 ? 38 : 25;
  const cx = Math.max(w / 2 + 12, Math.min(1000 - w / 2 - 12, callout.x));
  const cy = Math.max(h / 2 + 12, Math.min(560 - h / 2 - 12, callout.y));

  return (
    <g
      key={`callout-${idx}`}
      className="stage-node-enter"
      style={{ animationDelay: `${180 + idx * 45}ms` }}
      transform={`translate(${cx - w / 2}, ${cy - h / 2})`}
    >
      <rect
        x={2}
        y={2.5}
        width={w}
        height={h}
        rx={7}
        fill="var(--stage-shadow-ambient)"
      />
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        rx={7}
        fill={tone === 'neutral' ? 'var(--sheet)' : palette.face}
        stroke="var(--edge)"
        strokeWidth={1.2}
      />
      <text
        x={w / 2}
        y={lines.length > 1 ? 15.5 : 16.5}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={700}
        fill="var(--ink)"
      >
        {lines.map((line, lineIdx) => (
          <tspan key={lineIdx} x={w / 2} dy={lineIdx === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function renderMiniChart(chart: IsoMiniChart, uid: string) {
  const cardX = 662;
  const cardY = 352;
  const cardW = 318;
  const cardH = 188;

  const padL = 42;
  const padR = 16;
  const padT = 36;
  const padB = 34;
  const plotW = cardW - padL - padR;
  const plotH = cardH - padT - padB;

  const tone: AccentTone = chart.tone ?? 'green';
  const strokeColor = ACCENT_STROKE[tone];
  const fillColor = ACCENT_FILL[tone];

  const pts = chart.points.length > 0 ? chart.points : ([[0, 0], [1, 1]] as [number, number][]);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(...ys, minY + 1);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const mapped = pts.map(([px, py]) => [
    padL + ((px - minX) / spanX) * plotW,
    padT + plotH - ((py - minY) / spanY) * plotH,
  ]);

  const lineD = mapped
    .map(([mx, my], i) => `${i === 0 ? 'M' : 'L'} ${mx.toFixed(1)} ${my.toFixed(1)}`)
    .join(' ');
  const areaD = `${lineD} L ${mapped[mapped.length - 1][0].toFixed(1)} ${(padT + plotH).toFixed(1)} L ${mapped[0][0].toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;

  const hiIdx =
    chart.highlightIndex !== undefined &&
    chart.highlightIndex >= 0 &&
    chart.highlightIndex < mapped.length
      ? chart.highlightIndex
      : undefined;
  const hiPt = hiIdx !== undefined ? mapped[hiIdx] : undefined;

  const gradId = `${uid}-mini-area`;

  return (
    <g
      className="stage-node-enter"
      style={{ animationDelay: '210ms' }}
      transform={`translate(${cardX}, ${cardY})`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Drop shadow */}
      <rect x={3} y={4} width={cardW} height={cardH} rx={10} fill="var(--stage-shadow-ambient)" />

      {/* Frosted drafting card */}
      <rect
        x={0}
        y={0}
        width={cardW}
        height={cardH}
        rx={10}
        fill="var(--stage-frosted)"
        stroke="var(--edge)"
        strokeWidth={1.5}
      />

      {/* Header */}
      <circle cx={15} cy={17} r={4} fill={fillColor} stroke="var(--edge)" strokeWidth={1.1} />
      <text x={25} y={20.5} fontSize={11} fontWeight={800} fill="var(--ink)">
        {wrapText(chart.title, cardW - 38, 11, 1)[0]}
      </text>
      <line x1={10} y1={28} x2={cardW - 10} y2={28} stroke="var(--line)" strokeWidth={1} />

      {/* Horizontal gridlines */}
      {[0, 0.33, 0.66, 1].map((frac, idx) => {
        const gy = padT + frac * plotH;
        return (
          <line
            key={idx}
            x1={padL}
            y1={gy}
            x2={padL + plotW}
            y2={gy}
            stroke="var(--line-soft)"
            strokeWidth={1}
            strokeDasharray={frac < 1 ? '3 3' : undefined}
          />
        );
      })}

      {/* Axes */}
      <line
        x1={padL}
        y1={padT}
        x2={padL}
        y2={padT + plotH}
        stroke="var(--line-strong)"
        strokeWidth={1.2}
      />
      <line
        x1={padL}
        y1={padT + plotH}
        x2={padL + plotW}
        y2={padT + plotH}
        stroke="var(--line-strong)"
        strokeWidth={1.2}
      />

      {/* Area + Line */}
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={lineD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {mapped.map(([mx, my], idx) => (
        <circle
          key={idx}
          cx={mx}
          cy={my}
          r={idx === hiIdx ? 4.5 : 2.6}
          fill={idx === hiIdx ? fillColor : 'var(--sheet)'}
          stroke={idx === hiIdx ? 'var(--edge)' : strokeColor}
          strokeWidth={idx === hiIdx ? 1.8 : 1.5}
        />
      ))}

      {/* Highlight point marker + pill */}
      {hiPt && (
        <g>
          <line
            x1={hiPt[0]}
            y1={hiPt[1] + 5}
            x2={hiPt[0]}
            y2={padT + plotH}
            stroke={strokeColor}
            strokeWidth={1.2}
            strokeDasharray="3 2.5"
          />
          <circle
            cx={hiPt[0]}
            cy={hiPt[1]}
            r={8.5}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.3}
            opacity={0.45}
          />
          {chart.highlightLabel && (() => {
            const pillText = wrapText(chart.highlightLabel, 130, 9.6, 1)[0];
            const pillW = Math.max(54, measureTextPx(pillText, 9.6) + 14);
            const px = Math.max(padL + 2, Math.min(cardW - pillW - 8, hiPt[0] - pillW / 2));
            const py = hiPt[1] > padT + 26 ? hiPt[1] - 25 : hiPt[1] + 11;
            return (
              <g transform={`translate(${px}, ${py})`}>
                <rect
                  x={0}
                  y={0}
                  width={pillW}
                  height={18}
                  rx={5}
                  fill={fillColor}
                  stroke="var(--edge)"
                  strokeWidth={1.1}
                />
                <text
                  x={pillW / 2}
                  y={12.4}
                  textAnchor="middle"
                  fontSize={9.4}
                  fontWeight={800}
                  fill="var(--ink)"
                >
                  {pillText}
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* Axis labels */}
      <text
        x={padL + plotW / 2}
        y={cardH - 9}
        textAnchor="middle"
        fontSize={9.5}
        fontWeight={600}
        fill="var(--muted)"
      >
        {chart.xLabel}
      </text>
      <text
        x={14}
        y={padT + plotH / 2}
        textAnchor="middle"
        fontSize={9.5}
        fontWeight={600}
        fill="var(--muted)"
        transform={`rotate(-90 14 ${padT + plotH / 2})`}
      >
        {chart.yLabel}
      </text>
    </g>
  );
}

export function IsoFlowSvg({ scene, isPlaying, reducedMotion = false }: IsoFlowSvgProps) {
  const uid = useId().replace(/:/g, '');
  const gridPatternId = `${uid}-iso-grid`;
  const vignetteGradId = `${uid}-iso-vig`;
  const vignetteMaskId = `${uid}-iso-mask`;

  const nodeMap = new Map<string, IsoNode>();
  const boxMap = new Map<string, NodeBox>();
  for (const node of scene.nodes) {
    nodeMap.set(node.id, node);
    boxMap.set(node.id, computeNodeBox(node));
  }

  // Detect bidirectional edge pairs so arrows never overlap each other
  const pairSet = new Set<string>(scene.edges.map((e) => `${e.from}->${e.to}`));

  // Unique arrow markers by color
  const markerKeyMap = new Map<string, string>();
  const getMarkerId = (color: string) => {
    let key = markerKeyMap.get(color);
    if (!key) {
      key = `${uid}-arrow-${markerKeyMap.size}`;
      markerKeyMap.set(color, key);
    }
    return key;
  };

  // Precompute edge metadata so markers are declared cleanly in <defs>
  const resolvedEdges = scene.edges
    .map((edge, idx) => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      const fromBox = boxMap.get(edge.from);
      const toBox = boxMap.get(edge.to);
      if (!fromNode || !toNode || !fromBox || !toBox) return null;

      const hasReverse = pairSet.has(`${edge.to}->${edge.from}`);
      const biSign = hasReverse ? (edge.from < edge.to ? 1 : -1) : 0;
      const geom = computeEdgeGeometry(fromNode, fromBox, toNode, toBox, edge, biSign);

      const status = edge.status ?? 'normal';
      const resolvedPacket = edge.packetColor
        ? resolveStageColor(edge.packetColor, 'var(--edge)')
        : undefined;
      const strokeColor =
        status === 'error'
          ? 'var(--kpi-bad)'
          : status === 'active'
            ? resolvedPacket ?? 'var(--edge)'
            : status === 'dimmed'
              ? 'var(--line-strong)'
              : resolvedPacket ?? 'var(--edge)';

      const markerId = getMarkerId(strokeColor);
      const pathId = `${uid}-ep-${idx}`;
      return { edge, idx, geom, status, strokeColor, resolvedPacket, markerId, pathId };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <svg
      className="stage-svg"
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={scene.title ?? 'Pi 架构等距流向图'}
    >
      <defs>
        {/* Signature diamond isometric floor grid */}
        <pattern id={gridPatternId} width="48" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M 24 0 L 48 14 L 24 28 L 0 14 Z"
            fill="none"
            stroke="var(--line-soft)"
            strokeWidth="1"
          />
          <circle cx="24" cy="14" r="1" fill="var(--line-strong)" opacity="0.45" />
        </pattern>

        {/* Radial vignette mask fading grid gently toward stage borders */}
        <radialGradient id={vignetteGradId} cx="50%" cy="50%" r="54%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="62%" stopColor="#ffffff" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <mask id={vignetteMaskId}>
          <rect x="0" y="0" width="1000" height="560" fill={`url(#${vignetteGradId})`} />
        </mask>

        {/* Dynamic crisp arrowheads */}
        {Array.from(markerKeyMap.entries()).map(([color, markerId]) => (
          <marker
            key={markerId}
            id={markerId}
            viewBox="0 0 10 10"
            refX="8.2"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M 1 1.5 L 8.8 5 L 1 8.5 z" fill={color} />
          </marker>
        ))}
      </defs>

      {/* 1. Isometric Floor Grid */}
      <rect
        x="0"
        y="0"
        width="1000"
        height="560"
        fill={`url(#${gridPatternId})`}
        mask={`url(#${vignetteMaskId})`}
      />

      {/* 2. Dashed Zones / Queues */}
      <g>{(scene.zones ?? []).map((zone, idx) => renderZone(zone, idx))}</g>

      {/* 3. Directed Edges & Flowing Packets */}
      <g>
        {resolvedEdges.map(({ edge, idx, geom, status, strokeColor, resolvedPacket, markerId, pathId }) => {
          const isDim = status === 'dimmed';
          const isAct = status === 'active';
          const isErr = status === 'error';
          const packetColor =
            resolvedPacket ??
            (isErr ? 'var(--kpi-bad)' : isAct ? 'var(--green-stroke)' : 'var(--rust)');
          const packetCount =
            isDim || reducedMotion
              ? 0
              : Math.max(0, Math.min(4, edge.packetCount ?? (isAct ? 2 : 1)));
          const speed = Math.max(0.3, edge.packetSpeed ?? 1);
          const durSec = Math.max(1.15, Math.min(5.5, geom.length / (115 * speed)));

          return (
            <g
              key={edge.id ?? `edge-${idx}`}
              className="stage-edge-enter"
              style={{ animationDelay: `${60 + idx * 25}ms` }}
              opacity={isDim ? 0.34 : 1}
            >
              {/* Soft glow halo under active/error edge */}
              {(isAct || isErr) && (
                <path
                  d={geom.d}
                  fill="none"
                  stroke={packetColor}
                  strokeWidth={6}
                  strokeOpacity={0.18}
                  strokeLinecap="round"
                />
              )}

              {/* Primary edge path */}
              <path
                id={pathId}
                d={geom.d}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isAct || isErr ? 2.2 : 1.65}
                strokeDasharray={edge.dashed ? '6 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={`url(#${markerId})`}
                className={edge.dashed && isAct ? 'stage-dash-flow' : undefined}
              />

              {/* Animated packet dots flowing along path */}
              {packetCount > 0 &&
                Array.from({ length: packetCount }).map((_, pIdx) => {
                  const beginOffset = -((pIdx / packetCount) * durSec);
                  return (
                    <g key={`pkt-${pIdx}`} opacity={isPlaying ? 1 : 0.72}>
                      <circle r={7} fill={packetColor} fillOpacity={0.24}>
                        <animateMotion
                          dur={`${durSec.toFixed(2)}s`}
                          begin={`${beginOffset.toFixed(2)}s`}
                          repeatCount="indefinite"
                          rotate="auto"
                        >
                          <mpath href={`#${pathId}`} />
                        </animateMotion>
                      </circle>
                      <circle
                        r={3.5}
                        fill={packetColor}
                        stroke="var(--stage-bg)"
                        strokeWidth={1.1}
                      >
                        <animateMotion
                          dur={`${durSec.toFixed(2)}s`}
                          begin={`${beginOffset.toFixed(2)}s`}
                          repeatCount="indefinite"
                          rotate="auto"
                        >
                          <mpath href={`#${pathId}`} />
                        </animateMotion>
                      </circle>
                    </g>
                  );
                })}
            </g>
          );
        })}
      </g>

      {/* 4. 2.5D Rounded Extruded Blocks */}
      <g>
        {scene.nodes.map((node, idx) => {
          const box = boxMap.get(node.id);
          if (!box) return null;
          const palette = NODE_TONES[node.tone];
          const left = node.x - box.w / 2;
          const top = node.y - box.h / 2;
          const isActive = Boolean(node.active);
          const isDim = Boolean(node.dimmed);
          const size = node.size ?? 'md';
          const titleFs =
            size === 'sm' ? 11.5 : size === 'lg' ? 13 : size === 'platform' ? 13.5 : 12.2;
          const subFs =
            size === 'sm' ? 9.6 : size === 'lg' ? 10.2 : size === 'platform' ? 10.5 : 9.8;

          const textStartX = box.hasIcon ? left + 39 : node.x;
          const textAnchor = box.hasIcon ? 'start' : 'middle';
          const totalTextH =
            box.labelLines.length * (titleFs + 3) +
            (box.subLines.length > 0 ? 4 + box.subLines.length * (subFs + 2.5) : 0);
          const firstTitleY = top + (box.h - totalTextH) / 2 + titleFs * 0.88;

          return (
            <g
              key={node.id}
              className="stage-node-enter"
              style={{ animationDelay: `${idx * 35}ms` }}
              opacity={isDim ? 0.4 : 1}
            >
              <title>
                {node.label}
                {node.sublabel ? ` — ${node.sublabel}` : ''}
              </title>
              {/* Active soft outer glow ring */}
              {isActive && (
                <rect
                  x={left - 5}
                  y={top - 5}
                  width={box.w + 10}
                  height={box.h + box.depth + 10}
                  rx={box.rx + 4}
                  fill="none"
                  stroke={palette.stroke}
                  strokeWidth={4}
                  className="stage-active-pulse"
                />
              )}

              {/* Layer 1: Grounded ambient drop shadow */}
              <rect
                x={left + 3}
                y={top + box.depth + 4.5}
                width={box.w}
                height={box.h}
                rx={box.rx}
                fill="var(--stage-shadow-ambient)"
              />

              {/* Layer 2: 3D darker extrusion side lip */}
              <rect
                x={left}
                y={top + box.depth}
                width={box.w}
                height={box.h}
                rx={box.rx}
                fill={palette.lip}
                stroke="var(--edge)"
                strokeWidth={isActive ? 2 : 1.5}
              />

              {/* Layer 3: Top tactile face */}
              <rect
                x={left}
                y={top}
                width={box.w}
                height={box.h}
                rx={box.rx}
                fill={palette.face}
                stroke="var(--edge)"
                strokeWidth={isActive ? 2.1 : 1.5}
              />

              {/* Subtle paper highlight along top edge */}
              <line
                x1={left + box.rx}
                y1={top + 2}
                x2={left + box.w - box.rx}
                y2={top + 2}
                stroke="var(--stage-highlight-top)"
                strokeWidth={1.5}
                strokeLinecap="round"
              />

              {/* Optional semantic inline icon tile */}
              {box.hasIcon && (
                <g>
                  <rect
                    x={left + 10}
                    y={top + (box.h - 24) / 2}
                    width={24}
                    height={24}
                    rx={6.5}
                    fill={node.tone === 'dark' ? 'rgba(255,255,255,0.1)' : 'var(--sheet)'}
                    fillOpacity={node.tone === 'dark' ? 1 : 0.72}
                    stroke={node.tone === 'dark' ? 'rgba(255,255,255,0.22)' : 'var(--line-strong)'}
                    strokeWidth={1}
                  />
                  {renderNodeIcon(
                    node.icon,
                    left + 15,
                    top + (box.h - 14) / 2,
                    node.tone === 'dark' ? palette.text : palette.stroke
                  )}
                </g>
              )}

              {/* Primary bold label */}
              <text
                x={textStartX}
                y={firstTitleY}
                textAnchor={textAnchor}
                fontSize={titleFs}
                fontWeight={800}
                fill={palette.text}
              >
                {box.labelLines.map((line, lineIdx) => (
                  <tspan key={lineIdx} x={textStartX} dy={lineIdx === 0 ? 0 : titleFs + 3}>
                    {line}
                  </tspan>
                ))}
              </text>

              {/* Muted sublabel */}
              {box.subLines.length > 0 && (
                <text
                  x={textStartX}
                  y={firstTitleY + box.labelLines.length * (titleFs + 3) + 1.5}
                  textAnchor={textAnchor}
                  fontSize={subFs}
                  fontWeight={600}
                  fill={palette.subtext}
                >
                  {box.subLines.map((line, lineIdx) => (
                    <tspan key={lineIdx} x={textStartX} dy={lineIdx === 0 ? 0 : subFs + 2.5}>
                      {line}
                    </tspan>
                  ))}
                </text>
              )}

              {/* Top-right floating badge pill */}
              {node.badge && (() => {
                const badgeText = wrapText(node.badge, 98, 9.2, 1)[0];
                const bw = Math.max(38, measureTextPx(badgeText, 9.2) + 14);
                const bx = left + box.w - bw + 6;
                const by = top - 10;
                return (
                  <g transform={`translate(${bx}, ${by})`}>
                    <rect
                      x={0}
                      y={0}
                      width={bw}
                      height={18}
                      rx={9}
                      fill={palette.badgeBg}
                      stroke="var(--edge)"
                      strokeWidth={1.15}
                    />
                    <text
                      x={bw / 2}
                      y={12.3}
                      textAnchor="middle"
                      fontSize={9.2}
                      fontWeight={800}
                      fill="var(--ink)"
                    >
                      {badgeText}
                    </text>
                  </g>
                );
              })()}

              {/* Floating utilization meter pill above node */}
              {node.meter && (() => {
                const pct = Math.max(0, Math.min(100, node.meter.value));
                const mStatus = node.meter.status ?? (pct > 85 ? 'bad' : pct > 65 ? 'warn' : 'good');
                const mColor =
                  mStatus === 'bad'
                    ? 'var(--kpi-bad)'
                    : mStatus === 'warn'
                      ? 'var(--kpi-warn)'
                      : 'var(--kpi-good)';
                const barW = 46;
                const labelW = measureTextPx(node.meter.label, 9.4);
                const pillW = Math.round(barW + labelW + 20);
                const mx = Math.max(12, Math.min(1000 - pillW - 12, node.x - pillW / 2));
                const my = Math.max(6, top - (node.badge ? 31 : 25));

                return (
                  <g transform={`translate(${mx}, ${my})`}>
                    <rect
                      x={1}
                      y={1.5}
                      width={pillW}
                      height={19}
                      rx={9.5}
                      fill="var(--stage-shadow-ambient)"
                    />
                    <rect
                      x={0}
                      y={0}
                      width={pillW}
                      height={19}
                      rx={9.5}
                      fill="var(--sheet)"
                      stroke="var(--edge)"
                      strokeWidth={1.15}
                    />
                    {/* Meter track */}
                    <rect
                      x={7}
                      y={6.5}
                      width={barW}
                      height={6}
                      rx={3}
                      fill="var(--paper)"
                      stroke="var(--line-strong)"
                      strokeWidth={0.8}
                    />
                    <rect
                      x={7}
                      y={6.5}
                      width={(barW * pct) / 100}
                      height={6}
                      rx={3}
                      fill={mColor}
                    />
                    <text
                      x={7 + barW + 6}
                      y={12.8}
                      fontSize={9.3}
                      fontWeight={800}
                      fill="var(--ink)"
                    >
                      {node.meter.label}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </g>

      {/* 5. Floating Edge Labels (rendered above edges & nodes for crisp legibility) */}
      <g>
        {resolvedEdges.map(({ edge, idx, geom, status, strokeColor }) => {
          if (!edge.label) return null;
          const labelText = wrapText(edge.label, 148, 9.8, 1)[0];
          const lw = Math.max(36, measureTextPx(labelText, 9.8) + 14);
          const lx = Math.max(10, Math.min(1000 - lw - 10, geom.midX - lw / 2));
          const ly = Math.max(8, Math.min(540, geom.midY - 10));

          return (
            <g
              key={`elabel-${idx}`}
              opacity={status === 'dimmed' ? 0.45 : 1}
              transform={`translate(${lx}, ${ly})`}
            >
              <rect
                x={0}
                y={0}
                width={lw}
                height={19}
                rx={6}
                fill="var(--stage-frosted)"
                stroke={status === 'active' || status === 'error' ? strokeColor : 'var(--line-strong)'}
                strokeWidth={1.1}
              />
              <text
                x={lw / 2}
                y={12.8}
                textAnchor="middle"
                fontSize={9.6}
                fontWeight={700}
                fill="var(--ink)"
              >
                {labelText}
              </text>
            </g>
          );
        })}
      </g>

      {/* 6. Floating Callout Pills */}
      <g>{(scene.callouts ?? []).map((callout, idx) => renderCallout(callout, idx))}</g>

      {/* 7. Optional Embedded Frosted Mini-Chart Card */}
      {scene.miniChart && renderMiniChart(scene.miniChart, uid)}
    </svg>
  );
}
