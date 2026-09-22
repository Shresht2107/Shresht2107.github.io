'use client';

import { useEffect, useState } from 'react';
import { links, navItems, resumeLabel, site, type SectionKey } from '@/content/site';
import { magnet, nav as navConfig } from '@/config/motion';
import { useMotion } from '@/components/MotionProvider';
import { useMagnet } from '@/components/Magnetic';
import { scrollToSection, scrollToTop } from '@/lib/scroll';

function NavLink({ label, sectionKey }: { label: string; sectionKey: SectionKey }) {
  const { reducedMotion } = useMotion();
  const { transform, onMouseMove, onMouseLeave } = useMagnet(magnet.navStrength);

  return (
    <button
      type="button"
      className="nav-link"
      style={{ transform }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={() => scrollToSection(sectionKey, reducedMotion)}
    >
      {label}
    </button>
  );
}

function ResumeLink() {
  const { introDone } = useMotion();
  const { transform, onMouseMove, onMouseLeave } = useMagnet(magnet.navStrength);

  return (
    <a
      className="resume-nav"
      href={links.resume}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        transform,
        opacity: introDone ? 1 : 0,
        pointerEvents: introDone ? 'auto' : 'none',
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {resumeLabel}
    </a>
  );
}

export function Nav() {
  const { reducedMotion, introDone } = useMotion();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setSolid(window.scrollY > navConfig.solidAfterPx);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <nav className="nav" data-solid={solid}>
      {/* The intro's flying S measures against this mark and parks on it. */}
      <button
        type="button"
        id="nav-mark"
        className="nav-mark"
        aria-label={`${site.name} — back to top`}
        onClick={() => scrollToTop(reducedMotion)}
      >
        {site.shortMark}
      </button>

      <div
        className="nav-links"
        style={{ opacity: introDone ? 1 : 0, pointerEvents: introDone ? 'auto' : 'none' }}
      >
        {navItems.map((item) => (
          <NavLink key={item.key} label={item.label} sectionKey={item.key} />
        ))}
      </div>

      <ResumeLink />
    </nav>
  );
}
