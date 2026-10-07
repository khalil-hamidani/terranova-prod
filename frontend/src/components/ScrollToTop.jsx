import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Ensures that upon any route change (or click in the navbar), the window
 * immediately resets scroll position to the very top (0, 0).
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Disable browser default scroll restoration if available
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force instant scroll to the absolute top of the page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
