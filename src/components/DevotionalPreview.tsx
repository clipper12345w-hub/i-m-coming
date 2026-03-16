import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { supabase } from '@/integrations/supabase/client';

export default function DevotionalPreview() {
  const { ref, isInView } = useScrollReveal();
  const [devotional, setDevotional] = useState<{
    title: string;
    verse_reference: string | null;
    content: string;
    published_date: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    supabase
      .from('devotionals')
      .select('title, verse_reference, content, published_date')
      .eq('published_date', today)
      .maybeSingle()
      .then(({ data }) => {
        setDevotional(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="bg-parchment py-32">
        <div className="flex justify-center">
          <div className="border-t-[#C9A84C] rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
        </div>
      </section>
    );
  }

  if (!devotional) return null;

  const dateStr = new Date(devotional.published_date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="bg-parchment py-32">
      <div ref={ref} className="max-w-6xl mx-auto px-8">
        <motion.span
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="block font-sans text-xs uppercase tracking-[0.25em] text-gold mb-4"
        >
          Today's Devotional
        </motion.span>

        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-sans text-xs uppercase tracking-widest text-muted-warm mb-3">{dateStr}</p>
            <h2 className="font-serif font-light text-4xl lg:text-5xl text-ink leading-[1.1] mb-4">
              {devotional.title}
            </h2>
            {devotional.verse_reference && (
              <p className="font-sans text-sm italic text-gold mb-6">{devotional.verse_reference}</p>
            )}

            <div className="relative overflow-hidden">
              <p className="font-sans text-base text-muted-warm leading-relaxed">
                {devotional.content.substring(0, 300)}...
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-parchment to-transparent" />
            </div>

            <a
              href="/devotional"
              className="inline-block font-sans text-xs uppercase tracking-[0.2em] text-gold mt-6 hover:tracking-[0.3em] transition-all duration-300"
            >
              Read Today's Devotional →
            </a>
          </motion.div>

          {/* Right — decorative composition */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="hidden lg:flex items-center justify-center relative"
            style={{ minHeight: 400 }}
          >
            {/* Vertical bar */}
            <div className="absolute w-1 h-[300px] bg-gradient-to-b from-transparent via-gold to-transparent" />
            {/* Horizontal line */}
            <div className="absolute w-[200px] h-px bg-gold" style={{ top: '30%' }} />
            {/* Diamond at intersection */}
            <div
              className="absolute w-3 h-3 bg-gold rotate-45"
              style={{ top: 'calc(30% - 6px)' }}
            />
            {/* Small circles */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-gold opacity-40"
                  style={{
                    top: `calc(50% + ${Math.sin(angle) * 120}px)`,
                    left: `calc(50% + ${Math.cos(angle) * 80}px)`,
                  }}
                />
              );
            })}

            {/* Olive branch */}
            <svg width="120" height="200" viewBox="0 0 120 200" fill="none" className="absolute" style={{ bottom: 0 }}>
              <path d="M60 10C55 50 50 100 60 190" stroke="#C9A84C" strokeWidth="1.2" fill="none" />
              {[30, 60, 90, 120, 150, 170].map((y, i) => (
                <ellipse
                  key={i}
                  cx={i % 2 === 0 ? 45 : 75}
                  cy={y}
                  rx="12"
                  ry="6"
                  transform={`rotate(${i % 2 === 0 ? -20 : 20} ${i % 2 === 0 ? 45 : 75} ${y})`}
                  stroke="#C9A84C"
                  strokeWidth="1.2"
                  fill="none"
                />
              ))}
              <circle cx="48" cy="140" r="3" stroke="#C9A84C" strokeWidth="1" fill="none" />
              <circle cx="72" cy="160" r="3" stroke="#C9A84C" strokeWidth="1" fill="none" />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
