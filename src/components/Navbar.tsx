import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'HOME', href: '/' },
  { label: 'DEVOTIONAL', href: '/devotional' },
  { label: 'PRAYER ROOM', href: '/prayer-room' },
  { label: 'BIBLE PLAN', href: '/bible-plan' },
  { label: 'SHOP', href: '/shop' },
  { label: 'SERVICES', href: '/services' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [dropdownOpen]);

  const displayName = profile?.full_name
    ? (profile.full_name.length > 12 ? profile.full_name.slice(0, 12) + '…' : profile.full_name)
    : 'User';

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(253,250,245,0.95)] backdrop-blur-md border-b border-divider'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2 group">
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
              <path d="M5 0V14M1 4H9" stroke="#C9A84C" strokeWidth="1.5" />
            </svg>
            <span className="font-serif font-semibold text-xl tracking-wide text-gold group-hover:[text-shadow:0_0_12px_rgba(201,168,76,0.4)] transition-all duration-300">
              CrossAlliance
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link font-sans text-xs uppercase tracking-[0.18em] text-muted-warm hover:text-gold transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}

            {/* Auth section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#EDE8DC' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A6E62" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                      </svg>
                    </div>
                  )}
                  <span className="font-sans text-xs" style={{ color: '#1A1209' }}>{displayName}</span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 rounded-xl shadow-md p-2 min-w-[160px]"
                    style={{ border: '1px solid #EDE8DC', background: '#FFFFFF' }}
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block font-sans text-sm px-4 py-2 rounded-lg transition-colors duration-150"
                      style={{ color: '#1A1209' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FDFAF5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      My Dashboard
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="font-sans text-xs uppercase tracking-[0.18em] px-5 py-2 transition-all duration-200"
                style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C9A84C'; }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
              <path d="M0 1H24M0 8H24M0 15H24" stroke="#1A1209" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-parchment flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-8"
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 2L18 18M18 2L2 18" stroke="#1A1209" strokeWidth="1.5" />
              </svg>
            </button>
            {navLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="font-serif text-3xl text-ink mb-6 hover:text-gold transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label.charAt(0) + link.label.slice(1).toLowerCase()}
              </motion.a>
            ))}
            {user ? (
              <>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
                  <Link to="/dashboard" className="font-serif text-3xl text-ink mb-6 hover:text-gold transition-colors block" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
                  <Link to="/settings" className="font-serif text-3xl text-ink mb-6 hover:text-gold transition-colors block" onClick={() => setMobileOpen(false)}>Settings</Link>
                </motion.div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
                <Link to="/login" className="font-serif text-3xl text-gold mb-6 block" onClick={() => setMobileOpen(false)}>Sign In</Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
