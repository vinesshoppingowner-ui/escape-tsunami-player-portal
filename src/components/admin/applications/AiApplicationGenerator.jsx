import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, X, Wand2, ListOrdered } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { defaultQuestion, QUESTION_TYPES } from '@/lib/applicationTypes';

const VALID_TYPES = QUESTION_TYPES.map((t) => t.value);

const TONE_OPTIONS = [
  { value: 'exact', label: 'Exact Paste', hint: 'Keeps every pasted question & wording in exact order' },
  { value: 'natural', label: 'Less AI', hint: 'Short, casual, human-sounding questions' },
  { value: 'balanced', label: 'Balanced', hint: 'Professional and thorough' },
  { value: 'comprehensive', label: 'More AI', hint: 'Detailed, structured, exhaustive' },
];

// Detect if the user pasted a multi-question list so we can preserve every item in exact order
function detectPastedQuestions(rawText) {
  if (!rawText) return [];
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Count lines that look like numbered/bulleted questions or end with a question mark
  const questionLikeLines = lines.filter(
    (l) =>
      /^(?:q(?:uestion)?\s*\d+[\s.):-]|#?\d+[\s.):-]|[-*•]\s+)/i.test(l) ||
      /\?\s*$/.test(l)
  );
  return questionLikeLines;
}

// Sanitize a single AI-generated question so it never produces a broken field
function sanitizeQuestion(q, index = 0) {
  if (!q || typeof q !== 'object') return null;
  const text = (q.text || '').trim();
  if (!text) return null;

  const type = VALID_TYPES.includes(q.type) ? q.type : 'text';
  const isChoice = ['dropdown', 'radio', 'checkbox'].includes(type);
  const options = isChoice
    ? (Array.isArray(q.options) ? q.options : []).map((o) => String(o).trim()).filter(Boolean)
    : [];

  // Choice questions with fewer than 2 options fall back to textarea
  const finalType = isChoice && options.length < 2 ? 'textarea' : type;

  const base = defaultQuestion();
  const question = {
    ...base,
    id: `${base.id}_${index}`,
    text,
    description: (q.description || '').trim(),
    type: finalType,
    required: finalType === 'section' ? false : q.required !== false,
    options,
    placeholder: (q.placeholder || '').trim(),
    maxLength: Number(q.maxLength) > 0 ? Number(q.maxLength) : 0,
    scaleMax: Number(q.scaleMax) === 5 ? 5 : 10,
    scaleMinLabel: (q.scaleMinLabel || 'Beginner').trim(),
    scaleMaxLabel: (q.scaleMaxLabel || 'Expert').trim(),
    youtubeUrl: (q.youtubeUrl || '').trim(),
  };

  if (finalType === 'file' || finalType === 'screenshot') {
    question.fileTypes = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4'];
    question.maxFileSize = 0; // Unlimited size for screenshots
    question.allowMultipleFiles = true;
  }

  return question;
}

export default function AiApplicationGenerator({ onGenerate, isEditing = false, existingForm }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState(isEditing ? 'append' : 'replace'); // 'append' or 'replace'
  const [tone, setTone] = useState('exact');
  const [loading, setLoading] = useState(false);

  const detectedPasted = useMemo(() => detectPastedQuestions(prompt), [prompt]);
  const isPastedList = detectedPasted.length >= 3 || tone === 'exact';

  const generate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Describe or paste the questions you want first', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const schema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string', description: 'A single emoji that represents this application' },
          category: { type: 'string' },
          success_message: { type: 'string' },
          questions: {
            type: 'array',
            description: 'Complete ordered list of questions. Must include EVERY question requested or pasted in the exact order given.',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string', description: 'The question text (or section header title) shown to applicants' },
                description: { type: 'string', description: 'Optional helper text / sub-prompt shown under the question' },
                type: { type: 'string', enum: VALID_TYPES },
                required: { type: 'boolean' },
                options: { type: 'array', items: { type: 'string' }, description: 'REQUIRED for dropdown, radio, checkbox — 2 or more choices. Leave empty for other types.' },
                placeholder: { type: 'string', description: 'Placeholder hint for text/textarea/number/email/discord/roblox fields' },
                maxLength: { type: 'number', description: 'Max character count for text/textarea. 0 for no limit.' },
                scaleMax: { type: 'number', description: 'For scale type: 5 or 10 (default 10)' },
                scaleMinLabel: { type: 'string', description: 'For scale type: label for 1 (e.g. Beginner)' },
                scaleMaxLabel: { type: 'string', description: 'For scale type: label for max (e.g. Expert)' },
              },
              required: ['text', 'type', 'required'],
            },
          },
        },
        required: ['title', 'description', 'icon', 'category', 'questions'],
      };

      const existingQuestionsList = (existingForm?.questions || [])
        .map((q, i) => `${i + 1}. [type=${q.type}, required=${Boolean(q.required)}${q.options?.length ? `, options=${JSON.stringify(q.options)}` : ''}] ${q.text}${q.description ? ` — (${q.description})` : ''}`)
        .join('\n');

      const existingContext = existingForm
        ? `\n\nEXISTING FORM CONTEXT:\nTitle: ${existingForm.title || 'Untitled'}\nDescription: ${existingForm.description || 'None'}\nExisting Questions (${(existingForm.questions || []).length}):\n${existingQuestionsList || 'None yet'}`
        : '';

      const explicitCountMatch = prompt.match(/(\d+)\s*(?:questions|question|q\b|items|prompts)/i);
      const requestedCount = explicitCountMatch ? parseInt(explicitCountMatch[1], 10) : null;

      let countAndOrderRule = '';
      if (detectedPasted.length >= 2 || tone === 'exact') {
        countAndOrderRule = `CRITICAL ORDER & COMPLETENESS RULE:
- The user has pasted or listed specific questions/items (detected at least ${detectedPasted.length || 'multiple'} items).
- You MUST include EVERY SINGLE question/item from the user's input — whether there are 5, 15, 20, or 35+ questions.
- NEVER cap, truncate, summarize, merge, or skip ANY question.
- Preserve the EXACT ORDER (1st to last) in which the user pasted or wrote the questions.
- Strip leading numbering (like "1.", "Q1:", "•") from the question "text" field so it renders cleanly, while keeping the exact order.
- If the pasted text includes section dividers/headers, convert them into items with type="section" in their exact position.`;
      } else if (requestedCount) {
        countAndOrderRule = `Generate EXACTLY ${requestedCount} questions in a logical order — not fewer and not more.`;
      } else {
        countAndOrderRule = `Generate a complete, thorough set of questions (typically 8–15 questions unless the user asks for a different amount) in the exact order the user describes.`;
      }

      const editModeInstruction = isEditing
        ? mode === 'append'
          ? `EDIT MODE — APPEND NEW QUESTIONS:
- The user wants to ADD new questions to the existing form.
- Output ONLY the new questions to be added in the "questions" array, in the EXACT order the user pasted or requested them.
- Do NOT repeat the existing questions unless the user explicitly pasted them to be added again.`
          : `EDIT MODE — MODIFY / REPLACE FULL QUESTION LIST:
- Return the complete updated "questions" array for the form.
- If the user pasted a full replacement list of questions, include EVERY pasted question in the exact order given.
- If the user asked to edit, reorder, insert, or remove specific existing questions, apply those exact edits to the existing questions list while keeping all other existing questions intact in their proper order.`
        : `CREATE MODE:
- Create the full application form and include every question the user pasted or requested in the exact order given.`;

      const toneInstructions = {
        exact: `TONE (EXACT PASTE MODE): Keep the user's pasted question wording as close to verbatim as possible (only clean up obvious numbering prefixes like "1." or "Q1:" and put parenthetical hints like "(e.g. ...)" into the "description" or "placeholder" field). Do NOT rewrite, condense, or reorder their questions.`,
        natural: `TONE: Write like a real person talking to another person. Keep questions clear, casual, and conversational. Still include EVERY question the user asked for in their exact order.`,
        balanced: `TONE: Professional and approachable. Clear, well-structured questions. Still include EVERY question the user asked for in their exact order.`,
        comprehensive: `TONE: Detailed, structured, and thorough. Include helpful "description" subtext under each question explaining what a strong answer looks like. Still include EVERY question the user asked for in their exact order.`,
      };

      const systemPrompt = `You are an expert application & form builder.

${countAndOrderRule}

${editModeInstruction}

${toneInstructions[tone] || toneInstructions.exact}

SUPPORTED QUESTION TYPES (pick the best match for each question):
- "text": Short single-line answer (names, timezones, short facts)
- "textarea": Long multi-line paragraph answer (why you want to join, scenario responses, experience, detailed explanations)
- "discord": Discord username / Discord User ID question
- "roblox": Roblox username / Roblox profile link question
- "dropdown": Single selection from a dropdown list (provide 2+ options)
- "radio": Single selection from visible multiple-choice options (provide 2+ options)
- "checkbox": Multiple selection checkboxes (provide 2+ options)
- "scale": Linear numeric scale 1–10 or 1–5 (set scaleMax, scaleMinLabel, scaleMaxLabel)
- "rating": 1–5 star rating
- "yesno": Yes / No toggle question (e.g. "Do you have a working microphone?", "Are you 13 or older?")
- "number": Numeric input (age, hours per week, years of experience)
- "email": Email address input
- "url": Website, portfolio, or profile link
- "date": Date picker
- "screenshot": Screenshot or file upload (supports any screenshot size & multiple screenshots)
- "file": Document/file upload
- "age_range": Age bracket selector
- "timezone": Timezone selector with auto-detect
- "availability": Weekly schedule / availability selector
- "slider": Interactive slider (e.g. hours per week)
- "code": Code snippet input
- "section": Section header / divider block (non-input header that groups questions; set text to the section title and description to any section instructions)

CRITICAL RULES:
1. NEVER drop Roblox username, Discord username, email, or age questions if the user pasted or asked for them — use "roblox", "discord", "email", or "number".
2. Output ALL questions in the EXACT order the user pasted or described them. Never stop after 5 questions when the user provided more.
3. For "dropdown", "radio", and "checkbox", always include at least 2 options in "options".
4. If a pasted question has sub-text or examples like "(e.g., EST, GMT)" or "(Minimum 3 sentences)", place that helper text in "description".`;

      const fullPrompt = `${systemPrompt}${existingContext}\n\nUSER INPUT / QUESTIONS TO PROCESS:\n${prompt.trim()}`;
      let res = null;
      try {
        const fnRes = await base44.functions.invoke('generateApplicationAI', {
          prompt: fullPrompt,
          response_json_schema: schema,
        });
        res = fnRes?.data?.data || fnRes?.data || null;
      } catch (fnErr) {
        const errMsg = fnErr?.response?.data?.error || fnErr?.message || '';
        if (/api_key_invalid|api key not valid/i.test(errMsg)) {
          throw new Error(errMsg);
        }
        res = await base44.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          response_json_schema: schema,
        });
      }

      const questions = (res?.questions || [])
        .map((q, idx) => sanitizeQuestion(q, idx))
        .filter(Boolean);

      if (!questions.length) {
        toast({ title: 'AI did not generate any valid questions', variant: 'destructive' });
        return;
      }

      onGenerate({
        title: res.title || existingForm?.title || 'Untitled Application',
        description: res.description || existingForm?.description || '',
        icon: res.icon || existingForm?.icon || '📋',
        category: res.category || existingForm?.category || 'General',
        success_message: res.success_message || '',
        questions,
        mode: isEditing ? mode : 'replace',
      });
      toast({
        title: isEditing
          ? mode === 'append'
            ? `Added ${questions.length} question${questions.length === 1 ? '' : 's'} in order`
            : `Updated form with ${questions.length} question${questions.length === 1 ? '' : 's'}`
          : `Created application with ${questions.length} question${questions.length === 1 ? '' : 's'}`,
      });
      setOpen(false);
      setPrompt('');
    } catch (e) {
      toast({ title: 'AI generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const label = isEditing ? 'Edit with AI' : 'Create with AI';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-medium hover:bg-violet-500/25 hover:border-violet-500/50 transition-colors shrink-0"
      >
        <Sparkles className="h-4 w-4 shrink-0" /> <span>{label}</span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !loading && setOpen(false)}>
          <div className="w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl bg-slate-950 border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 border border-violet-500/30 shrink-0">
                  <Wand2 className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{label}</h2>
                  <p className="text-xs text-slate-400">Powered by built-in Gemini AI — preserves all pasted questions in exact order</p>
                </div>
              </div>
              <button onClick={() => !loading && setOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 shrink-0"><X className="h-5 w-5" /></button>
            </div>

            {isEditing && (
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('append')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${mode === 'append' ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                >
                  Add to existing (in order)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('replace')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${mode === 'replace' ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                >
                  Edit / Replace all questions
                </button>
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isEditing
                ? 'Paste your list of questions (e.g. 1–25) to add them in exact order, or describe the changes you want made to the form...'
                : 'Paste a full list of questions (all 20+ will be added in exact order with matching field types), or describe the application you want...'}
              rows={7}
              autoFocus
              className="w-full resize-y rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 outline-none text-sm text-white placeholder:text-slate-500 p-3 font-body"
            />

            {detectedPasted.length >= 2 && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 text-xs text-emerald-300">
                <ListOrdered className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Detected <strong>{detectedPasted.length}</strong> pasted questions — all of them will be added in exact 1-to-1 order.
                </span>
              </div>
            )}

            {/* AI Mode / Tone selector */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-400 mb-2 block">Generation Mode</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors text-center ${tone === opt.value ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">{TONE_OPTIONS.find((t) => t.value === tone)?.hint}</p>
            </div>

            <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 hidden sm:block">
                {isPastedList ? 'Keeps every pasted question in exact order' : 'Generates title, description, icon & all questions'}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="text-slate-300 hover:text-white hover:bg-white/10 flex-1 sm:flex-initial">Cancel</Button>
                <Button onClick={generate} disabled={loading} className="bg-violet-500 hover:bg-violet-600 text-white border-0 flex-1 sm:flex-initial">
                  {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                  {loading ? 'Processing all questions...' : isEditing ? (mode === 'append' ? 'Add Questions' : 'Apply AI Changes') : 'Generate Application'}
                </Button>
              </div>
            </div>
            {loading && (
              <div className="mt-4 flex items-center gap-2 text-xs text-violet-300/80">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing every question in order — please wait...
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}