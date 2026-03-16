import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section
      className="relative h-screen overflow-hidden"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dzqggd3t5/image/upload/v1773448280/upscalemedia-transformed_osndqf.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 z-0" style={{ background: 'rgba(15,10,4,0.55)' }} />

      {/* Content */}
      <div className="relative z-[1] grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-16 max-w-6xl mx-auto px-8 h-full items-center">
        {/* Left Column */}
        <div className="pt-20 lg:pt-0">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-3 mb-8">
            <div className="w-[60px] h-px bg-gold" />
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold">
              Daily Faith Resources
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="font-serif font-light text-6xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-tight">
            Walk in Faith,
          </motion.h1>
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
            className="font-serif font-light text-6xl md:text-7xl lg:text-8xl text-gold leading-[0.95] tracking-tight">
            Together.
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="font-sans text-lg text-white/70 mt-6 max-w-md leading-relaxed">
            Daily devotionals, community prayer, and resources to deepen your walk with Christ.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}>
            <a
              href="#features"
              className="shine-sweep inline-block border border-gold text-gold px-10 py-4 font-sans text-xs uppercase tracking-[0.25em] mt-10 hover:bg-gold hover:text-white transition-all duration-300">
              Begin Your Journey
            </a>
          </motion.div>
        </div>

        {/* Right Column — floating stat cards only */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="hidden lg:flex items-center justify-center relative w-full max-w-[420px] mx-auto"
          style={{ minHeight: 400 }}>
          <div className="flex flex-col gap-y-3">
            {[
              { value: '2,847', label: 'Prayers this week' },
              { value: '365', label: 'Daily devotionals' },
              { value: '12,400+', label: 'Believers worldwide' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.15 }}
                className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-center">
                <span className="block font-serif text-2xl text-gold">{stat.value}</span>
                <span className="block font-sans text-xs text-white/60">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-[1]">
        <span className="font-sans text-xs uppercase tracking-widest text-white/50 mb-2">
          Scroll to explore
        </span>
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="bounce-down">
          <path d="M1 6L8 13L15 6" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
          <path d="M1 1L8 8L15 1" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
        </svg>
      </div>
    </section>);

}