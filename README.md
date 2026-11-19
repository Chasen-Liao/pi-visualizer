# Pi Agent Loop 可视化教程

用动画和源码示例拆解 Pi Coding Agent。课程分为 6 章、14 课，涵盖 Agent Loop、消息与事件、工具并行、会话树、上下文压缩以及扩展与 MCP。

[在线学习](https://pi-visualizer-lemon.vercel.app/)

- 在课程里逐步播放架构图，打开源码抽屉对照 Pi 的实现。课程和步骤可以用地址栏链接分享。
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

## 参考与致谢

课程的架构与流程参考了 [Mario Zechner（badlogic）](https://github.com/badlogic) 创建的 [Pi Coding Agent](https://github.com/earendil-works/pi)。感谢 Mario 和 Pi 的所有贡献者公开源码与文档，让我们能沿着实际实现学习 Agent 的设计。

这是 Chasen Liao 维护的独立中文学习项目。课程中的示例包含为教学简化的代码，具体行为请以对应版本的 Pi 源码为准。Pi 源码及节选遵循 [上游 MIT 许可证](THIRD_PARTY_NOTICES.md)。
