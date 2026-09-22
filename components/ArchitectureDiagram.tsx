'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DiagramSpec } from '@/content/site';
import { diagram } from '@/config/motion';
import { useMotion } from '@/components/MotionProvider';

/**
 * A pipeline diagram that builds itself once, on its own clock, the first time
 * it scrolls into view. Progress maps onto the spec's build sequence: one step
 * per node-appear or edge-draw, in pipeline order.
 *
 * Once built, looping ticks travel the finished pipeline.
 */

/**
 * Spreads a single 0..1 progress value across the sequence.
 * 'e' keys get a stroke-dashoffset falling to 0; 'n' keys get an opacity.
 * Each labelled edge's annotation fades in as that edge draws.
 */
function diagramValues(
  p: number,
  sequence: readonly string[],
  labelled: readonly string[],
): Record<string, number> {
  const n = sequence.length;
  const out: Record<string, number> = {};

  for (let i = 0; i < n; i++) {
    const key = sequence[i]!;
    let v = Math.min(Math.max(p * n - i, 0), 1);
    v = v * v * (3 - 2 * v); // smoothstep
    out[key] = Number((key.startsWith('e') ? 1 - v : v).toFixed(3));
  }

  for (const key of labelled) {
    out[`l${key.slice(1)}`] = Number((1 - (out[key] ?? 0)).toFixed(3));
  }

  out.done = p > 0.995 ? 1 : 0;
  return out;
}

export function ArchitectureDiagram({ spec }: { spec: DiagramSpec }) {
  const { reducedMotion } = useMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const [built, setBuilt] = useState(0);

  // Reduced motion renders the finished diagram rather than building it.
  const progress = reducedMotion ? 1 : built;

  useEffect(() => {
    if (reducedMotion) return;

    const el = frameRef.current;
    if (!el) return;

    let rafId: number | null = null;
    let started = false;

    const run = () => {
      const t0 = performance.now();
      const step = (ts: number) => {
        const next = Math.min((ts - t0) / diagram.durationMs, 1);
        setBuilt(next);
        rafId = next < 1 ? requestAnimationFrame(step) : null;
      };
      rafId = requestAnimationFrame(step);
    };

    const margin = (1 - diagram.startAtViewportFraction) * 100;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started) continue;
          started = true;
          observer.unobserve(entry.target);
          run();
        }
      },
      { rootMargin: `0px 0px -${margin}% 0px` },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  const v = useMemo(
    () => diagramValues(progress, spec.sequence, spec.labelled),
    [progress, spec.sequence, spec.labelled],
  );

  const accent = spec.accent === 'coral' ? 'var(--color-coral)' : 'var(--color-accent)';

  return (
    <div ref={frameRef} className="diagram-frame">
      <svg
        viewBox={spec.viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
        fill="none"
        aria-hidden
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {spec.edges.map((edge) => (
            <path
              key={edge.key}
              d={edge.d}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={v[edge.key]}
              stroke={accent}
              strokeWidth={edge.width}
            />
          ))}
        </g>

        {/* Dashes laid over an edge so it reads as a break in the flow. */}
        {spec.overlays.length > 0 && (
          <g fill="none" stroke="var(--color-panel)" strokeWidth={2.8} strokeDasharray="3 5">
            {spec.overlays.map((overlay) => (
              <path key={overlay.d} d={overlay.d} />
            ))}
          </g>
        )}

        <g
          opacity={v.done}
          fill="none"
          stroke={accent}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
        >
          {spec.pulses.map((pulse) => (
            <path
              key={pulse.d}
              className="diagram-pulse"
              d={pulse.d}
              pathLength={400}
              strokeDasharray={pulse.dashArray}
              style={{
                animation: `diagPulse ${pulse.durationSec}s linear infinite`,
                animationDelay: `${pulse.delaySec}s`,
              }}
            />
          ))}
        </g>

        {spec.annotations.map((annotation) => (
          <g key={annotation.key} opacity={v[annotation.key]}>
            {annotation.lines.map((line) => (
              <text
                key={line.text}
                x={line.x}
                y={line.y}
                textAnchor={line.anchor}
                fontFamily="var(--font-mono)"
                fontSize={7}
                fill="var(--color-annotation)"
              >
                {line.text}
              </text>
            ))}
          </g>
        ))}

        {spec.nodes.map((node) => (
          <g key={node.key} opacity={v[node.key]}>
            {node.filled ? (
              <circle cx={node.cx} cy={node.cy} r={4.2} fill={accent} />
            ) : (
              <circle
                cx={node.cx}
                cy={node.cy}
                r={4.2}
                fill="var(--color-panel)"
                stroke={accent}
                strokeWidth={1.4}
              />
            )}
            {node.labels.map((label) => (
              <text
                key={label.text}
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                fontFamily="var(--font-mono)"
                fontSize={8.2}
                fill="var(--color-diagram)"
              >
                {label.text}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
