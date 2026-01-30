import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, CheckCircle2, Lock, ArrowLeft, ClipboardPaste, Play, History, Trash2, Clock } from 'lucide-react';
import { HistoryItem } from '../services/historyService';

interface UploadZoneProps {
  onUpload: (content: string) => void;
  onDemoLoad: (code: string) => void;
  onCancel?: () => void;
  historyList?: HistoryItem[];
  onLoadHistory?: (item: HistoryItem) => void;
  onDeleteHistory?: (id: string) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  onUpload,
  onDemoLoad,
  onCancel,
  historyList = [],
  onLoadHistory,
  onDeleteHistory
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [secretCode, setSecretCode] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const processFile = (file: File) => {
    const isHtml = file.type === 'text/html' || file.name.endsWith('.html');
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');

    if (isHtml || isJson) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onUpload(text);
      };
      reader.readAsText(file);
    } else {
      alert(t('upload.errors.invalidFormat'));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) return;
    onUpload(pasteContent);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDemoLoad(secretCode);
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${time} ${date}`;
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-300 flex flex-col gap-6">

      {/* HISTORY SECTION (IF EXISTS) */}
      {historyList && historyList.length > 0 && onLoadHistory && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <History size={16} className="text-blue-500" /> {t('upload.historyTitle')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {historyList.map(item => (
              <div
                key={item.id}
                onClick={() => onLoadHistory(item)}
                className="group relative bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
              >
                {/* Delete Button */}
                {onDeleteHistory && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteHistory(item.id); }}
                    className="absolute top-2 right-2 h-11 w-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title={t('upload.deleteHistory')}
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="pr-10">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate mb-1" title={item.teacher}>
                    {item.teacher}
                  </h4>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    HK{item.semester} - {item.academicYear}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock size={10} /> {formatTime(item.savedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN UPLOAD CARD */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 left-4 h-11 w-11 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-10"
            title={t('common.back')}
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-black text-center text-slate-800 dark:text-white mb-2 uppercase tracking-tight">{t('upload.title')}</h2>
          <p className="text-slate-500 text-center mb-8 text-sm max-w-lg mx-auto">
            {t('upload.description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1: Drag & Drop */}
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Upload size={16} className="text-blue-500" /> {t('upload.method1')}
              </div>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  flex-1 relative cursor-pointer group border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-200 min-h-[220px]
                  ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                `}
              >
                <input
                  type="file"
                  ref={inputRef}
                  onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                  accept=".html,.json"
                  className="hidden"
                />

                <div className={`
                  w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110
                  ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}
                `}>
                  {file ? <CheckCircle2 size={28} /> : <Upload size={28} />}
                </div>

                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 text-center">
                  {file ? file.name : t('upload.dragDrop')}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">HTML / JSON</p>
              </div>
            </div>

            {/* Column 2: Paste Text */}
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <ClipboardPaste size={16} className="text-orange-500" /> {t('upload.method2')}
              </div>
              <div className="flex-1 flex flex-col relative">
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={t('upload.pastePlaceholder')}
                  className="w-full h-full min-h-[180px] p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
                ></textarea>
                <button
                  onClick={handlePasteSubmit}
                  disabled={!pasteContent.trim()}
                  className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold uppercase hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  <Play size={16} fill="currentColor" /> {t('upload.analyzeContent')}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-8">
            <form onSubmit={handleDemoSubmit} className="w-full sm:w-auto h-12 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="pl-3 text-slate-400"><Lock size={16} /></div>
              <input
                type="text"
                placeholder={t('upload.enterCode')}
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="bg-transparent text-sm font-bold h-full outline-none w-28 text-slate-700 dark:text-slate-200"
              />
              <button type="submit" className="h-full px-6 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors uppercase">{t('upload.useDemo')}</button>
            </form>

            <div className="flex gap-4">
              <div className="text-center">
                <span className="block text-[10px] font-black text-blue-600 uppercase">{t('upload.features.viz')}</span>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-4">
                <span className="block text-[10px] font-black text-amber-600 uppercase">{t('upload.features.warn')}</span>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-4">
                <span className="block text-[10px] font-black text-emerald-600 uppercase">{t('upload.features.export')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-3 text-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
          {t('about.copyright')}
        </div>
      </div>
    </div>
  );
};


export default UploadZone;
