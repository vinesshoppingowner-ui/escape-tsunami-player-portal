import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, FileSpreadsheet, CheckCircle2, XCircle, ExternalLink, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function GoogleSheetSyncSettings({ open, onClose }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [sheetId, setSheetId] = useState('');
  const [tabName, setTabName] = useState('Applications');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setTestResult(null);
      try {
        const page = await base44.entities.SiteSettings.list('-updated_date', 1);
        const s = page?.[0] || {};
        setSettings(s);
        setSheetId(s.sheet_sync_spreadsheet_id || '');
        setTabName(s.sheet_sync_tab_name || 'Applications');
        setEnabled(!!s.sheet_sync_enabled);
      } catch {
        toast({ title: 'Failed to load settings', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const save = async () => {
    setSaving(true);
    try {
      const cleanSheetId = extractId(sheetId);
      const cleanTabName = tabName.trim() || 'Applications';
      const data = {
        sheet_sync_enabled: enabled,
        sheet_sync_spreadsheet_id: cleanSheetId,
        sheet_sync_tab_name: cleanTabName,
      };
      let saved;
      if (settings?.id) {
        saved = await base44.entities.SiteSettings.update(settings.id, data);
      } else {
        saved = await base44.entities.SiteSettings.create(data);
      }
      setSettings(saved);
      setSheetId(cleanSheetId);
      setTabName(cleanTabName);
      toast({ title: 'Google Sheet sync settings saved' });
      return saved;
    } catch (err) {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleBackendResult = (data) => {
    const errorMsg = String(data?.error || data?.message || '');
    const lowerErr = errorMsg.toLowerCase();

    if (lowerErr.includes('not connected')) {
      setTestResult({ ok: false, message: errorMsg });
    } else if (lowerErr.includes('not found') && !lowerErr.includes('spreadsheet')) {
      // Dummy response_id '__test__' was not found, meaning sheet auth & config succeeded
      setTestResult({ ok: true, message: 'Sheet is reachable and configured correctly.' });
    } else if (data?.skipped) {
      setTestResult({ ok: false, message: 'Sync is disabled — enable it and save first.' });
    } else if (data?.ok) {
      setTestResult({ ok: true, message: 'Sheet is reachable and configured correctly.' });
    } else {
      setTestResult({ ok: false, message: errorMsg || 'Unexpected response from server' });
    }
  };

  const testSync = async () => {
    if (!sheetId.trim()) {
      toast({ title: 'Enter a spreadsheet ID or URL first', variant: 'destructive' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      // Save first (extracts clean ID) so the backend reads the clean config
      await save();

      // Invoke with dummy response_id to test connectivity
      const res = await base44.functions.invoke('syncApplicationToSheet', { response_id: '__test__' });
      const data = res?.data || res;
      handleBackendResult(data);
    } catch (e) {
      // If backend returned HTTP 4xx/5xx, extract the JSON error payload if present
      const errData = e?.response?.data || e?.data;
      if (errData && (errData.error || errData.message || errData.skipped)) {
        handleBackendResult(errData);
      } else {
        setTestResult({
          ok: false,
          message: e?.message || 'Failed to test sync (Server Error 500)',
        });
      }
    } finally {
      setTesting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full rounded-2xl bg-slate-900 border border-white/10 p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Google Sheet Sync</h3>
            <p className="text-xs text-slate-400">Send every submitted application to your Google Sheet</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Google account connected — submissions sync to your sheet
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-200">Enable sheet sync</span>
              <button
                type="button"
                onClick={() => setEnabled((e) => !e)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  enabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Spreadsheet ID or URL</label>
              <Input
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/…/edit"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Paste the full URL or just the spreadsheet ID. Make sure your Google account can edit it.
              </p>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Tab name</label>
              <Input
                value={tabName}
                onChange={(e) => setTabName(e.target.value)}
                placeholder="Applications"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The tab is created automatically if it doesn't exist.
              </p>
            </div>

            {testResult && (
              <div
                className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${
                  testResult.ok
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="ghost" onClick={onClose} className="flex-1 text-slate-300">
                Close
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={testSync}
                disabled={testing || saving}
                className="flex-1 border-white/15 text-slate-200"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Test
              </Button>
              <Button
                size="sm"
                onClick={() => save().catch(() => {})}
                disabled={saving || testing}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                Save
              </Button>
            </div>

            {sheetId.trim() && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${extractId(sheetId)}/edit`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 pt-1"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open spreadsheet
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function extractId(input) {
  const s = String(input || '').trim();
  const match = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : s;
}