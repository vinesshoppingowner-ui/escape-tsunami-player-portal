import { useState } from 'react';
import { createPortal } from 'react-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, X, Wand2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { defaultQuestion, QUESTION_TYPES } from '@/lib/applicationTypes';

const VALID_TYPES = QUESTION_TYPES.map((t) => t.value);

const TONE_OPTIONS = [
  { value: 'natural', label: 'Less AI', hint: 'Short, casual, human-sounding questions' },
  { value: 'balanced', label: 'Balanced', hint: 'Professional and thorough' },
  { value: 'comprehensive', label: 'More AI', hint: 'Detailed, structured, exhaustive' },
];

// Sanitize a single AI-generated question so it never produces a broken field
function sanitizeQuestion(q) {
  if (!q || typeof q !== 'object') return null;
  const text = (q.text || '').trim();
  if (!text) return null;

  const type = VALID_TYPES.includes(q.type) ? q.type : 'text';
  const isChoice = ['dropdown', 'radio', 'checkbox'].includes(type);
  const options = isChoice
    ? (Array.isArray(q.options) ? q.options : []).map((o) => String(o).trim()).filter(Boolean)
    : [];

  // Choice questions with no options are invalid — fall back to text
  const finalType = isChoice && options.length < 2 ? 'textarea' : type;

  const question = {
    ...defaultQuestion(),
    text,
    description: (q.description || '').trim(),
    type: finalType,
    required: q.required === true,
    options,
    placeholder: (q.placeholder || '').trim(),
    maxLength: Number(q.maxLength) > 0 ? Number(q.maxLength) : 0,
  };

  // File questions: ensure file types and size are set
  if (finalType === 'file') {
    question.fileTypes = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt'];
    question.maxFileSize = 5;
  }

  return question;
}

export default function AiApplicationGenerator({ onGenerate, isEditing = false, existingForm }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('replace'); // 'replace' or 'append'
  const [tone, setTone] = useState('balanced');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Describe what you want first', variant: 'destructive' });
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
            items: {
              type: 'object',
              properties: {
                text: { type: 'string', description: 'The question text shown to applicants' },
                description: { type: 'string', description: 'Optional helper text shown under the question' },
                type: { type: 'string', enum: VALID_TYPES },
                required: { type: 'boolean' },
                options: { type: 'array', items: { type: 'string' }, description: 'REQUIRED for dropdown, radio, checkbox — 2-6 choices. Leave empty for other types.' },
                placeholder: { type: 'string', description: 'Placeholder hint for text/textarea/number/email fields' },
                maxLength: { type: 'number', description: 'Max character count for text/textarea. 0 for no limit.' },
              },
              required: ['text', 'type', 'required'],
            },
          },
        },
        required: ['title', 'description', 'icon', 'category', 'questions'],
      };

      const existingContext = existingForm
        ? `\n\nEXISTING FORM (for context):\nTitle: ${existingForm.title || 'Untitled'}\nDescription: ${existingForm.description || 'None'}\nCurrent questions: ${(existingForm.questions || []).map((q, i) => `${i + 1}. [${q.type}] ${q.text}`).join('\n') || 'None yet'}`
        : '';

      const countMatch = prompt.match(/(\d+)\s*(?:questions|questions|q|items|prompts)/i);
      const requestedCount = countMatch ? parseInt(countMatch[1], 10) : null;

      const defaultCount = isEditing ? '3-6' : '4-8';
      const countInstruction = requestedCount
        ? `Generate EXACTLY ${requestedCount} questions — not more, not less. The user specifically asked for this number.`
        : `Generate ${defaultCount} questions.`;

      const toneInstructions = {
        natural: `TONE: Write like a real person talking to another person. Keep questions short, casual, and conversational — like a chat, not a form. Avoid corporate jargon, avoid overly formal language, avoid buzzwords. Use plain English. Prefer 1 sentence per question. Descriptions should be brief and friendly. ${countInstruction}`,
        balanced: `TONE: Professional and approachable. Clear, well-structured questions that thoroughly evaluate the applicant without being overly stiff. ${countInstruction}`,
        comprehensive: `TONE: Detailed, structured, and exhaustive. Write thorough, multi-part questions that probe deeply. Include detailed descriptions explaining exactly what you expect. Cover every angle. Use professional terminology where appropriate. ${countInstruction} Descriptions should be detailed paragraphs.`,
      };

      const systemPrompt = `You are an expert form designer. A staff member wants to ${isEditing ? 'modify' : 'create'} a form. Generate a complete, professional form based on their description.

IMPORTANT: Follow the user's request exactly. If they ask for trivia, a quiz, a survey, a game, or any non-application topic — generate questions about THAT topic. Do NOT force every form to be about Escape Tsunami for Developers, Roblox, or gaming unless the user specifically asks for that. The form can be about anything.

${toneInstructions[tone]}

QUESTION TYPES — use these correctly:
- "text": Short single-line answers (names, usernames, short phrases)
- "textarea": Long multi-line answers (explanations, essays, detailed responses)
- "dropdown": Single selection from a list (provide 2-6 options)
- "radio": Single selection from visible choices (provide 2-6 options)
- "checkbox": Multiple selections from a list (provide 2-6 options)
- "number": Numeric answers (age, hours, counts)
- "email": Email address input
- "date": Date picker
- "rating": 1-5 star rating scale
- "yesno": Yes or No toggle
- "file": File upload (for screenshots, documents, portfolios)
- "code": Code snippet input with syntax highlighting

CRITICAL RULES:
1. For dropdown, radio, and checkbox questions you MUST provide 2-6 options — never leave them empty
2. If a choice question would have fewer than 2 options, use "textarea" instead
3. Mark essential questions as required=true, optional ones as required=false
4. Write clear question text and helpful descriptions
5. Choose a fitting emoji icon and category
6. Write a welcoming success message
7. Do NOT include a question asking for their Roblox username or email (the portal captures those automatically)
8. Use "textarea" for any question expecting a paragraph or more of text
9. Use "rating" for self-assessment or scoring questions
10. Use "file" when the applicant needs to provide evidence or a portfolio`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}${existingContext}\n\nRequest: ${prompt.trim()}`,
        response_json_schema: schema,
      });

      const questions = (res.questions || [])
        .map(sanitizeQuestion)
        .filter(Boolean);

      if (!questions.length) {
        toast({ title: 'AI did not generate any valid questions', variant: 'destructive' });
        return;
      }

      onGenerate({
        title: res.title || 'Untitled Application',
        description: res.description || '',
        icon: res.icon || '📋',
        category: res.category || 'General',
        success_message: res.success_message || '',
        questions,
        mode,
      });
      toast({ title: isEditing ? 'Form updated with AI' : 'Application generated with AI' });
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
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-medium hover:bg-violet-500/25 hover:border-violet-500/50 transition-colors shrink-0"
      >
        <Sparkles className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline">{label}</span>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !loading && setOpen(false)}>
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-slate-950 border border-white/10 p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 border border-violet-500/30 shrink-0">
                  <Wand2 className="h-5 w-5 text-violet-300" />
                </div>
                <h2 className="text-lg font-semibold text-white">{label}</h2>
              </div>
              <button onClick={() => !loading && setOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:bg-white/5 shrink-0"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              {isEditing
                ? 'Describe what you want to change or add. The AI will regenerate the form based on your request.'
                : 'Describe the application you want and the AI will generate the title, description, and questions for you.'}
            </p>

            {isEditing && (
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setMode('replace')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${mode === 'replace' ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                >
                  Replace all questions
                </button>
                <button
                  onClick={() => setMode('append')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${mode === 'append' ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                >
                  Add to existing
                </button>
              </div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isEditing
                ? 'e.g. Add a question about their timezone and availability, and a file upload for a screenshot of their in-game stats'
                : 'e.g. A staff application for a moderation team — ask about their experience, why they want to join, how they handle conflicts, and their availability'}
              rows={5}
              autoFocus
              className="w-full resize-none rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 outline-none text-sm text-white placeholder:text-slate-500 p-3"
            />

            {/* AI Tone selector */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-400 mb-2 block">AI Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {TONE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={`px-2 py-2.5 rounded-lg text-xs font-medium border transition-colors text-center ${tone === opt.value ? 'bg-violet-500/20 border-violet-500/40 text-violet-200' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">{TONE_OPTIONS.find((t) => t.value === tone)?.hint}</p>
            </div>

            <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 hidden sm:block">AI generates title, description, icon &amp; questions</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="text-slate-300 hover:text-white hover:bg-white/10 flex-1 sm:flex-initial">Cancel</Button>
                <Button onClick={generate} disabled={loading} className="bg-violet-500 hover:bg-violet-600 text-white border-0 flex-1 sm:flex-initial">
                  {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />} {loading ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>
            {loading && (
              <div className="mt-4 flex items-center gap-2 text-xs text-violet-300/80">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing your request and crafting questions...
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}