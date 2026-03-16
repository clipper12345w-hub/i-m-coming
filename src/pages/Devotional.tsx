import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface DevotionalData {
  id: string;
  title: string;
  content: string;
  verse: string | null;
  verse_reference: string | null;
  published_date: string;
  reflection_1: string | null;
  reflection_2: string | null;
  reflection_3: string | null;
  closing_prayer: string | null;
  header_image_url: string | null;
}

interface ArchiveItem {
  id: string;
  title: string;
  verse_reference: string | null;
  content: string;
  published_date: string;
}

export default function Devotional() {
  const { ref: archiveRef, isInView: archiveInView } = useScrollReveal();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [todayDevotional, setTodayDevotional] = useState<DevotionalData | null>(null);
  const [archiveDevotionals, setArchiveDevotionals] = useState<ArchiveItem[]>([]);
  const [reactions, setReactions] = useState<Record<string, boolean>>({ amen: false, touched: false, enlightened: false });
  const [counts, setCounts] = useState<Record<string, number>>({ amen: 0, touched: 0, enlightened: 0 });
  const [isSaved, setIsSaved] = useState(false);
  const [kofiUrl, setKofiUrl] = useState('#');

  const today = new Date().toISOString().split('T')[0];

  // Fetch today's devotional + archive + settings
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [todayRes, archiveRes, settingsRes] = await Promise.all([
          supabase.from('devotionals').select('*').eq('published_date', today).maybeSingle(),
          supabase.from('devotionals').select('id, title, verse_reference, content, published_date').neq('published_date', today).order('published_date', { ascending: false }).limit(6),
          supabase.from('settings').select('ko_fi_url').eq('id', 1).maybeSingle(),
        ]);

        setTodayDevotional(todayRes.data as DevotionalData | null);
        setArchiveDevotionals((archiveRes.data || []) as ArchiveItem[]);
        if (settingsRes.data?.ko_fi_url) setKofiUrl(settingsRes.data.ko_fi_url);
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    fetchAll();
  }, [today]);

  // Fetch reaction counts + user reaction + saved status
  useEffect(() => {
    if (!todayDevotional) return;

    // Reaction counts
    supabase.from('devotional_reactions').select('reaction_type').eq('devotional_id', todayDevotional.id)
      .then(({ data }) => {
        const c = { amen: 0, touched: 0, enlightened: 0 };
        data?.forEach((r: any) => { if (c[r.reaction_type as keyof typeof c] !== undefined) c[r.reaction_type as keyof typeof c]++; });
        setCounts(c);
      });

    if (!user) return;

    // User's reactions
    supabase.from('devotional_reactions').select('reaction_type').eq('devotional_id', todayDevotional.id).eq('user_id', user.id)
      .then(({ data }) => {
        const r = { amen: false, touched: false, enlightened: false };
        data?.forEach((d: any) => { r[d.reaction_type as keyof typeof r] = true; });
        setReactions(r);
      });

    // Saved status
    supabase.from('saved_devotionals').select('id').eq('devotional_id', todayDevotional.id).eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { setIsSaved(!!data); });
  }, [todayDevotional, user]);

  const toggleReaction = async (key: string) => {
    if (!user) { navigate('/login'); return; }
    if (!todayDevotional) return;

    const wasActive = reactions[key];
    // Optimistic update
    setReactions(prev => ({ ...prev, [key]: !wasActive }));
    setCounts(prev => ({ ...prev, [key]: prev[key] + (wasActive ? -1 : 1) }));

    if (wasActive) {
      await supabase.from('devotional_reactions').delete()
        .eq('devotional_id', todayDevotional.id).eq('user_id', user.id).eq('reaction_type', key);
    } else {
      await supabase.from('devotional_reactions').insert({
        devotional_id: todayDevotional.id, user_id: user.id, reaction_type: key
      });
    }
  };

  const toggleSave = async () => {
    if (!user) { navigate('/login'); return; }
    if (!todayDevotional) return;

    if (isSaved) {
      await supabase.from('saved_devotionals').delete().eq('devotional_id', todayDevotional.id).eq('user_id', user.id);
      setIsSaved(false);
      toast({ title: 'Devotional unsaved' });
    } else {
      await supabase.from('saved_devotionals').insert({ devotional_id: todayDevotional.id, user_id: user.id });
      setIsSaved(true);
      toast({ title: 'Devotional saved ✓', className: 'bg-[#C9A84C] text-white border-none' });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied to clipboard!' });
  };

  const dateStr = todayDevotional
    ? new Date(todayDevotional.published_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const reflectionQuestions = todayDevotional
    ? [todayDevotional.reflection_1, todayDevotional.reflection_2, todayDevotional.reflection_3].filter(Boolean) as string[]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#FDFAF5' }}>
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <div className="border-t-[#C9A84C] rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ background: '#FDFAF5' }}>
        <Navbar />
        <div className="text-center py-40">
          <p className="font-sans text-base" style={{ color: '#7A6E62' }}>Something went wrong. Please try again.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF5' }}>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden flex items-center justify-center" style={{ height: '40vh', background: '#0F0A04' }}>
        {todayDevotional?.header_image_url && (
          <img src={todayDevotional.header_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        {!todayDevotional?.header_image_url && (
          <svg className="absolute" style={{ height: 500, opacity: 0.05 }} viewBox="0 0 100 200" fill="none" stroke="#C9A84C" strokeWidth="2">
            <rect x="40" y="0" width="20" height="200" />
            <rect x="10" y="40" width="80" height="20" />
          </svg>
        )}
        <div className="relative z-10 text-center px-8">
          <span className="block font-sans text-xs uppercase tracking-[0.25em] mb-4" style={{ color: '#C9A84C' }}>Daily Reflections</span>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="font-serif font-light text-6xl"
            style={{ color: '#FDFAF5' }}
          >
            Devotionals
          </motion.h1>
          <p className="font-sans text-base mt-4" style={{ color: '#7A6E62' }}>
            Fresh reflections every day to anchor your walk with Christ.
          </p>
        </div>
      </section>

      {/* TODAY'S FEATURED DEVOTIONAL */}
      {todayDevotional ? (
        <section className="py-20" style={{ background: '#FFFFFF' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-8">
            <div className="relative overflow-hidden rounded-2xl" style={{ border: '1px solid #EDE8DC' }}>
              {/* Header image area */}
              <div className="w-full flex items-center justify-center" style={{ aspectRatio: '21/9', background: todayDevotional.header_image_url ? undefined : 'linear-gradient(135deg, #1A1209, #0F0A04)' }}>
                {todayDevotional.header_image_url ? (
                  <img src={todayDevotional.header_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg width="40" height="56" viewBox="0 0 10 14" fill="none">
                    <path d="M5 0V14M1 4H9" stroke="#C9A84C" strokeWidth="1" />
                  </svg>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap justify-between items-center px-6 sm:px-10 pt-6">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#7A6E62' }}>{dateStr}</span>
                  <span className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#7A6E62' }}>· 5 min read</span>
                </div>
                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  {/* Save button */}
                  <button onClick={toggleSave} className="group" title={isSaved ? 'Unsave' : 'Save'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? '#C9A84C' : 'none'} className="transition-colors duration-200" stroke={isSaved ? '#C9A84C' : '#7A6E62'} strokeWidth="1.5">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                  </button>
                  {/* WhatsApp */}
                  <a href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-colors duration-200" stroke="#7A6E62">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" strokeWidth="1.5"/>
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" strokeWidth="1.5"/>
                    </svg>
                  </a>
                  {/* Copy link */}
                  <button onClick={copyLink} className="group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-colors duration-200" stroke="#7A6E62">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  {/* Twitter/X */}
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="group">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transition-colors duration-200" stroke="#7A6E62">
                      <path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-7-8.5L19.5 4H18l-5 6.2L9 4H4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-serif font-light text-4xl sm:text-5xl px-6 sm:px-10 mt-4" style={{ color: '#1A1209', lineHeight: 1.1 }}>
                {todayDevotional.title}
              </h2>

              {/* Verse reference */}
              {todayDevotional.verse_reference && (
                <span className="block font-sans text-sm italic px-6 sm:px-10 mt-3" style={{ color: '#C9A84C' }}>
                  {todayDevotional.verse_reference}
                </span>
              )}

              {/* Featured verse block */}
              {todayDevotional.verse && (
                <div className="mx-6 sm:mx-10 my-8 rounded-2xl px-8 py-6 relative" style={{ background: '#0F0A04' }}>
                  <svg width="30" height="24" viewBox="0 0 30 24" fill="none" className="absolute top-4 left-6" style={{ opacity: 0.4 }}>
                    <path d="M0 24V14.4C0 10.56 0.84 7.44 2.52 5.04C4.2 2.64 6.84 0.96 10.44 0L12 3.6C9.84 4.32 8.16 5.52 6.96 7.2C5.76 8.88 5.16 10.8 5.16 12.96H10V24H0ZM18 24V14.4C18 10.56 18.84 7.44 20.52 5.04C22.2 2.64 24.84 0.96 28.44 0L30 3.6C27.84 4.32 26.16 5.52 24.96 7.2C23.76 8.88 23.16 10.8 23.16 12.96H28V24H18Z" fill="#C9A84C"/>
                  </svg>
                  <p className="font-serif italic font-light text-xl pt-6" style={{ color: '#FDFAF5', lineHeight: 1.7 }}>
                    {todayDevotional.verse}
                  </p>
                  <span className="block font-sans text-xs uppercase tracking-[0.2em] mt-4" style={{ color: '#C9A84C' }}>
                    — {todayDevotional.verse_reference}
                  </span>
                </div>
              )}

              {/* Content body */}
              <div className="px-6 sm:px-10 pb-6">
                {todayDevotional.content.split('\n\n').map((p, i) => (
                  <p key={i} className="font-sans text-base leading-relaxed mb-6" style={{ color: '#7A6E62' }}>{p}</p>
                ))}
              </div>

              {/* Reflection questions */}
              {reflectionQuestions.length > 0 && (
                <div className="mx-6 sm:mx-10 my-8 pl-6" style={{ borderLeft: '2px solid #C9A84C' }}>
                  <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4" style={{ color: '#C9A84C' }}>Reflect</span>
                  {reflectionQuestions.map((q, i) => (
                    <p key={i} className="font-serif italic text-lg mb-3" style={{ color: '#1A1209' }}>{i + 1}. {q}</p>
                  ))}
                </div>
              )}

              {/* Closing prayer */}
              {todayDevotional.closing_prayer && (
                <div className="mx-6 sm:mx-10 my-8 rounded-2xl px-8 py-6" style={{ background: '#FDFAF5', border: '1px solid #EDE8DC' }}>
                  <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4" style={{ color: '#C9A84C' }}>A Prayer For You</span>
                  <p className="font-serif italic font-light text-lg" style={{ color: '#1A1209', lineHeight: 1.8 }}>{todayDevotional.closing_prayer}</p>
                </div>
              )}

              {/* Reactions row */}
              <div className="px-6 sm:px-10 py-6 flex flex-wrap gap-4" style={{ borderTop: '1px solid #EDE8DC' }}>
                {[
                  { key: 'amen', emoji: '🙏', label: 'Amen' },
                  { key: 'touched', emoji: '❤️', label: 'Touched' },
                  { key: 'enlightened', emoji: '💡', label: 'Enlightened' },
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => toggleReaction(r.key)}
                    className="rounded-full px-5 py-2 flex items-center gap-2 font-sans text-sm transition-all duration-200"
                    style={{
                      border: `1px solid ${reactions[r.key] ? '#C9A84C' : '#EDE8DC'}`,
                      background: reactions[r.key] ? '#C9A84C' : 'transparent',
                      color: reactions[r.key] ? '#FFFFFF' : '#7A6E62',
                    }}
                  >
                    {r.emoji} {r.label} · {counts[r.key]}
                  </button>
                ))}
              </div>

              {/* Ko-fi support */}
              <div className="mx-6 sm:mx-10 my-8 text-center pt-8" style={{ borderTop: '1px solid #EDE8DC' }}>
                <svg width="16" height="22" viewBox="0 0 10 14" fill="none" className="mx-auto mb-3">
                  <path d="M5 0V14M1 4H9" stroke="#C9A84C" strokeWidth="1" />
                </svg>
                <p className="font-sans text-sm leading-relaxed max-w-md mx-auto mt-3" style={{ color: '#7A6E62' }}>
                  This devotional is a gift to you, freely given. If it has blessed your day, consider supporting our mission so we can continue serving believers worldwide.
                </p>
                <a
                  href={kofiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-8 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-all duration-200"
                  style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C9A84C'; }}
                >
                  Support This Ministry
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20" style={{ background: '#FFFFFF' }}>
          <div className="text-center py-20">
            <p className="font-serif italic text-2xl" style={{ color: '#7A6E62' }}>
              No devotional available today. Check back tomorrow.
            </p>
          </div>
        </section>
      )}

      {/* DEVOTIONAL ARCHIVE */}
      {archiveDevotionals.length > 0 && (
        <section className="py-20" style={{ background: '#FDFAF5' }}>
          <div ref={archiveRef} className="max-w-6xl mx-auto px-8">
            <h2 className="font-serif font-light text-4xl mb-12" style={{ color: '#1A1209' }}>
              Previous Devotionals
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archiveDevotionals.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={archiveInView ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
                  style={{ border: '1px solid #EDE8DC', minHeight: '220px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#EDE8DC'; }}
                >
                  <span className="block font-sans text-xs uppercase tracking-widest mb-2" style={{ color: '#7A6E62' }}>
                    {new Date(d.published_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: '#1A1209' }}>{d.title}</h3>
                  {d.verse_reference && (
                    <span className="block font-sans text-xs italic mb-3" style={{ color: '#C9A84C' }}>{d.verse_reference}</span>
                  )}
                  <p className="font-sans text-sm leading-relaxed line-clamp-3" style={{ color: '#7A6E62' }}>{d.content.substring(0, 150)}...</p>
                  <span className="block font-sans text-xs uppercase tracking-widest mt-4" style={{ color: '#C9A84C' }}>Read →</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
