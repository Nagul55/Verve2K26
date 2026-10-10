/**
 * Timezone utilities for Eventrix (Asia/Kolkata IST)
 */

export interface DeadlineParts {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (12-hour, e.g. "09:30")
  period: 'AM' | 'PM';
}

/**
 * Converts Date (YYYY-MM-DD), 12-hour Time (HH:mm), and Period (AM/PM)
 * to an ISO string representing Asia/Kolkata (IST, UTC+05:30).
 */
export function buildISTDeadlineISO(date: string, time: string, period: 'AM' | 'PM'): string | null {
  if (!date || !time || !period) return null;

  // Validate date format YYYY-MM-DD or DD-MM-YYYY
  let year: number, month: number, day: number;
  if (date.includes('-')) {
    const parts = date.split('-').map(Number);
    if (parts.length !== 3) return null;
    if (parts[0] > 1000) {
      // YYYY-MM-DD
      [year, month, day] = parts;
    } else {
      // DD-MM-YYYY
      [day, month, year] = parts;
    }
  } else {
    return null;
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // Validate time format HH:mm
  const timeParts = time.split(':').map(Number);
  if (timeParts.length !== 2) return null;
  let [hours12, minutes] = timeParts;

  if (isNaN(hours12) || isNaN(minutes)) return null;
  if (hours12 < 1 || hours12 > 12 || minutes < 0 || minutes > 59) return null;

  // Convert 12-hour to 24-hour
  let hours24 = hours12;
  if (period === 'AM') {
    if (hours12 === 12) hours24 = 0;
  } else if (period === 'PM') {
    if (hours12 !== 12) hours24 = hours12 + 12;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  const isoWithISTOffset = `${year}-${pad(month)}-${pad(day)}T${pad(hours24)}:${pad(minutes)}:00+05:30`;

  const parsedDate = new Date(isoWithISTOffset);
  if (isNaN(parsedDate.getTime())) return null;

  return parsedDate.toISOString();
}

/**
 * Converts Date string (YYYY-MM-DD or DD-MM-YYYY) and Time string (HH:mm 24-hour or 12-hour AM/PM)
 * into an accurate UTC ISO timestamp corresponding to Asia/Kolkata (IST).
 */
export function buildISTDateTimeISO(dateStr?: string | null, timeStr?: string | null): string | null {
  if (!dateStr || !dateStr.trim()) return null;
  const cleanDate = dateStr.trim();

  // If already an ISO string with time (e.g. from DB), parse directly
  if (cleanDate.includes('T')) {
    const d = new Date(cleanDate);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  let hours24 = 0;
  let minutes = 0;
  const cleanTime = (timeStr || '').trim();

  if (cleanTime) {
    if (cleanTime.includes('AM') || cleanTime.includes('PM')) {
      const [t, period] = cleanTime.split(/\s+/);
      const [h, m] = (t || '').split(':').map(Number);
      let hour = isNaN(h) ? 0 : h;
      minutes = isNaN(m) ? 0 : m;
      if (period?.toUpperCase() === 'PM' && hour < 12) hour += 12;
      if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;
      hours24 = hour;
    } else {
      const [h, m] = cleanTime.split(':').map(Number);
      hours24 = isNaN(h) ? 0 : h;
      minutes = isNaN(m) ? 0 : m;
    }
  }

  let year: number, month: number, day: number;
  if (cleanDate.includes('-')) {
    const parts = cleanDate.split('-').map(Number);
    if (parts.length !== 3) return null;
    if (parts[0] > 1000) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
  } else {
    return null;
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const isoWithISTOffset = `${year}-${pad(month)}-${pad(day)}T${pad(hours24)}:${pad(minutes)}:00+05:30`;
  const parsed = new Date(isoWithISTOffset);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Parses an ISO deadline string or DB timestamp string into IST components:
 * - date (YYYY-MM-DD)
 * - time (HH:mm 12-hour)
 * - period (AM/PM)
 */
export function parseISTDeadlineParts(isoString: string | null | undefined): DeadlineParts | null {
  if (!isoString) return null;

  const d = new Date(isoString);
  if (isNaN(d.getTime())) return null;

  // Format in Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  let hour = parseInt(getPart('hour'), 10);
  const minute = getPart('minute');
  const dayPeriod = (getPart('dayPeriod') || 'AM').toUpperCase() as 'AM' | 'PM';

  if (isNaN(hour)) hour = 12;
  const pad = (n: number) => n.toString().padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${pad(hour)}:${minute}`,
    period: dayPeriod === 'PM' ? 'PM' : 'AM',
  };
}

/**
 * Formats deadline into clean display string in IST: e.g. "15 Oct 2026, 09:30 PM IST"
 */
export function formatDeadlineDisplay(isoString: string | null | undefined): string {
  if (!isoString) return 'No deadline set';

  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'No deadline set';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d) + ' IST';
}

/**
 * Calculates countdown details from current time to target ISO deadline in IST.
 */
export function calculateDeadlineCountdown(isoString: string | null | undefined): {
  isClosed: boolean;
  text: string;
} {
  if (!isoString) {
    return { isClosed: false, text: '' };
  }

  const deadline = new Date(isoString).getTime();
  if (isNaN(deadline)) {
    return { isClosed: false, text: '' };
  }

  const now = Date.now();
  const diff = deadline - now;

  if (diff <= 0) {
    return { isClosed: true, text: 'Registration Closed' };
  }

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return { isClosed: false, text: `Closes in: ${days}d ${hours}h ${minutes}m` };
  }
  if (hours > 0) {
    return { isClosed: false, text: `Closes in: ${hours}h ${minutes}m` };
  }
  return { isClosed: false, text: `Closes in: ${minutes}m` };
}
