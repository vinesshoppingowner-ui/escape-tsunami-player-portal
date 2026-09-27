import { Bold, Italic, Underline, Strikethrough, Code, EyeOff, Type, Quote } from 'lucide-react';

const WRAPS = [
  { icon: Bold, label: 'Bold', l: '**', r: '**' },
  { icon: Italic, label: 'Italic', l: '*', r: '*' },
  { icon: Underline, label: 'Underline', l: '__', r: '__' },
  { icon: Strikethrough, label: 'Strikethrough', l: '~~', r: '~~' },
  { icon: Type, label: 'Small text', l: '\n-# ', r: '\n' },
  { icon: Quote, label: 'Quote', l: '\n> ', r: '\n' },
  { icon: Code, label: 'Code', l: '`', r: '`' },
  { icon: EyeOff, label: 'Spoiler', l: '||', r: '||' },
];

// Discord only supports colors inside ```ansi code blocks
const COLORS = [
  ['Red', '31', 'bg-red-500'], ['Green', '32', 'bg-green-500'], ['Yellow', '33', 'bg-yellow-400'],
  ['Blue', '34', 'bg-blue-500'], ['Pink', '35', 'bg-pink-500'], ['Cyan', '36', 'bg-teal-400'], ['White', '37', 'bg-white'],
];

export default function FormatToolbar({ textareaRef, value, onChange }) {
  const apply = (l, r) => {
    const el = textareaRef.current;
    const s = el.selectionStart, e = el.selectionEnd;
    if (s === e) return;
    onChange(value.slice(0, s) + l + value.slice(s, e) + r + value.slice(e));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + l.length, e + l.length); });
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-white/10 bg-slate-900/60 p-1">
      {WRAPS.map((w) => (
        <button key={w.label} type="button" title={w.label} onMouseDown={(ev) => { ev.preventDefault(); apply(w.l, w.r); }}
          className="p-1.5 rounded text-slate-300 hover:bg-white/10 hover:text-white"><w.icon className="h-3.5 w-3.5" /></button>
      ))}
      <span className="h-4 w-px bg-white/10 mx-1" />
      {COLORS.map(([name, code, cls]) => (
        <button key={name} type="button" title={`${name} text`} onMouseDown={(ev) => { ev.preventDefault(); apply(`\n\`\`\`ansi\n\u001b[2;${code}m`, '\u001b[0m\n```\n'); }}
          className={`h-4 w-4 rounded-full ${cls} hover:ring-2 ring-white/40`} />
      ))}
      <span className="ml-auto text-[10px] text-slate-500 pr-1">Highlight text, then pick a style</span>
    </div>
  );
}