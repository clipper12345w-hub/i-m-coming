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
  const [profile, setProfile] = useState<{ full_name: string | null }>({ full_name: null });
  const [loading, setLoading] = useState(true);
  const [completedDays, setCompletedDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [prayerCount, setPrayerCount] = useState(0);
  const [devotionalsRead, setDevotionalsRead] = useState(0);
  const [todayPlan, setTodayPlan] = useState<{ old_testament: string | null; new_testament: string | null; psalm: string | null } | null>(null);
  const [savedDevotionals, setSavedDevotionals] = useState<{ title: string; published_date: string }[]>([]);

  const planDay = getPlanDay();

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      const [profileRes, progressRes, streakRes, prayerRes, devReadRes, planRes, savedRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('bible_plan_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bible_plan_progress').select('completed_at').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(365),
        supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('devotional_reactions').select('devotional_id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('bible_plan').select('old_testament, new_testament, psalm').eq('day_number', planDay).maybeSingle(),
        supabase.from('saved_devotionals').select('devotional_id, created_at, devotionals(title, published_date)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      setCompletedDays(progressRes.count ?? 0);
      setPrayerCount(prayerRes.count ?? 0);
      setDevotionalsRead(devReadRes.count ?? 0);
      setTodayPlan(planRes.data);

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

  const stats = [
    {
      label: 'Bible Plan',
      value: `Day ${completedDays}`,
      sub: `of 365 days`,
      progress: completedDays / 365,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" />
          <path d="M11 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" />
        </svg>
      ),
    },
    {
      label: 'Reading Streak',
      value: `${streak}`,
      sub: streak > 0 ? 'days straight 🔥' : 'Start today!',
      progress: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8Z" />
        </svg>
      ),
    },
    {
      label: 'Prayers',
      value: String(prayerCount),
      sub: 'this month',
      progress: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3C10 3 7 5 7 9c0 3 2 5 3 6l2 2 2-2c1-1 3-3 3-6 0-4-3-6-5-6z" />
          <path d="M8 17l-3 4M16 17l3 4" />
        </svg>
      ),
    },
    {
      label: 'Devotionals',
      value: String(devotionalsRead),
      sub: 'read total',
      progress: null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HEADER */}
      <section className="pt-28 pb-14 relative overflow-hidden" style={{ background: 'hsl(var(--dark))' }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--gold) / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--gold) / 0.15) 0%, transparent 40%)`
        }} />
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{greeting}</p>
            <h1 className="font-serif font-light text-4xl sm:text-5xl text-white">
              {profile.full_name || 'Friend'}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <Link to="/bible-plan" className="font-sans text-xs uppercase tracking-[0.2em] px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Continue Reading
              </Link>
              <Link to="/prayer-room" className="font-sans text-xs uppercase tracking-[0.2em] px-5 py-2.5 rounded-lg border border-white/20 text-white/80 hover:border-primary hover:text-primary transition-colors">
                Prayer Room
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 -mt-6 relative z-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="border-t-primary rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-card rounded-2xl p-5 sm:p-6 border border-border relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(to right, transparent, hsl(var(--gold)), transparent)' }} />
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs uppercase tracking-[0.15em] font-sans text-muted-foreground">{s.label}</span>
                  <span className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">{s.icon}</span>
                </div>
                <span className="block font-serif text-3xl sm:text-4xl text-primary">{s.value}</span>
                <span className="block font-sans text-xs mt-1 text-muted-foreground">{s.sub}</span>
                {s.progress !== null && (
                  <div className="mt-3 h-1.5 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min(s.progress * 100, 100)}%` }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CONTENT CARDS */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Today's Bible Plan */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-card rounded-2xl p-6 sm:p-8 border border-border relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04]" style={{
              background: `radial-gradient(circle, hsl(var(--gold)) 0%, transparent 70%)`
            }} />
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-primary">Today's Reading</span>
              <span className="font-serif text-2xl text-primary">Day {planDay}</span>
            </div>
            {todayPlan ? (
              <div className="space-y-2 mb-6">
                {todayPlan.old_testament && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <p className="font-sans text-sm text-muted-foreground">{todayPlan.old_testament}</p>
                  </div>
                )}
                {todayPlan.new_testament && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <p className="font-sans text-sm text-muted-foreground">{todayPlan.new_testament}</p>
                  </div>
                )}
                {todayPlan.psalm && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <p className="font-sans text-sm text-muted-foreground">{todayPlan.psalm}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-sans text-sm mb-6 text-muted-foreground">No reading data for today.</p>
            )}
            <Link to="/bible-plan" className="font-sans text-xs uppercase tracking-[0.2em] text-primary hover:opacity-80 transition-opacity">
              Open Bible Plan →
            </Link>
          </motion.div>

          {/* Saved Devotionals */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-card rounded-2xl p-6 sm:p-8 border border-border"
          >
            <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-5 text-primary">Saved Devotionals</span>
            {savedDevotionals.length > 0 ? (
              <div className="space-y-4 mb-6">
                {savedDevotionals.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--gold))" strokeWidth="1.5">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-serif text-base text-foreground group-hover:text-primary transition-colors">{d.title}</span>
                      <span className="block font-sans text-xs text-muted-foreground">
                        {d.published_date ? new Date(d.published_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-sm text-muted-foreground mb-6">No saved devotionals yet.</p>
            )}
            <Link to="/devotional" className="font-sans text-xs uppercase tracking-[0.2em] text-primary hover:opacity-80 transition-opacity">
              Browse Devotionals →
            </Link>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: 'Bible Plan', href: '/bible-plan', icon: '📖' },
            { label: 'Prayer Room', href: '/prayer-room', icon: '🙏' },
            { label: 'Devotional', href: '/devotional', icon: '✨' },
            { label: 'Shop', href: '/shop', icon: '🛍️' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 text-center group"
            >
              <span className="text-2xl block mb-2">{link.icon}</span>
              <span className="font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground group-hover:text-primary transition-colors">{link.label}</span>
            </Link>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
