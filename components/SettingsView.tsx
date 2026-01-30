import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Thresholds, ScheduleData, CourseType } from '../types';
import { Check } from 'lucide-react';
import AbbreviationsCard from './AbbreviationsCard';
import CourseTypeCard from './CourseTypeCard';
import ThresholdsCard from './ThresholdsCard';
import ExportCard from './ExportCard';
import DangerZoneCard from './DangerZoneCard';

interface SettingsViewProps {
  thresholds: Thresholds;
  onSave: (t: Thresholds) => void;
  version: string;
  data: ScheduleData;
  overrides: Record<string, CourseType>;
  onSaveOverrides: (o: Record<string, CourseType>) => void;
  abbreviations: Record<string, string>;
  onSaveAbbreviations: (a: Record<string, string>) => void;
  onReset: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  thresholds, onSave, data, overrides, onSaveOverrides,
  abbreviations, onSaveAbbreviations, onReset
}) => {
  const { t } = useTranslation();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Derived unique subjects for abbreviations
  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, string>();
    data.allCourses.forEach(c => {
      if (!map.has(c.name)) map.set(c.name, c.name);
    });
    return Array.from(map.values()).sort();
  }, [data.allCourses]);

  const handleSuccess = (message: string) => {
    setToast({ message, type: 'success' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-300 pb-20 relative">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1 text-white">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* CARD 1: Tên môn học viết tắt */}
      <AbbreviationsCard
        uniqueSubjects={uniqueSubjects}
        abbreviations={abbreviations}
        onSave={onSaveAbbreviations}
        onSuccess={handleSuccess}
      />

      {/* CARD 2: Tùy chỉnh hình thức giảng dạy */}
      <CourseTypeCard
        allCourses={data.allCourses}
        overrides={overrides}
        onSave={onSaveOverrides}
        onSuccess={handleSuccess}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 3: Ngưỡng cảnh báo */}
        <div className="lg:col-span-2">
          <ThresholdsCard
            thresholds={thresholds}
            onSave={onSave}
            onSuccess={handleSuccess}
          />
        </div>

        <div className="space-y-6">
          {/* CARD 4: Xuất dữ liệu */}
          <ExportCard
            data={data}
            overrides={overrides}
            abbreviations={abbreviations}
            onSuccess={handleSuccess}
          />

          {/* CARD 5: Danger Zone */}
          <DangerZoneCard onReset={onReset} />
        </div>
      </div>

      <div className="text-center text-slate-400 text-[10px] mt-8">
        {t('about.copyright')}
      </div>
    </div>
  );
};

export default SettingsView;

