import { useId } from 'react';
import type {
  AccentTone,
  TokenCalloutBadge,
  TokenMiniChart,
  TokenSegment,
  TokenSegmentTone,
  TokenSlicesScene,
  TokenTrack,
} from '../../types/lesson';

export interface TokenSlicesSvgProps {
  scene: TokenSlicesScene;
  isPlaying: boolean;
  reducedMotion?: boolean;
}

const SEG_FILL: Record<TokenSegmentTone, string> = {
  neutral: 'var(--sheet)',
  green: 'var(--green)',
  violet: 'var(--violet)',
  blue: 'var(--blue)',
  orange: 'var(--orange)',
  rose: 'var(--rose)',
  muted: 'var(--paper)',
};

const SEG_STROKE: Record<TokenSegmentTone, string> = {
  neutral: 'var(--edge)',
  green: 'var(--green-stroke)',
  violet: 'var(--violet-stroke)',
  blue: 'var(--blue-stroke)',
  orange: 'var(--orange-stroke)',
  rose: 'var(--rose-stroke)',
  muted: 'var(--line-strong)',
};

const BADGE_STYLE: Record<AccentTone, { bg: string; bar: string }> = {
  green: { bg: 'var(--mint)', bar: 'var(--green-stroke)' },
  violet: { bg: 'var(--violet)', bar: 'var(--violet-stroke)' },
  blue: { bg: 'var(--blue)', bar: 'var(--blue-stroke)' },
  orange: { bg: 'var(--orange)', bar: 'var(--orange-stroke)' },
  rose: { bg: 'var(--rose)', bar: 'var(--rose-stroke)' },
};

function resolveSeriesColor(raw: string): string {
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

function truncateText(text: string, maxWidthPx: number, fontSize: number): string {
  if (maxWidthPx <= 8) return '';
  if (measureTextPx(text, fontSize) <= maxWidthPx) return text;
  let out = '';
  for (const ch of text) {
    if (measureTextPx(out + ch + '…', fontSize) > maxWidthPx) break;
    out += ch;
  }
  return out ? out + '…' : '';
}

function formatTokens(val: number): string {
  if (val >= 1000) {
    const k = val / 1000;
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return `${Math.round(val)}`;
}

/**
 * Resolves a horizontal position value that may be authored either in token units
 * (0..totalBudget) or normalized percentage (0..100 when totalBudget > 1000).
 */
function resolveTrackPx(value: number, totalBudget: number, barW: number): number {
  if (value <= 0 || totalBudget <= 0) return 0;
  const fraction =
    totalBudget > 1000 && value <= 100 ? value / 100 : value / totalBudget;
  return Math.max(0, Math.min(barW, fraction * barW));
}

interface PlacedSegment {
  seg: TokenSegment;
  x: number;
  w: number;
}

function renderTrack(
  track: TokenTrack,
  trackIdx: number,
  barY: number,
  barH: number,
  uid: string,
  cachePatId: string,
  reservePatId: string,
  droppedPatId: string
) {
  const barX = 44;
  const barW = 912;
  const clipId = `${uid}-tclip-${trackIdx}`;

  const sumSegTokens = track.segments.reduce((acc, s) => acc + Math.max(0, s.tokens), 0);
  const scaleDenom = Math.max(track.totalBudget, sumSegTokens, 1);

  let cursorX = barX;
  const placed: PlacedSegment[] = track.segments.map((seg) => {
    const rawW = (Math.max(0, seg.tokens) / scaleDenom) * barW;
    // Guarantee non-zero segments remain visible as at least a crisp 4px sliver
    const minW = seg.tokens > 0 ? Math.min(4, Math.max(0, barX + barW - cursorX)) : 0;
    const w = Math.max(minW, Math.min(rawW, Math.max(0, barX + barW - cursorX)));
    const item = { seg, x: cursorX, w };
    cursorX += w;
    return item;
  });
  const totalUsedVisualW = cursorX - barX;

  const usedPct = Math.min(999, Math.round((track.usedTokens / Math.max(1, track.totalBudget)) * 100));
  const usageColor =
    usedPct >= 90 ? 'var(--kpi-bad)' : usedPct >= 75 ? 'var(--kpi-warn)' : 'var(--kpi-good)';

  const hasTopBracket = Boolean(track.cacheHitEnd && track.cacheHitEnd > 0);
  const headerY = hasTopBracket ? barY - 30 : barY - 14;

  // Compute reserve & keepRecent pixels
  const reservePx =
    track.reserveTokens && track.reserveTokens > 0
      ? resolveTrackPx(track.reserveTokens, scaleDenom, barW)
      : 0;
  const keepRecentX =
    track.keepRecentStart !== undefined && track.keepRecentStart > 0
      ? barX + resolveTrackPx(track.keepRecentStart, scaleDenom, barW)
      : undefined;
  const cacheEndPx =
    track.cacheHitEnd && track.cacheHitEnd > 0
      ? resolveTrackPx(track.cacheHitEnd, scaleDenom, barW)
      : 0;
  const cutPx =
    track.cutPointPos !== undefined && track.cutPointPos > 0
      ? resolveTrackPx(track.cutPointPos, scaleDenom, barW)
      : undefined;

  // Collect atomic groups (contiguous or same-name spans)
  const atomicGroups = new Map<string, { minX: number; maxX: number }>();
  for (const p of placed) {
    if (!p.seg.atomicGroup) continue;
    const prev = atomicGroups.get(p.seg.atomicGroup);
    if (!prev) {
      atomicGroups.set(p.seg.atomicGroup, { minX: p.x, maxX: p.x + p.w });
    } else {
      prev.minX = Math.min(prev.minX, p.x);
      prev.maxX = Math.max(prev.maxX, p.x + p.w);
    }
  }

  const budgetText = `${formatTokens(track.usedTokens)} / ${formatTokens(track.totalBudget)} (${usedPct}%)`;
  const budgetPillW = Math.max(114, measureTextPx(budgetText, 10) + 26);

  return (
    <g
      key={track.id || `track-${trackIdx}`}
      className="stage-node-enter"
      style={{ animationDelay: `${trackIdx * 70}ms` }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={barX + 1} y={barY + 1} width={barW - 2} height={barH - 2} rx={8} />
        </clipPath>
      </defs>

      {/* Track Title + Subtitle + Used/Budget Pill */}
      {(() => {
        const maxTitleW = Math.max(120, barW - budgetPillW - 24);
        const safeTitle = truncateText(track.title, maxTitleW, 12.4);
        const titleW = measureTextPx(safeTitle, 12.4);
        const subAvailW = barW - titleW - budgetPillW - 32;
        return (
          <>
            <text x={barX} y={headerY} fontSize={12.4} fontWeight={800} fill="var(--ink)">
              {safeTitle}
            </text>
            {track.subtitle && subAvailW >= 54 && (
              <text
                x={barX + titleW + 12}
                y={headerY}
                fontSize={10.4}
                fontWeight={600}
                fill="var(--muted)"
              >
                {truncateText(track.subtitle, subAvailW, 10.4)}
              </text>
            )}
          </>
        );
      })()}

      {/* Right Budget Readout Pill */}
      <g transform={`translate(${barX + barW - budgetPillW}, ${headerY - 14})`}>
        <rect
          x={0}
          y={0}
          width={budgetPillW}
          height={20}
          rx={6}
          fill="var(--sheet)"
          stroke="var(--edge)"
          strokeWidth={1.15}
        />
        <circle cx={10} cy={10} r={3.5} fill={usageColor} />
        <text x={19} y={13.5} fontSize={10} fontWeight={800} fill="var(--ink)">
          {budgetText}
        </text>
      </g>

      {/* KV Cache Hit Overhead Bracket */}
      {cacheEndPx > 0 && (() => {
        const bracketW = Math.max(10, cacheEndPx);
        const bracketY = barY - 6;
        const midX = barX + bracketW / 2;
        const tag = 'KV Cache 命中区';
        const tagW = measureTextPx(tag, 9.2) + 14;
        const tagX = Math.max(barX + 4, Math.min(barX + barW - tagW - 4, midX - tagW / 2));
        return (
          <g>
            <path
              d={`M ${barX + 2} ${bracketY + 4} L ${barX + 2} ${bracketY} L ${barX + bracketW - 1} ${bracketY} L ${barX + bracketW - 1} ${bracketY + 4}`}
              fill="none"
              stroke="var(--green-stroke)"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            <g transform={`translate(${tagX}, ${bracketY - 15})`}>
              <rect
                x={0}
                y={0}
                width={tagW}
                height={15}
                rx={4.5}
                fill="var(--mint)"
                stroke="var(--green-stroke)"
                strokeWidth={1}
              />
              <text
                x={tagW / 2}
                y={10.5}
                textAnchor="middle"
                fontSize={9}
                fontWeight={800}
                fill="var(--ink)"
              >
                {tag}
              </text>
            </g>
          </g>
        );
      })()}

      {/* Outer Track Shadow */}
      <rect
        x={barX + 2}
        y={barY + 3.5}
        width={barW}
        height={barH}
        rx={9}
        fill="var(--stage-shadow-ambient)"
      />

      {/* Outer Track Background */}
      <rect
        x={barX}
        y={barY}
        width={barW}
        height={barH}
        rx={9}
        fill="var(--paper-2)"
        stroke="var(--edge)"
        strokeWidth={1.8}
      />

      {/* Clipped Interior: Reserve Hatch + Segments + KeepRecent Strip */}
      <g clipPath={`url(#${clipId})`}>
        {/* Reserve Tokens Zone on Right End */}
        {reservePx > 4 && (
          <g>
            <rect
              x={barX + barW - reservePx}
              y={barY}
              width={reservePx}
              height={barH}
              fill={`url(#${reservePatId})`}
            />
            <line
              x1={barX + barW - reservePx}
              y1={barY}
              x2={barX + barW - reservePx}
              y2={barY + barH}
              stroke="var(--rust)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            {reservePx >= 46 && (
              <text
                x={barX + barW - reservePx / 2}
                y={barY + barH / 2 + 3.5}
                textAnchor="middle"
                fontSize={9.2}
                fontWeight={700}
                fill="var(--rust)"
              >
                {truncateText(`保留 ${formatTokens(track.reserveTokens ?? 0)}`, reservePx - 8, 9.2)}
              </text>
            )}
          </g>
        )}

        {/* Color-Coded Tactile Segments */}
        {placed.map((item, sIdx) => {
          const { seg, x, w } = item;
          if (w <= 0.5) return null;
          const isCached = Boolean(seg.cached);
          const isDelta = Boolean(seg.delta);
          const isDropped = Boolean(seg.dropped);
          const fill = SEG_FILL[seg.tone];
          const stroke = SEG_STROKE[seg.tone];
          const showTokSub = barH >= 48 && w >= 66;
          const labelTxt = truncateText(seg.label, w - 12, w >= 72 ? 10.6 : 9.4);

          return (
            <g
              key={seg.id || `seg-${sIdx}`}
              className="stage-bar-enter"
              style={{ animationDelay: `${trackIdx * 70 + sIdx * 35}ms` }}
              opacity={isDropped ? 0.44 : 1}
            >
              <title>
                {seg.label} ({formatTokens(seg.tokens)} tokens)
                {isCached ? ' · KV Cache 命中' : ''}
                {isDelta ? ' · 增量 Patch' : ''}
                {isDropped ? ' · 已丢弃/压缩' : ''}
              </title>
              <rect x={x} y={barY} width={w} height={barH} fill={fill} />

              {/* Cached diagonal sheen stripe */}
              {isCached && (
                <rect x={x} y={barY} width={w} height={barH} fill={`url(#${cachePatId})`} />
              )}

              {/* Dropped crosshatch */}
              {isDropped && (
                <rect x={x} y={barY} width={w} height={barH} fill={`url(#${droppedPatId})`} />
              )}

              {/* Delta SystemMessage dashed highlight frame */}
              {isDelta && (
                <rect
                  x={x + 2.5}
                  y={barY + 3}
                  width={Math.max(2, w - 5)}
                  height={barH - 6}
                  rx={4}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={1.8}
                  strokeDasharray="4 2.5"
                />
              )}

              {/* Right separator line */}
              <line
                x1={x + w}
                y1={barY}
                x2={x + w}
                y2={barY + barH}
                stroke="var(--edge)"
                strokeWidth={1.25}
              />

              {/* Subtle top highlight */}
              <line
                x1={x + 2}
                y1={barY + 2}
                x2={x + w - 2}
                y2={barY + 2}
                stroke="var(--stage-highlight-top)"
                strokeWidth={1.3}
              />

              {/* Tiny badge dot for cached or delta */}
              {isCached && w >= 24 && (
                <circle
                  cx={x + 8}
                  cy={barY + 9}
                  r={3}
                  fill="var(--kpi-good)"
                  stroke="var(--edge)"
                  strokeWidth={0.8}
                />
              )}
              {isDelta && w >= 26 && (
                <text
                  x={x + w - 8}
                  y={barY + 12}
                  textAnchor="end"
                  fontSize={9}
                  fontWeight={900}
                  fill={stroke}
                >
                  Δ
                </text>
              )}

              {/* Segment label */}
              {labelTxt && (
                <text
                  x={x + w / 2}
                  y={showTokSub ? barY + barH / 2 - 1 : barY + barH / 2 + 4}
                  textAnchor="middle"
                  fontSize={w >= 72 ? 10.6 : 9.4}
                  fontWeight={800}
                  fill="var(--ink)"
                  textDecoration={isDropped ? 'line-through' : undefined}
                >
                  {labelTxt}
                </text>
              )}

              {/* Token count sublabel */}
              {showTokSub && (
                <text
                  x={x + w / 2}
                  y={barY + barH / 2 + 13}
                  textAnchor="middle"
                  fontSize={9.1}
                  fontWeight={600}
                  fill="var(--ink-2)"
                >
                  {formatTokens(seg.tokens)}
                </text>
              )}
            </g>
          );
        })}

        {/* KeepRecent bottom accent highlight ribbon */}
        {keepRecentX !== undefined && (
          <rect
            x={keepRecentX}
            y={barY + barH - 5.5}
            width={Math.max(0, Math.min(cursorX, barX + barW - reservePx) - keepRecentX)}
            height={5.5}
            fill="var(--green-stroke)"
            opacity={0.78}
          />
        )}

        {/* Inline leader note inside free track space when all segments are ultra-minimalist */}
        {totalUsedVisualW < 110 &&
          barW - totalUsedVisualW - reservePx > 180 &&
          track.segments.length > 0 && (() => {
            const summary = track.segments
              .map((s) => `${s.label} (${formatTokens(s.tokens)})`)
              .join(' + ');
            const freeAvail = barW - totalUsedVisualW - reservePx - 24;
            const noteText = truncateText(`← ${summary}`, freeAvail, 10);
            return (
              <text
                x={cursorX + 12}
                y={barY + barH / 2 + 3.5}
                fontSize={10}
                fontWeight={700}
                fill="var(--muted)"
              >
                {noteText}
              </text>
            );
          })()}
      </g>

      {/* Crisp re-stroke outer border so corners stay razor sharp */}
      <rect
        x={barX}
        y={barY}
        width={barW}
        height={barH}
        rx={9}
        fill="none"
        stroke="var(--edge)"
        strokeWidth={1.8}
      />

      {/* Atomic Pair Brackets below bar (e.g. toolCall + toolResult 不可拆散) */}
      {Array.from(atomicGroups.entries()).map(([groupName, span], gIdx) => {
        const y0 = barY + barH + 3;
        const y1 = y0 + 8;
        const midX = (span.minX + span.maxX) / 2;
        const hasChinese = /[\u4e00-\u9fa5]/.test(groupName);
        const label = hasChinese ? `不可拆散 · ${groupName}` : `不可拆散 (${groupName})`;
        const pillW = Math.max(82, measureTextPx(label, 9) + 16);
        const px = Math.max(barX, Math.min(barX + barW - pillW, midX - pillW / 2));
        return (
          <g key={`atom-${gIdx}`}>
            <path
              d={`M ${span.minX + 3} ${y0} L ${span.minX + 3} ${y1} L ${span.maxX - 3} ${y1} L ${span.maxX - 3} ${y0}`}
              fill="none"
              stroke="var(--orange-stroke)"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            <g transform={`translate(${px}, ${y1 + 2})`}>
              <rect
                x={0}
                y={0}
                width={pillW}
                height={16}
                rx={4.5}
                fill="var(--orange)"
                stroke="var(--orange-stroke)"
                strokeWidth={1}
              />
              <text
                x={pillW / 2}
                y={11.2}
                textAnchor="middle"
                fontSize={8.8}
                fontWeight={800}
                fill="var(--ink)"
              >
                {label}
              </text>
            </g>
          </g>
        );
      })}

      {/* KeepRecent bottom bracket when no atomic group sits right underneath */}
      {keepRecentX !== undefined && atomicGroups.size === 0 && (() => {
        const endX = Math.max(keepRecentX + 24, Math.min(cursorX, barX + barW - reservePx));
        const y0 = barY + barH + 3;
        const y1 = y0 + 8;
        const midX = (keepRecentX + endX) / 2;
        const tag = 'keepRecent 保留窗口';
        const tw = measureTextPx(tag, 9) + 14;
        const tx = Math.max(barX, Math.min(barX + barW - tw, midX - tw / 2));
        return (
          <g>
            <path
              d={`M ${keepRecentX} ${y0} L ${keepRecentX} ${y1} L ${endX} ${y1} L ${endX} ${y0}`}
              fill="none"
              stroke="var(--green-stroke)"
              strokeWidth={1.6}
            />
            <g transform={`translate(${tx}, ${y1 + 2})`}>
              <rect
                x={0}
                y={0}
                width={tw}
                height={16}
                rx={4.5}
                fill="var(--mint)"
                stroke="var(--green-stroke)"
                strokeWidth={1}
              />
              <text
                x={tw / 2}
                y={11.2}
                textAnchor="middle"
                fontSize={8.8}
                fontWeight={800}
                fill="var(--ink)"
              >
                {tag}
              </text>
            </g>
          </g>
        );
      })()}

      {/* Cut Point Vertical Blade & Scissors Marker */}
      {cutPx !== undefined && (() => {
        const cx = barX + cutPx;
        const cutLabel = track.cutPointLabel ?? 'Cut Point';
        const pillText = `✂ ${cutLabel}`;
        const pillW = Math.max(76, measureTextPx(pillText, 9.4) + 16);
        const px = Math.max(barX, Math.min(barX + barW - pillW, cx - pillW / 2));

        // Avoid colliding with KV Cache Hit pill when both appear near each other
        const cacheTagMidX = barX + cacheEndPx / 2;
        const overlapsCachePill =
          cacheEndPx > 12 && Math.abs(cx - cacheTagMidX) < pillW / 2 + 56;
        const pillY = overlapsCachePill ? barY + barH + 10 : barY - 30;

        return (
          <g>
            <line
              x1={cx}
              y1={barY - 12}
              x2={cx}
              y2={barY + barH + 14}
              stroke="var(--rust)"
              strokeWidth={2.4}
              strokeDasharray="5 3"
              strokeLinecap="round"
            />
            <polygon
              points={`${cx - 5},${barY - 11} ${cx + 5},${barY - 11} ${cx},${barY - 3}`}
              fill="var(--rust)"
            />
            <g transform={`translate(${px}, ${pillY})`}>
              <rect
                x={0}
                y={0}
                width={pillW}
                height={18}
                rx={5.5}
                fill="var(--rose)"
                stroke="var(--rust)"
                strokeWidth={1.25}
              />
              <text
                x={pillW / 2}
                y={12.4}
                textAnchor="middle"
                fontSize={9.3}
                fontWeight={800}
                fill="var(--ink)"
              >
                {pillText}
              </text>
            </g>
          </g>
        );
      })()}
    </g>
  );
}

function renderCalloutBadges(badges: TokenCalloutBadge[], y: number) {
  if (badges.length === 0) return null;
  const maxTotalW = 912;
  const gap = 12;
  const itemW = Math.min(220, Math.max(130, (maxTotalW - gap * (badges.length - 1)) / badges.length));
  const rowW = badges.length * itemW + gap * (badges.length - 1);
  const startX = 44 + (maxTotalW - rowW) / 2;

  return (
    <g transform={`translate(0, ${y})`}>
      {badges.map((badge, idx) => {
        const bx = startX + idx * (itemW + gap);
        const st = BADGE_STYLE[badge.tone];
        return (
          <g
            key={`cb-${idx}`}
            className="stage-node-enter"
            style={{ animationDelay: `${160 + idx * 45}ms` }}
            transform={`translate(${bx}, 0)`}
          >
            <rect x={2} y={2.5} width={itemW} height={42} rx={8} fill="var(--stage-shadow-ambient)" />
            <rect
              x={0}
              y={0}
              width={itemW}
              height={42}
              rx={8}
              fill={st.bg}
              stroke="var(--edge)"
              strokeWidth={1.3}
            />
            <rect x={1} y={1} width={5} height={40} rx={2.5} fill={st.bar} />
            <text x={14} y={16} fontSize={9.5} fontWeight={700} fill="var(--ink-2)">
              {truncateText(badge.label, itemW - 22, 9.5)}
            </text>
            <text x={14} y={33} fontSize={12.6} fontWeight={800} fill="var(--ink)">
              {truncateText(badge.value, itemW - 22, 12.6)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function renderMultiSeriesChart(chart: TokenMiniChart, y: number, uid: string) {
  const x = 44;
  const w = 912;
  const h = 186;
  const padL = 56;
  const padR = 24;
  const padT = 38;
  const padB = 34;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const allPts = chart.series.flatMap((s) => s.points);
  const xs = allPts.length > 0 ? allPts.map((p) => p[0]) : [0, 1];
  const ys = allPts.length > 0 ? allPts.map((p) => p[1]) : [0, 100];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(...ys, minY + 1);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const mapX = (vx: number) => padL + ((vx - minX) / spanX) * plotW;
  const mapY = (vy: number) => padT + plotH - ((vy - minY) / spanY) * plotH;

  const firstGradId = `${uid}-mc-grad`;

  return (
    <g className="stage-node-enter" style={{ animationDelay: '210ms' }} transform={`translate(${x}, ${y})`}>
      <defs>
        {chart.series[0] && (
          <linearGradient id={firstGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={resolveSeriesColor(chart.series[0].color)} stopOpacity="0.24" />
            <stop offset="100%" stopColor={resolveSeriesColor(chart.series[0].color)} stopOpacity="0.02" />
          </linearGradient>
        )}
      </defs>

      {/* Card shadow & container */}
      <rect x={2.5} y={3.5} width={w} height={h} rx={10} fill="var(--stage-shadow-ambient)" />
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        rx={10}
        fill="var(--stage-frosted)"
        stroke="var(--edge)"
        strokeWidth={1.5}
      />

      {/* Header + Series Legend */}
      <text x={16} y={22} fontSize={11.5} fontWeight={800} fill="var(--ink)">
        {chart.title}
      </text>

      <g>
        {(() => {
          let cursor = w - 16;
          return [...chart.series].reverse().map((s, revIdx) => {
            const labelW = measureTextPx(s.label, 9.8);
            const itemW = labelW + 22;
            cursor -= itemW;
            const ix = cursor;
            cursor -= 10;
            const strokeColor = resolveSeriesColor(s.color);
            return (
              <g key={`leg-${revIdx}`} transform={`translate(${ix}, 10)`}>
                <line
                  x1={0}
                  y1={8}
                  x2={14}
                  y2={8}
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <circle cx={7} cy={8} r={2.8} fill={strokeColor} />
                <text x={19} y={11.5} fontSize={9.8} fontWeight={700} fill="var(--ink-2)">
                  {s.label}
                </text>
              </g>
            );
          });
        })()}
      </g>

      <line x1={12} y1={31} x2={w - 12} y2={31} stroke="var(--line)" strokeWidth={1} />

      {/* Horizontal gridlines + Y tick values */}
      {[0, 0.5, 1].map((frac, idx) => {
        const gy = padT + frac * plotH;
        const val = maxY - frac * spanY;
        return (
          <g key={idx}>
            <line
              x1={padL}
              y1={gy}
              x2={padL + plotW}
              y2={gy}
              stroke="var(--line-soft)"
              strokeWidth={1}
              strokeDasharray={frac < 1 ? '4 3' : undefined}
            />
            <text
              x={padL - 8}
              y={gy + 3.5}
              textAnchor="end"
              fontSize={9}
              fontWeight={600}
              fill="var(--muted)"
            >
              {formatTokens(val)}
            </text>
          </g>
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

      {/* Multi-series paths */}
      {chart.series.map((series, sIdx) => {
        if (series.points.length === 0) return null;
        const pts = series.points.map(([px, py]) => [mapX(px), mapY(py)]);
        const d = pts
          .map(([mx, my], i) => `${i === 0 ? 'M' : 'L'} ${mx.toFixed(1)} ${my.toFixed(1)}`)
          .join(' ');
        const areaD =
          sIdx === 0
            ? `${d} L ${pts[pts.length - 1][0].toFixed(1)} ${(padT + plotH).toFixed(1)} L ${pts[0][0].toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
            : undefined;
        const strokeColor = resolveSeriesColor(series.color);
        return (
          <g key={`ser-${sIdx}`}>
            {areaD && <path d={areaD} fill={`url(#${firstGradId})`} />}
            <path
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pts.map(([mx, my], pIdx) => (
              <circle
                key={pIdx}
                cx={mx}
                cy={my}
                r={3}
                fill="var(--sheet)"
                stroke={strokeColor}
                strokeWidth={1.8}
              />
            ))}
          </g>
        );
      })}

      {/* Optional Highlight Vertical Rule + Note */}
      {chart.highlightX !== undefined && (() => {
        const hx = mapX(chart.highlightX);
        const note = chart.highlightNote ?? '';
        const nw = note ? Math.max(66, measureTextPx(note, 9.4) + 16) : 0;
        const nx = Math.max(padL + 4, Math.min(padL + plotW - nw - 4, hx - nw / 2));
        return (
          <g>
            <line
              x1={hx}
              y1={padT}
              x2={hx}
              y2={padT + plotH}
              stroke="var(--rust)"
              strokeWidth={1.6}
              strokeDasharray="4 3"
            />
            {note && (
              <g transform={`translate(${nx}, ${padT + 4})`}>
                <rect
                  x={0}
                  y={0}
                  width={nw}
                  height={19}
                  rx={5}
                  fill="var(--orange)"
                  stroke="var(--edge)"
                  strokeWidth={1.1}
                />
                <text
                  x={nw / 2}
                  y={12.8}
                  textAnchor="middle"
                  fontSize={9.3}
                  fontWeight={800}
                  fill="var(--ink)"
                >
                  {note}
                </text>
              </g>
            )}
          </g>
        );
      })()}

      {/* Axis labels */}
      <text
        x={padL + plotW / 2}
        y={h - 9}
        textAnchor="middle"
        fontSize={9.6}
        fontWeight={600}
        fill="var(--muted)"
      >
        {chart.xLabel}
      </text>
      <text
        x={15}
        y={padT + plotH / 2}
        textAnchor="middle"
        fontSize={9.6}
        fontWeight={600}
        fill="var(--muted)"
        transform={`rotate(-90 15 ${padT + plotH / 2})`}
      >
        {chart.yLabel}
      </text>
    </g>
  );
}

export function TokenSlicesSvg({ scene, isPlaying, reducedMotion = false }: TokenSlicesSvgProps) {
  const uid = useId().replace(/:/g, '');
  const cachePatId = `${uid}-cache-pat`;
  const reservePatId = `${uid}-reserve-pat`;
  const droppedPatId = `${uid}-dropped-pat`;

  const hasChart = Boolean(scene.miniChart);
  const hasBadges = Boolean(scene.calloutBadges && scene.calloutBadges.length > 0);
  const trackCount = Math.max(1, scene.tracks.length);

  // Adaptive vertical spacing so tracks, brackets, badges, and chart never overlap
  const chartY = 354;
  const badgesY = hasChart ? 298 : 482;
  const tracksTop = 36;
  const tracksBottom = hasBadges ? badgesY - 22 : hasChart ? chartY - 22 : 532;
  const availTrackH = Math.max(120, tracksBottom - tracksTop);
  const slotH = availTrackH / trackCount;
  const barH = Math.round(
    Math.max(40, Math.min(hasChart ? 54 : 74, slotH - 64))
  );

  // Keep class mounted when motion is allowed so .stage-canvas--paused freezes stripes in place
  const cacheAnimClass = !reducedMotion ? 'stage-running-stripe' : undefined;

  return (
    <svg
      className="stage-svg"
      data-playing={isPlaying ? 'true' : 'false'}
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={scene.title ?? 'Pi Token 预算与缓存切片图'}
    >
      <defs>
        {/* Subtle diagonal green sheen for KV-cached segments */}
        <pattern
          id={cachePatId}
          width="12"
          height="12"
          patternTransform="rotate(35)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="12"
            stroke="var(--stage-cache-stripe)"
            strokeWidth="4"
            className={cacheAnimClass}
          />
        </pattern>

        {/* Warm amber/rust diagonal hatch for reserveTokens zone */}
        <pattern
          id={reservePatId}
          width="10"
          height="10"
          patternTransform="rotate(-45)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="10"
            stroke="var(--stage-reserve-hatch)"
            strokeWidth="3"
          />
        </pattern>

        {/* Crosshatch for dropped segments */}
        <pattern
          id={droppedPatId}
          width="8"
          height="8"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--stage-swatch-hatch)" strokeWidth="2.2" />
        </pattern>
      </defs>

      {/* Subtle horizontal drafting guide grid */}
      <g opacity={0.65}>
        {[48, 128, 208, 288, 368, 448, 528].map((gy) => (
          <line
            key={gy}
            x1={24}
            y1={gy}
            x2={976}
            y2={gy}
            stroke="var(--line-soft)"
            strokeWidth={1}
          />
        ))}
        <line x1={44} y1={18} x2={44} y2={542} stroke="var(--line-soft)" strokeWidth={1} strokeDasharray="3 4" />
        <line x1={956} y1={18} x2={956} y2={542} stroke="var(--line-soft)" strokeWidth={1} strokeDasharray="3 4" />
      </g>

      {/* Stacked Token Budget / Cache Tracks */}
      <g>
        {scene.tracks.map((track, idx) => {
          const slotTop = tracksTop + idx * slotH;
          const barY = Math.round(slotTop + Math.max(38, (slotH - barH) * 0.48));
          return renderTrack(
            track,
            idx,
            barY,
            barH,
            uid,
            cachePatId,
            reservePatId,
            droppedPatId
          );
        })}
      </g>

      {/* Summary Callout Badges Row */}
      {hasBadges && scene.calloutBadges && renderCalloutBadges(scene.calloutBadges, badgesY)}

      {/* Optional Multi-Series Bottom Mini-Chart */}
      {scene.miniChart && renderMultiSeriesChart(scene.miniChart, chartY, uid)}
    </svg>
  );
}
