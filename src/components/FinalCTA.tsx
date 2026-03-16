import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function FinalCTA() {
  const { ref, isInView } = useScrollReveal();

  return (
    <section
      className="py-28 text-center overflow-hidden relative"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dzqggd3t5/image/upload/v1773295480/upscalemedia-transformed_zhamrx.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(15,10,4,0.55), rgba(15,10,4,0.75))',
          zIndex: 0,
        }}
      />

      <div ref={ref} className="relative z-10 max-w-2xl mx-auto px-8">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none" className="mx-auto mb-4">
            <path d="M10 0V28M2 8H18" stroke="#C9A84C" strokeWidth="1.5" />
          </svg>
          <h2 className="font-serif font-light text-5xl md:text-6xl mt-4 mb-4" style={{ color: '#FDFAF5' }}>
            Begin Your Journey Today
          </h2>
          <p className="font-sans text-base text-muted-warm mb-10">
            Join thousands walking in faith through CrossAlliance.
          </p>
          <a
            href="/devotional"
            className="shine-sweep inline-block border border-gold text-gold px-12 py-4 font-sans text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-white transition-all duration-300"
          >
            Start for Free
          </a>
        </motion.div>
      </div>
    </section>
  );
}
