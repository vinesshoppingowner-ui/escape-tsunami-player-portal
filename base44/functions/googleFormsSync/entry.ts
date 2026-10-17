import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const CONNECTOR_ID = '6ad2dab80ca7f9b5339bb1ec';

function mapGoogleFormItem(item, idx) {
  const qItem = item?.questionItem;
  const qGroup = item?.questionGroupItem;
  const vItem = item?.videoItem;
  if (!qItem && !qGroup && !vItem) return null;

  const baseId = `gf_${item.itemId || idx}_${Math.random().toString(36).slice(2, 6)}`;
  const title = (item.title || vItem?.caption || `Question ${idx + 1}`).trim();
  const description = (item.description || '').trim();

  if (vItem?.video?.youtubeUri) {
    return {
      id: baseId,
      text: title || 'Watch YouTube Video',
      description: description || vItem.caption || '',
      type: 'youtube',
      required: false,
      options: [],
      placeholder: '',
      maxLength: 0,
      showIf: null,
      validation: null,
      fileTypes: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt'],
      maxFileSize: 5,
      youtubeUrl: vItem.video.youtubeUri,
    };
  }

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

function parsePublicGoogleFormHtml(html, fallbackId) {
  const match = html.match(/var\s+FB_PUBLIC_LOAD_DATA_\s*=\s*(\[\s*null[\s\S]*?\]);\s*<\/script>/);
  if (!match) return null;
  const data = JSON.parse(match[1]);
  const info = data?.[1] || [];
  const description = (info?.[0] || '').trim();
  const rawItems = Array.isArray(info?.[1]) ? info[1] : [];
  const title = (info?.[8] || data?.[3] || 'Synced Google Form').trim();

  const questions = rawItems.map((item, idx) => {
    if (!Array.isArray(item)) return null;
    const qTitle = (item[1] || `Question ${idx + 1}`).trim();
    const qDesc = (item[2] || '').trim();
    const typeCode = item[3];

    // Google Forms video item (typeCode === 11)
    if (typeCode === 11) {
      const videoMeta = Array.isArray(item[6]) ? item[6] : [];
      let ytId = typeof videoMeta[0] === 'string' ? videoMeta[0].trim() : '';
      if (!ytId) {
        const serialized = JSON.stringify(item);
        const m = serialized.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (m) ytId = m[1];
      }
      const youtubeUrl = ytId
        ? (ytId.startsWith('http') ? ytId : `https://www.youtube.com/watch?v=${ytId}`)
        : '';
      return {
        id: `gf_${item[0] || idx}_${Math.random().toString(36).slice(2, 6)}`,
        text: qTitle || 'Watch YouTube Video',
        description: qDesc,
        type: 'youtube',
        required: false,
        options: [],
        placeholder: '',
        maxLength: 0,
        showIf: null,
        validation: null,
        fileTypes: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt'],
        maxFileSize: 5,
        youtubeUrl,
      };
    }

    const details = Array.isArray(item[4]) && Array.isArray(item[4][0]) ? item[4][0] : null;
    if (!details && typeCode !== 0 && typeCode !== 1) return null;

    const required = Boolean(details?.[2] === 1);
    const rawOptions = Array.isArray(details?.[1]) ? details[1] : [];
    let options = rawOptions.map((o) => (Array.isArray(o) ? String(o[0] || '').trim() : '')).filter(Boolean);

    let type = 'text';
    if (typeCode === 0) type = 'text';
    else if (typeCode === 1) type = 'textarea';
    else if (typeCode === 2) type = 'radio';
    else if (typeCode === 3) type = 'dropdown';
    else if (typeCode === 4) type = 'checkbox';
    else if (typeCode === 5) type = 'rating';
    else if (typeCode === 9) type = 'date';
    else if (typeCode === 13) type = 'file';
    else type = 'textarea';

    if (type === 'radio' && options.length === 2 && options.map((o) => o.toLowerCase()).sort().join(',') === 'no,yes') {
      type = 'yesno';
      options = [];
    }

    return {
      id: `gf_${item[0] || idx}_${Math.random().toString(36).slice(2, 6)}`,
      text: qTitle,
      description: qDesc,
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
  }).filter(Boolean);

  return {
    formId: fallbackId,
    title,
    description,
    responderUri: '',
    questions,
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

    // Allow fetching a public Google Form by URL/ID even without an active OAuth connection
    if (action === 'getPublic') {
      const rawInput = (body.formUrl || body.formId || '').trim();
      if (!rawInput) return Response.json({ error: 'Paste a Google Form link or ID first.' }, { status: 400 });

      let viewUrl = rawInput;
      if (!/^https?:\/\//i.test(rawInput)) {
        viewUrl = `https://docs.google.com/forms/d/${encodeURIComponent(rawInput)}/viewform`;
      } else if (rawInput.includes('/edit')) {
        viewUrl = rawInput.replace(/\/edit.*$/, '/viewform');
      }

      const htmlRes = await fetch(viewUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Base44FormsImporter/1.0)' },
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
      });
      if (!htmlRes.ok) {
        return Response.json({ error: `Could not open Google Form (${htmlRes.status}). Make sure the form link is accessible.` }, { status: 200 });
      }
      const html = await htmlRes.text();
      const parsed = parsePublicGoogleFormHtml(html, rawInput);
      if (!parsed || !parsed.questions.length) {
        return Response.json({ error: 'Could not read questions from that link. Make sure the Google Form is open/public and uses a standard viewform link.' }, { status: 200 });
      }
      return Response.json({ form: parsed });
    }

    // Strictly per-user OAuth connection ONLY — never falls back to a shared account
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
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
      return Response.json({ forms: data.files || [], mode: 'app_user' });
    }

    if (action === 'get') {
      let formId = (body.formId || '').trim();
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
    return Response.json({ error: error.message || 'Not connected to Google Forms' }, { status: 401 });
  }
}