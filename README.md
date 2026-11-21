# Pi Agent Loop 可视化教程

用动画和源码示例拆解 Pi Coding Agent。课程分为 6 章、14 课、111 步，涵盖 Agent Loop、消息与事件、工具并行、会话树、上下文压缩以及扩展与 MCP。

[在线学习](https://pi-visualizer-lemon.vercel.app/)

- 在课程里逐步播放带立体层次的架构图，打开源码抽屉对照 Pi 的实现。课程和步骤可以用地址栏链接分享。
- 在速查表里查循环、事件、默认参数和架构取舍。
- 用 `Ctrl+K` 或 `⌘K` 搜索，方向键选择，回车跳转。课程页支持左右方向键切换步骤，空格暂停或继续，`R` 重播。
- 学习进度和主题保存在当前浏览器。动画与示例用于教学，网页不会运行 Pi 或调用模型。

## 本地运行

使用 Node.js 22 或更新版本。

```sh
npm ci
npm run dev
```

`npm run build` 执行 TypeScript 检查并生成 `dist/`，`npm run preview` 预览构建产物。Vercel 通过 GitHub 的 `main` 分支构建生产站点。

## Pi 版本与核对范围

2026-11-20 对照 [Pi v1.5.2](https://github.com/earendil-works/pi/releases/tag/v1.5.2) 核对课程和速查表。课程链接固定到对应版本。源码抽屉含教学摘编，图中的 Token、缓存命中率和耗时是示例。

| 课程范围 | 上游参考 |
| --- | --- |
| 默认工具、项目权限和包分层 | [CLI](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/cli.md#tools)、[项目权限](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/security.md)、[包定义](https://github.com/earendil-works/pi/tree/v1.5.2/packages) |
| 双层循环、双队列和中止 | [Agent](https://github.com/earendil-works/pi/blob/v1.5.2/packages/agent/src/agent.ts)、[Agent Loop](https://github.com/earendil-works/pi/blob/v1.5.2/packages/agent/src/agent-loop.ts) |
| 消息转换、事件和工具执行 | [消息转换](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/src/core/messages.ts)、[事件类型](https://github.com/earendil-works/pi/blob/v1.5.2/packages/agent/src/types.ts) |
| Prompt 缓存 | [缓存设置](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/settings.md)、[缓存预热实现](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/src/core/cache-warmer.ts) |
| JSONL 会话、压缩和分支摘要 | [会话文件格式](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/session-format.md)、[压缩与分支摘要](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/compaction.md) |
| 扩展、Skills 和 MCP | [扩展 API](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/extensions.md)、[Skills](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/skills.md)、[MCP 暴露模式](https://github.com/earendil-works/pi/blob/v1.5.2/packages/coding-agent/docs/mcp.md#control-tool-exposure) |

中止一课标出了发行版与主分支的区别。v1.5.2 可能中途结束工具批次，核对时的 [主分支实现](https://github.com/earendil-works/pi/blob/1e34c3b4c7df78e716a8f53ad0bcf3a00feceedc/packages/agent/src/agent-loop.ts) 会为尚未预检的调用补上中止结果。

## 参考与致谢

课程的架构与流程参考了 [Mario Zechner（badlogic）](https://github.com/badlogic) 创建的 [Pi Coding Agent](https://github.com/earendil-works/pi)。感谢 Mario 和 Pi 的所有贡献者公开源码与文档，让我们能沿着实际实现学习 Agent 的设计。

网页的交互式教学设计受到 [Dilum Sanjaya](https://dilum.dev/) 的 [Designed to Scale](https://designed-to-scale.vercel.app/) 启发。感谢他分享用可逐步播放的动画图解讲解系统架构的设计思路。

这是 Chasen Liao 维护的独立中文学习项目。课程中的示例包含为教学简化的代码，具体行为请以对应版本的 Pi 源码为准。Pi 源码及节选遵循 [上游 MIT 许可证](THIRD_PARTY_NOTICES.md)。
