/**
 * Utility functions to determine event completion and live status.
 * Used across server actions, API routes, and client components.
 */

export interface EventDateInfo {
  date?: string | null;
  time?: string | null;
  status?: string | null;
  festRegistrationClosesAt?: string | null;
}

/**
 * Parses event date and time strings into a concrete Date object representing the event's end/conclusion time.
 */
export function parseEventEndDateTime(dateStr?: string | null, timeStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '' || dateStr.toLowerCase() === 'tbd') {
    return null;
  }

  try {
    const cleanDate = dateStr.trim();
    let timePart = (timeStr && typeof timeStr === 'string') ? timeStr.trim() : '';

    // If time contains a range e.g. "09:00 AM - 01:00 PM", extract the end time
    if (timePart.includes('-')) {
      const parts = timePart.split('-');
      timePart = parts[parts.length - 1].trim();
    }

    // Check for 12-hour AM/PM format
    if (timePart && (timePart.toUpperCase().includes('AM') || timePart.toUpperCase().includes('PM'))) {
      const match = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hrs = parseInt(match[1], 10);
        const mins = match[2];
        const modifier = match[3].toUpperCase();
        if (modifier === 'PM' && hrs < 12) hrs += 12;
        if (modifier === 'AM' && hrs === 12) hrs = 0;
        const d = new Date(`${cleanDate}T${hrs.toString().padStart(2, '0')}:${mins}:00`);
        if (!isNaN(d.getTime())) return d;
      }
    } else if (timePart && timePart.includes(':')) {
      // 24-hour format HH:MM
      const match = timePart.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const d = new Date(`${cleanDate}T${match[1].padStart(2, '0')}:${match[2]}:00`);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // Fallback: If only date is provided or time couldn't be parsed,
    // event concludes at the end of that day (23:59:59)
    const endOfDay = new Date(`${cleanDate}T23:59:59`);
    if (!isNaN(endOfDay.getTime())) return endOfDay;

    // Last resort generic parse
    const generic = new Date(cleanDate);
    if (!isNaN(generic.getTime())) {
      // Set to 23:59:59 of that parsed date
      generic.setHours(23, 59, 59, 999);
      return generic;
    }
  } catch (e) {
    // Return null if parsing fails
  }

  return null;
}

/**
 * Checks if an event has already concluded.
 * Returns true if:
 * 1. Status is explicitly 'COMPLETED'
 * 2. Or the event's scheduled date and time is in the past
 */
export function isEventOver(event: EventDateInfo): boolean {
  if (!event) return false;

  const rawStatus = (event.status || '').toUpperCase().trim();
  if (rawStatus === 'COMPLETED') return true;

  const endDateTime = parseEventEndDateTime(event.date, event.time);
  if (endDateTime && Date.now() > endDateTime.getTime()) {
    return true;
  }

  return false;
}

/**
 * Checks if an event is currently live and active.
 * An event is LIVE if:
 * 1. Its status is 'LIVE' or 'APPROVED'
 * 2. AND the event has NOT ended/over! (If it's over, it should not be live)
 */
export function isEventLive(event: EventDateInfo): boolean {
  if (!event) return false;
  const rawStatus = (event.status || '').toUpperCase().trim();
  const isApprovedOrLive = rawStatus === 'LIVE' || rawStatus === 'APPROVED';
  return isApprovedOrLive && !isEventOver(event);
}

/**
 * Returns the effective display status for an event.
 * If the event has ended, its effective status is 'COMPLETED'.
 */
export function getEffectiveEventStatus(event: EventDateInfo): 'COMPLETED' | 'LIVE' | 'CLOSED' | 'PENDING_APPROVAL' | 'DRAFT' | 'REJECTED' {
  if (!event) return 'DRAFT';
  if (isEventOver(event)) return 'COMPLETED';

  const rawStatus = (event.status || '').toUpperCase().trim();
  if (rawStatus === 'LIVE' || rawStatus === 'APPROVED') return 'LIVE';
  if (rawStatus === 'CLOSED') return 'CLOSED';
  if (rawStatus === 'PENDING_APPROVAL') return 'PENDING_APPROVAL';
  if (rawStatus === 'REJECTED') return 'REJECTED';
  return 'DRAFT';
}
