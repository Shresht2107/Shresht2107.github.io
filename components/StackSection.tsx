'use client';

import { stackGroups, stackProjects, stackSection, stackTools } from '@/content/site';
import { revealStyles, useReveal } from '@/lib/motion';
import { useMotion } from '@/components/MotionProvider';
import { useStack } from '@/components/StackProvider';
import { StackConstellation } from '@/components/StackConstellation';

const byId = new Map(stackTools.map((tool) => [tool.id, tool]));

export function StackSection() {
  const { reducedMotion } = useMotion();
  const { ref, visible } = useReveal<HTMLElement>(reducedMotion);
  const {
    hoverTool,
    activeProject,
    filterTool,
    visuals,
    onToolHover,
    onToolLeave,
    onToolClick,
    clearHighlight,
  } = useStack();
  const reveal = revealStyles(visible, reducedMotion);

  const focused = hoverTool ?? filterTool;
  const focusedTool = focused ? byId.get(focused) : undefined;
  const highlighted = activeProject ? stackProjects[activeProject] : undefined;

  const detail = focusedTool
    ? {
        line: `${focusedTool.label} — ${focusedTool.detail}`,
        hint: filterTool === focused ? stackSection.filteredHint : stackSection.clickHint,
      }
    : highlighted
      ? {
          line: `${highlighted.label} — ${highlighted.tools.length} tools lit.`,
          hint: stackSection.projectHint,
        }
      : { line: stackSection.restingDetail, hint: stackSection.restingHint };

  const noteText = highlighted
    ? `highlighting ${highlighted.label}`
    : filterTool
      ? `filtering projects by ${byId.get(filterTool)?.label ?? filterTool}`
      : '';

  return (
    <section id="stack" ref={ref} className="section bg-paper" style={{ isolation: 'isolate' }}>
      {/* Opaque backdrop so the ambient field does not read through the constellation. */}
      <div
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'var(--color-paper)', zIndex: 1 }}
      />
      <div className="section-inner">
        <div style={reveal.heading}>
          <h2 className="section-heading" style={{ marginBottom: 56 }}>
            {stackSection.heading}
          </h2>
        </div>

        <div style={reveal.body}>
          <div
            style={{
              display: noteText ? 'flex' : 'none',
              gap: 14,
              alignItems: 'center',
              marginBottom: 22,
            }}
          >
            <span className="mono-note">{noteText}</span>
            <button type="button" className="mono-action" onClick={clearHighlight}>
              {stackSection.clearLabel}
            </button>
          </div>

          <StackConstellation />

          {/* Narrow-viewport fallback: same data, same interactions, as a list. */}
          <div className="stack-list">
            <div
              onMouseOver={onToolHover}
              onMouseLeave={onToolLeave}
              onClick={onToolClick}
              style={{ display: 'flex', flexDirection: 'column', gap: 26 }}
            >
              {stackGroups.map((group) => (
                <div key={group.label}>
                  <div
                    className="font-mono"
                    style={{ fontSize: 12, color: 'var(--color-faint)', marginBottom: 12 }}
                  >
                    {group.label}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {group.toolIds.map((id) => {
                      const tool = byId.get(id);
                      if (!tool) return null;
                      return (
                        <span
                          key={id}
                          data-tool={id}
                          className="stack-chip"
                          data-weight={tool.tier}
                          data-accent={tool.tier === 'artifact' ? 'coral' : undefined}
                          style={{ opacity: visuals.nodeOpacity[id] }}
                        >
                          {tool.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 26,
              borderTop: '1px solid var(--color-rule-soft)',
              paddingTop: 18,
              minHeight: 52,
            }}
          >
            <div
              className="font-mono"
              style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-body)' }}
            >
              {detail.line}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 12.5, color: 'var(--color-hint)', marginTop: 6 }}
            >
              {detail.hint}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
