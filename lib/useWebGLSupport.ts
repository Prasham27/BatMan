'use client';

import { useEffect, useState } from 'react';

/**
 * Returns null while probing, true if WebGL renderable, false if we should
 * fall back (small touch device, no WebGL, or context creation failed).
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTouch =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmall = window.matchMedia('(max-width: 767px)').matches;
    if (isTouch && isSmall) {
      setSupported(false);
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
