import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder shown while the first weather report is loading. */
export function WeatherSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
        <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
      </div>
      <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
        <Skeleton className="h-6 w-44" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-4 h-56 w-full rounded-2xl" />
      </div>
    </div>
  );
}
