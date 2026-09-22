'use client';

import { now } from '@/content/site';
import { revealStyles, useReveal } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';

/** Each dot's pulse is offset so the three read as a staggered rhythm. */
const DOT_DELAYS = ['0s', '0.4s', '0.8s'];

function NowItem({ text, delay, spaced }: { text: string; delay: string; spaced: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        marginBottom: spaced ? 22 : 0,
      }}
    >
      <span className="now-dot" style={{ animationDelay: delay }} aria-hidden />
      <span style={{ fontSize: 17, fontWeight: 500 }}>{text}</span>
    </div>
  );
}

export function NowSection() {
  const { reducedMotion } = useMotion();
  const { ref, visible } = useReveal<HTMLElement>(reducedMotion);
  const reveal = revealStyles(visible, reducedMotion);
  const [first, ...remaining] = now.items;

  return (
    <section id="now" ref={ref} className="section bg-band">
      <div className="section-inner">
        <div style={reveal.heading}>
          <h2 className="section-heading" style={{ marginBottom: 48 }}>
            {now.heading}
          </h2>
        </div>

        {first && (
          <div style={reveal.body}>
            <NowItem text={first} delay={DOT_DELAYS[0]!} spaced />
          </div>
        )}

        <div style={reveal.rest}>
          {remaining.map((text, i) => (
            <NowItem
              key={text}
              text={text}
              delay={DOT_DELAYS[i + 1] ?? '0s'}
              spaced={i < remaining.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
