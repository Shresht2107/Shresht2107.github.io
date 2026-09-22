'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotion } from '@/components/MotionProvider';
import { intro, props as motionProps } from '@/config/motion';

/**
 * The opening sequence.
 *
 * The S draws along its curve while a thick masked stroke sweeps the solid fill
 * in behind it, then the whole mark flies to the nav and parks on top of it.
 * The overlay fades out during the flight; the page then holds still for ~1.5s
 * before the hero starts typing. Nothing else animates in that window.
 *
 * Under reduced motion the sequence is skipped outright and the page renders in
 * its settled state.
 */

/** Newsreader 'S', outlined as a path. Drawn at translate(47.4, 170). */
const S_PATH =
  'M87.50-127.70L87.50-127.70L73-131.60L85.20-139.80L86.90-139.80L93.10-95.70L88.70-94.90L71.40-125.80L74.90-121.20Q69.70-124.90 64.35-126.45Q59-128 52.70-128L52.70-128Q39.80-128 32.70-121.90Q25.60-115.80 25.60-105.70L25.60-105.70Q25.60-99 28.35-94.40Q31.10-89.80 35.90-86.60Q40.70-83.40 46.80-81Q52.90-78.60 59.60-76.20L59.60-76.20Q66.30-73.80 72.90-70.95Q79.50-68.10 84.95-63.95Q90.40-59.80 93.70-53.50Q97-47.20 97-38L97-38Q97-25.10 90.95-16.20Q84.90-7.30 74.25-2.65Q63.60 2 49.60 2L49.60 2Q40 2 32.50 0.65Q25-0.70 16.90-4L16.90-4L8.20-38.60L14-38.60L37.60-4.10L21-14.60Q28.80-10.40 34.95-8.45Q41.10-6.50 48.10-6.50L48.10-6.50Q59.10-6.50 66.95-9.35Q74.80-12.20 79-18Q83.20-23.80 83.20-32.60L83.20-32.60Q83.20-40.30 79.75-45.40Q76.30-50.50 70.60-53.85Q64.90-57.20 58.15-59.65Q51.40-62.10 44.80-64.60L44.80-64.60Q38.20-67.10 32.45-70.05Q26.70-73 22.35-77Q18-81 15.55-86.65Q13.10-92.30 13.10-100.20L13.10-100.20Q13.10-111.20 18.25-119.20Q23.40-127.20 32.95-131.60Q42.50-136 55.50-136L55.50-136Q64.40-136 72.05-134Q79.70-132 87.50-127.70Z';

const GLYPH_TRANSFORM = 'translate(47.4, 170)';

type Stage = 'hidden' | 'revealed' | 'filled' | 'fly';

export function Intro() {
  const { reducedMotion, ready, introDone, markIntroDone } = useMotion();
  const [stage, setStage] = useState<Stage>('hidden');
  const [flyTransform, setFlyTransform] = useState('translate(-50%, -50%)');
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The provider already treats reduced motion / intro-off as finished, so
    // there is nothing to announce here — just don't run the sequence.
    if (!ready || reducedMotion || !motionProps.showIntro) return;

    let flyRetry: number | null = null;

    /**
     * Measures the nav mark and the floating mark, then hands the delta to CSS.
     * Both need layout, so this only ever runs from a timer, never in render.
     */
    function startFly(): void {
      const navEl = document.getElementById('nav-mark');
      const introEl = markRef.current;
      if (!navEl || !introEl) {
        flyRetry = requestAnimationFrame(startFly);
        return;
      }
      const navRect = navEl.getBoundingClientRect();
      const introRect = introEl.getBoundingClientRect();
      const scale = navRect.height / introRect.height;
      const dx = navRect.left + navRect.width / 2 - (introRect.left + introRect.width / 2);
      const dy = navRect.top + navRect.height / 2 - (introRect.top + introRect.height / 2);
      setFlyTransform(
        `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`,
      );
      setStage('fly');
    }

    // One frame in 'hidden' so the dash offsets have a value to transition from.
    const raf = requestAnimationFrame(() => setStage('revealed'));
    const timers = [
      window.setTimeout(() => setStage('filled'), intro.filledAtMs),
      window.setTimeout(startFly, intro.flyAtMs),
      window.setTimeout(markIntroDone, intro.doneAtMs),
    ];

    return () => {
      cancelAnimationFrame(raf);
      for (const id of timers) clearTimeout(id);
      if (flyRetry !== null) cancelAnimationFrame(flyRetry);
    };
  }, [ready, reducedMotion, markIntroDone]);

  // Held back until the media query is known, so a reduced-motion visitor never
  // sees a frame of it.
  if (!ready || reducedMotion || !motionProps.showIntro || introDone) return null;

  const idle = stage === 'hidden';

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'var(--color-paper)',
          opacity: stage === 'fly' ? 0 : 1,
          transition: `opacity ${intro.overlayFadeSec}s ease`,
          pointerEvents: 'none',
        }}
      />
      <div
        ref={markRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          zIndex: 10000,
          transform: stage === 'fly' ? flyTransform : 'translate(-50%, -50%)',
          transformOrigin: 'center center',
          transition: stage === 'fly' ? `transform ${intro.flyDurationSec}s ${intro.flyEasing}` : 'none',
          pointerEvents: 'none',
        }}
      >
        <svg width="220" height="240" viewBox="0 0 220 240">
          <defs>
            {/*
              Mask content is resolved in the referencing element's user space,
              which the parent <g> has already translated — so the stroke must
              NOT repeat GLYPH_TRANSFORM, and the mask region is left at its
              default (the glyph's bounding box). The export wrapped this path
              in a second translate and pinned the region to y 0..240, which put
              the stroke off-canvas and clipped the region away from the glyph
              (it sits at y -139.8..2); the fill never rendered as a result.
            */}
            <mask id="introFillMask">
              {/* A fat white stroke sweeping the path reveals the fill behind it. */}
              <path
                d={S_PATH}
                style={{
                  fill: 'none',
                  stroke: 'white',
                  strokeWidth: 60,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeDasharray: intro.dashLength,
                  strokeDashoffset: idle ? intro.dashLength : 0,
                  transition: idle ? 'none' : `stroke-dashoffset ${intro.fillDurationSec}s ease`,
                  transitionDelay: idle ? '0s' : `${intro.fillDelaySec}s`,
                }}
              />
            </mask>
          </defs>
          <g transform={GLYPH_TRANSFORM}>
            <path d={S_PATH} fill="var(--color-ink)" mask="url(#introFillMask)" />
            <path
              d={S_PATH}
              style={{
                fill: 'none',
                stroke: 'var(--color-ink)',
                strokeWidth: 3,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeDasharray: intro.dashLength,
                strokeDashoffset: idle ? intro.dashLength : 0,
                transition: idle ? 'none' : `stroke-dashoffset ${intro.drawDurationSec}s ease`,
              }}
            />
            <circle
              cx={111}
              cy={-5}
              r={6}
              style={{
                fill: 'var(--color-ink)',
                opacity: idle || stage === 'revealed' ? 0 : 1,
                transition: idle ? 'none' : `opacity ${intro.dotFadeSec}s ease`,
              }}
            />
          </g>
        </svg>
      </div>
    </>
  );
}
