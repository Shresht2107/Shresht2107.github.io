'use client';

import { internship, type InternshipEntry } from '@/content/site';
import { revealStyles, useReveal } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';

/** Same left-border block and tag pills as the project cards, so they read as one system. */
function Entry({ entry, spaced }: { entry: InternshipEntry; spaced: boolean }) {
  return (
    <div className="entry" style={{ marginBottom: spaced ? 36 : 0 }}>
      <h3 className="entry-title">{entry.title}</h3>
      <p className="entry-body">{entry.description}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
        {entry.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function InternshipSection() {
  const { reducedMotion } = useMotion();
  const { ref, visible } = useReveal<HTMLElement>(reducedMotion);
  const reveal = revealStyles(visible, reducedMotion);
  const [first, ...remaining] = internship.entries;

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

        {/* First entry leads; the rest follow on the later reveal, same as before. */}
        {first && (
          <div style={reveal.body}>
            <Entry entry={first} spaced />
          </div>
        )}

        <div style={reveal.rest}>
          {remaining.map((entry, i) => (
            <Entry key={entry.title} entry={entry} spaced={i < remaining.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
