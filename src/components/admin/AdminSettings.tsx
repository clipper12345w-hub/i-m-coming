import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const [form, setForm] = useState({ daily_verse: '', daily_verse_reference: '', ko_fi_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const planDay = ((dayOfYear - 1) % 365) + 1;
  const daysLeft = 365 - planDay;

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('settings').select('*').eq('id', 1).single();
    if (data) {
      setForm({
        daily_verse: (data as any).daily_verse || '',
        daily_verse_reference: (data as any).daily_verse_reference || '',
        ko_fi_url: (data as any).ko_fi_url || '',
      });
    }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('settings').update({
      daily_verse: form.daily_verse,
      daily_verse_reference: form.daily_verse_reference,
      ko_fi_url: form.ko_fi_url,
      updated_at: new Date().toISOString(),
    } as any).eq('id', 1);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: "Settings saved", description: "Your changes have been saved." });
    setSaving(false);
  };

  const inputClass = "w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors";
  const labelClass = "text-[10px] uppercase tracking-[0.15em] mb-2 block";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/20 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-serif text-3xl font-light mb-8" style={{ color: '#FDFAF5' }}>Settings</h1>

      {/* Platform Settings */}
      <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08] mb-6">
        <div className="text-[10px] uppercase tracking-[0.15em] mb-6" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Platform</div>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass} style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Daily Verse (shown on landing page)</label>
            <textarea className={inputClass} rows={2} value={form.daily_verse} onChange={e => setForm(f => ({ ...f, daily_verse: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Daily Verse Reference</label>
            <input className={inputClass} value={form.daily_verse_reference} onChange={e => setForm(f => ({ ...f, daily_verse_reference: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Ko-fi URL</label>
            <input className={inputClass} placeholder="https://ko-fi.com/yourname" value={form.ko_fi_url} onChange={e => setForm(f => ({ ...f, ko_fi_url: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
          </div>
        </div>
        <button onClick={save} disabled={saving} className="px-8 py-3 rounded-xl text-xs uppercase tracking-widest mt-6 disabled:opacity-50 transition-colors hover:bg-[#b8973f]" style={{ background: '#C9A84C', color: '#0F0A04', fontFamily: 'Lato, sans-serif' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Bible Plan Status */}
      <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.08] mb-6">
        <div className="text-[10px] uppercase tracking-[0.15em] mb-6" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Bible Plan</div>
        <p className="text-sm mb-4" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
          Currently on Day {planDay} of 365. Plan loops automatically after Day 365.
        </p>

        <div className="flex justify-between text-xs mb-2" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
          <span>Progress</span>
          <span>Day {planDay} of 365</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06]">
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(planDay / 365) * 100}%`, background: '#C9A84C' }} />
        </div>
        <p className="text-xs mt-2" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
          {Math.round((planDay / 365) * 100)}% complete this year
        </p>

        {daysLeft <= 30 && (
          <div className="rounded-xl p-4 mt-4 border" style={{ background: 'rgba(201,168,76,0.1)', borderColor: 'rgba(201,168,76,0.3)' }}>
            <p className="text-sm" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>
              Bible Plan will complete in {daysLeft} days. The plan will loop automatically — no action needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
