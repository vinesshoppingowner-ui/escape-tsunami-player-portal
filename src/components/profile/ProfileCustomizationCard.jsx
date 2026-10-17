import { useState, useRef } from 'react';
import { Camera, Loader2, Trash2, Check, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import UserAvatar, { clearAvatarCache } from '@/components/profile/UserAvatar';
import { RING_STYLE } from '@/components/profile/ProfileMenu';

export default function ProfileCustomizationCard({ user }) {
  const { checkUserAuth } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef(null);

  const initialName = user?.custom_display_name || user?.data?.custom_display_name || user?.full_name || '';
  const initialBio = user?.bio ?? user?.data?.bio ?? '';
  const currentAvatarUri = user?.avatar_uri || user?.data?.avatar_uri || '';

  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image must be under 5 MB', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      await base44.auth.updateMe({ avatar_uri: file_uri });
      await checkUserAuth();
      toast({ title: 'Profile picture updated' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      clearAvatarCache(currentAvatarUri);
      await base44.auth.updateMe({ avatar_uri: '' });
      await checkUserAuth();
      toast({ title: 'Profile picture removed' });
    } catch (err) {
      toast({ title: 'Failed to remove avatar', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({
        custom_display_name: displayName.trim(),
        bio: bio.trim(),
      });
      await checkUserAuth();
      toast({ title: 'Profile saved' });
    } catch (err) {
      toast({ title: 'Failed to save profile', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveProfile} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-cyan-300" /> Public Profile & Avatar
          </h3>
          <p className="text-xs text-slate-500">Customize your portal profile picture and bio description.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative group shrink-0">
          <div className="p-[3px] rounded-full" style={RING_STYLE}>
            <UserAvatar user={user} size={64} />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            title="Upload custom PFP"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-cyan-300" /> : <Camera className="h-5 w-5 text-cyan-300" />}
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-xs font-medium text-cyan-200 hover:bg-cyan-500/25 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              {currentAvatarUri ? 'Change PFP' : 'Upload custom PFP'}
            </button>
            {currentAvatarUri && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Reset to Roblox avatar
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500">PNG, JPG, WEBP or GIF up to 5 MB (stored privately).</p>
        </div>
      </div>

      <div className="grid gap-3 pt-1">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
          <input
            type="text"
            maxLength={40}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={user?.roblox_username || user?.email || 'Your display name'}
            className="w-full h-9 px-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-300">Profile Description / Bio</label>
            <span className="text-[11px] text-slate-500">{bio.length}/160</span>
          </div>
          <textarea
            rows={2}
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio, role, or status message..."
            className="w-full p-2.5 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}