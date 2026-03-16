import { motion } from 'framer-motion';
import { StaggerChildren, staggerItem } from './StaggerChildren';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const cards = [
  {
    num: '01',
    title: 'Daily Devotional',
    body: 'Fresh reflections every morning to anchor your day in the Word of God.',
    svg: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#C9A84C" strokeWidth="1.2">
        <path d="M6 40C6 40 10 36 24 36C38 36 42 40 42 40V8C42 8 38 12 24 12C10 12 6 8 6 8V40Z" />
        <line x1="24" y1="12" x2="24" y2="36" />
        <line x1="12" y1="18" x2="21" y2="18" />
        <line x1="12" y1="23" x2="21" y2="23" />
        <line x1="12" y1="28" x2="21" y2="28" />
        <line x1="27" y1="18" x2="36" y2="18" />
        <line x1="27" y1="23" x2="36" y2="23" />
        <line x1="27" y1="28" x2="36" y2="28" />
        <path d="M36 8V4" strokeLinecap="round" />
        <path d="M36 4L33 8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Prayer Room',
    body: 'Submit your prayer requests and stand in faith alongside the CrossAlliance community.',
    svg: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#C9A84C" strokeWidth="1.2">
        <path d="M24 6C24 6 20 10 20 16C20 20 22 24 24 28C26 24 28 20 28 16C28 10 24 6 24 6Z" />
        <path d="M16 20C16 20 14 24 14 28C14 32 16 36 20 40L24 44L28 40C32 36 34 32 34 28C34 24 32 20 32 20" />
        <path d="M18 26C18 26 20 30 24 34" />
        <path d="M30 26C30 26 28 30 24 34" />
        <line x1="20" y1="16" x2="17" y2="18" />
        <line x1="28" y1="16" x2="31" y2="18" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Bible Reading Plan',
    body: 'Follow a structured yearly plan and track your daily progress through Scripture.',
    svg: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#C9A84C" strokeWidth="1.2">
        <path d="M12 6C12 6 8 6 8 10V38C8 42 12 42 12 42H36C36 42 40 42 40 38V10C40 6 36 6 36 6" />
        <path d="M12 6C12 6 14 8 14 12V4C14 4 12 2 8 4" />
        <path d="M36 6C36 6 34 8 34 12V4C34 4 36 2 40 4" />
        <line x1="16" y1="18" x2="32" y2="18" />
        <line x1="16" y1="24" x2="32" y2="24" />
        <line x1="16" y1="30" x2="28" y2="30" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Faith Resources',
    body: 'Download ebooks and wallpapers crafted to inspire and enrich your spiritual life.',
    svg: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#C9A84C" strokeWidth="1.2">
        <path d="M14 44C10 44 6 40 6 36C6 32 10 28 14 28C14 28 16 28 18 30" />
        <path d="M34 44C38 44 42 40 42 36C42 32 38 28 34 28C34 28 32 28 30 30" />
        <path d="M18 30C18 30 14 24 14 20C14 14 18 10 24 10C30 10 34 14 34 20C34 24 30 30 30 30" />
        <line x1="24" y1="14" x2="24" y2="24" />
        <line x1="19" y1="19" x2="29" y2="19" />
      </svg>
    ),
  },
];

export default function Features() {
  const { ref: headRef, isInView: headInView } = useScrollReveal();

  return (
    <section id="features" className="bg-surface py-32">
      <div ref={headRef} className="text-center mb-20">
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          animate={headInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="font-serif font-light text-5xl md:text-6xl text-ink mb-4"
        >
          Everything You Need to Grow
        </motion.h2>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={headInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="font-sans text-base text-muted-warm"
        >
          One place for your daily spiritual practice.
        </motion.p>
      </div>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto px-8">
        {cards.map((card) => (
          <motion.div
            key={card.num}
            variants={staggerItem}
            whileHover={{ scale: 1.02, borderColor: '#C9A84C' }}
            transition={{ duration: 0.3 }}
            className="bg-surface rounded-2xl p-8 border border-divider relative overflow-hidden cursor-pointer group"
          >
            {/* Gold top accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent group-hover:via-gold-light transition-all" />
            {/* Large number */}
            <span className="absolute right-4 bottom-0 font-serif font-light text-8xl text-divider leading-none pointer-events-none">
              {card.num}
            </span>
            {card.svg}
            <h3 className="font-serif text-2xl font-semibold text-ink mt-6 mb-3">{card.title}</h3>
            <p className="font-sans text-sm text-muted-warm leading-relaxed">{card.body}</p>
          </motion.div>
        ))}
      </StaggerChildren>
    </section>
  );
}
