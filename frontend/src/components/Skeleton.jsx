export function Skeleton({ className = "", width, height }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading..."
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 bg-gray-200 rounded-full animate-pulse"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-5 ${className}`}>
      <div className="h-5 w-3/4 bg-gray-200 rounded-md animate-pulse mb-3" />
      <SkeletonText lines={2} />
      <div className="h-4 w-1/4 bg-gray-200 rounded-md animate-pulse mt-3" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-8 w-12 bg-gray-200 rounded-md animate-pulse mt-2" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse mb-4" />
      <div className="flex items-end gap-2 h-[250px]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t-md animate-pulse"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}
