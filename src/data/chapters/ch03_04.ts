import type { Chapter } from '../../types/lesson';

// ============================================================================
// Chapters 03 & 04: 消息管线与事件流 · 工具与缓存稳定术
// Grounded strictly in verified earendil-works/pi primary source code
// ============================================================================

export const CHAPTERS_03_04: Chapter[] = [
  // ==========================================================================
  // CHAPTER 03 — 消息管线与事件流
  // ==========================================================================
  {
    id: 'ch03',
    number: 3,
    title: '消息管线与事件流',
    color: 'violet',
    lessons: [
      // ----------------------------------------------------------------------
      // Lesson 6 (ch03-l01): 消息管线：从 AgentMessage 到 LLM
      // ----------------------------------------------------------------------
      {
        id: 'ch03-l01',
        slug: 'message-pipeline',
        chapterId: 'ch03',
        chapterNumber: 3,
        chapterTitle: '消息管线与事件流',
        lessonIndexInChapter: 1,
        totalInChapter: 2,
        title: '消息管线：从 AgentMessage 到 LLM',
        subtitle:
          '拆解 AgentMessage 声明合并扩展、transformContext 裁剪、convertToLlm 过滤与 pi-ai 跨模型无缝切换',
        durationMin: 9,
        level: '核心',
        objectives: [
          {
            id: 'obj-mp-1',
            text: '理解为何 `pi-agent-core` 不直接存储厂商原生 `Message[]`，而是以 `AgentMessage[]` 解耦应用层状态',
            completedAtStep: 2,
          },
          {
            id: 'obj-mp-2',
            text: '掌握 `CustomAgentMessages` 声明合并与 `coding-agent` 注入的 4 类领域消息',
            completedAtStep: 3,
          },
          {
            id: 'obj-mp-3',
            text: '区分 `transformContext` 非破坏性上下文加工与 `convertToLlm` 协议过滤的双阶边界',
            completedAtStep: 5,
          },
          {
            id: 'obj-mp-4',
            text: '理解 `normalizeContext` 如何将系统提示与工具增量统一编排进 `TranscriptContext` 的 `SystemMessage`',
            completedAtStep: 6,
          },
          {
            id: 'obj-mp-5',
            text: '看懂动态 `getApiKey(provider)` 与 `streamFn` 如何借助 `pi-ai` 实现中途换模不丢历史',
            completedAtStep: 7,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: '协议耦合困局',
            badge: 'PROBLEM',
            title: '为什么内核绝不能直接存储厂商原生 Message[]？',
            paragraphs: [
              '大多数初版 Agent 会直接把 OpenAI 或 Anthropic 的原始 `Message[]` 数组当作内存状态。但这很快会撞上两堵硬墙：第一，不同厂商的思维链块、工具调用结构与系统消息格式互不兼容；第二，真实编码 Agent 需要记录大量 **LLM 协议里根本不存在的应用层事件**。',
              '例如用户在终端敲下 `!git status` 或静默执行 `!!ls` 产生的 Bash 输出、`/tree` 切分支生成的分支摘要、压缩检查点以及插件自定义的 UI 卡片。如果强行塞进厂商 `Message[]`，要么污染模型上下文、要么把内核死死锁死在单一 API 协议上。',
            ],
            callout: {
              kind: 'warn',
              title: '双源冲突',
              text: '当 **UI/会话层状态** 与 **LLM 传输协议** 共享同一数据结构时，任何界面扩展或跨模型切换都会演变成全局重构。',
            },
            diffs: [
              { kind: 'remove', text: '厂商原生 `Message[]` 无法表达 `bashExecution`、`branchSummary` 等应用状态' },
              { kind: 'remove', text: 'OpenAI / Anthropic / Google 协议碎片导致切换模型即丢失历史' },
              { kind: 'change', text: '需要一条清晰的「领域状态 → 传输消息」单向变换管线' },
            ],
            kpis: [
              { label: '厂商协议差异', value: '3+ 套不兼容', status: 'bad' },
              { label: 'UI 领域消息', value: '无法直接入库', status: 'bad' },
              { label: '中途切换模型', value: '需重写历史', status: 'bad' },
              { label: '内核职责边界', value: '严重耦合', status: 'warn' },
            ],
            legend: [
              { color: '#b94a48', label: '协议冲突 / 阻塞路径', dashed: true },
              { color: '#6f4ea3', label: '应用层领域数据' },
              { color: '#3c6ea8', label: '异构 LLM 厂商协议' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '反模式：内核直存厂商 Message[] 导致的双向撕裂',
              zones: [
                {
                  id: 'z-app',
                  x: 65,
                  y: 62,
                  w: 245,
                  h: 435,
                  label: '应用层丰富状态（非标准）',
                  tone: 'violet',
                  dashed: true,
                },
                {
                  id: 'z-vendor',
                  x: 690,
                  y: 62,
                  w: 245,
                  h: 435,
                  label: '异构厂商 API 协议',
                  tone: 'blue',
                  dashed: true,
                },
              ],
              nodes: [
                {
                  id: 'app-bash',
                  x: 188,
                  y: 115,
                  label: '! / !! Bash 输出',
                  sublabel: '含 excludeFromContext',
                  icon: 'terminal',
                  tone: 'violet',
                  size: 'sm',
                },
                {
                  id: 'app-summary',
                  x: 188,
                  y: 280,
                  label: '压缩 / 分支摘要',
                  sublabel: '带文件追踪元数据',
                  icon: 'git-branch',
                  tone: 'violet',
                  size: 'sm',
                },
                {
                  id: 'app-ext',
                  x: 188,
                  y: 445,
                  label: '扩展 UI 卡片',
                  sublabel: '仅展示不发模型',
                  icon: 'package',
                  tone: 'violet',
                  size: 'sm',
                },
                {
                  id: 'bottleneck',
                  x: 500,
                  y: 280,
                  label: '硬编码厂商 Message[]',
                  sublabel: 'schema 撕裂 · 换模即崩',
                  icon: 'alert',
                  tone: 'rose',
                  size: 'lg',
                  active: true,
                  badge: '耦合瓶颈',
                  meter: { value: 94, label: '耦合度', status: 'bad' },
                },
                {
                  id: 'v-anthropic',
                  x: 812,
                  y: 115,
                  label: 'Anthropic Messages',
                  sublabel: 'thinking / tool_use 块',
                  icon: 'cpu',
                  tone: 'blue',
                  size: 'sm',
                },
                {
                  id: 'v-openai',
                  x: 812,
                  y: 280,
                  label: 'OpenAI Responses',
                  sublabel: 'reasoning / function_call',
                  icon: 'cpu',
                  tone: 'blue',
                  size: 'sm',
                },
                {
                  id: 'v-google',
                  x: 812,
                  y: 445,
                  label: 'Google GenAI',
                  sublabel: 'parts / functionResponse',
                  icon: 'cpu',
                  tone: 'blue',
                  size: 'sm',
                },
              ],
              edges: [
                { from: 'app-bash', to: 'bottleneck', label: '非法字段', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'app-summary', to: 'bottleneck', label: '格式溢出', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'app-ext', to: 'bottleneck', label: '污染上下文', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'bottleneck', to: 'v-anthropic', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'bottleneck', to: 'v-openai', label: '换模报错', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'bottleneck', to: 'v-google', status: 'error', dashed: true, packetColor: '#b94a48' },
              ],
              callouts: [
                { x: 500, y: 492, text: '痛点：一份数组既要服务 TUI 渲染，又要讨好 3 家不同厂商 API', tone: 'rose' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: 'AgentMessage 扩展',
            badge: 'SOLUTION',
            title: '用 CustomAgentMessages 声明合并实现零侵入扩展',
            paragraphs: [
              '`pi-agent-core`（全部源码仅 6 个文件、2,548 行）选择了一个极其优雅的 TypeScript 方案：核心状态 `context.messages` 存储的是可扩展联合类型 `AgentMessage[]`，而非死板的 `Message[]`。内核暴露空接口 `CustomAgentMessages`，让上层应用通过 **Declaration Merging（声明合并）** 注入自己的领域消息。',
              '`pi-coding-agent` 在 `messages.ts` 中无缝挂入 4 类一等公民消息：`bashExecution`（用户的 `!`/`!!` 命令输出）、`custom`（扩展自定义消息）、`branchSummary`（`/tree` 分支摘要）与 `compactionSummary`（非破坏性压缩摘要）。内核无需 import 任何一行上层代码，却能提供完备类型安全。',
            ],
            callout: {
              kind: 'idea',
              title: '单向依赖铁律',
              text: '`pi-agent-core` 永远不依赖 `pi-coding-agent`。通过 `CustomAgentMessages` 模块扩充，上层领域类型反向获得完整静态推导，同时保持内核 0 业务耦合。',
            },
            diffs: [
              { kind: 'add', text: '定义联合类型 `AgentMessage = Message | CustomAgentMessages[keyof CustomAgentMessages]`' },
              { kind: 'add', text: '`coding-agent` 注册 4 种领域消息：`bashExecution`、`custom`、`branchSummary`、`compactionSummary`' },
              { kind: 'change', text: '`context.messages` 成为唯一事实源，同时支撑 TUI 渲染与后续 LLM 管线' },
            ],
            sourceDrawer: {
              title: 'CustomAgentMessages 声明合并扩展',
              filePath: 'packages/coding-agent/src/core/messages.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/messages.ts',
              language: 'ts',
              code: `// packages/agent/src/types.ts — 内核开放扩展槽
export interface CustomAgentMessages {}
export type AgentMessage =
  | Message
  | CustomAgentMessages[keyof CustomAgentMessages];

// packages/coding-agent/src/core/messages.ts — 上层零侵入合并
declare module "@earendil-works/pi-agent-core" {
  interface CustomAgentMessages {
    bashExecution: BashExecutionMessage;
    custom: CustomMessage;
    branchSummary: BranchSummaryMessage;
    compactionSummary: CompactionSummaryMessage;
  }
}`,
              caption: 'TypeScript `declare module` 让 `pi-agent-core` 保持纯粹通用，同时赋予 `coding-agent` 强类型领域消息。',
            },
            kpis: [
              { label: '核心源码规模', value: '6 文件 / 2,548 行', status: 'good' },
              { label: '标准 LLM 消息', value: '4 类 Message', status: 'neutral' },
              { label: 'Coding 扩展消息', value: '+4 类 Custom', status: 'good' },
              { label: '内核反向依赖', value: '0 条', status: 'good' },
            ],
            legend: [
              { color: '#3c6ea8', label: 'pi-ai 标准 Message' },
              { color: '#6f4ea3', label: 'CustomAgentMessages 扩展' },
              { color: '#4e7d34', label: '统一 AgentMessage[] 状态' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'AgentMessage[]：通过声明合并融合标准消息与领域消息',
              zones: [
                {
                  id: 'z-std',
                  x: 75,
                  y: 78,
                  w: 255,
                  h: 170,
                  label: 'pi-ai 标准 Message',
                  tone: 'blue',
                  items: [
                    { label: 'user', filled: true },
                    { label: 'assistant', filled: true },
                    { label: 'toolResult', filled: true },
                    { label: 'system', filled: true },
                  ],
                },
                {
                  id: 'z-custom',
                  x: 75,
                  y: 288,
                  w: 255,
                  h: 205,
                  label: 'CustomAgentMessages (coding-agent)',
                  tone: 'violet',
                  dashed: true,
                  items: [
                    { label: 'bashExecution', filled: true },
                    { label: 'custom', filled: true },
                    { label: 'branchSummary', filled: true },
                    { label: 'compactionSummary', filled: true },
                  ],
                },
              ],
              nodes: [
                {
                  id: 'n-std',
                  x: 202,
                  y: 165,
                  label: 'Message 标准集',
                  sublabel: 'user / assistant / toolResult / system',
                  icon: 'message',
                  tone: 'blue',
                  size: 'md',
                },
                {
                  id: 'n-custom',
                  x: 202,
                  y: 392,
                  label: '4 类领域扩展消息',
                  sublabel: 'bash / custom / branch / compaction',
                  icon: 'package',
                  tone: 'violet',
                  size: 'md',
                },
                {
                  id: 'n-store',
                  x: 520,
                  y: 280,
                  label: 'AgentMessage[] 状态仓',
                  sublabel: 'context.messages 唯一事实源',
                  icon: 'database',
                  tone: 'green',
                  size: 'lg',
                  active: true,
                  badge: '强类型联合',
                },
                {
                  id: 'n-ui',
                  x: 825,
                  y: 165,
                  label: 'TUI & Session 落盘',
                  sublabel: '完整保留 UI 与调试细节',
                  icon: 'terminal',
                  tone: 'neutral',
                  size: 'md',
                },
                {
                  id: 'n-pipe',
                  x: 825,
                  y: 395,
                  label: 'LLM 投影管线',
                  sublabel: '按需裁剪与协议转换',
                  icon: 'layers',
                  tone: 'orange',
                  size: 'md',
                  active: true,
                },
              ],
              edges: [
                { from: 'n-std', to: 'n-store', label: '内置', status: 'active', packetColor: '#3c6ea8' },
                { from: 'n-custom', to: 'n-store', label: 'declare module', status: 'active', packetColor: '#6f4ea3' },
                { from: 'n-store', to: 'n-ui', label: '直读全量', status: 'normal', packetColor: '#6f6961' },
                { from: 'n-store', to: 'n-pipe', label: '每轮触发', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: 'transformContext',
            badge: 'TECHNIQUE',
            title: '第一关 transformContext：非破坏性裁剪与动态注入',
            paragraphs: [
              '每次 `streamAssistantResponse` 发起模型调用前，管线第一关是可选的异步钩子 `transformContext(messages, signal)`，输入输出均是 `AgentMessage[]`。此时所有领域元数据依然完整保留，最适合做 **上下文预算治理** 与 **动态知识注入**。',
              '关键在于它是 **非破坏性投影（Non-destructive）**：无论你在 `transformContext` 中截断过长的历史终端输出、折叠陈旧工具日志，还是通过扩展动态注入检索片段，底层 `context.messages` 与磁盘 JSONL 记录一字节都不会丢失。',
            ],
            callout: {
              kind: 'tip',
              title: '支持 AbortSignal',
              text: '`transformContext` 接收 `AbortSignal`，意味着它可以在发送 LLM 请求前安全执行异步操作（如扩展钩子或轻量检索），并在用户按 `Ctrl+C` 时立刻中断。',
            },
            diffs: [
              { kind: 'add', text: '接入 `transformContext(messages, signal): Promise<AgentMessage[]>`' },
              { kind: 'change', text: '34k 冗长历史 Bash 输出在投影视图中裁剪为 2k 摘要，原日志完整留在会话中' },
              { kind: 'add', text: '支持扩展在请求前动态追加临时领域上下文，不污染持久化历史' },
            ],
            kpis: [
              { label: '原始历史占用', value: '94,000 tok', status: 'warn' },
              { label: '裁剪后视图', value: '62,000 tok', status: 'good' },
              { label: '本轮节省预算', value: '-32,000 tok', status: 'good' },
              { label: '原始历史损坏', value: '0 字节', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: '保留 / 命中前缀片段' },
              { color: '#b94a48', label: '冗长待裁剪输出' },
              { color: '#6f4ea3', label: '动态注入 Delta 上下文' },
            ],
            scene: {
              kind: 'token-slices',
              title: 'transformContext：对 AgentMessage[] 做非破坏性视图变换',
              tracks: [
                {
                  id: 'tr-raw',
                  title: '输入 · context.messages（原始完整历史）',
                  subtitle: '磁盘与 TUI 永远保留全部 94k tokens',
                  totalBudget: 128000,
                  usedTokens: 94000,
                  cacheHitEnd: 20000,
                  segments: [
                    { id: 's-sys', label: 'System', tokens: 1200, tone: 'green', cached: true },
                    { id: 's-old', label: '早期对话', tokens: 18800, tone: 'blue', cached: true },
                    { id: 's-bash', label: '超长 Bash 日志 (34k)', tokens: 34000, tone: 'rose', dropped: true },
                    { id: 's-ext', label: '扩展记录', tokens: 6000, tone: 'violet' },
                    { id: 's-recent', label: '近期工具与对话', tokens: 34000, tone: 'blue' },
                  ],
                },
                {
                  id: 'tr-transformed',
                  title: '输出 · transformContext() 视图（仍为 AgentMessage[]）',
                  subtitle: '不改写原数组，仅产出轻量投影',
                  totalBudget: 128000,
                  usedTokens: 62000,
                  cacheHitEnd: 20000,
                  segments: [
                    { id: 't-sys', label: 'System', tokens: 1200, tone: 'green', cached: true },
                    { id: 't-old', label: '早期对话', tokens: 18800, tone: 'blue', cached: true },
                    { id: 't-bash', label: '截断摘要', tokens: 2000, tone: 'orange' },
                    { id: 't-ext', label: '扩展记录', tokens: 6000, tone: 'violet' },
                    { id: 't-inj', label: '动态注入', tokens: 2000, tone: 'violet', delta: true },
                    { id: 't-recent', label: '近期工具与对话', tokens: 32000, tone: 'blue' },
                  ],
                },
              ],
              calloutBadges: [
                { label: '输入/输出类型', value: 'AgentMessage[] → AgentMessage[]', tone: 'violet' },
                { label: '历史安全性', value: '100% 非破坏性', tone: 'green' },
                { label: '单轮净省', value: '32,000 tokens', tone: 'blue' },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: 'convertToLlm',
            badge: 'TECHNIQUE',
            title: '第二关 convertToLlm：把应用消息翻译并过滤为纯 Message[]',
            paragraphs: [
              '经过 `transformContext` 后，管线进入必选关口 `convertToLlm(messages)`。它是应用世界通往 LLM 世界的 **严格边检站**：输入仍是 `AgentMessage[]`，输出必须是严格合法的 `pi-ai` `Message[]`。',
              '在 `pi-coding-agent` 中，`convertToLlm` 会直接 **静默丢弃** 带 `excludeFromContext: true` 的 `!!` Bash 命令和纯 UI 通知卡片（零 Token 损耗）；将普通 `!` Bash 输出、`custom`、`branchSummary` 与 `compactionSummary` 映射为结构清晰的 `user` 消息，其余标准消息原样放行。',
            ],
            callout: {
              kind: 'idea',
              title: '为什么有 ! 与 !! 两种前缀？',
              text: '终端敲 `!npm test` 会把结果作为上下文喂给模型一起排错；敲 `!!git log -5` 仅给人看，设 `excludeFromContext: true`，在 `convertToLlm` 阶段零成本过滤掉！',
            },
            diffs: [
              { kind: 'remove', text: '过滤 `excludeFromContext: true` 的 `!!` Bash 输出与纯 UI 扩展通知' },
              { kind: 'change', text: '将 `!` `bashExecution`、`branchSummary`、`compactionSummary` 映射为标准 `user` 消息' },
              { kind: 'add', text: '保证下游 `pi-ai` 绝不会收到未知 `role` 的非法消息' },
            ],
            sourceDrawer: {
              title: 'coding-agent 的 convertToLlm 过滤与映射逻辑',
              filePath: 'packages/coding-agent/src/core/messages.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/messages.ts',
              language: 'ts',
              code: `export function convertToLlm(messages: AgentMessage[]): Message[] {
  return messages
    .map((m): Message | undefined => {
      switch (m.role) {
        case "bashExecution":
          // !! 前缀命令仅给人类查看，绝不消耗 LLM Token
          if (m.excludeFromContext) return undefined;
          return { role: "user", content: [{ type: "text", text: bashExecutionToText(m) }], timestamp: m.timestamp };
        case "custom":
          return { role: "user", content: m.content, timestamp: m.timestamp };
        case "branchSummary":
          return { role: "user", content: [{ type: "text", text: BRANCH_SUMMARY_PREFIX + m.summary }], timestamp: m.timestamp };
        case "compactionSummary":
          return { role: "user", content: [{ type: "text", text: COMPACTION_SUMMARY_PREFIX + m.summary }], timestamp: m.timestamp };
        case "user":
        case "assistant":
        case "toolResult":
        case "system":
          return m;
      }
    })
    .filter((m): m is Message => m !== undefined);
}`,
              caption: '所有非标准 `AgentMessage` 都在这一关被显式分流：要么安全丢弃，要么规整为标准 `user` 消息。',
            },
            kpis: [
              { label: '输入类型', value: 'AgentMessage[]', status: 'neutral' },
              { label: '输出类型', value: '纯 Message[]', status: 'good' },
              { label: '!! 静默命令开销', value: '0 tokens', status: 'good' },
              { label: '未知 role 泄漏', value: '0 可能', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: '直通或映射进入 Message[]' },
              { color: '#b94a48', label: '丢弃过滤（不入 LLM）', dashed: true },
              { color: '#b56c27', label: 'convertToLlm 边检闸门' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'convertToLlm：精准分流标准消息、领域映射与静默丢弃',
              nodes: [
                {
                  id: 'in-std',
                  x: 175,
                  y: 120,
                  label: '标准 LLM 消息',
                  sublabel: 'user / assistant / toolResult',
                  icon: 'message',
                  tone: 'blue',
                  size: 'md',
                },
                {
                  id: 'in-map',
                  x: 175,
                  y: 285,
                  label: '领域可见消息',
                  sublabel: '!bash / custom / summary',
                  icon: 'file',
                  tone: 'violet',
                  size: 'md',
                },
                {
                  id: 'in-drop',
                  x: 175,
                  y: 450,
                  label: '!! 静默 Bash / UI 卡片',
                  sublabel: 'excludeFromContext: true',
                  icon: 'terminal',
                  tone: 'rose',
                  size: 'md',
                },
                {
                  id: 'gate-convert',
                  x: 500,
                  y: 285,
                  label: 'convertToLlm()',
                  sublabel: 'AgentMessage[] → Message[]',
                  icon: 'shield',
                  tone: 'orange',
                  size: 'lg',
                  active: true,
                  badge: '协议边检',
                },
                {
                  id: 'out-llm',
                  x: 825,
                  y: 185,
                  label: '标准 Message[]',
                  sublabel: '仅含合法 LLM 角色',
                  icon: 'check',
                  tone: 'green',
                  size: 'lg',
                  active: true,
                },
                {
                  id: 'out-trash',
                  x: 825,
                  y: 415,
                  label: '直接过滤丢弃',
                  sublabel: '0 Token · 仍保留在 TUI',
                  icon: 'box',
                  tone: 'neutral',
                  size: 'md',
                  dimmed: true,
                },
              ],
              edges: [
                { from: 'in-std', to: 'gate-convert', label: '原样', status: 'active', packetColor: '#3c6ea8' },
                { from: 'in-map', to: 'gate-convert', label: '转 user', status: 'active', packetColor: '#6f4ea3' },
                { from: 'in-drop', to: 'gate-convert', label: '拦截', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'gate-convert', to: 'out-llm', label: '放行 + 映射', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
                { from: 'gate-convert', to: 'out-trash', label: 'return undefined', status: 'error', dashed: true, packetColor: '#b94a48' },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: '双阶分工边界',
            badge: 'INSIGHT',
            title: '为什么拆成 transformContext 与 convertToLlm 两步？',
            paragraphs: [
              '初学者常问：既然都在发请求前跑，何不合并成一个 `prepareMessages` 回调？答案藏在 **职责分层与可扩展性** 里。`transformContext` 工作在富类型 `AgentMessage[]` 空间，扩展插件可以读取 `customType`、`excludeFromContext` 等领域字段决定裁剪策略，而完全不必重抄一遍 `coding-agent` 的协议翻译代码。',
              '反过来，`convertToLlm` 保持纯粹、确定、无副作用：不管前面有多少扩展介入了上下文裁剪，最后都统一由 `convertToLlm` 把关输出合法 `Message[]`，实现「策略可插拔，协议不失守」。',
            ],
            callout: {
              kind: 'idea',
              title: '两层漏斗效应',
              text: '第一层按 **业务价值** 瘦身（保留完整领域类型），第二层按 **协议合法性** 过滤（彻底剔除 `!!` 与 UI 噪音），两者组合把 72k 原始状态收敛到 47.2k 纯净载荷。',
            },
            diffs: [
              { kind: 'add', text: '扩展只需挂接 `transformContext`，无需了解底层 `Message` 映射细节' },
              { kind: 'change', text: '总上下文从 72,000 tok 逐级瘦身至 64,000 tok → 47,200 tok' },
            ],
            kpis: [
              { label: '阶段 0 原始状态', value: '72,000 tok', status: 'neutral' },
              { label: '阶段 1 业务裁剪后', value: '64,000 tok', status: 'warn' },
              { label: '阶段 2 协议过滤后', value: '47,200 tok', status: 'good' },
              { label: '净削减噪音', value: '-34.4%', status: 'good' },
            ],
            legend: [
              { color: '#3c6ea8', label: '核心对话与工具记录' },
              { color: '#6f4ea3', label: '映射入 LLM 的领域摘要' },
              { color: '#b94a48', label: '!! Bash / 纯 UI（阶段 2 剔除）' },
            ],
            scene: {
              kind: 'token-slices',
              title: '三阶漏斗：领域元数据如何逐级收敛为纯净 LLM 载荷',
              tracks: [
                {
                  id: 'f-0',
                  title: '0. 原始 context.messages（AgentMessage[]）',
                  totalBudget: 100000,
                  usedTokens: 72000,
                  segments: [
                    { id: 'f0-sys', label: 'Sys', tokens: 1200, tone: 'green', cached: true },
                    { id: 'f0-turns', label: '对话与工具', tokens: 42000, tone: 'blue' },
                    { id: 'f0-excl', label: '!! 静默 Bash', tokens: 12000, tone: 'rose', dropped: true },
                    { id: 'f0-ui', label: 'UI 卡片', tokens: 4800, tone: 'rose', dropped: true },
                    { id: 'f0-br', label: '分支摘要', tokens: 6000, tone: 'violet' },
                    { id: 'f0-ba', label: '!Bash', tokens: 6000, tone: 'orange' },
                  ],
                },
                {
                  id: 'f-1',
                  title: '1. 经 transformContext（按业务瘦身，保留领域类型）',
                  totalBudget: 100000,
                  usedTokens: 64000,
                  segments: [
                    { id: 'f1-sys', label: 'Sys', tokens: 1200, tone: 'green', cached: true },
                    { id: 'f1-turns', label: '精简后对话', tokens: 34000, tone: 'blue' },
                    { id: 'f1-excl', label: '!! 静默 Bash', tokens: 12000, tone: 'rose', dropped: true },
                    { id: 'f1-ui', label: 'UI 卡片', tokens: 4800, tone: 'rose', dropped: true },
                    { id: 'f1-br', label: '分支摘要', tokens: 6000, tone: 'violet' },
                    { id: 'f1-ba', label: '!Bash', tokens: 6000, tone: 'orange' },
                  ],
                },
                {
                  id: 'f-2',
                  title: '2. 经 convertToLlm（纯 Message[] · 送往 pi-ai）',
                  totalBudget: 100000,
                  usedTokens: 47200,
                  cacheHitEnd: 35200,
                  segments: [
                    { id: 'f2-sys', label: 'Sys', tokens: 1200, tone: 'green', cached: true },
                    { id: 'f2-turns', label: '精简后对话', tokens: 34000, tone: 'blue', cached: true },
                    { id: 'f2-br', label: 'user(摘要)', tokens: 6000, tone: 'violet' },
                    { id: 'f2-ba', label: 'user(!Bash)', tokens: 6000, tone: 'orange' },
                  ],
                },
              ],
              calloutBadges: [
                { label: '职责解耦', value: '裁剪 ≠ 翻译', tone: 'green' },
                { label: '剔除无效 Token', value: '24,800 tok', tone: 'blue' },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: 'normalizeContext',
            badge: 'TECHNIQUE',
            title: '第三关 normalizeContext：将系统提示与工具增量合入 TranscriptContext',
            paragraphs: [
              '拿到标准 `Message[]` 后，`streamAssistantResponse` 调用 `@earendil-works/pi-ai` 提供的 `normalizeContext({ messages })`，将其规整为统一的 `TranscriptContext`。',
              '这一步蕴含着现代 Pi 的一个关键架构升级：系统提示与工具声明不再只是游离在外的顶层可变字符串，而是作为一等公民 `SystemMessage`（包括循环中途由 `declareToolChanges` 追加的 `toolsAdded` / `toolsRemoved` 增量补丁）被编排进同一条时间线，确保跨供应商翻译与前缀缓存语义完全一致。',
            ],
            callout: {
              kind: 'tip',
              title: '为第 4 章埋下伏笔',
              text: '正是因为 `TranscriptContext` 支持在消息流中携带 `SystemMessage` 增量节点，Pi 才能在第 9 课展示的「Prompt Cache 稳定术」中做到 **只追加 Patch、绝不改头部前缀**。',
            },
            diffs: [
              { kind: 'add', text: '调用 `normalizeContext({ messages })` 生成规范化 `TranscriptContext`' },
              { kind: 'add', text: '时间线原生承载首部 `SystemMessage` 与中途 `toolsAdded/toolsRemoved` 增量补丁' },
              { kind: 'change', text: '消除不同厂商对系统消息位置与工具定义格式的差异' },
            ],
            sourceDrawer: {
              title: 'streamAssistantResponse 完整 5 步管线',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts',
              language: 'ts',
              code: `// packages/agent/src/agent-loop.ts (L395–425 核心管线)
let messages = context.messages;
if (config.transformContext) {
  messages = await config.transformContext(messages, signal);
}

// 1) 应用消息 → 标准 LLM 消息
const llmMessages = await config.convertToLlm(messages);

// 2) 规整为 pi-ai TranscriptContext（含 SystemMessage 与工具增量）
const llmContext = normalizeContext({ messages: llmMessages });

// 3) 动态解析当前 provider 密钥（支持 OAuth 自动续期）
const apiKey = (await config.getApiKey?.(config.model.provider)) || config.apiKey;

// 4) 统一经 streamFn（默认 Models.streamSimple）流式调用
const response = await streamFn(config.model, llmContext, { ...config, apiKey, signal });`,
              caption: '短短十几行代码串联起 Pi 整条消息管线：从领域状态一路平滑抵达任意 LLM 供应商。',
            },
            kpis: [
              { label: '输出对象', value: 'TranscriptContext', status: 'good' },
              { label: 'SystemMessage 形态', value: '前缀 + 增量 Patch', status: 'good' },
              { label: '工具声明承载', value: 'toolsAdded/Removed', status: 'good' },
              { label: '适配厂商数', value: '10+ Providers', status: 'neutral' },
            ],
            legend: [
              { color: '#4e7d34', label: '规范化 TranscriptContext 流' },
              { color: '#6f4ea3', label: 'SystemMessage 增量补丁' },
              { color: '#3c6ea8', label: '多厂商 Wire 序列化器' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'normalizeContext：把消息与 SystemMessage 统一打包为 TranscriptContext',
              nodes: [
                {
                  id: 'm-arr',
                  x: 165,
                  y: 175,
                  label: 'Message[]',
                  sublabel: 'convertToLlm 纯净输出',
                  icon: 'message',
                  tone: 'blue',
                  size: 'md',
                },
                {
                  id: 'sys-delta',
                  x: 165,
                  y: 385,
                  label: 'SystemMessage 补丁',
                  sublabel: 'toolsAdded / toolsRemoved',
                  icon: 'sparkles',
                  tone: 'violet',
                  size: 'md',
                },
                {
                  id: 'norm',
                  x: 475,
                  y: 280,
                  label: 'normalizeContext()',
                  sublabel: '@earendil-works/pi-ai',
                  icon: 'layers',
                  tone: 'green',
                  size: 'lg',
                  active: true,
                  badge: '规范化核心',
                },
                {
                  id: 'tc',
                  x: 815,
                  y: 280,
                  label: 'TranscriptContext',
                  sublabel: '时间线统一 · 厂商无关',
                  icon: 'code',
                  tone: 'dark',
                  size: 'lg',
                  active: true,
                  badge: '标准中间态',
                },
              ],
              edges: [
                { from: 'm-arr', to: 'norm', label: 'messages', status: 'active', packetColor: '#3c6ea8' },
                { from: 'sys-delta', to: 'norm', label: '增量声明', status: 'active', packetColor: '#6f4ea3' },
                { from: 'norm', to: 'tc', label: '校验 + 规整', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
              ],
              callouts: [
                { x: 500, y: 475, text: 'TranscriptContext 是 pi-ai 的通用 IR：屏蔽了所有厂商 API 的结构差异', tone: 'green' },
              ],
            },
          },

          // Step 7
          {
            stepNumber: 7,
            shortLabel: '动态鉴权与换模',
            badge: 'SOLUTION',
            title: '第四/五关 getApiKey + streamFn：长会话免重连与跨模型零损切换',
            paragraphs: [
              '在真正发出网络请求前，管线会先调用 `await config.getApiKey?.(provider) || config.apiKey`。为什么不在启动时写死一个静态字符串？因为 OpenAI Codex OAuth、Google Vertex ADC 或企业短期 STS 令牌会在长对话中途过期——每轮动态获取密钥意味着 **自动无感续期**。',
              '随后 `streamFn(model, llmContext, options)`（默认 `@earendil-works/pi-ai` 的 `Models.streamSimple`）把 `TranscriptContext` 实时编码为目标厂商请求。因为 `context.messages` 与 `TranscriptContext` 全程保持厂商中立，你可以用 `/model` 在对话中途从 Claude 切到 GPT、Gemini 或本地 `llama.cpp`，**完整继承全部对话、工具结果甚至思维上下文**。',
            ],
            callout: {
              kind: 'idea',
              title: '为什么 Pi 敢做跨厂商接力？',
              text: '遇到棘手架构问题用强推理模型分析 5 轮，切到高性价比模型写测试，再切到本地模型跑批量格式化——`pi-ai` 负责平滑翻译历史消息与工具调用格式，上层循环零感知。',
            },
            diffs: [
              { kind: 'add', text: '每轮调用前动态执行 `getApiKey(model.provider)`，原生支持 OAuth 令牌刷新' },
              { kind: 'add', text: '默认经 `Models.streamSimple` (`pi-ai`) 适配 10+ 云端与本地推理后端' },
              { kind: 'add', text: '支持对话中途 `/model` 跨供应商热切换且不丢失任何历史 Turn' },
            ],
            kpis: [
              { label: '密钥刷新时机', value: '每轮动态解析', status: 'good' },
              { label: '中途换模成本', value: '0 历史丢失', status: 'good' },
              { label: '默认流式引擎', value: 'Models.streamSimple', status: 'neutral' },
              { label: '自定义 streamFn', value: '支持 Proxy/Mock', status: 'good' },
            ],
            legend: [
              { color: '#b56c27', label: '动态鉴权 / OAuth 续期' },
              { color: '#3c6ea8', label: 'pi-ai 多厂商分发' },
              { color: '#4e7d34', label: '统一 AssistantMessage 回流' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'getApiKey + streamFn：动态续期与跨供应商无损切换',
              nodes: [
                {
                  id: 'ctx-in',
                  x: 165,
                  y: 220,
                  label: 'TranscriptContext',
                  sublabel: '厂商无关标准上下文',
                  icon: 'layers',
                  tone: 'green',
                  size: 'md',
                },
                {
                  id: 'auth',
                  x: 165,
                  y: 410,
                  label: 'getApiKey(provider)',
                  sublabel: 'OAuth / STS 动态续期',
                  icon: 'shield',
                  tone: 'orange',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'stream-fn',
                  x: 490,
                  y: 280,
                  label: 'streamFn (pi-ai)',
                  sublabel: '默认 Models.streamSimple',
                  icon: 'zap',
                  tone: 'dark',
                  size: 'lg',
                  active: true,
                  badge: '跨模适配',
                },
                {
                  id: 'p-anth',
                  x: 825,
                  y: 120,
                  label: 'Anthropic Messages',
                  sublabel: 'Claude Opus / Sonnet',
                  icon: 'brain',
                  tone: 'violet',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 'p-oai',
                  x: 825,
                  y: 285,
                  label: 'OpenAI / Codex OAuth',
                  sublabel: 'Responses / Completions',
                  icon: 'cpu',
                  tone: 'blue',
                  size: 'sm',
                },
                {
                  id: 'p-local',
                  x: 825,
                  y: 450,
                  label: 'Google / 本地 llama.cpp',
                  sublabel: 'GenAI / Vertex / Local',
                  icon: 'plug',
                  tone: 'green',
                  size: 'sm',
                },
              ],
              edges: [
                { from: 'ctx-in', to: 'stream-fn', label: 'llmContext', status: 'active', packetColor: '#4e7d34' },
                { from: 'auth', to: 'stream-fn', label: 'fresh apiKey', status: 'active', packetColor: '#b56c27' },
                { from: 'stream-fn', to: 'p-anth', label: 'Turn 1..5', status: 'active', packetColor: '#6f4ea3' },
                { from: 'stream-fn', to: 'p-oai', label: '/model 热切', status: 'active', packetColor: '#3c6ea8', dashed: true },
                { from: 'stream-fn', to: 'p-local', label: '离线推理', status: 'normal', packetColor: '#4e7d34', dashed: true },
              ],
            },
          },

          // Step 8
          {
            stepNumber: 8,
            shortLabel: '管线决策复盘',
            badge: 'RECAP',
            title: '复盘：5 级消息管线的分层哲学',
            paragraphs: [
              '回头俯瞰整条链路：`AgentMessage[]` 负责承载真实应用的全部状态，`transformContext` 做非破坏性业务治理，`convertToLlm` 守住纯 `Message[]` 协议边界，`normalizeContext` 打包包含 `SystemMessage` 增量的 `TranscriptContext`，最后由 `getApiKey + streamFn` 完成动态鉴权与多厂商推理。',
              '每一级只解决一个正交问题、只暴露一个极简函数签名。这正是 `pi-agent-core` 用区区两千多行代码支撑起整个 Coding Agent 与 OpenClaw 生态的底层秘诀。',
            ],
            callout: {
              kind: 'idea',
              title: '下一课预告',
              text: '消息已经流向 LLM 并开始返回增量 Token——那么 Loop 如何把实时进展广播给 TUI、RPC、SDK 而不与任何界面耦合？下一课拆解精确的 10 种 `AgentEvent`！',
            },
            recapTable: [
              {
                question: '内核如何支持 Bash、分支摘要等非标准消息？',
                decision: '采用 `AgentMessage[]` + `CustomAgentMessages` 声明合并',
                because: '内核零业务依赖，同时上层扩展获得端到端 TypeScript 类型安全。',
              },
              {
                question: '为何要把 `transformContext` 与 `convertToLlm` 拆成两关？',
                decision: '前者在 `AgentMessage[]` 层做非破坏性裁剪，后者专司协议翻译与过滤',
                because: '扩展插件可自由裁剪或注入上下文，而无需重复实现 `!!` 过滤与消息映射。',
              },
              {
                question: '如何既能动态变更系统提示/工具，又不破坏厂商适配？',
                decision: '经 `normalizeContext` 统一生成携带 `SystemMessage` 增量的 `TranscriptContext`',
                because: '让前缀缓存增量补丁成为跨供应商的统一中间表示（IR）。',
              },
              {
                question: '如何支持长会话 OAuth 续期与中途换模型？',
                decision: '每轮调用前动态 `getApiKey(provider)` + `pi-ai` `streamFn`',
                because: '令牌自动刷新不断连，且跨厂商切换模型不丢失历史上下文。',
              },
            ],
            kpis: [
              { label: '管线总阶段', value: '5 级解耦', status: 'good' },
              { label: '原历史修改次数', value: '0 次 (纯投影)', status: 'good' },
              { label: '跨厂商兼容', value: 'pi-ai 统一封装', status: 'good' },
              { label: '扩展插槽', value: '类型+裁剪+流式', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: '领域态 (AgentMessage[])' },
              { color: '#b56c27', label: '协议变换关口' },
              { color: '#4e7d34', label: '标准态与多厂商输出' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '全景图：从 AgentMessage[] 到多厂商 LLM 的 5 级管线',
              nodes: [
                {
                  id: 'r-1',
                  x: 155,
                  y: 175,
                  label: '1. AgentMessage[]',
                  sublabel: '含 4 类 Custom 扩展',
                  icon: 'database',
                  tone: 'violet',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 'r-2',
                  x: 425,
                  y: 175,
                  label: '2. transformContext',
                  sublabel: '非破坏裁剪 / 注入',
                  icon: 'sparkles',
                  tone: 'violet',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 'r-3',
                  x: 700,
                  y: 175,
                  label: '3. convertToLlm',
                  sublabel: '滤除 !! / 转 Message[]',
                  icon: 'shield',
                  tone: 'orange',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 'r-4',
                  x: 700,
                  y: 400,
                  label: '4. normalizeContext',
                  sublabel: 'TranscriptContext + ΔSys',
                  icon: 'layers',
                  tone: 'green',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'r-5',
                  x: 310,
                  y: 400,
                  label: '5. getApiKey + streamFn',
                  sublabel: 'pi-ai 跨模型流式调用',
                  icon: 'zap',
                  tone: 'dark',
                  size: 'lg',
                  active: true,
                  badge: '多厂商零损切换',
                },
              ],
              edges: [
                { from: 'r-1', to: 'r-2', label: '投影', status: 'active', packetColor: '#6f4ea3' },
                { from: 'r-2', to: 'r-3', label: '边检', status: 'active', packetColor: '#b56c27' },
                { from: 'r-3', to: 'r-4', label: 'Message[]', status: 'active', packetColor: '#4e7d34' },
                { from: 'r-4', to: 'r-5', label: 'TranscriptContext', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
              ],
            },
          },
        ],
      },

      // ----------------------------------------------------------------------
      // Lesson 7 (ch03-l02): 10 种 AgentEvent 与流式解耦
      // ----------------------------------------------------------------------
      {
        id: 'ch03-l02',
        slug: 'agent-events',
        chapterId: 'ch03',
        chapterNumber: 3,
        chapterTitle: '消息管线与事件流',
        lessonIndexInChapter: 2,
        totalInChapter: 2,
        title: '10 种 AgentEvent 与流式解耦',
        subtitle:
          '解剖 4 层生命周期事件、assistantMessageEvent 细粒度增量、多端复用 EventStream 与 waitForIdle 终态结算保证',
        durationMin: 9,
        level: '核心',
        objectives: [
          {
            id: 'obj-ae-1',
            text: '理解事件流解耦为何能让同一套 `pi-agent-core` 零修改驱动 TUI、RPC、JSON 与 SDK 四种运行模式',
            completedAtStep: 2,
          },
          {
            id: 'obj-ae-2',
            text: '熟记 Agent、Turn、Message、Tool 四个层级精确的 10 种 `AgentEvent` 事件名与嵌套配对关系',
            completedAtStep: 3,
          },
          {
            id: 'obj-ae-3',
            text: '区分 `message_update` 中的 `assistantMessageEvent` 增量与 `tool_execution_update` 的工具流式局部结果',
            completedAtStep: 5,
          },
          {
            id: 'obj-ae-4',
            text: '看懂 `pi-tui` 差分渲染、RPC 管道与 OpenClaw SDK 如何订阅同一条 `EventStream`',
            completedAtStep: 6,
          },
          {
            id: 'obj-ae-5',
            text: '掌握 `waitForIdle()` 的 awaited listener 结算保证，避免在 `agent_end` 落盘前提前退出',
            completedAtStep: 7,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: '紧耦合 UI 噩梦',
            badge: 'PROBLEM',
            title: '把终端打印写死在 Agent Loop 里会发生什么？',
            paragraphs: [
              '很多命令行 Agent 的实现方式非常直白：在 `while` 循环里一边调 LLM、一边直接 `process.stdout.write(chunk)`、顺手更新终端 Spinner 并把日志 append 到文件。前三天写起来很爽，到了第四天噩梦就开始了。',
              '当你想为 IDE 插件增加无头 **RPC 模式**、为 CI 流水线输出 **JSON 流**、或是像 OpenClaw 那样把它作为嵌入式引擎接入多渠道聊天机器人时，循环体里布满 `if (mode === "tui") ... else if (mode === "rpc") ...`，测试难以断言，任何新前端都得重写半个主循环。',
            ],
            callout: {
              kind: 'warn',
              title: '控制流与展示层死锁',
              text: 'Agent Loop 的职责是推进状态机，而不是画界面或管理标准输出。两者耦合得越紧，生态复用的边际成本就越高。',
            },
            diffs: [
              { kind: 'remove', text: '循环体内直接操作 ANSI 终端、JSON stdout 与磁盘落盘导致逻辑纠缠' },
              { kind: 'remove', text: '无法在不 fork 内核的情况下嵌入 IDE、Web 或聊天机器人壳层' },
            ],
            kpis: [
              { label: '循环分支污染', value: 'if(mode) 遍地', status: 'bad' },
              { label: '无头复用难度', value: '需拆改内核', status: 'bad' },
              { label: '并发渲染安全', value: '容易竞态闪烁', status: 'bad' },
              { label: '测试可观测性', value: '极低', status: 'warn' },
            ],
            legend: [
              { color: '#b94a48', label: '紧耦合硬编码调用', dashed: true },
              { color: '#b56c27', label: '被渲染层拖累的 Loop 核心' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '反模式：Agent Loop 直接驱动 UI、日志与磁盘',
              nodes: [
                {
                  id: 'tangled-loop',
                  x: 240,
                  y: 280,
                  label: '紧耦合 runLoop()',
                  sublabel: '混杂 ANSI / JSON / I/O 分支',
                  icon: 'loop',
                  tone: 'rose',
                  size: 'lg',
                  active: true,
                  badge: '职责失控',
                  meter: { value: 92, label: '耦合债', status: 'bad' },
                },
                {
                  id: 's-ansi',
                  x: 740,
                  y: 120,
                  label: 'stdout ANSI 终端',
                  sublabel: 'console.write 硬编码',
                  icon: 'terminal',
                  tone: 'neutral',
                  size: 'sm',
                },
                {
                  id: 's-json',
                  x: 740,
                  y: 280,
                  label: 'CI / RPC 管道',
                  sublabel: '需新增大量 if/else',
                  icon: 'code',
                  tone: 'neutral',
                  size: 'sm',
                },
                {
                  id: 's-disk',
                  x: 740,
                  y: 440,
                  label: 'Session 落盘 & 扩展',
                  sublabel: '同步阻塞主循环',
                  icon: 'database',
                  tone: 'neutral',
                  size: 'sm',
                },
              ],
              edges: [
                { from: 'tangled-loop', to: 's-ansi', label: '直写转义码', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'tangled-loop', to: 's-json', label: '分支冲突', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'tangled-loop', to: 's-disk', label: '强绑定落盘', status: 'error', dashed: true, packetColor: '#b94a48' },
              ],
              callouts: [
                { x: 495, y: 495, text: '每增加一个前端载体，就必须侵入式修改一次核心循环', tone: 'rose' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: 'EventStream 解耦',
            badge: 'SOLUTION',
            title: '纯事件驱动：Loop 只吐事实，一切渲染靠订阅',
            paragraphs: [
              'Pi 的解法干净彻底：`agentLoop()` 与 `agentLoopContinue()` 不接收任何 UI 句柄，只返回一个标准的异步可迭代对象 `EventStream<AgentEvent, AgentMessage[]>`。循环内部只做一件事——在每个关键状态跃迁点调用 `stream.push(event)` 广播不可变事实。',
              '外层的有状态封装 `Agent`（`packages/agent/src/agent.ts`）消费这条流，并通过 `agent.subscribe(listener)` 扇出给任意数量的订阅者。内核根本不知道对面坐着的是人类终端、IDE 的 RPC 进程，还是自动化单元测试。',
            ],
            callout: {
              kind: 'idea',
              title: '单向数据流的终极红利',
              text: '只要定义好精确、正交的事件契约，底层引擎就可以作为 **无头运行时（Headless Harness）** 被无限复用。',
            },
            diffs: [
              { kind: 'add', text: '`agentLoop()` 返回纯 `EventStream<AgentEvent, AgentMessage[]>`，彻底剥离 UI 依赖' },
              { kind: 'add', text: '`Agent.subscribe(listener)` 提供统一的异步事件订阅总线' },
              { kind: 'remove', text: '核心循环中零终端控制码、零模式判断分支' },
            ],
            kpis: [
              { label: '核心 UI 依赖', value: '0 行', status: 'good' },
              { label: '标准事件契约', value: '精确 10 种', status: 'good' },
              { label: '支持运行模式', value: 'TUI/RPC/JSON/SDK', status: 'good' },
              { label: '流终态返回值', value: 'AgentMessage[]', status: 'neutral' },
            ],
            legend: [
              { color: '#4e7d34', label: '纯事件事实流 (AgentEvent)' },
              { color: '#6f4ea3', label: 'Agent.subscribe() 扇出总线' },
              { color: '#3c6ea8', label: '彼此独立的下游消费者' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'EventStream 架构：一源多端、彻底解耦',
              nodes: [
                {
                  id: 'ev-loop',
                  x: 165,
                  y: 280,
                  label: 'runLoop()',
                  sublabel: '只管状态机与 push(event)',
                  icon: 'loop',
                  tone: 'green',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'ev-stream',
                  x: 425,
                  y: 280,
                  label: 'EventStream',
                  sublabel: 'AgentEvent 异步流',
                  icon: 'zap',
                  tone: 'violet',
                  size: 'md',
                  active: true,
                  badge: '10 种事件',
                },
                {
                  id: 'ev-sub',
                  x: 660,
                  y: 280,
                  label: 'Agent.subscribe()',
                  sublabel: '有序异步广播',
                  icon: 'layers',
                  tone: 'dark',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 'c-tui',
                  x: 855,
                  y: 120,
                  label: 'pi-tui 终端',
                  sublabel: '差分渲染',
                  icon: 'terminal',
                  tone: 'blue',
                  size: 'sm',
                },
                {
                  id: 'c-rpc',
                  x: 855,
                  y: 280,
                  label: 'RPC / JSON',
                  sublabel: '无头流协议',
                  icon: 'code',
                  tone: 'blue',
                  size: 'sm',
                },
                {
                  id: 'c-sdk',
                  x: 855,
                  y: 440,
                  label: 'TS SDK / 落盘',
                  sublabel: 'Session & 扩展',
                  icon: 'package',
                  tone: 'orange',
                  size: 'sm',
                },
              ],
              edges: [
                { from: 'ev-loop', to: 'ev-stream', label: 'push', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
                { from: 'ev-stream', to: 'ev-sub', label: 'for await', status: 'active', packetColor: '#6f4ea3' },
                { from: 'ev-sub', to: 'c-tui', status: 'active', packetColor: '#3c6ea8' },
                { from: 'ev-sub', to: 'c-rpc', status: 'active', packetColor: '#3c6ea8' },
                { from: 'ev-sub', to: 'c-sdk', status: 'active', packetColor: '#b56c27' },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: '10 种事件全景',
            badge: 'TECHNIQUE',
            title: '四层严格嵌套：精确的 10 种 AgentEvent 全景图',
            paragraphs: [
              '打开 `packages/agent/src/types.ts`（L533–556），整个 `pi-agent-core` 的生命周期被高度提炼为 **精确 10 种 `AgentEvent`**，分属 4 个严格嵌套的作用域：Agent 级（2）、Turn 级（2）、Message 级（3）与 Tool 级（3）。',
              '留意其中的对称美学：Agent（`agent_start`/`agent_end`）和 Turn（`turn_start`/`turn_end`）都是纯净的起止括号；而需要实时流式反馈的 Message 与 Tool 层，各自额外多出一个中间态脉冲事件——`message_update` 与 `tool_execution_update`。',
            ],
            callout: {
              kind: 'tip',
              title: '2 + 2 + 3 + 3 = 10',
              text: '任何单轮带工具调用的执行，事件序列永远满足严格括号嵌套：`agent_start` ⊃ `turn_start` ⊃ (`message_*` + `tool_execution_*`) ⊃ `turn_end` ⊃ `agent_end`。',
            },
            diffs: [
              { kind: 'add', text: 'Agent 级：`agent_start`、`agent_end { messages }`' },
              { kind: 'add', text: 'Turn 级：`turn_start`、`turn_end { message, toolResults }`' },
              { kind: 'add', text: 'Message / Tool 级：各自提供 `start` → `update*` → `end` 三段式流式脉冲' },
            ],
            sourceDrawer: {
              title: '精确 10 种 AgentEvent 联合类型定义',
              filePath: 'packages/agent/src/types.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/agent/src/types.ts',
              language: 'ts',
              code: `export type AgentEvent =
  // 1. Agent 级（整次 prompt/continue 运行）
  | { type: "agent_start" }
  | { type: "agent_end"; messages: AgentMessage[] }
  // 2. Turn 级（一次 LLM 响应 + 其全部工具调用）
  | { type: "turn_start" }
  | { type: "turn_end"; message: AgentMessage; toolResults: ToolResultMessage[] }
  // 3. Message 级（user/assistant/toolResult，仅 assistant 发 update）
  | { type: "message_start"; message: AgentMessage }
  | { type: "message_update"; message: AgentMessage; assistantMessageEvent: AssistantMessageEvent }
  | { type: "message_end"; message: AgentMessage }
  // 4. Tool 级（单次工具执行与流式局部输出）
  | { type: "tool_execution_start"; toolCallId: string; toolName: string; args: any }
  | { type: "tool_execution_update"; toolCallId: string; toolName: string; args: any; partialResult: any }
  | { type: "tool_execution_end"; toolCallId: string; toolName: string; result: any; isError: boolean; durationMs?: number };`,
              caption: '零冗余事件名：每一类载荷都精准携带渲染、遥测与持久化所需的最小充分字段。',
            },
            kpis: [
              { label: 'Agent / Turn 级', value: '2 + 2 = 4 种', status: 'neutral' },
              { label: 'Message / Tool 级', value: '3 + 3 = 6 种', status: 'good' },
              { label: '事件契约总数', value: '精确 10 种', status: 'good' },
              { label: '嵌套语义', value: '严格括号配对', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: 'Agent 级作用域' },
              { color: '#3c6ea8', label: 'Turn 级作用域' },
              { color: '#4e7d34', label: 'Message 级流式窗口' },
              { color: '#b56c27', label: 'Tool 级执行窗口' },
            ],
            scene: {
              kind: 'swimlane',
              title: '4 层嵌套泳道：单轮执行中的 10 种 AgentEvent 时序全景',
              phaseBands: [
                { start: 15, end: 50, label: 'LLM 流式生成', tone: 'green' },
                { start: 53, end: 89, label: '工具执行与回填', tone: 'orange' },
              ],
              lanes: [
                { id: 'l-agent', label: 'Agent 级 (2)', sublabel: '整次 Run', tone: 'violet' },
                { id: 'l-turn', label: 'Turn 级 (2)', sublabel: '单轮循环', tone: 'blue' },
                { id: 'l-msg', label: 'Message 级 (3)', sublabel: '流式消息', tone: 'green' },
                { id: 'l-tool', label: 'Tool 级 (3)', sublabel: '工具调用', tone: 'orange' },
              ],
              ticks: [
                { pos: 4, label: 't0 启动' },
                { pos: 26, label: 't1 流式增量' },
                { pos: 50, label: 't2 消息收束' },
                { pos: 72, label: 't3 工具运行' },
                { pos: 96, label: 't4 运行结算' },
              ],
              bars: [
                { id: 'b-agent', laneId: 'l-agent', start: 4, end: 98, label: 'Agent Run 生命周期', tone: 'violet', status: 'running' },
                { id: 'b-turn', laneId: 'l-turn', start: 10, end: 93, label: 'Turn #1 生命周期', tone: 'blue', status: 'running' },
                { id: 'b-msg', laneId: 'l-msg', start: 16, end: 48, label: 'Assistant 流式输出', tone: 'green', status: 'done' },
                { id: 'b-tool', laneId: 'l-tool', start: 54, end: 87, label: 'Tool 执行流', tone: 'orange', status: 'done' },
              ],
              events: [
                { id: 'e-as', laneId: 'l-agent', pos: 4, label: 'agent_start', tone: 'violet', emphasized: true },
                { id: 'e-ae', laneId: 'l-agent', pos: 98, label: 'agent_end', tone: 'violet', emphasized: true },
                { id: 'e-ts', laneId: 'l-turn', pos: 10, label: 'turn_start', tone: 'blue', emphasized: true },
                { id: 'e-te', laneId: 'l-turn', pos: 93, label: 'turn_end', tone: 'blue', emphasized: true },
                { id: 'e-ms', laneId: 'l-msg', pos: 16, label: 'message_start', tone: 'green' },
                { id: 'e-mu', laneId: 'l-msg', pos: 33, label: 'message_update*', tone: 'green', emphasized: true },
                { id: 'e-me', laneId: 'l-msg', pos: 48, label: 'message_end', tone: 'green' },
                { id: 'e-xs', laneId: 'l-tool', pos: 54, label: 'tool_execution_start', tone: 'orange' },
                { id: 'e-xu', laneId: 'l-tool', pos: 71, label: 'tool_execution_update*', tone: 'orange', emphasized: true },
                { id: 'e-xe', laneId: 'l-tool', pos: 87, label: 'tool_execution_end', tone: 'orange' },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: '流式增量 Delta',
            badge: 'TECHNIQUE',
            title: '细粒度 message_update：同时携带 Delta 与最新快照',
            paragraphs: [
              '并不是所有消息都会触发 `message_update`：`user` 与 `toolResult` 消息是瞬时提交的，只发 `message_start` 和 `message_end`；只有流式生成的 `AssistantMessage` 才会高频推送 `message_update`。',
              '精妙的是，每条 `message_update` 既携带来自 `pi-ai` 的细粒度 `assistantMessageEvent`（`start`、`thinking_*`、`text_*`、`toolcall_*`、`done`/`error`），又同时附带 **已累积好的局部 `message` 快照**。这意味着前端既能直接追加字符增量，也能声明式直接重绘最新对象，绝不需要自己手拼残缺的 JSON 参数！',
            ],
            callout: {
              kind: 'idea',
              title: '快照 + Delta 双轨设计',
              text: '增量（Delta）适合 RPC 转发与日志打字机效果；局部快照（Partial `message`）让声明式 UI 组件一行代码即可渲染思考折叠块与进行中的工具参数。',
            },
            diffs: [
              { kind: 'add', text: '`assistantMessageEvent` 完整覆盖 `thinking_*`、`text_*`、`toolcall_*` 三类内容块' },
              { kind: 'add', text: '同步附带累积后的 `message` 快照，免去前端手工解析半截 JSON 的负担' },
            ],
            sourceDrawer: {
              title: 'message_update 实时事件 JSON 载荷示例',
              filePath: 'packages/agent/src/types.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/agent/src/types.ts',
              language: 'json',
              code: `{
  "type": "message_update",
  "assistantMessageEvent": {
    "type": "toolcall_delta",
    "contentIndex": 2,
    "delta": "{\\"path\\": \\"src/agent-loop.ts\\"}"
  },
  "message": {
    "role": "assistant",
    "content": [
      { "type": "thinking", "thinking": "先读取 agent-loop.ts 确认并发策略..." },
      { "type": "text", "text": "我来检查一下工具编排逻辑。" },
      { "type": "toolCall", "id": "call_01", "name": "read", "arguments": { "path": "src/agent-loop.ts" } }
    ]
  }
}`,
              caption: '前端可直接消费 `delta` 做流式推送，也可直接用 `message.content` 声明式渲染完整局部状态。',
            },
            kpis: [
              { label: '触发消息类型', value: '仅 Assistant', status: 'neutral' },
              { label: '内容块维度', value: 'thinking / text / toolcall', status: 'good' },
              { label: '前端 JSON 拼接', value: '0 手写解析', status: 'good' },
              { label: '首字延迟感知', value: 'Token 级实时', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: 'thinking_* 思维增量' },
              { color: '#3c6ea8', label: 'text_* 文本增量' },
              { color: '#b56c27', label: 'toolcall_* 工具调用增量' },
            ],
            scene: {
              kind: 'swimlane',
              title: '单条 AssistantMessage 内部的 assistantMessageEvent 流式拆解',
              phaseBands: [
                { start: 8, end: 36, label: '思考阶段', tone: 'violet' },
                { start: 38, end: 64, label: '正文输出', tone: 'blue' },
                { start: 66, end: 94, label: '工具参数生成', tone: 'orange' },
              ],
              lanes: [
                { id: 'am-ctrl', label: '流控制', sublabel: 'start / done', tone: 'green' },
                { id: 'am-think', label: 'thinking_*', sublabel: '推理过程', tone: 'violet' },
                { id: 'am-text', label: 'text_*', sublabel: '回复文本', tone: 'blue' },
                { id: 'am-tool', label: 'toolcall_*', sublabel: '工具参数流', tone: 'orange' },
              ],
              ticks: [
                { pos: 5, label: '0ms' },
                { pos: 35, label: '240ms' },
                { pos: 65, label: '520ms' },
                { pos: 95, label: '780ms' },
              ],
              bars: [
                { id: 'ab-0', laneId: 'am-ctrl', start: 5, end: 95, label: 'message_update 持续推送', tone: 'green', status: 'running' },
                { id: 'ab-1', laneId: 'am-think', start: 10, end: 35, label: 'thinking_delta × 18', tone: 'violet', status: 'done' },
                { id: 'ab-2', laneId: 'am-text', start: 39, end: 63, label: 'text_delta × 24', tone: 'blue', status: 'done' },
                { id: 'ab-3', laneId: 'am-tool', start: 67, end: 92, label: 'toolcall_delta × 11', tone: 'orange', status: 'done' },
              ],
              events: [
                { id: 'ae-1', laneId: 'am-ctrl', pos: 5, label: 'start', tone: 'green', emphasized: true },
                { id: 'ae-2', laneId: 'am-think', pos: 22, label: 'thinking_delta', tone: 'violet' },
                { id: 'ae-3', laneId: 'am-text', pos: 51, label: 'text_delta', tone: 'blue' },
                { id: 'ae-4', laneId: 'am-tool', pos: 79, label: 'toolcall_delta', tone: 'orange' },
                { id: 'ae-5', laneId: 'am-ctrl', pos: 95, label: 'done', tone: 'green', emphasized: true },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: '工具流式进度',
            badge: 'TECHNIQUE',
            title: 'tool_execution_update：长耗时工具实时回显与结算后防抖',
            paragraphs: [
              '跑 `npm test` 或编译大型 Rust 项目往往耗时十几秒。如果工具不提供中间进度，用户面对凝固的光标完全不知道该继续等待、按 `Enter` 发送 Steering 纠偏，还是立刻按 `Ctrl+C` 中断。',
              'Pi 在调用 `tool.execute(id, args, signal, onUpdate)` 时注入回调 `onUpdate(partialResult)`，每次触发都发射 `tool_execution_update`。更严谨的是源码里的 **后结算守卫（post-settle guard）**：一旦 `execute` 返回或抛错，Pi 会彻底忽略任何晚到的异步 `onUpdate`，保证绝不会在 `tool_execution_end` 之后冒出幽灵更新！',
            ],
            callout: {
              kind: 'warn',
              title: '细节见真章：忽略晚到 onUpdate',
              text: '子进程关闭瞬间偶尔仍会吐出最后一口缓冲 `stdout`。Pi 用已结算标志位直接吞掉晚到回调，确保事件序永远满足 `start → update* → end` 不变量。',
            },
            diffs: [
              { kind: 'add', text: '`tool.execute` 通过 `onUpdate(partialResult)` 实时流式上报局部输出' },
              { kind: 'add', text: '`tool_execution_end` 附带单调时钟测量的 `durationMs` 与 `isError`' },
              { kind: 'add', text: '工具结算后自动屏蔽晚到的异步 `onUpdate`，杜绝乱序事件' },
            ],
            kpis: [
              { label: '长任务可见性', value: '逐块流式回显', status: 'good' },
              { label: '耗时度量', value: '单调 durationMs', status: 'good' },
              { label: '结算后幽灵更新', value: '严格屏蔽', status: 'good' },
              { label: '用户可控性', value: '随时 Steer/Abort', status: 'good' },
            ],
            legend: [
              { color: '#b56c27', label: '工具执行与流式 stdout' },
              { color: '#4e7d34', label: '实时广播至终端 UI' },
              { color: '#b94a48', label: '结算后晚到回调（已拦截）' },
            ],
            scene: {
              kind: 'swimlane',
              title: 'bash 工具流式推送与 post-settle 防晚到守卫',
              phaseBands: [
                { start: 10, end: 74, label: '活跃执行期（允许 onUpdate）', tone: 'orange' },
                { start: 75, end: 98, label: '已结算（屏蔽晚到）', tone: 'neutral' },
              ],
              lanes: [
                { id: 'tu-bash', label: 'bash 工具', sublabel: 'npm test', tone: 'orange' },
                { id: 'tu-bus', label: 'EventStream', sublabel: '事件校验闸', tone: 'violet' },
                { id: 'tu-tui', label: 'pi-tui 界面', sublabel: '局部折叠预览', tone: 'green' },
              ],
              ticks: [
                { pos: 10, label: '0s' },
                { pos: 35, label: '1.4s' },
                { pos: 60, label: '3.1s' },
                { pos: 75, label: '4.28s' },
                { pos: 92, label: '4.35s' },
              ],
              bars: [
                { id: 'tb-1', laneId: 'tu-bash', start: 10, end: 74, label: 'execute() 运行中', tone: 'orange', status: 'running' },
                { id: 'tb-late', laneId: 'tu-bash', start: 84, end: 95, label: '晚到 stdout', tone: 'rose', status: 'blocked' },
                { id: 'tb-tui1', laneId: 'tu-tui', start: 14, end: 76, label: '实时滚动输出预览', tone: 'green', status: 'done' },
              ],
              events: [
                { id: 'te-1', laneId: 'tu-bus', pos: 10, label: 'tool_execution_start', tone: 'orange' },
                { id: 'te-2', laneId: 'tu-bus', pos: 32, label: 'update #1', tone: 'violet' },
                { id: 'te-3', laneId: 'tu-bus', pos: 54, label: 'update #2', tone: 'violet' },
                { id: 'te-4', laneId: 'tu-bus', pos: 74, label: 'end (4280ms)', tone: 'green', emphasized: true },
                { id: 'te-5', laneId: 'tu-bus', pos: 90, label: '忽略晚到 update', tone: 'rose' },
              ],
              connectors: [
                { fromPos: 32, fromLaneId: 'tu-bash', toPos: 32, toLaneId: 'tu-tui', label: 'onUpdate' },
                { fromPos: 54, fromLaneId: 'tu-bash', toPos: 54, toLaneId: 'tu-tui', label: 'onUpdate' },
                { fromPos: 88, fromLaneId: 'tu-bash', toPos: 90, toLaneId: 'tu-bus', label: '丢弃', dashed: true },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: '多端订阅复用',
            badge: 'SOLUTION',
            title: '一条 EventStream，驱动 TUI、RPC、JSON 与 OpenClaw',
            paragraphs: [
              '凭借这 10 种事件契约，`pi-coding-agent` 在同一套 `pi-agent-core` 之上零成本长出了 4 种截然不同的产品形态：面向开发者的 **Interactive TUI**（基于零依赖 `@earendil-works/pi-tui` 保留模式差分渲染 + CSI 2026 同步输出防闪烁）、面向 IDE/前端的 **RPC 模式**、面向 CI/脚本的 **JSON / Print 模式**，以及面向二次开发的 **TypeScript SDK**。',
              '这也正是 **OpenClaw**（Peter Steinberger 打造的跨渠道助手壳层，官方 `README.md` 明确列为旗舰集成）能够直接复用 `pi-ai` 与 `pi-agent-core` 作为无头底座的原因：只需写一个订阅器，就能把同样的 10 种事件桥接到任意消息平台。',
            ],
            callout: {
              kind: 'idea',
              title: '零闪烁终端的秘密',
              text: '`@earendil-works/pi-tui` 订阅 `message_update` 与 `tool_execution_update` 后，只重算发生变化的屏幕行并用 CSI 2026 同步帧一次性刷屏，高频流式输出依然如纸面般稳定。',
            },
            diffs: [
              { kind: 'add', text: 'Interactive TUI：订阅事件驱动 `pi-tui` 差分渲染与内联图片展示' },
              { kind: 'add', text: 'RPC / JSON 模式：直接把 `AgentEvent` 序列化为逐行 NDJSON 输出' },
              { kind: 'add', text: 'TypeScript SDK & OpenClaw：进程内直接挂载 `agent.subscribe()` 桥接多端' },
            ],
            kpis: [
              { label: '复用内核份数', value: '仅 1 套核心', status: 'good' },
              { label: '支持消费端形态', value: '4 种官方模式', status: 'good' },
              { label: 'pi-tui 内部依赖', value: '0 依赖 (Leaf)', status: 'good' },
              { label: '生态旗舰案例', value: 'OpenClaw 引擎', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: '单一 EventStream 事实源' },
              { color: '#4e7d34', label: '交互式 TUI 消费端' },
              { color: '#3c6ea8', label: '无头 RPC / JSON / SDK 消费端' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '一核多壳：四种运行模式共享同一套 10 事件订阅总线',
              nodes: [
                {
                  id: 'm-core',
                  x: 155,
                  y: 280,
                  label: 'pi-agent-core',
                  sublabel: 'EventStream<AgentEvent>',
                  icon: 'loop',
                  tone: 'violet',
                  size: 'md',
                  active: true,
                  badge: '唯一核心',
                },
                {
                  id: 'm-bus',
                  x: 410,
                  y: 280,
                  label: 'subscribe() 分发器',
                  sublabel: '10 种标准事件广播',
                  icon: 'zap',
                  tone: 'dark',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'm-tui',
                  x: 650,
                  y: 155,
                  label: 'Interactive TUI',
                  sublabel: 'pi-tui 差分 + CSI 2026',
                  icon: 'terminal',
                  tone: 'green',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 'm-rpc',
                  x: 865,
                  y: 155,
                  label: 'RPC 模式',
                  sublabel: 'NDJSON 供 IDE / Web',
                  icon: 'plug',
                  tone: 'blue',
                  size: 'sm',
                },
                {
                  id: 'm-json',
                  x: 650,
                  y: 405,
                  label: 'JSON / Print 模式',
                  sublabel: 'CI 流水线与 Shell 管道',
                  icon: 'code',
                  tone: 'blue',
                  size: 'sm',
                },
                {
                  id: 'm-sdk',
                  x: 865,
                  y: 405,
                  label: 'TS SDK / OpenClaw',
                  sublabel: '无头多渠道引擎嵌入',
                  icon: 'package',
                  tone: 'orange',
                  size: 'sm',
                  active: true,
                },
              ],
              edges: [
                { from: 'm-core', to: 'm-bus', label: '10 Events', status: 'active', packetColor: '#6f4ea3', packetCount: 2 },
                { from: 'm-bus', to: 'm-tui', status: 'active', packetColor: '#4e7d34' },
                { from: 'm-bus', to: 'm-rpc', status: 'active', packetColor: '#3c6ea8' },
                { from: 'm-bus', to: 'm-json', status: 'active', packetColor: '#3c6ea8' },
                { from: 'm-bus', to: 'm-sdk', status: 'active', packetColor: '#b56c27' },
              ],
            },
          },

          // Step 7
          {
            stepNumber: 7,
            shortLabel: 'waitForIdle 结算',
            badge: 'INSIGHT',
            title: '关键竞态防线：waitForIdle() 必须等所有 agent_end 监听器跑完',
            paragraphs: [
              '在异步事件驱动系统里，有一个极其隐蔽的丢数据陷阱：假如 `agent_end` 刚一发出去，`agent.prompt()` 或 `agent.waitForIdle()` 就立刻 resolve，而此时 `SessionManager` 或用户扩展注册的异步监听器还在执行最后一次 JSONL `fs.appendFile` 或 Webhook 上报——进程一退出，最后一条消息直接凭空蒸发！',
              '`packages/agent/src/agent.ts` 给出了铁律级保证：`subscribe(listener)` 支持返回 Promise 的异步监听器并按序 `await`；**整次运行（`waitForIdle()`）直到所有订阅了 `agent_end` 的异步监听器全部结算后才会真正 resolve**。',
            ],
            callout: {
              kind: 'warn',
              title: '杜绝「事件已发、落盘未完」竞态',
              text: '在 Print/CI 脚本或单元测试里写完 `await agent.prompt("..."); await agent.waitForIdle();` 后，你可以 100% 确信磁盘会话文件与所有扩展收尾钩子都已经彻底落稳。',
            },
            diffs: [
              { kind: 'add', text: '`Agent.subscribe()` 按序 `await` 异步监听器，消除回调乱序' },
              { kind: 'add', text: '`waitForIdle()` 将结算屏障延后至最后一个 `agent_end` 监听器完成' },
              { kind: 'remove', text: '彻底消灭进程退出早于异步落盘的幽灵丢数据 Bug' },
            ],
            sourceDrawer: {
              title: 'Agent 异步监听与 waitForIdle 结算屏障',
              filePath: 'packages/agent/src/agent.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent.ts',
              language: 'ts',
              code: `// packages/agent/src/agent.ts — 异步订阅按序等待，确保终态落稳
private async emit(e: AgentEvent): Promise<void> {
  for (const listener of this.listeners) {
    await listener(e); // 等待每个异步订阅者（如 JSONL 持久化 / 扩展钩子）完成
  }
}

// 仅在包含 agent_end 在内的全部 emit() 结算后，
// 才 resolve runningPrompt，放行外部 await agent.waitForIdle()！`,
              caption: '把 `waitForIdle()` 绑定在最后一个 `agent_end` 监听器之后，是可靠无头 Agent 运行时的必备底座。',
            },
            kpis: [
              { label: '监听器执行模型', value: '顺序 awaited', status: 'good' },
              { label: 'waitForIdle 放行点', value: 'agent_end 结算后', status: 'good' },
              { label: '末尾落盘丢失率', value: '0%', status: 'good' },
              { label: '脚本/测试确定性', value: '强一致', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: 'Loop 主循环事件发射' },
              { color: '#b56c27', label: '异步订阅者落盘 / 钩子收尾' },
              { color: '#4e7d34', label: 'waitForIdle() 安全放行点' },
            ],
            scene: {
              kind: 'swimlane',
              title: 'waitForIdle() 终态屏障：等待全部 agent_end 监听器彻底结算',
              phaseBands: [
                { start: 44, end: 82, label: '结算屏障：await 全部 agent_end 监听器', tone: 'orange' },
              ],
              lanes: [
                { id: 'w-loop', label: 'runLoop 主循环', sublabel: '发射事件', tone: 'violet' },
                { id: 'w-sub1', label: '监听器 A (落盘)', sublabel: 'SessionManager', tone: 'orange' },
                { id: 'w-sub2', label: '监听器 B (扩展)', sublabel: 'async hook', tone: 'blue' },
                { id: 'w-call', label: '调用方等待', sublabel: 'waitForIdle()', tone: 'green' },
              ],
              ticks: [
                { pos: 10, label: 't0 执行' },
                { pos: 44, label: 't1 emit agent_end' },
                { pos: 64, label: 't2 落盘完成' },
                { pos: 82, label: 't3 扩展完成' },
                { pos: 95, label: 't4 进程退出' },
              ],
              bars: [
                { id: 'wb-loop', laneId: 'w-loop', start: 8, end: 44, label: '执行各 Turn 并结束', tone: 'violet', status: 'done' },
                { id: 'wb-sub1', laneId: 'w-sub1', start: 44, end: 64, label: 'await 写入 JSONL', tone: 'orange', status: 'done', orderBadge: '#1' },
                { id: 'wb-sub2', laneId: 'w-sub2', start: 64, end: 82, label: 'await 扩展收尾', tone: 'blue', status: 'done', orderBadge: '#2' },
                { id: 'wb-wait', laneId: 'w-call', start: 8, end: 83, label: '阻塞等待结算屏障…', tone: 'neutral', status: 'queued' },
                { id: 'wb-ok', laneId: 'w-call', start: 84, end: 96, label: '安全返回', tone: 'green', status: 'done' },
              ],
              events: [
                { id: 'we-1', laneId: 'w-loop', pos: 44, label: 'agent_end', tone: 'violet', emphasized: true },
                { id: 'we-2', laneId: 'w-call', pos: 84, label: 'waitForIdle() resolve', tone: 'green', emphasized: true },
              ],
              connectors: [
                { fromPos: 44, fromLaneId: 'w-loop', toPos: 44, toLaneId: 'w-sub1', label: 'emit' },
                { fromPos: 64, fromLaneId: 'w-sub1', toPos: 64, toLaneId: 'w-sub2', label: 'next' },
                { fromPos: 82, fromLaneId: 'w-sub2', toPos: 84, toLaneId: 'w-call', label: '放行', dashed: true },
              ],
            },
          },

          // Step 8
          {
            stepNumber: 8,
            shortLabel: '事件流决策复盘',
            badge: 'RECAP',
            title: '复盘：为什么 10 种事件撑起了整个 Pi 交互生态？',
            paragraphs: [
              '事件契约的设计原则是「不多不少」：太少则无法表达思考增量、工具局部进度与精确耗时；太多则每个消费端都要维护庞大状态机。Pi 用 **Agent(2) + Turn(2) + Message(3) + Tool(3) = 10 种事件** 精准拿捏了这个平衡点。',
              '配合「快照 + Delta 同发」「工具结算后防晚到」「`waitForIdle()` 等待全员异步监听器结算」三道工程细节，同一条 `EventStream` 才能既快又稳地驱动终端、IDE 与多渠道机器人。',
            ],
            callout: {
              kind: 'idea',
              title: '进入第 04 章',
              text: '弄清了消息如何进出模型、事件如何实时流出后，第 04 章我们将深入 Agent 真正产生生产力（也最容易踩坑）的两个核心引擎：**工具并发编排** 与 **Prompt Cache 稳定术**！',
            },
            recapTable: [
              {
                question: '如何让一套 Agent Loop 同时驱动 TUI、RPC、JSON 与 SDK？',
                decision: '`agentLoop()` 只产出 `EventStream<AgentEvent>`，由 `subscribe()` 扇出',
                because: '核心循环零 UI 耦合，新增任何前端载体都不必触碰状态机代码。',
              },
              {
                question: '10 种 `AgentEvent` 为何按 2+2+3+3 分层？',
                decision: 'Agent/Turn 仅起止括号，Message/Tool 增加 `*_update` 流式脉冲',
                because: '精准匹配需要实时反馈的耗时阶段，同时保持严格括号嵌套不变量。',
              },
              {
                question: '为何 `message_update` 同时携带 Delta 与局部 `message` 快照？',
                decision: '同时提供 `assistantMessageEvent` 与最新局部 `AgentMessage`',
                because: '流式协议与声明式渲染各取所需，前端零手写残缺 JSON 拼接。',
              },
              {
                question: '如何防止进程在异步持久化完成前提前退出？',
                decision: '`waitForIdle()` 等到全部 `agent_end` 异步监听器 `await` 完成后才 resolve',
                because: '消除事件驱动架构最常见的末尾丢数据竞态。',
              },
            ],
            kpis: [
              { label: '生命周期层级', value: '4 层严格嵌套', status: 'good' },
              { label: '标准事件总数', value: '精确 10 种', status: 'good' },
              { label: '后结算防抖', value: '已内置守卫', status: 'good' },
              { label: '终态一致性', value: 'waitForIdle 保障', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: '4 层嵌套事件契约' },
              { color: '#4e7d34', label: '多端订阅与结算保障' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '全景图：10 种 AgentEvent 的产生、流式推送与可靠结算',
              nodes: [
                {
                  id: 'er-1',
                  x: 165,
                  y: 160,
                  label: 'Agent / Turn (4)',
                  sublabel: 'agent_start/end · turn_start/end',
                  icon: 'loop',
                  tone: 'violet',
                  size: 'md',
                },
                {
                  id: 'er-2',
                  x: 165,
                  y: 395,
                  label: 'Message / Tool (6)',
                  sublabel: 'start → update* → end + 防晚到',
                  icon: 'zap',
                  tone: 'orange',
                  size: 'md',
                },
                {
                  id: 'er-3',
                  x: 500,
                  y: 280,
                  label: 'EventStream 总线',
                  sublabel: '快照+Delta · 顺序 await 扇出',
                  icon: 'layers',
                  tone: 'dark',
                  size: 'lg',
                  active: true,
                  badge: '精确 10 事件',
                },
                {
                  id: 'er-4',
                  x: 825,
                  y: 160,
                  label: 'TUI / RPC / SDK',
                  sublabel: '零修改多壳复用',
                  icon: 'terminal',
                  tone: 'blue',
                  size: 'md',
                },
                {
                  id: 'er-5',
                  x: 825,
                  y: 395,
                  label: 'waitForIdle() 屏障',
                  sublabel: '全员 agent_end 结算放行',
                  icon: 'check',
                  tone: 'green',
                  size: 'md',
                  active: true,
                },
              ],
              edges: [
                { from: 'er-1', to: 'er-3', status: 'active', packetColor: '#6f4ea3' },
                { from: 'er-2', to: 'er-3', status: 'active', packetColor: '#b56c27' },
                { from: 'er-3', to: 'er-4', label: '实时推送', status: 'active', packetColor: '#3c6ea8', packetCount: 2 },
                { from: 'er-3', to: 'er-5', label: 'await 结算', status: 'active', packetColor: '#4e7d34' },
              ],
            },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // CHAPTER 04 — 工具与缓存稳定术
  // ==========================================================================
  {
    id: 'ch04',
    number: 4,
    title: '工具与缓存稳定术',
    color: 'amber',
    lessons: [
      // ----------------------------------------------------------------------
      // Lesson 8 (ch04-l01): 极简 4 工具与并发编排引擎
      // ----------------------------------------------------------------------
      {
        id: 'ch04-l01',
        slug: 'tool-execution',
        chapterId: 'ch04',
        chapterNumber: 4,
        chapterTitle: '工具与缓存稳定术',
        lessonIndexInChapter: 1,
        totalInChapter: 2,
        title: '极简 4 工具与并发编排引擎',
        subtitle:
          '拆解 4 工具极简哲学、单工具 8 阶段管线、默认 parallel 并发双序机制与批量终止守卫',
        durationMin: 11,
        level: '进阶',
        objectives: [
          {
            id: 'obj-te-1',
            text: '理解为何默认仅保留 `read`、`bash`、`edit`、`write` 四个核心工具反而胜过 40 个臃肿工具集',
            completedAtStep: 2,
          },
          {
            id: 'obj-te-2',
            text: '掌握单个工具从 `tool_execution_start` 到 `tool_execution_end` 的完整 8 阶段执行管线与钩子拦截点',
            completedAtStep: 4,
          },
          {
            id: 'obj-te-3',
            text: '彻底看懂默认 `parallel` 双序引擎：预检串行、`Promise.all` 并发、完成序发结束事件、源码序提交结果',
            completedAtStep: 6,
          },
          {
            id: 'obj-te-4',
            text: '理解 `executionMode: "sequential"` 的整批回退规则与 Steering 延迟至批次结束后的现代演进',
            completedAtStep: 7,
          },
          {
            id: 'obj-te-5',
            text: '掌握 `stopReason === "length"` 截断防线与 `shouldTerminateToolBatch` 全员一致终止规则',
            completedAtStep: 8,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: '40 工具的陷阱',
            badge: 'PROBLEM',
            title: '为什么 40 个内置专用工具反而把 Coding Agent 变笨了？',
            paragraphs: [
              '市面上的不少编码 Agent 习惯为每个常见操作单独造一个工具：`git_status`、`git_diff`、`run_tests`、`search_symbol`、`create_dir`、`todo_write`、`enter_plan_mode`……一打开会话，光工具 JSON Schema 就能先吃掉上万 Token。',
              'Mario Zechner 在 Terminal-Bench 2.0（使用 Claude Opus 4.5 对照主流 Agent）中的实践揭示了一个反直觉事实：**前沿编码模型早已在海量 Unix Shell 与文件编辑轨迹上经历过深度强化学习**。塞进 40 个功能重叠、参数各异的封装工具，不仅浪费宝贵上下文，还会与模型原生的训练分布对着干，导致频繁选错工具与参数幻觉。',
            ],
            callout: {
              kind: 'warn',
              title: '工具膨胀税',
              text: '工具越多 ≠ 能力越强。每多一个重叠封装，都要在 **每一个 Turn** 支付固定 Schema Token 税，并稀释模型在工具选择时的注意力。',
            },
            diffs: [
              { kind: 'remove', text: '40+ 细分封装工具带来冗长 Schema 税与重叠语义冲突' },
              { kind: 'add', text: '回归 Unix 第一性原理：把通用计算交给模型最擅长的 `bash` 与精准文件原语' },
            ],
            kpis: [
              { label: '传统内置工具数', value: '30 ~ 50 个', status: 'bad' },
              { label: 'Pi 默认核心工具', value: '仅 4 个', status: 'good' },
              { label: '工具选择混淆率', value: '大幅下降', status: 'good' },
              { label: '首轮提示税', value: '极简轻盈', status: 'good' },
            ],
            legend: [
              { color: '#b94a48', label: '传统 Agent 臃肿工具税' },
              { color: '#4e7d34', label: 'Pi 极简 4 原语底座' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '工具哲学对比：40 个脆弱封装 vs 4 个正交 Unix 原语',
              zones: [
                {
                  id: 'z-bloat',
                  x: 70,
                  y: 75,
                  w: 390,
                  h: 410,
                  label: '传统 Agent · 40+ 重叠工具',
                  tone: 'rose',
                  dashed: true,
                  items: [
                    { label: 'git_diff', filled: true },
                    { label: 'run_test', filled: true },
                    { label: 'mkdir', filled: true },
                    { label: 'todo_write', filled: true },
                    { label: 'plan_mode', filled: true },
                    { label: '+35 更多…', filled: false },
                  ],
                },
                {
                  id: 'z-pi',
                  x: 540,
                  y: 75,
                  w: 390,
                  h: 410,
                  label: 'Pi 极简底座 · 4 正交原语',
                  tone: 'green',
                  items: [
                    { label: 'read', filled: true },
                    { label: 'bash', filled: true },
                    { label: 'edit', filled: true },
                    { label: 'write', filled: true },
                  ],
                },
              ],
              nodes: [
                {
                  id: 'bloat-llm',
                  x: 265,
                  y: 295,
                  label: '40+ 工具 Schema 洪流',
                  sublabel: '每轮背负巨额前缀 + 选型纠结',
                  icon: 'alert',
                  tone: 'rose',
                  size: 'lg',
                  meter: { value: 88, label: '前缀负担', status: 'bad' },
                },
                {
                  id: 'pi-llm',
                  x: 735,
                  y: 295,
                  label: '4 核心工具原语',
                  sublabel: '贴合 RL 训练分布 · 零冗余',
                  icon: 'sparkles',
                  tone: 'green',
                  size: 'lg',
                  active: true,
                  badge: '极简胜出',
                  meter: { value: 14, label: '前缀负担', status: 'good' },
                },
              ],
              edges: [
                { from: 'bloat-llm', to: 'pi-llm', label: '减法重构', status: 'active', packetColor: '#4e7d34' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: '极简 4 工具集',
            badge: 'SOLUTION',
            title: 'createCodingTools：4 个默认核心 + 按需启用的只读/平台工具',
            paragraphs: [
              '在 `packages/coding-agent/src/core/tools/index.ts` 中，默认激活的 `createCodingTools` 只有 **4 个正交原语**：`read`（支持文本与图片，默认 2,000 行上限并带 `offset`/`limit` 分页）、`bash`（同步 Shell，捕获 `stdout`/`stderr` 与可选 `timeout`）、`edit`（基于精确 `oldText` → `newText` 的外科手术式替换）和 `write`（新建或覆写文件并自动创建父目录）。',
              '如果你需要无副作用的代码审阅会话（例如 `--tools read,grep,find,ls`），Pi 还内置了默认关闭的 `grep`、`find`、`ls`（以及 Windows 下的 `powershell`）。在完整编程模式下，"Bash is all you need"——`rg`、`git`、`tmux` 全部直通原生命令行。',
            ],
            callout: {
              kind: 'tip',
              title: '正交性检验',
              text: '读文件用 `read`，精准局部改动用 `edit`，整文件生成用 `write`，其余一切检索、构建、测试与版本控制全交给 `bash`——4 个工具两两几乎零重叠。',
            },
            diffs: [
              { kind: 'add', text: '默认激活 4 工具：`read`、`bash`、`edit`、`write`（`createCodingTools`）' },
              { kind: 'add', text: '可选内置（默认关闭）：`grep`、`find`、`ls`（纯只读审计模式）与 `powershell`' },
              { kind: 'remove', text: '故意不内置后台 bash、Plan 模式与 Todo 工具——交还给 `tmux` 与可观测文件' },
            ],
            sourceDrawer: {
              title: '默认 4 核心工具与只读工具组定义',
              filePath: 'packages/coding-agent/src/core/tools/index.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/tools/index.ts',
              language: 'ts',
              code: `// packages/coding-agent/src/core/tools/index.ts
// 默认编码会话仅装配 4 个正交工具：
export function createCodingTools(cwd: string, options?: ToolsOptions) {
  return [
    createReadTool(cwd, options?.read),   // 文本 + 图片，默认 2000 行，支持 offset/limit
    createBashTool(cwd, options?.bash),   // 同步 Shell，stdout/stderr + 可选 timeout
    createEditTool(cwd, options?.edit),   // 精确 oldText -> newText 局部修改
    createWriteTool(cwd, options?.write), // 新建/覆写 + 自动 mkdir -p
  ];
}

// 供 --tools read,grep,find,ls 等受限只读场景按需启用：
export function createReadOnlyTools(cwd: string) {
  return [createReadTool(cwd), createGrepTool(cwd), createFindTool(cwd), createLsTool(cwd)];
}`,
              caption: '极简不是简陋，而是把每一把工具都磨成不可替代的正交原语。',
            },
            kpis: [
              { label: '默认激活工具', value: '4 个 (正交)', status: 'good' },
              { label: 'read 默认分页', value: '2,000 行', status: 'neutral' },
              { label: '按需只读内置', value: 'grep / find / ls', status: 'neutral' },
              { label: '基线 Prompt+工具', value: '< 1,000 tok', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: '默认启用 4 核心工具' },
              { color: '#6f6961', label: '默认关闭（--tools 按需启用）', dashed: true },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'createCodingTools：4 个默认核心工具 + 按需扩展区',
              zones: [
                {
                  id: 'z-opt',
                  x: 160,
                  y: 385,
                  w: 680,
                  h: 120,
                  label: '可选内置（默认关闭 · 供只读模式或 Windows 启用）',
                  tone: 'neutral',
                  dashed: true,
                  items: [
                    { label: 'grep', filled: false },
                    { label: 'find', filled: false },
                    { label: 'ls', filled: false },
                    { label: 'powershell (Win)', filled: false },
                  ],
                },
              ],
              nodes: [
                {
                  id: 't-hub',
                  x: 500,
                  y: 120,
                  label: 'createCodingTools()',
                  sublabel: 'Pi 默认编码工具集',
                  icon: 'wrench',
                  tone: 'dark',
                  size: 'md',
                  active: true,
                },
                {
                  id: 't-read',
                  x: 165,
                  y: 280,
                  label: 'read',
                  sublabel: '文本/图片 · 2000行分页',
                  icon: 'file',
                  tone: 'green',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 't-bash',
                  x: 388,
                  y: 280,
                  label: 'bash',
                  sublabel: '同步 Shell · timeout',
                  icon: 'terminal',
                  tone: 'orange',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 't-edit',
                  x: 612,
                  y: 280,
                  label: 'edit',
                  sublabel: '精确 oldText→newText',
                  icon: 'edit',
                  tone: 'blue',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 't-write',
                  x: 835,
                  y: 280,
                  label: 'write',
                  sublabel: '创建/覆写 + 自动 mkdir',
                  icon: 'code',
                  tone: 'violet',
                  size: 'sm',
                  active: true,
                },
              ],
              edges: [
                { from: 't-hub', to: 't-read', status: 'active', packetColor: '#4e7d34' },
                { from: 't-hub', to: 't-bash', status: 'active', packetColor: '#b56c27' },
                { from: 't-hub', to: 't-edit', status: 'active', packetColor: '#3c6ea8' },
                { from: 't-hub', to: 't-write', status: 'active', packetColor: '#6f4ea3' },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: '8 阶段管线(上)',
            badge: 'TECHNIQUE',
            title: '单工具 8 阶段管线（1–5）：预检、校验与 beforeToolCall 拦截',
            paragraphs: [
              '模型吐出一个 `toolCall` 后，Pi 绝不会鲁莽地直接 `exec()`。在 `packages/agent/src/agent-loop.ts`（L523–957）中，每个工具调用都要依次穿过 **5 道预检关卡**：先发射 `tool_execution_start`，紧接着做 **Abort 检查**（若已中止，立即生成 `"Operation aborted"` 错误结果——守住「每个 `toolCall` 必有配对 `toolResult`」的协议铁律）。',
              '随后查找工具定义，按需执行 `tool.prepareArguments()` 做参数预处理，再经 `validateToolArguments()` 完成严格的 JSON Schema 校验；最后进入可扩展的 `beforeToolCall` 钩子——任何扩展都可以返回 `{ block: true, reason?, terminate? }` 优雅否决高危操作。',
            ],
            callout: {
              kind: 'warn',
              title: '配对铁律：绝不留下孤儿 toolCall',
              text: '无论是用户中止、参数校验失败还是 `beforeToolCall` 拦截，Pi 都会为该 `toolCallId` 生成一条合法的 `isError: true` 的 `toolResult`。否则主流 LLM API 会在下一轮直接报 400 错误拒绝请求！',
            },
            diffs: [
              { kind: 'add', text: '阶段 1–2：`tool_execution_start` → `signal.aborted` 立即合成中止结果' },
              { kind: 'add', text: '阶段 3–4：工具查找 + `prepareArguments()` + `validateToolArguments()` Schema 校验' },
              { kind: 'add', text: '阶段 5：`beforeToolCall` 钩子支持 `{ block: true, reason?, terminate? }` 拦截' },
            ],
            kpis: [
              { label: '预检阶段数', value: '阶段 1 ~ 5', status: 'neutral' },
              { label: '孤儿 toolCall', value: '0 可能 (必配对)', status: 'good' },
              { label: 'Schema 校验', value: 'pi-schema 强校验', status: 'good' },
              { label: '前置拦截点', value: 'beforeToolCall', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: '预检与校验正向流' },
              { color: '#b94a48', label: '中止 / 校验失败 / 拦截旁路', dashed: true },
              { color: '#4e7d34', label: '放行进入实际执行' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '单工具 8 阶段管线（前 5 阶段：预检与拦截）',
              nodes: [
                {
                  id: 'p1',
                  x: 155,
                  y: 165,
                  label: '1. execution_start',
                  sublabel: '发射开始事件',
                  icon: 'zap',
                  tone: 'violet',
                  size: 'sm',
                },
                {
                  id: 'p2',
                  x: 385,
                  y: 165,
                  label: '2. Abort 检查',
                  sublabel: '已中止即返错',
                  icon: 'shield',
                  tone: 'orange',
                  size: 'sm',
                },
                {
                  id: 'p3',
                  x: 615,
                  y: 165,
                  label: '3–4. 预处理+校验',
                  sublabel: 'prepare + validateArgs',
                  icon: 'check',
                  tone: 'blue',
                  size: 'sm',
                },
                {
                  id: 'p5',
                  x: 845,
                  y: 165,
                  label: '5. beforeToolCall',
                  sublabel: '扩展可 block / terminate',
                  icon: 'shield',
                  tone: 'violet',
                  size: 'sm',
                  active: true,
                },
                {
                  id: 'p-err',
                  x: 490,
                  y: 410,
                  label: '合成错误 toolResult',
                  sublabel: 'isError: true · 守住配对铁律',
                  icon: 'alert',
                  tone: 'rose',
                  size: 'md',
                },
                {
                  id: 'p-go',
                  x: 845,
                  y: 410,
                  label: '进入阶段 6 execute()',
                  sublabel: '全部预检通过',
                  icon: 'terminal',
                  tone: 'green',
                  size: 'md',
                  active: true,
                },
              ],
              edges: [
                { from: 'p1', to: 'p2', status: 'active', packetColor: '#6f4ea3' },
                { from: 'p2', to: 'p3', status: 'active', packetColor: '#3c6ea8' },
                { from: 'p3', to: 'p5', status: 'active', packetColor: '#6f4ea3' },
                { from: 'p2', to: 'p-err', label: 'aborted', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'p3', to: 'p-err', label: 'schema 失败', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'p5', to: 'p-err', label: 'block: true', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'p5', to: 'p-go', label: '放行', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: '8 阶段管线(下)',
            badge: 'TECHNIQUE',
            title: '单工具 8 阶段管线（6–8）：执行、单调计时、afterToolCall 覆写与收束',
            paragraphs: [
              '通过预检后，工具进入阶段 6：`tool.execute(id, args, signal, onUpdate)`。执行期间一方面通过 `onUpdate` 流式推送进度，另一方面以单调时钟精确记录 `durationMs`，同时把一切运行时异常捕获转化为 `isError: true` 结果——**工具崩了绝不能拖垮整条 Agent Loop**。',
              '紧接着是阶段 7 `afterToolCall` 钩子：扩展可以按字段精细覆写 `content`、`details`、`structuredContent`、`isError`、`usage` 或 `terminate`（例如自动脱敏密钥或截断超大输出）。最后阶段 8 发射 `tool_execution_end`，并沉淀为最终的 `ToolResultMessage`。',
            ],
            callout: {
              kind: 'tip',
              title: 'afterToolCall 逐字段覆写',
              text: '扩展无需克隆整个返回对象，只需在 `afterToolCall` 返回 `{ content: redactedContent }` 即可定向覆盖指定字段，其余字段（如 `details`、`usage`）自动保留。',
            },
            diffs: [
              { kind: 'add', text: '阶段 6：`execute()` + `onUpdate` 流式回报 + 单调 `durationMs` + 异常兜底' },
              { kind: 'add', text: '阶段 7：`afterToolCall` 支持 6 个结果字段的细粒度局部覆写' },
              { kind: 'add', text: '阶段 8：发射 `tool_execution_end` 并准备写入 `ToolResultMessage`' },
            ],
            sourceDrawer: {
              title: '单工具执行、异常兜底与 afterToolCall 覆写',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts',
              language: 'ts',
              code: `// packages/agent/src/agent-loop.ts (工具执行与后处理核心片段)
const startedAt = performance.now();
try {
  result = await tool.execute(toolCall.id, validatedArgs, signal, onUpdate);
} catch (err) {
  isError = true;
  result = { content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }] };
}
const durationMs = Math.max(0, Math.round(performance.now() - startedAt));

// afterToolCall：支持按字段覆写 content/details/structuredContent/isError/usage/terminate
if (config.afterToolCall) {
  const patch = await config.afterToolCall({ toolCall, result, isError, durationMs }, signal);
  if (patch) result = applyFieldOverrides(result, patch);
}
emit({ type: "tool_execution_end", toolCallId: toolCall.id, toolName: toolCall.name, result, isError, durationMs });`,
              caption: '单调时钟计时、异常转 `isError`、逐字段覆写钩子，让工具层既健壮又高度可插拔。',
            },
            kpis: [
              { label: '收尾阶段数', value: '阶段 6 ~ 8', status: 'neutral' },
              { label: '异常隔离', value: 'catch → isError', status: 'good' },
              { label: '可覆写字段', value: '6 个细粒度字段', status: 'good' },
              { label: '计时基准', value: '单调 durationMs', status: 'good' },
            ],
            legend: [
              { color: '#b56c27', label: 'execute 执行与异常捕获' },
              { color: '#6f4ea3', label: 'afterToolCall 扩展覆写' },
              { color: '#4e7d34', label: 'tool_execution_end 与结果提交' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '单工具 8 阶段管线（后 3 阶段：执行、覆写与结算）',
              nodes: [
                {
                  id: 'q6',
                  x: 170,
                  y: 240,
                  label: '6. tool.execute()',
                  sublabel: 'onUpdate + 单调计时 + try/catch',
                  icon: 'terminal',
                  tone: 'orange',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'q7',
                  x: 495,
                  y: 240,
                  label: '7. afterToolCall',
                  sublabel: '逐字段覆写 content / isError / terminate',
                  icon: 'edit',
                  tone: 'violet',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'q8',
                  x: 820,
                  y: 165,
                  label: '8a. execution_end',
                  sublabel: '附带 durationMs & isError',
                  icon: 'zap',
                  tone: 'green',
                  size: 'sm',
                },
                {
                  id: 'q8b',
                  x: 820,
                  y: 390,
                  label: '8b. ToolResultMessage',
                  sublabel: 'message_start / end 落盘',
                  icon: 'database',
                  tone: 'dark',
                  size: 'md',
                  active: true,
                },
              ],
              edges: [
                { from: 'q6', to: 'q7', label: 'result + durationMs', status: 'active', packetColor: '#b56c27', packetCount: 2 },
                { from: 'q7', to: 'q8', label: '实时广播', status: 'active', packetColor: '#4e7d34' },
                { from: 'q7', to: 'q8b', label: '提交上下文', status: 'active', packetColor: '#6f4ea3' },
              ],
              callouts: [
                { x: 340, y: 420, text: '任何 throw 都会被捕获转为 isError: true，由 LLM 自主阅读报错并修复', tone: 'orange' },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: '并发与顺序矛盾',
            badge: 'PROBLEM',
            title: '一次 Turn 吐出 3 个工具调用：要速度，还是要确定性顺序？',
            paragraphs: [
              '前沿模型经常在单次响应中批量发出多个工具调用，例如同时请求：`#1 bash("npm test")`（耗时 450ms）、`#2 read("src/app.ts")`（耗时 60ms）、`#3 read("src/types.ts")`（耗时 120ms）。',
              '如果老老实实串行执行，总耗时高达 **630ms**；但如果简单粗暴地 `Promise.all` 并发完直接按谁先结束就把谁推进 `messages`（`#2 → #3 → #1`），UI 确实快了，却会让 `toolResult` 顺序漂移成非确定性随机顺序，甚至触发部分 LLM 供应商对 `toolCall`/`toolResult` 顺序对齐的严格校验失败！',
            ],
            callout: {
              kind: 'warn',
              title: '两难陷阱',
              text: '串行 = 顺序稳但总延迟叠加（630ms）；朴素并发 = 总延迟最短（450ms）但消息历史顺序随机漂移。能不能鱼与熊掌兼得？',
            },
            diffs: [
              { kind: 'remove', text: '纯串行执行让两个 60ms/120ms 的读文件白白干等 450ms 的测试命令' },
              { kind: 'remove', text: '朴素并发按完成序写历史会破坏 `assistant` 工具调用的确定性源码顺序' },
            ],
            kpis: [
              { label: '纯串行总耗时', value: '630 ms', status: 'bad' },
              { label: '并发理论关键路径', value: '450 ms', status: 'good' },
              { label: '延迟优化潜力', value: '-28.6%', status: 'good' },
              { label: '上下文顺序要求', value: '严格 #1→#2→#3', status: 'warn' },
            ],
            legend: [
              { color: '#b94a48', label: '串行排队造成的空等延迟' },
              { color: '#b56c27', label: '慢工具 (#1 bash 450ms)' },
              { color: '#3c6ea8', label: '快工具 (#2/#3 read)' },
            ],
            scene: {
              kind: 'swimlane',
              title: '痛点基线：纯串行执行导致快工具被迫苦等慢工具',
              phaseBands: [
                { start: 6, end: 68, label: '#1 独占执行期（#2/#3 干等）', tone: 'orange' },
                { start: 68, end: 94, label: '本可早已完成的读文件', tone: 'blue' },
              ],
              lanes: [
                { id: 'sq-1', label: '#1 bash', sublabel: 'npm test (450ms)', tone: 'orange' },
                { id: 'sq-2', label: '#2 read', sublabel: 'app.ts (60ms)', tone: 'blue' },
                { id: 'sq-3', label: '#3 read', sublabel: 'types.ts (120ms)', tone: 'blue' },
              ],
              ticks: [
                { pos: 6, label: '0ms' },
                { pos: 37, label: '225ms' },
                { pos: 68, label: '450ms' },
                { pos: 77, label: '510ms' },
                { pos: 94, label: '630ms' },
              ],
              bars: [
                { id: 'sb-1', laneId: 'sq-1', start: 6, end: 68, label: '#1 bash 运行中 (450ms)', tone: 'orange', status: 'done', orderBadge: '#1' },
                { id: 'sb-2w', laneId: 'sq-2', start: 6, end: 68, label: '阻塞等待 #1…', tone: 'rose', status: 'blocked' },
                { id: 'sb-2', laneId: 'sq-2', start: 68, end: 77, label: '读 app', tone: 'blue', status: 'done', orderBadge: '#2' },
                { id: 'sb-3w', laneId: 'sq-3', start: 6, end: 77, label: '阻塞等待 #1 #2…', tone: 'rose', status: 'blocked' },
                { id: 'sb-3', laneId: 'sq-3', start: 77, end: 94, label: '读 types', tone: 'blue', status: 'done', orderBadge: '#3' },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: 'Parallel 双序引擎',
            badge: 'SOLUTION',
            title: 'Pi 默认 parallel 双序引擎：完成序播事件，源码序写历史！',
            paragraphs: [
              'Pi 的工具编排默认采用 `toolExecution: "parallel"`（`packages/agent/src/agent.ts` L266），用一个堪称教科书级的 **三段式双序流水线** 完美化解速度与顺序的矛盾：',
              '**阶段 1 预检串行**：按源码序 `#1 → #2 → #3` 依次跑完 `tool_execution_start`、Schema 校验与 `beforeToolCall`，确保有状态扩展看到确定次序；**阶段 2 `Promise.all` 并发执行**：全部放行工具同时启动，谁先完就 **立刻按完成序** 发射 `tool_execution_end`（`#2` 60ms 率先打绿勾，`#3` 120ms 紧随其后，`#1` 450ms 最后结束）；**阶段 3 源码序回填**：待 `Promise.all` 全部结算后，将 `ToolResultMessage` 与 `turn_end.toolResults` 严格按 **assistant 源码顺序 `#1 → #2 → #3`** 提交进上下文！',
            ],
            callout: {
              kind: 'idea',
              title: '两套时钟，各得其所',
              text: '人类看重实时感，所以 **`tool_execution_end` 走完成序（Eager Completion Order）**；LLM 与缓存看重确定性，所以 **`toolResult` 提交走源码序（Assistant Source Order）**！',
            },
            diffs: [
              { kind: 'add', text: '阶段 1：预检（`start` + 校验 + `beforeToolCall`）严格串行执行' },
              { kind: 'add', text: '阶段 2：`Promise.all` 并发执行，按 **完成序**（`#2 → #3 → #1`）即时发 `tool_execution_end`' },
              { kind: 'add', text: '阶段 3：`toolResult` 与 `turn_end.toolResults` 按 **源码序**（`#1 → #2 → #3`）确定提交' },
            ],
            sourceDrawer: {
              title: '默认 parallel 双序编排逻辑',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts',
              language: 'ts',
              code: `// packages/agent/src/agent-loop.ts — parallel 模式三段式双序核心
// 1) 预检串行：按 assistant 源码序依次发 start + 校验 + beforeToolCall
const prepared = [];
for (const call of toolCalls) {
  prepared.push(await preflightToolCall(call, ...));
}

// 2) Promise.all 并发执行：每个工具一结束就按「完成序」立即发射 tool_execution_end
const settled = await Promise.all(
  prepared.map(async (item) => {
    const finalized = item.blocked ? item : await executeAndFinalize(item);
    emit({ type: "tool_execution_end", ...finalized }); // ← 完成序即时通知 UI
    return finalized;
  }),
);

// 3) 源码序回填：Promise.all 返回数组天然保序，按 #1 -> #2 -> #3 写入上下文
for (const item of settled) {
  appendToolResultMessage(context, item.toolResultMessage); // ← 源码序提交
}`,
              caption: '`Promise.all` 天然保留索引顺序，配合回调内即时 `emit`，以极少代码优雅分离了「事件完成序」与「历史源码序」。',
            },
            kpis: [
              { label: '并发总耗时', value: '450 ms (最优)', status: 'good' },
              { label: 'UI 首条完成反馈', value: '60 ms (快 7.5x)', status: 'good' },
              { label: 'execution_end 次序', value: '完成序 #2→#3→#1', status: 'good' },
              { label: 'toolResult 提交序', value: '源码序 #1→#2→#3', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: '阶段 1：串行预检 (#1→#2→#3)' },
              { color: '#3c6ea8', label: '阶段 2：Promise.all 并发 (完成序发 end)' },
              { color: '#4e7d34', label: '阶段 3：源码序回填 (#1→#2→#3)' },
            ],
            scene: {
              kind: 'swimlane',
              title: '默认 parallel 双序引擎：快工具 60ms 即亮绿，历史仍严格按 #1→#2→#3 提交',
              phaseBands: [
                { start: 4, end: 24, label: '1. 预检串行', tone: 'violet' },
                { start: 25, end: 72, label: '2. Promise.all 并发 (完成序发 end)', tone: 'blue' },
                { start: 73, end: 98, label: '3. 源码序提交', tone: 'green' },
              ],
              lanes: [
                { id: 'pl-1', label: '#1 bash', sublabel: '慢 · 450ms', tone: 'orange' },
                { id: 'pl-2', label: '#2 read app', sublabel: '快 · 60ms', tone: 'blue' },
                { id: 'pl-3', label: '#3 read types', sublabel: '中 · 120ms', tone: 'blue' },
                { id: 'pl-out', label: '上下文提交', sublabel: 'toolResults', tone: 'green' },
              ],
              ticks: [
                { pos: 4, label: '预检' },
                { pos: 25, label: '并发起跑' },
                { pos: 35, label: '+60ms' },
                { pos: 45, label: '+120ms' },
                { pos: 71, label: '+450ms' },
                { pos: 96, label: '全部提交' },
              ],
              bars: [
                { id: 'pb-p1', laneId: 'pl-1', start: 4, end: 10, label: '检', tone: 'violet', status: 'done', orderBadge: '#1' },
                { id: 'pb-p2', laneId: 'pl-2', start: 10, end: 17, label: '检', tone: 'violet', status: 'done', orderBadge: '#2' },
                { id: 'pb-p3', laneId: 'pl-3', start: 17, end: 24, label: '检', tone: 'violet', status: 'done', orderBadge: '#3' },
                { id: 'pb-r1', laneId: 'pl-1', start: 25, end: 71, label: 'npm test 并发执行', tone: 'orange', status: 'parallel', orderBadge: '完成 #3' },
                { id: 'pb-r2', laneId: 'pl-2', start: 25, end: 35, label: 'read', tone: 'blue', status: 'parallel', orderBadge: '完成 #1' },
                { id: 'pb-r3', laneId: 'pl-3', start: 25, end: 45, label: 'read types', tone: 'blue', status: 'parallel', orderBadge: '完成 #2' },
                { id: 'pb-c1', laneId: 'pl-out', start: 74, end: 81, label: '#1', tone: 'green', status: 'done', orderBadge: '提交 #1' },
                { id: 'pb-c2', laneId: 'pl-out', start: 82, end: 89, label: '#2', tone: 'green', status: 'done', orderBadge: '提交 #2' },
                { id: 'pb-c3', laneId: 'pl-out', start: 90, end: 97, label: '#3', tone: 'green', status: 'done', orderBadge: '提交 #3' },
              ],
              events: [
                { id: 'pe-1', laneId: 'pl-2', pos: 35, label: 'end #2 (最早)', tone: 'blue', emphasized: true },
                { id: 'pe-2', laneId: 'pl-3', pos: 45, label: 'end #3', tone: 'blue' },
                { id: 'pe-3', laneId: 'pl-1', pos: 71, label: 'end #1 (最晚)', tone: 'orange', emphasized: true },
              ],
              connectors: [
                { fromPos: 71, fromLaneId: 'pl-1', toPos: 77, toLaneId: 'pl-out', label: '仍排首位', dashed: true },
                { fromPos: 35, fromLaneId: 'pl-2', toPos: 85, toLaneId: 'pl-out', dashed: true },
                { fromPos: 45, fromLaneId: 'pl-3', toPos: 93, toLaneId: 'pl-out', dashed: true },
              ],
            },
          },

          // Step 7
          {
            stepNumber: 7,
            shortLabel: '串行回退与演进',
            badge: 'TECHNIQUE',
            title: '整批回退 sequential 模式，以及 Steering 不再中途跳过工具',
            paragraphs: [
              '并非所有自定义扩展工具都支持并发——例如数据库迁移、交互确认弹窗或写共享锁文件的工具。Pi 提供了极简且安全的降级机制：只要 `config.toolExecution === "sequential"`，或者当前批次中 **任意一个工具** 声明了 `AgentTool.executionMode === "sequential"`，**整批调用自动回退为严格串行执行**。',
              '这里还有一个必须指出的重要演进（commit `208a2cc`，2026-03-16）：早期 `pi-mono` 曾在串行工具之间检查 Steering 并跳过剩余工具；而现代 `earendil-works/pi` 明确规定 **绝不中途跳过当前 Turn 已发出的工具调用**，Steering 纠偏消息会在整批工具干净结算后立即注入，彻底避免了代码改到一半被截断的脏状态。',
            ],
            callout: {
              kind: 'warn',
              title: '源码勘误提醒（commit 208a2cc）',
              text: '网上不少早期博客仍写着「Pi 会在两个工具调用之间插队并跳过剩余工具」——该行为已于 2026 年 3 月修复（`fix(agent): defer steering until after tool execution`），请以现代源码为准！',
            },
            diffs: [
              { kind: 'add', text: '批次内任一工具声明 `executionMode: "sequential"` 即触发整批串行回退' },
              { kind: 'change', text: '现代演进：Steering 不再中途跳过当前 Turn 工具，而是在批次完成后整洁介入' },
            ],
            kpis: [
              { label: '单工具声明串行', value: '触发整批串行', status: 'warn' },
              { label: '当前 Turn 工具跳过', value: '绝不跳过 (208a2cc)', status: 'good' },
              { label: 'Steering 切入时机', value: '工具批次结束即入', status: 'good' },
              { label: '半截脏修改风险', value: '已消除', status: 'good' },
            ],
            legend: [
              { color: '#b56c27', label: '触发整批串行回退的工具' },
              { color: '#3c6ea8', label: '按序依次完成的同批工具' },
              { color: '#6f4ea3', label: 'Steering 排队并在批次后介入' },
            ],
            scene: {
              kind: 'swimlane',
              title: 'sequential 整批回退与 Steering 延后介入时序',
              phaseBands: [
                { start: 6, end: 74, label: '整批回退为严格串行（绝不跳过）', tone: 'orange' },
                { start: 76, end: 98, label: '批次结束 · Steering 介入下一 Turn', tone: 'violet' },
              ],
              lanes: [
                { id: 'sr-1', label: '#1 edit', sublabel: '默认并发安全', tone: 'blue' },
                { id: 'sr-2', label: '#2 db_migrate', sublabel: 'executionMode: sequential', tone: 'orange' },
                { id: 'sr-3', label: '#3 bash test', sublabel: '同批最后一项', tone: 'blue' },
                { id: 'sr-st', label: 'Steering 队列', sublabel: '用户中途敲 Enter', tone: 'violet' },
              ],
              ticks: [
                { pos: 6, label: 't0' },
                { pos: 28, label: 't1' },
                { pos: 52, label: 't2' },
                { pos: 74, label: 't3 批次完成' },
                { pos: 95, label: 't4 新 Turn' },
              ],
              bars: [
                { id: 'srb-1', laneId: 'sr-1', start: 6, end: 27, label: '#1 edit 完成', tone: 'blue', status: 'done', orderBadge: '#1' },
                { id: 'srb-2', laneId: 'sr-2', start: 28, end: 51, label: '#2 串行工具', tone: 'orange', status: 'done', orderBadge: '#2' },
                { id: 'srb-3', laneId: 'sr-3', start: 52, end: 74, label: '#3 照常执行完', tone: 'blue', status: 'done', orderBadge: '#3' },
                { id: 'srb-q', laneId: 'sr-st', start: 34, end: 75, label: '排队等待本批结束', tone: 'violet', status: 'queued' },
                { id: 'srb-in', laneId: 'sr-st', start: 76, end: 96, label: '注入 Turn #2', tone: 'green', status: 'done' },
              ],
              events: [
                { id: 'sre-1', laneId: 'sr-st', pos: 34, label: '用户发送 Steering', tone: 'violet', emphasized: true },
                { id: 'sre-2', laneId: 'sr-3', pos: 74, label: 'turn_end', tone: 'blue', emphasized: true },
              ],
              connectors: [
                { fromPos: 74, fromLaneId: 'sr-3', toPos: 76, toLaneId: 'sr-st', label: '轮询拉取', dashed: true },
              ],
            },
          },

          // Step 8
          {
            stepNumber: 8,
            shortLabel: '截断与全员终止',
            badge: 'INSIGHT',
            title: '两道隐形安全阀：截断拒执行与 shouldTerminateToolBatch 全员一致',
            paragraphs: [
              '在 `agent-loop.ts` 的边缘条件里，还藏着两道极易被忽略的工程防线。第一道是 **截断保护（commit `351efc8`）**：当模型输出触及最大输出长度（`stopReason === "length"`）时，末尾的 `toolCall` JSON 参数往往被腰斩。Pi 绝不尝试“抢救”或执行半截参数，而是直接调用 `failToolCallsFromTruncatedMessage` 把本条消息的全部工具调用标为错误结果，让模型安全重试。',
              '第二道是 **批量提前终止规则 `shouldTerminateToolBatch`**：扩展可在 `beforeToolCall` 或 `afterToolCall` 返回 `terminate: true` 请求终止内层循环。但如果有 3 个工具同批执行，Pi 只有在 **每一个最终结果都标记了 `terminate: true`** 时才提前结束循环；只要有 1 个工具希望继续，就会把全部 3 份结果交还模型综合决策。',
            ],
            callout: {
              kind: 'idea',
              title: '保守安全原则',
              text: '面对「残缺 JSON 参数」选择 **全拒不执行**；面对「部分工具想终止循环」选择 **全员一致（AND 门）才终止**——两处设计都在避免半截状态破坏上下文完整性。',
            },
            diffs: [
              { kind: 'add', text: '`stopReason === "length"` 触发 `failToolCallsFromTruncatedMessage`，绝不执行残缺参数' },
              { kind: 'add', text: '`shouldTerminateToolBatch` 采用全员一致（Every）判定，防止单个工具截胡整批结果' },
            ],
            kpis: [
              { label: '截断参数策略', value: '全拒 + 报错重试', status: 'good' },
              { label: '提前终止逻辑门', value: 'ALL (全员一致)', status: 'good' },
              { label: '半截写入事故', value: '0 可能', status: 'good' },
              { label: '钩子可控性', value: 'before/after 均支持', status: 'neutral' },
            ],
            legend: [
              { color: '#b94a48', label: '截断保护拦截路径' },
              { color: '#6f4ea3', label: '全员一致 AND 判定门' },
              { color: '#4e7d34', label: '安全闭环出口' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '双安全阀：截断保护（上）与 shouldTerminateToolBatch（下）',
              zones: [
                {
                  id: 'z-trunc',
                  x: 70,
                  y: 65,
                  w: 860,
                  h: 195,
                  label: '安全阀 A · 输出截断保护（commit 351efc8）',
                  tone: 'rose',
                  dashed: true,
                },
                {
                  id: 'z-term',
                  x: 70,
                  y: 288,
                  w: 860,
                  h: 215,
                  label: '安全阀 B · shouldTerminateToolBatch 全员一致判定',
                  tone: 'violet',
                  dashed: true,
                },
              ],
              nodes: [
                {
                  id: 'g-len',
                  x: 195,
                  y: 165,
                  label: 'stopReason: "length"',
                  sublabel: '工具参数可能被腰斩',
                  icon: 'alert',
                  tone: 'rose',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'g-fail',
                  x: 505,
                  y: 165,
                  label: 'failToolCallsFromTruncated',
                  sublabel: '拒绝执行 · 全部标错',
                  icon: 'shield',
                  tone: 'orange',
                  size: 'md',
                },
                {
                  id: 'g-retry',
                  x: 810,
                  y: 165,
                  label: '安全错误 toolResult',
                  sublabel: '交还 LLM 完整重试',
                  icon: 'check',
                  tone: 'green',
                  size: 'sm',
                },
                {
                  id: 'g-res',
                  x: 195,
                  y: 398,
                  label: '批次最终结果集',
                  sublabel: '#1(true) #2(true) #3(false)',
                  icon: 'layers',
                  tone: 'blue',
                  size: 'md',
                },
                {
                  id: 'g-and',
                  x: 505,
                  y: 398,
                  label: 'shouldTerminateToolBatch',
                  sublabel: 'EVERY(r => r.terminate)',
                  icon: 'cpu',
                  tone: 'violet',
                  size: 'md',
                  active: true,
                  badge: 'AND 门',
                },
                {
                  id: 'g-next',
                  x: 810,
                  y: 398,
                  label: '继续下一 Turn',
                  sublabel: '全员 true 才提前停环',
                  icon: 'loop',
                  tone: 'green',
                  size: 'sm',
                },
              ],
              edges: [
                { from: 'g-len', to: 'g-fail', label: '拦截', status: 'error', packetColor: '#b94a48' },
                { from: 'g-fail', to: 'g-retry', label: '回填错误', status: 'active', packetColor: '#4e7d34' },
                { from: 'g-res', to: 'g-and', label: '汇总标志位', status: 'active', packetColor: '#6f4ea3' },
                { from: 'g-and', to: 'g-next', label: '非全员 true', status: 'active', packetColor: '#4e7d34' },
              ],
            },
          },

          // Step 9
          {
            stepNumber: 9,
            shortLabel: '工具引擎复盘',
            badge: 'RECAP',
            title: '复盘：极简工具表面之下的精密并发编排内核',
            paragraphs: [
              'Pi 的工具系统呈现出极鲜明的「外简内精」：向外暴露给模型的只有 `read`、`bash`、`edit`、`write` 4 把锋利原语，贴合模型原生分布；向内运行在 `agent-loop.ts` 里的却是具备 8 阶段钩子管线、双序并发引擎、自动串行回退与截断/终止双安全阀的工业级调度器。',
              '记住最核心的那句话：**预检串行、并发执行、完成序发事件、源码序写历史**。这套设计几乎是所有现代 Coding Agent 工具层的黄金标准。',
            ],
            callout: {
              kind: 'idea',
              title: '下一课预告',
              text: '工具已经又快又稳地跑起来了，但随着工具列表与项目规则在长对话中动态变化，一个隐形账单杀手正在逼近——**Prompt Cache 失效雪崩**。下一课揭秘 Pi 的增量 Patch 稳定术！',
            },
            recapTable: [
              {
                question: '为什么默认只保留 `read / bash / edit / write` 4 个工具？',
                decision: '放弃 40+ 重叠封装，只保留正交原语 + 按需只读内置',
                because: '顺应前沿模型 Unix/文件 RL 分布，并把基线系统提示+工具压缩到 `< 1,000 tokens`。',
              },
              {
                question: '并发执行工具时如何兼顾 UI 实时反馈与历史确定性？',
                decision: '预检串行 → `Promise.all` 完成序发 `execution_end` → 源码序写 `toolResult`',
                because: '耗时最低且 UI 最快亮绿，同时确保模型上下文顺序 100% 确定可复现。',
              },
              {
                question: '遇到不可并发的工具或用户中途 Steering 怎么办？',
                decision: '任一工具设 `sequential` 即整批串行；Steering 等整批工具结束后介入',
                because: '消除竞态冲突与半截修改，彻底杜绝孤儿 `toolCall`。',
              },
              {
                question: '输出被 `length` 截断或单个工具要求提前终止怎么处理？',
                decision: '截断参数全拒报错；`shouldTerminateToolBatch` 要求全员 `terminate: true`',
                because: '杜绝执行半截 JSON，避免单个钩子粗暴丢弃同批其他工具结果。',
              },
            ],
            kpis: [
              { label: '核心原语', value: '4 工具正交集', status: 'good' },
              { label: '单工具管线', value: '8 阶段闭环', status: 'good' },
              { label: '默认并发策略', value: 'parallel 双序', status: 'good' },
              { label: '异常与截断防护', value: '全覆盖', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: '极简工具原语与源码序提交' },
              { color: '#3c6ea8', label: 'Promise.all 并发双序核心' },
              { color: '#b56c27', label: '钩子扩展与双安全阀' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '全景图：Pi 工具引擎的外简内精四层架构',
              nodes: [
                {
                  id: 'tr-1',
                  x: 165,
                  y: 280,
                  label: '极简 4 工具原语',
                  sublabel: 'read · bash · edit · write',
                  icon: 'wrench',
                  tone: 'green',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'tr-2',
                  x: 455,
                  y: 160,
                  label: '8 阶段单工具管线',
                  sublabel: '校验 · before/after · 计时',
                  icon: 'shield',
                  tone: 'violet',
                  size: 'md',
                },
                {
                  id: 'tr-3',
                  x: 455,
                  y: 400,
                  label: 'Parallel 双序调度器',
                  sublabel: '完成序事件 · 源码序提交',
                  icon: 'zap',
                  tone: 'blue',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'tr-4',
                  x: 805,
                  y: 280,
                  label: '双安全阀 & 串行回退',
                  sublabel: '截断全拒 · 全员一致终止',
                  icon: 'check',
                  tone: 'dark',
                  size: 'lg',
                  active: true,
                },
              ],
              edges: [
                { from: 'tr-1', to: 'tr-2', status: 'active', packetColor: '#4e7d34' },
                { from: 'tr-1', to: 'tr-3', status: 'active', packetColor: '#3c6ea8' },
                { from: 'tr-2', to: 'tr-4', status: 'active', packetColor: '#6f4ea3' },
                { from: 'tr-3', to: 'tr-4', label: '稳态输出', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
              ],
            },
          },
        ],
      },

      // ----------------------------------------------------------------------
      // Lesson 9 (ch04-l02): Prompt Cache 稳定术：增量 Patch
      // ----------------------------------------------------------------------
      {
        id: 'ch04-l02',
        slug: 'prompt-cache',
        chapterId: 'ch04',
        chapterNumber: 4,
        chapterTitle: '工具与缓存稳定术',
        lessonIndexInChapter: 2,
        totalInChapter: 2,
        title: 'Prompt Cache 稳定术：增量 Patch',
        subtitle:
          '理解前缀 KV Cache 经济学、超短 XML 静态前缀、SystemMessage 增量补丁与 TTL 保温机制',
        durationMin: 9,
        level: '进阶',
        objectives: [
          {
            id: 'obj-pc-1',
            text: '理解前缀 KV Cache 的逐 Token 敏感性：改写头部 1 字节就会引发整段长对话缓存雪崩',
            completedAtStep: 2,
          },
          {
            id: 'obj-pc-2',
            text: '掌握 `system-prompt.ts` 的模块化 XML 静态前缀结构与 Mario 基线 `< 1,000 tokens` 的工程红利',
            completedAtStep: 3,
          },
          {
            id: 'obj-pc-3',
            text: '看懂核心绝技：用 `diffSystemPromptSections` 与 `declareToolChanges` 尾部追加增量 `SystemMessage` Patch 替代前缀修改',
            completedAtStep: 5,
          },
          {
            id: 'obj-pc-4',
            text: '理解 `cache-warmer.ts`（`kind: "cache_warm"`）的 TTL 保温与压缩/分支摘要时关闭缓存写入的成本权衡',
            completedAtStep: 6,
          },
          {
            id: 'obj-pc-5',
            text: '通过 20 轮命中率曲线对比传统前缀改写与 Pi 增量补丁在成本与首字延迟上的量级差距',
            completedAtStep: 7,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: 'KV Cache 雪崩',
            badge: 'PROBLEM',
            title: '前缀 KV Cache 经济学：改头部 1 个 Token，毁掉 70k 缓存！',
            paragraphs: [
              '在多轮 Coding Agent 场景中，每轮都会重复发送全部历史上下文。前沿 LLM 供应商依赖 **前缀 KV Cache（Prefix Caching）** 把重复输入成本打到 1–2.5 折并大幅压缩首字延迟（TTFT）。但 KV Cache 有一条无情的数学前提：**必须从 Token 0 开始逐字节严格一致**。',
              '许多 Agent 会在每轮把动态时间戳（`Current time: 14:32:05`）、实时 Git 状态、任务计数器或新增工具定义直接塞进顶部的 System Prompt。结果在第 13 轮仅改动了头部几十个 Token，后面整整 **68,800 Tokens 的对话历史缓存瞬间清零重算**，账单和延迟双双飙升！',
            ],
            callout: {
              kind: 'warn',
              title: '蝴蝶效应式的缓存失血',
              text: 'KV Cache 是前缀树匹配：修改第 50 个 Token，等价于把第 51 到第 74,000 个 Token 全部推倒重算一次 Prefill。',
            },
            diffs: [
              { kind: 'remove', text: 'Turn 13 改写头部 System Prompt 中的 1 个工具定义或动态时间字段' },
              { kind: 'remove', text: '缓存命中率从 92.9% 瞬间暴跌至 0%，触发 68,800 Tokens 全量重算' },
            ],
            kpis: [
              { label: '改写前缓存命中', value: '92.9% (65k)', status: 'good' },
              { label: '改写后缓存命中', value: '0% (全失效)', status: 'bad' },
              { label: '浪费重算量', value: '68,800 tok', status: 'bad' },
              { label: 'TTFT 延迟飙升', value: '4.8× 变慢', status: 'bad' },
            ],
            legend: [
              { color: '#4e7d34', label: 'KV Cache 命中区（低价极速）' },
              { color: '#b94a48', label: '前缀破坏引发的全量 Cache Miss' },
              { color: '#b56c27', label: '本轮新增输入 Token' },
            ],
            scene: {
              kind: 'token-slices',
              title: '灾难现场：Turn 13 改动头部 200 Tokens 引发全段 68.8k 缓存雪崩',
              tracks: [
                {
                  id: 'pc-before',
                  title: 'Turn 12 · 头部未变（健康缓存命中）',
                  subtitle: '前 65,000 tokens 直接复用 KV Cache',
                  totalBudget: 128000,
                  usedTokens: 70000,
                  cacheHitEnd: 65000,
                  segments: [
                    { id: 'b-sys', label: 'Sys', tokens: 1200, tone: 'green', cached: true },
                    { id: 'b-hist', label: 'Turn 1..11 对话与工具结果 (63.8k)', tokens: 63800, tone: 'blue', cached: true },
                    { id: 'b-t12', label: 'Turn 12', tokens: 5000, tone: 'orange' },
                  ],
                },
                {
                  id: 'pc-after',
                  title: 'Turn 13 · 原地改写头部 System Prompt（缓存雪崩！）',
                  subtitle: '哪怕只多 1 个工具定义，后续 68.8k 历史全部失效',
                  totalBudget: 128000,
                  usedTokens: 74000,
                  segments: [
                    { id: 'a-sys', label: '头部被改!', tokens: 1400, tone: 'rose' },
                    { id: 'a-miss', label: '68.6k 历史缓存全部失效 (Cache Miss)', tokens: 68600, tone: 'rose' },
                    { id: 'a-t13', label: 'Turn 13', tokens: 4000, tone: 'orange' },
                  ],
                },
              ],
              calloutBadges: [
                { label: '命中率断崖', value: '92.9% → 0%', tone: 'rose' },
                { label: '无效重算', value: '+68,600 tok', tone: 'rose' },
                { label: '铁律', value: '绝不轻易改写 Token 0 前缀', tone: 'orange' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: '超短 XML 前缀',
            badge: 'SOLUTION',
            title: '第一道防线：system-prompt.ts 超短模块化静态 XML 前缀',
            paragraphs: [
              'Pi 的缓存稳定术始于 **把头部做到极致精简且高度稳定**。在 Mario Zechner 2025 年 11 月的基线实测中，Pi 的整个 System Prompt 加上 4 个核心工具定义合计不到 **1,000 tokens**；在演进后的现代 `packages/coding-agent/src/core/system-prompt.ts` 中，提示词被结构化拆分为清晰的 XML 模块：`preamble`、`<tools>`、`<rules>`、`<docs>`、`<addendum>`、`<project_context>`（来自 `AGENTS.md`）、`<skills>`（仅放索引清单！）与 `<cwd>`。',
              '更关键的是「克制清单」：头部里故意 **不放秒级跳动时钟、不放易变任务进度条、不放 26 工具的庞大 MCP Schema**。启动定型之后，这块轻量 XML 静态前缀就成为整场会话岿然不动的缓存锚点。',
            ],
            callout: {
              kind: 'idea',
              title: '模块化 XML 的双重价值',
              text: 'XML 标签既让模型清晰分辨规则、项目上下文与工作目录，又为后续的 `diffSystemPromptSections` 按块精准做 Diff 铺平了道路！',
            },
            diffs: [
              { kind: 'add', text: '`system-prompt.ts` 按 `preamble / <tools> / <rules> / <project_context> / <skills> / <cwd>` 模块化编排' },
              { kind: 'remove', text: '剔除一切高频抖动字段（实时时间戳、动态任务计数器、全量 MCP 声明）' },
              { kind: 'add', text: '基线 System Prompt + 4 工具仅 `< 1,000 tokens`，启动即锁定稳定缓存锚点' },
            ],
            sourceDrawer: {
              title: 'system-prompt.ts 的 XML 模块化分区结构',
              filePath: 'packages/coding-agent/src/core/system-prompt.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/system-prompt.ts',
              language: 'ts',
              code: `// packages/coding-agent/src/core/system-prompt.ts — 稳定可 Diff 的 XML 分区
export interface SystemPromptSections {
  preamble: string;         // 极简角色定位
  tools: string;            // 4 个默认核心工具使用指引
  rules: string;            // 精炼编码纪律
  docs?: string;            // 按需查阅文档索引
  addendum?: string;        // 自定义补充指令
  project_context?: string; // 来自 AGENTS.md 的项目上下文
  skills?: string;          // 渐进式披露：仅含 name + description + path
  cwd: string;              // 工作目录锚点
}`,
              caption: '按语义命名分区，既便于阅读与覆盖，更是下一节「增量 Section Diff」的直接数据结构基础。',
            },
            kpis: [
              { label: '基线前缀规模', value: '< 1,000 tok', status: 'good' },
              { label: '核心 XML 分区', value: '6~8 稳定块', status: 'good' },
              { label: '高频抖动字段', value: '0 个', status: 'good' },
              { label: 'Skills 启动加载', value: '仅索引清单', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: '核心指令与工具分区（常驻缓存）' },
              { color: '#3c6ea8', label: '项目 AGENTS.md 上下文' },
              { color: '#6f4ea3', label: 'Skills 渐进式索引与目录锚点' },
            ],
            scene: {
              kind: 'token-slices',
              title: '静态前缀放大视图：模块化 XML 分区（全段常驻 KV Cache）',
              tracks: [
                {
                  id: 'sp-zoom',
                  title: 'Pi 静态 XML 前缀构成（放大刻度 · 2,000 tok 视野）',
                  subtitle: 'Mario 2025 基线（Prompt + 4 工具）实测 < 1,000 tokens；完整项目态亦极度精简',
                  totalBudget: 2000,
                  usedTokens: 1650,
                  cacheHitEnd: 1650,
                  segments: [
                    { id: 'x-pre', label: 'preamble', tokens: 220, tone: 'green', cached: true },
                    { id: 'x-tools', label: '<tools>', tokens: 380, tone: 'green', cached: true },
                    { id: 'x-rules', label: '<rules>', tokens: 260, tone: 'green', cached: true },
                    { id: 'x-proj', label: '<project_context>', tokens: 390, tone: 'blue', cached: true },
                    { id: 'x-skills', label: '<skills>索引', tokens: 260, tone: 'violet', cached: true },
                    { id: 'x-cwd', label: '<cwd>/<docs>', tokens: 140, tone: 'orange', cached: true },
                  ],
                },
              ],
              calloutBadges: [
                { label: 'Pi 基线 (Prompt+4工具)', value: '< 1,000 tokens', tone: 'green' },
                { label: '常见竞品前缀', value: '15,000 ~ 25,000 tokens', tone: 'rose' },
                { label: '前缀可 Diff 粒度', value: 'XML Section 级', tone: 'violet' },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: '中途变更难题',
            badge: 'PROBLEM',
            title: '现实冲突：长对话跑到 Turn 15，用户热加载了新工具怎么办？',
            paragraphs: [
              '如果会话全程一成不变，保缓存很简单。但真实开发场景充满变化：聊到第 15 轮时，用户可能敲 `/reload` 热加载了一个新扩展工具，或插件调用 `setActiveTools()` 启用了只读检索工具，甚至修改了项目指令或切换了工作上下文。',
              '这就把架构师逼进了死角：如果不把新工具/新规则告诉模型，Agent 就会基于过时能力盲目操作；如果直接去改写 Turn 0 的顶部 System Prompt，前 14 轮辛辛苦苦攒下的 70,000 Token 热缓存瞬间灰飞烟灭！',
            ],
            callout: {
              kind: 'idea',
              title: '破局思路转换',
              text: '在不可变日志（Append-only Log）的世界里，更新状态从来不是「回去涂改第 1 页」，而是「在最后一页追加一条增量变更记录」。',
            },
            diffs: [
              { kind: 'change', text: 'Turn 15 出现合法变更：`setActiveTools()` / `/reload` / XML 分区内容更新' },
              { kind: 'remove', text: '原地改写 Turn 0 前缀 → 70k 历史缓存归零，代价不可接受' },
              { kind: 'add', text: '转向尾部追加增量补丁（Delta Patch）路线' },
            ],
            kpis: [
              { label: '变更触发时机', value: 'Turn 15 中途', status: 'warn' },
              { label: '已累积热缓存', value: '70,000 tok', status: 'good' },
              { label: '原地改写代价', value: '100% 缓存击穿', status: 'bad' },
              { label: '尾追加代价', value: '仅 ~180 tok 新算', status: 'good' },
            ],
            legend: [
              { color: '#b94a48', label: '传统方案：涂改头部引发雪崩', dashed: true },
              { color: '#4e7d34', label: 'Pi 方案：尾部追加增量 Patch' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Turn 15 中途变更抉择：涂改前缀 vs 尾部增量 Patch',
              nodes: [
                {
                  id: 'c-trig',
                  x: 175,
                  y: 280,
                  label: 'Turn 15 运行时变更',
                  sublabel: '/reload · setActiveTools · 规则更新',
                  icon: 'sparkles',
                  tone: 'orange',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'c-fork',
                  x: 470,
                  y: 280,
                  label: '更新策略分岔口',
                  sublabel: '如何通知 LLM？',
                  icon: 'git-branch',
                  tone: 'dark',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'c-bad',
                  x: 805,
                  y: 145,
                  label: '原地改写 Turn 0 前缀',
                  sublabel: '70k 缓存瞬间 0% 命中',
                  icon: 'alert',
                  tone: 'rose',
                  size: 'md',
                  meter: { value: 0, label: '缓存命中', status: 'bad' },
                },
                {
                  id: 'c-good',
                  x: 805,
                  y: 415,
                  label: '尾部追加 Δ SystemMessage',
                  sublabel: '前 70k 缓存 100% 原封不动',
                  icon: 'check',
                  tone: 'green',
                  size: 'md',
                  active: true,
                  badge: 'Pi 核心绝技',
                  meter: { value: 100, label: '历史命中', status: 'good' },
                },
              ],
              edges: [
                { from: 'c-trig', to: 'c-fork', label: '状态变化', status: 'active', packetColor: '#b56c27' },
                { from: 'c-fork', to: 'c-bad', label: '涂改头部', status: 'error', dashed: true, packetColor: '#b94a48' },
                { from: 'c-fork', to: 'c-good', label: '尾部增量 Patch', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: '增量 SystemMessage',
            badge: 'SOLUTION',
            title: '核心绝技：用尾部 Delta SystemMessage Patch 锁死 100% 历史缓存',
            paragraphs: [
              '这就是 Pi 最具辨识度的工程绝技（PR `#9548`）：当系统提示分区或可用工具在会话中途发生变化时，Pi **一个字节也不动 Turn 0 的静态前缀**，而是把变化量打包成一条轻巧的 **增量 `SystemMessage` Patch**（仅包含发生变化的 `sections` 差异与 `toolsAdded` / `toolsRemoved`），直接 **追加到消息流尾部**！',
              '从 LLM 供应商的 KV Cache 视角看，从 Token 0 到 Token 70,000 依然 **逐字节完全一致**，命中率稳稳钉在 100%；模型只需要为尾部那两百来个 Token 的增量补丁和 Turn 15 新消息支付一次新鲜 Prefill，便能立刻掌握新加载的工具与规则。',
            ],
            callout: {
              kind: 'idea',
              title: '把可变性推到时间线最右侧',
              text: '前缀缓存优化的最高心法只有八个字：**静态放左，变更追右**。增量 `SystemMessage` 让工具热插拔与高缓存命中率不再互斥。',
            },
            diffs: [
              { kind: 'add', text: '尾部追加携带 `sections` 差异与 `toolsAdded`/`toolsRemoved` 的增量 `SystemMessage`' },
              { kind: 'change', text: 'Turn 0..14 共 70,000 Tokens 保持逐字节不变，KV Cache 100% 命中' },
              { kind: 'add', text: '单轮新鲜 Prefill 开销从 74,000 Tokens 骤降至仅 6,000 Tokens' },
            ],
            sourceDrawer: {
              title: '增量 SystemMessage Patch 载荷示例（不改前缀）',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts',
              language: 'json',
              code: `{
  "role": "system",
  "timestamp": 1763560920000,
  "sections": {
    "rules": "本次修改禁止改动 public API 签名，必须补充单测。"
  },
  "toolsAdded": [
    {
      "name": "grep",
      "description": "Search file contents using ripgrep",
      "parameters": { "type": "object", "properties": { "pattern": { "type": "string" } } }
    }
  ],
  "toolsRemoved": ["write"]
}`,
              caption: '仅声明本轮新增/移除的工具与变更分区，追加于对话尾部，前 70k 缓存纹丝不动。',
            },
            kpis: [
              { label: '历史前缀命中', value: '70,000 / 70,000 (100%)', status: 'good' },
              { label: 'Delta Patch 体积', value: '极小增量', status: 'good' },
              { label: '本轮整体命中率', value: '92.1%', status: 'good' },
              { label: '工具热插拔能力', value: '即时生效', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: '原封不动的 KV Cache 命中前缀' },
              { color: '#6f4ea3', label: '尾部追加 Δ SystemMessage Patch' },
              { color: '#3c6ea8', label: 'Turn 15 本轮新消息' },
            ],
            scene: {
              kind: 'token-slices',
              title: 'Pi 增量 Patch：前 70k 字节级锁定，变更仅以轻量 Δ 追加在尾部',
              tracks: [
                {
                  id: 'dp-14',
                  title: 'Turn 14 · 变更前基线',
                  subtitle: '70,000 tokens 已全部预热进入 KV Cache',
                  totalBudget: 128000,
                  usedTokens: 70000,
                  cacheHitEnd: 70000,
                  segments: [
                    { id: 'd14-sys', label: 'Sys', tokens: 1200, tone: 'green', cached: true },
                    { id: 'd14-hist', label: 'Turn 1..14 全部历史 (68.8k)', tokens: 68800, tone: 'blue', cached: true },
                  ],
                },
                {
                  id: 'dp-15',
                  title: 'Turn 15 · 热加载 grep 工具并更新规则（尾部追加 Patch）',
                  subtitle: 'cacheHitEnd 稳停 70,000！仅尾部 Δ + 本轮消息需新算',
                  totalBudget: 128000,
                  usedTokens: 76000,
                  cacheHitEnd: 70000,
                  segments: [
                    { id: 'd15-sys', label: 'Sys', tokens: 1200, tone: 'green', cached: true },
                    { id: 'd15-hist', label: 'Turn 1..14 原封不动 (100% 命中)', tokens: 68800, tone: 'blue', cached: true },
                    { id: 'd15-patch', label: 'Δ Patch', tokens: 2000, tone: 'violet', delta: true },
                    { id: 'd15-msg', label: 'Turn 15', tokens: 4000, tone: 'orange' },
                  ],
                },
              ],
              calloutBadges: [
                { label: '对比改写前缀节省', value: '68,800 tok/轮', tone: 'green' },
                { label: '变更形态', value: 'toolsAdded / toolsRemoved + sections', tone: 'violet' },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: 'Diff 与声明引擎',
            badge: 'TECHNIQUE',
            title: '自动追踪引擎：diffSystemPromptSections + declareToolChanges',
            paragraphs: [
              '开发者和扩展作者不需要手动拼装增量 `SystemMessage`——Pi 在两层协作中把这件事完全自动化了。在 `pi-coding-agent` 层，`diffSystemPromptSections` 对比上一轮已下发的 XML 分区快照与当前最新分区，只把真正有差异的节抽出来。',
              '而在 `pi-agent-core`（`agent-loop.ts`）中，**每个 Turn 进入 `prepareRequest` 之前都会自动运行 `declareToolChanges(currentContext, messages)`**：比对 `context.tools` 集合与先前已声明的工具清单，若有增减便精准生成包含 `toolsAdded` / `toolsRemoved` 的增量 `SystemMessage`；若无任何变化则零输出、零开销。',
            ],
            callout: {
              kind: 'tip',
              title: '无变化 = 0 字节开销',
              text: '在绝大多数平静的连续工具调用 Turn 里，两套 Diff 引擎都检测到空集合，直接跳过，不向消息流写入任何多余字符。',
            },
            diffs: [
              { kind: 'add', text: '`diffSystemPromptSections`：按 XML Section 级精确比对文本变更' },
              { kind: 'add', text: '`declareToolChanges`：在 `agent-loop.ts` 内层循环每轮自动计算 `toolsAdded`/`toolsRemoved`' },
              { kind: 'add', text: '由 `pi-ai` `normalizeContext` 统一编码下发，屏蔽厂商协议细节' },
            ],
            kpis: [
              { label: '提示词 Diff 引擎', value: 'diffSystemPromptSections', status: 'good' },
              { label: '工具 Diff 引擎', value: 'declareToolChanges', status: 'good' },
              { label: '无变更时开销', value: '0 tokens', status: 'good' },
              { label: '手工拼装负担', value: '0 行 (全自动)', status: 'good' },
            ],
            legend: [
              { color: '#6f4ea3', label: 'XML 分区与工具快照比对' },
              { color: '#4e7d34', label: '有变化才注入尾部 Delta' },
              { color: '#6f6961', label: '无变化直接零开销跳过', dashed: true },
            ],
            scene: {
              kind: 'iso-flow',
              title: '双 Diff 协作引擎：自动产出最小充分增量 SystemMessage',
              nodes: [
                {
                  id: 'df-prev',
                  x: 165,
                  y: 165,
                  label: '上轮已声明快照',
                  sublabel: 'prevSections & prevTools',
                  icon: 'database',
                  tone: 'neutral',
                  size: 'md',
                },
                {
                  id: 'df-curr',
                  x: 165,
                  y: 395,
                  label: '当前最新状态',
                  sublabel: 'nextSections & context.tools',
                  icon: 'sparkles',
                  tone: 'orange',
                  size: 'md',
                },
                {
                  id: 'df-engine',
                  x: 485,
                  y: 280,
                  label: '双 Diff 协作引擎',
                  sublabel: 'diffSections + declareToolChanges',
                  icon: 'code',
                  tone: 'violet',
                  size: 'lg',
                  active: true,
                  badge: '每轮自动检查',
                },
                {
                  id: 'df-noop',
                  x: 825,
                  y: 155,
                  label: '无变化 → 零输出',
                  sublabel: '0 Token 额外消耗',
                  icon: 'check',
                  tone: 'neutral',
                  size: 'sm',
                  dimmed: true,
                },
                {
                  id: 'df-emit',
                  x: 825,
                  y: 400,
                  label: '尾部插入 Δ SystemMessage',
                  sublabel: '交由 normalizeContext 下发',
                  icon: 'layers',
                  tone: 'green',
                  size: 'md',
                  active: true,
                },
              ],
              edges: [
                { from: 'df-prev', to: 'df-engine', label: '基线', status: 'normal', packetColor: '#6f6961' },
                { from: 'df-curr', to: 'df-engine', label: '新态', status: 'active', packetColor: '#b56c27' },
                { from: 'df-engine', to: 'df-noop', label: 'diff 为空', status: 'dimmed', dashed: true, packetColor: '#6f6961' },
                { from: 'df-engine', to: 'df-emit', label: '存在变更', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: 'TTL 保温与写关闭',
            badge: 'TECHNIQUE',
            title: '收支双控：cache-warmer.ts 保温续命 + 一次性摘要禁用写缓存',
            paragraphs: [
              '前缀稳住了，缓存经济学还有最后两道精细账。第一道是 **过期浪费**：主流云端 KV Cache 通常有较短的 TTL（例如 5 分钟）。如果你停下来认真读 6 分钟代码再继续提问，刚刚完美的 70k 热缓存已经自然过期！为此 Pi 配备了 `cache-warmer.ts`（在会话账本中记为 `UsageEntry` `kind: "cache_warm"`），按需维持活跃会话的缓存热度。',
              '第二道恰恰相反——**别为一次性调用付写缓存溢价**：供应商对“写入新缓存（Cache Creation）”通常会加收 25% 以上溢价。在做 **非破坏性压缩（Compaction）** 或 **分支摘要（Branch Summary）** 时，摘要 Prompt 只用一次、未来绝不会再作为前缀复用，因此 Pi 在摘要调用中 **显式关闭缓存写入**，把每一分钱都花在刀刃上。',
            ],
            callout: {
              kind: 'idea',
              title: '两面精算：该暖的暖，该关的关',
              text: '主会话高频复用 → 用 `cache_warm` 锁住 TTL 红利；一次性摘要绝不复用 → 主动关闭 Cache Write 免交 25% 写缓存冤枉钱！',
            },
            diffs: [
              { kind: 'add', text: '`cache-warmer.ts` 维护主会话缓存 TTL，独立记录 `UsageEntry` `kind: "cache_warm"`' },
              { kind: 'remove', text: '在 Compaction 与 Branch Summarization 调用中显式禁用缓存写入' },
            ],
            sourceDrawer: {
              title: '缓存保温记账与一次性摘要禁用写缓存策略',
              filePath: 'packages/coding-agent/src/core/compaction/compaction.ts',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/compaction/compaction.ts',
              language: 'ts',
              code: `// 1) 主会话保温（cache-warmer.ts）：独立记账，防止阅读代码期间 TTL 过期
interface CacheWarmUsageEntry {
  type: "usage";
  kind: "cache_warm"; // 与正常 turn 消耗区分，账单透明可审计
  usage: TokenUsage;
}

// 2) 压缩 / 分支摘要（compaction.ts）：一次性 Prompt 永不复用，显式关闭缓存写入
const summaryResponse = await completeSummary({
  model,
  messages: summaryMessages,
  cacheRetention: "none", // 避免为一次性摘要支付 Cache Creation 溢价
});`,
              caption: '把缓存视为需要精细运营的资产：主对话积极保温，一次性侧路任务果断关闭写缓存。',
            },
            kpis: [
              { label: '主会话保温机制', value: 'cache-warmer.ts', status: 'good' },
              { label: '保温账本类型', value: 'kind: "cache_warm"', status: 'neutral' },
              { label: '摘要写缓存策略', value: '显式关闭', status: 'good' },
              { label: '写缓存溢价浪费', value: '0%', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: '主对话：cache_warm 维持热缓存' },
              { color: '#3c6ea8', label: '侧路摘要：禁用写缓存免溢价' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '缓存全生命周期精算：主会话保温 vs 一次性摘要禁写',
              zones: [
                {
                  id: 'z-warm',
                  x: 70,
                  y: 65,
                  w: 860,
                  h: 195,
                  label: '主对话热通道 · 复用率极高 → 主动保温',
                  tone: 'green',
                },
                {
                  id: 'z-cold',
                  x: 70,
                  y: 288,
                  w: 860,
                  h: 210,
                  label: '侧路一次性摘要 · 复用率为 0 → 关闭写缓存',
                  tone: 'blue',
                  dashed: true,
                },
              ],
              nodes: [
                {
                  id: 'cw-idle',
                  x: 190,
                  y: 165,
                  label: '人类阅读代码停顿',
                  sublabel: '逼近 5min TTL 边缘',
                  icon: 'clock',
                  tone: 'orange',
                  size: 'md',
                },
                {
                  id: 'cw-warm',
                  x: 500,
                  y: 165,
                  label: 'cache-warmer.ts',
                  sublabel: 'UsageEntry kind: "cache_warm"',
                  icon: 'zap',
                  tone: 'green',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'cw-hit',
                  x: 810,
                  y: 165,
                  label: '70k 热缓存续命',
                  sublabel: '恢复提问秒出首字',
                  icon: 'check',
                  tone: 'green',
                  size: 'sm',
                },
                {
                  id: 'cc-sum',
                  x: 190,
                  y: 392,
                  label: 'Compaction / 分支摘要',
                  sublabel: '一次性总结 Prompt',
                  icon: 'git-branch',
                  tone: 'violet',
                  size: 'md',
                },
                {
                  id: 'cc-off',
                  x: 500,
                  y: 392,
                  label: '显式关闭 Cache Write',
                  sublabel: '不创建短命缓存槽位',
                  icon: 'shield',
                  tone: 'blue',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'cc-save',
                  x: 810,
                  y: 392,
                  label: '免除 25%+ 写溢价',
                  sublabel: '成本精准可控',
                  icon: 'sparkles',
                  tone: 'blue',
                  size: 'sm',
                },
              ],
              edges: [
                { from: 'cw-idle', to: 'cw-warm', label: '保活心跳', status: 'active', packetColor: '#b56c27' },
                { from: 'cw-warm', to: 'cw-hit', label: '刷新 TTL', status: 'active', packetColor: '#4e7d34', packetCount: 2 },
                { from: 'cc-sum', to: 'cc-off', label: '侧路请求', status: 'active', packetColor: '#6f4ea3' },
                { from: 'cc-off', to: 'cc-save', label: '常规输入价', status: 'active', packetColor: '#3c6ea8' },
              ],
            },
          },

          // Step 7
          {
            stepNumber: 7,
            shortLabel: '命中率对比曲线',
            badge: 'INSIGHT',
            title: '20 轮实景推演：传统前缀改写 vs Pi 增量 Patch 命中率曲线',
            paragraphs: [
              '把一场真实 20 轮编码会话画成曲线，差距立刻一目了然：假设在第 5、10、15 轮分别发生一次上下文或工具变更（如按需启用工具、加载规则或热重载扩展）。',
              '**传统前缀改写** 每次变更都会把命中率一脚踹回 `0%`，形成刺眼的锯齿深谷，整场平均缓存命中率跌破 50%；而 **Pi 增量 Patch** 始终把变更追加在右侧尾部，缓存命中率沿对数曲线稳步攀升并牢牢锁死在 **91%–96%** 高原区间！',
            ],
            callout: {
              kind: 'idea',
              title: '长会话越久，红利越大',
              text: '对话越深入，历史上下文占比越高。稳定住 94% 以上的缓存命中率，意味着 20 轮复杂排错的真实 Token 账单可以比锯齿方案省下一半以上，且每轮响应都如丝般顺滑。',
            },
            diffs: [
              { kind: 'add', text: 'Turn 5 / 10 / 15 三次中途工具与规则变更，Pi 命中率均稳居 91%–94%' },
              { kind: 'remove', text: '传统方案在每次变更点命中率骤降归零，反复重算 40k–80k 历史' },
            ],
            kpis: [
              { label: 'Pi Turn 15 命中率', value: '94.0%', status: 'good' },
              { label: '传统方案 Turn 15', value: '0.0% (击穿)', status: 'bad' },
              { label: '20 轮均值对比', value: '~88% vs ~48%', status: 'good' },
              { label: '单轮未命中尾长', value: '仅 Δ + 当轮', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: 'Pi 增量 Patch 命中率曲线（稳态高原）' },
              { color: '#b94a48', label: '传统改写前缀命中率曲线（锯齿雪崩）' },
            ],
            scene: {
              kind: 'token-slices',
              title: '20 轮长会话 KV Cache 命中率对比（Turn 5 / 10 / 15 发生中途变更）',
              tracks: [
                {
                  id: 'cmp-t15',
                  title: 'Turn 15 稳态快照 · Pi 增量 Patch（94.0% 命中）',
                  subtitle: '78,000 / 83,000 tokens 直接走 KV Cache',
                  totalBudget: 128000,
                  usedTokens: 83000,
                  cacheHitEnd: 78000,
                  segments: [
                    { id: 'c15-sys', label: 'Sys', tokens: 1200, tone: 'green', cached: true },
                    { id: 'c15-h', label: 'Turn 1..14 稳定缓存前缀 (76.8k)', tokens: 76800, tone: 'blue', cached: true },
                    { id: 'c15-d', label: 'Δ', tokens: 1200, tone: 'violet', delta: true },
                    { id: 'c15-n', label: 'T15', tokens: 3800, tone: 'orange' },
                  ],
                },
              ],
              calloutBadges: [
                { label: 'Pi 命中高原', value: '91% ~ 96%', tone: 'green' },
                { label: '传统锯齿谷底', value: '0% (×3 次雪崩)', tone: 'rose' },
              ],
              miniChart: {
                title: 'Prompt Cache 命中率走势：Pi 增量 Patch vs 传统改写前缀',
                xLabel: '对话轮次 (Turn)',
                yLabel: '缓存命中率 (%)',
                highlightX: 15,
                highlightNote: 'Turn 15 工具变更：Pi 仍保持 94% 命中，传统方案归零',
                series: [
                  {
                    label: 'Pi 增量 Patch',
                    color: '#4e7d34',
                    points: [
                      [1, 0],
                      [2, 68],
                      [4, 86],
                      [5, 91],
                      [8, 94],
                      [10, 93],
                      [14, 95],
                      [15, 94],
                      [20, 96],
                    ],
                  },
                  {
                    label: '传统改写前缀',
                    color: '#b94a48',
                    points: [
                      [1, 0],
                      [2, 68],
                      [4, 86],
                      [5, 0],
                      [8, 72],
                      [10, 0],
                      [14, 78],
                      [15, 0],
                      [20, 74],
                    ],
                  },
                ],
              },
            },
          },

          // Step 8
          {
            stepNumber: 8,
            shortLabel: '缓存稳定术复盘',
            badge: 'RECAP',
            title: '复盘：Pi Prompt Cache 四柱稳定术',
            paragraphs: [
              'Prompt Caching 绝不是“加一个参数开关”就能自动享受到的免费午餐，而是一套贯穿系统提示词设计、消息管线与后台任务的系统工程。',
              'Pi 用四根支柱把它打造成本能：**超短静态 XML 前缀** 夯实锚点、**`diffSystemPromptSections` + `declareToolChanges` 尾部增量 Patch** 保护历史、**`cache-warmer.ts`** 防止阅读间歇过期、**摘要任务禁用写缓存** 杜绝无谓溢价。四柱合力，才换来 90%+ 的稳态命中率。',
            ],
            callout: {
              kind: 'idea',
              title: '迈向第 05 章',
              text: '即便缓存命中率再高，对话终究会撞上上下文窗口的天花板。第 05 章我们将进入 `SessionManager`：看 Pi 如何把整场会话存成一棵 **追加写 JSONL v3 树**，并完成永不删史的非破坏性压缩！',
            },
            recapTable: [
              {
                question: '为什么头部 System Prompt 绝不能塞入时间戳等易变信息？',
                decision: '采用 `system-prompt.ts` 超短模块化静态 XML 前缀（基线 `< 1k tok`）',
                because: '前缀 KV Cache 逐 Token 严格匹配，改动头部 1 字节就会引发全段历史缓存雪崩。',
              },
              {
                question: '会话中途热加载工具或修改规则时，如何不击穿缓存？',
                decision: '用 `diffSystemPromptSections` + `declareToolChanges` 尾部追加 Δ `SystemMessage`',
                because: '让前序数万 Tokens 逐字节保持不变，仅对尾部小增量支付新鲜 Prefill。',
              },
              {
                question: '人类停下来读代码超过 5 分钟导致缓存自然过期怎么办？',
                decision: '启用 `cache-warmer.ts` 保活并在会话账本独立记为 `kind: "cache_warm"`',
                because: '以极小保活成本锁住长会话热缓存，恢复交互立刻秒回。',
              },
              {
                question: '做 Compaction 或分支摘要时要不要开启缓存写入？',
                decision: '显式禁用缓存写入（Cache Write Off）',
                because: '一次性摘要 Prompt 未来永不复用，禁写可直接省去 25%+ 的写缓存溢价。',
              },
            ],
            kpis: [
              { label: '支柱 1 · 静态锚点', value: '超短 XML 前缀', status: 'good' },
              { label: '支柱 2 · 中途更新', value: '尾部 Δ Patch', status: 'good' },
              { label: '支柱 3 · TTL 保活', value: 'cache_warm', status: 'good' },
              { label: '支柱 4 · 侧路控费', value: '摘要禁写缓存', status: 'good' },
            ],
            legend: [
              { color: '#4e7d34', label: '前缀稳定与高命中核心' },
              { color: '#6f4ea3', label: '自动 Diff 增量补丁' },
              { color: '#3c6ea8', label: 'TTL 保温与成本精算' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '全景图：Pi Prompt Cache 四柱稳定工程体系',
              nodes: [
                {
                  id: 'pr-1',
                  x: 175,
                  y: 160,
                  label: '1. 超短 XML 静态前缀',
                  sublabel: '基线 <1k · 零易变字段',
                  icon: 'file',
                  tone: 'green',
                  size: 'md',
                },
                {
                  id: 'pr-2',
                  x: 175,
                  y: 395,
                  label: '2. 尾部 Δ SystemMessage',
                  sublabel: 'diffSections + declareTools',
                  icon: 'sparkles',
                  tone: 'violet',
                  size: 'md',
                  active: true,
                },
                {
                  id: 'pr-hub',
                  x: 500,
                  y: 280,
                  label: '94%+ 稳态 KV Cache',
                  sublabel: '低延迟 · 省一半以上输入成本',
                  icon: 'zap',
                  tone: 'dark',
                  size: 'lg',
                  active: true,
                  badge: '缓存稳定术',
                  meter: { value: 94, label: '稳态命中', status: 'good' },
                },
                {
                  id: 'pr-3',
                  x: 825,
                  y: 160,
                  label: '3. cache-warmer.ts',
                  sublabel: 'kind: "cache_warm" 续 TTL',
                  icon: 'clock',
                  tone: 'orange',
                  size: 'md',
                },
                {
                  id: 'pr-4',
                  x: 825,
                  y: 395,
                  label: '4. 侧路摘要禁写缓存',
                  sublabel: '免除一次性 25%+ 溢价',
                  icon: 'shield',
                  tone: 'blue',
                  size: 'md',
                },
              ],
              edges: [
                { from: 'pr-1', to: 'pr-hub', label: '锁定左端', status: 'active', packetColor: '#4e7d34' },
                { from: 'pr-2', to: 'pr-hub', label: '变更追右', status: 'active', packetColor: '#6f4ea3', packetCount: 2 },
                { from: 'pr-3', to: 'pr-hub', label: '防过期', status: 'active', packetColor: '#b56c27' },
                { from: 'pr-4', to: 'pr-hub', label: '防溢价', status: 'active', packetColor: '#3c6ea8' },
              ],
            },
          },
        ],
      },
    ],
  },
];
