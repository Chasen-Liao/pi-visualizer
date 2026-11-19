import type { MouseEvent } from 'react';
import {
  BookOpen,
  Code2,
  ExternalLink,
  Menu,
  Moon,
  ScrollText,
  Search,
  Sun,
} from 'lucide-react';

export interface TopBarProps {
  mode: 'learn' | 'cheatsheet';
  theme: 'light' | 'dark';
  onChangeMode: (mode: 'learn' | 'cheatsheet') => void;
  onOpenSearch: () => void;
  onToggleTheme: (event: MouseEvent<HTMLButtonElement>) => void;
  onOpenMobileDrawer: () => void;
  onGoHome: () => void;
}

export function TopBar({
  mode,
  theme,
  onChangeMode,
  onOpenSearch,
  onToggleTheme,
  onOpenMobileDrawer,
  onGoHome,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="tactile-btn mobile-menu-btn"
          onClick={onOpenMobileDrawer}
          aria-label="打开课程目录"
          title="打开课程目录"
        >
          <Menu size={16} />
        </button>

        <button
          type="button"
          className="brand-link"
          onClick={onGoHome}
          aria-label="Pi Agent Loop，返回第一课"
          title="返回第一课"
        >
          <span className="brand-mark" aria-hidden="true">
            π
          </span>
          <span className="brand-text">
            <span className="brand-title">Pi Agent Loop</span>
            <span className="brand-sub">交互式架构可视化</span>
          </span>
        </button>

        <span className="topbar-divider" aria-hidden="true" />

        <nav className="mode-tabs" aria-label="视图模式">
          <button
            type="button"
            className={`mode-tab ${mode === 'learn' ? 'mode-tab--active' : ''}`}
            onClick={() => onChangeMode('learn')}
            aria-current={mode === 'learn' ? 'page' : undefined}
          >
            <BookOpen size={14} />
            <span><span className="mode-tab-en">Learn </span>课程</span>
          </button>
          <button
            type="button"
            className={`mode-tab ${mode === 'cheatsheet' ? 'mode-tab--active' : ''}`}
            onClick={() => onChangeMode('cheatsheet')}
            aria-current={mode === 'cheatsheet' ? 'page' : undefined}
          >
            <ScrollText size={14} />
            <span><span className="mode-tab-en">Cheatsheet </span>速查表</span>
          </button>
        </nav>
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className="search-trigger"
          onClick={onOpenSearch}
          aria-label="搜索课程与概念"
        >
          <Search size={14} />
          <span className="search-trigger-label">搜索课程与概念…</span>
          <span className="search-trigger-kbd" aria-hidden="true">
            <kbd className="kbd">Ctrl</kbd>
            <kbd className="kbd">K</kbd>
          </span>
        </button>

        <button
          type="button"
          className="tactile-btn theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? '切换为浅色草图纸主题' : '切换为深色浓缩咖啡主题'}
          title={theme === 'dark' ? '切换浅色主题' : '切换深色主题'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <a
          className="topbar-pill topbar-pill--link"
          href="https://github.com/earendil-works/pi"
          target="_blank"
          rel="noopener noreferrer"
          title="查看 earendil-works/pi 开源仓库"
        >
          <Code2 size={13} />
          <span>earendil-works/pi 源码</span>
          <ExternalLink size={11} />
        </a>

        <a
          className="topbar-pill topbar-pill--link topbar-pill--author"
          href="https://github.com/Chasen-Liao/pi-visualizer#参考与致谢"
          target="_blank"
          rel="noopener noreferrer"
        >
          项目与致谢
        </a>
      </div>
    </header>
  );
}
