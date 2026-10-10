import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, X, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { defaultQuestion } from '@/lib/applicationTypes';

const VALID_TYPES = ['text', 'textarea', 'dropdown', 'radio', 'checkbox', 'number', 'email', 'date', 'rating', 'yesno', 'file', 'code'];

export default function AiApplicationGenerator({ onGenerate }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Describe your application first', variant: 'destructive' });
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
                text: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string', enum: VALID_TYPES },
                required: { type: 'boolean' },
                options: { type: 'array', items: { type: 'string' }, description: 'Only for dropdown, radio, checkbox types' },
                placeholder: { type: 'string' },
                maxLength: { type: 'number', description: 'Max characters, 0 for none' },
              },
              required: ['text', 'type', 'required'],
            },
          },
        },
        required: ['title', 'description', 'icon', 'category', 'questions'],
      };

      const systemPrompt = `You are an expert form designer for a Roblox gaming community portal called "Escape Tsunami". 
A staff member wants to create an application form. Generate a complete, professional application based on their description.

Rules:
- Generate 4-8 well-crafted questions that thoroughly evaluate the applicant
- Use the most appropriate question type for each question (textarea for long answers, text for short, dropdown/radio/checkbox for choices, rating for scoring, yesno for confirmations, number for numeric, date for dates, file for uploads, code for code snippets)
- For choice questions (dropdown, radio, checkbox), provide 2-6 clear options
- Mark questions as required=true for essential ones, false for optional ones
- Write clear, professional question text and helpful descriptions
- Choose a fitting emoji icon and category
- Write a welcoming success message
- Make questions that help evaluate character, experience, and fit for the role
- Do NOT include a question asking for their Roblox username or email (the portal captures those automatically)
- Keep the tone professional but approachable`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nApplication description: ${prompt.trim()}`,
        response_json_schema: schema,
      });

      const questions = (res.questions || []).map((q) => ({
        ...defaultQuestion(),
        text: q.text || '',
        description: q.description || '',
        type: VALID_TYPES.includes(q.type) ? q.type : 'text',
        required: q.required ?? false,
        options: Array.isArray(q.options) ? q.options.filter(Boolean) : [],
        placeholder: q.placeholder || '',
        maxLength: q.maxLength || 0,
      })).filter((q) => q.text.trim());

      if (!questions.length) {
        toast({ title: 'AI did not generate any questions', variant: 'destructive' });
        return;
      }

      onGenerate({
        title: res.title || 'Untitled Application',
        description: res.description || '',
        icon: res.icon || '📋',
        category: res.category || 'General',
        success_message: res.success_message || '',
        questions,
      });
      toast({ title: 'Application generated with AI' });
      setOpen(false);
      setPrompt('');
    } catch (e) {
      toast({ title: 'AI generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/25 hover:border-violet-500/50 transition-colors"
      >
        <Sparkles className="h-4 w-4" /> Create with AI
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !loading && setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 border border-violet-500/30">
                  <Wand2 className="h-5 w-5 text-violet-300" />
                </div>
                <h2 className="text-lg font-semibold text-white">Create with AI</h2>
              </div>
              <button onClick={() => !loading && setOpen(false)} className="p-1.5 rounded-md text-slate-400 hover:bg-white/5"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-slate-400 mb-4">Describe the application you want to create and the AI will generate the title, description, and questions for you.</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A staff application for a moderation team — ask about their experience, why they want to join, how they handle conflicts, and their availability"
              rows={5}
              autoFocus
              className="w-full resize-none rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 outline-none text-sm text-white placeholder:text-slate-500 p-3"
            />
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">AI generates title, description, icon & questions</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="text-slate-300 hover:text-white hover:bg-white/10">Cancel</Button>
                <Button onClick={generate} disabled={loading} className="bg-violet-500 hover:bg-violet-600 text-white border-0">
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
        </div>
      )}
    </>
  );
}