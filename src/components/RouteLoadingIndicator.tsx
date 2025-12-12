'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const MIN_VISIBLE_MS = 250;
const MAX_VISIBLE_MS = 15000;

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

  const [active, setActive] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const maxTimeoutRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (hideTimeoutRef.current != null) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (maxTimeoutRef.current != null) {
      window.clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
  };

  const show = () => {
    clearTimers();

    if (!active) {
      startTimeRef.current = Date.now();
      setActive(true);
    }

    maxTimeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = null;
      setActive(false);
    }, MAX_VISIBLE_MS);
  };

  const hide = () => {
    clearTimers();

    const start = startTimeRef.current;
    if (start == null) {
      setActive(false);
      return;
    }

    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (remaining === 0) {
      startTimeRef.current = null;
      setActive(false);
      return;
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      startTimeRef.current = null;
      setActive(false);
    }, remaining);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    // Route finished (or changed): hide indicator.
    hide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  if (!active) return null;

  return (
    <div
      className="route-loading-indicator"
      role="status"
      aria-label="Memuat halaman"
      aria-live="polite"
    />
  );
}
