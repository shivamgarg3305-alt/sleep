export function AnalyticsSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="mb-3 h-4 w-16 rounded bg-secondary" />
      <div className="mb-3 flex flex-col items-center gap-4 rounded-2xl bg-secondary/60 p-6">
        <div className="h-44 w-44 rounded-full bg-secondary" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl bg-secondary/60" />
        <div className="h-24 rounded-2xl bg-secondary/60" />
      </div>
      <div className="mt-3 h-56 rounded-2xl bg-secondary/60" />
    </div>
  );
}
