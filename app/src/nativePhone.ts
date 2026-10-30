import { useEffect, useState } from 'react';
import './native-phone.css';

// Keep catalogue thumbnails and desktop previews in their calibrated device frame.
export function isNativePhoneBrowser() {
  if (typeof window === 'undefined' || window.parent !== window) return false;
  return /iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches &&
      Math.min(screen.width, screen.height) <= 600);
}

export function useNativePhoneViewport() {
  const [native] = useState(isNativePhoneBrowser);
  const measure = () => {
    const viewport = window.visualViewport;
    return { width: viewport?.width ?? innerWidth, height: viewport?.height ?? innerHeight,
      left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0, safeTop: 0, safeBottom: 0 };
  };
  const [size, setSize] = useState(measure);
  useEffect(() => {
    if (!native) return;
    document.documentElement.classList.add('native-phone');
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
    document.body.append(probe);
    const update = () => {
      const next = measure(), css = getComputedStyle(probe);
      setSize({ ...next, safeTop: parseFloat(css.paddingTop) || 0,
        safeBottom: next.height < innerHeight - 120 ? 0 : parseFloat(css.paddingBottom) || 0 });
    };
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      document.documentElement.classList.remove('native-phone');
      probe.remove();
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, [native]);
  return { native, ...size };
}
