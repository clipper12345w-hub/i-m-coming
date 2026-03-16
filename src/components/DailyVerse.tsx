import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { supabase } from '@/integrations/supabase/client';

const fallbackVerseLines = [
  'For I know the plans I have for you,',
  'declares the Lord, plans to prosper you',
  'and not to harm you, plans to give you',
  'hope and a future.',
];
const fallbackReference = 'Jeremiah 29:11';

export default function DailyVerse() {
  const { ref, isInView } = useScrollReveal();
  const [verseLines, setVerseLines] = useState(fallbackVerseLines);
  const [reference, setReference] = useState(fallbackReference);

  useEffect(() => {
    supabase
      .from('settings')
      .select('daily_verse, daily_verse_reference')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.daily_verse) {
          // Split verse into lines of ~40 chars for display
          const words = data.daily_verse.split(' ');
          const lines: string[] = [];
          let current = '';
          words.forEach((w: string) => {
            if ((current + ' ' + w).trim().length > 45 && current) {
              lines.push(current.trim());
              current = w;
            } else {
              current = current ? current + ' ' + w : w;
            }
          });
          if (current) lines.push(current.trim());
          setVerseLines(lines);
        }
        if (data?.daily_verse_reference) {
          setReference(data.daily_verse_reference);
        }
      });
  }, []);

  return (
    <section className="relative py-28 overflow-hidden" style={{ background: '#0F0A04' }}>
      {/* Blurred gold circles */}
      {[
        { top: '-10%', left: '-5%' },
        { bottom: '-10%', right: '-5%' },
        { top: '30%', left: '40%' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            ...pos,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.08), transparent 70%)',
            filter: 'blur(120px)',
            animation: `glow-pulse 6s ${i * 2}s infinite alternate`,
          } as any}
        />
      ))}

      {/* Scan lines */}
      <div className="scan-lines absolute inset-0 pointer-events-none" />

      <div ref={ref} className="relative z-10 max-w-2xl mx-auto px-8 text-center">
        {/* Decorative quotation marks */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 0.5, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <svg width="50" height="40" viewBox="0 0 50 40" fill="none">
            <path d="M0 25C0 15 5 5 20 0L22 5C12 9 8 16 8 22H18V40H0V25Z" fill="#C9A84C" />
            <path d="M28 25C28 15 33 5 48 0L50 5C40 9 36 16 36 22H46V40H28V25Z" fill="#C9A84C" />
          </svg>
        </motion.div>

        {/* Verse text */}
        <div className="verse-shimmer">
          {verseLines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.2, ease: 'easeOut' }}
              className="font-serif font-light italic text-2xl md:text-3xl leading-[1.7]"
              style={{ color: '#FDFAF5' }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="font-sans text-xs uppercase tracking-[0.3em] text-gold mt-8"
        >
          — {reference}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="w-10 h-px bg-gold mx-auto mt-4"
        />
      </div>
    </section>
  );
}
