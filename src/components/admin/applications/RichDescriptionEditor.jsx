import { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  Link2,
  Minus,
  Eraser,
} from 'lucide-react';
import { toEditableHtml, sanitizeRichHtml, stripRichText } from '@/lib/richDescription';

const TEXT_COLORS = [
  { label: 'Default', color: '#e2e8f0' },
  { label: 'White', color: '#ffffff' },
  { label: 'Cyan', color: '#22d3ee' },
  { label: 'Sky', color: '#38bdf8' },
  { label: 'Emerald', color: '#34d399' },
  { label: 'Amber', color: '#fbbf24' },
  { label: 'Orange', color: '#fb923c' },
  { label: 'Rose', color: '#fb7185' },
  { label: 'Violet', color: '#a78bfa' },
  { label: 'Pink', color: '#f472b6' },
];

const HIGHLIGHT_COLORS = [
  { label: 'None', color: 'transparent' },
  { label: 'Cyan Glow', color: 'rgba(34, 211, 238, 0.22)' },
  { label: 'Emerald Glow', color: 'rgba(16, 185, 129, 0.22)' },
  { label: 'Amber Glow', color: 'rgba(245, 158, 11, 0.24)' },
  { label: 'Rose Glow', color: 'rgba(244, 63, 94, 0.24)' },
  { label: 'Violet Glow', color: 'rgba(139, 92, 246, 0.24)' },
];

export default function RichDescriptionEditor({ value, onChange, placeholder = 'Add a rich description with bullet points, colors, and formatting...' }) {
  const editorRef = useRef(null);
  const lastEmittedRef = useRef(null);
  const [colorMenu, setColorMenu] = useState(false);
  const [highlightMenu, setHighlightMenu] = useState(false);
  const [customColor, setCustomColor] = useState('#22d3ee');

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value === lastEmittedRef.current) return;
    const html = toEditableHtml(value);
    if (el.innerHTML !== html) {
      el.innerHTML = html;
    }
    lastEmittedRef.current = value;
  }, [value]);

  const emitChange = () => {
    const el = editorRef.current;
    if (!el) return;
    const raw = el.innerHTML;
    const plain = stripRichText(raw);
    const next = plain ? sanitizeRichHtml(raw) : '';
    lastEmittedRef.current = next;
    onChange(next);
  };

  const runCmd = (cmd, arg = null) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand('styleWithCSS', false, true);
    document.execCommand(cmd, false, arg);
    emitChange();
  };

  const applyHeading = (tag) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand('formatBlock', false, tag);
    emitChange();
  };

  const insertLink = () => {
    const url = window.prompt('Enter link URL (https://...)');
    if (!url) return;
    runCmd('createLink', url.trim());
  };

  const isEmpty = !stripRichText(value || '');

  const btnCls =
    'h-7 w-7 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0';

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/10 focus-within:border-cyan-400/50 transition-colors">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-white/10 bg-white/[0.02] rounded-t-xl">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('bold'); }} className={btnCls} title="Bold (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('italic'); }} className={btnCls} title="Italic (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('underline'); }} className={btnCls} title="Underline (Ctrl+U)">
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('strikeThrough'); }} className={btnCls} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-white/10 mx-1" />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); applyHeading('H2'); }} className={btnCls} title="Heading">
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); applyHeading('P'); }} className="h-7 px-1.5 rounded-md text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10" title="Normal text">
          Text
        </button>

        <span className="h-4 w-px bg-white/10 mx-1" />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('insertUnorderedList'); }} className={btnCls} title="Bullet points">
          <List className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('insertOrderedList'); }} className={btnCls} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); applyHeading('BLOCKQUOTE'); }} className={btnCls} title="Callout / Quote">
          <Quote className="h-3.5 w-3.5" />
        </button>

        <span className="h-4 w-px bg-white/10 mx-1" />

        {/* Text Color Picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setColorMenu((v) => !v);
              setHighlightMenu(false);
            }}
            className={`${btnCls} relative`}
            title="Text color"
          >
            <Palette className="h-3.5 w-3.5 text-cyan-300" />
          </button>
          {colorMenu && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className="absolute left-0 top-full mt-1.5 z-30 w-48 rounded-xl bg-slate-900 border border-white/15 p-2.5 shadow-2xl"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Text Color</div>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    title={c.label}
                    onClick={() => {
                      runCmd('foreColor', c.color);
                      setColorMenu(false);
                    }}
                    className="h-6 w-6 rounded-full border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
              <label className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10 text-xs text-slate-300 cursor-pointer">
                <span>Custom hex</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    runCmd('foreColor', e.target.value);
                  }}
                  className="h-6 w-8 rounded bg-transparent border-0 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setHighlightMenu((v) => !v);
              setColorMenu(false);
            }}
            className={btnCls}
            title="Highlight background"
          >
            <Highlighter className="h-3.5 w-3.5 text-amber-300" />
          </button>
          {highlightMenu && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className="absolute left-0 top-full mt-1.5 z-30 w-44 rounded-xl bg-slate-900 border border-white/15 p-2.5 shadow-2xl"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Highlight</div>
              <div className="space-y-1">
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.label}
                    type="button"
                    onClick={() => {
                      runCmd('hiliteColor', h.color);
                      setHighlightMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-slate-200 hover:bg-white/10 text-left"
                  >
                    <span
                      className="h-3.5 w-3.5 rounded border border-white/20 shrink-0"
                      style={{ backgroundColor: h.color }}
                    />
                    {h.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="h-4 w-px bg-white/10 mx-1" />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('justifyLeft'); }} className={btnCls} title="Align left">
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('justifyCenter'); }} className={btnCls} title="Align center">
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className={btnCls} title="Insert link">
          <Link2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('insertHorizontalRule'); }} className={btnCls} title="Insert divider">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); runCmd('removeFormat'); applyHeading('P'); }} className={btnCls} title="Clear formatting">
          <Eraser className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Editable Content Area */}
      <div className="relative">
        {isEmpty && (
          <div className="pointer-events-none absolute top-3 left-3.5 text-sm text-slate-500 select-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={() => {
            setColorMenu(false);
            setHighlightMenu(false);
            emitChange();
          }}
          className="min-h-[96px] max-h-72 overflow-y-auto px-3.5 py-3 text-sm text-slate-200 focus:outline-none leading-relaxed
            [&_p]:my-1
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-2 [&_h2]:mb-1
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-100 [&_h3]:mt-2 [&_h3]:mb-1
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_ul]:space-y-0.5
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_ol]:space-y-0.5
            [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/60 [&_blockquote]:bg-cyan-500/[0.06] [&_blockquote]:pl-3 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:rounded-r-lg
            [&_a]:text-cyan-300 [&_a]:underline
            [&_hr]:border-white/10 [&_hr]:my-2.5"
        />
      </div>
    </div>
  );
}