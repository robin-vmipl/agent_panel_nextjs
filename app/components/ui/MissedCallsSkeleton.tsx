export default function MissedCallsSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-linear-to-r from-amber-500/30 to-orange-500/30 rounded-2xl"></div>
        <div>
          <div className="h-12 w-80 bg-linear-to-r from-slate-700/60 to-slate-600/60 rounded-2xl mb-2"></div>
          <div className="h-4 w-72 bg-slate-700/50 rounded-lg"></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6">
        <div className="overflow-hidden rounded-xl border border-slate-700/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {["Customer", "Time", "Duration", "", ""].map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-5 w-24 bg-slate-700/60 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="h-12 w-32 bg-slate-700/60 rounded-lg"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-slate-700/60 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-slate-700/60 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-slate-700/60 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full h-11 bg-linear-to-r from-orange-500/40 to-amber-500/40 rounded-xl"></div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
