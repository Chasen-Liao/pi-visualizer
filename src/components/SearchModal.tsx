import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Layers, ScrollText, Search } from 'lucide-react';
import type { Lesson } from '../types/lesson';

function stripInlineMarkdown(text: string): string {
  return text.replace(/`/g, '').replace(/\*\*/g, '');
}

export interface SearchModalProps {
  isOpen: boolean;
  lessons: Lesson[];
  onClose: () => void;
  onSelectTarget: (target: {
    mode: 'learn' | 'cheatsheet';
    lessonSlug?: string;
    stepNumber?: number;
  }) => void;
}

interface SearchHit {
  id: string;
  group: 'lesson' | 'step' | 'cheatsheet';
  title: string;
  meta: string;
  snippet: string;
  lessonSlug?: string;
  stepNumber?: number;
  score: number;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const terms = trimmed.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;

  const regex = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, idx) => {
    const isMatch = terms.some((t) => part.toLowerCase() === t.toLowerCase());
    if (isMatch) {
      return (
        <mark key={idx} className="search-highlight">
          {part}
        </mark>
      );
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}

function extractSnippet(haystack: string, terms: string[]): string {
  const lower = haystack.toLowerCase();
  let bestIdx = -1;
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
      bestIdx = idx;
    }
  }
  if (bestIdx === -1) {
    return haystack.slice(0, 110) + (haystack.length > 110 ? '…' : '');
  }
  const start = Math.max(0, bestIdx - 28);
  const end = Math.min(haystack.length, bestIdx + 84);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < haystack.length ? '…' : '';
  return `${prefix}${haystack.slice(start, end)}${suffix}`;
}

export function SearchModal({
  isOpen,
  lessons,
  onClose,
  onSelectTarget,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;

    setQuery('');
    setActiveIndex(0);
    dialog.showModal();
    inputRef.current?.focus();
    return () => dialog.close();
  }, [isOpen]);

  const hits = useMemo<SearchHit[]>(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      const lessonDefaults: SearchHit[] = lessons.map((lesson) => ({
        id: `lesson-${lesson.slug}`,
        group: 'lesson',
        title: lesson.title,
        meta: `第 ${String(lesson.chapterNumber).padStart(2, '0')} 章 · ${lesson.chapterTitle} · ${lesson.steps.length} 步`,
        snippet: lesson.subtitle,
        lessonSlug: lesson.slug,
        stepNumber: 1,
        score: 10,
      }));

      lessonDefaults.push({
        id: 'cheatsheet-shortcut',
        group: 'cheatsheet',
        title: 'Pi Agent Loop 架构速查表 (Cheatsheet)',
        meta: '全局参考 · 双层循环图 / 10 个事件 / 流水线 / 架构权衡',
        snippet: '一页速查 agentLoop、getSteeringMessages、CompactionEntry 与极简设计决策。',
        score: 5,
      });

      return lessonDefaults;
    }

    const terms = trimmed.split(/\s+/).filter(Boolean);
    const lessonHits: SearchHit[] = [];
    const stepHits: SearchHit[] = [];

    for (const lesson of lessons) {
      const lessonBlob = stripInlineMarkdown(
        [
          lesson.title,
          lesson.subtitle,
          lesson.chapterTitle,
          lesson.slug,
          ...lesson.objectives.map((o) => o.text),
        ].join(' '),
      );
      const lessonLower = lessonBlob.toLowerCase();

      if (terms.every((t) => lessonLower.includes(t))) {
        const titleHit = terms.some((t) => lesson.title.toLowerCase().includes(t));
        lessonHits.push({
          id: `lesson-${lesson.slug}`,
          group: 'lesson',
          title: lesson.title,
          meta: `第 ${String(lesson.chapterNumber).padStart(2, '0')} 章 · ${lesson.chapterTitle}`,
          snippet: extractSnippet(
            stripInlineMarkdown(
              `${lesson.subtitle} ${lesson.objectives.map((o) => o.text).join('；')}`,
            ),
            terms,
          ),
          lessonSlug: lesson.slug,
          stepNumber: 1,
          score: titleHit ? 100 : 70,
        });
      }

      for (const step of lesson.steps) {
        const stepBody = stripInlineMarkdown(
          [
            step.title,
            step.shortLabel,
            step.badge,
            ...step.paragraphs,
            step.callout?.title ?? '',
            step.callout?.text ?? '',
            ...(step.diffs?.map((d) => d.text) ?? []),
            step.sourceDrawer?.title ?? '',
            step.sourceDrawer?.filePath ?? '',
          ].join(' '),
        );
        const stepLower = stepBody.toLowerCase();

        if (terms.every((t) => stepLower.includes(t))) {
          const stepTitleHit = terms.some((t) =>
            `${step.title} ${step.shortLabel}`.toLowerCase().includes(t),
          );
          const snippetSource =
            step.paragraphs.find((p) =>
              terms.some((t) => stripInlineMarkdown(p).toLowerCase().includes(t)),
            ) ??
            step.callout?.text ??
            step.sourceDrawer?.filePath ??
            step.paragraphs[0] ??
            lesson.subtitle;

          stepHits.push({
            id: `step-${lesson.slug}-${step.stepNumber}`,
            group: 'step',
            title: `${step.title}`,
            meta: `${lesson.title} · Step ${step.stepNumber}/${lesson.steps.length} · ${step.badge}`,
            snippet: extractSnippet(stripInlineMarkdown(snippetSource), terms),
            lessonSlug: lesson.slug,
            stepNumber: step.stepNumber,
            score: stepTitleHit ? 85 : 50,
          });
        }
      }
    }

    const cheatsheetKeywords =
      'cheatsheet 速查表 双层循环 agentevent pipeline compaction jsonl mcp codemode 权衡 对比 参数';
    const cheatsheetHits: SearchHit[] = terms.every((t) =>
      cheatsheetKeywords.includes(t),
    )
      ? [
          {
            id: 'cheatsheet-match',
            group: 'cheatsheet',
            title: 'Cheatsheet 速查表 · 全量架构参考',
            meta: '双层循环总图 · 10 个 AgentEvent · 默认阈值 · 反框架决策表',
            snippet: '直接打开一页式 Pi Agent Loop 架构速查表与双层控制流总图。',
            score: 80,
          },
        ]
      : [];

    lessonHits.sort((a, b) => b.score - a.score);
    stepHits.sort((a, b) => b.score - a.score);

    return [...lessonHits.slice(0, 8), ...stepHits.slice(0, 14), ...cheatsheetHits];
  }, [lessons, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const activeEl = itemRefs.current[activeIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const selectHit = useCallback(
    (hit: SearchHit) => {
      if (hit.group === 'cheatsheet') {
        onSelectTarget({ mode: 'cheatsheet' });
      } else if (hit.lessonSlug) {
        onSelectTarget({
          mode: 'learn',
          lessonSlug: hit.lessonSlug,
          stepNumber: hit.stepNumber ?? 1,
        });
      }
      onClose();
    },
    [onSelectTarget, onClose],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.target !== inputRef.current || event.altKey || event.ctrlKey || event.metaKey) return;
      if (hits.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % hits.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + hits.length) % hits.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const hit = hits[activeIndex] ?? hits[0];
        if (hit) selectHit(hit);
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hits, activeIndex, selectHit]);

  const lessonGroup = hits.filter((h) => h.group === 'lesson');
  const stepGroup = hits.filter((h) => h.group === 'step');
  const cheatsheetGroup = hits.filter((h) => h.group === 'cheatsheet');

  let runningIndex = 0;

  const renderGroup = (label: string, items: SearchHit[]) => {
    if (items.length === 0) return null;
    return (
      <div className="search-group">
        <div className="search-group-label">{label}</div>
        {items.map((hit) => {
          const idx = runningIndex++;
          const isActive = idx === activeIndex;
          return (
            <button
              key={hit.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              type="button"
              className={`search-result-item ${
                isActive ? 'search-result-item--active' : ''
              }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => selectHit(hit)}
            >
              <span className="search-result-main">
                <span className="search-result-title-row">
                  {hit.group === 'lesson' && <BookOpen size={13} />}
                  {hit.group === 'step' && <Layers size={13} />}
                  {hit.group === 'cheatsheet' && <ScrollText size={13} />}
                  <span className="search-result-title">
                    {highlightText(hit.title, query)}
                  </span>
                </span>
                <span className="search-result-meta">{hit.meta}</span>
                <span className="search-result-snippet">
                  {highlightText(hit.snippet, query)}
                </span>
              </span>
              <ArrowRight size={14} className="search-result-arrow" />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      className="search-backdrop"
      aria-label="搜索课程与概念"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="search-modal">
        <div className="search-input-row">
          <Search size={16} className="search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索课程、步骤或标识符（如 agentLoop、Steering、Compaction、MCP）…"
            aria-label="搜索关键词"
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              清空
            </button>
          )}
          <button type="button" className="search-clear-btn" onClick={onClose}>关闭</button>
        </div>

        <div className="search-results">
          {hits.length === 0 ? (
            <div className="search-empty">
              未找到与「{query}」匹配的课程或步骤。试试搜索{' '}
              <code className="inline-code">agentLoop</code>、
              <code className="inline-code">Steering</code>、
              <code className="inline-code">Compaction</code> 或{' '}
              <code className="inline-code">JSONL</code>。
            </div>
          ) : (
            <>
              {renderGroup(
                query.trim() ? `课程与主题 (${lessonGroup.length})` : '全部课程快速跳转',
                lessonGroup,
              )}
              {renderGroup(`匹配步骤 (${stepGroup.length})`, stepGroup)}
              {renderGroup('速查表', cheatsheetGroup)}
            </>
          )}
        </div>

        <div className="search-footer">
          <div className="search-footer-keys">
            <span className="search-footer-hint">
              <kbd className="kbd">↑</kbd>
              <kbd className="kbd">↓</kbd> 选择
            </span>
            <span className="search-footer-hint">
              <kbd className="kbd">↵</kbd> 跳转
            </span>
            <span className="search-footer-hint">
              <kbd className="kbd">Esc</kbd> 关闭
            </span>
          </div>
          <span>共 {hits.length} 条结果</span>
        </div>
      </div>
    </dialog>
  );
}
