import React from 'react';

const WeeklySkeleton: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-48 shimmer"></div>
                <div className="flex gap-2">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg shimmer"></div>
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg shimmer"></div>
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-lg shimmer"></div>
                </div>
            </div>

            {/* Week Info Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shimmer">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-64 mb-4 shimmer"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 shimmer"></div>
            </div>

            {/* Schedule Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20 mb-3 shimmer"></div>
                        <div className="space-y-2">
                            <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg shimmer"></div>
                            <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg shimmer"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default WeeklySkeleton;
