export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-ox-surface-raised rounded" />
        <div className="h-7 w-40 bg-ox-surface-raised rounded" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-ox-surface border border-ox-edge rounded-lg h-24" />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-ox-surface border border-ox-edge rounded-lg h-72 p-4">
          <div className="h-5 w-40 bg-ox-surface-raised rounded mb-4" />
          <div className="h-full bg-ox-surface-raised rounded" />
        </div>
        <div className="bg-ox-surface border border-ox-edge rounded-lg h-72 p-4">
          <div className="h-5 w-40 bg-ox-surface-raised rounded mb-4" />
          <div className="h-full bg-ox-surface-raised rounded" />
        </div>
      </div>
    </div>
  );
}
