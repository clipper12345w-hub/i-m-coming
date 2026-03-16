import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const struggleBible: Record<string, string[]> = {
  Lust: ["1 Corinthians 6", "Matthew 5", "Job 31", "1 Thessalonians 4", "Romans 6", "Galatians 5", "Proverbs 6", "James 1", "Colossians 3", "Hebrews 13", "1 Peter 2", "Song of Solomon 2", "Psalm 119", "2 Timothy 2", "Philippians 4"],
  Gluttony: ["Proverbs 23", "1 Corinthians 10", "Philippians 3", "Romans 13", "Luke 21", "Proverbs 25", "Daniel 1", "Matthew 6", "1 Corinthians 6", "Galatians 5", "Psalm 78", "Ecclesiastes 6", "Isaiah 55", "John 6", "Titus 1"],
  Pride: ["Proverbs 16", "James 4", "1 Peter 5", "Philippians 2", "Isaiah 14", "Luke 14", "Romans 12", "Matthew 23", "Micah 6", "Daniel 4", "Psalm 10", "Obadiah 1", "Isaiah 2", "Luke 18", "Proverbs 11"],
  Envy: ["Proverbs 14", "James 3", "Galatians 5", "1 Corinthians 13", "Romans 13", "Psalm 37", "Proverbs 23", "1 Peter 2", "Matthew 20", "Numbers 11", "Genesis 37", "Luke 15", "Philippians 4", "Hebrews 13", "Job 5"],
  Sloth: ["Proverbs 6", "Colossians 3", "2 Thessalonians 3", "Ecclesiastes 9", "Romans 12", "Proverbs 12", "Matthew 25", "Hebrews 6", "1 Corinthians 15", "Proverbs 10", "Luke 19", "Galatians 6", "James 2", "Proverbs 18", "Nehemiah 4"],
  Wrath: ["James 1", "Proverbs 15", "Ephesians 4", "Matthew 5", "Romans 12", "Colossians 3", "Proverbs 22", "Psalm 37", "1 Peter 3", "Luke 6", "Genesis 4", "Jonah 4", "Proverbs 19", "Matthew 18", "Hebrews 12"],
  Greed: ["1 Timothy 6", "Luke 12", "Proverbs 11", "Ecclesiastes 5", "Matthew 6", "Hebrews 13", "Colossians 3", "Luke 16", "Proverbs 28", "Mark 10", "Exodus 20", "Psalm 49", "Acts 2", "2 Corinthians 9", "Malachi 3"],
  Dishonesty: ["Proverbs 12", "Colossians 3", "Ephesians 4", "Psalm 15", "Zechariah 8", "Proverbs 19", "John 8", "Leviticus 19", "Luke 16", "Revelation 21", "Proverbs 6", "Acts 5", "Proverbs 11", "Romans 12", "Matthew 5"],
  Gossip: ["Proverbs 11", "James 3", "Ephesians 4", "Proverbs 16", "1 Timothy 5", "Psalm 34", "Romans 1", "Leviticus 19", "Matthew 12", "Proverbs 20", "Titus 3", "2 Corinthians 12", "Proverbs 26", "Luke 6", "Colossians 4"],
  "Lack of Gratitude": ["Psalm 100", "1 Thessalonians 5", "Philippians 4", "Colossians 3", "Luke 17", "Psalm 107", "Ephesians 5", "Romans 1", "Deuteronomy 8", "Psalm 136", "2 Corinthians 4", "Hebrews 12", "Psalm 103", "Jonah 2", "Daniel 6"],
  Disobedience: ["Romans 13", "1 Samuel 15", "John 14", "Hebrews 13", "Proverbs 3", "Deuteronomy 11", "Acts 5", "James 1", "Matthew 7", "Luke 11", "1 Peter 1", "Exodus 20", "Isaiah 1", "Jeremiah 7", "Psalm 119"],
  Judging: ["Matthew 7", "Romans 14", "James 4", "Luke 6", "John 8", "1 Corinthians 4", "Romans 2", "Colossians 2", "James 2", "Matthew 23", "Luke 18", "1 Samuel 16", "Galatians 6", "Romans 15", "Proverbs 31"],
  Hypocrisy: ["Matthew 23", "Luke 12", "James 1", "Romans 2", "Isaiah 29", "Mark 7", "Titus 1", "1 John 1", "Matthew 6", "Luke 6", "2 Timothy 3", "Ezekiel 33", "Psalm 51", "Proverbs 20", "Matthew 15"],
};

const struggleNames = Object.keys(struggleBible);
const dayOptions = [7, 10, 15, 20, 25, 30];

function generatePlan(days: number, struggles: string[]) {
  const plan: { day: number; passage: string; struggle: string }[] = [];
  const passageIndexes: Record<string, number> = {};
  struggles.forEach(s => { passageIndexes[s] = 0; });
  let poolIndex = 0;

  while (plan.length < days) {
    const struggle = struggles[poolIndex % struggles.length];
    const idx = passageIndexes[struggle];
    if (idx < struggleBible[struggle].length) {
      plan.push({ day: plan.length + 1, passage: struggleBible[struggle][idx], struggle });
      passageIndexes[struggle]++;
    }
    poolIndex++;
    if (plan.length < days && struggles.every(s => passageIndexes[s] >= struggleBible[s].length)) {
      struggles.forEach(s => { passageIndexes[s] = 0; });
    }
  }
  return plan;
}

const weekDayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getDayOfYear(d: Date = new Date()) {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
}

function getPlanDay(d: Date = new Date()) {
  return ((getDayOfYear(d) - 1) % 365) + 1;
}

export default function BiblePlan() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'struggle' | 'full'>('struggle');

  // Tab 1 state
  const [selectedDays, setSelectedDays] = useState(7);
  const [selectedStruggles, setSelectedStruggles] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<{ day: number; passage: string; struggle: string }[] | null>(null);

  // Tab 2 state
  const planDay = getPlanDay();
  const [selectedWeekDay, setSelectedWeekDay] = useState(planDay);
  const [checkedSections, setCheckedSections] = useState<Record<string, boolean>>({});
  const [todayReading, setTodayReading] = useState<{ old_testament: string | null; new_testament: string | null; psalm: string | null } | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [completedDays, setCompletedDays] = useState(0);
  const [weekCompletedDays, setWeekCompletedDays] = useState<Set<number>>(new Set());
  const [progressId, setProgressId] = useState<string | null>(null);

  const toggleStruggle = (s: string) => {
    setSelectedStruggles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setGeneratedPlan(null);
  };

  const handleGenerate = () => {
    if (selectedStruggles.length === 0) return;
    setGeneratedPlan(generatePlan(selectedDays, selectedStruggles));
  };

  // Fetch reading for selected day
  useEffect(() => {
    if (activeTab !== 'full') return;
    setReadingLoading(true);
    supabase.from('bible_plan').select('old_testament, new_testament, psalm').eq('day_number', selectedWeekDay).maybeSingle()
      .then(({ data }) => {
        setTodayReading(data);
        setReadingLoading(false);
      });
  }, [selectedWeekDay, activeTab]);

  // Fetch progress
  useEffect(() => {
    if (!user || activeTab !== 'full') return;

    // Total completed
    supabase.from('bible_plan_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      .then(({ count }) => setCompletedDays(count ?? 0));

    // Check if current selected day is completed
    supabase.from('bible_plan_progress').select('id').eq('user_id', user.id).eq('day_number', selectedWeekDay).maybeSingle()
      .then(({ data }) => setProgressId(data?.id ?? null));

    // Week progress
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const weekDayNums = Array.from({ length: 7 }, (_, i) => {
      const diff = i - currentDayOfWeek;
      return getPlanDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff));
    });
    supabase.from('bible_plan_progress').select('day_number').eq('user_id', user.id).in('day_number', weekDayNums)
      .then(({ data }) => {
        setWeekCompletedDays(new Set(data?.map(d => d.day_number) || []));
      });
  }, [user, activeTab, selectedWeekDay]);

  const toggleMarkAsRead = async () => {
    if (!user) return;
    if (progressId) {
      await supabase.from('bible_plan_progress').delete().eq('id', progressId);
      setProgressId(null);
      setCompletedDays(prev => prev - 1);
      setWeekCompletedDays(prev => { const n = new Set(prev); n.delete(selectedWeekDay); return n; });
    } else {
      const { data } = await supabase.from('bible_plan_progress').insert({
        user_id: user.id,
        day_number: selectedWeekDay,
        completed_at: new Date().toISOString(),
      }).select('id').single();
      if (data) setProgressId(data.id);
      setCompletedDays(prev => prev + 1);
      setWeekCompletedDays(prev => new Set(prev).add(selectedWeekDay));
    }
  };

  // Week overview for Tab 2
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const diff = i - currentDayOfWeek;
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
      const dayNum = getPlanDay(d);
      return {
        label: weekDayLabels[i],
        planDay: dayNum,
        isToday: i === currentDayOfWeek,
        isPast: i < currentDayOfWeek,
        isCompleted: weekCompletedDays.has(dayNum),
      };
    });
  }, [planDay, currentDayOfWeek, weekCompletedDays]);

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
          <span className="block font-sans text-xs uppercase tracking-[0.25em] mb-4" style={{ color: '#C9A84C' }}>Grow in the Word</span>
          <h1 className="font-serif font-light text-6xl" style={{ color: '#FDFAF5' }}>Bible Plan</h1>
          <p className="font-sans text-base mt-4" style={{ color: '#7A6E62' }}>Two ways to read. One goal: knowing God more.</p>
        </motion.div>
      </section>

      {/* TAB NAVIGATION */}
      <div className="sticky top-0 z-20 bg-white" style={{ borderBottom: '1px solid #EDE8DC' }}>
        <div className="max-w-6xl mx-auto px-8 flex">
          {[
            { key: 'struggle' as const, label: 'Read by Struggle' },
            { key: 'full' as const, label: 'Full Bible Plan' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="font-sans text-sm uppercase tracking-[0.15em] px-8 py-5 cursor-pointer transition-colors duration-200"
              style={{
                color: activeTab === tab.key ? '#1A1209' : '#7A6E62',
                borderBottom: activeTab === tab.key ? '2px solid #C9A84C' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: READ BY STRUGGLE */}
      {activeTab === 'struggle' && (
        <section className="py-16 max-w-4xl mx-auto px-8">
          {/* Step 1 */}
          <h2 className="font-serif font-light text-3xl" style={{ color: '#1A1209' }}>How many days?</h2>
          <p className="font-sans text-sm mt-2 mb-8" style={{ color: '#7A6E62' }}>Choose the length of your reading plan.</p>
          <div className="flex flex-wrap gap-3">
            {dayOptions.map(d => (
              <button
                key={d}
                onClick={() => { setSelectedDays(d); setGeneratedPlan(null); }}
                className="rounded-full px-6 py-2 font-sans text-sm cursor-pointer transition-all duration-200"
                style={{
                  background: selectedDays === d ? '#C9A84C' : 'transparent',
                  color: selectedDays === d ? '#FFFFFF' : '#7A6E62',
                  border: `1px solid ${selectedDays === d ? '#C9A84C' : '#EDE8DC'}`,
                }}
                onMouseEnter={e => { if (selectedDays !== d) { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; } }}
                onMouseLeave={e => { if (selectedDays !== d) { e.currentTarget.style.borderColor = '#EDE8DC'; e.currentTarget.style.color = '#7A6E62'; } }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Step 2 */}
          <h2 className="font-serif font-light text-3xl mt-12" style={{ color: '#1A1209' }}>What do you struggle with most?</h2>
          <p className="font-sans text-sm mt-2 mb-8" style={{ color: '#7A6E62' }}>Select one or more. Your plan will be tailored accordingly.</p>
          <div className="flex flex-wrap gap-3">
            {struggleNames.map(s => {
              const selected = selectedStruggles.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStruggle(s)}
                  className="rounded-full px-5 py-2 font-sans text-sm cursor-pointer transition-all duration-200"
                  style={{
                    background: selected ? '#1A1209' : 'transparent',
                    color: selected ? '#FFFFFF' : '#7A6E62',
                    border: `1px solid ${selected ? '#1A1209' : '#EDE8DC'}`,
                  }}
                  onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; } }}
                  onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#EDE8DC'; e.currentTarget.style.color = '#7A6E62'; } }}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={selectedStruggles.length === 0}
            className="mt-12 px-12 py-4 font-sans text-xs uppercase tracking-[0.25em] text-white transition-colors duration-200"
            style={{
              background: '#C9A84C',
              opacity: selectedStruggles.length === 0 ? 0.5 : 1,
              cursor: selectedStruggles.length === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (selectedStruggles.length > 0) e.currentTarget.style.background = '#b8973f'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C9A84C'; }}
          >
            Generate My Reading Plan
          </button>

          {/* Generated plan */}
          {generatedPlan && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-serif font-light text-3xl mt-12 mb-2" style={{ color: '#1A1209' }}>
                Your {selectedDays}-Day Reading Plan
              </h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedStruggles.map(s => (
                  <span key={s} className="font-sans text-xs uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: '#C9A84C', color: '#FFFFFF' }}>{s}</span>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                {generatedPlan.map(item => (
                  <div key={item.day} className="bg-white rounded-xl px-6 py-4 flex items-center gap-6" style={{ border: '1px solid #EDE8DC' }}>
                    <span className="font-serif text-2xl min-w-[60px]" style={{ color: '#C9A84C' }}>Day {item.day}</span>
                    <div className="w-px h-8" style={{ background: '#EDE8DC' }} />
                    <span className="font-sans text-base font-medium" style={{ color: '#1A1209' }}>{item.passage}</span>
                    <span className="font-sans text-xs uppercase tracking-widest ml-auto opacity-60" style={{ color: '#7A6E62' }}>{item.struggle}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                {user ? (
                  <button
                    className="px-8 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-all duration-200"
                    style={{ border: '1px solid #C9A84C', color: '#C9A84C' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#FFFFFF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C9A84C'; }}
                  >
                    Save This Plan
                  </button>
                ) : (
                  <a href="/login" className="font-sans text-sm underline" style={{ color: '#C9A84C' }}>Sign in to save your plan</a>
                )}
              </div>
            </motion.div>
          )}
        </section>
      )}

      {/* TAB 2: FULL BIBLE PLAN */}
      {activeTab === 'full' && (
        <section className="py-16 max-w-4xl mx-auto px-8">
          {/* Today's reading */}
          <div className="bg-white rounded-2xl p-8 relative overflow-hidden mb-12" style={{ border: '1px solid #EDE8DC' }}>
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />
            <span className="block font-sans text-xs uppercase tracking-[0.25em] mb-2" style={{ color: '#C9A84C' }}>Today's Reading</span>
            <h2 className="font-serif font-light text-4xl mb-6" style={{ color: '#1A1209' }}>Day {selectedWeekDay} of 365</h2>

            {readingLoading ? (
              <div className="flex justify-center py-8">
                <div className="border-t-[#C9A84C] rounded-full w-6 h-6 animate-spin border-2 border-transparent" />
              </div>
            ) : todayReading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'OLD TESTAMENT', passage: todayReading.old_testament, key: 'ot' },
                  { label: 'NEW TESTAMENT', passage: todayReading.new_testament, key: 'nt' },
                  { label: 'PSALMS & PROVERBS', passage: todayReading.psalm, key: 'ps' },
                ].map(section => (
                  <div key={section.key} className="rounded-xl p-4" style={{ background: '#FDFAF5', border: '1px solid #EDE8DC' }}>
                    <span className="block font-sans uppercase tracking-widest mb-2" style={{ fontSize: '10px', color: '#C9A84C' }}>{section.label}</span>
                    <span className="block font-serif text-lg font-semibold" style={{ color: '#1A1209' }}>{section.passage || '—'}</span>
                    {user && (
                      <label className="flex items-center gap-2 mt-3 cursor-pointer">
                        <div
                          onClick={toggleMarkAsRead}
                          className="w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-colors duration-200"
                          style={{
                            border: `1px solid ${progressId ? '#C9A84C' : '#EDE8DC'}`,
                            background: progressId ? '#C9A84C' : 'transparent',
                          }}
                        >
                          {progressId && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="font-sans text-xs" style={{ color: '#7A6E62' }}>Mark as read</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-serif italic text-lg" style={{ color: '#7A6E62' }}>Bible plan content coming soon.</p>
            )}
          </div>

          {/* Progress bar */}
          {user && (
            <div className="mt-8">
              <div className="flex justify-between">
                <span className="font-sans text-xs" style={{ color: '#7A6E62' }}>Your Progress</span>
                <span className="font-sans text-xs" style={{ color: '#7A6E62' }}>{completedDays} of 365 days</span>
              </div>
              <div className="h-2 rounded-full mt-2" style={{ background: '#EDE8DC' }}>
                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(completedDays / 365) * 100}%`, background: '#C9A84C' }} />
              </div>
              <span className="block font-sans text-xs mt-2" style={{ color: '#7A6E62' }}>{Math.round((completedDays / 365) * 100)}% complete this year</span>
            </div>
          )}

          {/* Weekly overview */}
          <h3 className="font-serif font-light text-3xl mt-12 mb-8" style={{ color: '#1A1209' }}>This Week</h3>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {weekData.map((wd, i) => (
              <button
                key={i}
                onClick={() => setSelectedWeekDay(wd.planDay)}
                className="rounded-xl p-3 text-center cursor-pointer transition-all duration-200"
                style={{
                  background: wd.isToday ? '#FDFAF5' : '#FFFFFF',
                  border: `1px solid ${wd.isToday ? '#C9A84C' : '#EDE8DC'}`,
                }}
              >
                <span className="block font-sans uppercase tracking-widest" style={{ fontSize: '10px', color: '#7A6E62' }}>{wd.label}</span>
                <span className="block font-serif text-lg" style={{ color: '#1A1209' }}>{wd.planDay}</span>
                <div
                  className="w-2 h-2 rounded-full mx-auto mt-1"
                  style={{ background: wd.isCompleted ? '#C9A84C' : wd.isToday ? '#1A1209' : '#EDE8DC' }}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
