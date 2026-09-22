'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion';
import { props as motionProps } from '@/config/motion';

type MotionContextValue = {
  reducedMotion: boolean;
  /** False until the media query has been read on the client. */
  ready: boolean;
  /** True once the intro hands over: nav links, ambient field and trace rail wake up. */
  introDone: boolean;
  markIntroDone: () => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const { reducedMotion, ready } = usePrefersReducedMotion();
  const [introFinished, setIntroFinished] = useState(false);
  const markIntroDone = useCallback(() => setIntroFinished(true), []);

  const value = useMemo<MotionContextValue>(() => {
    // With reduced motion, or the intro switched off, the page starts in the
    // state the intro would have left it in.
    const skipped = ready && (reducedMotion || !motionProps.showIntro);
    return { reducedMotion, ready, introDone: introFinished || skipped, markIntroDone };
  }, [reducedMotion, ready, introFinished, markIntroDone]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotion must be used inside MotionProvider');
  return ctx;
}
