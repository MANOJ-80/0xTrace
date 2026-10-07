export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-72 bg-ox-surface-raised rounded" />
        <div className="h-4 w-96 bg-ox-surface-raised rounded" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full h-10 bg-ox-surface border border-ox-edge rounded-md" />
        <div className="w-full md:w-56 h-10 bg-ox-surface border border-ox-edge rounded-md" />
        <div className="w-full md:w-48 h-10 bg-ox-surface border border-ox-edge rounded-md" />
        <div className="w-full md:w-44 h-10 bg-ox-surface border border-ox-edge rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-4 border-b border-ox-edge pb-2">
        <div className="h-4 w-10 bg-ox-surface-raised rounded" />
        <div className="h-4 w-16 bg-ox-surface-raised rounded" />
        <div className="h-4 w-16 bg-ox-surface-raised rounded" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 bg-ox-surface border border-ox-edge rounded-lg h-36" />
        ))}
      </div>
    </div>
  );
}
