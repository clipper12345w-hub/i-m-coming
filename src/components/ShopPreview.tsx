import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StaggerChildren, staggerItem } from './StaggerChildren';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  description: string | null;
  type: string;
  image_url: string | null;
}

export default function ShopPreview() {
  const { ref, isInView } = useScrollReveal();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, title, description, type, image_url')
      .eq('is_published', true)
      .eq('is_featured', true)
      .limit(3)
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="bg-surface py-32">
        <div className="flex justify-center">
          <div className="border-t-[#C9A84C] rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="bg-surface py-32">
      <div ref={ref} className="text-center mb-20">
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="font-serif font-light text-5xl text-ink mb-4"
        >
          Faith Resources
        </motion.h2>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-sans text-base text-muted-warm"
        >
          Thoughtfully crafted ebooks and wallpapers to enrich your spiritual journey.
        </motion.p>
      </div>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-8">
        {products.map((p) => (
          <motion.div
            key={p.id}
            variants={staggerItem}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-divider group hover:border-gold hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            {/* Image area */}
            <div className="aspect-[4/3] relative overflow-hidden flex items-center justify-center"
              style={{ background: p.image_url ? undefined : 'linear-gradient(135deg, #E8D5A3 0%, #C9A84C 50%, #8B6914 100%)' }}
            >
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <svg width="40" height="60" viewBox="0 0 40 60" fill="none" className="relative z-10 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform duration-500">
                  <path d="M20 0V60" stroke="white" strokeWidth="2" />
                  <path d="M0 20H40" stroke="white" strokeWidth="2" />
                </svg>
              )}
              {/* Tag */}
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full font-sans text-xs uppercase tracking-widest"
                style={{ background: 'rgba(15,10,4,0.7)', backdropFilter: 'blur(8px)', color: '#E8D5A3' }}
              >
                {p.type}
              </span>
            </div>
            {/* Body */}
            <div className="p-6">
              <h3 className="font-serif text-xl font-semibold text-ink mb-2">{p.title}</h3>
              <p className="font-sans text-sm text-muted-warm leading-relaxed mb-4">{p.description}</p>
              <a href="/shop" className="font-sans text-xs uppercase tracking-widest text-gold hover:tracking-[0.3em] transition-all duration-300">
                View on Shop →
              </a>
            </div>
          </motion.div>
        ))}
      </StaggerChildren>
    </section>
  );
}
