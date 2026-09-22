'use client';

import { about } from '@/content/site';
import { revealStyles, useReveal } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';

export function AboutSection() {
  const { reducedMotion } = useMotion();
  const { ref, visible } = useReveal<HTMLElement>(reducedMotion);
  const reveal = revealStyles(visible, reducedMotion);
  const [first, ...remaining] = about.paragraphs;

  return (
    <section id="about" ref={ref} className="section bg-band" style={{ overflow: 'hidden' }}>
      <div className="watermark" aria-hidden>
        {about.watermark}
      </div>
      <div className="section-inner">
        <div style={reveal.heading}>
          <h2 className="section-heading">{about.heading}</h2>
        </div>
        {/* First paragraph leads; the remainder follows on the later reveal. */}
        <div style={reveal.body}>
          <p className="prose" style={{ marginTop: 28 }}>
            {first}
          </p>
        </div>
        <div style={reveal.rest}>
          {remaining.map((paragraph) => (
            <p key={paragraph} className="prose" style={{ marginTop: 20 }}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
