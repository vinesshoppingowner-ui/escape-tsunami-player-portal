import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const CONNECTOR_ID = '6ad2dab80ca7f9b5339bb1ec';

async function resolveAccessToken(base44) {
  const errors = [];
  // 1. Try APP_USER connection
  try {
    const conn = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    if (conn?.accessToken) return { accessToken: conn.accessToken, mode: 'app_user' };
  } catch (e) {
    errors.push(e?.message || 'No app-user connection');
  }

  // 2. Try BYO_SHARED workspace connection
  try {
    const conn = await base44.asServiceRole.connectors.getWorkspaceConnection(CONNECTOR_ID);
    if (conn?.accessToken) return { accessToken: conn.accessToken, mode: 'workspace' };
  } catch (e) {
    errors.push(e?.message || 'No workspace connection');
  }

  // 3. Try platform SHARED googleforms connection
  try {
    const conn = await base44.asServiceRole.connectors.getConnection('googleforms');
    if (conn?.accessToken) return { accessToken: conn.accessToken, mode: 'shared' };
  } catch (e) {
    errors.push(e?.message || 'No shared googleforms connection');
  }

  throw new Error('NOT_CONNECTED: ' + errors.join(' | '));
}

function mapGoogleFormItem(item, idx) {
  const qItem = item?.questionItem;
  const qGroup = item?.questionGroupItem;
  if (!qItem && !qGroup) return null;

  const baseId = `gf_${item.itemId || idx}_${Math.random().toString(36).slice(2, 6)}`;
  const title = (item.title || `Question ${idx + 1}`).trim();
  const description = (item.description || '').trim();

  if (qGroup?.questions?.length) {
    return {
      id: baseId,
      text: title,
      description,
      type: 'textarea',
      required: Boolean(qGroup.questions[0]?.required),
      options: [],
      placeholder: 'Enter your response...',
      maxLength: 0,
      showIf: null,
      validation: null,
      fileTypes: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt'],
      maxFileSize: 5,
    };
  }

  const q = qItem.question || {};
  const required = Boolean(q.required);
  let type = 'text';
  let options = [];

  if (q.textQuestion) {
    type = q.textQuestion.paragraph ? 'textarea' : 'text';
  } else if (q.choiceQuestion) {
    const cType = q.choiceQuestion.type;
    options = (q.choiceQuestion.options || [])
      .map((o) => (o.value || (o.isOther ? 'Other' : '')).trim())
      .filter(Boolean);
    if (cType === 'CHECKBOX') type = 'checkbox';
    else if (cType === 'DROP_DOWN') type = 'dropdown';
    else type = 'radio';
    if (options.length === 2 && options.map((o) => o.toLowerCase()).sort().join(',') === 'no,yes') {
      type = 'yesno';
      options = [];
    }
  } else if (q.scaleQuestion) {
    type = 'rating';
  } else if (q.dateQuestion) {
    type = 'date';
  } else if (q.fileUploadQuestion) {
    type = 'file';
  }

  return {
    id: baseId,
    text: title,
    description,
    type,
    required,
    options,
    placeholder: '',
    maxLength: 0,
    showIf: null,
    validation: null,
    fileTypes: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt'],
    maxFileSize: 5,
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    const { accessToken, mode } = await resolveAccessToken(base44);
    const headers = { Authorization: `Bearer ${accessToken}` };

    if (action === 'list') {
      const q = encodeURIComponent("mimeType='application/vnd.google-apps.form' and trashed=false");
      const fields = encodeURIComponent('files(id,name,description,modifiedTime,createdTime,webViewLink)');
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100&orderBy=modifiedTime desc`;
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `Google Drive API error (${res.status})`;
        return Response.json({ error: msg, apiError: true }, { status: 200 });
      }
      const data = await res.json();
      return Response.json({ forms: data.files || [], mode });
    }

    if (action === 'get') {
      let formId = (body.formId || '').trim();
      // Support pasting a full Google Form URL (e.g. https://docs.google.com/forms/d/FORM_ID/edit)
      const urlMatch = formId.match(/\/forms\/d\/([a-zA-Z0-9_-]+)/);
      if (urlMatch) formId = urlMatch[1];

      if (!formId) {
        return Response.json({ error: 'Missing formId' }, { status: 400 });
      }
      const formUrl = `https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}`;
      const res = await fetch(formUrl, { headers, signal: AbortSignal.timeout(12000) });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = errData?.error?.message || `Google Forms API error (${res.status})`;
        return Response.json({ error: msg, apiError: true }, { status: 200 });
      }
      const formData = await res.json();
      const title = formData?.info?.title || formData?.info?.documentTitle || 'Synced Google Form';
      const description = formData?.info?.description || '';
      const rawItems = formData?.items || [];
      const questions = rawItems.map((item, idx) => mapGoogleFormItem(item, idx)).filter(Boolean);

      return Response.json({
        form: {
          formId: formData.formId || formId,
          title,
          description,
          responderUri: formData.responderUri || '',
          questions,
        },
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    const msg = error.message || 'Failed to sync with Google Forms';
    const notConnected = msg.startsWith('NOT_CONNECTED:');
    return Response.json(
      { error: msg, notConnected },
      { status: notConnected ? 401 : 500 }
    );
  }
}