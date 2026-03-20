import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

function getPlanDay() {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return ((dayOfYear - 1) % 365) + 1;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null }>({ full_name: null, avatar_url: null });
  const [loading, setLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [prayerCount, setPrayerCount] = useState(0);
  const [devotionalsRead, setDevotionalsRead] = useState(0);
  const [todayPlan, setTodayPlan] = useState<{ old_testament: string | null; new_testament: string | null; psalm: string | null } | null>(null);
  const [savedDevotionals, setSavedDevotionals] = useState<{ title: string; published_date: string }[]>([]);
  const [recentPrayers, setRecentPrayers] = useState<{ id: string; content: string; created_at: string }[]>([]);

  const planDay = getPlanDay();

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [profileRes, progressRes, streakRes, prayerRes, devReadRes, planRes, savedRes, recentPrayersRes] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
        supabase.from('bible_plan_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bible_plan_progress').select('completed_at').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(365),
        supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('devotional_reactions').select('devotional_id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bible_plan').select('old_testament, new_testament, psalm').eq('day_number', planDay).maybeSingle(),
        supabase.from('saved_devotionals').select('devotional_id, created_at, devotionals(title, published_date)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('prayer_requests').select('id, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      setCompletedDays(progressRes.count ?? 0);
      setPrayerCount(prayerRes.count ?? 0);
      setDevotionalsRead(devReadRes.count ?? 0);
      setTodayPlan(planRes.data);
      setRecentPrayers(recentPrayersRes.data || []);

      if (streakRes.data && streakRes.data.length > 0) {
        let s = 0;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        for (let i = 0; i < streakRes.data.length; i++) {
          const d = new Date(streakRes.data[i].completed_at!);
          d.setHours(0, 0, 0, 0);
          const diff = Math.round((now.getTime() - d.getTime()) / 86400000);
          if (diff === i) s++;
          else break;
        }
        setStreak(s);
      }

      if (savedRes.data) {
        setSavedDevotionals(savedRes.data.map((s: any) => ({
          title: s.devotionals?.title || 'Untitled',
          published_date: s.devotionals?.published_date || '',
        })));
      }

      setLoading(false);
    };
    fetchAll();
  }, [user, planDay]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const readings = [
    { category: 'OLD TESTAMENT', passage: todayPlan?.old_testament },
    { category: 'NEW TESTAMENT', passage: todayPlan?.new_testament },
    { category: 'PSALMS', passage: todayPlan?.psalm },
  ].filter(r => r.passage);

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF5' }}>
      <Navbar />

      {/* HEADER */}
      <section className="pt-24 pb-12 md:pt-28 md:pb-14" style={{ background: '#0F0A04' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-between"
          >
            <div>
              <p className="font-sans text-sm" style={{ color: '#7A6E62' }}>{greeting}</p>
              <h1 className="font-serif font-light text-4xl sm:text-5xl mt-1" style={{ color: '#FDFAF5' }}>
                {profile.full_name || 'Friend'}
              </h1>
              <p className="font-sans text-sm mt-2" style={{ color: '#4A4035' }}>Welcome back to CrossAlliance.</p>
            </div>
            <div className="hidden sm:block">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A84C]" />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C] flex items-center justify-center" style={{ background: '#1A1209' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A6E62" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-t-[#C9A84C] border-[#EDE8DC] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* STATS ROW */}
          <section className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'BIBLE PLAN',
                  value: `Day ${completedDays}`,
                  sub: 'of 365 days',
                  progress: completedDays / 365,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                      <path d="M4 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" />
                      <path d="M11 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" />
                    </svg>
                  ),
                },
                {
                  label: 'READING STREAK',
                  value: `${streak} Days`,
                  sub: streak > 0 ? 'Keep it up!' : 'Start today!',
                  progress: null,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                      <path d="M12 2c0 4-4 6-4 10a4 4 0 008 0c0-4-4-6-4-10z" />
                    </svg>
                  ),
                },
                {
                  label: 'PRAYERS LIFTED',
                  value: String(prayerCount),
                  sub: 'this month',
                  progress: null,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                      <path d="M12 3C10 3 7 5 7 9c0 3 2 5 3 6l2 2 2-2c1-1 3-3 3-6 0-4-3-6-5-6z" />
                      <path d="M8 17l-3 4M16 17l3 4" />
                    </svg>
                  ),
                },
                {
                  label: 'DEVOTIONALS READ',
                  value: String(devotionalsRead),
                  sub: 'total',
                  progress: null,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  ),
                },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-white rounded-2xl p-5 border border-[#EDE8DC] relative overflow-hidden group hover:shadow-md hover:border-[#C9A84C] transition-all duration-200"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />
                  <span className="absolute top-4 right-4 opacity-30">{s.icon}</span>
                  <span className="block font-sans text-[10px] uppercase tracking-widest" style={{ color: '#7A6E62' }}>{s.label}</span>
                  <span className="block font-serif text-3xl mt-1" style={{ color: '#C9A84C' }}>{s.value}</span>
                  <span className="block font-sans text-xs mt-1" style={{ color: '#7A6E62' }}>{s.sub}</span>
                  {s.progress !== null && (
                    <div className="mt-3 h-1 rounded-full" style={{ background: '#EDE8DC' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(s.progress * 100, 100)}%`, background: '#C9A84C' }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* MAIN CONTENT */}
          <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-2 space-y-6">
                {/* Today's Bible Plan */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-[#EDE8DC]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#C9A84C' }}>Today's Reading</span>
                    <span className="font-serif text-xl" style={{ color: '#C9A84C' }}>Day {planDay}</span>
                  </div>
                  {readings.length > 0 ? (
                    <div>
                      {readings.map((r, i) => (
                        <div key={i} className={`flex items-center gap-3 py-3 ${i < readings.length - 1 ? 'border-b border-[#EDE8DC]' : ''}`}>
                          <span className="font-sans text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-[#EDE8DC] shrink-0" style={{ color: '#7A6E62', background: '#FDFAF5' }}>
                            {r.category}
                          </span>
                          <span className="font-serif text-lg flex-1" style={{ color: '#1A1209' }}>{r.passage}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-sans text-sm italic" style={{ color: '#7A6E62' }}>No reading data for today.</p>
                  )}
                  <Link to="/bible-plan" className="inline-block font-sans text-xs uppercase tracking-widest mt-4 hover:underline" style={{ color: '#C9A84C' }}>
                    View Full Bible Plan →
                  </Link>
                </motion.div>

                {/* Recent Prayer Activity */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-[#EDE8DC]"
                >
                  <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4" style={{ color: '#C9A84C' }}>My Prayers</span>
                  {recentPrayers.length > 0 ? (
                    <div>
                      {recentPrayers.map((p, i) => (
                        <div key={p.id} className={`py-2 ${i < recentPrayers.length - 1 ? 'border-b border-[#EDE8DC]' : ''}`}>
                          <p className="font-sans text-sm line-clamp-2" style={{ color: '#7A6E62' }}>{p.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-sans text-sm italic" style={{ color: '#7A6E62' }}>You haven't lifted any prayers yet.</p>
                  )}
                  <Link to="/prayer-room" className="inline-block font-sans text-xs uppercase tracking-widest mt-4 hover:underline" style={{ color: '#C9A84C' }}>
                    Go to Prayer Room →
                  </Link>
                </motion.div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-[#EDE8DC]"
                >
                  <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4" style={{ color: '#C9A84C' }}>Quick Actions</span>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Read Today's Devotional", href: '/devotional', icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                          <path d="M4 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" />
                          <path d="M11 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" />
                        </svg>
                      )},
                      { label: 'Lift a Prayer', href: '/prayer-room', icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                          <path d="M12 3C10 3 7 5 7 9c0 3 2 5 3 6l2 2 2-2c1-1 3-3 3-6 0-4-3-6-5-6z" />
                          <path d="M8 17l-3 4M16 17l3 4" />
                        </svg>
                      )},
                      { label: 'Bible Plan', href: '/bible-plan', icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M3 10h18M8 2v4M16 2v4" />
                        </svg>
                      )},
                      { label: 'Browse Shop', href: '/shop', icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
                          <path d="M6 2h12l3 5H3l3-5z" />
                          <rect x="3" y="7" width="18" height="14" rx="1" />
                          <path d="M9 7v4a3 3 0 006 0V7" />
                        </svg>
                      )},
                    ].map((action) => (
                      <Link
                        key={action.label}
                        to={action.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#EDE8DC] font-sans text-sm hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all duration-200"
                        style={{ color: '#1A1209' }}
                      >
                        {action.icon}
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Saved Devotionals */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-[#EDE8DC]"
                >
                  <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4" style={{ color: '#C9A84C' }}>Saved Devotionals</span>
                  {savedDevotionals.length > 0 ? (
                    <div className="space-y-3">
                      {savedDevotionals.map((d, i) => (
                        <div key={i}>
                          <span className="block font-serif text-base font-medium" style={{ color: '#1A1209' }}>{d.title}</span>
                          <span className="block font-sans text-xs" style={{ color: '#7A6E62' }}>
                            {d.published_date ? new Date(d.published_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                          </span>
                          <Link to="/devotional" className="font-sans text-xs hover:underline" style={{ color: '#C9A84C' }}>Read →</Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-sans text-sm italic" style={{ color: '#7A6E62' }}>No saved devotionals yet.</p>
                  )}
                  <Link to="/devotional" className="inline-block font-sans text-xs uppercase tracking-widest mt-4 hover:underline" style={{ color: '#C9A84C' }}>
                    View All →
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Account Settings link */}
            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #C9A84C' }}>
              <Link
                to="/settings"
                className="font-sans text-xs uppercase tracking-widest transition-colors duration-200 hover:text-[#C9A84C]"
                style={{ color: '#7A6E62' }}
              >
                Account Settings
              </Link>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}