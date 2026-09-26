import { useRef, useState } from 'react';
import CustomColorPanel from '@/components/profile/CustomColorPanel';
import BackgroundAdjust from '@/components/profile/BackgroundAdjust';
import { Check, ImagePlus, Loader2, Pipette } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { BACKGROUNDS } from '@/lib/backgrounds';

const tile = (active) => `relative h-16 w-full rounded-lg border overflow-hidden transition-all flex items-center justify-center ${active ? 'border-white ring-2 ring-white/40' : 'border-white/10 hover:border-white/30'}`;

export default function BackgroundPicker({ prefs, set }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const current = prefs.background || 'default';
  const [showCustom, setShowCustom] = useState(false);
  const customCss = prefs.background_color
    ? (prefs.background_color2 ? `linear-gradient(135deg, ${prefs.background_color}, ${prefs.background_color2})` : prefs.background_color)
    : '#131722';

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    await set({ background: 'custom_image', background_image: file_url });
    setUploading(false);
    e.target.value = '';
  };

  return (
    <>
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {BACKGROUNDS.map((b) => (
        <button key={b.value} type="button" onClick={() => set({ background: b.value })} className="flex flex-col gap-1.5">
          <span className={tile(current === b.value)} style={{ background: b.css }}>
            {current === b.value && <Check className="h-5 w-5 text-white" />}
          </span>
          <span className="text-[11px] text-slate-400">{b.label}</span>
        </button>
      ))}

      <button type="button" onClick={() => setShowCustom((s) => !s)} className="flex flex-col gap-1.5">
        <span className={tile(current === 'custom_color' || showCustom)} style={{ background: customCss }}>
          {current === 'custom_color' ? <Check className="h-5 w-5 text-white" /> : <Pipette className="h-5 w-5 text-slate-300" />}
        </span>
        <span className="text-[11px] text-slate-400">Custom color</span>
      </button>

      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex flex-col gap-1.5">
        <span className={tile(current === 'custom_image')}
          style={prefs.background_image ? { backgroundImage: `url("${prefs.background_image}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          {uploading ? <Loader2 className="h-5 w-5 animate-spin text-white" />
            : current === 'custom_image' ? <Check className="h-5 w-5 text-white drop-shadow" />
            : <ImagePlus className="h-5 w-5 text-slate-300 drop-shadow" />}
        </span>
        <span className="text-[11px] text-slate-400">{prefs.background_image ? 'Custom image' : 'Upload image'}</span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
    </div>
    {showCustom && <CustomColorPanel prefs={prefs} set={set} />}
    {current === 'custom_image' && prefs.background_image && <BackgroundAdjust prefs={prefs} set={set} />}
    </>
  );
}