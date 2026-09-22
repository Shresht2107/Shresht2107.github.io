'use client';

import { about } from '@/content/site';
import { revealStyles, useReveal } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';

export function AboutSection() {
  const { reducedMotion } = useMotion();
  const { ref, visible } = useReveal<HTMLElement>(reducedMotion);
  const reveal = revealStyles(visible, reducedMotion);

  return (
    <section id="about" ref={ref} className="section bg-band" style={{ overflow: 'hidden' }}>
      <div className="watermark" aria-hidden>
        {about.watermark}
      </div>
      <div className="section-inner">
        <div style={reveal.heading}>
          <h2 className="section-heading">{about.heading}</h2>
        </div>
        <div style={reveal.body}>
          <p className="prose" style={{ marginTop: 28 }}>
            {about.body}
          </p>
        </div>
        <div style={reveal.rest}>
          <p className="prose" style={{ marginTop: 20 }}>
            {about.rest}
          </p>
        </div>
      </div>
    </section>
  );
}
