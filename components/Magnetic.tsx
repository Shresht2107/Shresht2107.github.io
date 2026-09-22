'use client';

import { useCallback, useState, type MouseEvent } from 'react';
import { useMotion } from '@/components/MotionProvider';

/**
 * Cursor-follow offset for nav and contact links. The element leans toward the
 * pointer by `strength` px at the edges and returns to rest on leave.
 *
 * Only the transform is returned; the easing lives on the element's class so a
 * caller that already animates other properties keeps them.
 */
export function useMagnet(strength: number): {
  transform: string;
  onMouseMove: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
} {
  const { reducedMotion } = useMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (reducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setOffset({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * strength,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * strength,
      });
    },
    [reducedMotion, strength],
  );

  const onMouseLeave = useCallback(() => setOffset({ x: 0, y: 0 }), []);

  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    onMouseMove,
    onMouseLeave,
  };
}
