'use client';

import type { CSSProperties } from 'react';
import { otherProjects, projects, projectsHeading, projectsUi, stackTools } from '@/content/site';
import { projectFilter } from '@/config/motion';
import { revealStyles, useReveal } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';
import { useStack } from '@/components/StackProvider';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';

const labelOf = (id: string) => stackTools.find((t) => t.id === id)?.label ?? id;

export function ProjectsSection() {
  const { reducedMotion } = useMotion();
  const { ref, visible } = useReveal<HTMLElement>(reducedMotion);
  const { filterTool, toolProjects, onProjectHover, clearFilter } = useStack();
  const reveal = revealStyles(visible, reducedMotion);

  const matching = filterTool ? (toolProjects[filterTool] ?? []) : null;

  /**
   * Rows excluded by an active stack filter dim rather than unmount, so the
   * dimming folds into the existing reveal transition instead of adding a
   * second style layer.
   */
  const dim = (base: CSSProperties, included: boolean): CSSProperties => {
    if (!matching || included) return base;
    return {
      ...base,
      opacity: (typeof base.opacity === 'number' ? base.opacity : 1) * projectFilter.dimOpacity,
      pointerEvents: 'none',
      transition: `${base.transition}, opacity 0.4s ease`,
    };
  };

  const [first, second] = projects;
  const filterRows = matching?.filter((id) => id === 'f1' || id === 'arogya') ?? [];

  return (
    <section id="projects" ref={ref} className="section bg-band">
      <div className="section-inner">
        <div style={reveal.heading}>
          <h2 className="section-heading" style={{ marginBottom: 64 }}>
            {projectsHeading}
          </h2>
        </div>

        {filterTool && (
          <div
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              marginBottom: 40,
              paddingBottom: 18,
              borderBottom: '1px solid var(--color-rule)',
            }}
          >
            <span className="mono-note">
              {filterRows.length
                ? `showing work using ${labelOf(filterTool)}`
                : `${labelOf(filterTool)} is not used in the two projects below`}
            </span>
            <button type="button" className="mono-action" onClick={clearFilter}>
              {projectsUi.clearFilterLabel}
            </button>
          </div>
        )}

        {/* Hovering a row lights that project's tools in the constellation. */}
        <div onMouseOver={onProjectHover}>
          {first && (
            <div style={dim(reveal.body, matching?.includes(first.id) ?? true)}>
              <div
                data-project={first.id}
                className="project-grid"
                style={{ marginBottom: 100 }}
              >
                <ArchitectureDiagram spec={first.diagram} />
                <div>
                  <h3 className="project-title">{first.title}</h3>
                  <p className="project-body">{first.description}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
                    {first.tags.map((tag) => (
                      <span key={tag} className="tag" data-accent={first.accent}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {second && (
            <div style={dim(reveal.rest, matching?.includes(second.id) ?? true)}>
              <div data-project={second.id} className="project-grid">
                <div style={{ order: 2 }}>
                  <h3 className="project-title">{second.title}</h3>
                  <p className="project-body">{second.description}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
                    {second.tags.map((tag) => (
                      <span key={tag} className="tag" data-accent={second.accent}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ order: 1 }}>
                  <ArchitectureDiagram spec={second.diagram} />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 90, maxWidth: 640 }}>
            <h4
              className="font-serif"
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: 'var(--color-body)',
                margin: '0 0 22px 0',
              }}
            >
              {otherProjects.heading}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {otherProjects.items.map((item, i) => (
                <div
                  key={item.id}
                  data-project={item.id}
                  style={{
                    padding: '16px 0',
                    borderTop: '1px solid var(--color-rule)',
                    borderBottom:
                      i === otherProjects.items.length - 1
                        ? '1px solid var(--color-rule)'
                        : undefined,
                  }}
                >
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{item.name}</span>
                  <span style={{ color: 'var(--color-muted)' }}>{item.description}</span>
                  <div
                    style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}
                  >
                    <span className="tag">{item.tag}</span>
                    {/* No link until repoUrl is filled in. */}
                    {item.repoUrl !== 'TODO' && (
                      <a
                        className="mono-action"
                        href={item.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        repo &#8599;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
