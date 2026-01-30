import React from 'react';

const StatsSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 pb-20">
            {/* Header Card Skeleton */}
            <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-8 rounded-3xl h-32 shimmer"></div>

            {/* Overview Card Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shimmer">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 h-48 shimmer"></div>
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl h-24 shimmer"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-72 shimmer"></div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-72 shimmer"></div>
            </div>

            {/* Pie Charts Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-64 shimmer"></div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 h-64 shimmer"></div>
            </div>
        </div>
    );
};


export default StatsSkeleton;
