import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
      <AlertTriangle size={19} className="mt-0.5 shrink-0" />
      <div className="flex-1"><p>{message}</p></div>
      {onRetry && <button className="font-bold underline" onClick={onRetry}>Retry</button>}
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d5ded5] bg-white px-5 py-16 text-center">
      <Info className="mx-auto mb-3 text-[#176B45]" size={32} />
      <h2 className="text-xl font-bold text-[#202820]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#777]">{message}</p>
      {action}
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#176B45] px-5 py-3 text-sm font-semibold text-white shadow-xl" role="status">
      <CheckCircle2 size={18} />{toast}
    </div>
  );
}
