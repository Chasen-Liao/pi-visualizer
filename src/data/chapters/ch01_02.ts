import type { Chapter } from '../../types/lesson';

// ============================================================================
// Chapters 01 & 02 — Pi Coding Agent (earendil-works/pi, formerly badlogic/pi-mono)
// Verified directly against https://github.com/earendil-works/pi (main branch)
// and Mario Zechner's official blog post (2025-11-30).
// ============================================================================

const PALETTE = {
  green: '#5c9442',
  blue: '#4678b2',
  violet: '#7b56ae',
  orange: '#cf7d2e',
  rose: '#c9534d',
  teal: '#3b8b7e',
  rust: '#d0683a',
} as const;

export const CHAPTERS_01_02: Chapter[] = [
  // ==========================================================================
  // CHAPTER 01: 设计哲学与分层
  // ==========================================================================
  {
    id: 'ch01',
    number: 1,
    title: '设计哲学与分层',
    color: 'sage',
    lessons: [
      // ----------------------------------------------------------------------
      // LESSON 1: why-pi (8 steps)
      // ----------------------------------------------------------------------
      {
        id: 'lesson-01-why-pi',
        slug: 'why-pi',
        chapterId: 'ch01',
        chapterNumber: 1,
        chapterTitle: '设计哲学与分层',
        lessonIndexInChapter: 1,
        totalInChapter: 2,
        title: '为什么 Pi 敢做“反框架”？',
        subtitle:
          '拆解 Mario Zechner 的极简工程哲学：4 把基础工具、<1,000 Token 基线提示词与刻意留白',
        durationMin: 6,
        level: '入门',
        objectives: [
          {
            id: 'why-1',
            text: '识别重型商业 Agent Harness 的上下文膨胀与黑盒注入痛点',
            completedAtStep: 2,
          },
          {
            id: 'why-2',
            text: '掌握 Pi 极简内核：`read` / `bash` / `edit` / `write` 4 工具与超短提示词',
            completedAtStep: 3,
          },
          {
            id: 'why-3',
            text: '理解为什么刻意省略内置 Plan Mode、Sub-agents、To-dos 与权限弹窗',
            completedAtStep: 6,
          },
          {
            id: 'why-4',
            text: '消歧中文社区“派 / Pi Agent”指代，区分 `earendil-works/pi` 与同名项目',
            completedAtStep: 7,
          },
          {
            id: 'why-5',
            text: '应用“小内核 + 可编程边缘”原则权衡内置特性与扩展边界',
            completedAtStep: 8,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: '重型框架膨胀',
            badge: 'PROBLEM',
            title: '还没写一行代码，上下文已被框架吃掉 18%',
            paragraphs: [
              '主流商业编码助手常从简洁 CLI 起步，却在数月内演变成“失控宇宙飞船”：上万 Token 的庞大系统提示词、几十个重叠工具定义、启动即全量挂载的 MCP Schema，以及隐藏状态指令。',
              'Mario Zechner 在 2025 年底的复盘中测算过：仅 Playwright MCP（21 工具）就占 `13.7k` Token，Chrome DevTools MCP（26 工具）占 `18k` Token——在 200k 窗口里，用户还没敲下第一条提示，宝贵注意力与预算就先蒸发 7%～18%。',
            ],
            callout: {
              kind: 'warn',
              title: '注意力税与上下文腐化',
              text: '系统提示词和工具 Schema 会在**每一轮**请求中重复出现。塞进 30 个当前用不到的工具，不仅烧钱，还会让模型在“选哪个工具”上分心。',
            },
            diffs: [
              { kind: 'remove', text: '重型 Harness：10k+ 系统提示词 + 全量 MCP Schema 前置灌入' },
              { kind: 'add', text: 'Pi 极简基线：系统提示词 + 4 工具定义合计 <1,000 Token' },
            ],
            kpis: [
              { label: '重型启动开销', value: '~36k tok', status: 'bad' },
              { label: 'Pi 基线开销', value: '<1k tok', status: 'good' },
              { label: 'Playwright MCP', value: '13.7k tok', status: 'warn' },
              { label: 'DevTools MCP', value: '18k tok', status: 'bad' },
            ],
            legend: [
              { color: PALETTE.rose, label: '高膨胀基线开销' },
              { color: PALETTE.orange, label: '前置工具 Schema' },
              { color: PALETTE.green, label: 'Pi 极简内核' },
            ],
            scene: {
              kind: 'token-slices',
              title: 'Turn 1 发送前：200k 上下文窗口预占对比',
              tracks: [
                {
                  id: 'bloated',
                  title: '典型重型商业 Harness',
                  subtitle: '海量规则 + 多套预载 MCP + 隐藏提示注入',
                  totalBudget: 200000,
                  usedTokens: 43700,
                  segments: [
                    { id: 'b-sys', label: '巨型 Prompt', tokens: 10000, tone: 'rose' },
                    { id: 'b-pw', label: 'Playwright MCP (21)', tokens: 13700, tone: 'orange' },
                    { id: 'b-cdp', label: 'DevTools MCP (26)', tokens: 18000, tone: 'orange' },
                    { id: 'b-usr', label: '首条任务', tokens: 2000, tone: 'blue' },
                  ],
                },
                {
                  id: 'pi-min',
                  title: 'Pi Coding Agent 基线',
                  subtitle: '超短核心提示 + 4 工具 + 按需加载',
                  totalBudget: 200000,
                  usedTokens: 2950,
                  cacheHitEnd: 950,
                  segments: [
                    { id: 'p-sys', label: '基线+4工具', tokens: 950, tone: 'green', cached: true },
                    { id: 'p-usr', label: '首条任务', tokens: 2000, tone: 'blue' },
                  ],
                },
              ],
              calloutBadges: [
                { label: '首轮节省上下文', value: '~40,750 tok', tone: 'green' },
                { label: 'Pi 初始占比', value: '< 0.5%', tone: 'blue' },
                { label: '重型初始占比', value: '21.8%', tone: 'rose' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: '黑盒注入痛点',
            badge: 'PROBLEM',
            title: '隐式黑盒改写，让你无法做真正的上下文工程',
            paragraphs: [
              '比 Token 浪费更致命的是**不可观测性**。许多闭源工具会在后台悄悄改写提示词、静默拉起不可见的子代理、或随周更版本改动内置工具行为，却不把发给模型的真实上下文展示给开发者。',
              '当 Agent 突然变笨或改坏代码时，你根本无从判断是模型退化，还是框架在背后夹带了私货。Pi 的起点很朴素：发给大模型的每一个字节都必须透明、可检查、可由用户完全掌控。',
            ],
            callout: {
              kind: 'idea',
              title: '核心诉求：Transparency First',
              text: 'Mario Zechner 提出“让 Harness 适配你的工作流，而不是强迫你的工作流迁就 Harness”——前提是你看得见、改得动上下文边界。',
            },
            diffs: [
              { kind: 'remove', text: '隐藏提示词改写、不可见子代理黑盒、版本静默漂移' },
              { kind: 'add', text: '透明 JSONL 会话转录 + 可审查的 `SystemMessage` 组装' },
            ],
            kpis: [
              { label: '上下文透明度', value: '黑盒', status: 'bad' },
              { label: '排障成本', value: '极高', status: 'bad' },
              { label: '行为稳定性', value: '随版本漂移', status: 'warn' },
              { label: '可定制粒度', value: '受限开关', status: 'warn' },
            ],
            legend: [
              { color: PALETTE.rose, label: '隐藏拦截/黑盒改写层' },
              { color: PALETTE.orange, label: '不可控隐式状态', dashed: true },
            ],
            scene: {
              kind: 'iso-flow',
              title: '传统重型 Harness：用户与模型之间堆满黑盒层',
              zones: [
                {
                  id: 'opaque-box',
                  x: 310,
                  y: 75,
                  w: 400,
                  h: 390,
                  label: '不透明黑盒中间层（用户不可见）',
                  tone: 'rose',
                  dashed: true,
                },
              ],
              nodes: [
                {
                  id: 'user',
                  x: 150,
                  y: 270,
                  label: '开发者输入',
                  sublabel: '原始意图',
                  icon: 'user',
                  tone: 'blue',
                },
                {
                  id: 'rewriter',
                  x: 420,
                  y: 165,
                  label: '隐式 Prompt 注入',
                  sublabel: '每次更新静默变化',
                  icon: 'alert',
                  tone: 'rose',
                  active: true,
                },
                {
                  id: 'subagent',
                  x: 600,
                  y: 270,
                  label: '黑盒 Sub-agent',
                  sublabel: '中间对话不可见',
                  icon: 'box',
                  tone: 'orange',
                  active: true,
                },
                {
                  id: 'perm',
                  x: 420,
                  y: 380,
                  label: '隐藏状态与弹窗',
                  sublabel: 'To-do / 审批摩擦',
                  icon: 'shield',
                  tone: 'rose',
                },
                {
                  id: 'llm',
                  x: 840,
                  y: 270,
                  label: 'LLM Provider',
                  sublabel: '收到陌生上下文',
                  icon: 'brain',
                  tone: 'dark',
                },
              ],
              edges: [
                { from: 'user', to: 'rewriter', label: '被改写', packetColor: PALETTE.rose, status: 'error' },
                { from: 'user', to: 'perm', dashed: true, packetColor: PALETTE.orange },
                { from: 'rewriter', to: 'subagent', label: '隐式转交', packetColor: PALETTE.orange, status: 'error' },
                { from: 'perm', to: 'subagent', dashed: true, packetColor: PALETTE.rose },
                { from: 'subagent', to: 'llm', label: '污染载荷', packetColor: PALETTE.rose, status: 'error' },
              ],
              callouts: [
                { x: 510, y: 500, text: '出错时无法追溯模型到底看到了什么', tone: 'rose' },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: '极简四工具内核',
            badge: 'SOLUTION',
            title: 'Pi 的反直觉押注：4 把核心工具 + 超短系统提示词',
            paragraphs: [
              'Pi 的核心判断非常锋利：现代前沿模型在后训练（RL）阶段早已深刻理解“什么是编码代理”，根本不需要 10,000 Token 的保姆式说教。',
              '因此 `pi-coding-agent` 默认只装载 4 把原子工具——`read`、`bash`、`edit`、`write`，配合模块化、超短的 `system-prompt.ts`（原始基线与 4 工具定义合计不到 `1,000` Token），在 Terminal-Bench 2.0 上搭配 Claude Opus 4.5 依然与重量级商业 Harness 正面抗衡。',
            ],
            callout: {
              kind: 'tip',
              title: '项目指令依然可扩展',
              text: '极简基线不等于无法定制：Pi 会按层级发现全局与项目的 `AGENTS.md`，拼装进 `<project_context>` 段落，一切清晰可见。',
            },
            diffs: [
              { kind: 'add', text: '`createCodingTools()`: 默认仅启用 `read`、`bash`、`edit`、`write`' },
              { kind: 'add', text: '`buildSystemPromptSections()`: 精简 `preamble` + `<tools>` + `<rules>` + `<cwd>`' },
            ],
            sourceDrawer: {
              title: '默认 4 工具与极简 Preamble 源码',
              filePath: 'packages/coding-agent/src/core/system-prompt.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/system-prompt.ts',
              language: 'ts',
              code: `// packages/coding-agent/src/core/system-prompt.ts
selectedTools: [...(input.selectedTools ?? ["read", "bash", "edit", "write"])]

promptSections.preamble =
  "You are a coding assistant running inside pi, a coding agent harness. " +
  "Help users inspect files, run commands, and modify code.";

// packages/coding-agent/src/core/tools/index.ts
export function createCodingTools(cwd: string, options?: ToolsOptions): Tool[] {
  return [
    createReadTool(cwd, options?.read),
    createBashTool(cwd, options?.bash),
    createEditTool(cwd, options?.edit),
    createWriteTool(cwd, options?.write),
  ];
}`,
              caption: '节选自 earendil-works/pi main 分支：默认工具数组严格锁定为 4 项',
            },
            kpis: [
              { label: '默认工具数', value: '4 个', status: 'good' },
              { label: '基线 Token', value: '<1,000', status: 'good' },
              { label: '结构化段落', value: 'XML Sections', status: 'neutral' },
              { label: '验证基准', value: 'Terminal-Bench 2.0', status: 'good' },
            ],
            legend: [
              { color: PALETTE.green, label: '极简稳定内核' },
              { color: PALETTE.blue, label: '4 把原子工具' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Pi 极简透明内核：无中间黑盒，直连 4 把原子工具',
              zones: [
                {
                  id: 'tools-zone',
                  x: 525,
                  y: 60,
                  w: 390,
                  h: 440,
                  label: '默认核心 4 工具（createCodingTools）',
                  tone: 'blue',
                },
              ],
              nodes: [
                {
                  id: 'prompt',
                  x: 170,
                  y: 190,
                  label: 'System Prompt',
                  sublabel: '<1k tok 基线 + AGENTS.md',
                  icon: 'file',
                  tone: 'green',
                  active: true,
                },
                {
                  id: 'loop',
                  x: 360,
                  y: 280,
                  label: 'Pi Agent Core',
                  sublabel: '透明循环 · 无隐式改写',
                  icon: 'loop',
                  tone: 'dark',
                  size: 'lg',
                  active: true,
                },
                {
                  id: 't-read',
                  x: 620,
                  y: 160,
                  label: 'read',
                  sublabel: '读文本与图片',
                  icon: 'file',
                  tone: 'blue',
                  badge: '1',
                },
                {
                  id: 't-bash',
                  x: 810,
                  y: 160,
                  label: 'bash',
                  sublabel: '执行任意 Shell',
                  icon: 'terminal',
                  tone: 'green',
                  badge: '2',
                },
                {
                  id: 't-edit',
                  x: 620,
                  y: 380,
                  label: 'edit',
                  sublabel: '精确 oldText 替换',
                  icon: 'edit',
                  tone: 'violet',
                  badge: '3',
                },
                {
                  id: 't-write',
                  x: 810,
                  y: 380,
                  label: 'write',
                  sublabel: '新建/覆写 + mkdir',
                  icon: 'code',
                  tone: 'orange',
                  badge: '4',
                },
              ],
              edges: [
                { from: 'prompt', to: 'loop', label: '静态前缀', packetColor: PALETTE.green, status: 'active' },
                { from: 'loop', to: 't-read', packetColor: PALETTE.blue, status: 'active' },
                { from: 'loop', to: 't-bash', packetColor: PALETTE.green, status: 'active' },
                { from: 'loop', to: 't-edit', packetColor: PALETTE.violet, status: 'active' },
                { from: 'loop', to: 't-write', packetColor: PALETTE.orange, status: 'active' },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: 'Bash 万能组合',
            badge: 'TECHNIQUE',
            title: 'Unix 哲学回归：为什么 `bash` 胜过 40 个专用工具',
            paragraphs: [
              '文件检索（`rg` / `find` / `ls`）、Git 操作、跑测试、查日志、甚至调用外部 API，全都能通过 `bash` 配合管道自由组合，而模型在训练语料里见过海量的 Unix CLI 用法。',
              '当然，Pi 源码 `tools/index.ts` 也内置了可选的只读工具集（`grep`、`find`、`ls`）与 Windows 专用的 `powershell`，只是**默认关闭**——当你明确需要只读探索时，只需运行 `pi --tools read,grep,find,ls` 即可切换。',
            ],
            callout: {
              kind: 'idea',
              title: '稳定原语 > 私有 API',
              text: '定制的专用工具越多，Schema 变更和边界 Bug 越多；`read` / `write` / `edit` / `bash` 对应 POSIX 几十年不变的底层接口，大模型用起来最顺手。',
            },
            diffs: [
              { kind: 'add', text: '默认：`read`、`bash`、`edit`、`write` 覆盖 99% 开发动作' },
              { kind: 'change', text: '按需开启只读预设：`--tools read,grep,find,ls`（源码已内置）' },
            ],
            sourceDrawer: {
              title: '内置全部 8 工具与只读预设',
              filePath: 'packages/coding-agent/src/core/tools/index.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/tools/index.ts',
              language: 'ts',
              code: `export type ToolName =
  | "read" | "bash" | "powershell" | "edit" | "write"
  | "grep" | "find" | "ls";

// 默认编码预设（仅 4 把核心工具）
export function createCodingTools(cwd: string, options?: ToolsOptions): Tool[] {
  return [createReadTool(cwd), createBashTool(cwd), createEditTool(cwd), createWriteTool(cwd)];
}

// 可选只读预设（用于无副作用的代码审阅/探索）
export function createReadOnlyTools(cwd: string, options?: ToolsOptions): Tool[] {
  return [createReadTool(cwd), createGrepTool(cwd), createFindTool(cwd), createLsTool(cwd)];
}`,
              caption: 'Pi 并非没有 grep/find/ls，而是默认让 bash 承担检索，避免冗余工具描述污染上下文',
            },
            kpis: [
              { label: '默认启用', value: '4 工具', status: 'good' },
              { label: '源码内置可选', value: '+4 只读/PS', status: 'neutral' },
              { label: 'CLI 组合能力', value: 'Unix 管道', status: 'good' },
              { label: 'Schema 负担', value: '极低', status: 'good' },
            ],
            legend: [
              { color: PALETTE.green, label: 'bash 组合生态' },
              { color: PALETTE.blue, label: '可选只读工具预设', dashed: true },
            ],
            scene: {
              kind: 'iso-flow',
              title: '通过 bash 组合 Unix 生态，而非硬编码几十个专用工具',
              zones: [
                {
                  id: 'unix-zone',
                  x: 470,
                  y: 65,
                  w: 440,
                  h: 230,
                  label: 'bash 一次打通现有 CLI 生态',
                  tone: 'green',
                },
                {
                  id: 'readonly-zone',
                  x: 470,
                  y: 330,
                  w: 440,
                  h: 165,
                  label: '按需开启：--tools read,grep,find,ls',
                  tone: 'blue',
                  dashed: true,
                },
              ],
              nodes: [
                {
                  id: 'agent',
                  x: 160,
                  y: 250,
                  label: 'LLM 决策',
                  sublabel: '熟悉 POSIX 语料',
                  icon: 'brain',
                  tone: 'dark',
                  active: true,
                },
                {
                  id: 'bash',
                  x: 340,
                  y: 180,
                  label: 'bash 工具',
                  sublabel: '同步执行 + 超时',
                  icon: 'terminal',
                  tone: 'green',
                  active: true,
                },
                {
                  id: 'search-cli',
                  x: 580,
                  y: 165,
                  label: 'rg / find / git',
                  sublabel: '检索与版本控制',
                  icon: 'search',
                  tone: 'green',
                },
                {
                  id: 'tmux-cli',
                  x: 790,
                  y: 165,
                  label: 'tmux / 测试 / 脚本',
                  sublabel: '长驻进程与调试',
                  icon: 'zap',
                  tone: 'orange',
                },
                {
                  id: 'ro-set',
                  x: 685,
                  y: 410,
                  label: 'grep / find / ls',
                  sublabel: '默认禁用 · 只读模式启用',
                  icon: 'shield',
                  tone: 'blue',
                  dimmed: true,
                },
              ],
              edges: [
                { from: 'agent', to: 'bash', label: '默认路径', packetColor: PALETTE.green, status: 'active' },
                { from: 'bash', to: 'search-cli', packetColor: PALETTE.green, status: 'active' },
                { from: 'search-cli', to: 'tmux-cli', label: '管道组合', packetColor: PALETTE.orange },
                { from: 'agent', to: 'ro-set', label: '受限模式', dashed: true, packetColor: PALETTE.blue },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: '刻意不做清单',
            badge: 'INSIGHT',
            title: '刻意留白：为什么没有内置 Plan Mode、Sub-agents 与 To-dos',
            paragraphs: [
              'Pi 的 README 开门见山：“Pi 提供强大默认值，但刻意跳过 Sub-agents 与 Plan Mode。”这不是偷懒，而是因为这些内置状态机往往制造**黑盒中的黑盒**。',
              '在 Pi 的工作流里：需要规划就协作写一份可版本控制的 `PLAN.md`；需要清单就维护 `TODO.md`；需要长驻进程就开 `tmux`（人机可随时介入同屏调试）；需要子代理就直接让 `bash` 启动另一个 `pi` 进程或安装社区 Extension。',
            ],
            callout: {
              kind: 'idea',
              title: '文件与 tmux = 天然可观测状态',
              text: '比起锁在会话内存里的临时 Plan Mode 或不可见的子代理摘要，落在磁盘上的 `PLAN.md` 和可见的 `tmux` 窗格既能跨会话复用，也能由你直接编辑纠偏。',
            },
            diffs: [
              { kind: 'remove', text: '内置 Plan Mode / 内置 To-do 状态 / 内置后台 Bash / 黑盒 Sub-agent' },
              { kind: 'add', text: '显式文件产物（`PLAN.md`、`TODO.md`）+ `tmux` + 按需安装的 TypeScript Extension' },
            ],
            kpis: [
              { label: '内置 Plan Mode', value: '刻意省略', status: 'good' },
              { label: '内置 Sub-agents', value: '刻意省略', status: 'good' },
              { label: '内置后台 Bash', value: '用 tmux 替代', status: 'good' },
              { label: '状态可观测性', value: '100% 透明', status: 'good' },
            ],
            legend: [
              { color: PALETTE.rose, label: 'Pi 刻意移除的黑盒特性', dashed: true },
              { color: PALETTE.green, label: 'Pi 推崇的透明替代原语' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '四大刻意省略 vs Pi 透明原语替代方案',
              zones: [
                {
                  id: 'omit-row',
                  x: 65,
                  y: 65,
                  w: 870,
                  h: 175,
                  label: '刻意不内置的黑盒抽象',
                  tone: 'rose',
                  dashed: true,
                },
                {
                  id: 'pi-row',
                  x: 65,
                  y: 300,
                  w: 870,
                  h: 185,
                  label: 'Pi 的透明文件 / CLI / 扩展替代',
                  tone: 'green',
                },
              ],
              nodes: [
                { id: 'o-plan', x: 165, y: 155, label: 'No Plan Mode', sublabel: '临时态 · 审批繁琐', icon: 'alert', tone: 'rose', dimmed: true },
                { id: 'o-sub', x: 390, y: 155, label: 'No Sub-agents', sublabel: '黑盒里的黑盒', icon: 'alert', tone: 'rose', dimmed: true },
                { id: 'o-todo', x: 615, y: 155, label: 'No To-dos', sublabel: '额外状态易干扰', icon: 'alert', tone: 'rose', dimmed: true },
                { id: 'o-bg', x: 840, y: 155, label: 'No Bg Bash', sublabel: '压缩后易成孤儿', icon: 'alert', tone: 'rose', dimmed: true },
                { id: 'p-plan', x: 165, y: 395, label: 'PLAN.md', sublabel: '可版本控制 · 共编', icon: 'file', tone: 'green', active: true },
                { id: 'p-sub', x: 390, y: 395, label: 'bash 启 pi', sublabel: '输出全可见 · 可扩展', icon: 'terminal', tone: 'blue', active: true },
                { id: 'p-todo', x: 615, y: 395, label: 'TODO.md', sublabel: '显式持久化清单', icon: 'check', tone: 'green', active: true },
                { id: 'p-bg', x: 840, y: 395, label: 'tmux 会话', sublabel: '可列举 · 同屏调试', icon: 'layers', tone: 'violet', active: true },
              ],
              edges: [
                { from: 'o-plan', to: 'p-plan', label: '替代', packetColor: PALETTE.green, status: 'active' },
                { from: 'o-sub', to: 'p-sub', label: '替代', packetColor: PALETTE.blue, status: 'active' },
                { from: 'o-todo', to: 'p-todo', label: '替代', packetColor: PALETTE.green, status: 'active' },
                { from: 'o-bg', to: 'p-bg', label: '替代', packetColor: PALETTE.violet, status: 'active' },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: 'YOLO 与信任边界',
            badge: 'TECHNIQUE',
            title: 'YOLO by Default：戳破“安全剧场”，守住真正边界',
            paragraphs: [
              'Pi 默认不弹任何命令审批窗口。Mario 引用 Simon Willison 的“致命三要素”分析：只要 Agent 同时具备**读数据、跑代码、连网络**三项能力，应用层白名单或弹窗审批大多只是让人疲于点击“允许”的“安全剧场”。',
              'Pi 选择诚实地划清两道真实防线：在**进程外**，建议用容器/沙箱（`docs/containerization.md`）隔离宿主机权限；在**进程内**，加载陌生项目的 `.pi/` 配置、Extension、Skills 与 MCP 前，必须先通过 `project-trust` 项目信任门控。',
            ],
            callout: {
              kind: 'warn',
              title: '真实运行边界（源码核验）',
              text: 'Pi 进程默认继承当前操作系统用户权限；扩展代码直接运行在 Pi 进程内。因此陌生仓库的 `.pi/` 资源必须经过 `project-trust` 明确授权才会被加载。',
            },
            diffs: [
              { kind: 'remove', text: '逐条 Bash 命令弹窗确认 / 用小模型做表面意图预检' },
              { kind: 'add', text: '明确告知无内置权限沙箱 + 容器隔离指引 + `project-trust` 项目级信任门控' },
            ],
            kpis: [
              { label: '命令审批弹窗', value: '0（默认 YOLO）', status: 'neutral' },
              { label: '项目资源门控', value: 'project-trust', status: 'good' },
              { label: '真实隔离层', value: 'OS / 容器', status: 'good' },
              { label: '自定义审批', value: 'beforeToolCall 扩展', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.rose, label: '致命三要素风险面' },
              { color: PALETTE.green, label: 'Pi 真实防线' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Pi 安全观：拒绝表面弹窗，用容器隔离 + Project Trust 守真实边界',
              zones: [
                {
                  id: 'container-zone',
                  x: 340,
                  y: 65,
                  w: 580,
                  h: 425,
                  label: '第一道防线：OS 权限 / Docker 容器沙箱',
                  tone: 'green',
                },
              ],
              nodes: [
                {
                  id: 'repo',
                  x: 165,
                  y: 270,
                  label: '陌生代码仓库',
                  sublabel: '.pi/ 扩展与配置',
                  icon: 'package',
                  tone: 'orange',
                },
                {
                  id: 'trust',
                  x: 455,
                  y: 270,
                  label: 'project-trust',
                  sublabel: '第二道防线：信任门控',
                  icon: 'shield',
                  tone: 'green',
                  active: true,
                  badge: 'GATE',
                },
                {
                  id: 'runtime',
                  x: 685,
                  y: 175,
                  label: 'Pi 运行时（YOLO）',
                  sublabel: '无弹窗摩擦 · 高速执行',
                  icon: 'zap',
                  tone: 'blue',
                  active: true,
                },
                {
                  id: 'hook',
                  x: 685,
                  y: 380,
                  label: '可选自定义策略',
                  sublabel: 'Extension beforeToolCall',
                  icon: 'code',
                  tone: 'violet',
                },
              ],
              edges: [
                { from: 'repo', to: 'trust', label: '启动审查', packetColor: PALETTE.orange, status: 'active' },
                { from: 'trust', to: 'runtime', label: '授权通过', packetColor: PALETTE.green, status: 'active' },
                { from: 'runtime', to: 'hook', label: '按需挂载拦截', dashed: true, packetColor: PALETTE.violet },
              ],
              callouts: [
                { x: 165, y: 425, text: '未授信时跳过项目扩展与 MCP', tone: 'rose' },
              ],
            },
          },

          // Step 7
          {
            stepNumber: 7,
            shortLabel: '中文社区消歧',
            badge: 'INSIGHT',
            title: '概念消歧：中文圈里的“派 / Pi Agent”容易撞名',
            paragraphs: [
              '在中文 AI 社区搜“派 Agent”时，结果常指向三个完全不同的项目。为避免概念混淆，本课程全程锚定 **Mario Zechner 的开源编码代理 Pi Coding Agent**（现仓库 `earendil-works/pi`，原名 `badlogic/pi-mono`，也是现象级开源项目 OpenClaw 的底层引擎）。',
              '另外两个高频撞名对象分别是：国内“技术派”社区的 Java SpringAI 工作流项目 `PaiAgent` / `PaiFlow`（`itwanger/PaiAgent`），以及 Inflection AI 推出的情感陪伴聊天机器人 `Pi`（`pi.ai`）。',
            ],
            callout: {
              kind: 'tip',
              title: '术语约定（统一全文口径）',
              text: '本课程将保留源码原始英文标识符，并对中文社区易混淆词作固定映射：`Steering` → **转向 / 实时纠偏**；`Follow-up` → **跟进 / 排队跟进**（避免与“引导”混用）；`Compaction` → **上下文压缩**；`Tree Session` → **树形会话**。',
            },
            diffs: [
              { kind: 'add', text: '主角：`earendil-works/pi`（原 `badlogic/pi-mono`），TypeScript 极简编码 Agent' },
              { kind: 'remove', text: '非 `itwanger/PaiAgent`（Java 工作流编排），非 Inflection `pi.ai`（陪伴机器人）' },
            ],
            kpis: [
              { label: '官方仓库', value: 'earendil-works/pi', status: 'good' },
              { label: 'GitHub Stars', value: '122k+', status: 'good' },
              { label: '代表生态', value: 'OpenClaw 引擎', status: 'good' },
              { label: '同名歧义项', value: '2 类常见撞名', status: 'warn' },
            ],
            legend: [
              { color: PALETTE.green, label: '本课程解析对象' },
              { color: PALETTE.orange, label: '常见同名但无关项目', dashed: true },
            ],
            scene: {
              kind: 'iso-flow',
              title: '中文社区“派 / Pi”三大指代精确消歧',
              nodes: [
                {
                  id: 'query',
                  x: 160,
                  y: 270,
                  label: '搜索“派 / Pi”',
                  sublabel: '中文社区高频简称',
                  icon: 'search',
                  tone: 'neutral',
                },
                {
                  id: 'pi-coding',
                  x: 530,
                  y: 110,
                  label: 'Pi Coding Agent',
                  sublabel: 'earendil-works/pi · Mario Zechner',
                  icon: 'terminal',
                  tone: 'green',
                  size: 'lg',
                  active: true,
                  badge: '本课程主角',
                },
                {
                  id: 'pai-java',
                  x: 530,
                  y: 280,
                  label: '技术派 PaiAgent',
                  sublabel: 'itwanger/PaiAgent · Java DAG 工作流',
                  icon: 'layers',
                  tone: 'orange',
                  dimmed: true,
                },
                {
                  id: 'inflection',
                  x: 530,
                  y: 450,
                  label: 'Inflection Pi (pi.ai)',
                  sublabel: 'Personal Intelligence · 情感陪伴 Bot',
                  icon: 'message',
                  tone: 'violet',
                  dimmed: true,
                },
                {
                  id: 'openclaw',
                  x: 840,
                  y: 110,
                  label: 'OpenClaw 等生态',
                  sublabel: '直接复用 pi-agent-core',
                  icon: 'sparkles',
                  tone: 'blue',
                  active: true,
                },
              ],
              edges: [
                { from: 'query', to: 'pi-coding', label: '本教程锚定', packetColor: PALETTE.green, status: 'active' },
                { from: 'query', to: 'pai-java', label: '易混淆', dashed: true, packetColor: PALETTE.orange, status: 'dimmed' },
                { from: 'query', to: 'inflection', label: '非编码 Agent', dashed: true, packetColor: PALETTE.violet, status: 'dimmed' },
                { from: 'pi-coding', to: 'openclaw', label: '底层引擎', packetColor: PALETTE.blue, status: 'active' },
              ],
            },
          },

          // Step 8 (RECAP)
          {
            stepNumber: 8,
            shortLabel: '反框架决策表',
            badge: 'RECAP',
            title: '总结：小内核，可编程边缘',
            paragraphs: [
              'Pi 的“反框架”不是功能匮乏，而是把**稳定性最高的原语**（双层循环、4 工具、透明会话树、增量缓存）做进内核，把**因人而异的工作流**（审批、子代理、计划模式、定制 UI）推到可热重载的 TypeScript 边缘。',
              '下一课我们将打开 `earendil-works/pi` 仓库，看看这套极简哲学如何落实为严苛的单向依赖 Monorepo 架构。',
            ],
            recapTable: [
              {
                question: '为什么默认只给 4 把工具？',
                decision: '锁定 `read` / `bash` / `edit` / `write`',
                because: '模型天然精通 POSIX 与基础文件操作，省下上万 Token 注意力税',
              },
              {
                question: '为什么不做内置 Plan / To-do？',
                decision: '交给 `PLAN.md` / `TODO.md` 文件',
                because: '文件天然可观测、可 Git 版本化、可跨会话由人机共同编辑',
              },
              {
                question: '为什么不做黑盒 Sub-agent？',
                decision: '用 `bash` / `tmux` 显式拉起或装扩展',
                because: '拒绝“黑盒套黑盒”，保留完整日志、可控上下文交接与排障能力',
              },
              {
                question: '为什么默认 YOLO 无弹窗？',
                decision: '容器隔离 + `project-trust` 项目门控',
                because: '逐条命令弹窗只是安全剧场，真正边界在 OS 沙箱与仓库信任',
              },
            ],
            kpis: [
              { label: '核心哲学', value: '小内核 + 可编程边缘', status: 'good' },
              { label: '默认工具集', value: '4 原子工具', status: 'good' },
              { label: '提示词基线', value: '<1,000 tok', status: 'good' },
              { label: '可扩展性', value: 'TS 扩展热重载', status: 'good' },
            ],
            legend: [
              { color: PALETTE.green, label: '稳固小内核' },
              { color: PALETTE.violet, label: '可插拔边缘生态' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Pi 架构总纲：稳固极简内核 × 可编程外延',
              nodes: [
                {
                  id: 'core',
                  x: 340,
                  y: 270,
                  label: 'Pi 极简内核',
                  sublabel: '4 工具 · 双层循环 · JSONL 树',
                  icon: 'cpu',
                  tone: 'green',
                  size: 'lg',
                  active: true,
                },
                {
                  id: 'ext',
                  x: 160,
                  y: 130,
                  label: 'Extensions',
                  sublabel: '自定义工具/钩子/UI',
                  icon: 'plug',
                  tone: 'violet',
                },
                {
                  id: 'skills',
                  x: 530,
                  y: 130,
                  label: 'Skills (SKILL.md)',
                  sublabel: '渐进式按需披露',
                  icon: 'sparkles',
                  tone: 'blue',
                },
                {
                  id: 'mcp',
                  x: 160,
                  y: 410,
                  label: 'Codemode MCP',
                  sublabel: '零前置 Schema 膨胀',
                  icon: 'code',
                  tone: 'orange',
                },
                {
                  id: 'pkgs',
                  x: 530,
                  y: 410,
                  label: 'Pi Packages',
                  sublabel: 'npm / git 一键分享',
                  icon: 'package',
                  tone: 'green',
                },
              ],
              edges: [
                { from: 'ext', to: 'core', packetColor: PALETTE.violet, status: 'active' },
                { from: 'skills', to: 'core', packetColor: PALETTE.blue, status: 'active' },
                { from: 'mcp', to: 'core', packetColor: PALETTE.orange, status: 'active' },
                { from: 'pkgs', to: 'core', packetColor: PALETTE.green, status: 'active' },
              ],
              miniChart: {
                title: '有效信号比 vs 框架膨胀度',
                xLabel: '内置抽象数',
                yLabel: '信号密度',
                points: [
                  [1, 94],
                  [2, 92],
                  [4, 88],
                  [8, 68],
                  [14, 48],
                  [20, 32],
                ],
                highlightIndex: 0,
                highlightLabel: 'Pi 极简区间',
                tone: 'green',
              },
            },
          },
        ],
      },

      // ----------------------------------------------------------------------
      // LESSON 2: monorepo-layers (7 steps)
      // ----------------------------------------------------------------------
      {
        id: 'lesson-02-monorepo-layers',
        slug: 'monorepo-layers',
        chapterId: 'ch01',
        chapterNumber: 1,
        chapterTitle: '设计哲学与分层',
        lessonIndexInChapter: 2,
        totalInChapter: 2,
        title: '单向依赖的 Monorepo 架构',
        subtitle:
          '拆解 earendil-works/pi 严苛单向 DAG：从 2,548 行的 pi-agent-core 到 OpenClaw 无头嵌入',
        durationMin: 6,
        level: '入门',
        objectives: [
          {
            id: 'mono-1',
            text: '看懂 Pi Monorepo 的严格单向依赖链（零循环依赖 DAG）',
            completedAtStep: 2,
          },
          {
            id: 'mono-2',
            text: '理解 `pi-ai` 如何统一多厂商 Wire 协议并支持会话中热切换模型',
            completedAtStep: 3,
          },
          {
            id: 'mono-3',
            text: '掌握 `pi-agent-core`（6 文件 / 2,548 行）与零依赖 `pi-tui` 的职责边界',
            completedAtStep: 4,
          },
          {
            id: 'mono-4',
            text: '了解 2026 年仓库迁移（`badlogic/pi-mono` → `earendil-works/pi`）与包演进',
            completedAtStep: 5,
          },
          {
            id: 'mono-5',
            text: '理解 OpenClaw 如何跳过 TUI 直接把 Pi 作为无头 Agent 引擎嵌入',
            completedAtStep: 6,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: '紧耦合泥潭',
            badge: 'PROBLEM',
            title: '把 UI、模型协议与循环揉成一团，架构瞬间失去复用性',
            paragraphs: [
              '很多开源 Agent 起步快、迭代猛，但很快掉进紧耦合陷阱：终端渲染代码里直接 `import` Anthropic SDK，工具循环里硬编码命令行交互确认，会话格式与特定厂商响应体绑死。',
              '一旦你想把它嵌入 IDE、挂到 Slack/WhatsApp 机器人、或者在长对话中途把 Claude 切换成 GPT / Gemini / 本地 `llama.cpp`，整个代码库就得伤筋动骨。',
            ],
            callout: {
              kind: 'warn',
              title: '复用测试（Headless Test）',
              text: '检验一个 Agent 架构是否解耦的试金石：你能否在**不引入任何终端 UI 代码**的前提下，用 20 行代码把它嵌入服务端或聊天机器人？',
            },
            diffs: [
              { kind: 'remove', text: 'UI 组件直连厂商 SDK、循环硬编码终端状态、循环依赖缠绕' },
              { kind: 'add', text: '严格按职责拆包，形成单向有向无环图（DAG）' },
            ],
            kpis: [
              { label: '循环依赖风险', value: '极高', status: 'bad' },
              { label: '无头复用能力', value: '几乎为零', status: 'bad' },
              { label: '跨模型切换', value: '改动扩散', status: 'warn' },
              { label: '测试隔离度', value: '必须起全栈', status: 'bad' },
            ],
            legend: [
              { color: PALETTE.rose, label: '双向紧耦合依赖' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '反面教材：网状双向依赖的紧耦合 Agent',
              nodes: [
                { id: 'ui', x: 220, y: 150, label: '终端渲染 UI', sublabel: '直调厂商 API', icon: 'terminal', tone: 'rose', active: true },
                { id: 'loop', x: 520, y: 150, label: '业务循环', sublabel: '硬编码 CLI 交互', icon: 'loop', tone: 'rose', active: true },
                { id: 'sdk', x: 780, y: 290, label: '单一厂商 SDK', sublabel: '锁死响应格式', icon: 'brain', tone: 'orange' },
                { id: 'sess', x: 350, y: 400, label: '会话持久化', sublabel: '绑死 UI 状态', icon: 'database', tone: 'rose' },
              ],
              edges: [
                { from: 'ui', to: 'loop', label: '互相引用', packetColor: PALETTE.rose, status: 'error' },
                { from: 'loop', to: 'ui', curved: true, packetColor: PALETTE.rose, status: 'error' },
                { from: 'ui', to: 'sdk', dashed: true, packetColor: PALETTE.orange, status: 'error' },
                { from: 'loop', to: 'sdk', packetColor: PALETTE.rose, status: 'error' },
                { from: 'sess', to: 'ui', packetColor: PALETTE.rose, status: 'error' },
                { from: 'loop', to: 'sess', packetColor: PALETTE.rose, status: 'error' },
              ],
              callouts: [
                { x: 720, y: 440, text: '无法单独抽离循环引擎复用', tone: 'rose' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: '严苛单向 DAG',
            badge: 'SOLUTION',
            title: '严格单向依赖链：底层永远不认识上层',
            paragraphs: [
              '核验 `earendil-works/pi` 中所有 `packages/*/package.json` 的内部依赖，你会看到一张极其克制的单向分层图：叶子包零内部依赖，`pi-ai` 封装模型，`pi-agent-core` 封装循环，`pi-tui` 独立渲染终端，最顶层 `pi-coding-agent` 才把它们装配为完整产品。',
              '任何底层包都不会反向依赖上层：你可以只用 `pi-ai` 调模型，只用 `pi-agent-core` 造自定义 Agent，或者只用 `pi-tui` 写毫不相干的终端应用。',
            ],
            callout: {
              kind: 'idea',
              title: '单向分层带来的工程红利',
              text: '`pi-agent-core` 的内部依赖只有 `pi-ai` 和 `pi-schema`；它完全不知道文件系统、终端按键、JSONL 会话或 MCP 的存在。',
            },
            diffs: [
              { kind: 'add', text: '底层叶子：`pi-schema`、`pi-telemetry`、`pi-tui`、`pi-mcp`、`pi-codemode`（内部依赖为空）' },
              { kind: 'add', text: '主链：`pi-ai` → `pi-agent-core` → `pi-coding-agent`' },
            ],
            sourceDrawer: {
              title: '源码实测内部依赖图（packages/*/package.json）',
              filePath: 'packages/coding-agent/package.json',
              githubUrl: 'https://github.com/earendil-works/pi/blob/main/packages/coding-agent/package.json',
              language: 'text',
              code: `pi-schema      -> internal_deps: []
pi-telemetry   -> internal_deps: []
pi-tui         -> internal_deps: []
pi-mcp         -> internal_deps: []
pi-codemode    -> internal_deps: []

pi-ai          -> internal_deps: [pi-schema, pi-telemetry]
pi-agent-core  -> internal_deps: [pi-ai, pi-schema]
pi-coding-agent-> internal_deps: [pi-agent-core, pi-ai, pi-tui, pi-mcp, pi-codemode]`,
              caption: '直接读取 earendil-works/pi main 分支各包 package.json 核验得到的零环 DAG',
            },
            kpis: [
              { label: '循环依赖数', value: '0', status: 'good' },
              { label: '核心主链深度', value: '4 层', status: 'good' },
              { label: '零内部依赖包', value: '5 个', status: 'good' },
              { label: 'npm 作用域', value: '@earendil-works/*', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.green, label: '核心单向主链' },
              { color: PALETTE.violet, label: '零内部依赖平级组件' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'earendil-works/pi 核心单向依赖 DAG（实测 package.json）',
              nodes: [
                { id: 'leaf', x: 150, y: 275, label: 'pi-schema / telemetry', sublabel: '内部依赖: []', icon: 'box', tone: 'neutral' },
                { id: 'ai', x: 360, y: 275, label: 'pi-ai', sublabel: '统一多厂商 LLM API', icon: 'brain', tone: 'blue', active: true },
                { id: 'core', x: 580, y: 275, label: 'pi-agent-core', sublabel: '双层循环与事件流', icon: 'loop', tone: 'green', active: true },
                { id: 'tui', x: 580, y: 100, label: 'pi-tui', sublabel: '内部依赖: [] · 差分渲染', icon: 'terminal', tone: 'violet' },
                { id: 'mcp-cm', x: 580, y: 450, label: 'pi-mcp / codemode', sublabel: '内部依赖: [] · 按需扩展', icon: 'plug', tone: 'orange' },
                { id: 'cli', x: 830, y: 275, label: 'pi-coding-agent', sublabel: '旗舰 CLI · 会话 · 扩展', icon: 'cpu', tone: 'dark', size: 'lg', active: true },
              ],
              edges: [
                { from: 'leaf', to: 'ai', packetColor: PALETTE.blue, status: 'active' },
                { from: 'ai', to: 'core', label: 'streamFn', packetColor: PALETTE.green, status: 'active' },
                { from: 'core', to: 'cli', label: 'Agent', packetColor: PALETTE.green, status: 'active' },
                { from: 'tui', to: 'cli', packetColor: PALETTE.violet },
                { from: 'mcp-cm', to: 'cli', packetColor: PALETTE.orange },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: 'pi-ai 协议归一',
            badge: 'TECHNIQUE',
            title: '`@earendil-works/pi-ai`：把几十家厂商归一为标准协议',
            paragraphs: [
              'Mario 发现市面上看似眼花缭乱的几十家大模型服务商，底层绝大多数只走四类 Wire 协议：OpenAI Completions、OpenAI Responses、Anthropic Messages 与 Google Generative AI。',
              '`pi-ai` 以统一 `streamSimple()` / `completeSimple()` 抽象这些协议，内置支持工具调用的模型目录（含价格、上下文上限与 Thinking 能力元数据）、OAuth/API Key 自动解析，甚至允许你在**同一会话中途无损切换不同厂商模型**（Cross-Provider Handoff）。',
            ],
            callout: {
              kind: 'tip',
              title: '模型目录准入门槛',
              text: '`packages/ai/README.md` 明确注明：聊天模型目录**只收录支持 Tool Calling 的模型**，因为函数调用是编码 Agent 循环的刚需。',
            },
            diffs: [
              { kind: 'add', text: '统一协议适配 + 自动生成的类型安全模型目录' },
              { kind: 'add', text: '会话中途热切模型（如 Claude 切 GPT-5 / Gemini / 本地 llama.cpp）' },
            ],
            kpis: [
              { label: '主流 Wire 协议', value: '4 大家族', status: 'good' },
              { label: '内置 Provider', value: '15+ 厂商/本地', status: 'good' },
              { label: '中途换模型', value: '支持 Handoff', status: 'good' },
              { label: '鉴权方式', value: 'API Key + OAuth', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.blue, label: '统一调用入口' },
              { color: PALETTE.green, label: '标准化 Wire 协议家族' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'pi-ai 协议归一化：一套上下文，无缝切换所有主流模型',
              nodes: [
                { id: 'caller', x: 150, y: 270, label: 'streamSimple()', sublabel: '统一 TranscriptContext', icon: 'zap', tone: 'blue', active: true },
                { id: 'catalog', x: 385, y: 270, label: 'pi-ai Router', sublabel: '模型目录 · 鉴权 · 计费', icon: 'cpu', tone: 'dark', size: 'lg', active: true },
                { id: 'p-ant', x: 635, y: 155, label: 'Anthropic Messages', sublabel: 'Claude + Thinking', icon: 'brain', tone: 'orange' },
                { id: 'p-oai', x: 855, y: 155, label: 'OpenAI Comp / Resp', sublabel: 'GPT · Codex · DeepSeek', icon: 'brain', tone: 'green' },
                { id: 'p-ggl', x: 635, y: 385, label: 'Google GenAI', sublabel: 'Gemini · Vertex AI', icon: 'brain', tone: 'blue' },
                { id: 'p-loc', x: 855, y: 385, label: 'Local / Custom', sublabel: 'llama.cpp · Ollama · vLLM', icon: 'terminal', tone: 'violet' },
              ],
              edges: [
                { from: 'caller', to: 'catalog', label: '标准消息', packetColor: PALETTE.blue, status: 'active' },
                { from: 'catalog', to: 'p-ant', packetColor: PALETTE.orange, status: 'active' },
                { from: 'catalog', to: 'p-oai', packetColor: PALETTE.green, status: 'active' },
                { from: 'catalog', to: 'p-ggl', packetColor: PALETTE.blue },
                { from: 'catalog', to: 'p-loc', packetColor: PALETTE.violet },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: '2548行核心与TUI',
            badge: 'TECHNIQUE',
            title: '`pi-agent-core`（2,548 行）与零依赖 `pi-tui` 差分渲染',
            paragraphs: [
              '整个 `@earendil-works/pi-agent-core` 源码目录只有 **6 个 TypeScript 文件、总计 2,548 行代码**：`agent-loop.ts`（952 行）负责无状态循环，`agent.ts`（623 行）负责状态与双队列封装，`types.ts`（551 行）定义完整契约，外加 `proxy.ts`、`stream-fn.ts` 与 `index.ts`。',
              '同级的 `@earendil-works/pi-tui` 则没有任何内部依赖，摒弃了重型 React-for-CLI 框架，自研保留模式组件 + **差分渲染（Differential Rendering）** + `CSI 2026` 同步输出，实现高频流式输出零闪烁，并支持 Kitty/iTerm2 终端内联图片。',
            ],
            callout: {
              kind: 'idea',
              title: '两小时读完整个 Agent 内核',
              text: '2,548 行意味着任何熟悉 TypeScript 的工程师都能在一个下午逐行读完并吃透全部运行时语义——没有层层叠叠的 Factory/Manager 抽象地狱。',
            },
            sourceDrawer: {
              title: 'pi-agent-core 精确源码清单（实测 main 分支）',
              filePath: 'packages/agent/src/index.ts',
              githubUrl: 'https://github.com/earendil-works/pi/tree/main/packages/agent/src',
              language: 'text',
              code: `packages/agent/src/
├── agent-loop.ts   952 lines  # 双层循环、工具编排、流式转发
├── agent.ts        623 lines  # 有状态 Agent 类、双队列、事件订阅
├── types.ts        551 lines  # AgentEvent / AgentTool / Hooks 契约
├── proxy.ts        397 lines  # 代理流转发支持
├── stream-fn.ts     20 lines  # 默认 streamFn 入口
└── index.ts          5 lines  # 根导出
-------------------------------------------------------
TOTAL: 6 files, 2,548 lines of TypeScript`,
              caption: '直接统计 earendil-works/pi main 分支 packages/agent/src 行数',
            },
            kpis: [
              { label: 'agent-core 文件数', value: '6 个 TS', status: 'good' },
              { label: 'agent-core 总行数', value: '2,548 行', status: 'good' },
              { label: 'pi-tui 内部依赖', value: '0', status: 'good' },
              { label: '防闪烁协议', value: 'CSI 2026 + Diff', status: 'good' },
            ],
            legend: [
              { color: PALETTE.green, label: 'pi-agent-core（6 文件）' },
              { color: PALETTE.violet, label: 'pi-tui（独立差分引擎）' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '双子内核并立：2,548 行 Agent 核心 vs 零依赖终端渲染引擎',
              zones: [
                { id: 'z-core', x: 75, y: 70, w: 400, h: 420, label: '@earendil-works/pi-agent-core（2,548 行）', tone: 'green' },
                { id: 'z-tui', x: 525, y: 70, w: 400, h: 420, label: '@earendil-works/pi-tui（零内部依赖）', tone: 'violet' },
              ],
              nodes: [
                { id: 'loop-ts', x: 275, y: 165, label: 'agent-loop.ts', sublabel: '952 行 · 双层主循环', icon: 'loop', tone: 'green', active: true },
                { id: 'agent-ts', x: 275, y: 355, label: 'agent.ts + types.ts', sublabel: '623 + 551 行 · 队列与事件', icon: 'code', tone: 'blue', active: true },
                { id: 'tui-ren', x: 725, y: 165, label: 'Main / AltScreen', sublabel: '双渲染器 · 差分行刷新', icon: 'terminal', tone: 'violet', active: true },
                { id: 'tui-comp', x: 725, y: 355, label: 'CSI 2026 + 组件库', sublabel: 'Editor · Markdown · 内联图', icon: 'sparkles', tone: 'orange' },
              ],
              edges: [
                { from: 'agent-ts', to: 'loop-ts', label: '驱动', packetColor: PALETTE.green, status: 'active' },
                { from: 'loop-ts', to: 'tui-ren', label: 'AgentEvent 流（由上层桥接）', dashed: true, packetColor: PALETTE.violet },
                { from: 'tui-ren', to: 'tui-comp', packetColor: PALETTE.violet, status: 'active' },
              ],
              callouts: [
                { x: 275, y: 465, text: '零 UI 代码 · 可直接跑在服务端', tone: 'green' },
                { x: 725, y: 465, text: '高频流式打字零闪烁', tone: 'violet' },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: '四形态与2026演进',
            badge: 'TECHNIQUE',
            title: '`pi-coding-agent` 四种运行形态与 2026 仓库演进',
            paragraphs: [
              '顶层的 `@earendil-works/pi-coding-agent` 将上述积木装配为四种官方运行形态：**交互式 TUI**（日常终端开发）、**Print / JSON 模式**（脚本与 CI 流水线）、**RPC 模式**（基于 `stdin`/`stdout` JSONL 的跨语言控制）以及 **TypeScript SDK**（进程内直接嵌入）。',
              '阅读历史技术博客时还需注意 **2026 年的仓库演进**：原 `badlogic/pi-mono` 已迁移至 `earendil-works/pi`，npm 包作用域升级为 `@earendil-works/pi-*`（`3e5ad67`）；旧 `packages/web-ui` 于 2026-05 移除（`b141e1f`），Slack 机器人拆分为 `earendil-works/pi-chat`，同时新增了 `pi-mcp`、`pi-codemode` 与持久化运行时 `chord` / `pi-durable`。',
            ],
            callout: {
              kind: 'tip',
              title: '新旧资料对照避坑',
              text: '2025 底～2026 初的中文文章常写 `@mariozechner/pi-coding-agent` 和 `pi-web-ui`，它们对应迁移前的 `badlogic/pi-mono` 快照；本课程全部以当前 `earendil-works/pi` `main` 分支为准。',
            },
            diffs: [
              { kind: 'change', text: '仓库与包名：`badlogic/pi-mono` → `earendil-works/pi`（`@earendil-works/*`）' },
              { kind: 'remove', text: '`packages/web-ui` 已于 `b141e1f` 移除；`pi-mom` 移至独立仓库 `pi-chat`' },
              { kind: 'add', text: '新增 `pi-mcp`、`pi-codemode` 及持久化运行层 `chord` / `pi-durable`' },
            ],
            kpis: [
              { label: '官方运行形态', value: '4 种模式', status: 'good' },
              { label: 'Node.js 要求', value: '>= 22.19', status: 'neutral' },
              { label: '包名迁移提交', value: '3e5ad67', status: 'neutral' },
              { label: 'Monorepo 总包数', value: '12 个', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.blue, label: '四种外部接入形态' },
              { color: PALETTE.green, label: '统一 Session + Agent 内核' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '一套 coding-agent 内核，驱动四种标准接口',
              nodes: [
                { id: 'engine', x: 215, y: 270, label: 'AgentSession 内核', sublabel: 'Loop + SessionManager + 扩展', icon: 'cpu', tone: 'green', size: 'lg', active: true },
                { id: 'm-tui', x: 575, y: 155, label: 'Interactive TUI', sublabel: '终端交互 · /tree · 快捷键', icon: 'terminal', tone: 'violet', active: true },
                { id: 'm-json', x: 825, y: 155, label: 'Print / JSON Mode', sublabel: 'CI 管道 · JSONL 事件流', icon: 'code', tone: 'blue' },
                { id: 'm-rpc', x: 575, y: 385, label: 'RPC Mode', sublabel: 'stdin/stdout 跨进程控制', icon: 'plug', tone: 'orange' },
                { id: 'm-sdk', x: 825, y: 385, label: 'TypeScript SDK', sublabel: '进程内零延迟编程控制', icon: 'package', tone: 'green' },
              ],
              edges: [
                { from: 'engine', to: 'm-tui', packetColor: PALETTE.violet, status: 'active' },
                { from: 'engine', to: 'm-json', packetColor: PALETTE.blue },
                { from: 'engine', to: 'm-rpc', packetColor: PALETTE.orange },
                { from: 'engine', to: 'm-sdk', packetColor: PALETTE.green, status: 'active' },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: 'OpenClaw 实战嵌入',
            badge: 'INSIGHT',
            title: '生态验证：OpenClaw 如何把 Pi 当作“无头大脑”',
            paragraphs: [
              'Pi 的根目录 `README.md` 专门点名推荐了 **OpenClaw**（由 Peter Steinberger 创建，前身 Clawdbot / MoltBot）作为真实生产集成范例。',
              '很多人以为 OpenClaw 从零手写了整套大模型调度与工具循环，其实它采用了极其干净的**引擎与外壳分离**架构：OpenClaw 专注多通道通信（聊天软件、Webhook、设备路由与业务策略），底层则直接依赖 Pi 的 `pi-ai` 与 `pi-agent-core`——这正是严苛单向分层最直接的回报。',
            ],
            callout: {
              kind: 'idea',
              title: '外壳百花齐放，引擎始终如一',
              text: '因为 `pi-agent-core` 与终端渲染彻底解耦，OpenClaw 无需 fork 或魔改终端代码，就能把经过十万星社区打磨的 Agent Loop 装进自己的多通道外壳里。',
            },
            diffs: [
              { kind: 'add', text: '底座（Pi）：统一 LLM 调用、流式事件、双层循环、工具钩子' },
              { kind: 'add', text: '外壳（OpenClaw）：外部聊天通道、Webhook、服务发现与业务编排' },
            ],
            kpis: [
              { label: '官方标杆集成', value: 'OpenClaw', status: 'good' },
              { label: '复用包层', value: 'pi-ai + agent-core', status: 'good' },
              { label: 'TUI 耦合度', value: '0%', status: 'good' },
              { label: '集成方式', value: '原生 npm 依赖', status: 'good' },
            ],
            legend: [
              { color: PALETTE.orange, label: 'OpenClaw 外壳（多通道）' },
              { color: PALETTE.green, label: 'Pi 无头底座引擎' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '引擎与外壳分离：OpenClaw 直接复用 Pi 底层核心包',
              zones: [
                { id: 'oc-shell', x: 80, y: 70, w: 360, h: 420, label: 'OpenClaw 外壳（方向盘与通信通道）', tone: 'orange' },
                { id: 'pi-eng', x: 500, y: 70, w: 420, h: 420, label: 'Pi 无头引擎（直接依赖 npm 包）', tone: 'green' },
              ],
              nodes: [
                { id: 'chat', x: 260, y: 170, label: '聊天通道 / Webhook', sublabel: 'WhatsApp · IM · 外部触发', icon: 'message', tone: 'orange', active: true },
                { id: 'policy', x: 260, y: 350, label: '路由与业务工作流', sublabel: '权限策略 · 通道编排', icon: 'shield', tone: 'violet' },
                { id: 'pi-core', x: 710, y: 170, label: 'pi-agent-core', sublabel: '双层循环 · 转向与跟进', icon: 'loop', tone: 'green', active: true },
                { id: 'pi-ai', x: 710, y: 350, label: 'pi-ai', sublabel: '多模型统一流与容错', icon: 'brain', tone: 'blue', active: true },
              ],
              edges: [
                { from: 'chat', to: 'policy', packetColor: PALETTE.orange },
                { from: 'chat', to: 'pi-core', label: 'prompt / steer', packetColor: PALETTE.green, status: 'active' },
                { from: 'policy', to: 'pi-core', label: '注册工具与钩子', packetColor: PALETTE.violet },
                { from: 'pi-core', to: 'pi-ai', label: 'streamFn', packetColor: PALETTE.blue, status: 'active' },
              ],
              callouts: [
                { x: 710, y: 455, text: '完全跳过 pi-tui，零冗余依赖', tone: 'green' },
              ],
            },
          },

          // Step 7 (RECAP)
          {
            stepNumber: 7,
            shortLabel: '分层架构决策表',
            badge: 'RECAP',
            title: '总结：单向分层如何支撑长期演进',
            paragraphs: [
              '从 `pi-ai` 的协议归一，到 `pi-agent-core` 的 2,548 行纯粹循环，再到 `pi-tui` 零依赖差分渲染与 `pi-coding-agent` 四形态输出，每一层都守住了“向下依赖、向上透明”的铁律。',
              '下一章我们将真正钻进 `packages/agent/src/agent-loop.ts` 的心脏，逐行拆解内层 Turn 循环与双队列外层循环。',
            ],
            recapTable: [
              {
                question: '如何支持 15+ 厂商而不爆炸？',
                decision: '`pi-ai` 归一到 4 大 Wire 协议',
                because: '协议家族远少于厂商数量，抽象厚度直接降一个数量级',
              },
              {
                question: '为什么循环层与 UI 层彻底隔离？',
                decision: '`pi-agent-core` 零 UI 依赖，仅吐 `AgentEvent`',
                because: '同一套循环可同时驱动 TUI、RPC、SDK 与 OpenClaw 外部外壳',
              },
              {
                question: '为什么自研 `pi-tui` 不用前端框架？',
                decision: '保留模式组件 + 差分渲染 + `CSI 2026`',
                because: '高频流式吐字与大段代码块输出时零闪烁、极低 CPU 开销',
              },
              {
                question: '新旧仓库与包名怎么对应？',
                decision: '以 `earendil-works/pi` & `@earendil-works/*` 为准',
                because: '2026-05 迁移完成，`pi-web-ui` 已移除，新增 `pi-mcp`/`pi-codemode`',
              },
            ],
            kpis: [
              { label: '依赖结构', value: '严格无环 DAG', status: 'good' },
              { label: '核心体积', value: '2,548 行 TS', status: 'good' },
              { label: '交付形态', value: 'TUI/JSON/RPC/SDK', status: 'good' },
              { label: '生产验证', value: 'OpenClaw 无头复用', status: 'good' },
            ],
            legend: [
              { color: PALETTE.blue, label: '模型抽象层' },
              { color: PALETTE.green, label: 'Agent 核心循环层' },
              { color: PALETTE.violet, label: '产品交付与外延层' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '全栈分层收束图：四层各司其职',
              nodes: [
                { id: 'l1', x: 160, y: 270, label: 'L1 · pi-ai', sublabel: '多厂商 Wire 协议', icon: 'brain', tone: 'blue' },
                { id: 'l2', x: 390, y: 270, label: 'L2 · pi-agent-core', sublabel: '2,548 行双层循环', icon: 'loop', tone: 'green', active: true },
                { id: 'l3', x: 630, y: 270, label: 'L3 · pi-coding-agent', sublabel: '工具 · 会话 · 扩展', icon: 'cpu', tone: 'dark', active: true },
                { id: 'l4', x: 850, y: 170, label: 'TUI / CLI / RPC', sublabel: '官方多形态终端', icon: 'terminal', tone: 'violet' },
                { id: 'l5', x: 850, y: 375, label: 'OpenClaw 等应用', sublabel: '外部多通道生态', icon: 'sparkles', tone: 'orange' },
              ],
              edges: [
                { from: 'l1', to: 'l2', packetColor: PALETTE.blue, status: 'active' },
                { from: 'l2', to: 'l3', packetColor: PALETTE.green, status: 'active' },
                { from: 'l3', to: 'l4', packetColor: PALETTE.violet, status: 'active' },
                { from: 'l2', to: 'l5', curved: true, label: '直接嵌入', packetColor: PALETTE.orange },
              ],
            },
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // CHAPTER 02: Agent 双层主循环
  // ==========================================================================
  {
    id: 'ch02',
    number: 2,
    title: 'Agent 双层主循环',
    color: 'blue',
    lessons: [
      // ----------------------------------------------------------------------
      // LESSON 3: inner-loop (9 steps)
      // ----------------------------------------------------------------------
      {
        id: 'lesson-03-inner-loop',
        slug: 'inner-loop',
        chapterId: 'ch02',
        chapterNumber: 2,
        chapterTitle: 'Agent 双层主循环',
        lessonIndexInChapter: 1,
        totalInChapter: 3,
        title: '内层循环解剖：一次 Turn 的全链路',
        subtitle:
          '逐行追踪 `packages/agent/src/agent-loop.ts`：从 `agentLoop` 入口到 `finishTurn` 的完整回合流转',
        durationMin: 8,
        level: '核心',
        objectives: [
          {
            id: 'inner-1',
            text: '区分无状态单次 LLM 补全与有状态 `runLoop` 内层循环',
            completedAtStep: 2,
          },
          {
            id: 'inner-2',
            text: '掌握回合前准备链路：`prepareNextTurn` → `declareToolChanges` → `prepareRequest`',
            completedAtStep: 5,
          },
          {
            id: 'inner-3',
            text: '看清 `streamAssistantResponse` 如何流式组装响应并按 `toolCall` 分流',
            completedAtStep: 7,
          },
          {
            id: 'inner-4',
            text: '理解 `executeToolCalls` 结果回填与 `finishTurn` 终审钩子如何收敛循环',
            completedAtStep: 8,
          },
          {
            id: 'inner-5',
            text: '能将 `agent-loop.ts` 的每一个钩子精准对应到运行时阶段',
            completedAtStep: 9,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: '单次补全瓶颈',
            badge: 'PROBLEM',
            title: '没有闭环反馈，大模型只能纸上谈兵',
            paragraphs: [
              '一次普通的 LLM API 调用本质上是无状态函数：`f(messages) -> assistantMessage`。即使模型在输出里请求读取 `package.json` 或运行 `npm test`，API 本身并不会替你执行任何动作。',
              '要让大模型从“聊天机器人”进化成“自主编码 Agent”，核心就在一个持续运转的状态闭环：模型发出 `toolCall` → 本地执行工具 → 将 `toolResult` 追加回上下文 → 再次请求模型，直到任务真正收束。',
            ],
            callout: {
              kind: 'idea',
              title: '什么是 Turn（回合）？',
              text: '在 `pi-agent-core` 的定义里（`types.ts` L537），**一个 Turn = 一次模型流式响应 + 它所触发的全部工具调用与结果回填**。一个用户提问往往跨越多个 Turn。',
            },
            diffs: [
              { kind: 'remove', text: '单次请求：模型吐出 `toolCall` 后无人执行，流程直接中断' },
              { kind: 'add', text: 'Agent Loop：自动执行工具并把观测结果喂回下一轮推理' },
            ],
            kpis: [
              { label: '单次补全闭环', value: '无', status: 'bad' },
              { label: '真实环境观测', value: '缺失', status: 'bad' },
              { label: 'Pi 循环核心', value: 'runLoop()', status: 'good' },
              { label: '单回合定义', value: '1 LLM + N Tools', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.rose, label: '缺少执行闭环的断点' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '单次补全的死胡同：toolCall 发出后没有回流回路',
              nodes: [
                { id: 'u', x: 170, y: 270, label: '用户提问', sublabel: '“修复测试失败”', icon: 'user', tone: 'blue' },
                { id: 'm', x: 470, y: 270, label: 'LLM 单次补全', sublabel: '输出 toolCall: bash', icon: 'brain', tone: 'dark', active: true },
                { id: 'dead', x: 800, y: 270, label: '流程终止', sublabel: 'toolCall 无人执行', icon: 'alert', tone: 'rose', active: true },
              ],
              edges: [
                { from: 'u', to: 'm', label: '1 次请求', packetColor: PALETTE.blue, status: 'active' },
                { from: 'm', to: 'dead', label: '缺少闭环', packetColor: PALETTE.rose, status: 'error' },
              ],
              callouts: [
                { x: 635, y: 390, text: '需要一个持久运转的 while 循环接住 toolCall', tone: 'orange' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: 'agentLoop 入口',
            badge: 'SOLUTION',
            title: '`agentLoop` 与 `runAgentLoop`：创建事件流并播种初始上下文',
            paragraphs: [
              '当你调用 `agent.prompt("...")` 时，底层进入 `agentLoop(prompts, context, config, signal, streamFn)`。它立刻返回一个异步可迭代的 `EventStream<AgentEvent, AgentMessage[]>`，并在后台启动 `runAgentLoop`。',
              '进入主循环前，`runAgentLoop` 会先做三件确定的事：用 `declareToolChanges` 补齐工具变动声明、将初始消息合入 `currentContext.messages` 与 `newMessages`，并依次发射 `agent_start`、`turn_start` 以及初始提示的 `message_start`/`message_end`。',
            ],
            callout: {
              kind: 'tip',
              title: '为什么复制上下文快照？',
              text: '`currentContext = { ...context, messages: [...context.messages, ...initialMessages] }` 避免直接污染外部入参数组；所有本轮新产生的消息单独收拢进 `newMessages` 返回。',
            },
            sourceDrawer: {
              title: 'agentLoop 与 runAgentLoop 入口源码',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts#L52-L140',
              language: 'ts',
              code: `export function agentLoop(
  prompts: AgentMessage[],
  context: AgentContext,
  config: AgentLoopConfig,
  signal: AbortSignal | undefined,
  streamFn: StreamFn,
): EventStream<AgentEvent, AgentMessage[]> {
  const stream = createAgentStream();
  void runAgentLoop(prompts, context, config,
    async (event) => { stream.push(event); }, signal, streamFn
  ).then((messages) => stream.end(messages));
  return stream;
}

export async function runAgentLoop(/* ... */): Promise<AgentMessage[]> {
  const initialMessages = declareToolChanges(context, prompts);
  const newMessages: AgentMessage[] = [...initialMessages];
  const currentContext: AgentContext = {
    ...context, messages: [...context.messages, ...initialMessages],
  };
  await emit({ type: "agent_start" });
  await emit({ type: "turn_start" });
  for (const message of initialMessages) {
    await emit({ type: "message_start", message });
    await emit({ type: "message_end", message });
  }
  await runLoop(currentContext, newMessages, config, signal, emit, streamFn);
  return newMessages;
}`,
              caption: 'packages/agent/src/agent-loop.ts 第 52–140 行核心骨架',
            },
            kpis: [
              { label: '返回类型', value: 'EventStream', status: 'good' },
              { label: '首发事件', value: 'agent_start', status: 'neutral' },
              { label: '初始工具校验', value: 'declareToolChanges', status: 'good' },
              { label: '状态隔离', value: '浅拷贝快照', status: 'good' },
            ],
            legend: [
              { color: PALETTE.blue, label: '同步返回事件流' },
              { color: PALETTE.green, label: '异步驱动 runLoop' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'agentLoop 启动序列：事件流异步解耦与初始状态播种',
              nodes: [
                { id: 'prompt', x: 145, y: 270, label: 'Agent.prompt()', sublabel: '归一化用户消息', icon: 'user', tone: 'blue' },
                { id: 'entry', x: 355, y: 270, label: 'agentLoop()', sublabel: '立即返回 EventStream', icon: 'zap', tone: 'violet', active: true },
                { id: 'decl', x: 585, y: 170, label: 'declareToolChanges', sublabel: '检查工具清单差量', icon: 'wrench', tone: 'orange' },
                { id: 'emit', x: 585, y: 370, label: 'emit 启动事件', sublabel: 'agent_start · turn_start', icon: 'message', tone: 'blue' },
                { id: 'runloop', x: 830, y: 270, label: 'runLoop()', sublabel: '进入双层主循环', icon: 'loop', tone: 'green', size: 'lg', active: true },
              ],
              edges: [
                { from: 'prompt', to: 'entry', packetColor: PALETTE.blue, status: 'active' },
                { from: 'entry', to: 'decl', packetColor: PALETTE.orange, status: 'active' },
                { from: 'entry', to: 'emit', packetColor: PALETTE.violet, status: 'active' },
                { from: 'decl', to: 'runloop', packetColor: PALETTE.green, status: 'active' },
                { from: 'emit', to: 'runloop', packetColor: PALETTE.green, status: 'active' },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: 'prepareNextTurn',
            badge: 'TECHNIQUE',
            title: '回合间安全点：`prepareNextTurn` 与补漏转向轮询',
            paragraphs: [
              '首回合之后（`if (lastCompletedTurn)`），内层循环在发射下一个 `turn_start` 之前，会先调用 `config.prepareNextTurn?.(lastCompletedTurn)`。它可以整体替换下一回合的 `context`、`model`、`thinkingLevel`，或追加准备消息。',
              '在 `pi-coding-agent` 里，**多轮工具执行期间的自动上下文压缩**就挂在这里（commit `56700d4`）！而且因为压缩可能耗时数秒，源码紧接着做了一次**补漏轮询**：若之前 `pendingMessages` 为空，再 poll 一次 `getSteeringMessages()`，确保用户在压缩期间敲下的纠偏不会漏掉。',
            ],
            callout: {
              kind: 'idea',
              title: '防重复投递细节',
              text: '注意源码注释：`if (pendingMessages.length === 0)` 才会二次轮询！否则在 `one-at-a-time` 模式下会把两条队列消息同时塞进同一回合。',
            },
            diffs: [
              { kind: 'add', text: '仅在 Turn >= 2 执行 `prepareNextTurn(lastCompletedTurn)`' },
              { kind: 'add', text: '压缩耗时后补采转向队列，再发射新一轮 `turn_start`' },
            ],
            kpis: [
              { label: '触发时机', value: 'Turn >= 2', status: 'neutral' },
              { label: '核心用途', value: '回合间自动压缩', status: 'good' },
              { label: '支持热更项', value: 'ctx/model/thinking', status: 'good' },
              { label: '补漏轮询', value: '防压缩期丢消息', status: 'good' },
            ],
            legend: [
              { color: PALETTE.orange, label: '回合间准备与压缩' },
              { color: PALETTE.green, label: '补漏转向轮询' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Turn N → Turn N+1 安全点：prepareNextTurn 与补漏轮询',
              nodes: [
                { id: 'prev', x: 150, y: 270, label: '上一 Turn 结束', sublabel: 'lastCompletedTurn', icon: 'check', tone: 'neutral' },
                { id: 'prep', x: 390, y: 270, label: 'prepareNextTurn', sublabel: '自动压缩 · 切换模型', icon: 'sparkles', tone: 'orange', size: 'lg', active: true },
                { id: 'catchup', x: 630, y: 170, label: '补漏 Steering 轮询', sublabel: '仅当 pending 为空时', icon: 'queue', tone: 'green', active: true },
                { id: 'tstart', x: 840, y: 270, label: 'emit turn_start', sublabel: '正式开启下一回合', icon: 'loop', tone: 'blue', active: true },
              ],
              edges: [
                { from: 'prev', to: 'prep', label: '上下文超阈值?', packetColor: PALETTE.orange, status: 'active' },
                { from: 'prep', to: 'catchup', label: '耗时期可能新入队', packetColor: PALETTE.green, status: 'active' },
                { from: 'catchup', to: 'tstart', packetColor: PALETTE.blue, status: 'active' },
                { from: 'prep', to: 'tstart', label: '已有 pending 直接过', dashed: true, packetColor: PALETTE.blue },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: 'declareToolChanges',
            badge: 'TECHNIQUE',
            title: '工具清单增量声明：不篡改历史，只追加差量',
            paragraphs: [
              '在扩展热重载、用户切换只读工具、或 MCP 延迟加载新工具时，`context.tools`（运行时可执行工具集）会动态变化。如果直接回头改写开头的系统提示词，会瞬间击穿整个 Prompt Cache。',
              'Pi 的解法在 `declareToolChanges()`：它对比当前转录中已声明的工具集与 `context.tools`，只把差量 `toolsAdded` 与 `toolsRemoved` 打包成一条新的 `SystemMessage`，插在待发消息前追加进对话，既保证重放一致性，又保住前缀缓存。',
            ],
            callout: {
              kind: 'tip',
              title: '可重放不变量',
              text: '把所有 `SystemMessage` 按序重放，得到的工具声明永远严格等于当前可执行的 `context.tools`——这就是 Pi 消除“幻觉调用已下线工具”的机制。',
            },
            diffs: [
              { kind: 'remove', text: '原地修改首条 System Prompt（导致前缀 KV Cache 全量失效）' },
              { kind: 'add', text: '计算 `getToolStateChanges()` 并追加增量 `SystemMessage`' },
            ],
            kpis: [
              { label: '差量字段', value: 'toolsAdded / Removed', status: 'good' },
              { label: '无变化开销', value: '0（直接跳过）', status: 'good' },
              { label: '缓存影响', value: '前缀零失效', status: 'good' },
              { label: '实现文件', value: 'agent-loop.ts L347', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.green, label: '保持不变的已缓存前缀' },
              { color: PALETTE.orange, label: '尾部追加的增量 SystemMessage' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'declareToolChanges：对比可执行集合与历史声明，仅追加 Delta',
              nodes: [
                { id: 'hist', x: 170, y: 175, label: '已提交转录', sublabel: 'getCurrentTools()', icon: 'database', tone: 'green' },
                { id: 'exec', x: 170, y: 375, label: 'context.tools', sublabel: '当前可执行工具集', icon: 'wrench', tone: 'blue' },
                { id: 'diff', x: 470, y: 275, label: 'getToolStateChanges', sublabel: '计算 Added / Removed', icon: 'code', tone: 'orange', size: 'lg', active: true },
                { id: 'sysmsg', x: 800, y: 185, label: 'Delta SystemMessage', sublabel: '追加于 pending 之前', icon: 'sparkles', tone: 'orange', active: true },
                { id: 'noop', x: 800, y: 375, label: '原样透传', sublabel: '工具未变时零插入', icon: 'check', tone: 'green', dimmed: true },
              ],
              edges: [
                { from: 'hist', to: 'diff', packetColor: PALETTE.green, status: 'active' },
                { from: 'exec', to: 'diff', packetColor: PALETTE.blue, status: 'active' },
                { from: 'diff', to: 'sysmsg', label: '有增删', packetColor: PALETTE.orange, status: 'active' },
                { from: 'diff', to: 'noop', label: '无变化', dashed: true, packetColor: PALETTE.green },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: 'prepareRequest',
            badge: 'TECHNIQUE',
            title: '`prepareRequest`：每次请求模型前的最后一道阀门',
            paragraphs: [
              '当 `preparedMessages` 与 `pendingMessages` 都已追加并广播完毕，内层循环会在调用 LLM 前执行 `config.prepareRequest?.({ context, model, thinkingLevel }, signal)`。',
              '它与 `prepareNextTurn` 的关键区别在于：**`prepareRequest` 在每一次对话请求前都会触发——包括第一回合**，而且它不轮询任何消息队列，专门用来做虚拟模型路由、请求前上下文快照修正或动态调整思考等级。',
            ],
            callout: {
              kind: 'idea',
              title: '两个 Prepare 钩子如何分工？',
              text: '`prepareNextTurn` 面向“上一回合结束了，准备开启下一回合”（如压缩、补发消息）；`prepareRequest` 面向“马上要发 HTTP 请求了，做最终模型/思考级别/上下文微调”。',
            },
            diffs: [
              { kind: 'add', text: '每轮请求前必经（含 Turn 1），可返回 `{ context?, model?, thinkingLevel? }`' },
              { kind: 'change', text: '不可在此新增对话消息（`Omit<AgentLoopTurnUpdate, "messages">`）' },
            ],
            kpis: [
              { label: '触发范围', value: '全部请求（含 Turn 1）', status: 'good' },
              { label: '可修改项', value: 'ctx / model / thinking', status: 'neutral' },
              { label: '队列轮询', value: '不触发', status: 'good' },
              { label: '典型场景', value: 'Virtual Models 路由', status: 'good' },
            ],
            legend: [
              { color: PALETTE.violet, label: '请求前最终状态快照' },
              { color: PALETTE.blue, label: '送往流式 LLM 边界' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'prepareRequest 定位：位于待发消息落盘之后、LLM 请求之前',
              nodes: [
                { id: 'append', x: 165, y: 270, label: '消息已落盘', sublabel: 'pending 已清空', icon: 'database', tone: 'green' },
                { id: 'preq', x: 480, y: 270, label: 'prepareRequest()', sublabel: '含 Turn 1 · 不可插消息', icon: 'shield', tone: 'violet', size: 'lg', active: true },
                { id: 'stream', x: 810, y: 270, label: 'streamAssistantResponse', sublabel: '进入 LLM 边界', icon: 'brain', tone: 'blue', active: true },
              ],
              edges: [
                { from: 'append', to: 'preq', label: '最新 context', packetColor: PALETTE.green, status: 'active' },
                { from: 'preq', to: 'stream', label: '最终 model / thinking', packetColor: PALETTE.violet, status: 'active' },
              ],
              callouts: [
                { x: 480, y: 420, text: '返回值将覆盖本轮及后续默认 model / reasoning 配置', tone: 'violet' },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: '流式响应产出',
            badge: 'TECHNIQUE',
            title: '`streamAssistantResponse`：变换消息并实时流式吐字',
            paragraphs: [
              '跨越 LLM 边界的动作集中在 `streamAssistantResponse`：它先按 `transformContext` → `convertToLlm` → `normalizeContext` 把内部 `AgentMessage[]` 转为厂商可读的 `TranscriptContext`，再动态解析 `getApiKey`（适配会过期的 OAuth 令牌），调用 `streamFunction`。',
              '随后它 `for await` 消费底层流事件：收到 `start` 时先把 `partialMessage` 压入上下文并广播 `message_start`；每块 `text_delta` / `thinking_delta` / `toolcall_delta` 就地更新末条消息并广播 `message_update`；收到 `done`/`error` 时落盘完整 `AssistantMessage` 并广播 `message_end`。',
            ],
            callout: {
              kind: 'tip',
              title: '实时更新，零状态撕裂',
              text: '整个流式过程中，`context.messages[last]` 始终指向最新的 `partialMessage`，最终被 `finalMessage` 原地替换，保证事件订阅者看到连贯的单条消息生命周期。',
            },
            diffs: [
              { kind: 'add', text: '动态 `getApiKey(provider)`：防止长工具链执行后 OAuth Token 过期' },
              { kind: 'add', text: '记录实际请求的 `thinkingLevel` 到最终 `AssistantMessage`' },
            ],
            kpis: [
              { label: '消息边界变换', value: '4 阶段流水线', status: 'good' },
              { label: '流式增量事件', value: 'message_update', status: 'good' },
              { label: '增量内容种类', value: 'text / thinking / toolcall', status: 'neutral' },
              { label: '认证刷新', value: '每轮动态解析', status: 'good' },
            ],
            legend: [
              { color: PALETTE.blue, label: '消息变换与请求' },
              { color: PALETTE.green, label: '流式增量回写' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'streamAssistantResponse：单轮 LLM 流式生命周期',
              nodes: [
                { id: 'pipe', x: 165, y: 270, label: '消息变换管线', sublabel: 'transform → convert → norm', icon: 'layers', tone: 'violet' },
                { id: 'sfn', x: 430, y: 170, label: 'streamFn (pi-ai)', sublabel: '动态 API Key · 统一流', icon: 'brain', tone: 'blue', active: true },
                { id: 'delta', x: 740, y: 170, label: 'for await 增量块', sublabel: 'text / thinking / toolcall', icon: 'zap', tone: 'green', active: true },
                { id: 'final', x: 585, y: 385, label: 'Final AssistantMsg', sublabel: '原地定稿 · message_end', icon: 'check', tone: 'dark', active: true },
              ],
              edges: [
                { from: 'pipe', to: 'sfn', label: 'TranscriptContext', packetColor: PALETTE.violet, status: 'active' },
                { from: 'sfn', to: 'delta', label: 'SSE / WS 流', packetColor: PALETTE.blue, status: 'active' },
                { from: 'delta', to: 'final', label: 'done / error', packetColor: PALETTE.green, status: 'active' },
              ],
            },
          },

          // Step 7
          {
            stepNumber: 7,
            shortLabel: 'toolCall 分叉',
            badge: 'TECHNIQUE',
            title: '核心十字路口：检查 `stopReason` 与 `toolCalls`',
            paragraphs: [
              '拿到定稿的 `AssistantMessage` 后，`runLoop` 首先拦截异常终止：若 `stopReason` 是 `"error"` 或 `"aborted"`，立即走硬退出（调用 `finishTurn`、发 `turn_end` 与 `agent_end` 后 `return`）。',
              '正常返回时，源码过滤 `message.content.filter(c => c.type === "toolCall")`。如果没有任何工具调用，`hasMoreToolCalls` 置为 `false`，本轮进入收敛路径；如果存在工具调用，则还要先过一道 `stopReason === "length"` 截断检查，再决定是安全报错还是真正执行工具。',
            ],
            callout: {
              kind: 'warn',
              title: '先验 stopReason，再看 toolCalls',
              text: '这顺序极其考究：既保证被用户中止的响应绝不误跑工具，又保证被最大输出截断（`length`）的半残 JSON 参数被熔断拦截。',
            },
            diffs: [
              { kind: 'add', text: '分支 1：`error | aborted` → 硬退出，不执行工具、不轮询队列' },
              { kind: 'add', text: '分支 2：`toolCalls.length > 0` → 执行工具批（`length` 截断则安全失败）' },
              { kind: 'add', text: '分支 3：`toolCalls.length === 0` → `hasMoreToolCalls = false` 准备收敛' },
            ],
            kpis: [
              { label: '硬退出条件', value: 'error | aborted', status: 'warn' },
              { label: '截断熔断', value: 'stopReason === "length"', status: 'good' },
              { label: '继续条件', value: 'toolCalls.length > 0', status: 'good' },
              { label: '过滤字段', value: 'c.type === "toolCall"', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.rose, label: '异常硬退出' },
              { color: PALETTE.green, label: '工具执行路径' },
              { color: PALETTE.blue, label: '自然收敛路径' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'AssistantMessage 落盘后的三路分发',
              nodes: [
                { id: 'msg', x: 165, y: 270, label: 'AssistantMessage', sublabel: '含 content 与 stopReason', icon: 'message', tone: 'dark', active: true },
                { id: 'check', x: 430, y: 270, label: '三路分流判断', sublabel: 'stopReason & toolCalls', icon: 'git-branch', tone: 'violet', size: 'lg', active: true },
                { id: 'exit', x: 785, y: 105, label: '硬退出', sublabel: 'error / aborted 直接结束', icon: 'alert', tone: 'rose' },
                { id: 'exec', x: 785, y: 275, label: 'executeToolCalls', sublabel: '有 toolCall（含 length 防护）', icon: 'wrench', tone: 'green', active: true },
                { id: 'done', x: 785, y: 445, label: 'hasMore = false', sublabel: '纯文本回答 · 准备收尾', icon: 'check', tone: 'blue' },
              ],
              edges: [
                { from: 'msg', to: 'check', packetColor: PALETTE.violet, status: 'active' },
                { from: 'check', to: 'exit', label: 'error | aborted', packetColor: PALETTE.rose, status: 'error' },
                { from: 'check', to: 'exec', label: 'toolCalls > 0', packetColor: PALETTE.green, status: 'active' },
                { from: 'check', to: 'done', label: '无 toolCall', packetColor: PALETTE.blue },
              ],
            },
          },

          // Step 8
          {
            stepNumber: 8,
            shortLabel: '工具回填与终审',
            badge: 'SOLUTION',
            title: '回填 `toolResult`、`finishTurn` 终审与内层回跳',
            paragraphs: [
              '工具批次执行完成后，所有 `ToolResultMessage` 会按助手原始调用顺序追加进 `currentContext.messages` 与 `newMessages`，同时设置 `hasMoreToolCalls = !executedToolBatch.terminate`（全批次工具都声明 `terminate: true` 时可提前停止续调模型）。',
              '紧接着在 `turn_end` 之前调用 `config.finishTurn?.(lastCompletedTurn)`：若返回 `{ action: "end" }` 则直接结束整个 Run；否则广播 `turn_end`，轮询 `getSteeringMessages()`——只要 `hasMoreToolCalls || pendingMessages.length > 0`，内层 `while` 就立即开启下一回合！',
            ],
            callout: {
              kind: 'tip',
              title: '注意 finishTurn 与 turn_end 的精确顺序',
              text: '源码中 `finishTurn` 先于 `emit({ type: "turn_end" })` 执行，这样终审决策可以在本回合事件收尾后立刻决定是硬停（`agent_end`）还是继续下一回合。',
            },
            sourceDrawer: {
              title: '工具回填、finishTurn 与内层循环收敛源码',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts#L273-L313',
              language: 'ts',
              code: `const toolCalls = message.content.filter((c) => c.type === "toolCall");
const toolResults: ToolResultMessage[] = [];
hasMoreToolCalls = false;

if (toolCalls.length > 0) {
  const executedToolBatch = message.stopReason === "length"
    ? await failToolCallsFromTruncatedMessage(toolCalls, emit)
    : await executeToolCalls(currentContext, message, config, signal, emit);
  toolResults.push(...executedToolBatch.messages);
  hasMoreToolCalls = !executedToolBatch.terminate;
  for (const result of toolResults) {
    currentContext.messages.push(result);
    newMessages.push(result);
  }
}

lastCompletedTurn = { message, toolResults, context: currentContext, newMessages };
const decision = await config.finishTurn?.(lastCompletedTurn, signal);
await emit({ type: "turn_end", message, toolResults });
if (decision?.action === "end") {
  await emit({ type: "agent_end", messages: newMessages });
  return;
}
pendingMessages = (await config.getSteeringMessages?.()) || [];`,
              caption: 'packages/agent/src/agent-loop.ts 第 273–313 行完整收敛逻辑',
            },
            kpis: [
              { label: '结果回填顺序', value: '助手调用原序', status: 'good' },
              { label: '早停规则', value: '全批次 terminate', status: 'neutral' },
              { label: '终审钩子', value: 'finishTurn()', status: 'good' },
              { label: '内层续环条件', value: 'tools || steering', status: 'good' },
            ],
            legend: [
              { color: PALETTE.green, label: '回跳下一 Turn' },
              { color: PALETTE.orange, label: '转向队列介入' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '回填 toolResult → finishTurn 终审 → 内层 while 条件回跳',
              nodes: [
                { id: 'tools', x: 155, y: 190, label: 'executeToolCalls', sublabel: '返回 toolResults[]', icon: 'wrench', tone: 'green', active: true },
                { id: 'push', x: 390, y: 190, label: '回填上下文', sublabel: 'context & newMessages', icon: 'database', tone: 'blue', active: true },
                { id: 'fin', x: 635, y: 190, label: 'finishTurn + turn_end', sublabel: '可决策 end / continue', icon: 'shield', tone: 'violet', active: true },
                { id: 'steer', x: 635, y: 390, label: 'getSteeringMessages', sublabel: '检查运行中纠偏队列', icon: 'queue', tone: 'orange', active: true },
                { id: 'next', x: 155, y: 390, label: '回跳内层循环', sublabel: 'hasMore || pending > 0', icon: 'loop', tone: 'green', active: true },
              ],
              edges: [
                { from: 'tools', to: 'push', packetColor: PALETTE.green, status: 'active' },
                { from: 'push', to: 'fin', packetColor: PALETTE.blue, status: 'active' },
                { from: 'fin', to: 'steer', label: '未返回 end', packetColor: PALETTE.violet, status: 'active' },
                { from: 'steer', to: 'next', label: '满足续环条件', packetColor: PALETTE.green, status: 'active' },
                { from: 'next', to: 'tools', label: '下一 Turn', dashed: true, packetColor: PALETTE.green },
              ],
            },
          },

          // Step 9 (RECAP)
          {
            stepNumber: 9,
            shortLabel: '内层循环总结',
            badge: 'RECAP',
            title: '总结：一次 Turn 的 7 个确定性阶段',
            paragraphs: [
              '看似神奇的自主编码循环，剥开后不过 7 个严丝合缝的确定性步骤：回合准备 → 工具差量声明 → 请求前微调 → 流式推理 → 工具安全执行与回填 → 终审 → 转向轮询。',
              '下一课我们把视野拉高一层，看看 `getSteeringMessages` 与 `getFollowUpMessages` 这套双队列如何与外层 `while (true)` 配合，实现丝滑的异步人机协同。',
            ],
            recapTable: [
              {
                question: '回合间自动压缩放在哪里？',
                decision: '`prepareNextTurn(lastCompletedTurn)`',
                because: '仅在上一 Turn 完整落盘后触发，且紧跟一次补漏转向轮询',
              },
              {
                question: '工具清单变化如何不炸缓存？',
                decision: '`declareToolChanges()` 追加增量 `SystemMessage`',
                because: '只写 `toolsAdded`/`toolsRemoved` 差量，保持历史前缀不动',
              },
              {
                question: '请求前临时切模型在哪做？',
                decision: '`prepareRequest()` 钩子',
                because: '包括 Turn 1 在内的每次 Provider 请求前都会触发，且不扰动队列',
              },
              {
                question: '内层循环何时退出？',
                decision: '`!hasMoreToolCalls && pendingMessages.length === 0`',
                because: '既无待续工具结果，也无用户实时转向指令，交回外层循环判定',
              },
            ],
            kpis: [
              { label: '内层核心阶段', value: '7 步确定性流', status: 'good' },
              { label: '生命周期钩子', value: '3 个标准扩展点', status: 'good' },
              { label: '续环判据', value: 'tools || steering', status: 'good' },
              { label: '代码定位', value: 'agent-loop.ts', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.blue, label: '回合准备链' },
              { color: PALETTE.green, label: '推理与工具闭环' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '内层 Turn 闭环全貌（Inner Loop）',
              zones: [
                { id: 'inner-z', x: 75, y: 65, w: 850, h: 430, label: 'while (hasMoreToolCalls || pendingMessages.length > 0)', tone: 'blue' },
              ],
              nodes: [
                { id: 's1', x: 185, y: 175, label: '1. prepareNextTurn', sublabel: '压缩 + 补漏转向', icon: 'sparkles', tone: 'orange' },
                { id: 's2', x: 485, y: 175, label: '2. declare + preReq', sublabel: '差量工具 + 请求前微调', icon: 'shield', tone: 'violet' },
                { id: 's3', x: 795, y: 175, label: '3. streamAssistant', sublabel: '流式推理产出消息', icon: 'brain', tone: 'blue', active: true },
                { id: 's4', x: 795, y: 385, label: '4. executeToolCalls', sublabel: '执行并回填 toolResult', icon: 'wrench', tone: 'green', active: true },
                { id: 's5', x: 485, y: 385, label: '5. finishTurn', sublabel: '终审 + turn_end', icon: 'check', tone: 'dark' },
                { id: 's6', x: 185, y: 385, label: '6. getSteering', sublabel: '有则续环 · 无则出内层', icon: 'queue', tone: 'orange' },
              ],
              edges: [
                { from: 's1', to: 's2', packetColor: PALETTE.orange, status: 'active' },
                { from: 's2', to: 's3', packetColor: PALETTE.violet, status: 'active' },
                { from: 's3', to: 's4', label: 'toolCalls > 0', packetColor: PALETTE.green, status: 'active' },
                { from: 's4', to: 's5', packetColor: PALETTE.green, status: 'active' },
                { from: 's5', to: 's6', packetColor: PALETTE.blue, status: 'active' },
                { from: 's6', to: 's1', label: '下一回合', packetColor: PALETTE.green, status: 'active' },
              ],
            },
          },
        ],
      },

      // ----------------------------------------------------------------------
      // LESSON 4: steering-followup (8 steps)
      // ----------------------------------------------------------------------
      {
        id: 'lesson-04-steering-followup',
        slug: 'steering-followup',
        chapterId: 'ch02',
        chapterNumber: 2,
        chapterTitle: 'Agent 双层主循环',
        lessonIndexInChapter: 2,
        totalInChapter: 3,
        title: 'Steering vs Follow-up：双队列与外层循环',
        subtitle:
          '拆解 Pi 异步人机协同的灵魂：双队列消费模式、2026-03 延迟转向演进与双层 while 控制流',
        durationMin: 7,
        level: '核心',
        objectives: [
          {
            id: 'sf-1',
            text: '理解为什么单一输入队列会导致“想纠偏却排队、想排队却打断”的交互冲突',
            completedAtStep: 1,
          },
          {
            id: 'sf-2',
            text: '掌握 `PendingMessageQueue` 的两种排空模式：`one-at-a-time` 与 `all`',
            completedAtStep: 2,
          },
          {
            id: 'sf-3',
            text: '明确 `getSteeringMessages`（`Enter`）的注入时机与 `208a2cc` 不跳过工具批演进',
            completedAtStep: 4,
          },
          {
            id: 'sf-4',
            text: '掌握 `getFollowUpMessages`（`Alt+Enter`）与 `explicitContinuation` 驱动外层循环',
            completedAtStep: 6,
          },
          {
            id: 'sf-5',
            text: '能够完整勾勒 Pi 双层 `while` 循环的所有入口与自然退出条件',
            completedAtStep: 8,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: '单队列冲突',
            badge: 'PROBLEM',
            title: 'Agent 正在干活时，用户的两类插话完全互斥',
            paragraphs: [
              '当编码 Agent 正在连跑 6 步读文件与改代码时，你在输入框敲下一句话，意图其实截然不同：有时是**紧急纠偏**（“别改 `auth.ts` 了，去改 `session.ts`！”），有时则是**顺手排下一个活**（“等你修完这个 Bug，顺便补下单测”）。',
              '如果底层只有一条消息队列，系统根本猜不透你的意图：立刻注入会打乱正在收尾的当前任务；死等到整轮结束再注入，又会让 Agent 在错误方向白跑 5 轮浪费大量 Token。',
            ],
            callout: {
              kind: 'warn',
              title: '粗暴 Ctrl+C 的代价',
              text: '没有分层队列的 CLI 往往逼着用户按 `Esc`/`Ctrl+C` 硬中断——结果刚跑完的半截分析全丢，还得重新组织提示词。',
            },
            diffs: [
              { kind: 'remove', text: '单一输入队列：纠偏与排队语义混为一谈' },
              { kind: 'add', text: '双队列设计：把“中途转向”与“完成后跟进”彻底拆开' },
            ],
            kpis: [
              { label: '用户插话意图', value: '2 种互斥语义', status: 'warn' },
              { label: '单队列后果', value: '误打断或空耗', status: 'bad' },
              { label: 'Pi 解决方案', value: '双队列 + 双循环', status: 'good' },
              { label: '快捷键区分', value: 'Enter vs Alt+Enter', status: 'good' },
            ],
            legend: [
              { color: PALETTE.rose, label: '单队列语义冲突' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '单一队列的尴尬：两类截然不同的插话挤在同一个入口',
              nodes: [
                { id: 'c1', x: 170, y: 165, label: '紧急纠偏', sublabel: '“停！改错文件了”', icon: 'alert', tone: 'orange', active: true },
                { id: 'c2', x: 170, y: 375, label: '后续任务', sublabel: '“修完再帮我补测试”', icon: 'clock', tone: 'blue', active: true },
                { id: 'q1', x: 485, y: 270, label: '单一队列', sublabel: '无法区分缓急语义', icon: 'queue', tone: 'rose', size: 'lg', active: true },
                { id: 'bad1', x: 810, y: 165, label: '若立即插队', sublabel: '后续任务干扰当前修复', icon: 'alert', tone: 'rose' },
                { id: 'bad2', x: 810, y: 375, label: '若末尾才读', sublabel: '错方向白跑多轮工具', icon: 'alert', tone: 'rose' },
              ],
              edges: [
                { from: 'c1', to: 'q1', packetColor: PALETTE.orange, status: 'active' },
                { from: 'c2', to: 'q1', packetColor: PALETTE.blue, status: 'active' },
                { from: 'q1', to: 'bad1', packetColor: PALETTE.rose, status: 'error' },
                { from: 'q1', to: 'bad2', packetColor: PALETTE.rose, status: 'error' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: '双队列抽象',
            badge: 'TECHNIQUE',
            title: '`PendingMessageQueue`：`steer()` 与 `followUp()` 各自独立',
            paragraphs: [
              '2026 年初（commit `d0a4c37`），`Agent` 类正式将输入队列拆为两个独立的 `PendingMessageQueue`：`steeringQueue`（通过 `agent.steer(msg)` 入队，交互模式按 `Enter`）与 `followUpQueue`（通过 `agent.followUp(msg)` 入队，交互模式按 `Alt+Enter`）。',
              '两条队列都支持配置 `QueueMode`：默认 `"one-at-a-time"`（每次轮询只取出最老的 1 条，让模型先消化再看下一条），也可设为 `"all"`（一次性把积压消息全部注入）。',
            ],
            callout: {
              kind: 'tip',
              title: '为什么默认 `one-at-a-time`？',
              text: '如果用户连续发了 3 条微调或任务，一条条喂给模型可以让它每次聚焦一个目标，也给用户在第 1 条执行后撤回第 2、3 条的机会。',
            },
            sourceDrawer: {
              title: 'PendingMessageQueue 与双队列初始化源码',
              filePath: 'packages/agent/src/agent.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent.ts#L154-L185',
              language: 'ts',
              code: `export type QueueMode = "all" | "one-at-a-time";

class PendingMessageQueue {
  private messages: AgentMessage[] = [];
  public mode: QueueMode;

  peek(): AgentMessage[] {
    if (this.mode === "all") return this.messages.slice();
    const first = this.messages[0];
    return first ? [first] : [];
  }

  drain(): AgentMessage[] {
    const drained = this.peek();
    this.messages = this.messages.slice(drained.length);
    return drained;
  }
}

// Agent 构造函数默认值：
this.steeringQueue = new PendingMessageQueue(runtimeOptions.steeringMode ?? "one-at-a-time");
this.followUpQueue = new PendingMessageQueue(runtimeOptions.followUpMode ?? "one-at-a-time");`,
              caption: 'packages/agent/src/agent.ts 第 154–185 行 & 第 260–261 行',
            },
            kpis: [
              { label: 'Steering 默认模式', value: 'one-at-a-time', status: 'good' },
              { label: 'Follow-up 默认模式', value: 'one-at-a-time', status: 'good' },
              { label: '可选批量模式', value: '"all"', status: 'neutral' },
              { label: '队列拆分提交', value: 'd0a4c37', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.orange, label: 'Steering 转向队列（Enter）' },
              { color: PALETTE.blue, label: 'Follow-up 跟进队列（Alt+Enter）' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Agent 内部双队列结构与排空策略',
              zones: [
                {
                  id: 'sq-zone',
                  x: 110,
                  y: 75,
                  w: 360,
                  h: 170,
                  label: 'steeringQueue（Enter · 实时纠偏）',
                  tone: 'orange',
                  items: [
                    { label: 'S1', color: PALETTE.orange, filled: true },
                    { label: 'S2', color: PALETTE.orange, filled: true },
                    { label: '空', filled: false },
                  ],
                },
                {
                  id: 'fq-zone',
                  x: 110,
                  y: 295,
                  w: 360,
                  h: 170,
                  label: 'followUpQueue（Alt+Enter · 排队跟进）',
                  tone: 'blue',
                  items: [
                    { label: 'F1', color: PALETTE.blue, filled: true },
                    { label: 'F2', color: PALETTE.blue, filled: true },
                    { label: 'F3', color: PALETTE.blue, filled: true },
                  ],
                },
              ],
              nodes: [
                { id: 'sq', x: 290, y: 170, label: 'agent.steer()', sublabel: 'one-at-a-time | all', icon: 'queue', tone: 'orange', active: true },
                { id: 'fq', x: 290, y: 390, label: 'agent.followUp()', sublabel: 'one-at-a-time | all', icon: 'queue', tone: 'blue', active: true },
                { id: 'inner', x: 740, y: 170, label: '内层循环轮询口', sublabel: 'getSteeringMessages()', icon: 'loop', tone: 'green', active: true },
                { id: 'outer', x: 740, y: 390, label: '外层循环轮询口', sublabel: 'getFollowUpMessages()', icon: 'layers', tone: 'violet', active: true },
              ],
              edges: [
                { from: 'sq', to: 'inner', label: 'drain() · Turn 后切入', packetColor: PALETTE.orange, status: 'active' },
                { from: 'fq', to: 'outer', label: 'drain() · 停机前切入', packetColor: PALETTE.blue, status: 'active' },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: 'Steering 实时转向',
            badge: 'TECHNIQUE',
            title: '`getSteeringMessages`（`Enter`）：在下一轮推理前无缝纠偏',
            paragraphs: [
              'Steering 消息作用于**内层循环**。当你在 Agent 执行工具期间敲下指令并按 `Enter`，消息进入 `steeringQueue`，不会强杀正在跑的命令或切断 HTTP 流。',
              '一旦当前回合的工具批全部执行完毕并落盘，内层循环末尾会立刻调用 `getSteeringMessages()`（压缩耗时期还会补 poll 一次）。取出的纠偏消息将作为 `pendingMessages` 追加进上下文，在**下一次调用 LLM 之前**马上把模型拉回正轨。',
            ],
            callout: {
              kind: 'idea',
              title: '优雅转向 > 硬打断',
              text: '不粗暴中断当前工具，既保全了已产生的合法 `toolResult`，又在下一个推理点立刻注入新指令，让模型带着最新观测顺畅转弯。',
            },
            diffs: [
              { kind: 'add', text: '轮询点 1：循环启动前（抓用户在启动间隙敲下的消息）' },
              { kind: 'add', text: '轮询点 2：每轮 `turn_end` 后（紧接工具批完成）+ `prepareNextTurn` 补漏' },
            ],
            kpis: [
              { label: '交互快捷键', value: 'Enter', status: 'good' },
              { label: '作用层级', value: '内层 while 循环', status: 'good' },
              { label: '网络/进程打断', value: '不粗暴中断', status: 'good' },
              { label: '生效延迟', value: '下一 Turn 立即生效', status: 'good' },
            ],
            legend: [
              { color: PALETTE.orange, label: 'Steering 转向注入流' },
              { color: PALETTE.green, label: '内层工具执行闭环' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Steering 注入点：紧接本轮工具完成，先于下次 LLM 调用',
              nodes: [
                { id: 'llm', x: 165, y: 170, label: 'Turn N 推理', sublabel: '发出工具调用', icon: 'brain', tone: 'blue' },
                { id: 'tools', x: 465, y: 170, label: '工具批执行完毕', sublabel: 'toolResults 全部落盘', icon: 'wrench', tone: 'green', active: true },
                { id: 'poll', x: 785, y: 170, label: 'getSteeringMessages', sublabel: '取出“改用 session.ts”', icon: 'queue', tone: 'orange', active: true, badge: 'Enter' },
                { id: 'inject', x: 785, y: 385, label: '追加至 Context', sublabel: 'emit message_start/end', icon: 'message', tone: 'orange', active: true },
                { id: 'llm2', x: 315, y: 385, label: 'Turn N+1 推理', sublabel: '带着纠偏立即转向', icon: 'sparkles', tone: 'green', size: 'lg', active: true },
              ],
              edges: [
                { from: 'llm', to: 'tools', packetColor: PALETTE.blue },
                { from: 'tools', to: 'poll', label: 'turn_end 后', packetColor: PALETTE.green, status: 'active' },
                { from: 'poll', to: 'inject', label: 'pending > 0', packetColor: PALETTE.orange, status: 'active' },
                { from: 'inject', to: 'llm2', label: '内层回跳', packetColor: PALETTE.orange, status: 'active' },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: '2026-03 演进真相',
            badge: 'INSIGHT',
            title: '源码纠偏（`208a2cc`）：不再中途跳过同轮剩余工具！',
            paragraphs: [
              '很多早期中文源码解析文章仍写着：“Pi 每执行完一个工具就会检查 Steering，一旦有消息就跳过该轮剩余工具并伪造错误结果。”——**那是 2026 年 3 月之前的旧行为**。',
              '2026-03-16 提交 `208a2cc`（`fix(agent): defer steering until after tool execution`）彻底重构了这一行为，并为后来默认开启**并行工具执行（`parallel`）**铺平了道路。当前 `types.ts` 白纸黑字写明：**当前助手消息发出的工具调用绝不会被中途跳过**，Steering 统一在整批工具完成后整洁切入。',
            ],
            callout: {
              kind: 'warn',
              title: '为什么要做这个架构取舍？',
              text: '当单轮多个工具并行执行时，“中途跳过剩下工具”会产生竞态与半成品副作用；把同一助手消息的工具批视为原子执行单元，语义更干净，事件序也完全确定。',
            },
            sourceDrawer: {
              title: 'types.ts 对当前 Steering 时机的权威注释',
              filePath: 'packages/agent/src/types.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/agent/src/types.ts#L287-L298',
              language: 'ts',
              code: `/**
 * Returns steering messages to inject into the conversation mid-run.
 *
 * Called after the current assistant turn finishes executing its tool calls,
 * unless \`finishTurn\` ends the run.
 * If messages are returned, they are added to the context before the next LLM call.
 * Tool calls from the current assistant message are not skipped.
 */
getSteeringMessages?: () => Promise<AgentMessage[]>;`,
              caption: 'earendil-works/pi main 分支 types.ts 第 287–298 行（commit 208a2cc 后生效）',
            },
            diffs: [
              { kind: 'remove', text: '旧版（<2026-03）：串行工具间隙插检 Steering，跳过剩余工具' },
              { kind: 'add', text: '现行（`208a2cc` 后）：整批工具原子完成（支持并发），随后再注入 Steering' },
            ],
            kpis: [
              { label: '关键演进提交', value: '208a2cc (2026-03)', status: 'good' },
              { label: '当前工具批行为', value: '永不中途跳过', status: 'good' },
              { label: '解锁能力', value: '默认 parallel 并发', status: 'good' },
              { label: '硬中止通道', value: '仍可用 Esc/Abort', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.rose, label: '旧版中途跳过（已废弃）', dashed: true },
              { color: PALETTE.green, label: '现行整批完成后整洁转向' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '新旧对比：为什么 208a2cc 将 Steering 后移到工具批之后',
              zones: [
                { id: 'old-z', x: 80, y: 65, w: 840, h: 175, label: '旧版（2026-03 前）：串行间隙打断，剩余工具被伪造报错跳过', tone: 'rose', dashed: true },
                { id: 'new-z', x: 80, y: 275, w: 840, h: 210, label: '现行 main（208a2cc 后）：并发执行整批工具，完成后整洁切入 Steering', tone: 'green' },
              ],
              nodes: [
                { id: 'o1', x: 200, y: 155, label: 'Tool #1', sublabel: '执行完', icon: 'wrench', tone: 'neutral', dimmed: true },
                { id: 'os', x: 480, y: 155, label: '中途检出 Steering', sublabel: '打断批次', icon: 'alert', tone: 'rose', dimmed: true },
                { id: 'o2', x: 770, y: 155, label: 'Tool #2 / #3', sublabel: '被迫跳过报错', icon: 'alert', tone: 'rose', dimmed: true },
                { id: 'n1', x: 230, y: 380, label: 'Tool #1 #2 #3', sublabel: 'Promise.all 并发完成', icon: 'zap', tone: 'green', active: true },
                { id: 'n2', x: 540, y: 380, label: 'getSteeringMessages', sublabel: '批次落盘后整洁轮询', icon: 'queue', tone: 'orange', active: true },
                { id: 'n3', x: 810, y: 380, label: '下一 Turn LLM', sublabel: '全量结果 + 新指令', icon: 'brain', tone: 'blue', active: true },
              ],
              edges: [
                { from: 'o1', to: 'os', dashed: true, packetColor: PALETTE.rose, status: 'dimmed' },
                { from: 'os', to: 'o2', label: '跳过', dashed: true, packetColor: PALETTE.rose, status: 'error' },
                { from: 'n1', to: 'n2', label: '无竞态', packetColor: PALETTE.green, status: 'active' },
                { from: 'n2', to: 'n3', label: '立即转向', packetColor: PALETTE.orange, status: 'active' },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: 'Follow-up 排队跟进',
            badge: 'TECHNIQUE',
            title: '`getFollowUpMessages`（`Alt+Enter`）：等当前活彻底干完再无缝衔接',
            paragraphs: [
              '与 Steering 相对的是 `getFollowUpMessages()`，它被严格安放在**内层循环完全退出之后**、外层 `while (true)` 准备 `break` 停机之前。',
              '当你按下 `Alt+Enter` 排入一条后续指令（比如“改完以后帮我跑一遍 lint 并总结改动”），它会在整个内层工具链与 Steering 都尘埃落定时才被取出，赋给 `pendingMessages` 并执行外层 `continue`，自动拉起新一轮完整任务。',
            ],
            callout: {
              kind: 'tip',
              title: '两类队列零干扰的精妙之处',
              text: '只要内层循环还在调用工具或消化 Steering，`followUpQueue` 就静静躺在外面不被触碰——当前任务绝不会半途跑偏。',
            },
            diffs: [
              { kind: 'add', text: '仅在内层循环自然收敛（无工具、无 Steering）后轮询' },
              { kind: 'add', text: '有 Follow-up 时将消息塞入 `pendingMessages` 并 `continue` 外层循环' },
            ],
            kpis: [
              { label: '交互快捷键', value: 'Alt+Enter', status: 'good' },
              { label: '作用层级', value: '外层 while (true)', status: 'good' },
              { label: '打扰当前任务', value: '绝不打扰', status: 'good' },
              { label: '无人值守串联', value: '连续多任务', status: 'good' },
            ],
            legend: [
              { color: PALETTE.blue, label: 'Follow-up 外层续跑流' },
              { color: PALETTE.green, label: '内层任务自然收敛' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Follow-up 触发路径：内层收工 → 外层探队列 → 重新点火',
              nodes: [
                { id: 'inner-done', x: 175, y: 200, label: '内层循环退出', sublabel: '无 toolCall · 无 Steering', icon: 'check', tone: 'green', active: true },
                { id: 'fu-poll', x: 490, y: 200, label: 'getFollowUpMessages', sublabel: '检查 Alt+Enter 队列', icon: 'queue', tone: 'blue', size: 'lg', active: true, badge: 'Alt+Enter' },
                { id: 'reenter', x: 490, y: 405, label: 'pending = followUps', sublabel: '外层 continue 重进内层', icon: 'loop', tone: 'violet', active: true },
                { id: 'stop', x: 825, y: 200, label: 'emit agent_end', sublabel: '队列为空 · 正式停机', icon: 'shield', tone: 'dark' },
              ],
              edges: [
                { from: 'inner-done', to: 'fu-poll', label: '准备停机', packetColor: PALETTE.green, status: 'active' },
                { from: 'fu-poll', to: 'reenter', label: 'length > 0', packetColor: PALETTE.blue, status: 'active' },
                { from: 'reenter', to: 'inner-done', label: '新一轮任务', curved: true, packetColor: PALETTE.violet, status: 'active' },
                { from: 'fu-poll', to: 'stop', label: '队列为空', dashed: true, packetColor: PALETTE.blue },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: 'explicitContinuation',
            badge: 'TECHNIQUE',
            title: '`finishTurn` 的兜底续行：`explicitContinuation` 零重复设计',
            paragraphs: [
              '除了用户消息，扩展或运行时钩子也可以在 `finishTurn` 里返回 `{ action: "continue" }`，要求“即使没有新用户输入，也再让模型思考一轮”（例如校验器发现输出未达标）。',
              'Pi 的去重细节非常干净：如果本轮本来就有 `hasMoreToolCalls`、新 `steering` 或 `followUp` 消息，它们已经足够触发下一次模型请求，`explicitContinuation` 会被自动清零**绝不产生多余请求**；只有在所有自然驱动源都为空时，外层循环才补跑一轮纯上下文续行。',
            ],
            callout: {
              kind: 'idea',
              title: '优先级一目了然',
              text: '外层驱动优先级严格有序：**工具结果 / Steering（内层） > Follow-up（外层） > `explicitContinuation`（兜底） > `agent_end`（退出）**。',
            },
            diffs: [
              { kind: 'add', text: '任何自然触发（工具 / Steering / Follow-up）都会自动满足并清零 `explicitContinuation`' },
              { kind: 'add', text: '全部为空时，由外层 `if (explicitContinuation)` 兜底触发 1 次上下文续行' },
            ],
            kpis: [
              { label: '触发来源', value: 'finishTurn(): continue', status: 'neutral' },
              { label: '重复请求保护', value: '自然调度优先去重', status: 'good' },
              { label: '兜底执行次数', value: '精确 1 次上下文 Turn', status: 'good' },
              { label: '优先级排序', value: '最低（退出前最后）', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.violet, label: 'explicitContinuation 兜底续行' },
              { color: PALETTE.green, label: '已被自然调度满足（清零）' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'explicitContinuation 去重与兜底优先级链',
              nodes: [
                { id: 'dec', x: 165, y: 270, label: 'finishTurn 决策', sublabel: 'action: "continue"', icon: 'git-branch', tone: 'violet', active: true },
                { id: 'nat', x: 470, y: 165, label: '有工具 / 转向 / 跟进?', sublabel: '已存在自然续行源', icon: 'check', tone: 'green' },
                { id: 'clear', x: 800, y: 165, label: '清零不重复', sublabel: '直接走自然续行', icon: 'zap', tone: 'green', active: true },
                { id: 'fallback', x: 640, y: 385, label: '兜底续行 1 轮', sublabel: '重置标志 · 外层 continue', icon: 'loop', tone: 'violet', active: true },
              ],
              edges: [
                { from: 'dec', to: 'nat', packetColor: PALETTE.violet, status: 'active' },
                { from: 'nat', to: 'clear', label: '是（已满足）', packetColor: PALETTE.green, status: 'active' },
                { from: 'nat', to: 'fallback', label: '否（全为空）', packetColor: PALETTE.violet, status: 'active' },
              ],
            },
          },

          // Step 7
          {
            stepNumber: 7,
            shortLabel: '双层 while 全景',
            badge: 'SOLUTION',
            title: '双层 `while` 全景：20 行控制流撑起全部异步交互',
            paragraphs: [
              '把内层循环、双队列与兜底续行拼在一起，你就能看到 `pi-agent-core` 最优雅的骨架——外层 `while (true)` 守住任务连续性（Follow-up + 兜底续行），内层 `while (hasMoreToolCalls || pendingMessages.length > 0)` 守住工具闭环与实时纠偏（Tools + Steering）。',
              '整套控制流没有任何隐式事件总线或复杂状态机框架，打开源码 30 秒就能完整心算所有状态转移。',
            ],
            sourceDrawer: {
              title: '双层 while 主循环核心骨架源码',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts#L190-L335',
              language: 'ts',
              code: `let pendingMessages = (await config.getSteeringMessages?.()) || [];

// Outer loop: continues when queued follow-up messages arrive after agent would stop
while (true) {
  let hasMoreToolCalls = true;

  // Inner loop: process tool calls and steering messages
  while (hasMoreToolCalls || pendingMessages.length > 0) {
    // prepareNextTurn -> declareToolChanges -> prepareRequest
    // -> streamAssistantResponse -> executeToolCalls -> finishTurn
    pendingMessages = (await config.getSteeringMessages?.()) || [];
    if (hasMoreToolCalls || pendingMessages.length > 0) explicitContinuation = false;
  }

  // Agent would stop here. Check for follow-up messages.
  const followUpMessages = (await config.getFollowUpMessages?.()) || [];
  if (followUpMessages.length > 0) {
    explicitContinuation = false;
    pendingMessages = followUpMessages;
    continue;
  }
  if (explicitContinuation) {
    explicitContinuation = false;
    continue;
  }
  break;
}
await emit({ type: "agent_end", messages: newMessages });`,
              caption: 'packages/agent/src/agent-loop.ts 第 190–335 行精简控制流',
            },
            kpis: [
              { label: '外层循环职责', value: 'Follow-up + 兜底续行', status: 'good' },
              { label: '内层循环职责', value: 'Tools + Steering', status: 'good' },
              { label: '唯一自然出口', value: 'break → agent_end', status: 'good' },
              { label: '状态机复杂度', value: '2 个布尔 + 1 队列', status: 'good' },
            ],
            legend: [
              { color: PALETTE.blue, label: '内层工具与转向闭环' },
              { color: PALETTE.violet, label: '外层跟进与兜底闭环' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Pi 双层 while 主循环全景图',
              zones: [
                { id: 'outer-z', x: 60, y: 45, w: 880, h: 465, label: '外层 while (true)：任务级连续性', tone: 'violet' },
                { id: 'inner-z', x: 105, y: 95, w: 540, h: 255, label: '内层 while (hasMoreToolCalls || pendingMessages.length > 0)', tone: 'blue' },
              ],
              nodes: [
                { id: 'llm', x: 225, y: 215, label: 'LLM 推理', sublabel: 'streamAssistant', icon: 'brain', tone: 'blue', active: true },
                { id: 'tool', x: 495, y: 215, label: '工具批 + Steering', sublabel: '全部完成再检转向', icon: 'wrench', tone: 'green', active: true },
                { id: 'fu', x: 495, y: 430, label: 'Follow-up / 续行', sublabel: 'getFollowUpMessages()', icon: 'queue', tone: 'violet', active: true },
                { id: 'end', x: 810, y: 430, label: 'agent_end', sublabel: '返回 newMessages[]', icon: 'check', tone: 'dark' },
              ],
              edges: [
                { from: 'llm', to: 'tool', label: 'toolCalls', packetColor: PALETTE.green, status: 'active' },
                { from: 'tool', to: 'llm', curved: true, label: 'tools || steering', packetColor: PALETTE.orange, status: 'active' },
                { from: 'tool', to: 'fu', label: '内层退出', packetColor: PALETTE.blue, status: 'active' },
                { from: 'fu', to: 'llm', label: '外层 continue', packetColor: PALETTE.violet, status: 'active' },
                { from: 'fu', to: 'end', label: '全部为空 break', dashed: true, packetColor: PALETTE.blue },
              ],
            },
          },

          // Step 8 (RECAP)
          {
            stepNumber: 8,
            shortLabel: '双队列决策表',
            badge: 'RECAP',
            title: '总结：如何正确使用 Steering 与 Follow-up',
            paragraphs: [
              '记住一个直观口诀：**改当前方向按 `Enter`（Steering），排下一件事按 `Alt+Enter`（Follow-up）**。双层循环让两者各走各的轨道，既不互相干扰，也不破坏工具批次的原子性。',
              '下一课我们把目光转向最容易被教程忽略、却决定生产稳定性的另一半：异常、用户 `Abort` 与输出截断熔断。',
            ],
            recapTable: [
              {
                question: '想在 Agent 跑偏时立刻纠偏？',
                decision: '`steer()` / `Enter` → `getSteeringMessages`',
                because: '在当前工具批落盘后、下一次调用 LLM 前立即注入内层循环',
              },
              {
                question: '为什么不中途跳过当前未执行工具？',
                decision: '自 `208a2cc` 起保证同轮工具批完整执行',
                because: '兼容默认并发工具模式，避免竞态与残缺副作用；真要硬停用 Abort',
              },
              {
                question: '想等当前任务彻底结束再跑下一步？',
                decision: '`followUp()` / `Alt+Enter` → `getFollowUpMessages`',
                because: '只在外层循环即将停机时取出，绝不打断正在收敛的当前任务',
              },
              {
                question: '连续排队 3 条消息怎么投递？',
                decision: '默认 `one-at-a-time`，可切 `all`',
                because: '逐条消化焦点更稳，也允许用户中途清空尚未消费的队列',
              },
            ],
            kpis: [
              { label: 'Steering 触发', value: 'Enter（Turn 后）', status: 'good' },
              { label: 'Follow-up 触发', value: 'Alt+Enter（停机前）', status: 'good' },
              { label: '工具批原子性', value: '208a2cc 保障', status: 'good' },
              { label: '默认排空策略', value: 'one-at-a-time', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.orange, label: '内层实时转向' },
              { color: PALETTE.blue, label: '外层排队跟进' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '双队列协同心智模型',
              nodes: [
                { id: 'u', x: 165, y: 270, label: '开发者实时输入', sublabel: '运行中随时键入', icon: 'user', tone: 'neutral' },
                { id: 's', x: 485, y: 155, label: 'Enter · Steering', sublabel: '本轮工具完立即转向', icon: 'zap', tone: 'orange', active: true },
                { id: 'f', x: 485, y: 385, label: 'Alt+Enter · Follow-up', sublabel: '整轮收工后无缝续跑', icon: 'clock', tone: 'blue', active: true },
                { id: 'a', x: 815, y: 270, label: '双层 while 循环', sublabel: '可预测的异步协同', icon: 'loop', tone: 'green', size: 'lg', active: true },
              ],
              edges: [
                { from: 'u', to: 's', label: '改方向', packetColor: PALETTE.orange, status: 'active' },
                { from: 'u', to: 'f', label: '排新活', packetColor: PALETTE.blue, status: 'active' },
                { from: 's', to: 'a', label: '进内层', packetColor: PALETTE.orange, status: 'active' },
                { from: 'f', to: 'a', label: '进外层', packetColor: PALETTE.blue, status: 'active' },
              ],
            },
          },
        ],
      },

      // ----------------------------------------------------------------------
      // LESSON 5: abort-and-guards (7 steps)
      // ----------------------------------------------------------------------
      {
        id: 'lesson-05-abort-and-guards',
        slug: 'abort-and-guards',
        chapterId: 'ch02',
        chapterNumber: 2,
        chapterTitle: 'Agent 双层主循环',
        lessonIndexInChapter: 3,
        totalInChapter: 3,
        title: '异常、Abort 与截断保护',
        subtitle:
          '为什么生产级 Agent 不能靠 try/catch 裸奔：AbortSignal 穿透、length 熔断与无损续跑契约',
        durationMin: 6,
        level: '核心',
        objectives: [
          {
            id: 'ab-1',
            text: '识别生产环境 Agent 循环的 3 大致命隐患（悬空工具调用、截断参数、状态卡死）',
            completedAtStep: 1,
          },
          {
            id: 'ab-2',
            text: '掌握 `AbortController` 全链路穿透与“零悬空 `toolResult`”不变量（`4438c58`）',
            completedAtStep: 2,
          },
          {
            id: 'ab-3',
            text: '理解 `stopReason === "error" | "aborted"` 硬退出路径与 `handleRunFailure` 兜底',
            completedAtStep: 3,
          },
          {
            id: 'ab-4',
            text: '掌握 `stopReason === "length"` 截断熔断（`failToolCallsFromTruncatedMessage`）',
            completedAtStep: 4,
          },
          {
            id: 'ab-5',
            text: '明确 `agentLoopContinue` / `Agent.continue()` 的无损重试前提与队列回退规则',
            completedAtStep: 6,
          },
        ],
        steps: [
          // Step 1
          {
            stepNumber: 1,
            shortLabel: '生产三大陷阱',
            badge: 'PROBLEM',
            title: '玩具循环在真实世界会死在哪 3 个地方？',
            paragraphs: [
              '一个 30 行的 Demo 循环在演示视频里跑得飞快，但放到真实代码仓库很快会撞上三座暗礁：① 用户半路按 `Esc` 中止了某个工具，导致转录里出现有 `toolCall` 却缺 `toolResult` 的**悬空记录**，下次发给 Anthropic/OpenAI 直接触发 HTTP 400 永久报废整个会话；',
              '② 模型撞上最大输出上限（`stopReason === "length"`），JSON 工具参数只吐到一半就被强行解析执行；③ 流式请求抛出未捕获异常，UI 永远卡死在 `isStreaming: true`。',
            ],
            callout: {
              kind: 'warn',
              title: 'Provider 协议的铁律',
              text: '几乎所有大模型 API 都强制要求：每一条 `assistant` 消息中的每一个 `toolCall.id`，后面都必须紧跟对应的 `toolResult`——少一个，整段历史都会被拒收。',
            },
            diffs: [
              { kind: 'remove', text: '裸跑 `try/catch`：悬空 toolCall、半截参数误执行、UI 假死' },
              { kind: 'add', text: 'Pi 工业级护栏：Abort 补齐 + length 熔断 + 永不 reject 契约' },
            ],
            kpis: [
              { label: '悬空 toolCall 后果', value: 'HTTP 400 废会话', status: 'bad' },
              { label: '截断参数风险', value: '误写/残缺文件', status: 'bad' },
              { label: '未捕获异常后果', value: 'isStreaming 死锁', status: 'bad' },
              { label: 'Pi 防护覆盖', value: '全链路兜底', status: 'good' },
            ],
            legend: [
              { color: PALETTE.rose, label: '三类高危生产故障' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '生产环境 Agent 循环的三大致命故障面',
              nodes: [
                { id: 'loop', x: 185, y: 270, label: '裸奔 Agent 循环', sublabel: '无护栏 Demo', icon: 'loop', tone: 'dark' },
                { id: 'f1', x: 540, y: 105, label: '故障 1：悬空 toolCall', sublabel: '中止后缺少 toolResult', icon: 'alert', tone: 'rose', active: true },
                { id: 'f2', x: 540, y: 275, label: '故障 2：截断 JSON 参数', sublabel: 'max_tokens 砍断 write/bash', icon: 'alert', tone: 'orange', active: true },
                { id: 'f3', x: 540, y: 445, label: '故障 3：异常卡死状态', sublabel: 'isStreaming 永不释放', icon: 'alert', tone: 'rose', active: true },
                { id: 'boom', x: 840, y: 270, label: '会话崩溃 / 损坏', sublabel: '不可恢复', icon: 'shield', tone: 'rose' },
              ],
              edges: [
                { from: 'loop', to: 'f1', packetColor: PALETTE.rose, status: 'error' },
                { from: 'loop', to: 'f2', packetColor: PALETTE.orange, status: 'error' },
                { from: 'loop', to: 'f3', packetColor: PALETTE.rose, status: 'error' },
                { from: 'f1', to: 'boom', packetColor: PALETTE.rose, status: 'error' },
                { from: 'f2', to: 'boom', packetColor: PALETTE.orange, status: 'error' },
                { from: 'f3', to: 'boom', packetColor: PALETTE.rose, status: 'error' },
              ],
            },
          },

          // Step 2
          {
            stepNumber: 2,
            shortLabel: 'Abort 零悬空',
            badge: 'TECHNIQUE',
            title: '`AbortController` 全链路穿透与“零悬空 `toolResult`”不变量',
            paragraphs: [
              '每次运行开始时，`Agent` 都会新建一枚 `AbortController`，将其 `signal` 穿透传给 `streamFn`、`prepareToolCall`、`beforeToolCall`、`tool.execute` 与 `afterToolCall`。',
              '最关键的是 `prepareToolCall` 的第一行守卫（commit `4438c58` / `#9986`）：一旦检测到 `signal?.aborted`，它跳过后续钩子与执行，但**仍然立即合成一条 `{ isError: true, content: "Operation aborted" }` 的 `toolResult`**，保证同批次里哪怕第 2、3 个工具没跑，也不会在历史里留下半个悬空 `toolCall`！',
            ],
            callout: {
              kind: 'tip',
              title: '交互层贴心复位',
              text: '在 `pi-coding-agent` 交互模式中，用户按中止键停止当前 Run 后，尚未消费的队列消息会被退回编辑器，不会平白丢失。',
            },
            sourceDrawer: {
              title: 'Abort 首行检查确保每个工具都有 toolResult',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts#L721-L729',
              language: 'ts',
              code: `async function prepareToolCall(/* ... */) {
  // Once aborted, skip preparation and the hooks; callers still record
  // this result, so no call is left without one (#9986).
  if (signal?.aborted) {
    return {
      kind: "immediate",
      result: createErrorToolResult("Operation aborted"),
      isError: true,
    };
  }
  // ... lookup -> prepareArguments -> validate -> beforeToolCall
}`,
              caption: 'packages/agent/src/agent-loop.ts 第 721–729 行（commit 4438c58 修复批次中止配对）',
            },
            diffs: [
              { kind: 'add', text: '单一 `AbortSignal` 贯穿流式推理与全部工具生命周期' },
              { kind: 'add', text: '已中止的工具跳过钩子与执行，但必产 `Operation aborted` 结果配对' },
            ],
            kpis: [
              { label: '信号载体', value: 'Web AbortSignal', status: 'good' },
              { label: '检查优先级', value: '早于所有钩子', status: 'good' },
              { label: '悬空 toolCall', value: '0（严格配对）', status: 'good' },
              { label: '关键修复提交', value: '4438c58 (#9986)', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.orange, label: 'AbortSignal 穿透广播' },
              { color: PALETTE.green, label: '配对补齐 toolResult' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'AbortSignal 穿透：停止副作用，但完整配对每一个 toolResult',
              nodes: [
                { id: 'ctrl', x: 165, y: 270, label: 'agent.abort()', sublabel: '触发 AbortSignal', icon: 'shield', tone: 'orange', active: true },
                { id: 't1', x: 470, y: 140, label: 'Tool #1 (运行中)', sublabel: '收到 signal 立即中止', icon: 'terminal', tone: 'rose' },
                { id: 't2', x: 470, y: 390, label: 'Tool #2 (待准备)', sublabel: '跳过钩子 · immediate', icon: 'clock', tone: 'orange', active: true },
                { id: 'pair', x: 805, y: 270, label: '双份 toolResult', sublabel: 'isError: true · 零悬空', icon: 'check', tone: 'green', size: 'lg', active: true },
              ],
              edges: [
                { from: 'ctrl', to: 't1', label: 'signal', packetColor: PALETTE.orange, status: 'active' },
                { from: 'ctrl', to: 't2', label: 'signal', packetColor: PALETTE.orange, status: 'active' },
                { from: 't1', to: 'pair', label: '补齐结果', packetColor: PALETTE.green, status: 'active' },
                { from: 't2', to: 'pair', label: 'Operation aborted', packetColor: PALETTE.green, status: 'active' },
              ],
            },
          },

          // Step 3
          {
            stepNumber: 3,
            shortLabel: '硬退出与状态释放',
            badge: 'TECHNIQUE',
            title: '`stopReason: "error" | "aborted"` 硬退出与 `finally` 铁律',
            paragraphs: [
              '`pi-agent-core` 给 `StreamFn` 定了一条铁契约：**请求/模型/运行时失败绝不允许抛出异常或 reject Promise**，必须编码在事件流里，产出一份带 `stopReason: "error" | "aborted"` 与 `errorMessage` 的 `AssistantMessage`。',
              '主循环遇到这两种 `stopReason` 会立即走**不可绕过的硬退出**（不跑工具、不看 `finishTurn` 的 `continue`、不消费队列）；即便外围代码真的意外抛错，`Agent.runWithLifecycle` 也有 `catch -> handleRunFailure` 与 `finally -> finishRun()` 托底，确保 `isStreaming` 与 `pendingToolCalls` 100% 干净复位。',
            ],
            callout: {
              kind: 'idea',
              title: '为什么把错误编码进消息流而非 throw？',
              text: '因为所有 UI（TUI / RPC / SDK）都是通过 `AgentEvent` 驱动的；错误作为合法 `AssistantMessage` 走完 `message_end` → `turn_end` → `agent_end`，下游监听者无需写两套状态机。',
            },
            diffs: [
              { kind: 'add', text: '`StreamFn` 契约：失败编入流事件与 `stopReason`，不 reject' },
              { kind: 'add', text: '`finally { finishRun() }` 彻底消灭 `isStreaming` 假死锁' },
            ],
            kpis: [
              { label: '硬退出标志', value: 'error | aborted', status: 'warn' },
              { label: '绕过可能', value: '不可绕过', status: 'good' },
              { label: '意外异常兜底', value: 'handleRunFailure()', status: 'good' },
              { label: '状态复位保证', value: 'finally finishRun()', status: 'good' },
            ],
            legend: [
              { color: PALETTE.rose, label: '硬退出短路径' },
              { color: PALETTE.green, label: 'finally 状态复位' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '两层错误防线：协议内硬退出 + 外围 finally 兜底复位',
              nodes: [
                { id: 'err', x: 165, y: 175, label: 'stopReason', sublabel: '"error" | "aborted"', icon: 'alert', tone: 'rose', active: true },
                { id: 'hard', x: 485, y: 175, label: 'runLoop 硬退出', sublabel: '跳过工具与队列直达结束', icon: 'shield', tone: 'rose', active: true },
                { id: 'ex', x: 165, y: 385, label: '意外未捕获异常', sublabel: '极端情况兜底', icon: 'alert', tone: 'orange' },
                { id: 'catch', x: 485, y: 385, label: 'handleRunFailure', sublabel: '合成失败事件序列', icon: 'wrench', tone: 'orange' },
                { id: 'fin', x: 815, y: 275, label: 'finally: finishRun', sublabel: '清零 isStreaming & 锁', icon: 'check', tone: 'green', size: 'lg', active: true },
              ],
              edges: [
                { from: 'err', to: 'hard', packetColor: PALETTE.rose, status: 'error' },
                { from: 'hard', to: 'fin', label: 'turn_end + agent_end', packetColor: PALETTE.green, status: 'active' },
                { from: 'ex', to: 'catch', dashed: true, packetColor: PALETTE.orange },
                { from: 'catch', to: 'fin', label: '总能释放', packetColor: PALETTE.green, status: 'active' },
              ],
            },
          },

          // Step 4
          {
            stepNumber: 4,
            shortLabel: 'length 截断熔断',
            badge: 'SOLUTION',
            title: '`stopReason === "length"` 截断熔断：绝不执行半截 JSON 参数',
            paragraphs: [
              '这是一个极其隐蔽却致命的线上坑：流式工具调用通常会使用容错 JSON 补全解析器（Best-effort Salvage Parser）。当模型输出撞到 `maxTokens` 墙被腰斩（`stopReason === "length"`），一个被砍掉后半截的 `write` 参数居然可能“语法合法地”通过校验，结果把你的源文件覆盖成半截残尸！',
              'commit `351efc8`（`#6285`）在 `runLoop` 加上了果断的熔断器：只要 `message.stopReason === "length"`，无论参数看起来多完整，**整批工具一个都不执行**，改走 `failToolCallsFromTruncatedMessage` 统一回报“响应触及输出上限，请重新发起完整调用”，把修复权安全交回模型。',
            ],
            callout: {
              kind: 'warn',
              title: '宁可重发，绝不盲跑',
              text: '截断熔断后循环**不会**硬停，而是把合成的错误 `toolResult` 正常喂回下一轮，让模型（或触发压缩后）重新补发完整工具调用。',
            },
            sourceDrawer: {
              title: 'length 截断熔断源码（failToolCallsFromTruncatedMessage）',
              filePath: 'packages/agent/src/agent-loop.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts#L493-L518',
              language: 'ts',
              code: `// A "length" stop means the output was cut off by the token limit, so
// every tool call in the message may carry truncated arguments. Fail
// them all instead of executing potentially borked calls.
const executedToolBatch =
  message.stopReason === "length"
    ? await failToolCallsFromTruncatedMessage(toolCalls, emit)
    : await executeToolCalls(currentContext, message, config, signal, emit);

// failToolCallsFromTruncatedMessage:
result: createErrorToolResult(
  \`Tool call "\${toolCall.name}" was not executed: the response hit the output \` +
  \`token limit, so its arguments may be truncated. Re-issue with complete arguments.\`
)`,
              caption: 'packages/agent/src/agent-loop.ts 第 281–284 行 & 第 493–518 行（#6285）',
            },
            diffs: [
              { kind: 'remove', text: '盲信补全解析后的截断参数直接执行 `write`/`edit`/`bash`' },
              { kind: 'add', text: '`stopReason === "length"` 时整批走 `failToolCallsFromTruncatedMessage`' },
            ],
            kpis: [
              { label: '拦截条件', value: 'stopReason === "length"', status: 'good' },
              { label: '误执行风险', value: '0%', status: 'good' },
              { label: '恢复机制', value: '错误回填让模型重发', status: 'good' },
              { label: '源码 PR', value: '#6285 (351efc8)', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.orange, label: '截断熔断拦截' },
              { color: PALETTE.green, label: '安全回填让模型重发' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'length 截断熔断：拦下看似合法、实则腰斩的工具调用',
              nodes: [
                { id: 'cut', x: 165, y: 270, label: '输出撞上限', sublabel: 'stopReason: "length"', icon: 'alert', tone: 'orange', active: true },
                { id: 'guard', x: 455, y: 270, label: '截断熔断检查', sublabel: '跳过 executeToolCalls', icon: 'shield', tone: 'rose', size: 'lg', active: true, badge: 'GUARD' },
                { id: 'fail', x: 785, y: 165, label: '全部合成 isError', sublabel: '提示参数可能被截断', icon: 'message', tone: 'orange', active: true },
                { id: 'retry', x: 785, y: 385, label: '模型下一轮重发', sublabel: '安全补全完整参数', icon: 'loop', tone: 'green', active: true },
              ],
              edges: [
                { from: 'cut', to: 'guard', label: '含 toolCalls', packetColor: PALETTE.orange, status: 'active' },
                { from: 'guard', to: 'fail', label: '零执行熔断', packetColor: PALETTE.rose, status: 'error' },
                { from: 'fail', to: 'retry', label: '回填 toolResult', packetColor: PALETTE.green, status: 'active' },
              ],
            },
          },

          // Step 5
          {
            stepNumber: 5,
            shortLabel: '工具永不 reject',
            badge: 'TECHNIQUE',
            title: '工具故障全隔离：5 类失败统一折叠为 `isError: true`',
            paragraphs: [
              '在 `pi-agent-core` 里，工具层的失败永远不会炸毁整个循环。无论发生哪种问题——信号已中止、模型幻觉出不存在的工具名、参数不符合 JSON Schema、`beforeToolCall` 策略拦截、还是 `execute()` / `afterToolCall()` 抛异常——最终都会被折叠成标准的 `ToolResultMessage { isError: true }`。',
              '这个设计赋予 Agent 极强的**自愈能力**：模型读到清晰报错（例如 `edit` 找不到精确匹配的 `oldText`），下一回合便会先 `read` 核对行号再自动修正。',
            ],
            callout: {
              kind: 'tip',
              title: '结构化报错 vs 抛异常',
              text: '工具既可以 `throw new Error(...)`，也可以主动返回 `{ isError: true, content, details }`——后者能同时保留给 UI 渲染用的 `details` 与程序消费的 `structuredContent`。',
            },
            diffs: [
              { kind: 'add', text: '5 类工具故障全部归一化为 `ToolResultMessage`（`isError: true`）' },
              { kind: 'add', text: '`afterToolCall` 内部同样包有 `try/catch` 防护（commit `b9cd557`）' },
            ],
            kpis: [
              { label: '工具 Reject 次数', value: '0（永不抛崩循环）', status: 'good' },
              { label: '覆盖故障类型', value: '5 大类全捕获', status: 'good' },
              { label: '模型自愈率', value: '显著提升', status: 'good' },
              { label: '复用入口', value: 'runToolCall()', status: 'neutral' },
            ],
            legend: [
              { color: PALETTE.orange, label: '各类工具期异常' },
              { color: PALETTE.green, label: '归一化后反馈模型自愈' },
            ],
            scene: {
              kind: 'iso-flow',
              title: '5 类工具故障统一折叠为 isError: true，驱动模型自愈',
              nodes: [
                { id: 'e1', x: 155, y: 155, label: '工具名不存在', sublabel: '模型幻觉调用', icon: 'alert', tone: 'orange' },
                { id: 'e2', x: 365, y: 155, label: 'Schema 校验失败', sublabel: 'validateToolArguments', icon: 'alert', tone: 'orange' },
                { id: 'e3', x: 155, y: 385, label: 'beforeToolCall 拦截', sublabel: '{ block: true }', icon: 'shield', tone: 'violet' },
                { id: 'e4', x: 365, y: 385, label: 'execute/after 抛错', sublabel: '运行期异常', icon: 'alert', tone: 'rose' },
                { id: 'norm', x: 625, y: 270, label: 'ToolResult (isError)', sublabel: '绝不 reject 主循环', icon: 'check', tone: 'green', size: 'lg', active: true },
                { id: 'heal', x: 855, y: 270, label: 'LLM 观测并自愈', sublabel: '读报错调整参数重试', icon: 'brain', tone: 'blue', active: true },
              ],
              edges: [
                { from: 'e1', to: 'norm', packetColor: PALETTE.orange },
                { from: 'e2', to: 'norm', packetColor: PALETTE.orange },
                { from: 'e3', to: 'norm', packetColor: PALETTE.violet },
                { from: 'e4', to: 'norm', packetColor: PALETTE.rose },
                { from: 'norm', to: 'heal', label: '回填上下文', packetColor: PALETTE.green, status: 'active' },
              ],
            },
          },

          // Step 6
          {
            stepNumber: 6,
            shortLabel: 'agentLoopContinue',
            badge: 'SOLUTION',
            title: '`agentLoopContinue` 与 `Agent.continue()`：无损重试与断后续跑',
            paragraphs: [
              '当一次请求因网络断连、限流或用户中止停在半路时，你不需要重复发一条冗余的“请继续”消息。Pi 提供了第二入口 `agentLoopContinue()`：直接从当前上下文恢复推理，不追加新消息。',
              '它严格执行一条协议守卫：**上下文非空，且最后一条消息不能是 `assistant`**（必须落在 `user` 或 `toolResult` 上，否则 Provider 会拒收）。而在更高层的 `Agent.continue()` 中，如果末尾恰好是 `assistant`，它还会贴心检查 `steeringQueue` 与 `followUpQueue`，有积压就自动改走新提示启动！',
            ],
            callout: {
              kind: 'tip',
              title: '两级入口的清晰分工',
              text: '`agentLoop(prompts, ...)` 用于“带新消息开跑”；`agentLoopContinue(context, ...)` 用于“错误重试 / 断后续跑”，不污染对话历史。',
            },
            sourceDrawer: {
              title: 'Agent.continue() 校验与队列回退源码',
              filePath: 'packages/agent/src/agent.ts',
              githubUrl:
                'https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent.ts#L398-L425',
              language: 'ts',
              code: `async continue(): Promise<void> {
  const lastMessage = this._state.messages[this._state.messages.length - 1];
  if (!lastMessage || this._state.messages.every((m) => m.role === "system")) {
    throw new Error("No messages to continue from");
  }
  if (lastMessage.role === "assistant") {
    const queuedSteering = this.steeringQueue.drain();
    if (queuedSteering.length > 0) {
      await this.runPromptMessages(queuedSteering, { skipInitialSteeringPoll: true });
      return;
    }
    const queuedFollowUps = this.followUpQueue.drain();
    if (queuedFollowUps.length > 0) {
      await this.runPromptMessages(queuedFollowUps);
      return;
    }
    throw new Error("Cannot continue from message role: assistant");
  }
  await this.runContinuation(); // -> runAgentLoopContinue()
}`,
              caption: 'packages/agent/src/agent.ts 第 398–425 行',
            },
            diffs: [
              { kind: 'add', text: '末尾为 `user` / `toolResult` → 直接进入 `agentLoopContinue()` 无损续跑' },
              { kind: 'add', text: '末尾为 `assistant` → 先探双队列补火，都为空则明确报错防 Provider 拒收' },
            ],
            kpis: [
              { label: '第二主入口', value: 'agentLoopContinue', status: 'good' },
              { label: '合法末尾角色', value: 'user | toolResult', status: 'good' },
              { label: '冗余消息数', value: '0（无损重试）', status: 'good' },
              { label: '助手尾回退', value: '自动探双队列', status: 'good' },
            ],
            legend: [
              { color: PALETTE.green, label: '直接无损续跑' },
              { color: PALETTE.orange, label: '助手尾队列补火' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Agent.continue() 前置校验与双队列回退逻辑',
              nodes: [
                { id: 'call', x: 155, y: 270, label: 'Agent.continue()', sublabel: '重试 / 断后恢复', icon: 'loop', tone: 'blue', active: true },
                { id: 'tail', x: 425, y: 270, label: '检查末尾消息角色', sublabel: 'messages[last].role', icon: 'git-branch', tone: 'violet', active: true },
                { id: 'cont', x: 775, y: 105, label: 'runAgentLoopContinue', sublabel: 'user / toolResult 直接续跑', icon: 'zap', tone: 'green', active: true },
                { id: 'qtry', x: 775, y: 275, label: '消费双队列启动', sublabel: 'assistant 尾 + 有排队消息', icon: 'queue', tone: 'orange' },
                { id: 'rej', x: 775, y: 445, label: 'Throw 拦截', sublabel: '空历史或孤立 assistant 尾', icon: 'alert', tone: 'rose' },
              ],
              edges: [
                { from: 'call', to: 'tail', packetColor: PALETTE.blue, status: 'active' },
                { from: 'tail', to: 'cont', label: 'user | toolResult', packetColor: PALETTE.green, status: 'active' },
                { from: 'tail', to: 'qtry', label: 'assistant + 有队列', packetColor: PALETTE.orange },
                { from: 'tail', to: 'rej', label: '非法状态', dashed: true, packetColor: PALETTE.rose, status: 'error' },
              ],
            },
          },

          // Step 7 (RECAP)
          {
            stepNumber: 7,
            shortLabel: '容错边界决策表',
            badge: 'RECAP',
            title: '总结：Pi 容错体系的四道不变量',
            paragraphs: [
              '一个真正敢用于日常主力开发的 Coding Agent，核心不在于“顺利时跑得多酷”，而在于**出错、限流、截断、被用户强行叫停时能否依然保持会话绝对健康**。',
              '至此我们完整走通了 Pi 的双层控制流。下一章将深入数据面：拆解 `AgentMessage[]` 经四阶段流水线进入大模型的秘密，以及驱动所有前端形态的 10 个精确 `AgentEvent`。',
            ],
            recapTable: [
              {
                question: '用户中途 Abort 后如何保住会话？',
                decision: '`prepareToolCall` 首行检查 `signal.aborted` 并补齐 `toolResult`',
                because: '消除悬空 `toolCall`，保证后续请求不被 Provider HTTP 400 拒收',
              },
              {
                question: '模型触及最大输出长度怎么防误操作？',
                decision: '`stopReason === "length"` 全批走 `failToolCallsFromTruncatedMessage`',
                because: '防止被截断后凑巧合法的 JSON 参数覆写文件或跑残缺命令',
              },
              {
                question: '工具执行报错要不要中断主循环？',
                decision: '全部折叠为 `isError: true` 结果回填',
                because: '让模型读取报错自愈重试，而非让单次命令失败崩掉整个 Agent',
              },
              {
                question: '网络报错后如何无损重试？',
                decision: '调用 `agentLoopContinue` / `Agent.continue()`',
                because: '直接复用已落盘的 `user`/`toolResult` 尾部续跑，不注入冗余消息',
              },
            ],
            kpis: [
              { label: '核心不变量', value: '4 道强保障', status: 'good' },
              { label: '悬空工具数', value: '恒为 0', status: 'good' },
              { label: '状态锁死概率', value: '0 (finally 释放)', status: 'good' },
              { label: '截断误执行', value: '0 (length 熔断)', status: 'good' },
            ],
            legend: [
              { color: PALETTE.green, label: '会话健康不变量防线' },
            ],
            scene: {
              kind: 'iso-flow',
              title: 'Pi 生产级容错四道防线总览',
              nodes: [
                { id: 'g1', x: 185, y: 155, label: '1. Abort 补齐', sublabel: '零悬空 toolResult', icon: 'shield', tone: 'green', active: true },
                { id: 'g2', x: 500, y: 155, label: '2. Length 熔断', sublabel: '绝不跑残缺参数', icon: 'alert', tone: 'orange', active: true },
                { id: 'g3', x: 815, y: 155, label: '3. 工具全隔离', sublabel: '5 类失败转 isError', icon: 'wrench', tone: 'blue', active: true },
                { id: 'g4', x: 340, y: 390, label: '4. 硬退出 + finally', sublabel: '永不卡死 isStreaming', icon: 'check', tone: 'violet', active: true },
                { id: 'ok', x: 675, y: 390, label: '可无损 Continue', sublabel: '会话永远合法可续跑', icon: 'loop', tone: 'green', size: 'lg', active: true },
              ],
              edges: [
                { from: 'g1', to: 'ok', packetColor: PALETTE.green, status: 'active' },
                { from: 'g2', to: 'ok', packetColor: PALETTE.orange, status: 'active' },
                { from: 'g3', to: 'ok', packetColor: PALETTE.blue, status: 'active' },
                { from: 'g4', to: 'ok', packetColor: PALETTE.violet, status: 'active' },
              ],
            },
          },
        ],
      },
    ],
  },
];
