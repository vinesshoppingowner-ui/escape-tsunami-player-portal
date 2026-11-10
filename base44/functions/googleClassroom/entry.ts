import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ALLOWED_EMAIL = 'max@escapetsunamifordevelopers.com';
const DEFAULT_CONNECTOR_ID = '6af264d13971ec27785c6009';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (String(user.email || '').trim().toLowerCase() !== ALLOWED_EMAIL) {
      return Response.json({ error: 'Forbidden: Only max@escapetsunamifordevelopers.com can use Google Classroom integration.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, connectorId, courseId, postType, title, description, applicationUrl, maxPoints } = body;
    const resolvedConnectorId = connectorId || DEFAULT_CONNECTOR_ID;

    let accessToken = '';
    try {
      const conn = await base44.asServiceRole.connectors.getCurrentAppUserConnection(resolvedConnectorId);
      accessToken = conn?.accessToken || '';
    } catch {
      return Response.json({ connected: false, error: 'Not connected to Google Classroom' }, { status: 401 });
    }

    if (!accessToken) {
      return Response.json({ connected: false, error: 'Not connected to Google Classroom' }, { status: 401 });
    }

    if (action === 'listCourses') {
      const res = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return Response.json({
          connected: true,
          apiError: true,
          error: data?.error?.message || `Google Classroom API error (${res.status})`,
          courses: [],
        });
      }

      return Response.json({
        connected: true,
        courses: data.courses || [],
      });
    }

    if (action === 'postApplication') {
      if (!courseId || !applicationUrl) {
        return Response.json({ error: 'courseId and applicationUrl are required' }, { status: 400 });
      }

      const isAnnouncement = postType === 'announcement';
      const endpoint = isAnnouncement
        ? `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/announcements`
        : `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWork`;

      const payload = isAnnouncement
        ? {
            text: description || `Complete the application: ${title || 'Application'}`,
            materials: [{ link: { url: applicationUrl, title: title || 'Application Link' } }],
            state: 'PUBLISHED',
          }
        : {
            title: title || 'Application',
            description: description || '',
            materials: [{ link: { url: applicationUrl, title: title || 'Application Link' } }],
            workType: 'ASSIGNMENT',
            state: 'PUBLISHED',
            maxPoints: typeof maxPoints === 'number' ? maxPoints : 100,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return Response.json(
          { error: data?.error?.message || `Failed to post to Google Classroom (${res.status})` },
          { status: 400 }
        );
      }

      return Response.json({
        ok: true,
        item: data,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}