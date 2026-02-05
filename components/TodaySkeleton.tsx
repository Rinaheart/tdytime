import React from 'react';

const TodaySkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-1 mb-8">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 shimmer"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-64 shimmer"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 shimmer"></div>
            </div>

            {/* Session Cards Skeleton */}
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 flex items-center gap-6 shadow-sm">
                        <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-2xl shimmer"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4 shimmer"></div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 shimmer"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Next Section Skeleton */}
            <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 border border-dashed border-slate-200 dark:border-slate-800 shimmer">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-4 shimmer"></div>
                <div className="h-20 bg-white dark:bg-slate-900 rounded-2xl shimmer"></div>
            </div>
        </div>
    );
};

export default TodaySkeleton;
