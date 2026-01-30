
import React from 'react';

export const APP_VERSION = '0.1.0';


export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const VI_DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// Phương án 04: Nền nhạt theo theme + Border trái đặc trưng buổi
export const SESSION_COLORS = {
  morning: 'bg-blue-50/50 border-l-4 border-l-blue-500 border-blue-100 text-slate-700',
  afternoon: 'bg-blue-50/50 border-l-4 border-l-orange-500 border-orange-100 text-slate-700',
  evening: 'bg-blue-50/50 border-l-4 border-l-purple-600 border-purple-100 text-slate-700'
};

// Accent colors cho Legend (ô vuông S/C/T)
export const SESSION_ACCENT_COLORS = {
  morning: { bg: 'bg-blue-500', text: 'text-white', label: 'Sáng', short: 'S' },
  afternoon: { bg: 'bg-orange-500', text: 'text-white', label: 'Chiều', short: 'C' },
  evening: { bg: 'bg-purple-600', text: 'text-white', label: 'Tối', short: 'T' }
};

export const COURSE_TYPE_COLORS = {
  LT: 'bg-blue-100 text-blue-700 border-blue-200',
  TH: 'bg-sky-100 text-sky-700 border-sky-200'
};



export const DEFAULT_THRESHOLDS = {
  daily: { warning: 8, danger: 10 },
  weekly: { warning: 25, danger: 35 }
};

// Định nghĩa thời gian tiết học chuẩn theo AboutView
// Format: [Giờ, Phút]
export const PERIOD_TIMES: Record<number, { start: [number, number], end: [number, number] }> = {
  // Sáng
  1: { start: [7, 0], end: [7, 45] },
  2: { start: [7, 55], end: [8, 40] },
  3: { start: [8, 50], end: [9, 35] },
  4: { start: [9, 45], end: [10, 30] },
  5: { start: [10, 40], end: [11, 25] }, // Dự phòng

  // Chiều
  6: { start: [13, 30], end: [14, 15] },
  7: { start: [14, 25], end: [15, 10] },
  8: { start: [15, 20], end: [16, 5] },
  9: { start: [16, 15], end: [17, 0] },

  // Tối (Điều chỉnh theo yêu cầu: Bắt đầu từ tiết 11)
  11: { start: [17, 10], end: [17, 55] },
  12: { start: [18, 0], end: [18, 45] },
  13: { start: [18, 50], end: [19, 35] }
};
