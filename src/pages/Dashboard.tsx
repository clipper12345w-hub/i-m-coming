import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function getDayOfYear() {
  const now = new Date();
  return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
}

function getPlanDay() {
  return ((getDayOfYear() - 1) % 365) + 1;
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

      // Calculate streak
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

      // Saved devotionals
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
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
  })();

  const stats = [
    { label: 'Bible Plan Progress', value: `Day ${completedDays}`, sub: 'of 365 days', progress: completedDays / 365 },
    { label: 'Reading Streak', value: `${streak} Day${streak !== 1 ? 's' : ''} 🔥`, sub: streak > 0 ? 'Keep it up!' : 'Start today!', progress: null },
    { label: 'Prayers Lifted', value: String(prayerCount), sub: 'prayers this month', progress: null },
    { label: 'Devotionals Read', value: String(devotionalsRead), sub: 'total devotionals', progress: null },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF5' }}>
      <Navbar />

      {/* HEADER */}
      <section style={{ background: '#0F0A04' }} className="pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-sans text-sm" style={{ color: '#7A6E62' }}>{greeting}</p>
            <h1 className="font-serif font-light text-5xl mt-1" style={{ color: '#FDFAF5' }}>
              {profile.full_name || 'Friend'}
            </h1>
            <p className="font-sans text-base mt-2" style={{ color: '#7A6E62' }}>
              Welcome back to CrossAlliance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS ROW */}
      <section className="max-w-6xl mx-auto px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="border-t-[#C9A84C] rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 relative overflow-hidden" style={{ border: '1px solid #EDE8DC' }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />
                <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-3" style={{ color: '#7A6E62' }}>{s.label}</span>
                <span className="block font-serif text-3xl" style={{ color: '#C9A84C' }}>{s.value}</span>
                <span className="block font-sans text-xs mt-1" style={{ color: '#7A6E62' }}>{s.sub}</span>
                {s.progress !== null && (
                  <div className="mt-3 h-1.5 rounded-full" style={{ background: '#EDE8DC' }}>
                    <div className="h-full rounded-full" style={{ background: '#C9A84C', width: `${s.progress * 100}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT ACTIVITY */}
      <section className="max-w-6xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Continue Reading */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #EDE8DC' }}>
            <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-3" style={{ color: '#C9A84C' }}>Today's Bible Plan</span>
            <span className="block font-serif text-4xl mb-4" style={{ color: '#1A1209' }}>Day {planDay}</span>
            {todayPlan ? (
              <>
                {todayPlan.old_testament && <p className="font-sans text-sm mb-1" style={{ color: '#7A6E62' }}>{todayPlan.old_testament}</p>}
                {todayPlan.new_testament && <p className="font-sans text-sm mb-1" style={{ color: '#7A6E62' }}>{todayPlan.new_testament}</p>}
                {todayPlan.psalm && <p className="font-sans text-sm mb-4" style={{ color: '#7A6E62' }}>{todayPlan.psalm}</p>}
              </>
            ) : (
              <p className="font-sans text-sm mb-4" style={{ color: '#7A6E62' }}>No reading data for today.</p>
            )}
            <a href="/bible-plan" className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#C9A84C' }}>Continue Reading →</a>
          </div>

          {/* Saved Devotionals */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #EDE8DC' }}>
            <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-3" style={{ color: '#C9A84C' }}>Saved Devotionals</span>
            {savedDevotionals.length > 0 ? (
              savedDevotionals.map((d, i) => (
                <div key={i} className="mb-3">
                  <span className="block font-serif text-lg" style={{ color: '#1A1209' }}>{d.title}</span>
                  <span className="block font-sans text-xs" style={{ color: '#7A6E62' }}>
                    {d.published_date ? new Date(d.published_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </span>
                </div>
              ))
            ) : (
              <p className="font-sans text-sm" style={{ color: '#7A6E62' }}>No saved devotionals yet.</p>
            )}
            <a href="/devotional" className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: '#C9A84C' }}>View All →</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
