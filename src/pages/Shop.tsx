import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  title: string;
  description: string | null;
  type: string;
  price_usd: number | null;
  original_price_usd: number | null;
  payhip_link: string | null;
  image_url: string | null;
  is_free: boolean | null;
  file_url: string | null;
}

const formatType = (type: string) => type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function Shop() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { ref, isInView } = useScrollReveal();
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from('products_public')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(true); setLoading(false); return; }
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  const filters = ['All', ...Array.from(new Set(products.map(p => p.type)))];

  const filteredProducts = activeFilter === 'All'
    ? products
    : products.filter(p => p.type === activeFilter);

  const handleGetIt = async (product: Product) => {
    if (product.is_free && product.file_url) {
      try {
        const { data, error } = await supabase.functions.invoke('get-product-file', {
          body: { productId: product.id },
        });
        if (error || !data?.url) {
          toast({ title: 'Error', description: 'Could not generate download link.', variant: 'destructive' });
          return;
        }
        window.open(data.url, '_blank');
      } catch {
        toast({ title: 'Error', description: 'Could not download file.', variant: 'destructive' });
      }
    } else if (!product.is_free && product.payhip_link) {
      window.open(product.payhip_link, '_blank');
    } else {
      toast({ title: 'Coming soon!', description: 'This resource will be available shortly.' });
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF5' }}>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden flex items-center justify-center" style={{ height: '40vh', background: '#0F0A04' }}>
        <svg className="absolute" style={{ height: 500, opacity: 0.05 }} viewBox="0 0 100 200" fill="none" stroke="#C9A84C" strokeWidth="2">
          <rect x="40" y="0" width="20" height="200" />
          <rect x="10" y="40" width="80" height="20" />
        </svg>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-8"
        >
          <span className="block font-sans text-xs uppercase tracking-[0.25em] mb-4" style={{ color: '#C9A84C' }}>Faith Resources</span>
          <h1 className="font-serif font-light text-6xl" style={{ color: '#FDFAF5' }}>Shop</h1>
          <p className="font-sans text-base mt-4" style={{ color: '#7A6E62' }}>Thoughtfully crafted resources to enrich your spiritual life.</p>
        </motion.div>
      </section>

      {/* FILTER BAR */}
      <div className="bg-white py-4" style={{ borderBottom: '1px solid #EDE8DC' }}>
        <div className="max-w-6xl mx-auto px-8 flex items-center gap-3">
          <span className="font-sans text-xs uppercase tracking-widest mr-2" style={{ color: '#7A6E62' }}>Filter:</span>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="rounded-full px-5 py-2 font-sans text-xs cursor-pointer transition-all duration-200"
              style={{
                background: activeFilter === f ? '#1A1209' : 'transparent',
                color: activeFilter === f ? '#FFFFFF' : '#7A6E62',
                border: `1px solid ${activeFilter === f ? '#1A1209' : '#EDE8DC'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <section className="py-16">
        <div ref={ref} className="max-w-6xl mx-auto px-8">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="border-t-[#C9A84C] rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="font-sans text-base" style={{ color: '#7A6E62' }}>Something went wrong. Please try again.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* EMPTY STATE */
            <div className="text-center py-24">
              <svg width="60" height="84" viewBox="0 0 10 14" fill="none" className="mx-auto">
                <path d="M5 0V14M1 4H9" stroke="#EDE8DC" strokeWidth="1.5" />
              </svg>
              <h3 className="font-serif text-3xl mt-6" style={{ color: '#7A6E62' }}>No resources available yet.</h3>
              <p className="font-sans text-sm mt-3" style={{ color: '#7A6E62' }}>Check back soon — new resources are on their way.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ y: 60, opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: '1px solid #EDE8DC' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EDE8DC'; }}
                >
                  {/* Image area */}
                  <div
                    className="relative overflow-hidden flex items-center justify-center group"
                    style={{ aspectRatio: '4/3', background: product.image_url ? undefined : 'linear-gradient(135deg, #E8D5A3 0%, #C9A84C 50%, #8B6914 100%)' }}
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent)', filter: 'blur(40px)' }} />
                        <svg width="40" height="60" viewBox="0 0 10 14" fill="none" className="relative z-10 transition-transform duration-400 group-hover:scale-110">
                          <path d="M5 0V14M1 4H9" stroke="white" strokeWidth="1.5" />
                        </svg>
                      </>
                    )}
                    <span
                      className="absolute top-3 left-3 font-sans text-xs uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm"
                      style={{ background: 'rgba(15,10,4,0.75)', color: '#E8D5A3' }}
                    >
                      {product.type}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: '#1A1209' }}>{product.title}</h3>
                    <p className="font-sans text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: '#7A6E62' }}>{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.is_free ? (
                          <span className="font-serif text-2xl" style={{ color: '#C9A84C' }}>Free</span>
                        ) : product.price_usd ? (
                          <>
                            {product.original_price_usd && product.original_price_usd > product.price_usd && (
                              <>
                                <span className="font-sans text-sm line-through" style={{ color: '#7A6E62' }}>
                                  ${product.original_price_usd.toFixed(2)}
                                </span>
                                <span className="font-sans text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#C9A84C', color: '#FFFFFF' }}>
                                  {Math.round(((product.original_price_usd - product.price_usd) / product.original_price_usd) * 100)}% OFF
                                </span>
                              </>
                            )}
                            <span className="font-serif text-2xl" style={{ color: '#C9A84C' }}>
                              ${product.price_usd.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-serif text-2xl" style={{ color: '#C9A84C' }}>Free</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleGetIt(product)}
                        className="px-5 py-2 font-sans text-xs uppercase tracking-widest transition-all duration-200"
                        style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#FFFFFF'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C9A84C'; }}
                      >
                        Get It →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
