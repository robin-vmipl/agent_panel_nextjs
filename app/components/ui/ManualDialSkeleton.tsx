export default function ManualDialSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 h-16 bg-linear-to-r from-slate-700/60 to-slate-600/60 rounded-2xl"></div>
        <div className="w-48 h-16 bg-linear-to-r from-emerald-600/40 to-emerald-500/40 rounded-2xl shadow-lg"></div>
      </div>
      <div className="h-4 w-48 bg-slate-700/50 rounded-lg"></div>
    </div>
  );
}
