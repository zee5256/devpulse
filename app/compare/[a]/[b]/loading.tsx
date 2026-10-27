import { Skeleton } from "@/components/ui/skeleton";

export default function CompareLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-5 h-16 w-full rounded-2xl" />
      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <Skeleton className="h-56 rounded-2xl" />
        <div className="hidden w-12 place-items-center lg:grid">
          <Skeleton className="size-10 rounded-full" />
        </div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
