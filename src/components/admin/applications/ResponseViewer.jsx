import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ExternalLink, RotateCcw } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { RESPONSE_STATUS } from '@/lib/applicationTypes';
import ResponseAnswers from './ResponseAnswers';
import ResponseAIPanel from './ResponseAIPanel';
import ResponseDecisionPanel from './ResponseDecisionPanel';

export default function ResponseViewer({ responses, index, application, onIndex, onClose, onUpdate }) {
  const response = responses[index];

  useEffect(() => {
    const onKey = (e) => {
      if (['TEXTAREA', 'INPUT'].includes(e.target.tagName)) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < responses.length - 1) onIndex(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!response) return null;
  const questions = JSON.parse(application.questions || '[]');
  const answers = JSON.parse(response.answers || '{}');
  const st = RESPONSE_STATUS[response.status] || RESPONSE_STATUS.submitted;
  const navBtn = 'p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30';

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 flex items-center gap-3">
          <RobloxAvatar username={response.roblox_username} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-white">{response.roblox_username || 'Unknown'}</h3>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
              {response.attempt > 1 && <span className="inline-flex items-center gap-1 text-[11px] text-amber-300"><RotateCcw className="h-3 w-3" /> Attempt {response.attempt}</span>}
              {response.roblox_username && <Link to={`/admin/player/${response.roblox_username}`} className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white">Player profile <ExternalLink className="h-3 w-3" /></Link>}
            </div>
            <p className="text-xs text-slate-500 truncate">{response.submitted_by_email} · {new Date(response.created_date).toLocaleString()}</p>
          </div>
          <span className="hidden sm:block text-xs text-slate-500">{index + 1} / {responses.length}</span>
          <button className={navBtn} disabled={index === 0} onClick={() => onIndex(index - 1)} title="Previous (←)"><ChevronLeft className="h-4 w-4" /></button>
          <button className={navBtn} disabled={index === responses.length - 1} onClick={() => onIndex(index + 1)} title="Next (→)"><ChevronRight className="h-4 w-4" /></button>
          <button className={navBtn} onClick={onClose} title="Close (Esc)"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">
          <ResponseAnswers questions={questions} answers={answers} />
          <div className="space-y-4 lg:sticky lg:top-24">
            <ResponseAIPanel response={response} application={application} onUpdate={onUpdate} />
            <ResponseDecisionPanel response={response} application={application} onUpdate={onUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}