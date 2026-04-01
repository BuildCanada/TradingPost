export function FeedSkeleton() {
  return (
    <>
      <div className="px-5 pt-5 pb-8 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 rounded-full bg-border-light animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="px-5 py-12 border-b border-border-light">
        <div className="max-w-[1080px] mx-auto">
          <div className="h-4 w-24 bg-border-light animate-pulse mb-3" />
          <div className="w-full min-h-[160px] bg-border-light animate-pulse rounded mb-2.5" />
          <div className="h-4 w-20 bg-border-light animate-pulse mb-3 mt-6" />
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div className="h-[90px] bg-border-light animate-pulse rounded" />
            <div className="h-[90px] bg-border-light animate-pulse rounded" />
          </div>
          <div className="flex items-center mt-6 mb-3">
            <div className="h-4 w-24 bg-border-light animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 border-b border-border-light"
            >
              <div className="w-[52px] h-[52px] bg-border-light animate-pulse rounded shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-border-light animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-border-light animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-12">
        <div className="max-w-[1080px] mx-auto">
          <div className="h-4 w-48 bg-border-light animate-pulse mb-3" />
          <div className="border border-border-light h-[200px] bg-border-light animate-pulse" />
        </div>
      </div>
    </>
  );
}
