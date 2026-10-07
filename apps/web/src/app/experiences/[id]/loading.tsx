export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 bg-ox-surface-raised rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-7 w-64 bg-ox-surface-raised rounded" />
          <div className="h-4 w-48 bg-ox-surface-raised rounded" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-20 bg-ox-surface-raised rounded-full" />
            <div className="h-6 w-24 bg-ox-surface-raised rounded-full" />
            <div className="h-6 w-16 bg-ox-surface-raised rounded-full" />
          </div>
        </div>
      </div>

      {/* Rounds Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 bg-ox-surface border border-ox-edge rounded-lg h-28" />
        ))}
      </div>
    </div>
  );
}
