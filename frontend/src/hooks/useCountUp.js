import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Parses a stat string like '3+', '50+', '100%', '1 200+', '+3', '+50', '+1 200'
 * Returns { numeric: 3, prefix: '', suffix: '+' } or { numeric: 1200, prefix: '+', suffix: '' }
 */
function parseStatValue(raw) {
  if (!raw) return { numeric: 0, prefix: '', suffix: '' };
  const str = String(raw).trim();
  let prefix = '';
  let suffix = '';
  // Check for leading +
  if (str.startsWith('+')) {
    prefix = '+';
  }
  // Check for trailing + or %
  if (str.endsWith('+')) {
    suffix = '+';
  } else if (str.endsWith('%')) {
    suffix = '%';
  }
  // Extract the numeric part (remove spaces, +, %)
  const numStr = str.replace(/[^0-9]/g, '');
  const numeric = parseInt(numStr, 10) || 0;
  return { numeric, prefix, suffix };
}

export function useCountUp(rawValue, duration = 2000) {
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  const animate = useCallback(() => {
    const { numeric, prefix, suffix } = parseStatValue(rawValue);
    if (numeric === 0) {
      setDisplayValue(rawValue);
      return;
    }

    const startTime = performance.now();
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo curve
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(eased * numeric);
      // Format with space separator for thousands (e.g. 1 200)
      const formatted = current >= 1000
        ? current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
        : current.toString();
      setDisplayValue(`${prefix}${formatted}${suffix}`);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [rawValue, duration]);

  useEffect(() => {
    if (hasAnimated) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasAnimated, animate]);

  return { ref, displayValue };
}

export default useCountUp;
