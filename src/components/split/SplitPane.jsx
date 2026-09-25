import { useRef } from 'react';
import { RotateCw, ExternalLink } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';

export default function SplitPane({ path, onChange, pages }) {
  const frame = useRef(null);
  const btn = 'p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10';
  return (
    <div className="flex flex-col h-full min-w-0 bg-slate-950">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/10 bg-slate-900/70">
        <CustomDropdown value={path} onChange={onChange} options={pages} className="flex-1 max-w-xs" />
        <div className="flex-1" />
        <button className={btn} title="Reload" onClick={() => frame.current?.contentWindow?.location.reload()}><RotateCw className="h-3.5 w-3.5" /></button>
        <a className={btn} title="Open in new tab" href={path} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
      </div>
      <iframe ref={frame} key={path} src={path} title={path} name="split-pane" className="flex-1 w-full border-0" />
    </div>
  );
}