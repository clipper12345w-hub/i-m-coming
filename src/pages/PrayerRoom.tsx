import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Prayer {
  id: string;
  content: string;
  is_anonymous: boolean | null;
  prayer_count: number | null;
  created_at: string;
  user_id: string | null;
  display_name?: string | null;
}

interface PrayerComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  display_name?: string | null;
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function PrayerRoom() {
  const { user } = useAuth();
  const [prayerText, setPrayerText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, PrayerComment[]>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const { ref: listRef, isInView: listInView } = useScrollReveal();

  const PAGE_SIZE = 10;

  const fetchPrayers = useCallback(async (offset = 0) => {
    const { data, error } = await supabase
      .from('prayer_requests_public')
      .select('id, content, is_anonymous, prayer_count, created_at, user_id')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) return [];
    
    // Fetch display names for non-anonymous prayers
    const nonAnonIds = (data || []).filter(p => !p.is_anonymous && p.user_id).map(p => p.user_id!);
    let profileMap: Record<string, string> = {};
    if (nonAnonIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', nonAnonIds);
      profiles?.forEach(p => { profileMap[p.id] = p.full_name || 'A Believer'; });
    }

    return (data || []).map(p => ({
      ...p,
      display_name: p.is_anonymous ? 'Anonymous' : (p.user_id ? profileMap[p.user_id] || 'A Believer' : 'A Believer'),
    }));
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const [prayerData, countRes] = await Promise.all([
        fetchPrayers(0),
        supabase.from('prayer_requests').select('*', { count: 'exact', head: true }),
      ]);
      setPrayers(prayerData);
      setTotalCount(countRes.count ?? 0);
      setHasMore(prayerData.length === PAGE_SIZE);
      setLoading(false);
    };
    init();
  }, [fetchPrayers]);

  // Fetch user's existing reactions
  useEffect(() => {
    if (!user || prayers.length === 0) return;
    const ids = prayers.map(p => p.id);
    supabase.from('prayer_reactions').select('prayer_request_id').eq('user_id', user.id).in('prayer_request_id', ids)
      .then(({ data }) => {
        const set = new Set<string>();
        data?.forEach(r => set.add(r.prayer_request_id));
        setPrayedIds(set);
      });
  }, [user, prayers]);

  const loadMore = async () => {
    setLoadingMore(true);
    const more = await fetchPrayers(prayers.length);
    setPrayers(prev => [...prev, ...more]);
    setHasMore(more.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const handleSubmit = async () => {
    if (!prayerText.trim() || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from('prayer_requests').insert({
      content: prayerText.trim(),
      is_anonymous: isAnonymous,
      user_id: user.id,
    });
    setSubmitting(false);
    if (!error) {
      setPrayerText('');
      toast({ title: "Your prayer has been lifted 🙏", description: "The community stands with you.", className: "bg-[#C9A84C] text-white border-none" });
      // Refresh list
      const fresh = await fetchPrayers(0);
      setPrayers(fresh);
      setTotalCount(prev => prev + 1);
    }
  };

  const togglePray = async (prayer: Prayer) => {
    if (!user) return;
    const id = prayer.id;
    const wasPrayed = prayedIds.has(id);

    // Optimistic
    const newSet = new Set(prayedIds);
    if (wasPrayed) newSet.delete(id); else newSet.add(id);
    setPrayedIds(newSet);
    setLocalCounts(prev => ({ ...prev, [id]: (prev[id] ?? 0) + (wasPrayed ? -1 : 1) }));

    if (wasPrayed) {
      await supabase.from('prayer_reactions').delete().eq('prayer_request_id', id).eq('user_id', user.id);
    } else {
      await supabase.from('prayer_reactions').insert({ prayer_request_id: id, user_id: user.id });
    }
  };

  const toggleComments = async (prayerId: string) => {
    const newSet = new Set(expandedComments);
    if (newSet.has(prayerId)) {
      newSet.delete(prayerId);
    } else {
      newSet.add(prayerId);
      // Fetch comments if not loaded
      if (!comments[prayerId]) {
        const { data } = await supabase
          .from('prayer_comments_public')
          .select('*')
          .eq('prayer_request_id', prayerId)
          .order('created_at', { ascending: true });
        setComments(prev => ({ ...prev, [prayerId]: (data || []).map(c => ({ ...c, id: c.id!, content: c.content!, created_at: c.created_at!, user_id: c.user_id!, display_name: c.display_name })) }));
        setCommentCounts(prev => ({ ...prev, [prayerId]: data?.length || 0 }));
      }
    }
    setExpandedComments(newSet);
  };

  const submitComment = async (prayerId: string) => {
    const text = commentTexts[prayerId]?.trim();
    if (!text || !user) return;
    const { error } = await supabase.from('prayer_comments').insert({
      prayer_request_id: prayerId,
      user_id: user.id,
      content: text,
    });
    if (!error) {
      const newComment: PrayerComment = {
        id: crypto.randomUUID(),
        content: text,
        created_at: new Date().toISOString(),
        user_id: user.id,
        display_name: user.user_metadata?.full_name || 'You',
      };
      setComments(prev => ({ ...prev, [prayerId]: [...(prev[prayerId] || []), newComment] }));
      setCommentCounts(prev => ({ ...prev, [prayerId]: (prev[prayerId] || 0) + 1 }));
      setCommentTexts(prev => ({ ...prev, [prayerId]: '' }));
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
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
        <div className="relative z-10 text-center px-8">
          <span className="block font-sans text-xs uppercase tracking-[0.25em] mb-4" style={{ color: '#C9A84C' }}>Community Prayer</span>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="font-serif font-light text-6xl"
            style={{ color: '#FDFAF5' }}
          >
            Prayer Room
          </motion.h1>
          <p className="font-sans text-base mt-4" style={{ color: '#7A6E62' }}>
            You are not alone. Thousands are lifting prayers right now.
          </p>
        </div>
      </section>

      {/* SUBMIT PRAYER */}
      <section className="py-16" style={{ background: '#FFFFFF' }}>
        <div className="max-w-2xl mx-auto px-8">
          <div className="relative overflow-hidden rounded-2xl p-8" style={{ border: '1px solid #EDE8DC' }}>
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />

            <h2 className="font-serif font-light text-3xl mb-2" style={{ color: '#1A1209' }}>Add Your Prayer</h2>
            <p className="font-sans text-sm mb-8" style={{ color: '#7A6E62' }}>Share your heart. The community will stand with you.</p>

            <textarea
              value={prayerText}
              onChange={e => setPrayerText(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Share your prayer request..."
              className="w-full rounded-xl px-4 py-3 font-sans text-sm resize-none focus:outline-none focus:ring-2"
              style={{ border: '1px solid #EDE8DC', '--tw-ring-color': '#C9A84C' } as React.CSSProperties}
            />
            <p className="text-right font-sans text-xs mt-1" style={{ color: '#7A6E62' }}>{prayerText.length}/2000</p>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3 mt-4">
              <div
                onClick={() => setIsAnonymous(!isAnonymous)}
                className="relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200"
                style={{ background: isAnonymous ? '#C9A84C' : '#EDE8DC' }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                  style={{ left: isAnonymous ? '26px' : '2px' }}
                />
              </div>
              <span className="font-sans text-sm" style={{ color: '#7A6E62' }}>Post anonymously</span>
            </div>

            {user ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !prayerText.trim()}
                className="w-full py-3 mt-6 font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-200 disabled:opacity-50"
                style={{ background: '#C9A84C', color: '#FFFFFF' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#b8973f'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C9A84C'; }}
              >
                {submitting ? 'Submitting...' : 'Lift This Prayer'}
              </button>
            ) : (
              <Link to="/login" className="block text-center mt-6 font-sans text-sm underline" style={{ color: '#C9A84C' }}>
                Sign in to post a prayer
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* COMMUNITY PRAYERS */}
      <section className="py-16" style={{ background: '#FDFAF5' }}>
        <div ref={listRef} className="max-w-4xl mx-auto px-8">
          <h2 className="font-serif font-light text-4xl mb-4" style={{ color: '#1A1209' }}>Community Prayers</h2>
          <p className="font-sans text-sm mb-12" style={{ color: '#7A6E62' }}><CountUp target={totalCount} /> prayers lifted</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="border-t-[#C9A84C] rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {prayers.map((prayer, i) => {
                const prayed = prayedIds.has(prayer.id);
                const count = (prayer.prayer_count ?? 0) + (localCounts[prayer.id] ?? 0);
                const isExpanded = expandedComments.has(prayer.id);
                const prayerComments = comments[prayer.id] || [];
                const commentCount = commentCounts[prayer.id] || 0;

                return (
                  <motion.div
                    key={prayer.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={listInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="bg-white rounded-2xl px-6 py-5 transition-colors duration-200"
                    style={{ border: '1px solid #EDE8DC' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#EDE8DC'; }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-xs uppercase tracking-widest" style={{ color: '#7A6E62' }}>
                        {prayer.display_name}
                      </span>
                      <span className="font-sans text-xs" style={{ color: '#7A6E62', opacity: 0.6 }}>{timeAgo(prayer.created_at)}</span>
                    </div>

                    <p className="font-sans text-base leading-relaxed mt-2 mb-4" style={{ color: '#1A1209' }}>{prayer.content}</p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <button
                        onClick={() => togglePray(prayer)}
                        className="rounded-full px-4 py-1.5 font-sans text-xs transition-all duration-200"
                        style={{
                          border: `1px solid ${prayed ? '#C9A84C' : '#EDE8DC'}`,
                          background: prayed ? '#C9A84C' : 'transparent',
                          color: prayed ? '#FFFFFF' : '#7A6E62',
                        }}
                      >
                        {prayed ? '✓ Praying' : '🙏 Pray'} · {count}
                      </button>

                      <button
                        onClick={() => toggleComments(prayer.id)}
                        className="font-sans text-xs transition-colors duration-200"
                        style={{ color: '#7A6E62' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#7A6E62'; }}
                      >
                        💬 View Replies ({commentCount})
                      </button>
                    </div>

                    {/* Comment thread */}
                    {isExpanded && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid #EDE8DC' }}>
                        {prayerComments.map(c => (
                          <div key={c.id} className="flex gap-3 mb-3">
                            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#EDE8DC' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A6E62" strokeWidth="2">
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-sans text-xs font-bold" style={{ color: '#1A1209' }}>{c.display_name || 'User'}</span>
                                <span className="font-sans text-xs" style={{ color: '#7A6E62', opacity: 0.6 }}>{timeAgo(c.created_at)}</span>
                              </div>
                              <p className="font-sans text-sm" style={{ color: '#7A6E62' }}>{c.content}</p>
                            </div>
                          </div>
                        ))}

                        {user ? (
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              value={commentTexts[prayer.id] || ''}
                              onChange={e => setCommentTexts(prev => ({ ...prev, [prayer.id]: e.target.value }))}
                              placeholder="Write an encouraging word..."
                              className="flex-1 rounded-xl px-4 py-2 font-sans text-sm focus:outline-none focus:ring-2"
                              style={{ border: '1px solid #EDE8DC', '--tw-ring-color': '#C9A84C' } as React.CSSProperties}
                              onKeyDown={e => { if (e.key === 'Enter') submitComment(prayer.id); }}
                            />
                            <button
                              onClick={() => submitComment(prayer.id)}
                              className="px-4 py-2 font-sans text-xs rounded-lg transition-colors duration-200"
                              style={{ background: '#C9A84C', color: '#FFFFFF' }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#b8973f'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#C9A84C'; }}
                            >
                              Send
                            </button>
                          </div>
                        ) : (
                          <Link to="/login" className="font-sans text-sm underline mt-3 inline-block" style={{ color: '#C9A84C' }}>
                            Sign in to reply
                          </Link>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {hasMore && !loading && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="block mx-auto mt-8 px-8 py-3 rounded-2xl font-sans text-sm transition-all duration-200"
              style={{ border: '1px solid #EDE8DC', color: '#7A6E62' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE8DC'; e.currentTarget.style.color = '#7A6E62'; }}
            >
              {loadingMore ? (
                <div className="border-t-[#C9A84C] rounded-full w-4 h-4 animate-spin border-2 border-transparent mx-auto" />
              ) : 'Load More Prayers'}
            </button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
