
export enum CourseType {
  LT = 'LT',
  TH = 'TH'
}

export interface CourseSession {
  courseCode: string;
  courseName: string;
  group: string;
  className: string;
  timeSlot: string;
  periodCount: number;
  room: string;
  teacher: string;
  actualHours: number;
  type: CourseType;
  dayOfWeek: string;
  sessionTime: 'morning' | 'afternoon' | 'evening';
  dateStr?: string;
  hasConflict?: boolean;
}

export interface DaySchedule {
  morning: CourseSession[];
  afternoon: CourseSession[];
  evening: CourseSession[];
}

export interface WeekSchedule {
  weekNumber: number;
  dateRange: string;
  days: {
    [key: string]: DaySchedule;
  };
}

export interface Metadata {
  teacher: string;
  semester: string;
  academicYear: string;
  extractedDate: string;
}

export interface ScheduleData {
  metadata: Metadata;
  weeks: WeekSchedule[];
  allCourses: AggregatedCourse[];
  overrides?: Record<string, CourseType>;
  abbreviations?: Record<string, string>;
}

export interface AggregatedCourse {
  code: string;
  name: string;
  totalPeriods: number;
  totalSessions: number;
  groups: string[];
  classes: string[];
  types: CourseType[];
}

export interface Metrics {
  totalWeeks: number;
  totalHours: number;
  totalSessions: number;
  totalCourses: number;
  totalGroups: number;
  totalRooms: number;
  busiestDay: { day: string; hours: number };
  busiestWeek: { week: number; hours: number; range: string };
  hoursByDay: { [key: string]: number };
  hoursByWeek: { [key: number]: number };
  typeDistribution: { [key in CourseType]: number };
  shiftStats: {
    morning: { hours: number; sessions: number };
    afternoon: { hours: number; sessions: number };
    evening: { hours: number; sessions: number };
  };
  topRooms: { room: string; periods: number }[];
  classDistribution: { className: string; periods: number }[];
  subjectDistribution: { name: string; periods: number }[];
  coTeachers: { name: string; periods: number; subjects: string[] }[];

  totalConflicts: number;
  warnings: string[];
  conclusions: string[];
  peakWeekHeatmap: { day: string; count: number }[];
  peakWeekShiftStats: { morning: number; afternoon: number; evening: number };
  heatmapData: number[][]; // [weekIndex][dayIndex, 0=Mon, 6=Sun] -> periods
}



export enum TabType {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  STATS = 'STATS',
  OVERVIEW = 'OVERVIEW',
  SETTINGS = 'SETTINGS',
  ABOUT = 'ABOUT'
}

export interface Thresholds {
  daily: { warning: number; danger: number };
  weekly: { warning: number; danger: number };
}

export interface ChangeLogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface FilterState {
  search: string;
  className: string;
  room: string;
  teacher: string;
  sessionTime: string;
}
