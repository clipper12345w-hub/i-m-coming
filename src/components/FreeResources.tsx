import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FreeProduct {
  id: string;
  title: string;
  description: string | null;
  type: string;
  file_url: string | null;
  image_url: string | null;
}

export default function FreeResources() {
  const { ref, isInView } = useScrollReveal();
  const { toast } = useToast();
  const [resources, setResources] = useState<FreeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, title, description, type, file_url, image_url')
      .eq('is_published', true)
      .eq('is_free', true)
      .limit(3)
      .then(({ data }) => {
        setResources(data || []);
        setLoading(false);
      });
  }, []);

  const handleDownload = (fileUrl: string | null) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast({
        title: 'Coming soon',
        description: 'Check back shortly!',
      });
    }
  };

  if (loading) {
    return (
      <section className="py-24" style={{ background: '#FDFAF5' }}>
        <div className="flex justify-center">
          <div className="border-t-[#C9A84C] rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
        </div>
      </section>
    );
  }

  if (resources.length === 0) return null;

  return (
    <section className="py-24" style={{ background: '#FDFAF5' }}>
      {/* Heading */}
      <div className="text-center mb-16">
        <p className="font-sans text-xs uppercase tracking-[0.25em] mb-4" style={{ color: '#C9A84C' }}>
          A Gift For You
        </p>
        <h2 className="font-serif font-light text-5xl mb-4" style={{ color: '#1A1209' }}>
          Free Resources
        </h2>
        <p className="font-sans text-base" style={{ color: '#7A6E62' }}>
          Freely given, to enrich your faith journey. No payment required.
        </p>
      </div>

      {/* Grid */}
      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-8">
        {resources.map((resource, i) => (
          <motion.div
            key={resource.id}
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
            style={{ border: '1px solid #EDE8DC' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EDE8DC'; }}
          >
            {/* Image area */}
            <div
              className="relative overflow-hidden flex items-center justify-center"
              style={{
                aspectRatio: '4/3',
                background: 'linear-gradient(135deg, #1A1209 0%, #0F0A04 100%)',
              }}
            >
              {/* Open book SVG */}
              <svg width="40" height="30" viewBox="0 0 40 30" fill="none" style={{ opacity: 0.6 }}>
                <path d="M20 5C20 5 15 2 5 2V25C15 25 20 28 20 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 5C20 5 25 2 35 2V25C25 25 20 28 20 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              {/* FREE badge */}
              <span
                className="absolute top-3 left-3 font-sans text-xs uppercase tracking-widest text-white px-3 py-1 rounded-full"
                style={{ background: '#C9A84C' }}
              >
                FREE
              </span>
            </div>

            {/* Card body */}
            <div className="p-6">
              <span className="block font-sans text-xs uppercase tracking-widest mb-2" style={{ color: '#C9A84C' }}>
                {resource.type}
              </span>
              <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: '#1A1209' }}>
                {resource.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: '#7A6E62' }}>
                {resource.description}
              </p>
              <button
                onClick={() => handleDownload(resource.file_url)}
                className="w-full py-3 font-sans text-xs uppercase tracking-[0.2em] text-white rounded-xl transition-colors duration-200"
                style={{ background: '#C9A84C' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#b8973f'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C9A84C'; }}
              >
                Download Free
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
