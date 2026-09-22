'use client';

import { stackEdges, stackTools, type StackShape, type StackTool } from '@/content/site';
import { stack as stackMotion } from '@/config/motion';
import { useStack } from '@/components/StackProvider';

/**
 * The tech-stack constellation.
 *
 * Node weight encodes depth: filled discs with a halo for production work,
 * outlined discs for project work, open rings for foundations, coral squares
 * for things built from scratch. Hovering a node lights it and its neighbours;
 * clicking filters the projects above.
 *
 * Pointer handling is delegated from the <svg>, so every node needs only a
 * data-tool attribute and an invisible hit target.
 */

const SHAPE: Record<StackShape, { labelDy: number; fontSize: number }> = {
  core: { labelDy: 20, fontSize: 13.5 },
  node: { labelDy: 18.5, fontSize: 12.5 },
  root: { labelDy: 21, fontSize: 13.5 },
  leaf: { labelDy: 17, fontSize: 11.5 },
  artifact: { labelDy: 23, fontSize: 13 },
};

const byId = new Map(stackTools.map((tool) => [tool.id, tool]));

function Marker({ tool }: { tool: StackTool }) {
  const { x, y } = tool;

  switch (tool.shape) {
    case 'core':
      return (
        <>
          <circle cx={x} cy={y} r={7} fill="var(--color-accent)" />
          <circle
            cx={x}
            cy={y}
            r={11.5}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1}
            opacity={0.45}
          />
        </>
      );
    case 'node':
      return (
        <circle
          cx={x}
          cy={y}
          r={5.5}
          fill="var(--color-paper)"
          stroke="var(--color-accent)"
          strokeWidth={1.6}
        />
      );
    case 'root':
      return (
        <circle cx={x} cy={y} r={6.5} fill="none" stroke="var(--color-accent)" strokeWidth={1.8} />
      );
    case 'leaf':
      return (
        <circle cx={x} cy={y} r={4} fill="none" stroke="var(--color-accent)" strokeWidth={1.1} />
      );
    case 'artifact':
      return (
        <rect
          x={x - 7.5}
          y={y - 7.5}
          width={15}
          height={15}
          fill="var(--color-paper)"
          stroke="var(--color-coral)"
          strokeWidth={2}
        />
      );
  }
}

export function StackConstellation() {
  const { visuals, onToolHover, onToolLeave, onToolClick } = useStack();

  return (
    <div className="constellation">
      <svg
        viewBox="0 0 1000 560"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        fill="none"
        onMouseMove={onToolHover}
        onMouseLeave={onToolLeave}
        onClick={onToolClick}
      >
        <g fill="none" stroke="var(--color-accent)" strokeLinecap="round">
          {stackEdges.map((edge, i) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) return null;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={edge.width}
                opacity={visuals.edgeOpacity[i]}
              />
            );
          })}
        </g>

        {/* Ring that follows whichever node is hovered or filtered. */}
        <circle
          cx={visuals.focusX}
          cy={visuals.focusY}
          r={stackMotion.focusRingRadius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={1.1}
          opacity={visuals.focusOpacity}
        />

        {stackTools.map((tool) => (
          <g key={tool.id} data-tool={tool.id} style={{ cursor: 'pointer' }}>
            <circle cx={tool.x} cy={tool.y} r={stackMotion.hitRadius} fill="transparent" />
            <g opacity={visuals.nodeOpacity[tool.id]}>
              <Marker tool={tool} />
            </g>
            <text
              x={tool.x}
              y={tool.y + SHAPE[tool.shape].labelDy}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={SHAPE[tool.shape].fontSize}
              opacity={visuals.labelOpacity[tool.id]}
              fill="var(--color-body)"
            >
              {tool.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
