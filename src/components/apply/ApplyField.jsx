import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check, Play, ExternalLink, Gamepad2, MessageSquare, Info, Globe, CalendarClock } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import FileUploadField from '@/components/apply/FileUploadField';
import { extractYouTubeId, AGE_BRACKETS, COMMON_TIMEZONES, WEEKDAYS } from '@/lib/applicationTypes';
import { useAuth } from '@/lib/AuthContext';

const inputCls = 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 text-base rounded-xl focus-visible:ring-cyan-500/50';

function ChoiceRow({ selected, onClick, label, multi }) {
  return (
    <button type="button" onClick={onClick} className={`w-full flex items-center gap-3 text-left rounded-xl border px-4 py-3 transition-all ${selected ? 'bg-cyan-500/15 border-cyan-500/40 text-white' : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:border-white/20'}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${multi ? 'rounded-md' : 'rounded-full'} ${selected ? 'bg-cyan-500 border-cyan-400' : 'border-white/30'}`}>
        {selected && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default function ApplyField({ q, value, onChange, autoFocus }) {
  const { user } = useAuth();
  const linkedRoblox = user?.roblox_username || user?.data?.roblox_username || '';

  switch (q.type) {
    case 'section':
      return (
        <div className="rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300 leading-relaxed">
            {q.description || 'Read the section details above and click Next to continue.'}
          </div>
        </div>
      );
    case 'textarea': {
      const text = value || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const minLen = q.validation?.minLength || 0;
      const depthHint =
        words === 0
          ? 'Tip: Detailed answers (20+ words) stand out to reviewers'
          : words < 8
          ? 'Consider adding a bit more detail'
          : words >= 25
          ? '✓ Strong detail level'
          : 'Good start — add examples if helpful';
      const insertSnippet = (snippet) => {
        const prefix = text && !text.endsWith('\n') ? `${text}\n` : text;
        onChange(`${prefix}${snippet}`);
      };
      return (
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[11px] text-slate-500 mr-1">Quick structure:</span>
            <button
              type="button"
              onClick={() => insertSnippet('• ')}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-slate-300 hover:text-white transition-colors"
            >
              + Bullet point
            </button>
            <button
              type="button"
              onClick={() =>
                insertSnippet('Situation: \nAction I took: \nResult: ')
              }
              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-[11px] text-cyan-200 transition-colors"
            >
              + Situation / Action / Result
            </button>
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => onChange(text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim())}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                Clean spacing
              </button>
            )}
          </div>
          <Textarea autoFocus={autoFocus} value={text} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'Type your answer…'} maxLength={q.maxLength || q.validation?.maxLength || undefined} className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[160px] text-base rounded-xl focus-visible:ring-cyan-500/50" />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {words} word{words === 1 ? '' : 's'} · {text.length} chars
              {minLen > 0 && (
                <span className={text.length >= minLen ? 'text-emerald-400 ml-2' : 'text-amber-300 ml-2'}>
                  (min {minLen} chars)
                </span>
              )}
            </span>
            <span className={words >= 25 ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
              {depthHint}
              {(q.maxLength > 0 || q.validation?.maxLength > 0) ? ` · ${text.length}/${q.maxLength || q.validation?.maxLength}` : ''}
            </span>
          </div>
        </div>
      );
    }
    case 'scale': {
      const max = Number(q.scaleMax) || 10;
      const nums = Array.from({ length: max }, (_, i) => i + 1);
      return (
        <div className="space-y-2.5">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${nums.length}, minmax(0, 1fr))` }}>
            {nums.map((n) => {
              const active = Number(value) === n;
              return (
                <button
                  type="button"
                  key={n}
                  onClick={() => onChange(n)}
                  className={`h-12 rounded-xl border text-sm font-bold transition-all ${
                    active
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.2)] scale-[1.03]'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>{q.scaleMinLabel || 'Beginner'}</span>
            <span>{q.scaleMaxLabel || 'Expert'}</span>
          </div>
        </div>
      );
    }
    case 'slider': {
      const min = Number(q.sliderMin ?? 0);
      const max = Number(q.sliderMax ?? 40);
      const unit = q.sliderUnit ?? 'hrs/wk';
      const cur = value !== undefined && value !== '' ? Number(value) : min;
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Drag slider to select value</span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/35 text-sm font-bold text-cyan-200">
              {cur} {unit}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={q.sliderStep || 1}
            value={cur}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{min} {unit}</span>
            <span>{Math.round((min + max) / 2)} {unit}</span>
            <span>{max} {unit}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[min, Math.round(min + (max - min) * 0.25), Math.round((min + max) / 2), Math.round(min + (max - min) * 0.75), max]
              .filter((v, idx, arr) => arr.indexOf(v) === idx)
              .map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange(preset)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    Number(value) === preset
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset} {unit}
                </button>
              ))}
          </div>
        </div>
      );
    }
    case 'age_range': {
      const brackets = q.options && q.options.length ? q.options : AGE_BRACKETS;
      return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {brackets.map((b) => {
            const active = value === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => onChange(b)}
                className={`h-12 rounded-xl border text-sm font-semibold transition-all ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.15)]'
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      );
    }
    case 'timezone': {
      const detectTz = () => {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const offsetMin = -new Date().getTimezoneOffset();
          const sign = offsetMin >= 0 ? '+' : '-';
          const hrs = Math.floor(Math.abs(offsetMin) / 60);
          onChange(`${tz} (UTC${sign}${hrs})`);
        } catch {}
      };
      return (
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={COMMON_TIMEZONES.includes(value) ? value : ''} onValueChange={onChange}>
              <SelectTrigger className={`${inputCls} flex-1`}>
                <SelectValue placeholder={value || 'Select your timezone…'} />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="focus:bg-cyan-500/15 focus:text-white">
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={detectTz}
              className="h-12 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-semibold text-cyan-200 inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              <Globe className="h-4 w-4 text-cyan-400" /> Auto-detect my timezone
            </button>
          </div>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or type your timezone manually (e.g. EST / UTC-5)…"
            className={inputCls}
          />
        </div>
      );
    }
    case 'availability': {
      const currentStr = typeof value === 'string' ? value : '';
      const selectedDays = WEEKDAYS.filter((d) => currentStr.includes(d));
      const toggleDay = (day) => {
        const nextDays = selectedDays.includes(day)
          ? selectedDays.filter((d) => d !== day)
          : [...selectedDays, day];
        const notesPart = currentStr.includes(' — ') ? currentStr.split(' — ')[1] : '';
        const base = nextDays.join(', ');
        onChange(notesPart ? `${base} — ${notesPart}` : base);
      };
      const notesVal = currentStr.includes(' — ') ? currentStr.split(' — ')[1] : '';
      const setNotes = (txt) => {
        const base = selectedDays.join(', ') || 'Flexible';
        onChange(txt ? `${base} — ${txt}` : base);
      };
      return (
        <div className="space-y-3">
          <div>
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-cyan-400" /> Select the days you are typically available:
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`h-11 rounded-xl border text-xs font-semibold transition-all ${
                      active
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          <Input
            value={notesVal}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Typical hours / schedule notes (e.g. 4pm–9pm EST on weekdays, all day weekends)"
            className={inputCls}
          />
        </div>
      );
    }
    case 'discord':
      return (
        <div className="space-y-2">
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
            <Input
              autoFocus={autoFocus}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={q.placeholder || 'e.g. username or 123456789012345678'}
              className={`${inputCls} pl-10`}
            />
          </div>
          <p className="text-xs text-slate-500">Enter your Discord username (e.g. @player) or 18-digit Discord User ID.</p>
        </div>
      );
    case 'roblox':
      return (
        <div className="space-y-2">
          <div className="relative">
            <Gamepad2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <Input
              autoFocus={autoFocus}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={q.placeholder || 'Enter your Roblox username…'}
              className={`${inputCls} pl-10`}
            />
          </div>
          {linkedRoblox && value !== linkedRoblox && (
            <button
              type="button"
              onClick={() => onChange(linkedRoblox)}
              className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Gamepad2 className="h-3.5 w-3.5" /> Use linked Roblox account: <strong>@{linkedRoblox}</strong>
            </button>
          )}
        </div>
      );
    case 'url': {
      const isValidUrl = typeof value === 'string' && /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(value.trim());
      return (
        <div className="space-y-2">
          <Input
            autoFocus={autoFocus}
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder || 'https://…'}
            className={inputCls}
          />
          {isValidUrl && (
            <a
              href={value.trim()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Preview link in new tab
            </a>
          )}
        </div>
      );
    }
    case 'number':
      return <Input autoFocus={autoFocus} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'Enter a number…'} className={inputCls} />;
    case 'email':
      return <Input autoFocus={autoFocus} type="email" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'name@example.com'} className={inputCls} />;
    case 'date':
      return <Input autoFocus={autoFocus} type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
    case 'dropdown':
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={inputCls}><SelectValue placeholder="Select an option…" /></SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10 text-white">
            {(q.options || []).filter(Boolean).map((opt, i) => <SelectItem key={i} value={opt} className="focus:bg-cyan-500/15 focus:text-white">{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    case 'radio':
      return <div className="space-y-2">{(q.options || []).map((opt, i) => <ChoiceRow key={i} label={opt} selected={value === opt} onClick={() => onChange(opt)} />)}</div>;
    case 'checkbox': {
      const arr = Array.isArray(value) ? value : [];
      return <div className="space-y-2">{(q.options || []).map((opt, i) => <ChoiceRow key={i} multi label={opt} selected={arr.includes(opt)} onClick={() => onChange(arr.includes(opt) ? arr.filter((o) => o !== opt) : [...arr, opt])} />)}</div>;
    }
    case 'rating':
      return (
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => onChange(n)} className="p-1 transition-transform hover:scale-110">
              <Star className={`h-9 w-9 transition-colors ${(value || 0) >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-slate-400'}`} />
            </button>
          ))}
        </div>
      );
    case 'yesno':
      return (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => onChange(true)} className={`h-14 rounded-xl text-base font-medium border transition-colors ${value === true ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>Yes</button>
          <button type="button" onClick={() => onChange(false)} className={`h-14 rounded-xl text-base font-medium border transition-colors ${value === false ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>No</button>
        </div>
      );
    case 'file':
    case 'screenshot':
      return <FileUploadField q={q} value={value} onChange={onChange} />;
    case 'code':
      return (
        <div>
          <textarea autoFocus={autoFocus} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'Paste your code here…'} spellCheck={false}
            className="w-full bg-slate-950 border border-white/10 text-emerald-300 placeholder:text-slate-600 font-mono text-sm min-h-[200px] rounded-xl p-4 focus:outline-none focus:border-cyan-500/40 resize-y leading-relaxed" />
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono">{'{ }'}</span>
            {q.maxLength > 0 && <span>{(value || '').length}/{q.maxLength}</span>}
          </div>
        </div>
      );
    case 'youtube': {
      const embeddedId = extractYouTubeId(q.youtubeUrl);
      const userVideoId = extractYouTubeId(value);
      if (embeddedId) {
        const watched = value === 'Watched' || (typeof value === 'string' && value.trim().length > 0);
        return (
          <div className="space-y-4">
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${embeddedId}`}
                title={q.text || 'YouTube video'}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => onChange(watched ? '' : 'Watched')}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  watched
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${watched ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/30'}`}>
                  {watched && <Check className="h-3.5 w-3.5" />}
                </span>
                I have watched this video
              </button>
              <Input
                value={value === 'Watched' ? '' : (value || '')}
                onChange={(e) => onChange(e.target.value || (watched ? 'Watched' : ''))}
                placeholder={q.placeholder || 'Optional notes or response about the video…'}
                className={`${inputCls} flex-1`}
              />
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-3">
          <Input
            autoFocus={autoFocus}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder || 'Paste a YouTube video link (https://www.youtube.com/watch?v=…)'}
            className={inputCls}
          />
          {userVideoId ? (
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${userVideoId}`}
                title="Submitted YouTube video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Play className="h-3.5 w-3.5 text-rose-400" /> Paste a valid YouTube link to preview the video
            </div>
          )}
        </div>
      );
    }
    default:
      return (
        <div>
          <Input autoFocus={autoFocus} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={q.placeholder || 'Type your answer…'} maxLength={q.maxLength || undefined} className={inputCls} />
          {q.maxLength > 0 && <div className="mt-1.5 text-right text-xs text-slate-500">{(value || '').length}/{q.maxLength}</div>}
        </div>
      );
  }
}