import { base44 } from '@/api/base44Client';
import { formatAnswer } from '@/lib/applicationTypes';

// Asks the Google Gemini AI (via generateApplicationAI backend function) to grade an application response.
// Returns fields ready to save on ApplicationResponse.
export async function runAIReview(application, answers) {
  const questions = JSON.parse(application.questions || '[]');
  const settings = JSON.parse(application.settings || '{}');
  const qa = questions
    .filter((q) => q.type !== 'section')
    .map((q, i) => `Q${i + 1}${q.required ? ' (required)' : ''}: ${q.text}\nAnswer: ${formatAnswer(q, answers[q.id]) || '(no answer)'}`)
    .join('\n\n');

  const prompt = `You are screening applications for "${application.title}" in the Roblox game community "Escape Tsunami for Developers".
${application.description ? `About the application: ${application.description}\n` : ''}${settings.aiCriteria ? `Staff grading criteria: ${settings.aiCriteria}\n` : ''}
Grade this applicant fairly and thoroughly. Consider effort, maturity, honesty/authenticity, relevance, grammar, and whether answers are detailed.
Flag things like: low effort or one-word answers, copy-pasted or likely AI-generated text, contradictions, inappropriate content, troll answers, age/eligibility concerns.
Score 0-100 overall, and also provide 0-100 subscores for:
- effort_score (detail and completeness)
- maturity_score (professionalism, tone, and judgment)
- authenticity_score (100 = genuine human answer, low = robotic/AI-generated or copied)
- fit_score (alignment with role and community standards)
Also provide 3 specific follow-up interview questions tailored to their answers, and a 1-2 sentence suggested_feedback message that staff can send to the applicant.
Recommend "accept" (strong, 75+), "review" (borderline), or "reject" (weak or problematic).

Applicant answers:
${qa}`;

  const response_json_schema = {
    type: 'object',
    properties: {
      score: { type: 'number' },
      effort_score: { type: 'number' },
      maturity_score: { type: 'number' },
      authenticity_score: { type: 'number' },
      fit_score: { type: 'number' },
      recommendation: { type: 'string', enum: ['accept', 'review', 'reject'] },
      summary: { type: 'string' },
      strengths: { type: 'array', items: { type: 'string' } },
      concerns: { type: 'array', items: { type: 'string' } },
      flags: { type: 'array', items: { type: 'string' } },
      interview_questions: { type: 'array', items: { type: 'string' } },
      suggested_feedback: { type: 'string' },
    },
    required: ['score', 'recommendation', 'summary', 'strengths', 'concerns', 'flags'],
  };

  let res = null;
  let provider = 'gemini';
  let model = 'gemini';
  try {
    const fnRes = await base44.functions.invoke('generateApplicationAI', { prompt, response_json_schema });
    if (fnRes?.data?.error) throw new Error(fnRes.data.error);
    provider = fnRes?.data?.provider || 'gemini';
    model = fnRes?.data?.model || 'gemini';
    res = fnRes?.data?.data || fnRes?.data || null;
  } catch {
    provider = 'builtin';
    model = 'default';
    res = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema });
  }

  const overall = Math.max(0, Math.min(100, Math.round(Number(res?.score) || 0)));
  const clamp = (n, fallback) => Math.max(0, Math.min(100, Math.round(Number(n ?? fallback) || 0)));

  return {
    ai_score: overall,
    ai_recommendation: ['accept', 'review', 'reject'].includes(res?.recommendation) ? res.recommendation : (overall >= 75 ? 'accept' : overall >= 45 ? 'review' : 'reject'),
    ai_summary: res?.summary || '',
    ai_review: JSON.stringify({
      strengths: res?.strengths || [],
      concerns: res?.concerns || [],
      flags: res?.flags || [],
      subscores: {
        effort: clamp(res?.effort_score, overall),
        maturity: clamp(res?.maturity_score, overall),
        authenticity: clamp(res?.authenticity_score, 85),
        fit: clamp(res?.fit_score, overall),
      },
      interview_questions: res?.interview_questions || [],
      suggested_feedback: res?.suggested_feedback || '',
      provider,
      model,
    }),
  };
}

// Uses Google Gemini AI key to draft personalized staff feedback for the applicant
export async function generateAIFeedbackDraft(application, answers, status, applicantName) {
  const questions = JSON.parse(application.questions || '[]');
  const qa = questions
    .filter((q) => q.type !== 'section')
    .slice(0, 12)
    .map((q, i) => `Q${i + 1}: ${q.text}\nA: ${formatAnswer(q, answers[q.id]) || '(no answer)'}`)
    .join('\n\n');

  const toneMap = {
    accepted: 'warm, congratulatory acceptance message welcoming them and mentioning 1 specific thing they answered well, plus letting them know staff will reach out on Discord with next steps',
    under_review: 'encouraging update letting them know their application stood out and is under closer review / shortlisted for a quick follow-up interview',
    rejected: 'polite, constructive rejection message thanking them for applying, gently noting what they can improve for next time without being harsh',
    submitted: 'helpful status note thanking them for their submission',
  };

  const prompt = `Write a concise 2-3 sentence staff feedback message to applicant "${applicantName || 'Applicant'}" for "${application.title}" in "Escape Tsunami for Developers".
Decision status: ${status} (${toneMap[status] || toneMap.submitted}).
Reference their actual answers naturally so it feels personal and genuine.

Applicant answers:
${qa}`;

  const response_json_schema = {
    type: 'object',
    properties: {
      feedback: { type: 'string' },
    },
    required: ['feedback'],
  };

  try {
    const fnRes = await base44.functions.invoke('generateApplicationAI', { prompt, response_json_schema });
    const data = fnRes?.data?.data || fnRes?.data;
    if (data?.feedback) return data.feedback;
  } catch {}
  const fallback = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema });
  return fallback?.feedback || '';
}