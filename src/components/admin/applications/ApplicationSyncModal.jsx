import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, RefreshCw, Copy, Check, Download, Upload, Loader2, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { defaultSettings } from '@/lib/applicationTypes';
import { safeParse } from '@/lib/safeParse';
import { generateSlug } from '@/lib/applicationSlug';

export default function ApplicationSyncModal({ open, onClose, applications = [], onSynced }) {
  const { toast } = useToast();
  const [mode, setMode] = useState('export'); // 'export' | 'import' | 'api'
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!open) return null;

  const syncEndpoint = `${window.location.origin}/functions/syncApplications`;

  const exportPayload = JSON.stringify(
    {
      version: 1,
      exported_at: new Date().toISOString(),
      count: applications.length,
      applications: applications.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description || '',
        status: a.status || 'draft',
        category: a.category || 'General',
        icon: a.icon || '📋',
        slug: a.slug || generateSlug(a.title || 'application'),
        success_message: a.success_message || '',
        auto_close_at: a.auto_close_at || null,
        response_count: a.response_count || 0,
        questions: safeParse(a.questions, []),
        settings: { ...defaultSettings(), ...safeParse(a.settings, {}) },
      })),
    },
    null,
    2
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast({ title: `Copied ${applications.length} applications & all settings` });
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportPayload], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `escape-tsunami-applications-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: 'Downloaded applications bundle' });
  };

  const handleImport = async () => {
    if (!importJson.trim()) {
      toast({ title: 'Paste JSON bundle first', variant: 'destructive' });
      return;
    }
    setImporting(true);
    try {
      const parsed = JSON.parse(importJson);
      const list = Array.isArray(parsed) ? parsed : parsed.applications || [];
      if (!Array.isArray(list) || list.length === 0) {
        toast({ title: 'No valid applications found in JSON', variant: 'destructive' });
        setImporting(false);
        return;
      }

      let updated = 0;
      let created = 0;
      for (const item of list) {
        if (!item?.title) continue;
        const questionsArr = typeof item.questions === 'string' ? safeParse(item.questions, []) : (item.questions || []);
        const settingsObj = typeof item.settings === 'string' ? safeParse(item.settings, {}) : (item.settings || {});
        const slug = item.slug || generateSlug(item.title);
        const recordData = {
          title: item.title,
          description: item.description || '',
          status: ['draft', 'open', 'closed'].includes(item.status) ? item.status : 'draft',
          category: item.category || 'General',
          icon: item.icon || '📋',
          slug,
          success_message: item.success_message || '',
          auto_close_at: item.auto_close_at || null,
          questions: JSON.stringify(questionsArr),
          settings: JSON.stringify({ ...defaultSettings(), ...settingsObj }),
        };

        const existingMatch = applications.find(
          (a) => (item.id && a.id === item.id) || (slug && a.slug === slug) || a.title?.toLowerCase() === item.title.toLowerCase()
        );
        if (existingMatch) {
          await base44.entities.Application.update(existingMatch.id, recordData);
          updated++;
        } else {
          await base44.entities.Application.create(recordData);
          created++;
        }
      }

      toast({ title: `Sync complete: ${created} created, ${updated} updated` });
      setImportJson('');
      onSynced?.();
      onClose();
    } catch (e) {
      toast({ title: 'Invalid JSON or sync failed', description: e.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sync Applications & Settings</h2>
              <p className="text-xs text-slate-400">Sync all {applications.length} current applications, questions, and settings across portals.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 mb-4">
          {[
            ['export', 'Export All Current Apps'],
            ['import', 'Import / Sync JSON'],
            ['api', 'Live Staff Portal API'],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                mode === k ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'export' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Contains all <span className="text-white font-medium">{applications.length}</span> current applications ({applications.map((a) => a.title).join(', ') || 'none'}) with their full questions and every form setting.
            </p>
            <pre className="max-h-64 overflow-y-auto rounded-xl bg-slate-900/90 border border-white/10 p-3 text-[11px] text-slate-300 font-mono whitespace-pre-wrap">
              {exportPayload}
            </pre>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={handleDownloadJson} className="border border-white/10 text-slate-200 hover:bg-white/5">
                <Download className="h-4 w-4 mr-1.5" /> Download JSON
              </Button>
              <Button size="sm" onClick={handleCopyJson} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                {copied ? 'Copied!' : 'Copy All Apps & Settings'}
              </Button>
            </div>
          </div>
        )}

        {mode === 'import' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Paste an exported applications JSON bundle to create or update forms and all their settings in this portal without duplicating existing forms.
            </p>
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder='Paste {"applications": [...]} JSON here…'
              rows={8}
              className="bg-slate-900/80 border-white/10 text-white font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400">Cancel</Button>
              <Button size="sm" onClick={handleImport} disabled={importing} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                {importing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
                {importing ? 'Syncing…' : 'Sync Applications'}
              </Button>
            </div>
          </div>
        )}

        {mode === 'api' && (
          <div className="space-y-3">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <Globe className="h-4 w-4" /> Bidirectional Staff Website Sync Endpoint
              </div>
              <p className="text-xs text-slate-400">
                The external Staff Portal (<span className="text-slate-200">staff.escapetsunamifordevelopers.com</span>) can pull and update all applications, settings, responses, and blacklist entries live via this endpoint using the shared <code className="text-cyan-300">x-api-key</code> header (<code className="text-cyan-300">GAME_LOG_API_KEY</code>):
              </p>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-cyan-200 font-mono truncate">
                  {syncEndpoint}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(syncEndpoint);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 1800);
                    toast({ title: 'Sync endpoint URL copied' });
                  }}
                  className="border border-white/10 text-slate-200"
                >
                  {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="pt-2 text-[11px] text-slate-400 space-y-1 font-mono">
                <div>• GET /functions/syncApplications → all apps, settings, questions, responses &amp; blacklist</div>
                <div>• POST {'{ action: "upsert_application", application }'} → create/update app &amp; settings</div>
                <div>• POST {'{ action: "delete_application", id }'} → delete app &amp; responses</div>
                <div>• POST {'{ action: "update_response", id, status, applicant_feedback, staff_notes, ... }'} → review response</div>
                <div>• POST {'{ action: "manage_blacklist", op: "add" | "remove", ... }'} → sync blacklist</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}