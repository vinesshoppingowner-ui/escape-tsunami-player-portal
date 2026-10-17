import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const CONNECTOR_ID = '6ad2dab80ca7f9b5339bb1ec';

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

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const headers = { Authorization: `Bearer ${accessToken}` };

    if (action === 'list') {
      const q = encodeURIComponent("mimeType='application/vnd.google-apps.form' and trashed=false");
      const fields = encodeURIComponent('files(id,name,description,modifiedTime,createdTime,webViewLink)');
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=100&orderBy=modifiedTime desc`;
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
      if (!res.ok) {
        const errText = await res.text();
        return Response.json({ error: `Google Drive API error: ${errText}` }, { status: res.status });
      }
      const data = await res.json();
      return Response.json({ forms: data.files || [] });
    }

    if (action === 'get') {
      const formId = body.formId;
      if (!formId) {
        return Response.json({ error: 'Missing formId' }, { status: 400 });
      }
      const formUrl = `https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}`;
      const res = await fetch(formUrl, { headers, signal: AbortSignal.timeout(12000) });
      if (!res.ok) {
        const errText = await res.text();
        return Response.json({ error: `Google Forms API error: ${errText}` }, { status: res.status });
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
    return Response.json({ error: error.message || 'Failed to sync with Google Forms' }, { status: 500 });
  }
}