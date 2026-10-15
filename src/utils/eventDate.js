// Utility for parsing and formatting fest dates based on VITE_EVENT_DATE

const MONTHS = {
  jan: { index: 0, short: 'Jan', full: 'January' },
  feb: { index: 1, short: 'Feb', full: 'February' },
  mar: { index: 2, short: 'Mar', full: 'March' },
  apr: { index: 3, short: 'Apr', full: 'April' },
  may: { index: 4, short: 'May', full: 'May' },
  jun: { index: 5, short: 'Jun', full: 'June' },
  jul: { index: 6, short: 'Jul', full: 'July' },
  aug: { index: 7, short: 'Aug', full: 'August' },
  sep: { index: 8, short: 'Sep', full: 'September' },
  oct: { index: 9, short: 'Oct', full: 'October' },
  nov: { index: 10, short: 'Nov', full: 'November' },
  dec: { index: 11, short: 'Dec', full: 'December' },
};

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function parseEventDate(rawStr) {
  const raw = (rawStr || import.meta.env.VITE_EVENT_DATE || '7 - 9 JAN, 2027').trim();

  let startDay = 7;
  let endDay = 9;
  let monthKey = 'jan';
  let year = 2027;

  // Pattern 1: '7 - 9 JAN, 2027' or '7-9 January 2027'
  const m1 = raw.match(/(\d+)\s*[-–]\s*(\d+)\s+([A-Za-z]+)[,\s]+(\d{4})/);
  // Pattern 2: 'JAN 7 - 9, 2027' or 'January 7-9 2027'
  const m2 = raw.match(/([A-Za-z]+)\s+(\d+)\s*[-–]\s*(\d+)[,\s]+(\d{4})/);

  if (m1) {
    startDay = parseInt(m1[1], 10);
    endDay = parseInt(m1[2], 10);
    monthKey = m1[3].toLowerCase().slice(0, 3);
    year = parseInt(m1[4], 10);
  } else if (m2) {
    monthKey = m2[1].toLowerCase().slice(0, 3);
    startDay = parseInt(m2[2], 10);
    endDay = parseInt(m2[3], 10);
    year = parseInt(m2[4], 10);
  }

  const mInfo = MONTHS[monthKey] || { index: 0, short: 'Jan', full: 'January' };
  const startDate = new Date(year, mInfo.index, startDay, 9, 0, 0);

  const days = [];
  const totalDays = Math.max(1, endDay - startDay + 1);
  for (let i = 0; i < totalDays; i++) {
    const d = startDay + i;
    days.push({
      dayNumber: i + 1,
      date: d,
      shortDate: `${mInfo.short} ${d}`,
      fullDate: `${mInfo.short} ${d}, ${year}`,
      dayScheduleTitle: `Day ${i + 1} – ${mInfo.short} ${d}`,
    });
  }

  return {
    raw,
    year,
    startDay,
    endDay,
    monthShort: mInfo.short,
    monthFull: mInfo.full,
    startDate,
    days,
    dateRangeShort: `${mInfo.short} ${startDay}–${endDay}`,
    dateRangeFormal: `${getOrdinal(startDay)} to ${getOrdinal(endDay)} ${mInfo.full} ${year}`,
    badgeText: `${mInfo.full.toUpperCase()} ${startDay} – ${endDay}, ${year}`,
  };
}

export const EVENT_CONFIG = parseEventDate();
export const EVENT_START_DATE = EVENT_CONFIG.startDate;
export const EVENT_DATE_RAW = EVENT_CONFIG.raw;
export const EVENT_DAYS = EVENT_CONFIG.days;
export const EVENT_DATE_FORMAL = EVENT_CONFIG.dateRangeFormal;
export const EVENT_BADGE_TEXT = EVENT_CONFIG.badgeText;
export const EVENT_DATE_RANGE_SHORT = EVENT_CONFIG.dateRangeShort;

export function getDayShortDate(dayNum) {
  const found = EVENT_DAYS.find((d) => d.dayNumber === dayNum);
  return found ? found.shortDate : `Day ${dayNum}`;
}

export function getDayFullDate(dayNum, timeSuffix = '') {
  const found = EVENT_DAYS.find((d) => d.dayNumber === dayNum);
  const base = found ? found.fullDate : `Day ${dayNum}, ${EVENT_CONFIG.year}`;
  return timeSuffix ? `${base} • ${timeSuffix}` : base;
}
