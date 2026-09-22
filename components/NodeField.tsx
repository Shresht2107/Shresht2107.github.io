'use client';

import { useEffect, useRef } from 'react';
import { useMotion } from '@/components/MotionProvider';
import { field, props as motionProps } from '@/config/motion';

/**
 * The ambient background: a sparse lattice of "chunks" that the cursor queries.
 *
 * Nodes sit on a jittered grid and drift. The pointer acts as a live query that
 * lags slightly behind the real cursor, brightening the edges it reaches and
 * throwing coral threads to its nearest nodes. Independently, retrieval pulses
 * travel a few hops along the lattice on their own rhythm.
 *
 * The loop is cancelled outright while the tab is hidden, and never starts at
 * all until the intro hands over.
 */

type FieldNode = {
  x: number;
  y: number;
  r: number;
  /** Phase and speed of the idle drift. */
  ph: number;
  sp: number;
  amp: number;
  /** Current drift offset, recomputed each frame. */
  dx: number;
  dy: number;
  /** Lit by a passing pulse; queried by the cursor. */
  lit: number;
  q: number;
  adj: number[];
};

type Pulse = { path: number[]; start: number; hopMs: number; fadeMs: number };

type Rgb = [number, number, number];

function readChannels(styles: CSSStyleDeclaration, token: string): Rgb {
  const parts = styles.getPropertyValue(token).trim().split(/\s+/).map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function rgba([r, g, b]: Rgb, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function NodeField() {
  const { reducedMotion, introDone } = useMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mirrored into refs so the animation loop can read the latest values
  // without the effect that owns it having to tear down and rebuild the field.
  const activeRef = useRef(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    activeRef.current = introDone;
  }, [introDone]);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext('2d');
    if (!context) return;

    // Explicitly typed so the hoisted helpers below see non-null types;
    // TypeScript does not carry narrowing into function declarations.
    const view: HTMLCanvasElement = canvasEl;
    const g: CanvasRenderingContext2D = context;

    const styles = getComputedStyle(document.documentElement);
    const inkRgb = readChannels(styles, '--field-ink-rgb');
    const accentRgb = readChannels(styles, '--field-accent-rgb');
    const coralRgb = readChannels(styles, '--field-coral-rgb');

    let nodes: FieldNode[] = [];
    let edges: [number, number][] = [];
    let pulses: Pulse[] = [];
    let fieldW = 0;
    let fieldH = 0;
    let nextPulseAt = 0;
    let lastMoveAt = 0;
    const cursor = { x: 0, y: 0, seen: false };
    const qpos = { x: 0, y: 0 };
    let rafId: number | null = null;

    /** Jittered grid -> sparse, evenly distributed embedding field. */
    function buildField(): void {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, field.maxDevicePixelRatio);
      view.width = Math.round(w * dpr);
      view.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      fieldW = w;
      fieldH = h;

      const cell = w < field.narrowViewportPx ? field.cellPxNarrow : field.cellPx;
      const cols = Math.ceil(w / cell) + 1;
      const rows = Math.ceil(h / cell) + 1;
      const next: FieldNode[] = [];

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (Math.random() < field.dropoutChance) continue;
          next.push({
            x: i * cell + (Math.random() - 0.5) * cell * field.jitter,
            y: j * cell + (Math.random() - 0.5) * cell * field.jitter,
            r: Math.random() < field.largeNodeChance ? field.largeNodeRadius : field.nodeRadius,
            ph: Math.random() * Math.PI * 2,
            sp: field.driftSpeedMin + Math.random() * field.driftSpeedRange,
            amp: field.driftAmpMin + Math.random() * field.driftAmpRange,
            dx: 0,
            dy: 0,
            lit: 0,
            q: 0,
            adj: [],
          });
        }
      }

      // Connect each node to its nearest neighbours within range.
      const maxD = cell * field.linkRangeFactor;
      const nextEdges: [number, number][] = [];
      const seen = new Set<string>();

      next.forEach((n, i) => {
        const near: [number, number][] = [];
        next.forEach((m, k) => {
          if (k === i) return;
          const d = Math.hypot(m.x - n.x, m.y - n.y);
          if (d < maxD) near.push([d, k]);
        });
        near.sort((a, b) => a[0] - b[0]);
        near.slice(0, field.edgesPerNode).forEach(([, k]) => {
          const key = i < k ? `${i}:${k}` : `${k}:${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          nextEdges.push([i, k]);
        });
        n.adj = near.slice(0, field.adjacencyPerNode).map(([, k]) => k);
      });

      nodes = next;
      edges = nextEdges;
      pulses = [];
    }

    function spawnPulse(now: number, seed: number | null): void {
      if (!nodes.length) return;
      let start = seed ?? Math.floor(Math.random() * nodes.length);
      let tries = 0;
      while (!nodes[start]?.adj.length && tries++ < 20) {
        start = Math.floor(Math.random() * nodes.length);
      }
      if (!nodes[start]?.adj.length) return;

      const path = [start];
      const hops = field.pulseHopsMin + Math.floor(Math.random() * field.pulseHopsRange);
      for (let i = 0; i < hops; i++) {
        const cur = nodes[path[path.length - 1] ?? 0];
        const opts = (cur?.adj ?? []).filter((k) => !path.includes(k));
        if (!opts.length) break;
        const pick = opts[Math.floor(Math.random() * opts.length)];
        if (pick === undefined) break;
        path.push(pick);
      }
      if (path.length < 2) return;

      pulses.push({
        path,
        start: now,
        hopMs: field.pulseHopMinMs + Math.random() * field.pulseHopRangeMs,
        fadeMs: field.pulseFadeMs,
      });
    }

    function frame(ts: number): void {
      rafId = requestAnimationFrame(frame);
      if (!nodes.length) return;

      const reduced = reducedRef.current;
      const on = activeRef.current;
      const targetOpacity = on ? (reduced ? field.activeOpacityReduced : field.activeOpacity) : 0;
      if (view.style.opacity !== String(targetOpacity)) {
        view.style.opacity = String(targetOpacity);
      }

      const t = ts / 1000;
      g.clearRect(0, 0, fieldW, fieldH);

      // The cursor is a live query; it lags so the field settles behind it.
      const R = motionProps.queryRadius;
      const K = motionProps.queryStrength;
      const cursorOn = !reduced && cursor.seen;
      qpos.x += (cursor.x - qpos.x) * field.cursorEase;
      qpos.y += (cursor.y - qpos.y) * field.cursorEase;
      const qx = qpos.x;
      const qy = qpos.y;
      const idle = Math.min(
        1,
        Math.max(0, (ts - lastMoveAt - field.idleAfterMs) / field.idleRampMs),
      );
      const qGain = cursorOn ? (1 - idle * field.idleFalloff) * K : 0;

      const near: [number, number][] = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]!;
        const bx = reduced ? 0 : Math.cos(t * n.sp + n.ph) * n.amp;
        const by = reduced ? 0 : Math.sin(t * n.sp * 0.83 + n.ph * 1.7) * n.amp;
        n.lit = 0;
        n.q = 0;
        if (qGain > 0) {
          const d = Math.hypot(n.x + bx - qx, n.y + by - qy);
          if (d < R) {
            const u = 1 - d / R;
            n.q = u * u * qGain;
            // Chunks lean a little toward the query.
            const pull = Math.min(5, n.q * 6);
            const ang = Math.atan2(qy - (n.y + by), qx - (n.x + bx));
            n.dx = bx + Math.cos(ang) * pull;
            n.dy = by + Math.sin(ang) * pull;
            near.push([d, i]);
            continue;
          }
        }
        n.dx = bx;
        n.dy = by;
      }

      // Base lattice, with edges brightened where the query reaches.
      g.lineWidth = 1;
      g.strokeStyle = rgba(inkRgb, 0.055);
      g.beginPath();
      const hotEdges: [FieldNode, FieldNode, number][] = [];
      for (const [ia, ib] of edges) {
        const a = nodes[ia]!;
        const b = nodes[ib]!;
        const q = Math.max(a.q, b.q);
        if (q > 0.06) {
          hotEdges.push([a, b, q]);
          continue;
        }
        g.moveTo(a.x + a.dx, a.y + a.dy);
        g.lineTo(b.x + b.dx, b.y + b.dy);
      }
      g.stroke();

      for (const [a, b, q] of hotEdges) {
        g.strokeStyle = rgba(accentRgb, Number((0.05 + 0.2 * Math.min(1, q)).toFixed(3)));
        g.lineWidth = 1 + q * 0.5;
        g.beginPath();
        g.moveTo(a.x + a.dx, a.y + a.dy);
        g.lineTo(b.x + b.dx, b.y + b.dy);
        g.stroke();
        // A travelling tick along the hottest edges: the lattice "answering".
        if (q > 0.35) {
          const ph = (t * 0.55 + (a.ph + b.ph) * 0.12) % 1;
          const tx = a.x + a.dx + (b.x + b.dx - a.x - a.dx) * ph;
          const ty = a.y + a.dy + (b.y + b.dy - a.y - a.dy) * ph;
          g.fillStyle = rgba(accentRgb, Number((0.26 * q).toFixed(3)));
          g.beginPath();
          g.arc(tx, ty, 1.5, 0, Math.PI * 2);
          g.fill();
        }
      }

      // Query links: coral threads from the pointer to its nearest chunks.
      if (motionProps.showQueryLinks && near.length) {
        near.sort((a, b) => a[0] - b[0]);
        const picks = near.slice(0, field.queryLinkCount);
        for (let k = 0; k < picks.length; k++) {
          const n = nodes[picks[k]![1]]!;
          const strength = n.q * (1 - k * 0.18);
          if (strength <= 0.02) continue;
          g.strokeStyle = rgba(coralRgb, Number((0.26 * strength).toFixed(3)));
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(qx, qy);
          g.lineTo(n.x + n.dx, n.y + n.dy);
          g.stroke();
        }
        const lead = nodes[picks[0]![1]]!;
        lead.q = Math.min(1, lead.q * 1.5);
        const breathe = 0.5 + 0.5 * Math.sin(t * 2.1);
        g.strokeStyle = rgba(
          coralRgb,
          Number((0.2 * qGain * (0.5 + breathe * 0.5)).toFixed(3)),
        );
        g.lineWidth = 1;
        g.beginPath();
        g.arc(qx, qy, 6 + breathe * 5, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = rgba(coralRgb, Number((0.4 * qGain).toFixed(3)));
        g.beginPath();
        g.arc(qx, qy, 2.2, 0, Math.PI * 2);
        g.fill();
      }

      // Autonomous retrieval pulses, occasionally seeded near the cursor.
      if (!reduced) {
        if (!nextPulseAt) nextPulseAt = ts + field.firstPulseDelayMs;
        if (ts > nextPulseAt && pulses.length < field.maxConcurrentPulses) {
          const seed =
            near.length && Math.random() < field.pulseSeedsNearCursorChance
              ? (near[0]![1] as number)
              : null;
          spawnPulse(ts, seed);
          nextPulseAt = ts + field.pulseGapMinMs + Math.random() * field.pulseGapRangeMs;
        }
        pulses = pulses.filter((p) => ts - p.start < p.hopMs * (p.path.length - 1) + p.fadeMs);
        g.lineCap = 'round';

        for (const p of pulses) {
          const el = ts - p.start;
          const total = p.hopMs * (p.path.length - 1);
          const head = Math.min(el / p.hopMs, p.path.length - 1);
          const tail = el > total ? (el - total) / p.fadeMs : 0;
          const fade = el > total ? 1 - tail : 1;

          for (let seg = 0; seg < p.path.length - 1; seg++) {
            const a = nodes[p.path[seg]!]!;
            const b = nodes[p.path[seg + 1]!]!;
            const prog = Math.max(0, Math.min(1, head - seg));
            if (prog <= 0) continue;
            const ax = a.x + a.dx;
            const ay = a.y + a.dy;
            const bx = b.x + b.dx;
            const by = b.y + b.dy;
            g.strokeStyle = rgba(accentRgb, Number((0.3 * fade).toFixed(3)));
            g.lineWidth = 1.3;
            g.beginPath();
            g.moveTo(ax, ay);
            g.lineTo(ax + (bx - ax) * prog, ay + (by - ay) * prog);
            g.stroke();
            a.lit = Math.max(a.lit, Math.min(1, prog * 4) * fade);
            if (prog >= 1) b.lit = Math.max(b.lit, fade);
            if (prog < 1) {
              g.fillStyle = rgba(accentRgb, Number((0.38 * fade).toFixed(3)));
              g.beginPath();
              g.arc(ax + (bx - ax) * prog, ay + (by - ay) * prog, 2, 0, Math.PI * 2);
              g.fill();
            }
          }
        }
      }

      for (const n of nodes) {
        const x = n.x + n.dx;
        const y = n.y + n.dy;
        const q = Math.min(1, n.q);
        g.beginPath();
        g.arc(x, y, n.r + q * 0.7, 0, Math.PI * 2);
        g.fillStyle = rgba(inkRgb, Number((0.11 + n.lit * 0.1 + q * 0.07).toFixed(3)));
        g.fill();

        const glow = Math.max(n.lit, q * 0.85);
        if (glow > 0.01) {
          g.beginPath();
          g.arc(x, y, n.r + 1.4, 0, Math.PI * 2);
          g.fillStyle = rgba(accentRgb, Number((0.34 * glow).toFixed(3)));
          g.fill();
        }
        if (n.lit > 0.01) {
          g.beginPath();
          g.arc(x, y, n.r + 3 + (1 - n.lit) * 7, 0, Math.PI * 2);
          g.strokeStyle = rgba(accentRgb, Number((0.16 * n.lit).toFixed(3)));
          g.lineWidth = 1;
          g.stroke();
        }
      }
    }

    function start(): void {
      if (rafId === null) rafId = requestAnimationFrame(frame);
    }
    function stop(): void {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function onPointerMove(e: MouseEvent): void {
      if (!cursor.seen) {
        qpos.x = e.clientX;
        qpos.y = e.clientY;
      }
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.seen = true;
      lastMoveAt = performance.now();
    }

    function onVisibility(): void {
      if (document.hidden) stop();
      else start();
    }

    cursor.x = window.innerWidth / 2;
    cursor.y = window.innerHeight * 0.4;
    qpos.x = cursor.x;
    qpos.y = cursor.y;

    buildField();
    start();

    window.addEventListener('resize', buildField);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', buildField);
      window.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0,
        transition: 'opacity 2s ease',
      }}
    />
  );
}
