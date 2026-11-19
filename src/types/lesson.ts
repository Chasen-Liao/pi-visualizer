// ============================================================================
// Pi Agent Loop Visualizer — Single Source of Truth Schema
// Shared contract for Architect, Stage Engine, Chapter Authors, and Cheatsheet
// ============================================================================

export type ChapterColor = 'sage' | 'blue' | 'violet' | 'amber' | 'coral' | 'teal';

export type LessonLevel = '入门' | '核心' | '进阶';

export type StepBadge = 'PROBLEM' | 'TECHNIQUE' | 'SOLUTION' | 'INSIGHT' | 'RECAP';

export type CalloutKind = 'idea' | 'tip' | 'warn';

export type DiffKind = 'add' | 'change' | 'remove';

export type KpiStatus = 'neutral' | 'good' | 'warn' | 'bad';

export type SourceLanguage = 'ts' | 'json' | 'jsonl' | 'text';

export type StageTone = 'neutral' | 'green' | 'violet' | 'blue' | 'orange' | 'rose';

export type IsoNodeTone = StageTone | 'dark';

export type AccentTone = 'green' | 'violet' | 'blue' | 'orange' | 'rose';

// ----------------------------------------------------------------------------
// 1. Declarative Stage Scene Renderers (4 Variants)
// ----------------------------------------------------------------------------

// 1A. 2.5D Isometric Flow Diagram (normalized 0..1000 x 0..560 coordinate space)
export interface IsoNodeMeter {
  /** 0..100 fill percentage */
  value: number;
  label: string;
  status?: 'good' | 'warn' | 'bad';
}

export interface IsoNode {
  id: string;
  /** X coordinate in normalized 0..1000 stage space */
  x: number;
  /** Y coordinate in normalized 0..560 stage space */
  y: number;
  label: string;
  sublabel?: string;
  /**
   * Optional icon key resolved by Stage Engine (e.g. 'brain', 'cpu', 'terminal',
   * 'file', 'edit', 'layers', 'queue', 'shield', 'loop', 'sparkles', 'database',
   * 'code', 'user', 'git-branch', 'package', 'zap', 'wrench', 'search', 'message',
   * 'box', 'clock', 'alert', 'check', 'plug').
   */
  icon?: string;
  tone: IsoNodeTone;
  size?: 'sm' | 'md' | 'lg' | 'platform';
  meter?: IsoNodeMeter;
  active?: boolean;
  dimmed?: boolean;
  badge?: string;
}

export interface IsoZoneItem {
  label?: string;
  color?: string;
  filled?: boolean;
}

export interface IsoZone {
  id?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: StageTone;
  dashed?: boolean;
  items?: IsoZoneItem[];
}

export interface IsoEdge {
  id?: string;
  from: string;
  to: string;
  /** Optional intermediate waypoints in 0..1000 x 0..560 space */
  via?: [number, number][];
  label?: string;
  packetColor?: string;
  packetCount?: number;
  /** Relative speed multiplier (1 = default, >1 faster, <1 slower) */
  packetSpeed?: number;
  dashed?: boolean;
  curved?: boolean;
  status?: 'normal' | 'active' | 'error' | 'dimmed';
}

export interface IsoCallout {
  x: number;
  y: number;
  text: string;
  tone?: StageTone;
}

export interface IsoMiniChart {
  title: string;
  xLabel: string;
  yLabel: string;
  points: [number, number][];
  highlightIndex?: number;
  highlightLabel?: string;
  tone?: AccentTone;
}

export interface IsoFlowScene {
  kind: 'iso-flow';
  title?: string;
  nodes: IsoNode[];
  zones?: IsoZone[];
  edges: IsoEdge[];
  callouts?: IsoCallout[];
  miniChart?: IsoMiniChart;
}

// 1B. JSONL v3 Session Tree Visualizer
export type TreeNodeKind =
  | 'session'
  | 'user'
  | 'assistant'
  | 'tool'
  | 'compaction'
  | 'branch_summary'
  | 'context_edit'
  | 'label';

export type TreeNodeStatus = 'active' | 'abandoned' | 'compacted' | 'highlight' | 'new';

export interface TreeNode {
  id: string;
  /** 8-char hex id as used in Pi JSONL v3 entries, e.g. "a3f9c201" */
  hexId: string;
  parentId?: string;
  /** X coordinate in normalized stage space (0..1000, or 0..640 when filePreview is present) */
  x: number;
  /** Y coordinate in normalized 0..560 stage space */
  y: number;
  kind: TreeNodeKind;
  label: string;
  sublabel?: string;
  status?: TreeNodeStatus;
  badge?: string;
}

export interface TreeEdge {
  from: string;
  to: string;
  kind?: 'parent' | 'lca_summary' | 'compaction_link';
  label?: string;
  animated?: boolean;
}

export interface TreeAnnotation {
  x: number;
  y: number;
  text: string;
  tone?: AccentTone;
}

export interface TreeFilePreviewLine {
  id: string;
  text: string;
  highlight?: boolean;
  muted?: boolean;
}

export interface TreeFilePreview {
  title: string;
  lines: TreeFilePreviewLine[];
}

export interface TreeScene {
  kind: 'tree';
  title?: string;
  nodes: TreeNode[];
  edges?: TreeEdge[];
  annotations?: TreeAnnotation[];
  filePreview?: TreeFilePreview;
}

// 1C. Token Slices / Context Budget / Prompt Cache / Compaction Visualizer
export type TokenSegmentTone = StageTone | 'muted';

export interface TokenSegment {
  id: string;
  label: string;
  tokens: number;
  tone: TokenSegmentTone;
  cached?: boolean;
  atomicGroup?: string;
  delta?: boolean;
  dropped?: boolean;
}

export interface TokenTrack {
  id: string;
  title: string;
  subtitle?: string;
  totalBudget: number;
  usedTokens: number;
  reserveTokens?: number;
  keepRecentStart?: number;
  cutPointPos?: number;
  cutPointLabel?: string;
  cacheHitEnd?: number;
  segments: TokenSegment[];
}

export interface TokenCalloutBadge {
  label: string;
  value: string;
  tone: AccentTone;
}

export interface TokenMiniChartSeries {
  label: string;
  color: string;
  points: [number, number][];
}

export interface TokenMiniChart {
  title: string;
  xLabel: string;
  yLabel: string;
  series: TokenMiniChartSeries[];
  highlightX?: number;
  highlightNote?: string;
}

export interface TokenSlicesScene {
  kind: 'token-slices';
  title?: string;
  tracks: TokenTrack[];
  calloutBadges?: TokenCalloutBadge[];
  miniChart?: TokenMiniChart;
}

// 1D. Event Stream / Parallel Tool Execution Swimlane Visualizer
export interface SwimlaneLane {
  id: string;
  label: string;
  sublabel?: string;
  tone?: StageTone;
}

export interface SwimlaneTick {
  /** Normalized 0..100 horizontal position */
  pos: number;
  label: string;
}

export type SwimlaneBarStatus =
  | 'running'
  | 'done'
  | 'blocked'
  | 'error'
  | 'parallel'
  | 'queued';

export interface SwimlaneBar {
  id: string;
  laneId: string;
  /** Start position 0..100 */
  start: number;
  /** End position 0..100 */
  end: number;
  label: string;
  sublabel?: string;
  tone: StageTone;
  status?: SwimlaneBarStatus;
  orderBadge?: string;
}

export interface SwimlaneEvent {
  id: string;
  laneId: string;
  /** Position 0..100 */
  pos: number;
  label: string;
  tone: AccentTone;
  emphasized?: boolean;
}

export interface SwimlaneConnector {
  fromPos: number;
  fromLaneId: string;
  toPos: number;
  toLaneId: string;
  label?: string;
  dashed?: boolean;
}

export interface SwimlanePhaseBand {
  start: number;
  end: number;
  label: string;
  tone?: 'neutral' | 'green' | 'violet' | 'blue' | 'orange';
}

export interface SwimlaneScene {
  kind: 'swimlane';
  title?: string;
  lanes: SwimlaneLane[];
  ticks: SwimlaneTick[];
  bars: SwimlaneBar[];
  events?: SwimlaneEvent[];
  connectors?: SwimlaneConnector[];
  phaseBands?: SwimlanePhaseBand[];
}

export type StageScene = IsoFlowScene | TreeScene | TokenSlicesScene | SwimlaneScene;

// ----------------------------------------------------------------------------
// 2. Lesson & Curriculum Structure
// ----------------------------------------------------------------------------

export interface LessonObjective {
  id: string;
  text: string;
  /** 1-based stepNumber at which this learning objective is checked off */
  completedAtStep: number;
}

export interface StepCallout {
  kind: CalloutKind;
  title?: string;
  text: string;
}

export interface StepDiff {
  kind: DiffKind;
  text: string;
}

export interface SourceDrawer {
  title: string;
  filePath: string;
  githubUrl: string;
  language: SourceLanguage;
  code: string;
  caption?: string;
}

export interface RecapRow {
  question: string;
  decision: string;
  because: string;
}

export interface StepKpi {
  label: string;
  value: string;
  status?: KpiStatus;
  icon?: string;
}

export interface StepLegendItem {
  color: string;
  label: string;
  dashed?: boolean;
}

export interface LessonStep {
  /** 1-based step number within the lesson */
  stepNumber: number;
  shortLabel: string;
  badge: StepBadge;
  title: string;
  /** Paragraphs supporting inline `code` backtick spans */
  paragraphs: string[];
  callout?: StepCallout;
  diffs?: StepDiff[];
  sourceDrawer?: SourceDrawer;
  recapTable?: RecapRow[];
  kpis: StepKpi[];
  legend?: StepLegendItem[];
  scene: StageScene;
}

export interface Lesson {
  id: string;
  slug: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  /** 1-based index within the chapter */
  lessonIndexInChapter: number;
  totalInChapter: number;
  title: string;
  subtitle: string;
  durationMin: number;
  level: LessonLevel;
  objectives: LessonObjective[];
  steps: LessonStep[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  color: ChapterColor;
  lessons: Lesson[];
}

// ----------------------------------------------------------------------------
// 3. StagePanel Component Contract
// ----------------------------------------------------------------------------

export interface StagePanelProps {
  lesson: Lesson;
  step: LessonStep;
  /** 0-based active step index */
  stepIndex: number;
  totalSteps: number;
  chapterColor: ChapterColor;
  isPlaying: boolean;
  /** Incremented whenever the user triggers Replay (button or 'r' key) */
  replayKey: number;
  canPrev: boolean;
  canNext: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onSelectStep: (stepIndex: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

// ----------------------------------------------------------------------------
// 4. Cheatsheet Data Contract (6 Structured Reference Sections)
// ----------------------------------------------------------------------------

export interface CheatsheetLink {
  label: string;
  lessonSlug: string;
  stepNumber?: number;
}

export interface CheatsheetSectionMeta {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  lessonLink?: CheatsheetLink;
}

export interface CheatsheetControlCard {
  id: string;
  phase: 'outer' | 'inner' | 'exit' | 'hook';
  title: string;
  identifier: string;
  trigger: string;
  behavior: string;
  lessonSlug: string;
  stepNumber?: number;
}

export interface CheatsheetEventRow {
  eventType: string;
  category: 'agent' | 'turn' | 'message' | 'tool';
  payload: string;
  timing: string;
  note: string;
}

export interface CheatsheetPipelineStage {
  order: number;
  name: string;
  identifier: string;
  inputType: string;
  outputType: string;
  role: string;
  note?: string;
}

export interface CheatsheetParamItem {
  key: string;
  defaultValue: string;
  scope: string;
  description: string;
  tone?: StageTone;
}

export interface CheatsheetEntryType {
  type: string;
  inLlmContext: 'yes' | 'conditional' | 'no';
  purpose: string;
  keyFields: string;
}

export interface CheatsheetDecisionRow {
  dimension: string;
  piApproach: string;
  conventionalApproach: string;
  rationale: string;
  lessonSlug: string;
  stepNumber?: number;
}

export interface CheatsheetData {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    repoNote: string;
    disambiguationNote: string;
    stats: {
      label: string;
      value: string;
      tone?: 'neutral' | 'green' | 'violet' | 'blue' | 'orange';
    }[];
  };
  sections: {
    doubleLoop: CheatsheetSectionMeta & {
      cards: CheatsheetControlCard[];
    };
    events: CheatsheetSectionMeta & {
      items: CheatsheetEventRow[];
    };
    pipeline: CheatsheetSectionMeta & {
      stages: CheatsheetPipelineStage[];
      customMessageTypes: {
        role: string;
        includedInLlm: boolean;
        note: string;
      }[];
    };
    defaults: CheatsheetSectionMeta & {
      params: CheatsheetParamItem[];
      coreTools: {
        name: string;
        role: string;
        defaultEnabled: boolean;
        note: string;
      }[];
      mcpModes: {
        mode: string;
        promptCost: string;
        behavior: string;
        isDefault?: boolean;
      }[];
    };
    sessionAndExt: CheatsheetSectionMeta & {
      entryTypes: CheatsheetEntryType[];
      extensionHooks: {
        hook: string;
        phase: string;
        capability: string;
      }[];
    };
    decisions: CheatsheetSectionMeta & {
      rows: CheatsheetDecisionRow[];
    };
  };
}
