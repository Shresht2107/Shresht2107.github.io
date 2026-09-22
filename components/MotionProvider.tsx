'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion';
import { props as motionProps } from '@/config/motion';

type MotionContextValue = {
  reducedMotion: boolean;
  /** False until the media query has been read on the client. */
  ready: boolean;
  /**
   * True once the flying S has reached the nav mark. The nav's S is hidden
   * until this flips, so the drawn S and the nav S are never both visible.
   * This happens ~1.5s before `introDone`, which waits out the pause.
   */
  introLanded: boolean;
  markIntroLanded: () => void;
  /** True once the intro hands over: nav links, ambient field and trace rail wake up. */
  introDone: boolean;
  markIntroDone: () => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const { reducedMotion, ready } = usePrefersReducedMotion();
  const [introFinished, setIntroFinished] = useState(false);
  const [introLanded, setIntroLanded] = useState(false);
  const markIntroDone = useCallback(() => setIntroFinished(true), []);
  const markIntroLanded = useCallback(() => setIntroLanded(true), []);

  const value = useMemo<MotionContextValue>(() => {
    // With reduced motion, or the intro switched off, the page starts in the
    // state the intro would have left it in.
    const skipped = ready && (reducedMotion || !motionProps.showIntro);
    return {
      reducedMotion,
      ready,
      introLanded: introLanded || skipped,
      markIntroLanded,
      introDone: introFinished || skipped,
      markIntroDone,
    };
  }, [reducedMotion, ready, introLanded, introFinished, markIntroLanded, markIntroDone]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotion must be used inside MotionProvider');
  return ctx;
}
