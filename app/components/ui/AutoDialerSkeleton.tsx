export default function AutoDialerSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-linear-to-r from-orange-500/30 to-amber-500/30 rounded-2xl"></div>
        <div className="h-12 w-72 bg-linear-to-r from-slate-700/60 to-slate-600/60 rounded-2xl"></div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6">
        <div className="overflow-hidden rounded-xl border border-slate-700/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                {["Campaign", "Customer", "Number", "Action"].map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-5 w-28 bg-slate-700/60 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="h-5 w-32 bg-slate-700/60 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-40 bg-slate-700/60 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-32 bg-slate-700/60 rounded"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 h-11 bg-linear-to-r from-orange-600/40 to-amber-500/40 rounded-xl"></div>
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
