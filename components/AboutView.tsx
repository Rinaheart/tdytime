
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info, ClipboardList, Clock, Github, Mail, Globe } from 'lucide-react';

interface AboutViewProps {
  version: string;
}

const AboutView: React.FC<AboutViewProps> = ({ version }) => {
  const { t } = useTranslation();

  // Get changelog from translations
  const changeLog = t('about.changes', { returnObjects: true }) as Array<{ version: string, date: string, changes: string[] }>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 px-4 sm:px-0">
      <div className="text-center space-y-4 pt-4 md:pt-8">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg mb-6">
          <Clock size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('about.title')} v{version}</h2>
        <p className="text-slate-500 max-w-lg mx-auto leading-relaxed text-sm">
          {t('about.description')}
        </p>
        <p className="text-xs font-bold text-slate-400">
          {t('about.copyright')}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <a href="mailto:tdyphan@gmail.com" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-100 transition-colors"><Mail size={18} /></a>
          <a href="https://github.com/tdyphan" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-100 transition-colors"><Github size={18} /></a>
          <a href="https://tdyphan.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-100 transition-colors"><Globe size={18} /></a>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Clock size={16} className="text-blue-500" /> {t('about.periodStandards')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-l-2 border-blue-600 pl-2">{t('about.morning')}</h4>
            <ul className="text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <li className="flex justify-between"><span>{t('weekly.period', { number: 1 })}:</span> <span>07:00 - 07:45</span></li>
              <li className="flex justify-between"><span>{t('weekly.period', { number: 2 })}:</span> <span>07:55 - 08:40</span></li>
              <li className="flex justify-between"><span>{t('weekly.period', { number: 3 })}:</span> <span>08:50 - 09:35</span></li>
              <li className="flex justify-between"><span>{t('weekly.period', { number: 4 })}:</span> <span>09:45 - 10:30</span></li>
            </ul>
          </div>
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest border-l-2 border-sky-600 pl-2">{t('about.afternoon')}</h4>
            <ul className="text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <li className="flex justify-between"><span>{t('weekly.period', { number: 6 })}:</span> <span>13:30 - 14:15</span></li>
              <li className="flex justify-between"><span>{t('weekly.period', { number: 7 })}:</span> <span>14:25 - 15:10</span></li>
              <li className="flex justify-between"><span>{t('weekly.period', { number: 8 })}:</span> <span>15:20 - 16:05</span></li>
              <li className="flex justify-between"><span>{t('weekly.period', { number: 9 })}:</span> <span>16:15 - 17:00</span></li>
            </ul>
          </div>
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-l-2 border-indigo-600 pl-2">{t('about.evening')}</h4>
            <ul className="text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400 font-semibold">
              <li className="flex justify-between"><span>{t('weekly.period', { number: 11 })}:</span> <span>17:10 - 17:55</span></li>
              <li className="flex justify-between"><span>{t('weekly.period', { number: 12 })}:</span> <span>18:00 - 18:45</span></li>
              <li className="flex justify-between"><span>{t('weekly.period', { number: 13 })}:</span> <span>18:50 - 19:35</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] italic text-slate-400">
          {t('about.note')}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <ClipboardList size={16} className="text-blue-500" /> {t('about.changelog')}
        </h3>
        <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
          {Array.isArray(changeLog) && changeLog.map((log) => (
            <div key={log.version} className="relative pl-6 border-l border-slate-200 dark:border-slate-800">
              <div className="absolute -left-[4.5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-bold text-xs text-slate-800 dark:text-white">{log.version}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{log.date}</span>
              </div>
              <ul className="space-y-1">
                {log.changes.map((change, i) => (
                  <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-500/30 mt-1.5 shrink-0"></span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] font-medium text-slate-400 tracking-[0.2em]">{t('about.copyright')}</p>
      </div>
    </div>
  );
};

export default AboutView;
