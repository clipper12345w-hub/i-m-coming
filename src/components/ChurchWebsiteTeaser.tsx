import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function ChurchWebsiteTeaser() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden bg-dark">
      {/* Decorative cross pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        {[...Array(6)].map((_, i) =>
        <svg key={i} className="absolute" style={{ left: `${15 + i * 15}%`, top: `${10 + i % 3 * 30}%` }} width="24" height="32" viewBox="0 0 24 32" fill="none">
            <path d="M12 0V32M4 8H20" stroke="hsl(var(--gold))" strokeWidth="1" />
          </svg>
        )}
      </div>

      <div className="relative max-w-4xl mx-auto px-8 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="inline-block font-sans text-xs uppercase tracking-[0.25em] text-gold mb-6">
          Our Services
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-parchment mb-6 leading-tight">
          A Website For<br />Your Church
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-sans text-base md:text-lg text-muted-warm max-w-xl mx-auto mb-10 leading-relaxed">
          We help churches build a meaningful digital presence — from responsive design to online service scheduling and donation features.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] px-8 py-3.5 border border-gold text-gold hover:bg-gold hover:text-parchment transition-all duration-300">
            View Services
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M10 5L13 8L10 11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px opacity-30" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)' }} />
    </section>
  );
}