import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Devotional {
  id: string;
  title: string;
  published_date: string;
  verse_reference: string | null;
  verse: string | null;
  content: string;
  reflection_1: string | null;
  reflection_2: string | null;
  reflection_3: string | null;
  closing_prayer: string | null;
  header_image_url: string | null;
}

const emptyForm = {
  title: '', published_date: '', verse: '', verse_reference: '', content: '',
  reflection_1: '', reflection_2: '', reflection_3: '', closing_prayer: '', header_image_url: '',
};

const AdminDevotionals = () => {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('devotionals').select('*').order('published_date', { ascending: false });
    setDevotionals((data as any[]) || []);
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (d: Devotional) => {
    setEditing(d.id);
    setForm({
      title: d.title, published_date: d.published_date, verse: d.verse || '',
      verse_reference: d.verse_reference || '', content: d.content,
      reflection_1: d.reflection_1 || '', reflection_2: d.reflection_2 || '',
      reflection_3: d.reflection_3 || '', closing_prayer: d.closing_prayer || '',
      header_image_url: d.header_image_url || '',
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('devotional-images').upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('devotional-images').getPublicUrl(path);
    setForm(f => ({ ...f, header_image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const save = async () => {
    if (!form.title || !form.published_date || !form.content) {
      toast({ title: "Missing fields", description: "Title, date, and content are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title, published_date: form.published_date,
      verse: form.verse || null, verse_reference: form.verse_reference || null,
      content: form.content, reflection_1: form.reflection_1 || null,
      reflection_2: form.reflection_2 || null, reflection_3: form.reflection_3 || null,
      closing_prayer: form.closing_prayer || null, header_image_url: form.header_image_url || null,
    };
    const { error } = editing
      ? await supabase.from('devotionals').update(payload).eq('id', editing)
      : await supabase.from('devotionals').insert(payload);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: "Saved", description: "Devotional saved successfully." });
    setShowModal(false); setSaving(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this devotional?')) return;
    const { error } = await supabase.from('devotionals').delete().eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" }); load();
  };

  const filtered = devotionals.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.title.toLowerCase().includes(s) || d.verse_reference?.toLowerCase().includes(s);
  });

  const inputClass = "w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors";
  const labelClass = "text-[10px] uppercase tracking-[0.15em] mb-2 block";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/20 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-light" style={{ color: '#FDFAF5' }}>Devotionals</h1>
        <button onClick={openAdd} className="px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors hover:bg-[#b8973f]" style={{ background: '#C9A84C', color: '#0F0A04', fontFamily: 'Lato, sans-serif' }}>+ Add</button>
      </div>

      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 mb-4"
        placeholder="Search devotionals..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ fontFamily: 'Lato, sans-serif' }}
      />

      <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="hidden md:grid grid-cols-[1fr_120px_140px_80px] bg-white/[0.06] px-5 py-3 text-xs uppercase tracking-widest sticky top-0 z-10" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
          <span>Title</span><span>Date</span><span>Verse</span><span>Actions</span>
        </div>
        {filtered.map((d, i) => (
          <div key={d.id} className={`grid grid-cols-1 md:grid-cols-[1fr_120px_140px_80px] px-5 py-4 border-b border-white/5 hover:bg-white/[0.04] transition-colors items-center gap-2 ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
            <span className="text-sm" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>{d.title}</span>
            <span className="text-xs" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>{d.published_date}</span>
            <span className="text-xs italic" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>{d.verse_reference || '—'}</span>
            <div className="flex gap-3">
              <button onClick={() => openEdit(d)} className="opacity-50 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M11 2l3 3-9 9H2v-3l9-9z" /></svg>
              </button>
              <button onClick={() => remove(d.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a2 2 0 002 2h4a2 2 0 002-2l1-9" /></svg>
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#7A6E62" strokeWidth="1" opacity="0.4">
              <path d="M12 8c0-2 2-4 6-4s8 2 8 4v32c-2-2-6-4-8-4s-4 0-6 2V8z" />
              <path d="M24 8c0-2 2-4 6-4s8 2 8 4v32c-2-2-6-4-8-4s-4 0-6 2V8z" />
            </svg>
            <p className="text-sm mt-4" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>No devotionals found.</p>
          </div>
        )}
      </div>
      <div className="text-xs mt-3 text-center" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
        Showing {filtered.length} of {devotionals.length}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[5vh] overflow-y-auto">
          <div className="rounded-2xl p-8 max-w-2xl w-full mx-4 border border-white/[0.08] mb-8" style={{ background: '#1A1209' }}>
            <h2 className="font-serif text-2xl mb-6" style={{ color: '#FDFAF5' }}>{editing ? 'Edit Devotional' : 'Add Devotional'}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Title</label>
                <input className={inputClass} placeholder="Devotional title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Published Date</label>
                <input className={inputClass} type="date" value={form.published_date} onChange={e => setForm(f => ({ ...f, published_date: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Verse</label>
                <input className={inputClass} placeholder="e.g. For God so loved the world..." value={form.verse} onChange={e => setForm(f => ({ ...f, verse: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Verse Reference</label>
                <input className={inputClass} placeholder="e.g. John 3:16" value={form.verse_reference} onChange={e => setForm(f => ({ ...f, verse_reference: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Content</label>
                <textarea className={inputClass} rows={8} placeholder="Write the full devotional content..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Reflection Questions</label>
                <input className={`${inputClass} mb-2`} placeholder="Reflection 1" value={form.reflection_1} onChange={e => setForm(f => ({ ...f, reflection_1: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
                <input className={`${inputClass} mb-2`} placeholder="Reflection 2" value={form.reflection_2} onChange={e => setForm(f => ({ ...f, reflection_2: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
                <input className={inputClass} placeholder="Reflection 3" value={form.reflection_3} onChange={e => setForm(f => ({ ...f, reflection_3: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Closing Prayer</label>
                <textarea className={inputClass} rows={4} placeholder="Closing Prayer" value={form.closing_prayer} onChange={e => setForm(f => ({ ...f, closing_prayer: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Header Image</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-[#C9A84C]/30 transition-colors cursor-pointer" onClick={() => document.getElementById('devo-image-upload')?.click()}>
                  <input id="devo-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {form.header_image_url ? (
                    <img src={form.header_image_url} className="rounded-lg h-24 object-cover" alt="" />
                  ) : (
                    <p className="text-xs text-center" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
                      {uploading ? 'Uploading...' : 'Click to upload image'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 sticky bottom-0 pt-4" style={{ background: '#1A1209' }}>
              <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest disabled:opacity-50 transition-colors hover:bg-[#b8973f]" style={{ background: '#C9A84C', color: '#0F0A04', fontFamily: 'Lato, sans-serif' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl text-xs uppercase tracking-widest border border-white/10 transition-colors hover:bg-white/5" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDevotionals;
