import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ImageUp, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { parseRoleChanges } from '@/components/admin/discord/roleImportAI';

// Reads an image listing role changes and returns [{old_name,new_name,color_hex,permissions}]
export default function ImageRoleImport({ roleNames, onApply }) {
  const { toast } = useToast();
  const ref = useRef();
  const [loading, setLoading] = useState(false);

  const handle = async (file) => {
    if (!file) return;
    setLoading(true);
    const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
    const n = onApply(await parseRoleChanges(roleNames, { fileUrl: signed_url }));
    toast({ title: `Staged changes for ${n} role(s) — review, then Save all` });
    setLoading(false);
    ref.current.value = '';
  };

  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files[0])} />
      <Button size="sm" variant="outline" disabled={loading} onClick={() => ref.current.click()} className="w-full mb-2 border-slate-700 bg-transparent text-slate-300">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />} {loading ? 'Reading image…' : 'Import from image'}
      </Button>
    </>
  );
}