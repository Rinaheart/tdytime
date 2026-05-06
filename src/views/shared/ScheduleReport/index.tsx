import React from 'react';
import { Document, Page, Text, View, Font, Svg, Path, Rect } from '@react-pdf/renderer';
import { styles } from './styles';
import type { FlatSession } from '@/core/schedule/schedule.index';

// Register font for Vietnamese support
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
});

export interface ScheduleReportProps {
  mode: 'week' | 'semester';
  sessions: FlatSession[];
  weekRange?: string;
  teacherName?: string;
  notes?: Record<string, string>;
  title?: string;
}

// Inline SVG for the logo, representing favicon.svg to avoid CDN/CORS issues
const LogoSvg = () => (
  <Svg width="40" height="40" viewBox="84 84 344 344">
    <Rect x="96" y="108" width="320" height="308" rx="48" fill="#fff" stroke="#0358d5" strokeWidth="24" />
    <Path d="M96 168h320M190 96v25m132-25v25" stroke="#0358d5" strokeWidth="24" strokeLinecap="round" />
    <Path d="M203 246h106m-53 0v100" stroke="#0358d5" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="306" y="338" width="28" height="28" rx="6" fill="#ba1a1a" />
  </Svg>
);

const translateDay = (dayIdx: number, dateStr: string) => {
  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  return `${days[dayIdx]} - ${dateStr}`;
};

const translateShift = (shift: string) => {
  const map: Record<string, string> = {
    morning: 'Sáng',
    afternoon: 'Chiều',
    evening: 'Tối',
    night: 'Đêm',
  };
  return map[shift] || shift;
};

export const ScheduleReport: React.FC<ScheduleReportProps> = ({
  mode,
  sessions,
  weekRange,
  teacherName,
  notes = {},
  title,
}) => {
  const defaultTitle = mode === 'week' ? 'Lịch giảng dạy tuần' : 'Lịch giảng dạy học kỳ';
  const finalTitle = title || defaultTitle;
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  
  // Group sessions by day
  const groupedByDay = sessions.reduce((acc, session) => {
    const key = `${session.dayIdx}-${session.dateStr}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(session);
    return acc;
  }, {} as Record<string, FlatSession[]>);

  // Sort keys by dayIdx
  const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
    const aIdx = parseInt(a.split('-')[0]);
    const bIdx = parseInt(b.split('-')[0]);
    return aIdx - bIdx;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LogoSvg />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.universityName}>Trường Đại học Y Dược Huế</Text>
            <Text style={styles.reportTitle}>{finalTitle}</Text>
            <Text style={styles.reportSubtitle}>
              {teacherName ? `Giảng viên: ${teacherName}` : 'Báo cáo lịch giảng'}
              {weekRange ? ` | Tuần: ${weekRange}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          {sortedDays.length === 0 ? (
            <Text style={styles.infoText}>Không có lịch giảng trong thời gian này.</Text>
          ) : (
            sortedDays.map((dayKey) => {
              const daySessions = groupedByDay[dayKey];
              const firstSession = daySessions[0];

              return (
                <View key={dayKey} wrap={false}>
                  <Text style={styles.dayHeader}>
                    {translateDay(firstSession.dayIdx, firstSession.dateStr)}
                  </Text>
                  {daySessions.map((session) => {
                    const note = notes[session.id];
                    return (
                      <View key={session.id} style={styles.sessionRow}>
                        <View style={styles.timeCol}>
                          <Text style={styles.timeText}>{session.timeRangeStr}</Text>
                          <Text style={styles.shiftText}>{translateShift(session.shift)}</Text>
                        </View>
                        <View style={styles.detailsCol}>
                          <Text style={styles.courseName}>{session.courseName}</Text>
                          <Text style={styles.infoText}>Lớp: {session.className} | Phòng: {session.room}</Text>
                          {note && (
                            <View style={styles.noteContainer}>
                              <Text style={styles.noteText}>Ghi chú cá nhân: {note}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}

          {mode === 'semester' && sessions.length > 0 && (
            <View wrap={false} style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>HỌC KỲ — TỔNG CỘNG</Text>
              <Text style={styles.grandTotalValue}>
                {sessions.reduce((sum, s) => sum + (s.periodCount || 0), 0)} tiết
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Tạo bởi TdyTime - {dateStr}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Trang ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
