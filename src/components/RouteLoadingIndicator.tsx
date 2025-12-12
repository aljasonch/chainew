'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_VISIBLE_MS = 250;
const MAX_VISIBLE_MS = 15000;
const FINISH_ANIMATION_MS = 200;
const PROGRESS_CAP = 0.9;
const PROGRESS_TICK_MS = 120;

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

function findNearestAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!target || !(target instanceof HTMLElement)) return null;
  return target.closest('a');
}

function isInternalNavigatingAnchor(anchor: HTMLAnchorElement): boolean {
  if (anchor.hasAttribute('download')) return false;
  if (anchor.getAttribute('data-no-loading') != null) return false;

  const target = anchor.getAttribute('target');
  if (target && target !== '_self') return false;

  const rawHref = anchor.getAttribute('href');
  if (!rawHref) return false;
  if (rawHref.startsWith('#')) return false;
  if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return false;

  let url: URL;
  try {
    url = new URL(rawHref, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;

  // If only the hash changes, don't treat it as a route change.
  const current = new URL(window.location.href);
  const isSamePathAndQuery =
    url.pathname === current.pathname && url.search === current.search;
  if (isSamePathAndQuery) return false;

  return true;
}

export function RouteLoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString();

  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const maxTimeoutRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimeoutRef.current != null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (maxTimeoutRef.current != null) {
      window.clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    if (progressIntervalRef.current != null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (finishTimeoutRef.current != null) {
      window.clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    if (progressIntervalRef.current != null) return;

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= PROGRESS_CAP) return current;
        // Ease-out growth: quick at first, slower near the cap.
        const remaining = PROGRESS_CAP - current;
        const increment = Math.max(0.01, remaining * 0.12);
        return Math.min(PROGRESS_CAP, current + increment);
      });
    }, PROGRESS_TICK_MS);
  }, []);

  const finishAndHide = useCallback(() => {
    if (finishTimeoutRef.current != null) {
      window.clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }

    if (progressIntervalRef.current != null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setProgress(1);
    finishTimeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = null;
      setActive(false);
      setProgress(0);
    }, FINISH_ANIMATION_MS);
  }, []);

  const show = useCallback(() => {
    clearTimers();

    setActive((currentActive) => {
      if (!currentActive) {
        startTimeRef.current = Date.now();
        setProgress(0.12);
      }
      return true;
    });

    startProgress();

    maxTimeoutRef.current = window.setTimeout(() => {
      finishAndHide();
    }, MAX_VISIBLE_MS);
  }, [clearTimers, finishAndHide, startProgress]);

  const hide = useCallback(() => {
    const start = startTimeRef.current;
    if (start == null) {
      finishAndHide();
      return;
    }

    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (remaining === 0) {
      finishAndHide();
      return;
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      finishAndHide();
    }, remaining);
  }, [finishAndHide]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (isModifiedClick(event)) return;

      const anchor = findNearestAnchor(event.target);
      if (!anchor) return;
      if (!isInternalNavigatingAnchor(anchor)) return;

      show();
    };

    const onPopState = () => {
      // Back/forward navigation: show something immediately.
      show();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      clearTimers();
    };
  }, [show, clearTimers]);

  useEffect(() => {
    // Route finished (or changed): hide indicator.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    hide();
  }, [pathname, searchParamsString, hide]);

  if (!active) return null;

  return (
    <div
      className="route-loading-indicator"
      role="status"
      aria-label="Memuat halaman"
      aria-live="polite"
    >
      <div
        className="route-loading-indicator__bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
