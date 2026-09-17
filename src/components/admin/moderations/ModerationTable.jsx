import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import RobloxAvatar from '@/components/moderations/RobloxAvatar';
import { StatusBadge, TypeBadge } from '@/components/admin/moderations/ModerationBadges';
import UserInfoModal from '@/components/admin/UserInfoModal';

const PAGE_SIZE = 10;

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ModerationTable({ items, onDelete }) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [items, currentPage]
  );

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04] text-slate-400 text-xs uppercase tracking-wide">
              <th className="text-left font-medium px-4 py-3">User</th>
              <th className="text-left font-medium px-4 py-3">Type</th>
              <th className="text-left font-medium px-4 py-3 min-w-[200px]">Reason</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Moderator</th>
              <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Date</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((m) => {
              const isLong = (m.reason || '').length > 60;
              const isExpanded = expanded === m.id;
              return (
                <tr key={m.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <RobloxAvatar username={m.roblox_username} size={32} />
                      <button onClick={() => setSelectedUser(m.roblox_username)} className="text-cyan-300 font-medium hover:text-cyan-200 hover:underline">{m.roblox_username}</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={m.moderation_type} />
                    {m.duration && <div className="text-[10px] text-slate-500 mt-1">{m.duration}</div>}
                  </td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <div className={`text-slate-200 ${isExpanded ? '' : 'truncate'}`}>
                      {m.reason || '—'}
                    </div>
                    {m.details && isExpanded && (
                      <div className="text-xs text-slate-500 mt-1">{m.details}</div>
                    )}
                    {isLong && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : m.id)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 mt-0.5"
                      >
                        {isExpanded ? 'Show less' : 'View more'}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-400">
                    {m.staff_member || '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400 whitespace-nowrap">
                    {formatDate(m.moderation_date)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(m)}
                      className="text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02]">
          <span className="text-xs text-slate-400">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, items.length)} of {items.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 min-w-8 px-2 rounded-md text-xs font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
            <Button
              size="icon"
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <UserInfoModal robloxUsername={selectedUser} open={!!selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}