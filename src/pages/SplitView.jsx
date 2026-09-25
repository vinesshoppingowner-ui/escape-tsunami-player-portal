import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, X, Columns2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getSplitPages } from '@/lib/splitPages';
import SplitPane from '@/components/split/SplitPane';

const load = (k, d) => localStorage.getItem(k) || d;

export default function SplitView() {
  const { user } = useAuth();
  const pages = getSplitPages(user);
  const staff = pages.length > 4;
  const [left, setLeft] = useState(() => load('split_left', staff ? '/admin?tab=moderations' : '/portal'));
  const [right, setRight] = useState(() => load('split_right', staff ? '/admin?tab=appeals' : '/my-appeals'));
  const [ratio, setRatio] = useState(50);
  const [dragging, setDragging] = useState(false);
  const wrap = useRef(null);

  const set = (side, v) => { localStorage.setItem(`split_${side}`, v); side === 'left' ? setLeft(v) : setRight(v); };
  const swap = () => { set('left', right); set('right', left); };

  const onMove = (e) => {
    if (!dragging) return;
    const r = wrap.current.getBoundingClientRect();
    setRatio(Math.min(80, Math.max(20, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      <div className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-white/10 bg-slate-950/90">
        <Columns2 className="h-4 w-4 text-cyan-400" />
        <span className="text-sm font-semibold">Split View</span>
        <div className="flex-1" />
        <button onClick={() => setRatio(50)} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5">Reset size</button>
        <button onClick={swap} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5"><ArrowLeftRight className="h-3.5 w-3.5" /> Swap</button>
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5"><X className="h-3.5 w-3.5" /> Exit</Link>
      </div>
      <div ref={wrap} className="flex-1 flex min-h-0 relative" onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}>
        <div style={{ width: `${ratio}%` }} className="min-w-0"><SplitPane path={left} onChange={(v) => set('left', v)} pages={pages} /></div>
        <div onMouseDown={() => setDragging(true)} className={`w-1.5 shrink-0 cursor-col-resize transition-colors ${dragging ? 'bg-cyan-500/60' : 'bg-white/10 hover:bg-cyan-500/40'}`} />
        <div className="flex-1 min-w-0"><SplitPane path={right} onChange={(v) => set('right', v)} pages={pages} /></div>
        {dragging && <div className="absolute inset-0 cursor-col-resize" />}
      </div>
    </div>
  );
}