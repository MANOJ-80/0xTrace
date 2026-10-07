export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-64 bg-ox-surface-raised rounded" />
        <div className="h-4 w-80 bg-ox-surface-raised rounded" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full h-10 bg-ox-surface border border-ox-edge rounded-md" />
        <div className="w-full md:w-48 h-10 bg-ox-surface border border-ox-edge rounded-md" />
        <div className="w-full md:w-44 h-10 bg-ox-surface border border-ox-edge rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-ox-surface border border-ox-edge rounded-lg overflow-hidden">
        <div className="h-10 bg-ox-surface-raised border-b border-ox-edge" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-14 border-b border-ox-edge/30 flex items-center px-4 gap-8">
            <div className="h-4 w-40 bg-ox-surface-raised rounded" />
            <div className="h-4 w-64 bg-ox-surface-raised rounded flex-1" />
            <div className="h-4 w-20 bg-ox-surface-raised rounded" />
            <div className="h-4 w-16 bg-ox-surface-raised rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
