
import { ScheduleData, Metrics, CourseType, DaySchedule, CourseSession } from '../types';
import { DAYS_OF_WEEK, VI_DAYS_OF_WEEK } from '../constants';

export const calculateMetrics = (data: ScheduleData): Metrics => {
  let totalHours = 0;
  let totalSessions = 0;
  const hoursByDay: { [key: string]: number } = {};
  const hoursByWeek: { [key: number]: number } = {};
  const typeDistribution = { [CourseType.LT]: 0, [CourseType.TH]: 0 };
  const roomMetrics: { [key: string]: number } = {};
  const classMetrics: { [key: string]: number } = {};
  const subjectMetrics: { [key: string]: number } = {}; // For filtered subjects
  const coTeacherMap = new Map<string, { periods: number, subjects: Set<string> }>();

  const shiftStats = {
    morning: { hours: 0, sessions: 0 },
    afternoon: { hours: 0, sessions: 0 },
    evening: { hours: 0, sessions: 0 }
  };

  const warnings: string[] = [];

  // Normalize helper: Remove accents, lowercase, remove titles
  const normalizeName = (name: string) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/ths\.|ts\.|pgs\.|gs\.|gv\./g, "")
      .trim();
  };

  // Normalize main teacher name for comparison
  const mainTeacherName = normalizeName(data.metadata.teacher);

  DAYS_OF_WEEK.forEach(d => hoursByDay[d] = 0);

  // Helper to check if session belongs to main teacher
  const isMainTeacher = (t: string) => {
    if (!t || t === "Chưa rõ" || t === "Unknown") return true;
    const normT = normalizeName(t);
    return normT.includes(mainTeacherName) || mainTeacherName.includes(normT);
  };

  // Helper to check if two time slots overlap
  const isTimeOverlap = (slot1: string, slot2: string) => {
    const parseSlot = (s: string) => {
      const nums = s.split('-').map(Number);
      return nums.length === 2 ? { start: nums[0], end: nums[1] } : { start: nums[0], end: nums[0] };
    };
    const s1 = parseSlot(slot1);
    const s2 = parseSlot(slot2);
    return Math.max(s1.start, s2.start) <= Math.min(s1.end, s2.end);
  };

  // First pass: Detect Conflicts
  data.weeks.forEach(w => {
    Object.values(w.days).forEach(day => {
      const parts = day as DaySchedule;
      const allDaySessions = [...parts.morning, ...parts.afternoon, ...parts.evening];

      allDaySessions.forEach(s => s.hasConflict = false);

      allDaySessions.forEach(s1 => {
        // 1. Teacher Overlap

        const teacherConflicts = allDaySessions.filter(s2 =>
          s1 !== s2 &&
          s1.teacher === s2.teacher &&
          s1.teacher !== "Unknown" && s1.teacher !== "Chưa rõ" &&
          isTimeOverlap(s1.timeSlot, s2.timeSlot) &&
          (s1.room !== s2.room || s1.courseCode !== s2.courseCode || s1.group !== s2.group)
        );

        // 2. Room Overlap (Same room, overlapping time, different class or teacher)
        const roomConflicts = allDaySessions.filter(s2 =>
          s1 !== s2 &&
          s1.room === s2.room &&
          s1.room !== "Chưa rõ" && s1.room !== "Unknown" &&
          isTimeOverlap(s1.timeSlot, s2.timeSlot) &&
          (s1.courseCode !== s2.courseCode || s1.group !== s2.group || s1.teacher !== s2.teacher)
        );

        if (teacherConflicts.length > 0 || roomConflicts.length > 0) {
          s1.hasConflict = true;
          // You could also add a conflictReason field if you want to show details
        }
      });
    });
  });


  let busiestWeek = { week: 1, hours: 0, range: '' };
  let peakWeekHeatmap: { day: string, count: number }[] = [];
  let peakWeekShiftStats = { morning: 0, afternoon: 0, evening: 0 };

  const heatmapData: number[][] = []; // [weekIndex][dayIndex, 0=Mon, 6=Sun]

  // Second pass: Calculate Metrics for Main Teacher ONLY
  let totalConflictsCount = 0;
  data.weeks.forEach(w => {
    Object.values(w.days).forEach(day => {
      const parts = day as DaySchedule;
      [...parts.morning, ...parts.afternoon, ...parts.evening].forEach(s => {
        if (s.hasConflict) totalConflictsCount++;
      });
    });

    let weekTotal = 0;


    // Temp storage for peak week calculation
    const currentWeekHeatmap: Record<string, number> = {};
    DAYS_OF_WEEK.forEach(d => currentWeekHeatmap[d] = 0);
    const currentWeekShifts = { morning: 0, afternoon: 0, evening: 0 };

    // Data for matrix heatmap
    const weekMatrixRow: number[] = new Array(7).fill(0);

    Object.entries(w.days).forEach(([day, sessions]) => {
      const parts = sessions as DaySchedule;
      const dayIndex = DAYS_OF_WEEK.indexOf(day);

      const processPart = (part: CourseSession[], shift: 'morning' | 'afternoon' | 'evening') => {
        part.forEach(s => {
          // If not main teacher, track co-teacher and skip main stats
          if (!isMainTeacher(s.teacher)) {
            if (!coTeacherMap.has(s.teacher)) {
              coTeacherMap.set(s.teacher, { periods: 0, subjects: new Set() });
            }
            const co = coTeacherMap.get(s.teacher)!;
            co.periods += s.periodCount;
            co.subjects.add(s.courseName);
            return;
          }

          // Main Teacher Stats
          shiftStats[shift].sessions += 1;
          shiftStats[shift].hours += s.periodCount;
          totalSessions += 1;

          typeDistribution[s.type] += s.periodCount;
          roomMetrics[s.room] = (roomMetrics[s.room] || 0) + s.periodCount;

          if (s.className) {
            classMetrics[s.className] = (classMetrics[s.className] || 0) + s.periodCount;
          }

          // Subject Metrics (Filtered)
          subjectMetrics[s.courseName] = (subjectMetrics[s.courseName] || 0) + s.periodCount;

          totalHours += s.periodCount;
          hoursByDay[day] += s.periodCount;
          weekTotal += s.periodCount;

          // For Peak Week Logic
          currentWeekHeatmap[day] += s.periodCount;
          currentWeekShifts[shift] += 1;

          // Matrix Heatmap
          if (dayIndex !== -1) {
            weekMatrixRow[dayIndex] += s.periodCount;
          }

          // Warnings Check
          if (s.sessionTime === 'evening') warnings.push('EVENING_CLASS');
          if (['Saturday', 'Sunday'].includes(s.dayOfWeek)) warnings.push('WEEKEND_CLASS');
          if (s.periodCount === 1) warnings.push('SINGLE_PERIOD');
        });
      };

      processPart(parts.morning, 'morning');
      processPart(parts.afternoon, 'afternoon');
      processPart(parts.evening, 'evening');
    });

    heatmapData.push(weekMatrixRow);

    hoursByWeek[w.weekNumber] = weekTotal;
    if (weekTotal > 25) warnings.push(`OVERLOAD_WEEK_${w.weekNumber}`);

    // Determine Peak Week
    if (weekTotal > busiestWeek.hours) {
      busiestWeek = { week: w.weekNumber, hours: weekTotal, range: w.dateRange };
      peakWeekHeatmap = Object.entries(currentWeekHeatmap).map(([d, c]) => ({ day: d, count: c }));
      peakWeekShiftStats = currentWeekShifts;
    }
  });

  let busiestDay = { day: 'Monday', hours: 0 };
  Object.entries(hoursByDay).forEach(([day, hours]) => {
    if (hours > busiestDay.hours) busiestDay = { day, hours };
  });

  const uniqueSubjects = new Set(Object.keys(subjectMetrics)); // Valid subjects only

  const topRooms = Object.entries(roomMetrics)
    .map(([room, periods]) => ({ room, periods }))
    .sort((a, b) => b.periods - a.periods)
    .slice(0, 10);

  const classDistribution = Object.entries(classMetrics)
    .map(([className, periods]) => ({ className, periods }))
    .sort((a, b) => b.periods - a.periods);

  const subjectDistribution = Object.entries(subjectMetrics)
    .map(([name, periods]) => ({ name, periods }))
    .sort((a, b) => b.periods - a.periods);

  const coTeachers = Array.from(coTeacherMap.entries()).map(([name, data]) => ({
    name,
    periods: data.periods,
    subjects: Array.from(data.subjects)
  }));

  // Process Warnings into unique strings
  const distinctWarnings: string[] = [];
  const overloadWeeks = warnings.filter(w => w.startsWith('OVERLOAD')).length;
  if (overloadWeeks > 0) distinctWarnings.push(`${overloadWeeks}/${data.weeks.length} tuần > 25 tiết (ngưỡng cảnh báo)`);

  const eveningCount = warnings.filter(w => w === 'EVENING_CLASS').length;
  if (eveningCount > 0) distinctWarnings.push(`${eveningCount} buổi dạy tối`);

  const weekendCount = warnings.filter(w => w === 'WEEKEND_CLASS').length;
  if (weekendCount > 0) distinctWarnings.push(`${weekendCount} buổi dạy cuối tuần (T7, CN)`);

  const singlePeriodCount = warnings.filter(w => w === 'SINGLE_PERIOD').length;
  if (singlePeriodCount > 0) distinctWarnings.push(`${singlePeriodCount} buổi chỉ có 1 tiết (hiệu suất thấp)`);

  if (totalConflictsCount > 0) distinctWarnings.push(`${Math.round(totalConflictsCount / 2)} xung đột lịch dạy/phòng học cần kiểm tra`);

  // Generate Conclusions
  const conclusions: string[] = [];


  // 1. Time distribution
  const firstHalfWeeks = data.weeks.length / 2;
  const firstHalfHours = Object.entries(hoursByWeek).filter(([w]) => parseInt(w) <= firstHalfWeeks).reduce((acc, [, h]) => acc + h, 0);
  if (firstHalfHours > totalHours * 0.6) conclusions.push("Khối lượng tập trung đầu học kỳ");
  else if (firstHalfHours < totalHours * 0.4) conclusions.push("Khối lượng tập trung cuối học kỳ");
  else conclusions.push("Khối lượng phân bổ đều giữa học kỳ");

  // 2. Type
  if (typeDistribution[CourseType.TH] > typeDistribution[CourseType.LT])
    conclusions.push(`Thực hành chiếm ưu thế (${Math.round(typeDistribution[CourseType.TH] / totalHours * 100)}%)`);
  else
    conclusions.push(`Lý thuyết chiếm ưu thế (${Math.round(typeDistribution[CourseType.LT] / totalHours * 100)}%)`);

  // 3. Peak time
  const maxShift = Object.entries(shiftStats).sort((a, b) => b[1].hours - a[1].hours)[0][0];
  const maxShiftVi = maxShift === 'morning' ? 'Sáng' : maxShift === 'afternoon' ? 'Chiều' : 'Tối';
  const busyDayVi = VI_DAYS_OF_WEEK[DAYS_OF_WEEK.indexOf(busiestDay.day)];
  conclusions.push(`${maxShiftVi} và ${busyDayVi} là thời gian cao điểm`);

  // 4. Efficiency
  if (singlePeriodCount > 0 || weekendCount > 0) conclusions.push("Có ca lẻ và dạy cuối tuần cần tối ưu");

  return {
    totalWeeks: data.weeks.length,
    totalHours,
    totalSessions,
    totalCourses: uniqueSubjects.size,
    totalGroups: data.allCourses.length, // Keep raw total groups? Or filter? Let's keep raw as group stats
    totalRooms: Object.keys(roomMetrics).length,
    busiestDay,
    busiestWeek,
    hoursByDay,
    hoursByWeek,
    typeDistribution,
    shiftStats,
    topRooms,
    classDistribution,
    subjectDistribution, // New field
    coTeachers,
    totalConflicts: Math.round(totalConflictsCount / 2),
    warnings: distinctWarnings,
    conclusions,
    peakWeekHeatmap,
    peakWeekShiftStats,
    heatmapData
  };
};

