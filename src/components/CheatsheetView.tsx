import { useId } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Cpu,
  GitBranch,
  Layers,
  Sliders,
  Wrench,
} from 'lucide-react';
import type { CheatsheetData, CheatsheetLink } from '../types/lesson';
import { renderRichText } from '../utils/inlineCode';

export interface CheatsheetViewProps {
  data: CheatsheetData;
  onJumpToLesson: (lessonSlug: string, stepNumber?: number) => void;
  onBackToLearn: () => void;
}

const PHASE_LABELS = {
  outer: 'OUTER · 外层循环',
  inner: 'INNER · 内层循环',
  exit: 'EXIT · 终止条件',
  hook: 'HOOK · 生命周期钩子',
} as const;

const CTX_LABELS = {
  yes: '进入 LLM',
  conditional: '条件投影',
  no: '仅持久化',
} as const;

/**
 * Crisp inline SVG Master Map of Pi's exact double-loop control flow
 * verified against packages/agent/src/agent-loop.ts (runLoop).
 */
function DoubleLoopMasterMap() {
  const uid = useId();
  const arrowId = `${uid}-arrow`;
  const arrowRustId = `${uid}-arrow-rust`;

  return (
    <div className="master-map-wrap">
      <svg
        className="master-map-svg"
        viewBox="0 0 980 436"
        role="img"
        aria-label="Pi Agent Loop 双层控制流总览图"
      >
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.2 L 9 5 L 0 8.8 z" fill="var(--edge)" />
          </marker>
          <marker
            id={arrowRustId}
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.2 L 9 5 L 0 8.8 z" fill="var(--rust)" />
          </marker>
        </defs>

        {/* Outer Loop Container */}
        <rect
          x="16"
          y="62"
          width="948"
          height="362"
          rx="12"
          fill="var(--blue)"
          fillOpacity="0.22"
          stroke="var(--blue-stroke)"
          strokeWidth="1.7"
          strokeDasharray="6 4"
        />
        <rect
          x="200"
          y="51"
          width="296"
          height="22"
          rx="5"
          fill="var(--blue)"
          stroke="var(--edge)"
          strokeWidth="1.3"
        />
        <text
          x="212"
          y="66"
          fontSize="10.2"
          fontWeight="800"
          fill="var(--ink)"
        >
          OUTER LOOP · while (true) 跟进与续行层
        </text>

        {/* Inner Loop Container */}
        <rect
          x="34"
          y="98"
          width="746"
          height="210"
          rx="10"
          fill="var(--green)"
          fillOpacity="0.24"
          stroke="var(--green-stroke)"
          strokeWidth="1.7"
          strokeDasharray="5 4"
        />
        <rect
          x="200"
          y="87"
          width="524"
          height="22"
          rx="5"
          fill="var(--green)"
          stroke="var(--edge)"
          strokeWidth="1.3"
        />
        <text
          x="212"
          y="102"
          fontSize="9.8"
          fontWeight="800"
          fill="var(--ink)"
        >
          INNER LOOP · while (hasMoreToolCalls || pendingMessages.length &gt; 0)
        </text>

        {/* Entry Node */}
        <g transform="translate(36, 10)">
          <rect
            x="2"
            y="2.5"
            width="236"
            height="28"
            rx="6"
            fill="var(--edge)"
            opacity="0.9"
          />
          <rect
            x="0"
            y="0"
            width="236"
            height="28"
            rx="6"
            fill="var(--sheet)"
            stroke="var(--edge)"
            strokeWidth="1.5"
          />
          <text
            x="118"
            y="18"
            textAnchor="middle"
            fontSize="10.6"
            fontWeight="800"
            fill="var(--ink)"
          >
            agentLoop() / agentLoopContinue()
          </text>
        </g>

        {/* Prelim note pill to the right of Entry Node */}
        <path
          d="M 272 24 L 296 24"
          fill="none"
          stroke="var(--edge)"
          strokeWidth="1.5"
          strokeDasharray="3 2"
        />
        <rect
          x="296"
          y="10"
          width="316"
          height="28"
          rx="5"
          fill="var(--paper-2)"
          stroke="var(--line-strong)"
          strokeWidth="1.2"
        />
        <text
          x="454"
          y="28"
          textAnchor="middle"
          fontSize="9.6"
          fontWeight="700"
          fill="var(--muted)"
        >
          预检 getSteeringMessages() · emit agent_start
        </text>

        {/* Unobstructed vertical entry arrow straight into Box 1 */}
        <path
          d="M 115 38 L 115 128"
          fill="none"
          stroke="var(--edge)"
          strokeWidth="1.7"
          markerEnd={`url(#${arrowId})`}
        />

        {/* Inner Step 1: Turn Setup & Compaction */}
        <g transform="translate(46, 132)">
          <rect x="2" y="2.5" width="204" height="66" rx="7" fill="var(--edge)" />
          <rect
            x="0"
            y="0"
            width="204"
            height="66"
            rx="7"
            fill="var(--sheet)"
            stroke="var(--edge)"
            strokeWidth="1.5"
          />
          <text x="102" y="20" textAnchor="middle" fontSize="10.6" fontWeight="800" fill="var(--ink)">
            1. 轮次准备 &amp; 增量声明
          </text>
          <text x="102" y="37" textAnchor="middle" fontSize="8.8" fill="var(--ink-2)">
            prepareNextTurn() 自动压缩
          </text>
          <text x="102" y="53" textAnchor="middle" fontSize="8.8" fill="var(--muted)">
            declareToolChanges() · turn_start
          </text>
        </g>

        {/* Arrow 1 -> 2 */}
        <line
          x1="250"
          y1="165"
          x2="270"
          y2="165"
          stroke="var(--edge)"
          strokeWidth="1.6"
          markerEnd={`url(#${arrowId})`}
        />

        {/* Inner Step 2: Message Pipeline + LLM Stream */}
        <g transform="translate(274, 132)">
          <rect x="2" y="2.5" width="216" height="66" rx="7" fill="var(--edge)" />
          <rect
            x="0"
            y="0"
            width="216"
            height="66"
            rx="7"
            fill="var(--violet)"
            stroke="var(--edge)"
            strokeWidth="1.5"
          />
          <text x="108" y="20" textAnchor="middle" fontSize="10.6" fontWeight="800" fill="var(--ink)">
            2. 流水线 &amp; LLM 流式推理
          </text>
          <text x="108" y="37" textAnchor="middle" fontSize="8.8" fill="var(--ink-2)">
            transformContext → convertToLlm
          </text>
          <text x="108" y="53" textAnchor="middle" fontSize="8.8" fill="var(--ink-2)">
            prepareRequest → streamFn (pi-ai)
          </text>
        </g>

        {/* Arrow 2 -> 3 (Tool Execution) */}
        <line
          x1="490"
          y1="165"
          x2="510"
          y2="165"
          stroke="var(--edge)"
          strokeWidth="1.6"
          markerEnd={`url(#${arrowId})`}
        />

        {/* Inner Step 3: Tool Batch Execution */}
        <g transform="translate(514, 132)">
          <rect x="2" y="2.5" width="252" height="66" rx="7" fill="var(--edge)" />
          <rect
            x="0"
            y="0"
            width="252"
            height="66"
            rx="7"
            fill="var(--orange)"
            stroke="var(--edge)"
            strokeWidth="1.5"
          />
          <text x="126" y="20" textAnchor="middle" fontSize="10.6" fontWeight="800" fill="var(--ink)">
            3. 工具批次执行 (默认 parallel)
          </text>
          <text x="126" y="37" textAnchor="middle" fontSize="8.8" fill="var(--ink-2)">
            length 截断守卫 → 串行预检 beforeToolCall
          </text>
          <text x="126" y="53" textAnchor="middle" fontSize="8.8" fill="var(--ink-2)">
            并发 Promise.all → 源码序 append toolResult
          </text>
        </g>

        {/* Hard Exit Branch from Step 2 (clear corridor y = 118) */}
        <path
          d="M 430 132 L 430 118 L 872 118 L 872 132"
          fill="none"
          stroke="var(--rose-stroke)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerEnd={`url(#${arrowRustId})`}
        />
        <g transform="translate(796, 136)">
          <rect x="2" y="2.5" width="152" height="58" rx="7" fill="var(--edge)" />
          <rect
            x="0"
            y="0"
            width="152"
            height="58"
            rx="7"
            fill="var(--rose)"
            stroke="var(--edge)"
            strokeWidth="1.5"
          />
          <text x="76" y="21" textAnchor="middle" fontSize="10.6" fontWeight="800" fill="var(--ink)">
            硬退出 Hard Exit
          </text>
          <text x="76" y="37" textAnchor="middle" fontSize="9.2" fill="var(--ink-2)">
            error / aborted
          </text>
          <text x="76" y="50" textAnchor="middle" fontSize="9.2" fill="var(--ink-2)">
            turn_end → agent_end
          </text>
        </g>

        {/* Arrow 3 -> 4 (finishTurn + Steering) */}
        <path
          d="M 640 198 L 640 228"
          fill="none"
          stroke="var(--edge)"
          strokeWidth="1.6"
          markerEnd={`url(#${arrowId})`}
        />

        {/* Inner Step 4: finishTurn + Steering Poll */}
        <g transform="translate(444, 232)">
          <rect x="2" y="2.5" width="322" height="62" rx="7" fill="var(--edge)" />
          <rect
            x="0"
            y="0"
            width="322"
            height="62"
            rx="7"
            fill="var(--green)"
            stroke="var(--edge)"
            strokeWidth="1.5"
          />
          <text x="161" y="20" textAnchor="middle" fontSize="10.6" fontWeight="800" fill="var(--ink)">
            4. 轮次收尾 &amp; 转向轮询 (批后生效)
          </text>
          <text x="161" y="37" textAnchor="middle" fontSize="9.1" fill="var(--ink-2)">
            finishTurn() · emit turn_end · getSteeringMessages()
          </text>
          <text x="161" y="52" textAnchor="middle" fontSize="8.8" fill="var(--ink-2)">
            绝不跳过当前批次工具；若仍有工具或转向消息则续跑内层
          </text>
        </g>

        {/* Inner Loop Back Edge */}
        <path
          d="M 444 263 L 126 263 L 126 202"
          fill="none"
          stroke="var(--green-stroke)"
          strokeWidth="1.9"
          markerEnd={`url(#${arrowId})`}
        />
        <rect
          x="146"
          y="251"
          width="276"
          height="24"
          rx="5"
          fill="var(--mint)"
          stroke="var(--edge)"
          strokeWidth="1.2"
        />
        <text x="284" y="266.5" textAnchor="middle" fontSize="9.2" fontWeight="800" fill="var(--ink)">
          hasMoreToolCalls || steering.length &gt; 0
        </text>

        {/* Inner -> Outer FollowUp Check */}
        <path
          d="M 592 294 L 592 348"
          fill="none"
          stroke="var(--edge)"
          strokeWidth="1.6"
          markerEnd={`url(#${arrowId})`}
        />
        <rect
          x="502"
          y="316"
          width="180"
          height="22"
          rx="5"
          fill="var(--sheet)"
          stroke="var(--line-strong)"
          strokeWidth="1.2"
        />
        <text x="592" y="330.5" textAnchor="middle" fontSize="9.2" fontWeight="700" fill="var(--muted)">
          内层静默 (无工具且无转向)
        </text>

        {/* Outer Step 5: Follow-up & Continuation */}
        <g transform="translate(362, 352)">
          <rect x="2" y="2.5" width="388" height="58" rx="7" fill="var(--edge)" />
          <rect
            x="0"
            y="0"
            width="388"
            height="58"
            rx="7"
            fill="var(--blue)"
            stroke="var(--edge)"
            strokeWidth="1.5"
          />
          <text x="194" y="20" textAnchor="middle" fontSize="10.6" fontWeight="800" fill="var(--ink)">
            5. 外层跟进检查 · getFollowUpMessages()
          </text>
          <text x="194" y="37" textAnchor="middle" fontSize="9.2" fill="var(--ink-2)">
            有排队跟进 (Alt+Enter) 或 finishTurn=&quot;continue&quot; → 重启内层
          </text>
          <text x="194" y="51" textAnchor="middle" fontSize="9.1" fill="var(--ink-2)">
            均为空 → break 退出双层循环
          </text>
        </g>

        {/* Outer Loop Back Edge */}
        <path
          d="M 362 381 L 78 381 L 78 202"
          fill="none"
          stroke="var(--blue-stroke)"
          strokeWidth="1.8"
          strokeDasharray="6 3"
          markerEnd={`url(#${arrowId})`}
        />
        <rect
          x="104"
          y="369"
          width="224"
          height="24"
          rx="5"
          fill="var(--sheet)"
          stroke="var(--blue-stroke)"
          strokeWidth="1.2"
        />
        <text x="216" y="384.5" textAnchor="middle" fontSize="9.2" fontWeight="800" fill="var(--ink)">
          注入 followUpMessages → 重进内层
        </text>

        {/* Final Agent End */}
        <line
          x1="750"
          y1="381"
          x2="792"
          y2="381"
          stroke="var(--edge)"
          strokeWidth="1.6"
          markerEnd={`url(#${arrowId})`}
        />
        <g transform="translate(796, 352)">
          <rect x="2" y="2.5" width="152" height="58" rx="7" fill="var(--edge)" />
          <rect
            x="0"
            y="0"
            width="152"
            height="58"
            rx="7"
            fill="var(--sheet)"
            stroke="var(--edge)"
            strokeWidth="1.5"
          />
          <text x="76" y="21" textAnchor="middle" fontSize="10.6" fontWeight="800" fill="var(--ink)">
            agent_end
          </text>
          <text x="76" y="37" textAnchor="middle" fontSize="9.2" fill="var(--ink-2)">
            {'{ messages: newMessages }'}
          </text>
          <text x="76" y="51" textAnchor="middle" fontSize="9" fill="var(--muted)">
            等待 subscribe 监听完成
          </text>
        </g>
      </svg>
    </div>
  );
}

export function CheatsheetView({
  data,
  onJumpToLesson,
  onBackToLearn,
}: CheatsheetViewProps) {
  const { hero, sections } = data;

  const tocItems = [
    sections.doubleLoop,
    sections.events,
    sections.pipeline,
    sections.defaults,
    sections.sessionAndExt,
    sections.decisions,
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`cs-sec-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderSectionLink = (link?: CheatsheetLink) => {
    if (!link) return null;
    return (
      <button
        type="button"
        className="tactile-btn cs-jump-btn"
        onClick={() => onJumpToLesson(link.lessonSlug, link.stepNumber)}
      >
        <span>{link.label}</span>
        <ArrowUpRight size={13} />
      </button>
    );
  };

  return (
    <main className="cheatsheet-page" aria-label="Pi Agent Loop 架构速查表">
      {/* Editorial Hero */}
      <section className="cs-hero">
        <div className="cs-hero-top">
          <div>
            <span className="cs-eyebrow">{hero.eyebrow}</span>
            <h1 className="cs-title">{hero.title}</h1>
            <p className="cs-subtitle">{hero.subtitle}</p>
          </div>
          <div className="cs-hero-actions">
            <button
              type="button"
              className="tactile-btn tactile-btn--primary cs-action-btn"
              onClick={onBackToLearn}
            >
              <ArrowLeft size={14} />
              <span>返回交互课程</span>
            </button>
          </div>
        </div>

        {hero.stats.length > 0 && (
          <div className="cs-stats-row">
            {hero.stats.map((stat, idx) => (
              <div
                key={idx}
                className={`cs-stat-chip ${stat.tone ? `cs-stat-chip--${stat.tone}` : ''}`}
              >
                <span className="cs-stat-label">{stat.label}</span>
                <span className="cs-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        <p className="cs-scope-note">
          <strong>范围说明：</strong>
          {renderRichText(hero.scopeNote)}{' '}
          <span style={{ opacity: 0.8 }}>（{hero.repoNote}）</span>
        </p>
      </section>

      {/* Quick-Jump TOC */}
      <nav className="cs-toc" aria-label="速查表章节跳转">
        {tocItems.map((sec) => (
          <button
            key={sec.id}
            type="button"
            className="cs-toc-pill"
            onClick={() => scrollToSection(sec.id)}
          >
            <span className="cs-toc-num">{sec.number}</span>
            <span>{sec.title}</span>
          </button>
        ))}
      </nav>

      {/* Section 01: Double-Loop Master Map & Control Cards */}
      <section id={`cs-sec-${sections.doubleLoop.id}`} className="cs-section">
        <div className="cs-section-header">
          <div>
            <div className="cs-section-title-group">
              <span className="cs-section-num">{sections.doubleLoop.number}</span>
              <h2 className="cs-section-title">{sections.doubleLoop.title}</h2>
            </div>
            <p className="cs-section-sub">{sections.doubleLoop.subtitle}</p>
          </div>
          {renderSectionLink(sections.doubleLoop.lessonLink)}
        </div>

        <div className="cs-section-body">
          <DoubleLoopMasterMap />

          {sections.doubleLoop.cards.length > 0 && (
            <div className="cs-card-grid">
              {sections.doubleLoop.cards.map((card) => (
                <article key={card.id} className="cs-control-card">
                  <div className="cs-control-top">
                    <span className={`cs-phase-tag cs-phase-tag--${card.phase}`}>
                      {PHASE_LABELS[card.phase]}
                    </span>
                    <code className="cs-control-id">{card.identifier}</code>
                  </div>
                  <h3 className="cs-control-title">{card.title}</h3>
                  <p className="cs-control-line">
                    <strong>触发：</strong>
                    {renderRichText(card.trigger)}
                  </p>
                  <p className="cs-control-line">
                    <strong>行为：</strong>
                    {renderRichText(card.behavior)}
                  </p>
                  <button
                    type="button"
                    className="cs-inline-jump"
                    onClick={() => onJumpToLesson(card.lessonSlug, card.stepNumber)}
                  >
                    <span>交互演示</span>
                    <ArrowUpRight size={12} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 02: 10 AgentEvent Lifecycle Events */}
      <section id={`cs-sec-${sections.events.id}`} className="cs-section">
        <div className="cs-section-header">
          <div>
            <div className="cs-section-title-group">
              <span className="cs-section-num">{sections.events.number}</span>
              <h2 className="cs-section-title">{sections.events.title}</h2>
            </div>
            <p className="cs-section-sub">{sections.events.subtitle}</p>
          </div>
          {renderSectionLink(sections.events.lessonLink)}
        </div>

        <div className="cs-section-body">
          <div className="cs-table-scroll">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>事件类型</th>
                  <th>层级</th>
                  <th>关键载荷</th>
                  <th>发射时机</th>
                  <th>典型消费场景</th>
                </tr>
              </thead>
              <tbody>
                {sections.events.items.map((ev) => (
                  <tr key={ev.eventType}>
                    <td>
                      <code className="inline-code">{ev.eventType}</code>
                    </td>
                    <td>
                      <span className={`cs-cat-pill cs-cat-pill--${ev.category}`}>
                        {ev.category}
                      </span>
                    </td>
                    <td>{renderRichText(ev.payload)}</td>
                    <td>{renderRichText(ev.timing)}</td>
                    <td>{renderRichText(ev.note)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 03: Message Pipeline */}
      <section id={`cs-sec-${sections.pipeline.id}`} className="cs-section">
        <div className="cs-section-header">
          <div>
            <div className="cs-section-title-group">
              <span className="cs-section-num">{sections.pipeline.number}</span>
              <h2 className="cs-section-title">{sections.pipeline.title}</h2>
            </div>
            <p className="cs-section-sub">{sections.pipeline.subtitle}</p>
          </div>
          {renderSectionLink(sections.pipeline.lessonLink)}
        </div>

        <div className="cs-section-body">
          <div className="cs-pipeline-flow">
            {sections.pipeline.stages.map((stage) => (
              <div key={stage.order} className="cs-pipeline-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="cs-pipeline-step-num">{stage.order}</span>
                  <strong style={{ fontSize: '13px' }}>{stage.name}</strong>
                </div>
                <code className="cs-control-id">{stage.identifier}</code>
                <div className="cs-pipeline-io">
                  {stage.inputType} → {stage.outputType}
                </div>
                <p className="cs-control-line">{renderRichText(stage.role)}</p>
                {stage.note && (
                  <p className="cs-control-line" style={{ color: 'var(--muted)' }}>
                    {renderRichText(stage.note)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {sections.pipeline.customMessageTypes.length > 0 && (
            <div className="cs-subblock">
              <h3 className="cs-subblock-title">
                <Layers size={14} />
                <span>CustomAgentMessages 扩展消息角色（pi-coding-agent）</span>
              </h3>
              <div className="cs-table-scroll">
                <table className="cs-table">
                  <thead>
                    <tr>
                      <th>消息角色</th>
                      <th>是否送入 LLM</th>
                      <th>转换与用途说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.pipeline.customMessageTypes.map((msg) => (
                      <tr key={msg.role}>
                        <td>
                          <code className="inline-code">{msg.role}</code>
                        </td>
                        <td>
                          <span
                            className={`cs-ctx-pill ${
                              msg.includedInLlm ? 'cs-ctx-pill--yes' : 'cs-ctx-pill--no'
                            }`}
                          >
                            {msg.includedInLlm ? '转换后送入' : '过滤剔除'}
                          </span>
                        </td>
                        <td>{renderRichText(msg.note)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 04: Defaults, 4 Core Tools & MCP Exposure Modes */}
      <section id={`cs-sec-${sections.defaults.id}`} className="cs-section">
        <div className="cs-section-header">
          <div>
            <div className="cs-section-title-group">
              <span className="cs-section-num">{sections.defaults.number}</span>
              <h2 className="cs-section-title">{sections.defaults.title}</h2>
            </div>
            <p className="cs-section-sub">{sections.defaults.subtitle}</p>
          </div>
          {renderSectionLink(sections.defaults.lessonLink)}
        </div>

        <div className="cs-section-body">
          {sections.defaults.params.length > 0 && (
            <div className="cs-subblock">
              <h3 className="cs-subblock-title">
                <Sliders size={14} />
                <span>核心运行参数与默认阈值</span>
              </h3>
              <div className="cs-param-grid">
                {sections.defaults.params.map((p) => (
                  <div key={p.key} className="cs-param-card">
                    <div className="cs-param-head">
                      <code className="inline-code">{p.key}</code>
                      <span className="cs-param-val">{p.defaultValue}</span>
                    </div>
                    <span className="cs-param-scope">{p.scope}</span>
                    <p className="cs-param-desc">{renderRichText(p.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="cs-subgrid-2">
            {sections.defaults.coreTools.length > 0 && (
              <div className="cs-subblock">
                <h3 className="cs-subblock-title">
                  <Wrench size={14} />
                  <span>内置工具集（默认 4 把核心工具）</span>
                </h3>
                <div className="cs-table-scroll">
                  <table className="cs-table">
                    <thead>
                      <tr>
                        <th>工具</th>
                        <th>默认启用</th>
                        <th>职责与约束</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.defaults.coreTools.map((tool) => (
                        <tr key={tool.name}>
                          <td>
                            <code className="inline-code">{tool.name}</code>
                          </td>
                          <td>
                            <span
                              className={`cs-ctx-pill ${
                                tool.defaultEnabled
                                  ? 'cs-ctx-pill--yes'
                                  : 'cs-ctx-pill--conditional'
                              }`}
                            >
                              {tool.defaultEnabled ? '默认开启' : '按需开启'}
                            </span>
                          </td>
                          <td>
                            <strong>{tool.role}：</strong>
                            {renderRichText(tool.note)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {sections.defaults.mcpModes.length > 0 && (
              <div className="cs-subblock">
                <h3 className="cs-subblock-title">
                  <Cpu size={14} />
                  <span>MCP 四种暴露模式（2026-09 原生集成）</span>
                </h3>
                <div className="cs-table-scroll">
                  <table className="cs-table">
                    <thead>
                      <tr>
                        <th>模式</th>
                        <th>前缀开销</th>
                        <th>发现与调用机制</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.defaults.mcpModes.map((m) => (
                        <tr key={m.mode}>
                          <td>
                            <code className="inline-code">{m.mode}</code>
                            {m.isDefault && (
                              <span
                                className="cs-ctx-pill cs-ctx-pill--yes"
                                style={{ marginLeft: '6px' }}
                              >
                                默认
                              </span>
                            )}
                          </td>
                          <td>{renderRichText(m.promptCost)}</td>
                          <td>{renderRichText(m.behavior)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 05: JSONL v3 Session Entries & Extension Hooks */}
      <section id={`cs-sec-${sections.sessionAndExt.id}`} className="cs-section">
        <div className="cs-section-header">
          <div>
            <div className="cs-section-title-group">
              <span className="cs-section-num">{sections.sessionAndExt.number}</span>
              <h2 className="cs-section-title">{sections.sessionAndExt.title}</h2>
            </div>
            <p className="cs-section-sub">{sections.sessionAndExt.subtitle}</p>
          </div>
          {renderSectionLink(sections.sessionAndExt.lessonLink)}
        </div>

        <div className="cs-section-body">
          <div className="cs-subgrid-2">
            <div className="cs-subblock">
              <h3 className="cs-subblock-title">
                <GitBranch size={14} />
                <span>JSONL v3 只追加会话条目类型</span>
              </h3>
              <div className="cs-table-scroll">
                <table className="cs-table">
                  <thead>
                    <tr>
                      <th>type</th>
                      <th>上下文投影</th>
                      <th>用途与核心字段</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.sessionAndExt.entryTypes.map((entry) => (
                      <tr key={entry.type}>
                        <td>
                          <code className="inline-code">{entry.type}</code>
                        </td>
                        <td>
                          <span
                            className={`cs-ctx-pill cs-ctx-pill--${entry.inLlmContext}`}
                          >
                            {CTX_LABELS[entry.inLlmContext]}
                          </span>
                        </td>
                        <td>
                          <div>{renderRichText(entry.purpose)}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '11px' }}>
                            字段：{renderRichText(entry.keyFields)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="cs-subblock">
              <h3 className="cs-subblock-title">
                <Layers size={14} />
                <span>ExtensionAPI 关键生命周期钩子</span>
              </h3>
              <div className="cs-table-scroll">
                <table className="cs-table">
                  <thead>
                    <tr>
                      <th>钩子 / API</th>
                      <th>阶段</th>
                      <th>扩展能力</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.sessionAndExt.extensionHooks.map((h) => (
                      <tr key={h.hook}>
                        <td>
                          <code className="inline-code">{h.hook}</code>
                        </td>
                        <td>{h.phase}</td>
                        <td>{renderRichText(h.capability)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 06: Architecture Tradeoffs & Anti-Framework Philosophy */}
      <section id={`cs-sec-${sections.decisions.id}`} className="cs-section">
        <div className="cs-section-header">
          <div>
            <div className="cs-section-title-group">
              <span className="cs-section-num">{sections.decisions.number}</span>
              <h2 className="cs-section-title">{sections.decisions.title}</h2>
            </div>
            <p className="cs-section-sub">{sections.decisions.subtitle}</p>
          </div>
          {renderSectionLink(sections.decisions.lessonLink)}
        </div>

        <div className="cs-section-body">
          <div className="cs-table-scroll">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>架构维度</th>
                  <th>Pi 的极简决策</th>
                  <th>传统重型框架做法</th>
                  <th>底层原因与取舍</th>
                  <th>定位</th>
                </tr>
              </thead>
              <tbody>
                {sections.decisions.rows.map((row) => (
                  <tr key={row.dimension}>
                    <td>
                      <strong>{row.dimension}</strong>
                    </td>
                    <td>{renderRichText(row.piApproach)}</td>
                    <td style={{ color: 'var(--muted)' }}>
                      {renderRichText(row.conventionalApproach)}
                    </td>
                    <td>{renderRichText(row.rationale)}</td>
                    <td>
                      <button
                        type="button"
                        className="cs-inline-jump"
                        onClick={() => onJumpToLesson(row.lessonSlug, row.stepNumber)}
                      >
                        <span>课程</span>
                        <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
