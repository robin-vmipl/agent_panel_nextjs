import Skeleton from "../ui/Skeleton";

export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="skeleton-card bg-[#0a1d2c] p-6 rounded-xl shadow-2xl"
        >
          <Skeleton className="h-4 w-1/2 mx-auto mb-3" />
          <Skeleton className="h-6 w-1/3 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="skeleton-card bg-[#0a1d2c] p-6 rounded-xl shadow-2xl text-center"
        >
          <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-5 w-1/3 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="skeleton-card bg-[#0a1d2c] p-6 rounded-xl shadow-2xl">
      <Skeleton className="h-5 w-1/3 mb-4" />
      <Skeleton className="h-100 w-full" />
    </div>
  );
}
