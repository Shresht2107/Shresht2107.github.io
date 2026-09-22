/**
 * Motion parameters ported from the Claude Design export.
 *
 * Values under `props` are the `data-props` defaults from Homepage.dc.html's
 * <script type="text/x-dc"> block. Everything else was hardcoded in the
 * component logic and is lifted here so timings live in one place.
 *
 * The export's `reducedMotion` prop is intentionally absent: it is replaced by
 * the `prefers-reduced-motion` media query (see usePrefersReducedMotion).
 */

/** data-props defaults. */
export const props = {
  /** Hero typing interval, ms per character. */
  heroTypingSpeedMs: 45,
  /** Render the scroll-progress wave rail down the left edge. */
  showTraceLine: true,
  /** Play the opening S-draw sequence. */
  showIntro: true,
  /** Node-field cursor query reach, px. */
  queryRadius: 240,
  /** Node-field cursor response intensity. */
  queryStrength: 1,
  /** Draw coral query threads from the pointer to nearest nodes. */
  showQueryLinks: true,
} as const;

/**
 * Opening sequence. The S draws and fills along its curve, flies to the nav
 * mark, then the page pauses before typing begins.
 *
 *   0ms     stage 'revealed' — outline draws, mask fill sweeps behind it
 *   1900ms  stage 'filled'   — dot appears
 *   2100ms  stage 'fly'      — flies to the nav mark, overlay fades out
 *   ~3900ms fly lands (2100 + 1800)
 *   5400ms  stage 'done'     — ambient field on, typing starts
 *
 * The 1.5s gap between the landing and `doneAtMs` is the deliberate pause.
 * Nothing else animates during the whole window.
 */
export const intro = {
  filledAtMs: 1900,
  flyAtMs: 2100,
  doneAtMs: 5400,
  /** Outline stroke-dashoffset sweep. */
  drawDurationSec: 1.6,
  /** Mask stroke that reveals the solid fill along the same curve. */
  fillDurationSec: 1.7,
  fillDelaySec: 0.2,
  /** Dash length covering the full glyph path. */
  dashLength: 1000,
  flyDurationSec: 1.8,
  flyEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  overlayFadeSec: 1.3,
  dotFadeSec: 0.25,
} as const;

/** Ambient node field (full-viewport canvas). */
export const field = {
  /** Jittered-grid cell size; the smaller viewport gets a sparser field. */
  cellPx: 112,
  cellPxNarrow: 130,
  narrowViewportPx: 700,
  /** Chance a grid slot is left empty. */
  dropoutChance: 0.26,
  /** Jitter as a fraction of cell size. */
  jitter: 0.72,
  /** Chance a node is drawn at the larger radius. */
  largeNodeChance: 0.16,
  largeNodeRadius: 2.4,
  nodeRadius: 1.4,
  driftSpeedMin: 0.18,
  driftSpeedRange: 0.22,
  driftAmpMin: 2,
  driftAmpRange: 3,
  /** Connect each node to its nearest neighbours within cell * this. */
  linkRangeFactor: 1.65,
  edgesPerNode: 2,
  adjacencyPerNode: 4,
  /** Pointer lag — the field settles behind the cursor. */
  cursorEase: 0.14,
  /** Cursor influence decays after this long without movement. */
  idleAfterMs: 2200,
  idleRampMs: 2500,
  idleFalloff: 0.55,
  /** Coral threads drawn from the pointer to its n nearest nodes. */
  queryLinkCount: 4,
  /** Autonomous retrieval pulses. */
  firstPulseDelayMs: 900,
  pulseGapMinMs: 2200,
  pulseGapRangeMs: 2600,
  maxConcurrentPulses: 2,
  pulseHopMinMs: 620,
  pulseHopRangeMs: 280,
  pulseFadeMs: 1400,
  pulseHopsMin: 2,
  pulseHopsRange: 2,
  /** Chance a pulse seeds near the cursor instead of at random. */
  pulseSeedsNearCursorChance: 0.45,
  maxDevicePixelRatio: 2,
  /** Canvas opacity once the intro hands over. */
  activeOpacity: 1,
  activeOpacityReduced: 0.55,
} as const;

/** Architecture diagrams build once, on their own clock, when scrolled into view. */
export const diagram = {
  durationMs: 2300,
  /** Start when the element's top is within this fraction of the viewport. */
  startAtViewportFraction: 0.8,
} as const;

/** Per-section split reveal. */
export const reveal = {
  /** Durations/delays are multiplied by this when reduced motion is on. */
  reducedMultiplier: 0.05,
  easing: 'cubic-bezier(.16,.84,.44,1)',
  observer: { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  parts: {
    heading: { from: 'translateX(-60px) rotate(-2deg)', durationSec: 0.9, delaySec: 0.1 },
    body: { from: 'translateX(60px)', durationSec: 0.9, delaySec: 0.22 },
    rest: { from: 'translateY(24px)', durationSec: 0.8, delaySec: 0.36 },
  },
} as const;

/** Scroll-progress wave rail. */
export const trace = {
  /** x = centre + sin(y * frequency) * amplitude */
  centerX: 20,
  amplitude: 14,
  frequency: 0.012,
  /** Path is sampled every n px of height. */
  stepPx: 20,
  /** Progress is measured at this fraction down the viewport. */
  viewportAnchor: 0.5,
} as const;

/**
 * Animated nav scrolling. Native smooth scrolling is not used: it lands too
 * fast and cannot be interrupted.
 */
export const scroll = {
  /** Duration for a short hop. */
  minDurationMs: 700,
  /** Duration for a jump across the whole page. Never exceeded. */
  maxDurationMs: 1200,
  /** How far the page may drift from where we put it before we assume the
   *  visitor has taken over and cancel. */
  takeoverTolerancePx: 3,
} as const;

/** Nav + scrolling. */
export const nav = {
  /** Scroll depth at which the nav gains its blurred backdrop. */
  solidAfterPx: 80,
  /** Fallback offset if the nav cannot be measured; normally its real height is used. */
  scrollOffsetPx: 90,
  /** Below this width the trace rail and constellation give way to the list. */
  mobileBreakpointPx: 880,
} as const;

/** Cursor-follow strength for magnetic links. */
export const magnet = {
  navStrength: 8,
  contactStrength: 14,
  transition: 'transform 0.25s ease-out',
} as const;

/** Tech-stack constellation opacity ramps. */
export const stack = {
  /** Resting opacity by tier. */
  tierOpacity: { prod: 1, proj: 0.82, found: 0.55, artifact: 0.9 },
  /** Opacity for nodes outside the lit set. */
  dimmedOpacity: 0.12,
  dimmedLabelOpacity: 0.45,
  edgeOpacity: { resting: 0.13, lit: 0.5, dimmed: 0.04 },
  focusRingOpacity: 0.55,
  focusRingRadius: 19,
  /** Hit target around each node. */
  hitRadius: 21,
} as const;

/** Project rows dim to this when a stack filter excludes them. */
export const projectFilter = { dimOpacity: 0.16 } as const;
