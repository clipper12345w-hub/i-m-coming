import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  email: string | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data: userData, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, created_at, email')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error loading users", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setUsers((userData as UserRow[]) || []);
    setTotal(userData?.length || 0);

    const { data: rolesData } = await supabase.from('user_roles').select('*');
    const rolesMap: Record<string, string[]> = {};
    (rolesData || []).forEach((r: any) => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role);
    });
    setRoles(rolesMap);
    setLoading(false);
  };

  const toggleAdmin = async (userId: string) => {
    const isAdmin = roles[userId]?.includes('admin');
    if (isAdmin) {
      if (!confirm('Remove admin role from this user?')) return;
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin' as any);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Admin role removed" });
    } else {
      if (!confirm('Grant admin role to this user?')) return;
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' } as any);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Admin role granted" });
    }
    load();
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.full_name?.toLowerCase().includes(s)) || (u.email?.toLowerCase().includes(s));
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/20 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl font-light" style={{ color: '#FDFAF5' }}>Users</h1>
          <span className="text-xs px-3 py-1 rounded-full bg-white/10" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>{total}</span>
        </div>
      </div>

      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 mb-4"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ fontFamily: 'Lato, sans-serif' }}
      />

      <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/10">
        <div className="hidden md:grid grid-cols-[40px_1fr_1fr_120px_80px] bg-white/[0.06] px-5 py-3 text-xs uppercase tracking-widest sticky top-0 z-10" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
          <span></span><span>Name</span><span>Email</span><span>Joined</span><span>Admin</span>
        </div>
        {filtered.map((u, i) => (
          <div key={u.id} className={`grid grid-cols-1 md:grid-cols-[40px_1fr_1fr_120px_80px] px-5 py-4 border-b border-white/5 items-center gap-2 hover:bg-white/[0.04] transition-colors ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: u.avatar_url ? 'transparent' : '#C9A84C', color: '#0F0A04' }}>
              {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : (u.full_name?.[0] || u.email?.[0]?.toUpperCase() || '?')}
            </div>
            <span className="text-sm" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>{u.full_name || 'No name'}</span>
            <span className="text-xs" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>{u.email || '—'}</span>
            <span className="text-xs" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>{formatDate(u.created_at)}</span>
            <button
              onClick={() => toggleAdmin(u.id)}
              className={`w-11 h-6 rounded-full transition-colors relative ${roles[u.id]?.includes('admin') ? 'bg-[#C9A84C]' : 'bg-white/20'}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${roles[u.id]?.includes('admin') ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="px-5 py-8 text-sm text-center" style={{ color: '#7A6E62' }}>No users found.</p>}
      </div>
      <div className="text-xs mt-3 text-center" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
        Showing {filtered.length} of {total} users
      </div>
    </div>
  );
};

export default AdminUsers;
