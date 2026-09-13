import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, Upload, Package, Trash2, FileCog } from 'lucide-react';

export default function DownloadsTab() {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadResources = async () => {
    try {
      const items = await base44.entities.StaffResource.list('-created_date', 20);
      setResources(items || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      await base44.entities.StaffResource.create({
        name: file.name.replace(/\.[^.]+$/, ''),
        description: 'Windows installer for Escape Tsunami Portal',
        file_url,
        version: '1.0.0',
      });
      toast({ title: 'Upload complete', description: 'The installer is now available for staff to download.' });
      loadResources();
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload the file. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.StaffResource.delete(id);
      loadResources();
    } catch {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading downloads…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Staff Downloads</h3>
            <p className="text-sm text-slate-400 mt-1">
              Upload the Windows installer here. Only staff members can see and download these files.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".exe,.msi,.zip"
            disabled={uploading}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0 shrink-0"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading…' : 'Upload Installer'}
          </Button>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 py-16 text-center">
          <FileCog className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-semibold text-white">No downloads yet</h3>
          <p className="mt-1 text-sm text-slate-400">Upload the Windows installer to make it available to staff.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{r.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{r.description || 'Windows installer'}</div>
              </div>
              <a href={r.file_url} download>
                <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </a>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(r.id)}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
        <h4 className="font-semibold text-white text-sm mb-3">Installation instructions</h4>
        <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
          <li>Download the installer using the Download button above.</li>
          <li>Double-click the downloaded .exe file to start the installer.</li>
          <li>Follow the on-screen steps — it will install the portal to your computer.</li>
          <li>A desktop shortcut will be created automatically.</li>
        </ol>
      </div>
    </div>
  );
}