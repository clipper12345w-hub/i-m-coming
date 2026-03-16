import { useRef } from 'react';
import { useInView } from 'framer-motion';

interface ScrollRevealOptions {
  once?: boolean;
  margin?: string;
  amount?: number;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { once = true, margin = "-100px", amount = 0.2 } = options;
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as any, amount });

  return { ref, isInView };
}
