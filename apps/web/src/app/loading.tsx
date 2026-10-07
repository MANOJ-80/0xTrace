export default function Loading() {
  return (
    <div className="space-y-16 animate-pulse">
      {/* Stats Strip Skeleton */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-6 border-b border-ox-edge pb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-9 w-20 bg-ox-surface-raised rounded mb-2" />
            <div className="h-4 w-16 bg-ox-surface-raised rounded" />
          </div>
        ))}
      </div>

      {/* Company Grid Skeleton */}
      <section className="space-y-6">
        <div className="h-6 w-48 bg-ox-surface-raised rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-ox-surface border border-ox-edge rounded-lg h-24" />
          ))}
        </div>
      </section>

      {/* Recent Experiences Skeleton */}
      <section className="space-y-6">
        <div className="h-6 w-40 bg-ox-surface-raised rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-ox-surface border border-ox-edge rounded-lg h-32" />
          ))}
        </div>
      </section>
    </div>
  );
}
