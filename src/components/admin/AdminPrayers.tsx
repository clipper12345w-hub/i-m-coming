import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminPrayers = () => {
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const perPage = 20;

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    setLoading(true);
    const { count } = await supabase.from('prayer_requests').select('id', { count: 'exact', head: true });
    setTotal(count || 0);
    const { data } = await supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }).range(page * perPage, (page + 1) * perPage - 1);
    setPrayers(data || []);
    setLoading(false);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('prayer_requests').delete().eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted", description: "Prayer request removed." });
    setConfirmDelete(null);
    load();
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const filtered = prayers.filter(p => {
    if (!search) return true;
    return p.content?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/20 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl font-light" style={{ color: '#FDFAF5' }}>Prayer Requests</h1>
          <span className="text-xs px-3 py-1 rounded-full bg-white/10" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>{total}</span>
        </div>
      </div>

      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 mb-4"
        placeholder="Search prayer requests..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ fontFamily: 'Lato, sans-serif' }}
      />

      <div className="flex flex-col gap-3">
        {filtered.map((p, i) => (
          <div key={p.id} className={`bg-white/[0.03] rounded-2xl px-6 py-5 border border-white/[0.08] hover:bg-white/[0.05] transition-colors ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs uppercase tracking-widest" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
                {p.is_anonymous ? 'Anonymous' : 'User'}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: '#7A6E62' }}>{timeAgo(p.created_at)}</span>
                <span className="text-xs" style={{ color: '#7A6E62' }}>🙏 {p.prayer_count || 0}</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>{p.content}</p>
            {confirmDelete === p.id ? (
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Delete this prayer request?</span>
                <button onClick={() => remove(p.id)} className="text-xs px-3 py-1 rounded-lg bg-red-900/30 text-red-400" style={{ fontFamily: 'Lato, sans-serif' }}>Yes</button>
                <button onClick={() => setConfirmDelete(null)} className="text-xs px-3 py-1 rounded-lg border border-white/10 text-[#7A6E62]" style={{ fontFamily: 'Lato, sans-serif' }}>No</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(p.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a2 2 0 002 2h4a2 2 0 002-2l1-9" /></svg>
              </button>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#7A6E62" strokeWidth="1" opacity="0.4">
              <line x1="24" y1="8" x2="24" y2="40" /><line x1="8" y1="24" x2="40" y2="24" />
            </svg>
            <p className="text-sm mt-4" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>No prayer requests found.</p>
          </div>
        )}
      </div>

      {total > perPage && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-xs" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
            Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, total)} of {total}
          </span>
          <div className="flex gap-3">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-5 py-2 rounded-xl border border-white/10 text-xs text-[#7A6E62] disabled:opacity-30 hover:bg-white/5 transition-colors" style={{ fontFamily: 'Lato, sans-serif' }}>Prev</button>
            <button disabled={(page + 1) * perPage >= total} onClick={() => setPage(p => p + 1)} className="px-5 py-2 rounded-xl border border-white/10 text-xs text-[#7A6E62] disabled:opacity-30 hover:bg-white/5 transition-colors" style={{ fontFamily: 'Lato, sans-serif' }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrayers;
