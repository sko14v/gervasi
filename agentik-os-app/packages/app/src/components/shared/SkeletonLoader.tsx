import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('animate-shimmer rounded-radius-sm bg-tint/60', className)}
      style={style}
    />
  );
}

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'chart' | 'table';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ type = 'card', count = 1, className }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-radius-md border border-separator bg-tint/20 p-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-12 rounded-radius-sm" />
              </div>
            ))}
          </div>
        );
      case 'chart':
        return (
          <div className="flex flex-col gap-4 rounded-radius-xl border border-separator bg-surface p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-end gap-2 h-48 pt-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full rounded-t"
                  style={{ height: `${Math.max(10, Math.floor(Math.random() * 100))}%` }}
                />
              ))}
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="w-full space-y-4 rounded-radius-xl border border-separator bg-surface p-4">
            <div className="flex gap-4 border-b border-separator pb-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        );
      case 'card':
      default:
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="rounded-radius-xl border border-separator bg-surface p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-8 w-8 rounded-radius-sm" />
                </div>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        );
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
}
