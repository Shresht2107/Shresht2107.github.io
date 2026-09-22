'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { stackEdges, stackProjects, stackTools } from '@/content/site';
import { stack as stackMotion } from '@/config/motion';
import { useMotion } from '@/components/MotionProvider';
import { scrollToSection } from '@/lib/motion';

/** Per-tool opacities, per-edge opacities and the focus ring position. */
export type StackVisuals = {
  nodeOpacity: Record<string, number>;
  labelOpacity: Record<string, number>;
  edgeOpacity: number[];
  focusX: number;
  focusY: number;
  focusOpacity: number;
};

type StackContextValue = {
  hoverTool: string | null;
  activeProject: string | null;
  filterTool: string | null;
  visuals: StackVisuals;
  /** Tool id -> the project ids that use it. */
  toolProjects: Record<string, string[]>;
  onToolHover: (e: MouseEvent) => void;
  onToolLeave: () => void;
  onToolClick: (e: MouseEvent) => void;
  onProjectHover: (e: MouseEvent) => void;
  clearFilter: () => void;
  clearHighlight: () => void;
};

const StackContext = createContext<StackContextValue | null>(null);

/** Neighbours of each tool, derived from the edge list. */
const adjacency: Record<string, string[]> = (() => {
  const adj: Record<string, string[]> = {};
  for (const { from, to } of stackEdges) {
    (adj[from] ??= []).push(to);
    (adj[to] ??= []).push(from);
  }
  return adj;
})();

const toolProjects: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const [id, project] of Object.entries(stackProjects)) {
    for (const tool of project.tools) (map[tool] ??= []).push(id);
  }
  return map;
})();

/** Walks up from the event target to whichever element declares a data-tool. */
function pickAttr(e: MouseEvent, attr: string): string | null {
  const target = e.target;
  if (!(target instanceof Element)) return null;
  return target.closest(`[${attr}]`)?.getAttribute(attr) ?? null;
}

export function StackProvider({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotion();
  const [hoverTool, setHoverTool] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [filterTool, setFilterTool] = useState<string | null>(null);

  const visuals = useMemo<StackVisuals>(() => {
    // Hovering wins over a project highlight, which wins over an active filter.
    let lit: Set<string> | null = null;
    let focus = hoverTool;

    if (hoverTool) {
      lit = new Set([hoverTool, ...(adjacency[hoverTool] ?? [])]);
    } else if (activeProject && stackProjects[activeProject]) {
      lit = new Set(stackProjects[activeProject].tools);
    } else if (filterTool) {
      lit = new Set([filterTool, ...(adjacency[filterTool] ?? [])]);
      focus = filterTool;
    }

    const nodeOpacity: Record<string, number> = {};
    const labelOpacity: Record<string, number> = {};
    for (const tool of stackTools) {
      nodeOpacity[tool.id] = lit
        ? lit.has(tool.id)
          ? 1
          : stackMotion.dimmedOpacity
        : stackMotion.tierOpacity[tool.tier];
      labelOpacity[tool.id] = lit ? (lit.has(tool.id) ? 1 : stackMotion.dimmedLabelOpacity) : 1;
    }

    const edgeOpacity = stackEdges.map(({ from, to }) =>
      lit
        ? lit.has(from) && lit.has(to)
          ? stackMotion.edgeOpacity.lit
          : stackMotion.edgeOpacity.dimmed
        : stackMotion.edgeOpacity.resting,
    );

    const focused = focus ? stackTools.find((t) => t.id === focus) : undefined;
    return {
      nodeOpacity,
      labelOpacity,
      edgeOpacity,
      focusX: focused?.x ?? 0,
      focusY: focused?.y ?? 0,
      focusOpacity: focused ? stackMotion.focusRingOpacity : 0,
    };
  }, [hoverTool, activeProject, filterTool]);

  const onToolHover = useCallback((e: MouseEvent) => {
    setHoverTool((current) => {
      const next = pickAttr(e, 'data-tool');
      return next === current ? current : next;
    });
  }, []);

  const onToolLeave = useCallback(() => setHoverTool(null), []);

  const onToolClick = useCallback(
    (e: MouseEvent) => {
      const tool = pickAttr(e, 'data-tool');
      if (!tool) return;
      const turningOn = filterTool !== tool;
      setFilterTool(turningOn ? tool : null);
      setActiveProject(null);
      if (turningOn) scrollToSection('projects', reducedMotion);
    },
    [filterTool, reducedMotion],
  );

  const onProjectHover = useCallback((e: MouseEvent) => {
    const project = pickAttr(e, 'data-project');
    if (!project) return;
    setActiveProject((current) => (project === current ? current : project));
  }, []);

  const clearFilter = useCallback(() => setFilterTool(null), []);
  const clearHighlight = useCallback(() => {
    setActiveProject(null);
    setFilterTool(null);
  }, []);

  const value = useMemo<StackContextValue>(
    () => ({
      hoverTool,
      activeProject,
      filterTool,
      visuals,
      toolProjects,
      onToolHover,
      onToolLeave,
      onToolClick,
      onProjectHover,
      clearFilter,
      clearHighlight,
    }),
    [
      hoverTool,
      activeProject,
      filterTool,
      visuals,
      onToolHover,
      onToolLeave,
      onToolClick,
      onProjectHover,
      clearFilter,
      clearHighlight,
    ],
  );

  return <StackContext.Provider value={value}>{children}</StackContext.Provider>;
}

export function useStack(): StackContextValue {
  const ctx = useContext(StackContext);
  if (!ctx) throw new Error('useStack must be used inside StackProvider');
  return ctx;
}
