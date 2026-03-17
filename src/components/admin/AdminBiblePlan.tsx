import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BibleDay {
  id: string;
  day_number: number;
  old_testament: string | null;
  new_testament: string | null;
  psalm: string | null;
}

function getDayOfYear(d: Date) {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
}

function getPlanDayFromDate(d: Date) {
  const dayOfYear = getDayOfYear(d);
  return ((dayOfYear - 1) % 365) + 1;
}

const AdminBiblePlan = () => {
  const [days, setDays] = useState<BibleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ day_number: '', old_testament: '', new_testament: '', psalm: '' });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const perPage = 30;

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    setLoading(true);
    const { count } = await supabase.from('bible_plan').select('id', { count: 'exact', head: true });
    setTotal(count || 0);
    const { data } = await supabase.from('bible_plan').select('*').order('day_number', { ascending: true }).range(page * perPage, (page + 1) * perPage - 1);
    setDays(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ day_number: '', old_testament: '', new_testament: '', psalm: '' });
    setSelectedDate(undefined);
    setShowModal(true);
  };

  const openEdit = (d: BibleDay) => {
    setEditing(d.id);
    setForm({
      day_number: d.day_number.toString(),
      old_testament: d.old_testament || '',
      new_testament: d.new_testament || '',
      psalm: d.psalm || '',
    });
    setSelectedDate(undefined);
    setShowModal(true);
  };

  // When date is picked, calculate day_number and prefill
  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) return;
    const planDay = getPlanDayFromDate(date);
    setForm(f => ({ ...f, day_number: planDay.toString() }));

    // Try to load existing data for this day
    const { data } = await supabase.from('bible_plan').select('*').eq('day_number', planDay).maybeSingle();
    if (data) {
      setEditing(data.id);
      setForm({
        day_number: planDay.toString(),
        old_testament: data.old_testament || '',
        new_testament: data.new_testament || '',
        psalm: data.psalm || '',
      });
    } else {
      setEditing(null);
      setForm(f => ({ ...f, old_testament: '', new_testament: '', psalm: '' }));
    }
  };

  const save = async () => {
    const dayNum = parseInt(form.day_number);
    if (!dayNum || dayNum < 1 || dayNum > 365) {
      toast({ title: "Invalid day", description: "Please select a valid date.", variant: "destructive" }); return;
    }
    setSaving(true);
    const payload = {
      day_number: dayNum,
      old_testament: form.old_testament || null,
      new_testament: form.new_testament || null,
      psalm: form.psalm || null,
    };
    const { error } = editing
      ? await supabase.from('bible_plan').update(payload).eq('id', editing)
      : await supabase.from('bible_plan').insert(payload);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: "Saved" }); setShowModal(false); setSaving(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this day?')) return;
    const { error } = await supabase.from('bible_plan').delete().eq('id', id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" }); load();
  };

  const filtered = days.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.day_number.toString().includes(s) || d.old_testament?.toLowerCase().includes(s) || d.new_testament?.toLowerCase().includes(s) || d.psalm?.toLowerCase().includes(s);
  });

  const inputClass = "w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 transition-colors";
  const labelClass = "text-[10px] uppercase tracking-[0.15em] mb-2 block";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/20 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl font-light" style={{ color: '#FDFAF5' }}>Bible Plan</h1>
        <button onClick={openAdd} className="px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors hover:bg-[#b8973f]" style={{ background: '#C9A84C', color: '#0F0A04', fontFamily: 'Lato, sans-serif' }}>+ Add Day</button>
      </div>

      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C9A84C]/50 mb-4"
        placeholder="Search by day number or passage..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ fontFamily: 'Lato, sans-serif' }}
      />

      <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="hidden md:grid grid-cols-[80px_1fr_1fr_1fr_80px] bg-white/[0.06] px-5 py-3 text-xs uppercase tracking-widest sticky top-0 z-10" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
          <span>Day</span><span>Old Testament</span><span>New Testament</span><span>Psalms</span><span>Actions</span>
        </div>
        {filtered.map((d, i) => (
          <div key={d.id} className={`grid grid-cols-1 md:grid-cols-[80px_1fr_1fr_1fr_80px] px-5 py-3 border-b border-white/5 hover:bg-white/[0.04] transition-colors items-center gap-2 ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
            <span className="font-serif text-lg" style={{ color: '#C9A84C' }}>{d.day_number}</span>
            <span className="text-sm" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>{d.old_testament || '—'}</span>
            <span className="text-sm" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>{d.new_testament || '—'}</span>
            <span className="text-sm" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>{d.psalm || '—'}</span>
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
              <rect x="8" y="4" width="32" height="40" rx="2" /><path d="M16 12h16M16 20h12M16 28h8" />
            </svg>
            <p className="text-sm mt-4" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>No days found.</p>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[5vh] overflow-y-auto">
          <div className="rounded-2xl p-8 max-w-lg w-full mx-4 border border-white/[0.08] mb-8" style={{ background: '#1A1209' }}>
            <h2 className="font-serif text-2xl mb-6" style={{ color: '#FDFAF5' }}>{editing ? 'Edit Day' : 'Add Day'}</h2>
            <div className="flex flex-col gap-4">
              {/* Date Picker */}
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/[0.06] border-white/10 hover:bg-white/10 text-white hover:text-white",
                        !selectedDate && "text-white/30"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {form.day_number && (
                  <p className="mt-2 text-xs" style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>
                    This date = Day {form.day_number} of the Bible Plan
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Old Testament</label>
                <input className={inputClass} placeholder="e.g. Genesis 1-2" value={form.old_testament} onChange={e => setForm(f => ({ ...f, old_testament: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>New Testament</label>
                <input className={inputClass} placeholder="e.g. Matthew 1" value={form.new_testament} onChange={e => setForm(f => ({ ...f, new_testament: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#C9A84C', fontFamily: 'Lato, sans-serif' }}>Psalm</label>
                <input className={inputClass} placeholder="e.g. Psalm 1" value={form.psalm} onChange={e => setForm(f => ({ ...f, psalm: e.target.value }))} style={{ fontFamily: 'Lato, sans-serif' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-6 sticky bottom-0 pt-4" style={{ background: '#1A1209' }}>
              <button onClick={save} disabled={saving || !form.day_number} className="flex-1 py-3 rounded-xl text-xs uppercase tracking-widest disabled:opacity-50 transition-colors hover:bg-[#b8973f]" style={{ background: '#C9A84C', color: '#0F0A04', fontFamily: 'Lato, sans-serif' }}>
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

export default AdminBiblePlan;
