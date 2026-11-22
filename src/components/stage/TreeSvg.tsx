import { useId } from 'react';
import type {
  AccentTone,
  TreeAnnotation,
  TreeEdge,
  TreeFilePreview,
  TreeNode,
  TreeNodeKind,
  TreeScene,
} from '../../types/lesson';

export interface TreeSvgProps {
  scene: TreeScene;
  prevScene?: TreeScene;
  enterKey?: string;
  isPlaying: boolean;
  reducedMotion?: boolean;
}

interface KindStyle {
  strip: string;
  tint: string;
  tag: string;
}

const KIND_STYLES: Record<TreeNodeKind, KindStyle> = {
  session: {
    strip: 'var(--edge)',
    tint: 'var(--paper-2)',
    tag: 'session',
  },
  user: {
    strip: 'var(--blue-stroke)',
    tint: 'var(--blue)',
    tag: 'user',
  },
  assistant: {
    strip: 'var(--green-stroke)',
    tint: 'var(--green)',
    tag: 'asst',
  },
  tool: {
    strip: 'var(--orange-stroke)',
    tint: 'var(--orange)',
    tag: 'tool',
  },
  compaction: {
    strip: 'var(--rust)',
    tint: 'var(--orange)',
    tag: 'compact',
  },
  branch_summary: {
    strip: 'var(--violet-stroke)',
    tint: 'var(--violet)',
    tag: 'summary',
  },
  context_edit: {
    strip: 'var(--ch-teal)',
    tint: 'var(--mint)',
    tag: 'edit',
  },
  label: {
    strip: 'var(--rose-stroke)',
    tint: 'var(--rose)',
    tag: 'label',
  },
};

const ANNOTATION_TONE: Record<AccentTone, { bg: string; stroke: string }> = {
  green: { bg: 'var(--green)', stroke: 'var(--green-stroke)' },
  violet: { bg: 'var(--violet)', stroke: 'var(--violet-stroke)' },
  blue: { bg: 'var(--blue)', stroke: 'var(--blue-stroke)' },
  orange: { bg: 'var(--orange)', stroke: 'var(--orange-stroke)' },
  rose: { bg: 'var(--rose)', stroke: 'var(--rose-stroke)' },
};

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

function truncateText(text: string, maxWidthPx: number, fontSize: number): string {
  if (measureTextPx(text, fontSize) <= maxWidthPx) return text;
  let out = '';
  for (const ch of text) {
    if (measureTextPx(out + ch + '…', fontSize) > maxWidthPx) break;
    out += ch;
  }
  return out + '…';
}

interface TreeNodeLayout {
  node: TreeNode;
  w: number;
  h: number;
  x: number;
  y: number;
  labelText: string;
  subText?: string;
}

function renderFilePreview(
  preview: TreeFilePreview,
  clipId: string,
  prevPreview: TreeFilePreview | undefined,
  enterKey: string,
  reducedMotion: boolean
) {
  const x = 648;
  const y = 30;
  const w = 334;
  const h = 500;
  const headerH = 38;
  const bodyPadY = 14;
  const availH = h - headerH - bodyPadY * 2 - 18;
  const maxVisibleLines = Math.min(preview.lines.length, Math.max(8, Math.floor(availH / 20)));
  const lineH = Math.min(27, Math.max(19, availH / Math.max(1, maxVisibleLines)));
  const visibleLines = preview.lines.slice(0, maxVisibleLines);
  const hiddenCount = Math.max(0, preview.lines.length - visibleLines.length);

  const hasPrevPreview = Boolean(prevPreview);
  const prevLineTexts = new Set<string>(prevPreview?.lines.map((l) => l.text) ?? []);
  const lineStartDelay = hasPrevPreview ? 120 : 280;
  let freshLineCounter = 0;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g
        key={hasPrevPreview ? 'stay' : enterKey}
        className={!hasPrevPreview && !reducedMotion ? 'stage-node-enter' : undefined}
        style={!hasPrevPreview ? { animationDelay: '100ms' } : undefined}
      >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={headerH} width={w} height={h - headerH} rx={0} />
        </clipPath>
      </defs>

      {/* Drop shadow */}
      <rect x={3} y={4} width={w} height={h} rx={11} fill="var(--stage-shadow-ambient)" />

      {/* Terminal body */}
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        rx={11}
        fill="var(--stage-terminal-bg)"
        stroke="var(--edge)"
        strokeWidth={1.6}
      />

      {/* Header bar */}
      <path
        d={`M 0 11 Q 0 0 11 0 L ${w - 11} 0 Q ${w} 0 ${w} 11 L ${w} ${headerH} L 0 ${headerH} Z`}
        fill="var(--stage-terminal-bar)"
      />
      <line x1={0} y1={headerH} x2={w} y2={headerH} stroke="var(--edge)" strokeWidth={1} opacity={0.5} />

      {/* Three drafting dots */}
      <circle cx={15} cy={19} r={3.5} fill="#e5534b" opacity={0.85} />
      <circle cx={27} cy={19} r={3.5} fill="#e8a33a" opacity={0.85} />
      <circle cx={39} cy={19} r={3.5} fill="#7fc278" opacity={0.85} />

      <text x={52} y={22.5} fontSize={10.4} fontWeight={700} fill="var(--stage-terminal-ink)">
        {truncateText(preview.title, 156, 10.4)}
      </text>

      {/* Append-only badge */}
      <g transform={`translate(${w - 82}, 10)`}>
        <rect
          x={0}
          y={0}
          width={72}
          height={18}
          rx={5}
          fill="rgba(127, 194, 120, 0.16)"
          stroke="rgba(127, 194, 120, 0.55)"
          strokeWidth={1}
        />
        <text
          x={36}
          y={12.2}
          textAnchor="middle"
          fontSize={8.5}
          fontWeight={800}
          fill="#96cb74"
        >
          APPEND-ONLY
        </text>
      </g>

      {/* JSONL lines */}
      <g clipPath={`url(#${clipId})`}>
        {visibleLines.map((line, idx) => {
          const ly = headerH + bodyPadY + idx * lineH;
          const isHi = Boolean(line.highlight);
          const isMuted = Boolean(line.muted);
          const displayLine = truncateText(line.text, w - 42, 9.4);
          const isLinePersisted = hasPrevPreview && prevLineTexts.has(line.text);
          const lineDelay = isLinePersisted
            ? 0
            : lineStartDelay + freshLineCounter++ * 115;

          return (
            <g key={line.id || `line-${idx}`} transform={`translate(0, ${ly})`} opacity={isMuted ? 0.44 : 1}>
              <g
                key={isLinePersisted ? 'stay' : enterKey}
                className={!isLinePersisted && !reducedMotion ? 'stage-node-enter' : undefined}
                style={!isLinePersisted ? { animationDelay: `${lineDelay}ms` } : undefined}
              >
                {isHi && (
                  <>
                    <rect
                      x={6}
                      y={-2}
                      width={w - 12}
                      height={lineH - 2}
                      rx={4}
                      fill="rgba(127, 194, 120, 0.16)"
                    />
                    <rect x={6} y={-2} width={3} height={lineH - 2} rx={1.5} fill="#7fc278" />
                  </>
                )}

                {/* Line number */}
                <text
                  x={26}
                  y={lineH * 0.56}
                  textAnchor="end"
                  fontSize={8.8}
                  fontWeight={600}
                  fill="var(--stage-terminal-muted)"
                >
                  {String(idx + 1).padStart(2, '0')}
                </text>

                {/* JSONL text */}
                <text
                  x={34}
                  y={lineH * 0.56}
                  fontSize={9.4}
                  fontWeight={isHi ? 700 : 500}
                  fill={isHi ? '#b7eb9f' : 'var(--stage-terminal-ink)'}
                >
                  {displayLine}
                </text>
              </g>
            </g>
          );
        })}

        {/* Bottom append cursor indicator */}
        <g transform={`translate(14, ${Math.min(h - 22, headerH + bodyPadY + visibleLines.length * lineH + 4)})`}>
          <g
            key={freshLineCounter === 0 && hasPrevPreview ? 'stay' : enterKey}
            className={
              !(freshLineCounter === 0 && hasPrevPreview) && !reducedMotion
                ? 'stage-node-enter'
                : undefined
            }
            style={
              !(freshLineCounter === 0 && hasPrevPreview)
                ? { animationDelay: `${lineStartDelay + freshLineCounter * 115}ms` }
                : undefined
            }
          >
            <text x={0} y={10} fontSize={9.2} fontWeight={700} fill="#7fc278" opacity={0.88}>
              {hiddenCount > 0 ? `+ 其余 ${hiddenCount} 行 · append(entry) → EOF` : '+ append(entry) → EOF'}
            </text>
          </g>
        </g>
      </g>
      </g>
    </g>
  );
}

function renderAnnotation(
  ann: TreeAnnotation,
  idx: number,
  maxX: number,
  delayMs: number,
  enterKey: string,
  reducedMotion: boolean
) {
  const tone = ANNOTATION_TONE[ann.tone ?? 'violet'];
  const text = truncateText(ann.text, 230, 10.2);
  const w = Math.max(70, measureTextPx(text, 10.2) + 22);
  const h = 24;
  const cx = Math.max(w / 2 + 12, Math.min(maxX - w / 2 - 12, ann.x));
  const cy = Math.max(h / 2 + 10, Math.min(548 - h / 2, ann.y));

  return (
    <g key={`ann-${idx}`} transform={`translate(${cx - w / 2}, ${cy - h / 2})`}>
      <g
        key={enterKey}
        className={!reducedMotion ? 'stage-label-enter' : undefined}
        style={!reducedMotion ? { animationDelay: `${delayMs}ms` } : undefined}
      >
        <rect x={1.5} y={2} width={w} height={h} rx={7} fill="var(--stage-shadow-ambient)" />
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          rx={7}
          fill={tone.bg}
          stroke={tone.stroke}
          strokeWidth={1.3}
        />
        <text
          x={w / 2}
          y={15.6}
          textAnchor="middle"
          fontSize={10.1}
          fontWeight={800}
          fill="var(--ink)"
        >
          {text}
        </text>
      </g>
    </g>
  );
}

export function TreeSvg({
  scene,
  prevScene,
  enterKey = '0-0',
  isPlaying,
  reducedMotion = false,
}: TreeSvgProps) {
  const uid = useId().replace(/:/g, '');
  const dotPatternId = `${uid}-dot-grid`;
  const vigGradId = `${uid}-tree-vig`;
  const vigMaskId = `${uid}-tree-mask`;
  const hatchPatternId = `${uid}-compacted-hatch`;
  const fileClipId = `${uid}-file-clip`;

  const hasPreview = Boolean(scene.filePreview);
  const treeMaxRight = hasPreview ? 632 : 982;
  const hasOutwardSummaryEdge = (scene.edges ?? []).some(
    (e) => e.kind === 'lca_summary' || e.kind === 'compaction_link'
  );
  const nodeSafeMaxRight = hasPreview ? (hasOutwardSummaryEdge ? 548 : 596) : 982;

  // Measure cards and compute safe coordinates so tree never overlaps right-hand JSONL preview
  const rawLayouts: TreeNodeLayout[] = scene.nodes.map((node) => {
    const labelW = measureTextPx(node.label, 11.4);
    const subW = node.sublabel ? measureTextPx(node.sublabel, 9.4) : 0;
    const minCardW = hasPreview ? 128 : 144;
    const maxCardW = hasPreview ? 160 : 196;
    const w = Math.round(Math.max(minCardW, Math.min(maxCardW, Math.max(labelW, subW) + 26)));
    const h = node.sublabel ? 58 : 46;
    const availW = w - 22;
    return {
      node,
      w,
      h,
      x: node.x,
      y: Math.max(h / 2 + 16, Math.min(560 - h / 2 - 12, node.y)),
      labelText: truncateText(node.label, availW, 11.4),
      subText: node.sublabel ? truncateText(node.sublabel, availW, 9.4) : undefined,
    };
  });

  // Auto-fit node X coordinates into the left safe zone [20..nodeSafeMaxRight] when filePreview is present
  if (rawLayouts.length > 0) {
    const minLeft = Math.min(...rawLayouts.map((l) => l.x - l.w / 2));
    const maxRight = Math.max(...rawLayouts.map((l) => l.x + l.w / 2));
    const leftBound = 20;
    const availSpan = nodeSafeMaxRight - leftBound;
    const currentSpan = maxRight - minLeft;

    if (maxRight > nodeSafeMaxRight || minLeft < leftBound) {
      if (currentSpan > availSpan && currentSpan > 1) {
        const minCenter = Math.min(...rawLayouts.map((l) => l.x));
        const maxCenter = Math.max(...rawLayouts.map((l) => l.x));
        const maxHalfW = Math.max(...rawLayouts.map((l) => l.w / 2));
        const targetMinC = leftBound + maxHalfW;
        const targetMaxC = Math.max(targetMinC + 10, nodeSafeMaxRight - maxHalfW);
        const cSpan = Math.max(1, maxCenter - minCenter);
        for (const l of rawLayouts) {
          l.x = Math.round(
            targetMinC + ((l.x - minCenter) / cSpan) * (targetMaxC - targetMinC)
          );
        }
      } else {
        const shift =
          maxRight > nodeSafeMaxRight
            ? nodeSafeMaxRight - maxRight
            : leftBound - minLeft;
        for (const l of rawLayouts) {
          l.x = Math.round(l.x + shift);
        }
      }
    }
  }

  const layoutById = new Map<string, TreeNodeLayout>();
  const layoutByHex = new Map<string, TreeNodeLayout>();
  for (const item of rawLayouts) {
    layoutById.set(item.node.id, item);
    layoutByHex.set(item.node.hexId, item);
  }

  // Cross-step persistence (match nodes primarily by hexId, fallback by id)
  const prevHexIds = new Set<string>();
  const prevNodeIds = new Set<string>();
  const prevSpecialEdges = new Set<string>();
  if (prevScene) {
    const prevHexById = new Map<string, string>();
    for (const n of prevScene.nodes) {
      prevHexIds.add(n.hexId);
      prevNodeIds.add(n.id);
      prevHexById.set(n.id, n.hexId);
    }
    for (const e of prevScene.edges ?? []) {
      const k = e.kind ?? 'parent';
      const fHex = prevHexById.get(e.from) ?? e.from;
      const tHex = prevHexById.get(e.to) ?? e.to;
      prevSpecialEdges.add(`${e.from}->${e.to}:${k}:${e.label ?? ''}`);
      prevSpecialEdges.add(`${fHex}->${tHex}:${k}:${e.label ?? ''}`);
    }
  }

  const persistedNodeIds = new Set<string>();
  for (const item of rawLayouts) {
    if (
      prevScene &&
      (prevHexIds.has(item.node.hexId) || prevNodeIds.has(item.node.id))
    ) {
      persistedNodeIds.add(item.node.id);
    }
  }

  // Compute BFS tree order from roots (tie-broken by y then x)
  const childrenMap = new Map<string, TreeNodeLayout[]>();
  const roots: TreeNodeLayout[] = [];
  for (const item of rawLayouts) {
    const pid = item.node.parentId;
    const parentLayout = pid ? layoutById.get(pid) ?? layoutByHex.get(pid) : undefined;
    if (parentLayout && parentLayout.node.id !== item.node.id) {
      const list = childrenMap.get(parentLayout.node.id) ?? [];
      list.push(item);
      childrenMap.set(parentLayout.node.id, list);
    } else {
      roots.push(item);
    }
  }
  const byPos = (a: TreeNodeLayout, b: TreeNodeLayout) => a.y - b.y || a.x - b.x;
  roots.sort(byPos);
  for (const [, list] of childrenMap) {
    list.sort(byPos);
  }

  const bfsOrdered: TreeNodeLayout[] = [];
  const visitedTree = new Set<string>();
  const runTreeBfs = (seeds: TreeNodeLayout[]) => {
    const queue = [...seeds];
    for (const s of queue) visitedTree.add(s.node.id);
    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      bfsOrdered.push(curr);
      for (const child of childrenMap.get(curr.node.id) ?? []) {
        if (!visitedTree.has(child.node.id)) {
          visitedTree.add(child.node.id);
          queue.push(child);
        }
      }
    }
  };
  runTreeBfs(roots);
  if (visitedTree.size < rawLayouts.length) {
    const remaining = rawLayouts.filter((l) => !visitedTree.has(l.node.id)).sort(byPos);
    for (const rem of remaining) {
      if (!visitedTree.has(rem.node.id)) runTreeBfs([rem]);
    }
  }

  const freshOrdered = bfsOrdered.filter((l) => !persistedNodeIds.has(l.node.id));
  const freshStepMs = Math.min(
    230,
    Math.max(130, Math.round(980 / Math.max(1, freshOrdered.length)))
  );
  const freshRankMap = new Map<string, number>();
  freshOrdered.forEach((l, i) => freshRankMap.set(l.node.id, i));

  const nodeDelayMs = (nodeId: string): number => {
    if (persistedNodeIds.has(nodeId)) return 0;
    return 90 + (freshRankMap.get(nodeId) ?? 0) * freshStepMs;
  };

  let lastNodeDelay = 0;
  for (const l of freshOrdered) {
    const d = nodeDelayMs(l.node.id);
    if (d > lastNodeDelay) lastNodeDelay = d;
  }

  // Merge explicit edges with auto-synthesized parentId edges
  const explicitEdges: TreeEdge[] = scene.edges ?? [];
  const edgeKeys = new Set<string>(
    explicitEdges.map((e) => `${e.from}->${e.to}:${e.kind ?? 'parent'}`)
  );
  const allEdges: TreeEdge[] = [...explicitEdges];

  for (const item of rawLayouts) {
    const pid = item.node.parentId;
    if (!pid) continue;
    const parentLayout = layoutById.get(pid) ?? layoutByHex.get(pid);
    if (!parentLayout) continue;
    const key = `${parentLayout.node.id}->${item.node.id}:parent`;
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      allEdges.push({
        from: parentLayout.node.id,
        to: item.node.id,
        kind: 'parent',
      });
    }
  }

  const arrowParentId = `${uid}-arr-parent`;
  const arrowVioletId = `${uid}-arr-violet`;
  const arrowAmberId = `${uid}-arr-amber`;

  // Precompute edge geometry & reveal timings so masks can live cleanly in <defs>
  const resolvedTreeEdges = allEdges
    .map((edge, idx) => {
      const from = layoutById.get(edge.from) ?? layoutByHex.get(edge.from);
      const to = layoutById.get(edge.to) ?? layoutByHex.get(edge.to);
      if (!from || !to) return null;

      const kind = edge.kind ?? 'parent';
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const isVertical = Math.abs(dy) >= Math.abs(dx) * 0.65;

      let sx: number;
      let sy: number;
      let ex: number;
      let ey: number;
      let d: string;
      let midX: number;
      let midY: number;

      if (kind === 'parent') {
        if (isVertical) {
          const dir = dy >= 0 ? 1 : -1;
          sx = from.x;
          sy = from.y + dir * (from.h / 2 + 2);
          ex = to.x;
          ey = to.y - dir * (to.h / 2 + 6);
          const cy = (sy + ey) / 2;
          d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${sx.toFixed(1)} ${cy.toFixed(1)}, ${ex.toFixed(1)} ${cy.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
          midX = (sx + ex) / 2;
          midY = cy;
        } else {
          const dir = dx >= 0 ? 1 : -1;
          sx = from.x + dir * (from.w / 2 + 2);
          sy = from.y;
          ex = to.x - dir * (to.w / 2 + 6);
          ey = to.y;
          const cx = (sx + ex) / 2;
          d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${cx.toFixed(1)} ${sy.toFixed(1)}, ${cx.toFixed(1)} ${ey.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
          midX = cx;
          midY = (sy + ey) / 2;
        }
      } else {
        // Curved arc for lca_summary or compaction_link bowing cleanly outward
        const dirX = dx >= 0 ? 1 : -1;
        const dirY = dy >= 0 ? 1 : -1;
        if (isVertical) {
          sx = from.x + (kind === 'lca_summary' ? from.w / 2 + 2 : -from.w / 2 - 2);
          sy = from.y;
          ex = to.x + (kind === 'lca_summary' ? to.w / 2 + 6 : -to.w / 2 - 6);
          ey = to.y;
          const bow = kind === 'lca_summary' ? 56 : -56;
          const cpx = bow > 0 ? Math.max(sx, ex) + bow : Math.min(sx, ex) + bow;
          const safeCpx = Math.max(20, Math.min(treeMaxRight - 14, cpx));
          d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${safeCpx.toFixed(1)} ${((sy + ey) / 2).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
          midX = 0.25 * sx + 0.5 * safeCpx + 0.25 * ex;
          midY = (sy + ey) / 2;
        } else {
          sx = from.x + dirX * (from.w / 2 + 2);
          sy = from.y + dirY * 6;
          ex = to.x - dirX * (to.w / 2 + 6);
          ey = to.y;
          const cpy = Math.min(sy, ey) - 42;
          d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${((sx + ex) / 2).toFixed(1)} ${cpy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
          midX = (sx + ex) / 2;
          midY = 0.25 * sy + 0.5 * cpy + 0.25 * ey;
        }
      }

      const endpointsPersisted =
        Boolean(prevScene) &&
        persistedNodeIds.has(from.node.id) &&
        persistedNodeIds.has(to.node.id);
      const isEdgePersisted =
        endpointsPersisted &&
        (kind === 'parent' ||
          prevSpecialEdges.has(`${from.node.id}->${to.node.id}:${kind}:${edge.label ?? ''}`) ||
          prevSpecialEdges.has(`${from.node.hexId}->${to.node.hexId}:${kind}:${edge.label ?? ''}`));

      const fromDelay = nodeDelayMs(from.node.id);
      const toDelay = nodeDelayMs(to.node.id);
      const edgeDelayMs = isEdgePersisted
        ? 0
        : kind === 'parent'
          ? Math.max(0, fromDelay + 80)
          : Math.max(fromDelay, toDelay) + 120;

      const isAbandoned =
        from.node.status === 'abandoned' || to.node.status === 'abandoned';
      const stroke =
        kind === 'lca_summary'
          ? 'var(--violet-stroke)'
          : kind === 'compaction_link'
            ? 'var(--orange-stroke)'
            : isAbandoned
              ? 'var(--line-strong)'
              : 'var(--edge)';
      const marker =
        kind === 'lca_summary'
          ? arrowVioletId
          : kind === 'compaction_link'
            ? arrowAmberId
            : arrowParentId;
      const pathId = `${uid}-te-${idx}`;
      const dashed = kind !== 'parent' || isAbandoned;

      return {
        edge,
        idx,
        kind,
        d,
        midX,
        midY,
        isAbandoned,
        stroke,
        marker,
        pathId,
        dashed,
        isEdgePersisted,
        edgeDelayMs,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <svg
      className="stage-svg"
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={scene.title ?? 'Pi JSONL v3 会话树可视化'}
    >
      <defs>
        {/* Subtle drafting dot grid */}
        <pattern id={dotPatternId} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.2" fill="var(--grid-dot)" />
        </pattern>

        <radialGradient id={vigGradId} cx="46%" cy="50%" r="58%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="72%" stopColor="#ffffff" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <mask id={vigMaskId}>
          <rect x="0" y="0" width="1000" height="560" fill={`url(#${vigGradId})`} />
        </mask>

        {/* Diagonal hatch for compacted archival entries */}
        <pattern
          id={hatchPatternId}
          width="8"
          height="8"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--stage-swatch-hatch)" strokeWidth="2.4" />
        </pattern>

        <marker
          id={arrowParentId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 8.6 5 L 1 8.5 z" fill="var(--edge)" />
        </marker>
        <marker
          id={arrowVioletId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6.5"
          markerHeight="6.5"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 8.6 5 L 1 8.5 z" fill="var(--violet-stroke)" />
        </marker>
        <marker
          id={arrowAmberId}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6.5"
          markerHeight="6.5"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 8.6 5 L 1 8.5 z" fill="var(--orange-stroke)" />
        </marker>

        {/* Progressive edge-draw masks */}
        {!reducedMotion &&
          resolvedTreeEdges
            .filter((item) => !item.isEdgePersisted)
            .map(({ pathId, d, edgeDelayMs }) => (
              <mask
                key={`${pathId}-mask-${enterKey}`}
                id={`${pathId}-mask-${enterKey}`}
                maskUnits="userSpaceOnUse"
                x="-40"
                y="-40"
                width="1080"
                height="640"
              >
                <path
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={28}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stage-edge-draw"
                  style={{ animationDelay: `${edgeDelayMs}ms` }}
                />
              </mask>
            ))}
      </defs>

      {/* 1. Drafting Dot Grid */}
      <rect
        x="0"
        y="0"
        width="1000"
        height="560"
        fill={`url(#${dotPatternId})`}
        mask={`url(#${vigMaskId})`}
      />

      {/* 2. Smooth Cubic Bézier Tree Edges */}
      <g>
        {resolvedTreeEdges.map(
          ({
            edge,
            idx,
            kind,
            d,
            midX,
            midY,
            isAbandoned,
            stroke,
            marker,
            pathId,
            dashed,
            isEdgePersisted,
            edgeDelayMs,
          }) => {
            const edgeMask =
              !isEdgePersisted && !reducedMotion
                ? `url(#${pathId}-mask-${enterKey})`
                : undefined;

            return (
              <g key={`edge-${edge.from}-${edge.to}-${idx}`} opacity={isAbandoned ? 0.5 : 1}>
                <g mask={edgeMask}>
                  <path
                    id={pathId}
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={kind === 'parent' ? 1.85 : 2.1}
                    strokeDasharray={dashed ? (kind === 'lca_summary' ? '6 4' : '5 3.5') : undefined}
                    strokeLinecap="round"
                    markerEnd={`url(#${marker})`}
                    className={edge.animated && dashed ? 'stage-dash-flow' : undefined}
                  />
                </g>

                {edge.animated && !reducedMotion && (
                  <g
                    key={isEdgePersisted ? 'pkt-stay' : `pkt-${enterKey}`}
                    className={!isEdgePersisted ? 'stage-packet-enter' : undefined}
                    style={!isEdgePersisted ? { animationDelay: `${edgeDelayMs + 300}ms` } : undefined}
                  >
                    <g opacity={isPlaying ? 1 : 0.72}>
                      <circle r={6} fill={stroke} fillOpacity={0.25}>
                        <animateMotion dur="2.1s" repeatCount="indefinite">
                          <mpath href={`#${pathId}`} />
                        </animateMotion>
                      </circle>
                      <circle r={3.2} fill={stroke} stroke="var(--stage-bg)" strokeWidth={1}>
                        <animateMotion dur="2.1s" repeatCount="indefinite">
                          <mpath href={`#${pathId}`} />
                        </animateMotion>
                      </circle>
                    </g>
                  </g>
                )}

                {edge.label && (() => {
                  const labelText = truncateText(edge.label, 140, 9.4);
                  const lw = Math.max(44, measureTextPx(labelText, 9.4) + 14);
                  const lx = Math.max(10, Math.min(treeMaxRight - lw - 6, midX - lw / 2));
                  const ly = Math.max(8, Math.min(538, midY - 9.5));
                  const pillFill =
                    kind === 'lca_summary'
                      ? 'var(--violet)'
                      : kind === 'compaction_link'
                        ? 'var(--orange)'
                        : 'var(--sheet)';
                  return (
                    <g transform={`translate(${lx}, ${ly})`}>
                      <g
                        key={isEdgePersisted ? 'stay' : enterKey}
                        className={!isEdgePersisted && !reducedMotion ? 'stage-label-enter' : undefined}
                        style={
                          !isEdgePersisted ? { animationDelay: `${edgeDelayMs + 220}ms` } : undefined
                        }
                      >
                        <rect
                          x={0}
                          y={0}
                          width={lw}
                          height={19}
                          rx={6}
                          fill={pillFill}
                          stroke={stroke}
                          strokeWidth={1.1}
                        />
                        <text
                          x={lw / 2}
                          y={12.6}
                          textAnchor="middle"
                          fontSize={9.3}
                          fontWeight={700}
                          fill="var(--ink)"
                        >
                          {labelText}
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </g>
            );
          }
        )}
      </g>

      {/* 3. Tactile JSONL Node Cards */}
      <g>
        {rawLayouts.map((item) => {
          const { node, w, h, x, y, labelText, subText } = item;
          const left = x - w / 2;
          const top = y - h / 2;
          const style = KIND_STYLES[node.kind];
          const status = node.status;
          const isPersisted = persistedNodeIds.has(node.id);
          const delayMs = nodeDelayMs(node.id);

          const isActive = status === 'active';
          const isHighlight = status === 'highlight';
          const isNew = status === 'new';
          const isCompacted = status === 'compacted';
          const isAbandoned = status === 'abandoned';

          const cardFill = isActive
            ? 'var(--green)'
            : isHighlight
              ? style.tint
              : isCompacted
                ? 'var(--paper-2)'
                : 'var(--sheet)';

          const borderStroke = isHighlight
            ? style.strip
            : isAbandoned
              ? 'var(--line-strong)'
              : 'var(--edge)';

          const hexDisplay = node.hexId.slice(0, 8);

          return (
            <g key={node.id} opacity={isAbandoned ? 0.48 : 1}>
              <g
                key={isPersisted ? 'stay' : enterKey}
                className={!isPersisted && !reducedMotion ? 'stage-node-enter' : undefined}
                style={!isPersisted ? { animationDelay: `${delayMs}ms` } : undefined}
              >
              <title>
                [{node.hexId}] {node.label}
                {node.sublabel ? ` — ${node.sublabel}` : ''}
              </title>
              {/* Active / Highlight / New outer aura */}
              {(isActive || isHighlight || isNew) && (
                <rect
                  x={left - 4.5}
                  y={top - 4.5}
                  width={w + 9}
                  height={h + 9}
                  rx={12}
                  fill="none"
                  stroke={isNew ? 'var(--kpi-good)' : style.strip}
                  strokeWidth={3.5}
                  className="stage-active-pulse"
                />
              )}

              {/* Grounded pop shadow */}
              <rect
                x={left + 6}
                y={top + 8}
                width={w}
                height={h}
                rx={9}
                fill="var(--stage-shadow-ambient)"
              />
              <rect
                x={left + 4}
                y={top + 5}
                width={w}
                height={h}
                rx={9}
                fill="var(--line-strong)"
                stroke={borderStroke}
                strokeWidth={1.2}
              />

              {/* Main rounded card */}
              <rect
                x={left}
                y={top}
                width={w}
                height={h}
                rx={9}
                fill={cardFill}
                stroke={borderStroke}
                strokeWidth={isActive || isHighlight ? 2.1 : 1.5}
                strokeDasharray={isAbandoned ? '4 3' : undefined}
              />

              {/* Compacted subtle hatch overlay */}
              {isCompacted && (
                <rect
                  x={left + 6}
                  y={top + 1}
                  width={w - 7}
                  height={h - 2}
                  rx={8}
                  fill={`url(#${hatchPatternId})`}
                  opacity={0.75}
                />
              )}

              {/* Left color-coded kind strip */}
              <path
                d={`M ${left + 1} ${top + 9} Q ${left + 1} ${top + 1} ${left + 8} ${top + 1} L ${left + 8} ${top + h - 1} Q ${left + 1} ${top + h - 1} ${left + 1} ${top + h - 9} Z`}
                fill={style.strip}
              />

              {/* Top row: 8-char hexId badge + kind tag */}
              <g transform={`translate(${left + 13}, ${top + 6})`}>
                <rect
                  x={0}
                  y={0}
                  width={58}
                  height={14}
                  rx={3.5}
                  fill="var(--paper)"
                  stroke="var(--line-strong)"
                  strokeWidth={0.8}
                />
                <text
                  x={29}
                  y={10.2}
                  textAnchor="middle"
                  fontSize={8.5}
                  fontWeight={700}
                  fill="var(--ink-2)"
                >
                  {hexDisplay}
                </text>

                <text
                  x={64}
                  y={10.2}
                  fontSize={8.4}
                  fontWeight={800}
                  fill={style.strip}
                  letterSpacing="0.03em"
                >
                  {style.tag.toUpperCase()}
                </text>
              </g>

              {/* Status mini dot on right top */}
              {(isActive || isNew) && (
                <circle
                  cx={left + w - 10}
                  cy={top + 13}
                  r={3.5}
                  fill="var(--kpi-good)"
                  stroke="var(--edge)"
                  strokeWidth={0.9}
                />
              )}

              {/* Main label */}
              <text
                x={left + 13}
                y={top + 35}
                fontSize={11.3}
                fontWeight={800}
                fill="var(--ink)"
              >
                {labelText}
              </text>

              {/* Optional sublabel */}
              {subText && (
                <text
                  x={left + 13}
                  y={top + 50}
                  fontSize={9.3}
                  fontWeight={600}
                  fill="var(--muted)"
                >
                  {subText}
                </text>
              )}

              {/* Optional floating badge pill */}
              {(node.badge || isCompacted) && (() => {
                const badgeText = truncateText(node.badge ?? '已压缩归档', 84, 8.8);
                const bw = Math.max(38, measureTextPx(badgeText, 8.8) + 12);
                const bx = left + w - bw + 4;
                const by = top - 10;
                return (
                  <g transform={`translate(${bx}, ${by})`}>
                    <rect
                      x={0}
                      y={0}
                      width={bw}
                      height={17}
                      rx={8.5}
                      fill={isNew ? 'var(--green)' : isCompacted ? 'var(--orange)' : style.tint}
                      stroke="var(--edge)"
                      strokeWidth={1.1}
                    />
                    <text
                      x={bw / 2}
                      y={11.5}
                      textAnchor="middle"
                      fontSize={8.6}
                      fontWeight={800}
                      fill="var(--ink)"
                    >
                      {badgeText}
                    </text>
                  </g>
                );
              })()}
              </g>
            </g>
          );
        })}
      </g>

      {/* 4. Floating Annotations */}
      <g>
        {(scene.annotations ?? []).map((ann, idx) =>
          renderAnnotation(
            ann,
            idx,
            treeMaxRight,
            lastNodeDelay + 200 + idx * 90,
            enterKey,
            reducedMotion
          )
        )}
      </g>

      {/* 5. Optional Right-Hand Append-Only JSONL File Preview Card */}
      {scene.filePreview &&
        renderFilePreview(
          scene.filePreview,
          fileClipId,
          prevScene?.filePreview,
          enterKey,
          reducedMotion
        )}
    </svg>
  );
}
