'use client';

import { useEffect, useMemo, useState } from 'react';
import { sectionKeys } from '@/content/site';
import { props as motionProps, trace } from '@/config/motion';
import { useIsNarrow } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';

/**
 * A wave rail down the left edge that fills as the page scrolls, with a marker
 * per section that lights once the reading position passes it.
 *
 * Everything it draws depends on measured layout, so it renders nothing until
 * the first measurement lands in an effect.
 */

const WRAPPER_ID = 'sections';

function waveX(y: number): number {
  return trace.centerX + Math.sin(y * trace.frequency) * trace.amplitude;
}

function buildWavePath(height: number): { d: string; length: number } {
  let d = `M ${waveX(0)} 0`;
  let length = 0;
  let px = waveX(0);
  let py = 0;

  for (let y = trace.stepPx; y <= height; y += trace.stepPx) {
    const x = waveX(y);
    d += ` L ${x.toFixed(2)} ${y}`;
    length += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }

  return { d, length };
}

type Metrics = { top: number; height: number; markers: Record<string, number> };

export function TraceRail() {
  const { introDone } = useMotion();
  const narrow = useIsNarrow();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [progress, setProgress] = useState(0);

  // Measure the section wrapper and each section's offset within it.
  useEffect(() => {
    const wrapper = document.getElementById(WRAPPER_ID);
    if (!wrapper) return;

    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const markers: Record<string, number> = {};
      for (const key of sectionKeys) {
        const el = document.getElementById(key);
        if (el) markers[key] = el.getBoundingClientRect().top + window.scrollY - top;
      }
      setMetrics({ top, height: Math.max(rect.height, 1), markers });
    };

    // Fires once on observe, then on any reflow — covers late font loading and
    // the reveal transitions without the export's fixed 500ms guess.
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (!metrics) return;
    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const y = window.scrollY;
        const maxScroll = Math.max(
          document.documentElement.scrollHeight - window.innerHeight,
          1,
        );
        let next = 0;
        if (metrics.height > 0) {
          next = (y + window.innerHeight * trace.viewportAnchor - metrics.top) / metrics.height;
          next = Math.min(Math.max(next, 0), 1);
        }
        // Guarantee a full rail at the very bottom of the page.
        if (y >= maxScroll - 2) next = 1;
        setProgress(next);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [metrics]);

  const wave = useMemo(() => buildWavePath(metrics?.height ?? 0), [metrics?.height]);

  if (narrow || !motionProps.showTraceLine || !introDone || !metrics) return null;

  const headY = progress * metrics.height;

  return (
    <svg
      width="40"
      height={metrics.height}
      aria-hidden
      style={{
        position: 'absolute',
        top: 0,
        left: 'clamp(10px, 3vw, 34px)',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      <path d={wave.d} fill="none" stroke="var(--color-rule)" strokeWidth={2} />
      <path
        d={wave.d}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={wave.length}
        strokeDashoffset={wave.length * (1 - progress)}
      />
      <circle cx={waveX(headY)} cy={headY} r={7} fill="var(--color-accent)" />
      {sectionKeys.map((key) => {
        const y = metrics.markers[key] ?? 0;
        return (
          <circle
            key={key}
            cx={waveX(y)}
            cy={y}
            r={4.5}
            fill={headY >= y ? 'var(--color-accent)' : 'var(--color-paper)'}
            stroke="var(--color-accent)"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}
