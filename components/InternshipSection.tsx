'use client';

import { internship } from '@/content/site';
import { revealStyles, useReveal } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';

export function InternshipSection() {
  const { reducedMotion } = useMotion();
  const { ref, visible } = useReveal<HTMLElement>(reducedMotion);
  const reveal = revealStyles(visible, reducedMotion);
  const [first, second] = internship.entries;

  return (
    <section id="internship" ref={ref} className="section bg-paper">
      <div className="section-inner">
        <div style={reveal.heading}>
          <h2 className="section-heading">{internship.heading}</h2>
          <div
            className="font-mono"
            style={{ fontSize: 16, color: 'var(--color-body)', marginTop: 16, marginBottom: 48 }}
          >
            {internship.role}
          </div>
        </div>

        {first && (
          <div style={reveal.body}>
            <div className="entry" style={{ marginBottom: 36 }}>
              <h3 className="entry-title">{first.title}</h3>
              <p className="entry-body">{first.description}</p>
            </div>
          </div>
        )}

        {second && (
          <div style={reveal.rest}>
            <div className="entry">
              <h3 className="entry-title">{second.title}</h3>
              <p className="entry-body">{second.description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
