function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`bg-border/60 rounded-md animate-pulse ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}

export function SummarySkeleton() {
  return (
    <div>
      <Bone className="h-3 w-32 mb-3" />
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4">
            <Bone className="h-2.5 w-16 mb-2" />
            <Bone className="h-8 w-14 mb-1.5" />
            <Bone className="h-2 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between border-b border-border pb-2">
        <Bone className="h-5 w-24" />
        <Bone className="h-3 w-8" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-3.5 flex gap-3 items-start">
            <Bone className="w-7 h-7 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-20" />
              <Bone className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StationListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bone className="w-5 h-5 rounded-full" />
              <Bone className="h-4 w-16" />
            </div>
            <Bone className="h-5 w-12 rounded-full" />
          </div>
          <Bone className="h-2.5 w-28 ml-0.5" />
        </div>
      ))}
    </div>
  );
}
