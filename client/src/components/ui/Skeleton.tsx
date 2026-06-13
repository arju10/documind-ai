interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = '' }: SkeletonProps) => {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
};

export const DocumentSkeleton = () => {
  return (
    <div className="p-3 rounded-lg border border-gray-200 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
};

export const MessageSkeleton = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-end gap-2">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
