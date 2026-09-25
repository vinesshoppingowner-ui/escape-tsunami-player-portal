import { base44 } from '@/api/base44Client';
import { formatAnswer } from '@/lib/applicationTypes';

// Asks the AI to grade an application response. Returns fields ready to save on ApplicationResponse.
export async function runAIReview(application, answers) {
  const questions = JSON.parse(application.questions || '[]');
  const settings = JSON.parse(application.settings || '{}');
  const qa = questions
    .map((q, i) => `Q${i + 1}${q.required ? ' (required)' : ''}: ${q.text}\nAnswer: ${formatAnswer(q, answers[q.id]) || '(no answer)'}`)
    .join('\n\n');

  const res = await base44.integrations.Core.InvokeLLM({
    prompt: `You are screening applications for "${application.title}" in the Roblox game community "Escape Tsunami".
${application.description ? `About the application: ${application.description}\n` : ''}${settings.aiCriteria ? `Staff grading criteria: ${settings.aiCriteria}\n` : ''}
Grade this applicant fairly. Consider effort, maturity, honesty, relevance, grammar, and whether answers are detailed.
Flag things like: low effort or one-word answers, copy-pasted or likely AI-generated text, contradictions, inappropriate content, troll answers, age/eligibility concerns.
Score 0-100. Recommend "accept" (strong, 75+), "review" (borderline), or "reject" (weak or problematic).

Applicant answers:
${qa}`,
    response_json_schema: {
      type: 'object',
      properties: {
        score: { type: 'number' },
        recommendation: { type: 'string', enum: ['accept', 'review', 'reject'] },
        summary: { type: 'string', description: '2-3 sentence overview' },
        strengths: { type: 'array', items: { type: 'string' } },
        concerns: { type: 'array', items: { type: 'string' } },
        flags: { type: 'array', items: { type: 'string' }, description: 'Short red-flag labels, empty if none' },
      },
    },
  });

  return {
    ai_score: Math.round(res.score),
    ai_recommendation: res.recommendation,
    ai_summary: res.summary,
    ai_review: JSON.stringify({ strengths: res.strengths || [], concerns: res.concerns || [], flags: res.flags || [] }),
  };
}