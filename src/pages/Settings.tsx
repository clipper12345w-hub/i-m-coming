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
    toast({ title: 'Avatar updated' });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    setSaving(false);
    if (!error) {
      toast({ title: 'Profile updated' });
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
      toast({ title: 'Account deleted', description: 'Your account and data have been removed.' });
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 sm:px-8 pt-28 pb-16">
        <h1 className="font-serif font-light text-4xl sm:text-5xl mb-10 text-foreground">Account Settings</h1>

        {/* PROFILE */}
        <div className="bg-card rounded-2xl p-6 sm:p-8 mb-5 border border-border">
          <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-6 text-primary">Profile</span>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group bg-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5">
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
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </div>

          {/* Email (read-only) */}
          <label className="block font-sans text-xs uppercase tracking-[0.2em] mb-2 text-muted-foreground">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full rounded-lg px-4 py-3 font-sans text-sm bg-secondary text-muted-foreground border border-border mb-5 cursor-not-allowed"
          />

          {/* Full name */}
          <label className="block font-sans text-xs uppercase tracking-[0.2em] mb-2 text-muted-foreground">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full rounded-lg px-4 py-3 font-sans text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 px-8 py-3 rounded-lg font-sans text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* SIGN OUT */}
        <div className="bg-card rounded-2xl p-6 sm:p-8 mb-5 border border-border">
          <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4 text-primary">Session</span>
          <p className="font-sans text-sm mb-6 text-muted-foreground">You are currently signed in as <strong className="text-foreground">{user?.email}</strong>.</p>
          <button
            onClick={handleSignOut}
            className="px-8 py-3 rounded-lg font-sans text-xs uppercase tracking-[0.2em] border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* DELETE ACCOUNT */}
        <div className="bg-card rounded-2xl p-6 sm:p-8 mb-5 border border-destructive/30">
          <span className="block font-sans text-xs uppercase tracking-[0.2em] mb-4 text-destructive">Danger Zone</span>
          <p className="font-sans text-sm leading-relaxed mb-6 text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-8 py-3 rounded-lg font-sans text-xs uppercase tracking-[0.2em] border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 mt-[20vh] border border-destructive/30">
            <h2 className="font-serif text-2xl text-foreground">Are you sure?</h2>
            <p className="font-sans text-sm mt-3 mb-8 text-muted-foreground">
              This will permanently delete your account, profile, prayer requests, and all activity. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-3 rounded-lg font-sans text-xs uppercase tracking-[0.2em] border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-6 py-3 rounded-lg font-sans text-xs uppercase tracking-[0.2em] bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
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
