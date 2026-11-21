import type { CheatsheetData } from '../types/lesson';

// ============================================================================
// Pi Coding Agent Architecture Cheatsheet — Single-Page Technical Reference
// Verified against https://github.com/earendil-works/pi (v1.5.2)
// ============================================================================

export const CHEATSHEET_DATA: CheatsheetData = {
  hero: {
    eyebrow: 'PI CODING AGENT · v1.5.2',
    title: 'Pi Agent Loop 架构速查表',
    subtitle:
      '对照 Pi v1.5.2 的控制流、事件契约、默认参数与架构取舍',
    repoNote: 'github.com/earendil-works/pi · @earendil-works/pi-* · MIT',
    scopeNote: '源码链接指向对应版本，动画中的 Token、延迟和命中率用于说明机制。',
    stats: [
      { label: '核心循环源码', value: '2,555 行 / 6 文件', tone: 'green' },
      { label: '默认内置工具', value: '4 把原子工具', tone: 'blue' },
      { label: '缓存预热默认', value: 'idle · 最多 30 分钟', tone: 'violet' },
      { label: '生命周期事件', value: '10 种 AgentEvent', tone: 'orange' },
      { label: '压缩默认阈值', value: '16,384 / 20,000 tok', tone: 'neutral' },
    ],
  },

  sections: {
    // ------------------------------------------------------------------------
    // 01. Double Loop & Control Flow
    // ------------------------------------------------------------------------
    doubleLoop: {
      id: 'double-loop',
      number: '01',
      title: '双层循环与控制流',
      subtitle: 'packages/agent/src/agent-loop.ts 中内层工具/转向循环与外层跟进/续行循环的精确流转条件',
      lessonLink: {
        label: '前往精讲：双队列与外层循环',
        lessonSlug: 'steering-followup',
        stepNumber: 7,
      },
      cards: [
        {
          id: 'ctrl-entry-loop',
          phase: 'outer',
          title: '新提示主入口',
          identifier: 'runAgentLoop(prompts, context, config, emit, signal, streamFn)',
          trigger: 'Agent.prompt() 提交新用户消息或消息数组时调用',
          behavior:
            '补齐工具差量声明并发出启动事件，然后进入 runLoop()。独立的低层包装 agentLoop() 才会返回 EventStream。',
          lessonSlug: 'inner-loop',
          stepNumber: 2,
        },
        {
          id: 'ctrl-entry-continue',
          phase: 'outer',
          title: '无损重试与续跑入口',
          identifier: 'agentLoopContinue(context, config, signal, streamFn)',
          trigger: '错误重试或断后恢复，且不追加新提示消息',
          behavior:
            '要求 context.messages 非空且末尾消息 role !== "assistant"（须为 user 或 toolResult）；Agent.continue() 若遇 assistant 尾会先尝试消费双队列补火。',
          lessonSlug: 'abort-and-guards',
          stepNumber: 6,
        },
        {
          id: 'ctrl-inner-while',
          phase: 'inner',
          title: '内层回合循环',
          identifier: 'while (hasMoreToolCalls || pendingMessages.length > 0)',
          trigger: '本轮模型发起了 toolCall（且未全批 terminate）或存在待注入 Steering 消息',
          behavior:
            '每轮按序执行：prepareNextTurn → declareToolChanges → prepareRequest → streamAssistantResponse → executeToolCalls → finishTurn → turn_end → 轮询 Steering。',
          lessonSlug: 'inner-loop',
          stepNumber: 8,
        },
        {
          id: 'ctrl-steering',
          phase: 'inner',
          title: '转向队列（Enter）',
          identifier: 'getSteeringMessages()',
          trigger: '启动前、每轮 turn_end 之后，以及 prepareNextTurn 耗时结束后补漏轮询（pending 为空时）',
          behavior:
            '实时注入运行中纠偏指令。注意自 2026-03（commit 208a2cc）起不再中途跳过同轮剩余工具，待工具批全部完成后整洁切入下一 Turn。',
          lessonSlug: 'steering-followup',
          stepNumber: 4,
        },
        {
          id: 'ctrl-followup',
          phase: 'outer',
          title: '跟进队列（Alt+Enter）与外层循环',
          identifier: 'while (true) -> getFollowUpMessages()',
          trigger: '仅在内层循环彻底退出（无待续工具、无 Steering）、Agent 即将停机时触发',
          behavior:
            '若返回非空跟进消息，将其置为 pendingMessages 并 continue 外层循环开启新任务；若为空再检查 explicitContinuation 兜底 1 轮，否则 break 发射 agent_end。',
          lessonSlug: 'steering-followup',
          stepNumber: 5,
        },
        {
          id: 'ctrl-hooks',
          phase: 'hook',
          title: '回合级三枚控制钩子',
          identifier: 'prepareNextTurn / prepareRequest / finishTurn',
          trigger: 'Turn>=2 开始前 / 每次请求前（含 Turn 1）/ turn_end 之前',
          behavior:
            'prepareNextTurn 承担回合间自动压缩与上下文替换；prepareRequest 做虚拟模型等请求前微调；finishTurn 可返回 { action: "end" | "continue" } 干预终止或续行。',
          lessonSlug: 'inner-loop',
          stepNumber: 3,
        },
        {
          id: 'ctrl-hard-exit',
          phase: 'exit',
          title: '异常硬退出与截断熔断',
          identifier: 'stopReason === "error" | "aborted" | "length"',
          trigger: 'streamAssistantResponse 返回非正常终止原因',
          behavior:
            '"error"/"aborted" 不可绕过地直接结束 Run；"length" 伴随 toolCall 时触发 failToolCallsFromTruncatedMessage 整批报错熔断，绝不执行半截 JSON 参数。',
          lessonSlug: 'abort-and-guards',
          stepNumber: 4,
        },
      ],
    },

    // ------------------------------------------------------------------------
    // 02. Exact 10 AgentEvent Lifecycle Events
    // ------------------------------------------------------------------------
    events: {
      id: 'events',
      number: '02',
      title: '10 个 AgentEvent 生命周期事件',
      subtitle: '定义于 packages/agent/src/types.ts（L533–556），统一驱动 TUI、JSON、RPC 与 SDK 订阅者',
      lessonLink: {
        label: '前往精讲：10 种 AgentEvent 与流式解耦',
        lessonSlug: 'agent-events',
        stepNumber: 2,
      },
      items: [
        {
          eventType: 'agent_start',
          category: 'agent',
          payload: '{ type: "agent_start" }',
          timing: '每次 agentLoop / agentLoopContinue 启动瞬间',
          note: '标志新一次 Run 生命周期开启，isStreaming 置为 true',
        },
        {
          eventType: 'agent_end',
          category: 'agent',
          payload: '{ type: "agent_end", messages: AgentMessage[] }',
          timing: '外层循环 break、finishTurn 返回 end 或 error/aborted 硬退出时',
          note: '携带本次 Run 全部新消息；waitForIdle() 需等所有 awaited 监听器完成后才 resolve',
        },
        {
          eventType: 'turn_start',
          category: 'turn',
          payload: '{ type: "turn_start" }',
          timing: '首个回合启动时，或后续回合 prepareNextTurn 与补漏轮询之后',
          note: '1 个 Turn = 1 次助手流式响应 + 其触发的全部工具调用与结果',
        },
        {
          eventType: 'turn_end',
          category: 'turn',
          payload: '{ type: "turn_end", message: AgentMessage, toolResults: ToolResultMessage[] }',
          timing: 'finishTurn() 执行完毕后；error/aborted 时 toolResults 为空数组',
          note: '并行模式下 toolResults 仍严格保持助手消息中的原始调用顺序',
        },
        {
          eventType: 'message_start',
          category: 'message',
          payload: '{ type: "message_start", message: AgentMessage }',
          timing: 'system / user / assistant（流开始） / toolResult 进入对话时',
          note: 'Agent 将 streamingMessage 指向当前进行中的消息',
        },
        {
          eventType: 'message_update',
          category: 'message',
          payload: '{ type: "message_update", message: AgentMessage, assistantMessageEvent }',
          timing: '仅在助手消息流式输出期间高频发射',
          note: '携带细粒度增量：text_* / thinking_* / toolcall_*',
        },
        {
          eventType: 'message_end',
          category: 'message',
          payload: '{ type: "message_end", message: AgentMessage }',
          timing: '任意角色消息定稿落盘时',
          note: 'Agent 清除 streamingMessage 并将该消息 push 进 state.messages',
        },
        {
          eventType: 'tool_execution_start',
          category: 'tool',
          payload: '{ type: "tool_execution_start", toolCallId, toolName, args }',
          timing: '每个工具进入 prepareToolCall 前按助手源码序发射',
          note: 'Agent 将 toolCallId 加入 pendingToolCalls 集合',
        },
        {
          eventType: 'tool_execution_update',
          category: 'tool',
          payload: '{ type: "tool_execution_update", toolCallId, toolName, args, partialResult }',
          timing: '工具调用 onUpdate(partialResult) 流式推送中间输出时（如 bash stdout）',
          note: '工具 Promise settle 后的迟到回调会被自动忽略（commit daab056）',
        },
        {
          eventType: 'tool_execution_end',
          category: 'tool',
          payload: '{ type: "tool_execution_end", toolCallId, toolName, result, isError, durationMs? }',
          timing: '工具 finalized（含 afterToolCall 或 immediate 错误）后立即发射',
          note: '并行模式下按“完成顺序”抢先发射；durationMs 由单调时钟测得（未执行时省略）',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // 03. Message Pipeline
    // ------------------------------------------------------------------------
    pipeline: {
      id: 'pipeline',
      number: '03',
      title: '消息流水线与四阶段变换',
      subtitle: '运行期全程使用可扩展的 AgentMessage[]，仅在每次调用 LLM 的边界变换为标准化 TranscriptContext',
      lessonLink: {
        label: '前往精讲：从 AgentMessage 到 LLM',
        lessonSlug: 'message-pipeline',
        stepNumber: 3,
      },
      stages: [
        {
          order: 1,
          name: '应用态转录（Transcript）',
          identifier: 'context.messages',
          inputType: 'AgentMessage[]',
          outputType: 'AgentMessage[]',
          role: '容纳标准 LLM 消息与业务扩展消息（bashExecution / custom / 摘要）及增量 SystemMessage',
          note: '通过 TS Declaration Merging（CustomAgentMessages）保持端到端类型安全',
        },
        {
          order: 2,
          name: '上下文变换（可选）',
          identifier: 'config.transformContext(messages, signal)',
          inputType: 'AgentMessage[]',
          outputType: 'Promise<AgentMessage[]>',
          role: '在 AgentMessage 层面执行裁剪、注入外部上下文或触发 Extension context 钩子',
          note: '契约要求不得抛错，失败时应返回原数组或安全回退值',
        },
        {
          order: 3,
          name: 'LLM 角色映射（必选）',
          identifier: 'config.convertToLlm(messages)',
          inputType: 'AgentMessage[]',
          outputType: 'Message[] | Promise<Message[]>',
          role: '过滤 UI 专用/排除消息（如 !! 前缀 bash），将 custom/摘要消息包装为 user 消息',
          note: 'coding-agent 实现位于 packages/coding-agent/src/core/messages.ts',
        },
        {
          order: 4,
          name: '转录归一化',
          identifier: 'normalizeContext({ messages: llmMessages })',
          inputType: 'Message[]',
          outputType: 'TranscriptContext',
          role: '由 @earendil-works/pi-ai 生成标准转录；系统提示与工具声明由转录内的 SystemMessage 承载',
          note: '不再通过独立的 context.systemPrompt / context.tools 传递，便于增量 Patch 与跨模型交接',
        },
        {
          order: 5,
          name: '动态鉴权与流式发送',
          identifier: 'getApiKey(provider) -> streamFn(model, llmContext, options)',
          inputType: 'TranscriptContext',
          outputType: 'AssistantMessageEventStream',
          role: '每轮请求动态解析短期 OAuth 令牌，并按目标厂商 Wire 协议发起流式推理',
          note: '默认 streamFn 为 pi-ai 的 Models.streamSimple',
        },
      ],
      customMessageTypes: [
        {
          role: 'system / user / assistant / toolResult',
          includedInLlm: true,
          note: '4 种标准基础 LLM 消息，convertToLlm 直接透传',
        },
        {
          role: 'bashExecution（! / !! 命令）',
          includedInLlm: true,
          note: '普通 ! 命令转为 user 文本进入上下文；带 !!（excludeFromContext: true）被过滤剔除',
        },
        {
          role: 'custom（CustomMessage）',
          includedInLlm: true,
          note: 'Extension 通过 sendMessage() 注入的消息，转为 user 角色进入模型上下文',
        },
        {
          role: 'compactionSummary',
          includedInLlm: true,
          note: '由 CompactionEntry 投影生成，包裹 <summary> 标签以 user 角色喂给模型',
        },
        {
          role: 'branchSummary',
          includedInLlm: true,
          note: '由 /tree 切换分支生成，包裹 <summary> 标签以 user 角色回流放弃分支的知识',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // 04. Defaults, Core Tools & MCP Exposure Modes
    // ------------------------------------------------------------------------
    defaults: {
      id: 'defaults',
      number: '04',
      title: '核心默认参数、内置工具与 MCP 暴露模式',
      subtitle: '直接取自 agent.ts、compaction.ts、tools/index.ts 与 docs/mcp.md 的权威默认值',
      lessonLink: {
        label: '前往精讲：极简 4 工具与并发编排',
        lessonSlug: 'tool-execution',
        stepNumber: 4,
      },
      params: [
        {
          key: 'toolExecution',
          defaultValue: '"parallel"',
          scope: 'pi-agent-core (agent.ts)',
          description: '单轮多工具默认顺序预检 + Promise.all 并发执行；批次内任一工具声明 sequential 则整批退回串行',
          tone: 'green',
        },
        {
          key: 'steeringMode / followUpMode',
          defaultValue: '"one-at-a-time"',
          scope: 'pi-agent-core (agent.ts)',
          description: '每次轮询仅消费队列最老 1 条消息；可切换 "all" 一次性排空全部积压',
          tone: 'blue',
        },
        {
          key: 'compaction.reserveTokens',
          defaultValue: '16384',
          scope: 'pi-coding-agent (compaction.ts)',
          description: '自动压缩触发阈值：contextTokens > contextWindow - reserveTokens',
          tone: 'orange',
        },
        {
          key: 'compaction.keepRecentTokens',
          defaultValue: '20000',
          scope: 'pi-coding-agent (compaction.ts)',
          description: '反向寻找合法 Cut Point 时保留的近期工作集预算（绝不在 toolResult 处切断）',
          tone: 'orange',
        },
        {
          key: 'read 工具文本上限',
          defaultValue: '2000 行或 50 KiB',
          scope: 'pi-coding-agent (tools/read.ts)',
          description: '按先达到的上限截断；支持 offset / limit 分页，以及 jpg、png、gif、webp、bmp 图片附件',
          tone: 'neutral',
        },
        {
          key: 'cacheWarming',
          defaultValue: '"idle"',
          scope: 'pi-coding-agent (settings.md)',
          description: '全局设置，符合条件的供应商可在两次运行间续温最多 30 分钟；也可设为 streaming 或 off',
          tone: 'violet',
        },
        {
          key: 'Session 格式版本',
          defaultValue: 'version: 3 (JSONL)',
          scope: 'pi-coding-agent (session-manager.ts)',
          description: 'v1 线性 → v2 id/parentId 树 → v3 统一 custom 角色；加载旧版时自动迁移',
          tone: 'violet',
        },
        {
          key: 'MCP 单次请求超时',
          defaultValue: '60 秒',
          scope: 'pi-coding-agent (docs/mcp.md)',
          description: '收到服务端进度通知自动重置超时；HTTP 网络与 408/429/5xx 错误默认重试 2 次',
          tone: 'neutral',
        },
        {
          key: 'Node.js 运行时要求',
          defaultValue: '>= 22.19.0',
          scope: 'earendil-works/pi (README.md)',
          description: '安装时支持 --ignore-scripts，供应链硬化默认 save-exact 与 min-release-age=2',
          tone: 'neutral',
        },
      ],
      coreTools: [
        {
          name: 'read',
          role: '读取文本文件与图片',
          defaultEnabled: true,
          note: '支持 offset/limit 范围读与视觉模型图片附件',
        },
        {
          name: 'bash',
          role: '同步执行 Shell 命令',
          defaultEnabled: true,
          note: '返回 stdout/stderr，可选 timeout；承担 ls/rg/find/git/tmux 等一切 CLI 组合',
        },
        {
          name: 'edit',
          role: '精确文本差异替换',
          defaultEnabled: true,
          note: '要求 oldText 精确匹配（含空白），用于外科手术式代码修改',
        },
        {
          name: 'write',
          role: '创建或全量覆写文件',
          defaultEnabled: true,
          note: '自动创建缺失父目录，适合新文件或整文件重写',
        },
        {
          name: 'grep',
          role: '内置内容检索',
          defaultEnabled: false,
          note: '默认禁用；可用 --tools read,grep,find,ls 开启纯只读探索模式',
        },
        {
          name: 'find',
          role: '内置文件通配查找',
          defaultEnabled: false,
          note: '默认禁用；只读预设组件之一',
        },
        {
          name: 'ls',
          role: '内置目录列举',
          defaultEnabled: false,
          note: '默认禁用；只读预设组件之一',
        },
        {
          name: 'powershell',
          role: 'Windows PowerShell 执行',
          defaultEnabled: false,
          note: '按平台/配置可选启用，替代或补充 bash',
        },
      ],
      mcpModes: [
        {
          mode: 'codemode',
          promptCost: '0 个前置工具 Schema',
          behavior: '默认模式，系统提示可含服务器摘要。可供 codemode 脚本发现；启用 tool_search 时也可按需声明',
          isDefault: true,
        },
        {
          mode: 'deferred',
          promptCost: '仅声明 1 个 tool_search',
          behavior: '初始不展开服务器工具；默认激活 tool_search，命中后为下一轮加载声明。启用 codemode 时也可由脚本调用',
        },
        {
          mode: 'direct',
          promptCost: '全量声明（同内置工具）',
          behavior: '直接声明给模型并允许 codemode 调用，仅推荐给极小、超高频工具集（支持 toolExposure 按工具细粒度覆盖）',
        },
        {
          mode: 'hidden',
          promptCost: '0（完全不可达）',
          behavior: '保留配置但不向模型暴露，可配合 toolExposure 仅放行白名单中的个别工具',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // 05. JSONL v3 Session Entries & Extension Hooks
    // ------------------------------------------------------------------------
    sessionAndExt: {
      id: 'session-ext',
      number: '05',
      title: 'JSONL v3 会话条目与 Extension 钩子',
      subtitle: '只追加的不可变会话树（~/.pi/agent/sessions/）与进程内 TypeScript 扩展生命周期',
      lessonLink: {
        label: '前往精讲：追加写 JSONL v3 会话树',
        lessonSlug: 'jsonl-session-tree',
        stepNumber: 3,
      },
      entryTypes: [
        {
          type: 'session',
          inLlmContext: 'no',
          purpose: '首行文件头元数据（不入树，无 id/parentId）',
          keyFields: 'version: 3, id, timestamp, cwd, parentSession?',
        },
        {
          type: 'message',
          inLlmContext: 'yes',
          purpose: '存储对话消息及增量 SystemMessage（sections / toolsAdded / toolsRemoved）',
          keyFields: 'id, parentId, timestamp, message: AgentMessage',
        },
        {
          type: 'compaction',
          inLlmContext: 'yes',
          purpose: '非破坏性压缩节点：投影为完整系统检查点 + compactionSummary',
          keyFields: 'summary, firstKeptEntryId, tokensBefore, systemMessage?, usage?, details?',
        },
        {
          type: 'branch_summary',
          inLlmContext: 'yes',
          purpose: '/tree 切分支时总结被离开分支（至 LCA）并挂载到新分支',
          keyFields: 'fromId, summary, usage?, details?: { readFiles, modifiedFiles }',
        },
        {
          type: 'context_edit',
          inLlmContext: 'conditional',
          purpose: '只追加地忽略（replacement: null）或替换某历史条目内容，不篡改原始行',
          keyFields: 'targetId, replacement: null | string | ContentBlock[]',
        },
        {
          type: 'custom_message',
          inLlmContext: 'yes',
          purpose: 'Extension 注入的参与 LLM 上下文的消息（可选是否在 TUI 展示）',
          keyFields: 'customType, content, display, details?',
        },
        {
          type: 'custom',
          inLlmContext: 'no',
          purpose: 'Extension 私有状态持久化（如虚拟模型路由状态），不进入 LLM 上下文',
          keyFields: 'customType, data',
        },
        {
          type: 'model_change',
          inLlmContext: 'no',
          purpose: '记录会话中途切换的模型（物理模型或虚拟模型）',
          keyFields: 'provider, modelId',
        },
        {
          type: 'thinking_level_change',
          inLlmContext: 'no',
          purpose: '记录思考强度变更（off / minimal / low / medium / high / xhigh / max）',
          keyFields: 'thinkingLevel',
        },
        {
          type: 'usage',
          inLlmContext: 'no',
          purpose: '记录非助手消息产生的 Token 与费用（如 kind: "cache_warm"）',
          keyFields: 'kind, provider, model, usage',
        },
        {
          type: 'label',
          inLlmContext: 'no',
          purpose: '用户为任意条目打上的书签/检查点标签',
          keyFields: 'targetId, label',
        },
        {
          type: 'session_info',
          inLlmContext: 'no',
          purpose: '会话展示名称元数据（/name 或 --name 设置）',
          keyFields: 'name',
        },
      ],
      extensionHooks: [
        {
          hook: 'project_trust / resources_discover',
          phase: '启动与信任阶段',
          capability: '响应项目信任决策、动态发现扩展/技能/模板资源',
        },
        {
          hook: 'session_start / session_before_switch / session_shutdown',
          phase: '会话生命周期',
          capability: '会话初始化、切换拦截、长生命周期资源优雅清理',
        },
        {
          hook: 'session_before_compact / session_compact / session_before_tree',
          phase: '压缩与树导航',
          capability: '接管自定义压缩算法、注入自定义摘要或拦截分支切换',
        },
        {
          hook: 'before_agent_start / agent_start / agent_end / agent_settled',
          phase: 'Run 级生命周期',
          capability: '修改或覆盖系统提示词、监听整次运行结束与彻底空闲',
        },
        {
          hook: 'context / context_with_system',
          phase: '请求前上下文变换',
          capability: '在发往 LLM 前非破坏性地裁剪、过滤或动态注入上下文',
        },
        {
          hook: 'tool_call / tool_result',
          phase: '工具拦截与改写',
          capability: '实现自定义权限审批（block/terminate）或重写工具返回内容与 details',
        },
        {
          hook: 'before_provider_request / after_provider_response / cache_warming_decision',
          phase: '传输与缓存控制',
          capability: '观测或微调底层 HTTP 载荷、自定义 Prompt Cache 保活策略',
        },
        {
          hook: 'input / user_bash',
          phase: '用户输入阶段',
          capability: '拦截原始编辑器输入（早于模板展开）或自定义 ! Shell 执行行为',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // 06. Architecture Decisions: Pi vs Conventional Heavy Frameworks
    // ------------------------------------------------------------------------
    decisions: {
      id: 'decisions',
      number: '06',
      title: '架构权衡与反框架哲学对比',
      subtitle: '为什么 Pi 能在极简内核下兼顾工程上限？8 个核心设计维度的直面比较',
      lessonLink: {
        label: '回到第 1 课：为什么 Pi 敢做反框架',
        lessonSlug: 'why-pi',
        stepNumber: 8,
      },
      rows: [
        {
          dimension: '内置工具表面积',
          piApproach: '默认仅 4 把原子工具（read/bash/edit/write），复杂检索与编排交由 bash + CLI 组合',
          conventionalApproach: '预置 20～50 个专用工具（搜索、Git、测试、后台进程、浏览器等）',
          rationale: '模型对 POSIX 原语训练最充分，大幅降低首轮上下文占用与工具选择困惑',
          lessonSlug: 'tool-execution',
          stepNumber: 1,
        },
        {
          dimension: '系统提示与缓存策略',
          piApproach: '<1,000 token 基线 + XML 模块化段落 + 尾部追加增量 SystemMessage Patch + cache_warm',
          conventionalApproach: '万字动态拼接大提示词，每轮随状态原地重写前缀导致 KV Cache 频繁失效',
          rationale: '保护前缀只读不变量是降低长会话延迟与 API 成本的最高杠杆',
          lessonSlug: 'prompt-cache',
          stepNumber: 3,
        },
        {
          dimension: '运行中人机协同',
          piApproach: 'Steering（Enter，工具批后立即转向）与 Follow-up（Alt+Enter，停机前排队续跑）双队列分离',
          conventionalApproach: '单一队列或必须按 Ctrl+C 硬中断，极易打碎状态或白跑错误回合',
          rationale: '精准映射“改方向”与“排新活”两种意图，同时保证同轮工具批原子完成',
          lessonSlug: 'steering-followup',
          stepNumber: 7,
        },
        {
          dimension: '多工具并发与落盘序',
          piApproach: '顺序预检 → Promise.all 并发执行 → tool_execution_end 按完成序抢先发 → toolResult 按原序落盘',
          conventionalApproach: '全串行拖慢多文件读取，或并发乱序回写破坏消息因果顺序',
          rationale: '兼顾极速 UI 响应与严格确定性的会话转录顺序',
          lessonSlug: 'tool-execution',
          stepNumber: 5,
        },
        {
          dimension: '会话历史与压缩',
          piApproach: '只追加 JSONL v3 树形日志 + 非破坏性 CompactionEntry 投影 + /tree 分支摘要',
          conventionalApproach: '线性覆盖式历史，回溯或压缩直接永久丢弃早期原始对话记录',
          rationale: '底层事实永不覆写，赋予编码 Agent 类 Git 的多路试错与无损回溯能力',
          lessonSlug: 'compaction',
          stepNumber: 6,
        },
        {
          dimension: '规划模式与子代理',
          piApproach: '刻意不内置；推崇显式 PLAN.md / TODO.md、tmux 或按需加载的 TS Extension',
          conventionalApproach: '内置黑盒 Sub-agent 与强锁定 Plan Mode，隐藏子上下文且难以介入调试',
          rationale: '消除“黑盒套黑盒”，把状态放在文件系统与终端里实现 100% 可观测',
          lessonSlug: 'why-pi',
          stepNumber: 5,
        },
        {
          dimension: '安全与权限边界',
          piApproach: '默认 YOLO 无命令弹窗；依托 OS/容器隔离 + 加载仓库资源前的 project-trust 门控',
          conventionalApproach: '每条高危命令弹确认框，但网络+读写+执行共存导致高频疲劳点击',
          rationale: '承认应用层弹窗的“安全剧场”局限，在容器与项目信任两道真实边界发力',
          lessonSlug: 'why-pi',
          stepNumber: 6,
        },
        {
          dimension: 'MCP 集成演进',
          piApproach: '2025 拒绝全量灌入 → 2026-09 推出 pi-mcp + pi-codemode（默认 0 工具 Schema 前置）',
          conventionalApproach: '连接 MCP 服务器即把全部工具 JSON Schema 塞进每轮上下文',
          rationale: '用代码按需检索工具（codemode / deferred）兼得生态互通与极简上下文',
          lessonSlug: 'codemode-mcp',
          stepNumber: 3,
        },
      ],
    },
  },
};
