'use client';

import { contact, links, resumeLabel } from '@/content/site';
import { magnet } from '@/config/motion';
import { revealStyles, useReveal } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';
import { useMagnet } from '@/components/Magnetic';

function ContactLink({ href, label }: { href: string; label: string }) {
  const { transform, onMouseMove, onMouseLeave } = useMagnet(magnet.contactStrength);
  const external = href.startsWith('http');

  return (
    <a
      className="contact-link"
      href={href}
      style={{ transform }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  );
}

function ResumeLead() {
  const { transform, onMouseMove, onMouseLeave } = useMagnet(magnet.contactStrength);

  return (
    <a
      className="resume-lead"
      href={links.resume}
      target="_blank"
      rel="noopener noreferrer"
      style={{ transform }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {resumeLabel}
    </a>
  );
}

export function ContactSection() {
  const { reducedMotion } = useMotion();
  const { ref, visible } = useReveal<HTMLElement>(reducedMotion);
  const reveal = revealStyles(visible, reducedMotion);

  return (
    <section
      id="contact"
      ref={ref}
      className="section bg-paper"
      style={{ padding: '160px clamp(56px, 9vw, 100px) 60px' }}
    >
      <div className="section-inner">
        <div style={reveal.heading}>
          <h2
            className="section-heading"
            style={{ fontSize: 'clamp(30px, 5vw, 54px)', maxWidth: 700 }}
          >
            {contact.heading}
          </h2>
        </div>

        <div style={reveal.body}>
          <p style={{ fontSize: 17, color: 'var(--color-muted)', marginTop: 18 }}>
            {contact.blurb}
          </p>

          <ResumeLead />

          <div
            style={{
              display: 'flex',
              gap: 'clamp(24px, 5vw, 44px)',
              flexWrap: 'wrap',
              marginTop: 34,
            }}
          >
            <ContactLink href={links.github} label={contact.linkLabels.github} />
            <ContactLink href={links.linkedin} label={contact.linkLabels.linkedin} />
            <ContactLink href={`mailto:${links.email}`} label={contact.linkLabels.email} />
          </div>
        </div>

        <div style={reveal.rest}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              borderTop: '1px solid var(--color-rule)',
              marginTop: 120,
              paddingTop: 24,
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-footer)',
            }}
          >
            <span>{contact.footerLeft}</span>
            <span>{contact.footerRight}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
