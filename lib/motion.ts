'use client';

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { nav, reveal } from '@/config/motion';

/**
 * The export carried a `reducedMotion` boolean prop. It is replaced here by the
 * media query, so the preference is read from the OS rather than configured.
 *
 * `ready` is false until the first effect runs. Anything that must not flash
 * for a reduced-motion visitor (the intro overlay) waits for it.
 */
export type MotionPreference = { reducedMotion: boolean; ready: boolean };

export function usePrefersReducedMotion(): MotionPreference {
  const [state, setState] = useState<MotionPreference>({ reducedMotion: false, ready: false });

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setState({ reducedMotion: query.matches, ready: true });
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return state;
}

/** Matches the breakpoint the trace rail and constellation give way at. */
export function useIsNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${nav.mobileBreakpointPx}px)`);
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return narrow;
}

/**
 * Fires once when the element first scrolls into view, then stops observing.
 * Reduced motion resolves immediately so content is never gated on a scroll.
 */
export function useReveal<T extends HTMLElement>(
  reducedMotion: boolean,
): { ref: RefObject<T | null>; visible: boolean } {
  const ref = useRef<T | null>(null);
  const [observed, setObserved] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setObserved(true);
          observer.unobserve(entry.target);
        }
      }
    }, reveal.observer);

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return { ref, visible: reducedMotion || observed };
}

export type RevealPart = keyof typeof reveal.parts;
export type RevealStyles = Record<RevealPart, CSSProperties>;

/** The heading / body / rest split reveal, as inline transition styles. */
export function revealStyles(visible: boolean, reducedMotion: boolean): RevealStyles {
  const scale = reducedMotion ? reveal.reducedMultiplier : 1;

  const build = (part: (typeof reveal.parts)[RevealPart]): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translate(0, 0) rotate(0deg)' : part.from,
    transition:
      `opacity ${part.durationSec * scale}s ease ${part.delaySec * scale}s, ` +
      `transform ${part.durationSec * scale}s ${reveal.easing} ${part.delaySec * scale}s`,
  });

  return {
    heading: build(reveal.parts.heading),
    body: build(reveal.parts.body),
    rest: build(reveal.parts.rest),
  };
}

/** Sections sit below the fixed nav when scrolled to. */
export function scrollToSection(id: string, reducedMotion: boolean): void {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - nav.scrollOffsetPx,
    behavior: reducedMotion ? 'auto' : 'smooth',
  });
}

export function scrollToTop(reducedMotion: boolean): void {
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
}
