import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || '');
          setAvatarUrl(data.avatar_url);
        }
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = publicUrl + '?t=' + Date.now();
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    setAvatarUrl(url);
    toast({ title: 'Avatar updated', className: 'bg-[#C9A84C] text-white border-none' });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    setSaving(false);
    if (!error) {
      toast({ title: 'Profile updated', className: 'bg-[#C9A84C] text-white border-none' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const res = await supabase.functions.invoke('delete-user', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.error) throw new Error(res.error.message);

      await signOut();
      navigate('/');
      toast({ title: 'Account deleted', description: 'Your account and data have been removed.', className: 'bg-[#C9A84C] text-white border-none' });
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }
    setDeleting(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF5' }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 pt-28 pb-16">
        <h1 className="font-serif font-light text-5xl mb-12" style={{ color: '#1A1209' }}>Account Settings</h1>

        {/* PROFILE */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1px solid #EDE8DC' }}>
          <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-6" style={{ color: '#C9A84C' }}>Profile</span>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group"
              style={{ background: '#EDE8DC' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7A6E62" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>

          {/* Full name */}
          <label className="block font-sans text-xs uppercase tracking-[0.2em] mb-2" style={{ color: '#7A6E62' }}>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2"
            style={{ border: '1px solid #EDE8DC', '--tw-ring-color': '#C9A84C' } as React.CSSProperties}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 px-8 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-200 disabled:opacity-50"
            style={{ background: '#C9A84C', color: '#FFFFFF' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#b8973f'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#C9A84C'; }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* SIGN OUT */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1px solid #EDE8DC' }}>
          <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4" style={{ color: '#C9A84C' }}>Session</span>
          <p className="font-sans text-sm mb-6" style={{ color: '#7A6E62' }}>You are currently signed in.</p>
          <button
            onClick={handleSignOut}
            className="px-8 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-all duration-200"
            style={{ border: '1px solid #EDE8DC', color: '#7A6E62' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE8DC'; e.currentTarget.style.color = '#7A6E62'; }}
          >
            Sign Out
          </button>
        </div>

        {/* DELETE ACCOUNT */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1px solid #fecaca' }}>
          <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4" style={{ color: '#ef4444' }}>Danger Zone</span>
          <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: '#7A6E62' }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-8 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-200"
            style={{ border: '1px solid #fecaca', color: '#f87171' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 mt-[20vh]" style={{ border: '1px solid #fecaca' }}>
            <h2 className="font-serif text-2xl" style={{ color: '#1A1209' }}>Are you sure?</h2>
            <p className="font-sans text-sm mt-3 mb-8" style={{ color: '#7A6E62' }}>
              This will permanently delete your account, profile, prayer requests, and all activity. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-3 font-sans text-xs uppercase tracking-[0.2em]"
                style={{ border: '1px solid #EDE8DC', color: '#7A6E62' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-6 py-3 font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-200"
                style={{ background: '#ef4444', color: '#FFFFFF' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ef4444'; }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
