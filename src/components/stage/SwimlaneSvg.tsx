import { useId } from 'react';
import type {
  AccentTone,
  StageTone,
  SwimlaneBar,
  SwimlaneEvent,
  SwimlanePhaseBand,
  SwimlaneScene,
} from '../../types/lesson';

export interface SwimlaneSvgProps {
  scene: SwimlaneScene;
  isPlaying: boolean;
  reducedMotion?: boolean;
}

const TONE_PALETTE: Record<StageTone, { fill: string; stroke: string; tint: string }> = {
  neutral: { fill: 'var(--sheet)', stroke: 'var(--edge)', tint: 'var(--paper-2)' },
  green: { fill: 'var(--green)', stroke: 'var(--green-stroke)', tint: 'var(--green)' },
  violet: { fill: 'var(--violet)', stroke: 'var(--violet-stroke)', tint: 'var(--violet)' },
  blue: { fill: 'var(--blue)', stroke: 'var(--blue-stroke)', tint: 'var(--blue)' },
  orange: { fill: 'var(--orange)', stroke: 'var(--orange-stroke)', tint: 'var(--orange)' },
  rose: { fill: 'var(--rose)', stroke: 'var(--rose-stroke)', tint: 'var(--rose)' },
};

const EVENT_TONE: Record<AccentTone, { fill: string; stroke: string }> = {
  green: { fill: 'var(--green)', stroke: 'var(--green-stroke)' },
  violet: { fill: 'var(--violet)', stroke: 'var(--violet-stroke)' },
  blue: { fill: 'var(--blue)', stroke: 'var(--blue-stroke)' },
  orange: { fill: 'var(--orange)', stroke: 'var(--orange-stroke)' },
  rose: { fill: 'var(--rose)', stroke: 'var(--rose-stroke)' },
};

function measureTextPx(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0x2e80) {
      units += 1.02;
    } else if (ch >= 'A' && ch <= 'Z') {
      units += 0.66;
    } else if (ch === ' ' || ch === '.' || ch === ':' || ch === '/' || ch === '-' || ch === '_') {
      units += 0.42;
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

interface LaneGeometry {
  id: string;
  top: number;
  height: number;
  centerY: number;
  hasBars: boolean;
  hasEvents: boolean;
  barY: number;
  barH: number;
  eventRailY: number;
}

interface PlacedEventPill {
  ev: SwimlaneEvent;
  mx: number;
  my: number;
  pillX: number;
  pillY: number;
  pillW: number;
  pillH: number;
  text: string;
}

export function SwimlaneSvg({ scene, isPlaying, reducedMotion = false }: SwimlaneSvgProps) {
  const uid = useId().replace(/:/g, '');
  const runStripeId = `${uid}-run-stripe`;
  const blockedHatchId = `${uid}-blk-hatch`;
  const connArrowId = `${uid}-conn-arrow`;

  const headerX = 18;
  const headerW = 172;
  const plotLeft = 200;
  const plotW = 776;
  const plotRight = plotLeft + plotW;

  const hasPhaseBands = Boolean(scene.phaseBands && scene.phaseBands.length > 0);
  const phaseY = 14;
  const phaseH = 26;
  const axisY = hasPhaseBands ? 60 : 34;
  const lanesTop = axisY + 14;
  const lanesBottom = 540;
  const laneCount = Math.max(1, scene.lanes.length);
  const laneH = (lanesBottom - lanesTop) / laneCount;

  const toPlotX = (pos: number) =>
    plotLeft + (Math.max(0, Math.min(100, pos)) / 100) * plotW;

  // Determine which lanes have bars and/or events so they never collide vertically
  const lanesWithBars = new Set(scene.bars.map((b) => b.laneId));
  const lanesWithEvents = new Set((scene.events ?? []).map((e) => e.laneId));

  const laneGeomMap = new Map<string, LaneGeometry>();
  const laneGeoms: LaneGeometry[] = scene.lanes.map((lane, idx) => {
    const top = lanesTop + idx * laneH;
    const centerY = top + laneH / 2;
    const hasBars = lanesWithBars.has(lane.id);
    const hasEvents = lanesWithEvents.has(lane.id);
    const barH = Math.round(
      Math.max(24, Math.min(hasEvents ? 32 : 42, laneH * (hasEvents ? 0.36 : 0.52)))
    );
    const barY = hasEvents ? Math.round(top + laneH * 0.16) : Math.round(centerY - barH / 2);
    const eventRailY = hasBars ? Math.round(top + laneH * 0.76) : Math.round(centerY);

    const geom: LaneGeometry = {
      id: lane.id,
      top,
      height: laneH,
      centerY,
      hasBars,
      hasEvents,
      barY,
      barH,
      eventRailY,
    };
    laneGeomMap.set(lane.id, geom);
    return geom;
  });

  // Pre-layout events per lane with greedy non-overlapping vertical tier staggering
  const placedEvents: PlacedEventPill[] = [];
  const eventsByLane = new Map<string, SwimlaneEvent[]>();
  for (const ev of scene.events ?? []) {
    const list = eventsByLane.get(ev.laneId) ?? [];
    list.push(ev);
    eventsByLane.set(ev.laneId, list);
  }

  for (const [laneId, evList] of eventsByLane.entries()) {
    const lg = laneGeomMap.get(laneId);
    if (!lg) continue;
    const sorted = [...evList].sort((a, b) => a.pos - b.pos);
    const pillH = 18;

    // Candidate vertical offsets relative to eventRailY (ordered by visual preference)
    const offsets = lg.hasBars
      ? [11, -28, 30]
      : [-27, 11, -46, 30];
    // Track rightmost occupied X per tier
    const tierRight: number[] = offsets.map(() => -Infinity);

    for (const ev of sorted) {
      const mx = toPlotX(ev.pos);
      const my = lg.eventRailY;
      const text = truncateText(ev.label, 146, 9.2);
      const pillW = Math.round(Math.max(44, measureTextPx(text, 9.2) + 14));
      const pillX = Math.max(plotLeft + 4, Math.min(plotRight - pillW - 4, mx - pillW / 2));

      let chosenTier = 0;
      let foundClear = false;
      for (let t = 0; t < offsets.length; t++) {
        if (pillX >= tierRight[t] + 7) {
          chosenTier = t;
          foundClear = true;
          break;
        }
      }
      if (!foundClear) {
        // Pick tier with smallest right edge
        let best = 0;
        for (let t = 1; t < tierRight.length; t++) {
          if (tierRight[t] < tierRight[best]) best = t;
        }
        chosenTier = best;
      }

      tierRight[chosenTier] = pillX + pillW;
      const rawPillY = my + offsets[chosenTier];
      const pillY = Math.max(
        lg.top + 3,
        Math.min(lg.top + lg.height - pillH - 3, rawPillY)
      );

      placedEvents.push({ ev, mx, my, pillX, pillY, pillW, pillH, text });
    }
  }

  // Keep class mounted when motion is allowed so .stage-canvas--paused freezes stripes in place
  const runAnimClass = !reducedMotion ? 'stage-running-stripe' : undefined;

  return (
    <svg
      className="stage-svg"
      viewBox="0 0 1000 560"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={scene.title ?? 'Pi 事件流与并发泳道图'}
    >
      <defs>
        {/* Animated barber-pole shimmer for running bars */}
        <pattern
          id={runStripeId}
          width="16"
          height="16"
          patternTransform="rotate(35)"
          patternUnits="userSpaceOnUse"
        >
          <rect
            x="0"
            y="0"
            width="6"
            height="16"
            fill="var(--stage-bar-stripe)"
            className={runAnimClass}
          />
        </pattern>

        {/* Subtle diagonal hatch for blocked bars */}
        <pattern
          id={blockedHatchId}
          width="8"
          height="8"
          patternTransform="rotate(-45)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="var(--stage-swatch-hatch)" strokeWidth="2.4" />
        </pattern>

        <marker
          id={connArrowId}
          viewBox="0 0 10 10"
          refX="8.2"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 1 1.5 L 8.6 5 L 1 8.5 z" fill="var(--edge)" />
        </marker>
      </defs>

      {/* 1. Optional Shaded Phase Bands */}
      {(scene.phaseBands ?? []).map((band: SwimlanePhaseBand, idx: number) => {
        const bx1 = toPlotX(band.start);
        const bx2 = toPlotX(band.end);
        const bw = Math.max(20, bx2 - bx1);
        const tone = TONE_PALETTE[band.tone ?? 'neutral'];
        const label = truncateText(band.label, bw - 16, 10.2);

        return (
          <g key={`band-${idx}`} className="stage-edge-enter" style={{ animationDelay: `${idx * 40}ms` }}>
            {/* Column shading down across all lanes */}
            <rect
              x={bx1}
              y={phaseY + phaseH + 4}
              width={bw}
              height={lanesBottom - (phaseY + phaseH + 4)}
              fill={tone.tint}
              fillOpacity={band.tone === 'neutral' ? 0.25 : 0.14}
            />
            <line
              x1={bx1}
              y1={phaseY + phaseH + 4}
              x2={bx1}
              y2={lanesBottom}
              stroke={tone.stroke}
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <line
              x1={bx2}
              y1={phaseY + phaseH + 4}
              x2={bx2}
              y2={lanesBottom}
              stroke={tone.stroke}
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {/* Phase header pill */}
            <rect
              x={bx1 + 3}
              y={phaseY}
              width={bw - 6}
              height={phaseH}
              rx={7}
              fill={tone.fill}
              stroke="var(--edge)"
              strokeWidth={1.2}
            />
            <text
              x={bx1 + bw / 2}
              y={phaseY + 16.8}
              textAnchor="middle"
              fontSize={10.1}
              fontWeight={800}
              fill="var(--ink)"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* 2. Lane Rows Background + Left Lane Headers */}
      <g>
        {scene.lanes.map((lane, idx) => {
          const lg = laneGeoms[idx];
          const tone = TONE_PALETTE[lane.tone ?? 'neutral'];
          const isAlt = idx % 2 === 1;
          const label = truncateText(lane.label, headerW - 22, 11.4);
          const sub = lane.sublabel ? truncateText(lane.sublabel, headerW - 22, 9.2) : undefined;

          return (
            <g key={lane.id}>
              {/* Timeline row subtle alternating backdrop */}
              <rect
                x={plotLeft}
                y={lg.top}
                width={plotW}
                height={lg.height}
                fill={isAlt ? 'var(--paper-2)' : 'var(--sheet)'}
                fillOpacity={0.42}
              />

              {/* Horizontal lane divider */}
              <line
                x1={headerX}
                y1={lg.top}
                x2={plotRight}
                y2={lg.top}
                stroke="var(--line)"
                strokeWidth={1}
              />

              {/* Event rail guide line inside lanes that have events */}
              {lg.hasEvents && (
                <line
                  x1={plotLeft + 4}
                  y1={lg.eventRailY}
                  x2={plotRight - 4}
                  y2={lg.eventRailY}
                  stroke="var(--line-strong)"
                  strokeWidth={1}
                  strokeDasharray="2 4"
                  opacity={0.7}
                />
              )}

              {/* Left lane header card */}
              <g transform={`translate(${headerX}, ${lg.top + 6})`}>
                <rect
                  x={1.5}
                  y={2}
                  width={headerW}
                  height={lg.height - 12}
                  rx={8}
                  fill="var(--stage-shadow-ambient)"
                />
                <rect
                  x={0}
                  y={0}
                  width={headerW}
                  height={lg.height - 12}
                  rx={8}
                  fill="var(--sheet)"
                  stroke="var(--edge)"
                  strokeWidth={1.3}
                />
                {/* Colored vertical strip */}
                <path
                  d={`M 1 8 Q 1 1 7 1 L 7 ${lg.height - 13} Q 1 ${lg.height - 13} 1 ${lg.height - 20} Z`}
                  fill={tone.stroke}
                />
                <text
                  x={15}
                  y={sub ? (lg.height - 12) / 2 - 2 : (lg.height - 12) / 2 + 4}
                  fontSize={11.3}
                  fontWeight={800}
                  fill="var(--ink)"
                >
                  {label}
                </text>
                {sub && (
                  <text
                    x={15}
                    y={(lg.height - 12) / 2 + 13}
                    fontSize={9.2}
                    fontWeight={600}
                    fill="var(--muted)"
                  >
                    {sub}
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* Bottom border line */}
        <line x1={headerX} y1={lanesBottom} x2={plotRight} y2={lanesBottom} stroke="var(--line-strong)" strokeWidth={1.2} />
      </g>

      {/* 3. Time Axis Ticks & Vertical Drafting Gridlines */}
      <g>
        <line
          x1={plotLeft}
          y1={axisY + 6}
          x2={plotRight}
          y2={axisY + 6}
          stroke="var(--line-strong)"
          strokeWidth={1.3}
        />
        <text x={headerX + 4} y={axisY + 1} fontSize={9.5} fontWeight={800} fill="var(--muted)" letterSpacing="0.06em">
          SWIMLANES
        </text>

        {scene.ticks.map((tick, idx) => {
          const tx = toPlotX(tick.pos);
          const anchor = tick.pos <= 4 ? 'start' : tick.pos >= 96 ? 'end' : 'middle';
          return (
            <g key={`tick-${idx}`}>
              <line
                x1={tx}
                y1={axisY + 6}
                x2={tx}
                y2={lanesBottom}
                stroke="var(--line-soft)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <line x1={tx} y1={axisY + 2} x2={tx} y2={axisY + 8} stroke="var(--edge)" strokeWidth={1.3} />
              <text
                x={tx}
                y={axisY - 2}
                textAnchor={anchor}
                fontSize={9.5}
                fontWeight={700}
                fill="var(--muted)"
              >
                {tick.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* 4. Subtle Animated Playhead Sweep (when playing) */}
      {!reducedMotion && (
        <g
          className="stage-playhead-sweep"
          opacity={isPlaying ? 0.55 : 0.2}
          style={{ pointerEvents: 'none' }}
        >
          <polygon
            points={`${plotLeft - 4.5},${axisY + 2} ${plotLeft + 4.5},${axisY + 2} ${plotLeft},${axisY + 9}`}
            fill="var(--green-stroke)"
          />
          <line
            x1={plotLeft}
            y1={axisY + 8}
            x2={plotLeft}
            y2={lanesBottom}
            stroke="var(--green-stroke)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        </g>
      )}

      {/* 5. Cross-Lane Causality Connectors (behind bars & event markers) */}
      <g>
        {(scene.connectors ?? []).map((conn, idx) => {
          const fromLane = laneGeomMap.get(conn.fromLaneId);
          const toLane = laneGeomMap.get(conn.toLaneId);
          if (!fromLane || !toLane) return null;

          const x1 = toPlotX(conn.fromPos);
          const y1 = fromLane.hasBars ? fromLane.barY + fromLane.barH / 2 : fromLane.eventRailY;
          const x2 = toPlotX(conn.toPos);
          const y2 = toLane.hasBars ? toLane.barY + toLane.barH / 2 : toLane.eventRailY;

          const midY = (y1 + y2) / 2;
          const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${x1.toFixed(1)} ${midY.toFixed(1)}, ${x2.toFixed(1)} ${midY.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
          const isDashed = conn.dashed !== false;

          return (
            <g key={`conn-${idx}`} className="stage-edge-enter" style={{ animationDelay: `${120 + idx * 35}ms` }}>
              <path
                d={d}
                fill="none"
                stroke="var(--edge)"
                strokeWidth={1.5}
                strokeDasharray={isDashed ? '5 3.5' : undefined}
                strokeOpacity={0.78}
                markerEnd={`url(#${connArrowId})`}
              />
              {conn.label && (() => {
                const txt = truncateText(conn.label, 128, 9);
                const lw = Math.max(40, measureTextPx(txt, 9) + 12);
                const lx = Math.max(plotLeft + 4, Math.min(plotRight - lw - 4, (x1 + x2) / 2 - lw / 2));
                const ly = midY - 9;
                return (
                  <g transform={`translate(${lx}, ${ly})`}>
                    <rect
                      x={0}
                      y={0}
                      width={lw}
                      height={17}
                      rx={5}
                      fill="var(--stage-frosted)"
                      stroke="var(--line-strong)"
                      strokeWidth={1}
                    />
                    <text
                      x={lw / 2}
                      y={11.5}
                      textAnchor="middle"
                      fontSize={8.8}
                      fontWeight={700}
                      fill="var(--ink)"
                    >
                      {txt}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </g>

      {/* 6. Rounded Execution Bars + Status Styles + Order Badges */}
      <g>
        {scene.bars.map((bar: SwimlaneBar, idx: number) => {
          const lg = laneGeomMap.get(bar.laneId);
          if (!lg) return null;

          const x1 = toPlotX(bar.start);
          const x2 = toPlotX(bar.end);
          const bw = Math.max(28, x2 - x1);
          const by = lg.barY;
          const bh = lg.barH;
          const tone = TONE_PALETTE[bar.tone];
          const status = bar.status ?? 'done';

          const isRunning = status === 'running';
          const isParallel = status === 'parallel';
          const isBlocked = status === 'blocked';
          const isError = status === 'error';
          const isQueued = status === 'queued';

          const fill = isError ? 'var(--rose)' : isQueued ? 'var(--sheet)' : tone.fill;
          const stroke = isError
            ? 'var(--kpi-bad)'
            : isParallel
              ? tone.stroke
              : isBlocked
                ? 'var(--orange-stroke)'
                : 'var(--edge)';
          const strokeW = isError || isParallel ? 2 : 1.5;
          const strokeDash = isQueued ? '5 3' : isBlocked ? '4 2.5' : undefined;

          const hasOrder = Boolean(bar.orderBadge);
          const textRightPad = hasOrder ? 26 : 10;
          const labelAvailW = bw - (isRunning ? 22 : 12) - textRightPad;
          const showSub = Boolean(bar.sublabel) && bh >= 34 && labelAvailW >= 46;
          const mainLabel = truncateText(bar.label, Math.max(20, labelAvailW), 10.4);
          const subLabel =
            showSub && bar.sublabel ? truncateText(bar.sublabel, labelAvailW, 8.8) : undefined;
          const textX = x1 + (isRunning ? 18 : 10);

          return (
            <g
              key={bar.id || `bar-${idx}`}
              className="stage-bar-enter"
              style={{ animationDelay: `${60 + idx * 38}ms` }}
            >
              <title>
                {bar.label}
                {bar.sublabel ? ` — ${bar.sublabel}` : ''}
                {bar.orderBadge ? ` (${bar.orderBadge})` : ''}
              </title>
              {/* Grounded subtle shadow */}
              <rect
                x={x1 + 2}
                y={by + 2.5}
                width={bw}
                height={bh}
                rx={7.5}
                fill="var(--stage-shadow-ambient)"
              />

              {/* Parallel outer crisp aura */}
              {isParallel && (
                <rect
                  x={x1 - 2.5}
                  y={by - 2.5}
                  width={bw + 5}
                  height={bh + 5}
                  rx={9.5}
                  fill="none"
                  stroke={tone.stroke}
                  strokeWidth={1.3}
                  strokeOpacity={0.55}
                />
              )}

              {/* Primary bar */}
              <rect
                x={x1}
                y={by}
                width={bw}
                height={bh}
                rx={7.5}
                fill={fill}
                fillOpacity={isQueued ? 0.8 : 1}
                stroke={stroke}
                strokeWidth={strokeW}
                strokeDasharray={strokeDash}
              />

              {/* Running animated diagonal sheen */}
              {isRunning && (
                <rect
                  x={x1 + 1}
                  y={by + 1}
                  width={bw - 2}
                  height={bh - 2}
                  rx={6.5}
                  fill={`url(#${runStripeId})`}
                />
              )}

              {/* Blocked hatch */}
              {isBlocked && (
                <rect
                  x={x1 + 1}
                  y={by + 1}
                  width={bw - 2}
                  height={bh - 2}
                  rx={6.5}
                  fill={`url(#${blockedHatchId})`}
                />
              )}

              {/* Top specular paper highlight */}
              <line
                x1={x1 + 7}
                y1={by + 2}
                x2={x1 + bw - 7}
                y2={by + 2}
                stroke="var(--stage-highlight-top)"
                strokeWidth={1.3}
                strokeLinecap="round"
              />

              {/* Live pulsing dot for running bars */}
              {isRunning && (
                <circle
                  cx={x1 + 10}
                  cy={by + bh / 2}
                  r={3.4}
                  fill="var(--kpi-good)"
                  stroke="var(--edge)"
                  strokeWidth={0.9}
                  className="stage-active-pulse"
                />
              )}

              {/* Bar text */}
              {mainLabel && (
                <text
                  x={textX}
                  y={subLabel ? by + bh / 2 - 1 : by + bh / 2 + 3.8}
                  fontSize={10.4}
                  fontWeight={800}
                  fill="var(--ink)"
                >
                  {mainLabel}
                </text>
              )}
              {subLabel && (
                <text
                  x={textX}
                  y={by + bh / 2 + 11.5}
                  fontSize={8.8}
                  fontWeight={600}
                  fill="var(--ink-2)"
                >
                  {subLabel}
                </text>
              )}

              {/* Crisp orderBadge pill (#1, #2...) for completion vs source order */}
              {bar.orderBadge && (() => {
                const badgeW = Math.max(24, measureTextPx(bar.orderBadge, 9.2) + 10);
                const bx = x1 + bw - badgeW + 4;
                const byBadge = by - 9;
                return (
                  <g transform={`translate(${bx}, ${byBadge})`}>
                    <rect
                      x={0}
                      y={0}
                      width={badgeW}
                      height={17}
                      rx={6}
                      fill="var(--iso-face-dark)"
                      stroke="var(--edge)"
                      strokeWidth={1.1}
                    />
                    <text
                      x={badgeW / 2}
                      y={11.6}
                      textAnchor="middle"
                      fontSize={9.1}
                      fontWeight={800}
                      fill="var(--iso-ink-dark)"
                    >
                      {bar.orderBadge}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </g>

      {/* 7. Crisp Events Markers with Staggered Non-Overlapping Pills */}
      <g>
        {placedEvents.map((item, idx) => {
          const { ev, mx, my, pillX, pillY, pillW, pillH, text } = item;
          const tone = EVENT_TONE[ev.tone];
          const isEmph = Boolean(ev.emphasized);
          const pillCenterX = pillX + pillW / 2;
          const stemY = pillY < my ? pillY + pillH : pillY;

          return (
            <g
              key={ev.id || `ev-${idx}`}
              className="stage-node-enter"
              style={{ animationDelay: `${140 + idx * 30}ms` }}
            >
              <title>{ev.label}</title>
              {/* Hairline leader stem connecting marker to staggered label pill */}
              <line
                x1={mx}
                y1={my}
                x2={Math.max(pillX + 6, Math.min(pillX + pillW - 6, pillCenterX))}
                y2={stemY}
                stroke={tone.stroke}
                strokeWidth={1.15}
                strokeOpacity={0.75}
              />

              {/* Event pill */}
              <g transform={`translate(${pillX}, ${pillY})`}>
                <rect
                  x={0}
                  y={0}
                  width={pillW}
                  height={pillH}
                  rx={5.5}
                  fill={isEmph ? tone.fill : 'var(--stage-frosted)'}
                  stroke={isEmph ? 'var(--edge)' : tone.stroke}
                  strokeWidth={isEmph ? 1.35 : 1.1}
                />
                <text
                  x={pillW / 2}
                  y={12.2}
                  textAnchor="middle"
                  fontSize={9.1}
                  fontWeight={isEmph ? 800 : 700}
                  fill="var(--ink)"
                >
                  {text}
                </text>
              </g>

              {/* Diamond (emphasized) or Circle marker on event rail */}
              {isEmph ? (
                <g transform={`translate(${mx}, ${my})`}>
                  <polygon
                    points="0,-10 10,0 0,10 -10,0"
                    fill={tone.stroke}
                    fillOpacity={0.22}
                    className="stage-active-pulse"
                  />
                  <polygon
                    points="0,-6.5 6.5,0 0,6.5 -6.5,0"
                    fill={tone.fill}
                    stroke="var(--edge)"
                    strokeWidth={1.5}
                  />
                </g>
              ) : (
                <circle
                  cx={mx}
                  cy={my}
                  r={4.8}
                  fill={tone.fill}
                  stroke="var(--edge)"
                  strokeWidth={1.4}
                />
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
