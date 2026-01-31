
import {
  ScheduleData,
  Metadata,
  WeekSchedule,
  CourseSession,
  CourseType,
  DaySchedule,
  AggregatedCourse
} from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const parseScheduleHTML = (html: string): ScheduleData | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Validation: Check for essential structure
  const weekCells = doc.querySelectorAll('.hitec-td-tkbTuan');
  if (weekCells.length === 0) {
    throw new Error("Không tìm thấy dữ liệu tuần (.hitec-td-tkbTuan). Vui lòng kiểm tra file HTML.");
  }

  const table = doc.querySelector('table.table-bordered');
  if (!table) {
    throw new Error("Không tìm thấy bảng thời khóa biểu (table.table-bordered).");
  }

  const teacher = doc.querySelector('.hitec-information h5')?.textContent?.trim() || "Unknown Teacher";
  const yearSemesterText = doc.querySelector('.hitec-year')?.textContent?.trim() || "";
  const semesterMatch = yearSemesterText.match(/Học kỳ:\s*(\d+)/);
  const yearMatch = yearSemesterText.match(/năm học:\s*([\d-]+)/);

  const metadata: Metadata = {
    teacher,
    semester: semesterMatch ? semesterMatch[1] : "Unknown",
    academicYear: yearMatch ? yearMatch[1] : "Unknown",
    extractedDate: new Date().toISOString()
  };

  const weeks: WeekSchedule[] = [];
  const tableRows = Array.from(doc.querySelectorAll('table.table-bordered tbody tr'));

  let currentWeek: WeekSchedule | null = null;
  let weekCounter = 0;

  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i];
    const weekRangeCell = row.querySelector('.hitec-td-tkbTuan');

    if (weekRangeCell) {
      weekCounter++;
      currentWeek = {
        weekNumber: weekCounter,
        dateRange: weekRangeCell.textContent?.trim() || "",
        days: {}
      };

      DAYS.forEach(day => {
        currentWeek!.days[day] = { morning: [], afternoon: [], evening: [] };
      });

      const morningRow = tableRows[i + 1];
      const afternoonRow = tableRows[i + 2];
      const eveningRow = tableRows[i + 3];

      if (morningRow) processSlotRow(morningRow, 'morning', currentWeek);
      if (afternoonRow) processSlotRow(afternoonRow, 'afternoon', currentWeek);
      if (eveningRow) processSlotRow(eveningRow, 'evening', currentWeek);

      weeks.push(currentWeek);
      i += 3;
    }
  }

  if (weeks.length === 0) {
    throw new Error("Không trích xuất được dữ liệu tuần nào.");
  }

  return {
    metadata,
    weeks,
    allCourses: aggregateCourses(weeks)
  };
};

const processSlotRow = (row: Element, session: 'morning' | 'afternoon' | 'evening', week: WeekSchedule) => {
  const cells = Array.from(row.querySelectorAll('td'));
  cells.forEach((cell, dayIdx) => {
    if (dayIdx >= 7) return;
    const dayName = DAYS[dayIdx];
    const courseLinks = Array.from(cell.querySelectorAll('a'));

    courseLinks.forEach(link => {
      const groupCode = link.querySelector('strong')?.textContent?.trim() || "";
      const popoverContent = link.getAttribute('data-content') || "";
      const fullTitle = link.getAttribute('title') || "";

      // Improved Bóc Tách: CourseName - Nhóm X - ClassName
      const parts = fullTitle.split(' - ').map(p => p.trim());
      let group = "";
      let className = "";
      let courseName = "";

      const groupIndex = parts.findIndex(p => p.toLowerCase().includes('nhóm'));
      if (groupIndex !== -1) {
        courseName = parts.slice(0, groupIndex).join(' - ');
        group = parts[groupIndex];
        className = parts.slice(groupIndex + 1).join(' - ');
      } else {
        courseName = parts[0] || groupCode;
      }

      const roomMatch = popoverContent.match(/Phòng học:\s*([^<]+)/);
      const slotMatch = popoverContent.match(/Tiết:\s*(\d+)\s*-\s*(\d+)/);
      const teacherMatch = popoverContent.match(/Giáo viên:\s*([^<]*)/);

      const periodStart = slotMatch ? parseInt(slotMatch[1]) : 0;
      const periodEnd = slotMatch ? parseInt(slotMatch[2]) : 0;
      const periods = (periodEnd - periodStart) + 1;

      // Improved Type Logic: if contains -TH -> TH, else -> LT (default)
      const type = groupCode.includes('-TH') ? CourseType.TH : CourseType.LT;

      const sessionObj: CourseSession = {
        courseCode: groupCode,
        courseName,
        group,
        className,
        timeSlot: `${periodStart}-${periodEnd}`,
        periodCount: periods,
        room: roomMatch ? roomMatch[1].trim() : "Unknown",
        teacher: teacherMatch ? teacherMatch[1].trim() : "Chưa rõ",
        actualHours: 0,
        type: type,
        dayOfWeek: dayName,
        sessionTime: session
      };

      week.days[dayName][session].push(sessionObj);
    });
  });
};

const aggregateCourses = (weeks: WeekSchedule[]): AggregatedCourse[] => {
  const map = new Map<string, AggregatedCourse>();

  weeks.forEach(w => {
    Object.values(w.days).forEach(day => {
      const dayParts = day as DaySchedule;
      const allSessions = [...dayParts.morning, ...dayParts.afternoon, ...dayParts.evening];

      allSessions.forEach(s => {
        const fullCode = s.courseCode;
        if (!map.has(fullCode)) {
          map.set(fullCode, {
            code: fullCode,
            name: s.courseName,
            totalPeriods: 0,
            totalSessions: 0,
            groups: [],
            classes: [],
            types: []
          });
        }
        const course = map.get(fullCode)!;
        course.totalPeriods += s.periodCount;
        course.totalSessions += 1;
        if (s.group && !course.groups.includes(s.group)) course.groups.push(s.group);
        if (s.className && !course.classes.includes(s.className)) course.classes.push(s.className);
        if (!course.types.includes(s.type)) course.types.push(s.type);
      });
    });
  });

  return Array.from(map.values());
};
