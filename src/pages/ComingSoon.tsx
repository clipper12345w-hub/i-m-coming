import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ComingSoonProps {
  title: string;
  subtitle?: string;
}

export default function ComingSoon({ title, subtitle }: ComingSoonProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-parchment flex items-center justify-center px-8">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none" className="mx-auto mb-6">
            <path d="M10 0V28M2 8H18" stroke="#C9A84C" strokeWidth="1.5" />
          </svg>
          <h1 className="font-serif font-light text-5xl md:text-6xl text-ink mb-4">{title}</h1>
          <p className="font-sans text-base text-muted-warm max-w-md mx-auto">
            {subtitle || 'This page is being crafted with prayer and purpose. Check back soon.'}
          </p>
          <a
            href="/"
            className="inline-block mt-10 border border-gold text-gold px-8 py-3 font-sans text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-white transition-all duration-300"
          >
            Return Home
          </a>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
