'use client';

import { scroll as scrollConfig, nav } from '@/config/motion';

/**
 * Custom scroll animation for nav jumps.
 *
 * Native `scroll-behavior: smooth` lands too fast and cannot be interrupted, so
 * it is removed from html and replaced with this. The duration scales with the
 * distance travelled, and any real input from the visitor — wheel, touch, key,
 * pointer, or a scroll position we did not set ourselves — cancels it on the
 * spot so the animation never fights them.
 */

let activeScroll: (() => void) | null = null;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** The fixed nav overlays the page, so targets sit below its measured height. */
export function navOffset(): number {
  const el = document.querySelector('nav');
  const height = el?.getBoundingClientRect().height;
  return height && height > 0 ? height : nav.scrollOffsetPx;
}

/** Cancels an in-flight animated scroll, if any. */
export function cancelAnimatedScroll(): void {
  activeScroll?.();
}

export function animatedScrollTo(targetY: number, reducedMotion: boolean): void {
  cancelAnimatedScroll();

  const maxY = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
  const to = Math.min(Math.max(targetY, 0), maxY);
  const from = window.scrollY;
  const distance = to - from;

  if (reducedMotion || Math.abs(distance) < 1) {
    window.scrollTo(0, to);
    return;
  }

  // Short hops stay brisk; a jump across the whole page is allowed more time,
  // but never more than the ceiling.
  const span = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const ratio = Math.min(Math.abs(distance) / span, 1);
  const duration =
    scrollConfig.minDurationMs +
    (scrollConfig.maxDurationMs - scrollConfig.minDurationMs) * ratio;

  const start = performance.now();
  let rafId = 0;
  // Tracks the position we last set, so a scroll event we did not cause is
  // recognisable as the visitor taking over.
  let lastSet = from;
  let cancelled = false;

  const stop = () => {
    if (cancelled) return;
    cancelled = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('touchmove', stop);
    window.removeEventListener('keydown', stop);
    window.removeEventListener('pointerdown', stop);
    window.removeEventListener('scroll', onScroll);
    if (activeScroll === stop) activeScroll = null;
  };

  const onScroll = () => {
    if (Math.abs(window.scrollY - lastSet) > scrollConfig.takeoverTolerancePx) stop();
  };

  const step = (now: number) => {
    if (cancelled) return;
    const t = Math.min((now - start) / duration, 1);
    const y = Math.round(from + distance * easeInOutCubic(t));
    lastSet = y;
    window.scrollTo(0, y);
    if (t < 1) rafId = requestAnimationFrame(step);
    else stop();
  };

  activeScroll = stop;
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('touchmove', stop, { passive: true });
  window.addEventListener('keydown', stop);
  window.addEventListener('pointerdown', stop);
  window.addEventListener('scroll', onScroll, { passive: true });
  rafId = requestAnimationFrame(step);
}

/** Scrolls a section clear of the fixed nav. */
export function scrollToSection(id: string, reducedMotion: boolean): void {
  const el = document.getElementById(id);
  if (!el) return;
  animatedScrollTo(el.getBoundingClientRect().top + window.scrollY - navOffset(), reducedMotion);
}

export function scrollToTop(reducedMotion: boolean): void {
  animatedScrollTo(0, reducedMotion);
}
