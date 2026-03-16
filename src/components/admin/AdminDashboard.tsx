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
      label: "Total Users", value: stats.users,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" /></svg>,
    },
    {
      label: "Total Prayers", value: stats.prayers,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><path d="M12 3C10 3 7 5 7 9c0 3 2 5 3 6l2 2 2-2c1-1 3-3 3-6 0-4-3-6-5-6z" /><path d="M8 17l-3 4M16 17l3 4" /></svg>,
    },
    {
      label: "Devotionals Published", value: stats.devotionals,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><path d="M4 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" /><path d="M11 4c0-1 1-2 3-2s4 1 4 2v16c-1-1-3-2-4-2s-2 0-3 1V4z" /></svg>,
    },
    {
      label: "Products Listed", value: stats.products,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><path d="M6 2h12l3 5H3l3-5z" /><rect x="3" y="7" width="18" height="14" rx="1" /><path d="M9 7v4a3 3 0 006 0V7" /></svg>,
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/20 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <h1 className="font-serif text-3xl font-light mb-8" style={{ color: '#FDFAF5' }}>Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(to right, transparent, #C9A84C, transparent)' }} />
            <div className="absolute top-4 right-4 text-[#C9A84C]">{s.icon}</div>
            <div className="font-serif text-4xl" style={{ color: '#C9A84C' }}>{s.value}</div>
            <div className="text-xs uppercase tracking-widest mt-2" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {daysLeft <= 30 && (
        <div className="rounded-2xl p-5 mt-4 mb-8 border" style={{ background: 'rgba(201,168,76,0.1)', borderColor: 'rgba(201,168,76,0.3)' }}>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Bible Plan Notice</div>
          <div className="text-sm" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
            The Full Bible Plan will complete in {daysLeft} days. Consider reviewing or refreshing the content.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Prayers */}
        <div>
          <h2 className="font-serif text-xl mb-4" style={{ color: '#FDFAF5' }}>Recent Prayer Requests</h2>
          <div className="flex flex-col gap-2">
            {recentPrayers.map((p) => (
              <div key={p.id} className="bg-white/[0.03] rounded-xl px-5 py-3 border border-white/[0.08] flex justify-between items-center gap-4 hover:bg-white/[0.05] transition-colors">
                <span className="text-sm truncate" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
                  {p.content?.substring(0, 60)}{p.content?.length > 60 ? '...' : ''}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs" style={{ color: '#7A6E62' }}>{timeAgo(p.created_at)}</span>
                  <button onClick={() => deletePrayer(p.id)} className="opacity-40 hover:opacity-100 transition-opacity">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="1.5">
                      <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a2 2 0 002 2h4a2 2 0 002-2l1-9" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {recentPrayers.length === 0 && (
              <p className="text-sm" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>No prayer requests yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-serif text-xl mb-4" style={{ color: '#FDFAF5' }}>Quick Actions</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Add Devotional', section: 'devotionals' },
              { label: 'Add Product', section: 'products' },
              { label: 'Add Bible Day', section: 'bibleplan' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  // Navigate to section - parent will handle via event
                  const event = new CustomEvent('admin-navigate', { detail: action.section });
                  window.dispatchEvent(event);
                }}
                className="px-5 py-3 rounded-xl text-xs uppercase tracking-widest border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors text-left"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                + {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
