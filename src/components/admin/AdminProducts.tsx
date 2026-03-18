import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  description: string | null;
  type: string;
  price_usd: number | null;
  original_price_usd: number | null;
  payhip_link: string | null;
  image_url: string | null;
  file_url: string | null;
  is_free: boolean | null;
  is_published: boolean | null;
  is_featured: boolean | null;
}

const emptyForm = {
  title: '', description: '', type: 'ebook', price_usd: '', original_price_usd: '',
  payhip_link: '', image_url: '', file_url: '', is_free: false, is_published: true, is_featured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data as any[]) || []);
    setLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (p: Product) => {
    setEditing(p.id);
    setForm({
      title: p.title, description: p.description || '', type: p.type,
      price_usd: p.price_usd?.toString() || '', original_price_usd: (p as any).original_price_usd?.toString() || '',
      payhip_link: p.payhip_link || '',
      image_url: p.image_url || '', file_url: p.file_url || '',
      is_free: p.is_free || false, is_published: p.is_published !== false,
      is_featured: p.is_featured || false,
    });
    setShowModal(true);
  };

  const uploadFile = async (file: File, prefix: string) => {
    const path = `${prefix}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('products').upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data } = supabase.storage.from('products').getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    if (!form.title || !form.type) {
      toast({ title: "Missing fields", description: "Title and type are required.", variant: "destructive" }); return;
    }
    if (form.is_featured) {
      const featuredCount = products.filter(p => p.is_featured && p.id !== editing).length;
      if (featuredCount >= 3) {
        toast({ title: "Limit reached", description: "Maximum 3 featured products allowed.", variant: "destructive" }); return;
      }
    }
    setSaving(true);
    const payload = {
      title: form.title, description: form.description || null, type: form.type,
      price_usd: form.price_usd ? parseFloat(form.price_usd) : null,
      original_price_usd: form.original_price_usd ? parseFloat(form.original_price_usd) : null,
      payhip_link: form.payhip_link || null, image_url: form.image_url || null,
      file_url: form.file_url || null, is_free: form.is_free,
      is_published: form.is_published, is_featured: form.is_featured,
    };
    const { error } = editing
      ? await supabase.from('products').update(payload).eq('id', editing)
      : await supabase.from('products').insert(payload);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: "Saved", description: "Product saved successfully." });
    setShowModal(false); setSaving(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" }); load();
  };

  const filtered = products.filter(p => {
    if (!search) return true;
    return p.title.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase());
  });

  const inputClass = "w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors";
  const labelClass = "text-[10px] uppercase tracking-[0.15em] mb-2 block";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/20 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-light" style={{ color: '#FDFAF5' }}>Products</h1>
        <button onClick={openAdd} className="px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors hover:bg-[#b8973f]" style={{ background: '#C9A84C', color: '#0F0A04', fontFamily: 'Lato, sans-serif' }}>+ Add</button>
      </div>

      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 mb-4"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ fontFamily: 'Lato, sans-serif' }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.15] transition-colors">
            <div className="aspect-[4/3] relative overflow-hidden">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8D5A3 0%, #C9A84C 50%, #8B6914 100%)' }}>
                  <svg width="40" height="60" viewBox="0 0 40 60" fill="none" stroke="white" strokeWidth="1.5"><line x1="20" y1="5" x2="20" y2="55" /><line x1="5" y1="20" x2="35" y2="20" /></svg>
                </div>
              )}
              {p.is_featured && <span className="absolute top-2 right-2 text-[10px] uppercase px-2 py-0.5 rounded-full font-medium" style={{ background: '#C9A84C', color: '#0F0A04', fontFamily: 'Lato, sans-serif' }}>Featured</span>}
              {p.is_free && <span className="absolute top-2 left-2 text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/20 text-white" style={{ fontFamily: 'Lato, sans-serif' }}>Free</span>}
            </div>
            <div className="p-4">
              <div className="text-sm font-medium mb-1" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>{p.title}</div>
              <div className="text-xs mb-1" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>{p.price_usd ? `$${p.price_usd}` : 'Free'}</div>
              <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>{p.type}</div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="opacity-50 hover:opacity-100 transition-opacity p-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#C9A84C" strokeWidth="1.5"><path d="M11 2l3 3-9 9H2v-3l9-9z" /></svg>
                </button>
                <button onClick={() => remove(p.id)} className="opacity-50 hover:opacity-100 transition-opacity p-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a2 2 0 002 2h4a2 2 0 002-2l1-9" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#7A6E62" strokeWidth="1" opacity="0.4">
            <rect x="8" y="12" width="32" height="28" rx="2" /><path d="M8 20h32" /><path d="M18 20v6a6 6 0 0012 0v-6" />
          </svg>
          <p className="text-sm mt-4" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>No products found.</p>
        </div>
      )}
      <div className="text-xs mt-3 text-center" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
        Showing {filtered.length} of {products.length}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[5vh] overflow-y-auto">
          <div className="rounded-2xl p-8 max-w-2xl w-full mx-4 border border-white/[0.08] mb-8" style={{ background: '#1A1209' }}>
            <h2 className="font-serif text-2xl mb-6" style={{ color: '#FDFAF5' }}>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Title</label>
                <input className={inputClass} placeholder="Product title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Description</label>
                <textarea className={inputClass} rows={4} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Type</label>
                <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }}>
                  <option value="ebook">Ebook</option>
                  <option value="ebook-bundle">Ebook Bundle</option>
                  <option value="wallpaper">Wallpaper</option>
                  <option value="wallpaper-bundle">Wallpaper Bundle</option>
                  <option value="mixed-bundle">Mixed Bundle (Ebook + Wallpaper)</option>
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Original Price USD (before discount)</label>
                <input className={inputClass} type="number" step="0.01" placeholder="Leave empty if no discount" value={form.original_price_usd} onChange={e => setForm(f => ({ ...f, original_price_usd: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Sale Price USD</label>
                <input className={inputClass} type="number" step="0.01" placeholder="Leave empty if free" value={form.price_usd} onChange={e => setForm(f => ({ ...f, price_usd: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Payhip Link</label>
                <input className={inputClass} placeholder="https://payhip.com/b/xxxxx" value={form.payhip_link} onChange={e => setForm(f => ({ ...f, payhip_link: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Product Image</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-[#C9A84C]/30 transition-colors cursor-pointer" onClick={() => document.getElementById('prod-image-upload')?.click()}>
                  <input id="prod-image-upload" type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadFile(file, 'images');
                    if (url) setForm(f => ({ ...f, image_url: url }));
                  }} className="hidden" />
                  {form.image_url ? (
                    <img src={form.image_url} className="rounded-lg h-20 object-cover" alt="" />
                  ) : (
                    <p className="text-xs text-center" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Click to upload image</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_free: !f.is_free }))} className={`w-11 h-6 rounded-full transition-colors relative ${form.is_free ? 'bg-[#C9A84C]' : 'bg-white/20'}`}>
                  <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.is_free ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Free Resource</span>
              </div>

              {form.is_free && (
                <div>
                  <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Free File (PDF/ZIP)</label>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-[#C9A84C]/30 transition-colors cursor-pointer" onClick={() => document.getElementById('prod-file-upload')?.click()}>
                    <input id="prod-file-upload" type="file" accept=".pdf,.zip" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadFile(file, 'files');
                      if (url) setForm(f => ({ ...f, file_url: url }));
                    }} className="hidden" />
                    <p className="text-xs text-center" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
                      {form.file_url ? 'File uploaded ✓' : 'Click to upload file'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))} className={`w-11 h-6 rounded-full transition-colors relative ${form.is_published ? 'bg-[#C9A84C]' : 'bg-white/20'}`}>
                  <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Published</span>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))} className={`w-11 h-6 rounded-full transition-colors relative ${form.is_featured ? 'bg-[#C9A84C]' : 'bg-white/20'}`}>
                  <span className={`block w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>Featured (max 3)</span>
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

export default AdminProducts;
