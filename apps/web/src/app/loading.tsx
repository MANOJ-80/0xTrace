export default function Loading() {
  return (
    <div className="home-skeleton animate-pulse" aria-busy="true" aria-label="Loading the 0xTrace landing page">
      <div className="home-skeleton-hero">
        <div className="space-y-5">
          <div className="skeleton-block h-3 w-40" />
          <div className="skeleton-block h-12 sm:h-16 w-full max-w-xl" />
          <div className="skeleton-block h-4 w-full max-w-md" />
          <div className="skeleton-block h-4 w-4/5 max-w-sm" />
          <div className="skeleton-block h-11 w-56 rounded-md" />
        </div>
        <div className="skeleton-block home-skeleton-preview" />
      </div>
      <div className="home-skeleton-stats">
        {[1, 2, 3, 4].map((item) => <div className="skeleton-block h-12" key={item} />)}
      </div>
      <div className="home-skeleton-cards">
        {[1, 2, 3].map((item) => <div className="skeleton-block h-48" key={item} />)}
      </div>
    </div>
  );
}
