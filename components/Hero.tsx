'use client';

import { useEffect, useState } from 'react';
import { hero, links, resumeLabel } from '@/content/site';
import { props as motionProps } from '@/config/motion';
import { useMotion } from '@/components/MotionProvider';

/**
 * The headline types itself out once the intro hands over. The subline, resume
 * link and scroll cue are all gated on the last character landing, so nothing
 * competes with the typing.
 */
export function Hero() {
  const { reducedMotion, introDone } = useMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!introDone || reducedMotion) return;

    let i = 0;
    const timer = window.setInterval(() => {
      i++;
      setCount(i);
      if (i >= hero.typedText.length) clearInterval(timer);
    }, motionProps.heroTypingSpeedMs);

    return () => clearInterval(timer);
  }, [introDone, reducedMotion]);

  // Reduced motion shows the finished headline instead of typing it.
  const typed =
    reducedMotion && introDone ? hero.typedText : hero.typedText.slice(0, count);
  const done = typed.length >= hero.typedText.length;
  const settled = { opacity: done ? 1 : 0, transform: done ? 'translateY(0)' : 'translateY(10px)' };

  return (
    <section className="hero">
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 className="hero-title">
          {typed}
          <span className="hero-caret" aria-hidden />
        </h1>

        <p className="hero-subline" style={settled}>
          {hero.subline}
        </p>

        <a
          className="resume-hero"
          href={links.resume}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            opacity: done ? 1 : 0,
            pointerEvents: done ? 'auto' : 'none',
            transform: done ? 'translateY(0)' : 'translateY(8px)',
            transition: reducedMotion
              ? 'none'
              : 'opacity 0.7s ease 0.7s, transform 0.7s ease 0.7s, border-color 0.25s ease, color 0.25s ease',
          }}
        >
          {resumeLabel}
        </a>
      </div>

      <div className="hero-cue" style={settled} aria-hidden>
        <span>{hero.scrollCue}</span>
        <div className="hero-cue-line" />
      </div>
    </section>
  );
}
