import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, prayers: 0, devotionals: 0, products: 0 });
  const [recentPrayers, setRecentPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const planDay = ((dayOfYear - 1) % 365) + 1;
  const daysLeft = 365 - planDay;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersRes, prayersRes, devoRes, productsRes, recentRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('prayer_requests').select('id', { count: 'exact', head: true }),
      supabase.from('devotionals').select('id', { count: 'exact', head: true }).lte('published_date', new Date().toISOString().split('T')[0]),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }).limit(5),
    ]);
    setStats({
      users: usersRes.count || 0,
      prayers: prayersRes.count || 0,
      devotionals: devoRes.count || 0,
      products: productsRes.count || 0,
    });
    setRecentPrayers(recentRes.data || []);
    setLoading(false);
  };

  const deletePrayer = async (id: string) => {
    const { error } = await supabase.from('prayer_requests').delete().eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted", description: "Prayer request removed." });
    loadData();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats.users,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      ),
      gradient: 'from-amber-500/10 to-yellow-500/5',
    },
    {
      label: "Total Prayers",
      value: stats.prayers,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3C10 3 7 5 7 9c0 3 2 5 3 6l2 2 2-2c1-1 3-3 3-6 0-4-3-6-5-6z" />
          <path d="M8 17l-3 4M16 17l3 4" />
        </svg>
      ),
      gradient: 'from-orange-500/10 to-amber-500/5',
    },
    {
      label: "Devotionals",
      value: stats.devotionals,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" />
          <path d="M11 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" />
        </svg>
      ),
      gradient: 'from-yellow-500/10 to-amber-500/5',
    },
    {
      label: "Products",
      value: stats.products,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2h12l3 5H3l3-5z" />
          <rect x="3" y="7" width="18" height="14" rx="1" />
          <path d="M9 7v4a3 3 0 006 0V7" />
        </svg>
      ),
      gradient: 'from-amber-400/10 to-yellow-400/5',
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/10 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-light" style={{ color: '#FDFAF5' }}>Dashboard</h1>
          <p className="font-sans text-sm mt-1" style={{ color: '#7A6E62' }}>Overview of your CrossAlliance platform</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-sans text-xs" style={{ color: '#7A6E62' }}>Day {planDay} of 365</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`relative rounded-2xl p-5 sm:p-6 overflow-hidden border border-white/[0.06] bg-gradient-to-br ${s.gradient}`} style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.4), transparent)' }} />
            <div className="flex items-start justify-between mb-4">
              <span className="text-[#C9A84C] opacity-60">{s.icon}</span>
            </div>
            <div className="font-serif text-4xl sm:text-5xl font-light" style={{ color: '#C9A84C' }}>{s.value}</div>
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] mt-2" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bible Plan Alert */}
      {daysLeft <= 30 && (
        <div className="rounded-2xl p-5 mb-8 border flex items-start gap-3" style={{ background: 'rgba(201,168,76,0.06)', borderColor: 'rgba(201,168,76,0.2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          <div>
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Bible Plan Notice</div>
            <div className="text-sm" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
              The plan will complete in <strong style={{ color: '#C9A84C' }}>{daysLeft} days</strong>. Consider refreshing content.
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Prayers - wider */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="font-serif text-lg" style={{ color: '#FDFAF5' }}>Recent Prayer Requests</h2>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>
                {stats.prayers} total
              </span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {recentPrayers.map((p) => (
                <div key={p.id} className="px-5 py-3.5 flex justify-between items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="min-w-0">
                    <span className="text-sm block truncate" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>
                      {p.content?.substring(0, 70)}{p.content?.length > 70 ? '...' : ''}
                    </span>
                    <span className="text-[10px] mt-0.5 block" style={{ color: '#7A6E62' }}>{timeAgo(p.created_at)}</span>
                  </div>
                  <button onClick={() => deletePrayer(p.id)} className="opacity-30 hover:opacity-100 transition-opacity shrink-0 p-1.5 rounded-lg hover:bg-red-500/10">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="1.5">
                      <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a2 2 0 002 2h4a2 2 0 002-2l1-9" />
                    </svg>
                  </button>
                </div>
              ))}
              {recentPrayers.length === 0 && (
                <p className="px-5 py-8 text-center text-sm" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>No prayer requests yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - narrower */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-serif text-lg" style={{ color: '#FDFAF5' }}>Quick Actions</h2>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {[
                { label: 'Add Devotional', section: 'devotionals', icon: '📖' },
                { label: 'Add Product', section: 'products', icon: '🛍️' },
                { label: 'Add Bible Day', section: 'bibleplan', icon: '📅' },
                { label: 'Manage Users', section: 'users', icon: '👥' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    const event = new CustomEvent('admin-navigate', { detail: action.section });
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-3 rounded-xl text-left flex items-center gap-3 border border-white/[0.04] hover:border-[#C9A84C]/20 hover:bg-white/[0.03] transition-all group"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm group-hover:text-[#C9A84C] transition-colors" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
