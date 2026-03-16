import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { supabase } from '@/integrations/supabase/client';

const faithWords = [
{ word: 'Love', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-3' },
{ word: 'Joy', className: 'top-[13%] right-[13%]' },
{ word: 'Peace', className: 'bottom-[13%] right-[13%]' },
{ word: 'Hope', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-3' },
{ word: 'Grace', className: 'bottom-[13%] left-[13%]' },
{ word: 'Faith', className: 'top-[13%] left-[13%]' }];


export default function PrayerTeaser() {
  const { ref, isInView } = useScrollReveal();
  const [prayerCount, setPrayerCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('prayer_requests')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => {
        setPrayerCount(count ?? 0);
      });
  }, []);

  return (
    <section className="bg-parchment py-32 overflow-hidden relative">
      <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-6xl mx-auto px-8 items-center relative z-10">
        {/* Left — decorative prayer composition */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.9 }}
          className="flex items-center justify-center relative order-2 lg:order-1">
          
          <div className="relative w-full max-w-[380px] mx-auto" style={{ aspectRatio: '1/1' }}>
            {/* Outer circle */}
            <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid #C9A84C', opacity: 0.5 }} />

            {/* Inner dashed circle */}
            <div
              className="absolute rounded-full"
              style={{
                width: '70%',
                height: '70%',
                top: '15%',
                left: '15%',
                border: '1.5px dashed #C9A84C',
                opacity: 0.6,
                animation: 'spin 20s linear infinite'
              }} />
            

            {/* Center glow */}
            <div
              className="absolute"
              style={{
                width: '40%',
                height: '40%',
                top: '30%',
                left: '30%',
                background: 'radial-gradient(circle, rgba(201,168,76,0.08), transparent)',
                filter: 'blur(16px)',
                zIndex: 0
              }} />
            

            {/* Center image */}
            <img

              alt="Praying hands"
              className="absolute object-contain"
              style={{
                width: '55%',
                height: '55%',
                top: '22.5%',
                left: '22.5%',
                zIndex: 1
              }} src="/lovable-uploads/036a355e-182e-4038-b824-6a5cb69d637c.jpg" />
            

            {/* Faith words */}
            {faithWords.map(({ word, className }) =>
            <span
              key={word}
              className={`absolute font-serif italic text-xs ${className}`}
              style={{ color: '#C9A84C', opacity: 1, fontWeight: 500, letterSpacing: '0.1em' }}>

                {word}
              </span>
            )}
          </div>
        </motion.div>

        {/* Right — text */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="order-1 lg:order-2">
          
          <span className="block font-sans text-xs uppercase tracking-[0.25em] text-gold mb-4">
            Community Prayer
          </span>
          <h2 className="font-serif font-light text-4xl lg:text-5xl text-ink leading-[1.1] mb-6">
            Every prayer matters. Every voice is heard.
          </h2>
          <p className="font-sans text-base text-muted-warm leading-relaxed mb-10">
            Thousands of believers lift their prayers daily through CrossAlliance. Add yours,
            and let the community stand with you in faith.
          </p>
          <a
            href="/prayer-room"
            className="shine-sweep inline-block bg-gold text-white px-12 py-4 font-sans text-xs uppercase tracking-[0.25em] hover:brightness-90 transition-all duration-300">
            
            Enter the Prayer Room
          </a>
          <p className="font-sans text-xs text-muted-warm mt-4 italic">
            {prayerCount !== null ? `${prayerCount.toLocaleString()} prayers lifted` : 'Loading...'}
          </p>
        </motion.div>
      </div>
    </section>);

}
