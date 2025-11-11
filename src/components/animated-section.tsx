'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

type AnimatedSectionProps = {
  children: React.ReactNode;
};

export default function AnimatedSection({ children }: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px 0px' });

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
