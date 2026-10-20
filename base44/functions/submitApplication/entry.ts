import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { application_id, answers, visible_question_ids } = body;

    if (!application_id) return Response.json({ error: 'Missing application_id' }, { status: 400 });
    if (!answers || typeof answers !== 'object') return Response.json({ error: 'Missing answers' }, { status: 400 });

    // Fetch the application (service role — applications are public-read)
    const app = await base44.asServiceRole.entities.Application.get(application_id);
    if (!app) return Response.json({ error: 'Application not found' }, { status: 404 });

    // Parse settings and questions safely
    let settings = {};
    let questions = [];
    try { settings = JSON.parse(app.settings || '{}') || {}; } catch {}
    try { questions = JSON.parse(app.questions || '[]') || []; } catch {}

    // Check application is open
    if (app.status !== 'open') return Response.json({ error: 'This application is no longer accepting responses.' }, { status: 403 });

    // Check auto_close_at
    if (app.auto_close_at && new Date(app.auto_close_at) < new Date()) {
      return Response.json({ error: 'This application has closed.' }, { status: 403 });
    }

    // Check response limit
    if (settings.responseLimit > 0 && (app.response_count || 0) >= settings.responseLimit) {
      return Response.json({ error: 'This application has reached its response limit.' }, { status: 403 });
    }

    // Check blacklist
    const identifiers = [user.email, user.roblox_username, user.data?.roblox_username].filter(Boolean).map((v) => v.toLowerCase());
    if (identifiers.length) {
      const blPage = await base44.asServiceRole.entities.ApplicationBlacklist.filter({ identifier: { $in: identifiers } }, { limit: 1 });
      if (blPage?.items?.length) return Response.json({ error: 'You are not permitted to submit applications.' }, { status: 403 });
    }

    // Check allowedUsers restriction
    if (settings.restrictToUsers) {
      const allowed = (settings.allowedUsers || []).map((u) => u.toLowerCase());
      const me = identifiers;
      if (allowed.length && !me.some((v) => allowed.includes(v))) {
        return Response.json({ error: 'This application is invite-only.' }, { status: 403 });
      }
    }

    // Check Roblox verification requirement
    if (settings.requireRobloxVerification && !(user.roblox_username || user.data?.roblox_username)) {
      return Response.json({ error: 'Roblox verification required.' }, { status: 403 });
    }

    // Check min account age
    if (settings.minAccountAgeDays > 0) {
      const ageDays = user.created_date ? (Date.now() - new Date(user.created_date)) / 86400000 : 0;
      if (ageDays < settings.minAccountAgeDays) return Response.json({ error: 'Your account is too new to apply.' }, { status: 403 });
    }

    // Fetch user's existing responses for this application
    const minePage = await base44.entities.ApplicationResponse.filter({ application_id: app.id, created_by_id: user.id }, { sort: '-created_date', limit: 50 });
    const mine = minePage?.items || [];

    // Retake logic
    if (mine.length > 0) {
      const latest = mine[0];
      const isRetakeAllowed = latest.retake_allowed || !settings.oneResponsePerUser;
      if (!isRetakeAllowed) {
        if (!settings.allowRetake || latest.status !== 'rejected') {
          return Response.json({ error: 'You have already applied to this application.' }, { status: 403 });
        }
        if (settings.maxAttempts && mine.length >= settings.maxAttempts) {
          return Response.json({ error: 'You have used all attempts for this application.' }, { status: 403 });
        }
        const cooldownDays = settings.retakeCooldownDays || 0;
        if (cooldownDays > 0) {
          const availableAt = new Date(new Date(latest.reviewed_at || latest.updated_date).getTime() + cooldownDays * 86400000);
          if (availableAt > new Date()) {
            return Response.json({ error: `You can retake this application on ${availableAt.toLocaleDateString()}.` }, { status: 403 });
          }
        }
      }
    }

    // Filter answers to visible question IDs only (client sends the list)
    const visibleIds = new Set(Array.isArray(visible_question_ids) ? visible_question_ids : []);
    let answersToSave = answers;
    if (visibleIds.size > 0) {
      answersToSave = Object.fromEntries(Object.entries(answers).filter(([id]) => visibleIds.has(id)));
    }

    const attempt = mine.length + 1;

    // Create the response
    const response = await base44.entities.ApplicationResponse.create({
      application_id: app.id,
      application_title: app.title,
      roblox_username: user.roblox_username || user.data?.roblox_username || '',
      submitted_by_email: settings.collectEmail === false ? '' : (user.email || ''),
      answers: JSON.stringify(answersToSave),
      status: 'submitted',
      attempt,
    });

    // Post-response work: increment response_count + email copy + Discord alert
    const postResponse = [
      base44.asServiceRole.entities.Application.update(app.id, {
        response_count: (app.response_count || 0) + 1,
      }),
    ];
    if (settings.sendCopy && user.email) {
      const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const body = questions.map((q) => `<p><b>${esc(q.text)}</b><br/>${esc(answersToSave[q.id] ?? '—')}</p>`).join('');
      postResponse.push(base44.asServiceRole.integrations.Core.SendEmail({ to: user.email, subject: `Your response: ${app.title}`, body }));
    }
    if (settings.discordAlert !== false) {
      postResponse.push(base44.asServiceRole.functions.invoke('discordSend', {
        message: `New application submitted for **${app.title}** by ${user.roblox_username || 'Unknown'} (attempt ${attempt}).`,
      }));
    }
    postResponse.push(base44.asServiceRole.functions.invoke('syncApplicationToSheet', { response_id: response.id }));
    if (postResponse.length) await Promise.allSettled(postResponse);

    return Response.json({ ok: true, response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}