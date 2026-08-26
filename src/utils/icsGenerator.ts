import { SharedCalendar, CalendarEvent, EventGroup } from '../types/calendar';

/**
 * Formats a Date object into UTC iCal format string: YYYYMMDDTHHMMSSZ
 */
export function formatICalDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Formats a Date object into Date-only iCal format string: YYYYMMDD
 */
export function formatICalDateOnly(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate())
  );
}

/**
 * Escapes text strings according to RFC5545 standard
 */
export function escapeICalText(text: string = ''): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Generates RFC 5545 standard iCalendar (.ics) format string
 */
export function generateICSFeed(
  calendar: SharedCalendar,
  selectedGroupId?: string,
  appUrl: string = 'https://colorcal.app'
): string {
  const groupsMap = new Map<string, EventGroup>();
  calendar.groups.forEach((g) => groupsMap.set(g.id, g));

  // Filter events if specific group requested
  const eventsToInclude = selectedGroupId
    ? calendar.events.filter((e) => e.groupId === selectedGroupId)
    : calendar.events;

  const groupNameSuffix = selectedGroupId && groupsMap.has(selectedGroupId)
    ? ` - ${groupsMap.get(selectedGroupId)!.name}`
    : '';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//ColorCal App//Shared Outlook Calendar Generator//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(calendar.name + groupNameSuffix)}`,
    `X-WR-CALDESC:${escapeICalText(calendar.description || 'Color-coded group calendar managed with ColorCal')}`,
    `X-WR-TIMEZONE:${calendar.timeZone || 'UTC'}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M',
    'X-PUBLISHED-TTL:PT15M',
  ];

  const now = formatICalDate(new Date());

  for (const event of eventsToInclude) {
    const group = groupsMap.get(event.groupId);
    const groupName = group ? group.name : 'General';
    const groupColor = group ? group.color : '#3B82F6';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id || 'evt-' + Math.random().toString(36).substr(2, 9)}@colorcal.app`);
    lines.push(`DTSTAMP:${now}`);
    
    if (event.createdAt) {
      lines.push(`CREATED:${formatICalDate(event.createdAt)}`);
    }
    if (event.updatedAt) {
      lines.push(`LAST-MODIFIED:${formatICalDate(event.updatedAt)}`);
    }

    if (event.isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatICalDateOnly(event.start)}`);
      // iCal end date for all day events is exclusive, so add 1 day
      const endDate = new Date(event.end);
      endDate.setDate(endDate.getDate() + 1);
      lines.push(`DTEND;VALUE=DATE:${formatICalDateOnly(endDate)}`);
    } else {
      lines.push(`DTSTART:${formatICalDate(event.start)}`);
      lines.push(`DTEND:${formatICalDate(event.end)}`);
    }

    lines.push(`SUMMARY:${escapeICalText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeICalText(event.location)}`);
    }

    if (event.url) {
      lines.push(`URL:${escapeICalText(event.url)}`);
    }

    if (event.organizer) {
      lines.push(`ORGANIZER;CN=${escapeICalText(event.organizer)}:mailto:organizer@colorcal.app`);
    }

    // Assign categories & color properties for Microsoft Outlook / Apple Calendar
    lines.push(`CATEGORIES:${escapeICalText(groupName)}`);
    lines.push(`COLOR:${groupColor}`);
    lines.push(`X-APPLE-CALENDAR-COLOR:${groupColor}`);

    // Map hex color to Outlook color string if applicable
    const outlookColor = getOutlookColorKeyword(groupColor);
    lines.push(`X-OUTLOOK-COLOR:${outlookColor}`);

    // Recurrence rule if set
    if (event.recurrence && event.recurrence !== 'none') {
      let rrule = '';
      if (event.recurrence === 'daily') rrule = 'FREQ=DAILY';
      else if (event.recurrence === 'weekly') rrule = 'FREQ=WEEKLY';
      else if (event.recurrence === 'biweekly') rrule = 'FREQ=WEEKLY;INTERVAL=2';
      else if (event.recurrence === 'monthly') rrule = 'FREQ=MONTHLY';

      if (rrule) {
        lines.push(`RRULE:${rrule}`);
      }
    }

    if (event.attendees && event.attendees.length > 0) {
      for (const attendee of event.attendees) {
        lines.push(`ATTENDEE;CN=${escapeICalText(attendee)}:mailto:${escapeICalText(attendee)}`);
      }
    }

    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Maps standard hex colors to Microsoft Outlook category/calendar color keywords
 */
export function getOutlookColorKeyword(hex: string): string {
  const cleanHex = hex.toLowerCase().replace('#', '');
  
  // Approximate matching for Outlook default colors
  if (cleanHex.startsWith('ef') || cleanHex.startsWith('f8') || cleanHex.startsWith('dc') || cleanHex.startsWith('e1') || cleanHex.startsWith('ff')) {
    return 'Red';
  }
  if (cleanHex.startsWith('3b') || cleanHex.startsWith('25') || cleanHex.startsWith('02') || cleanHex.startsWith('1d') || cleanHex.startsWith('60')) {
    return 'Blue';
  }
  if (cleanHex.startsWith('10') || cleanHex.startsWith('16') || cleanHex.startsWith('22') || cleanHex.startsWith('05')) {
    return 'Green';
  }
  if (cleanHex.startsWith('f5') || cleanHex.startsWith('d9') || cleanHex.startsWith('eab') || cleanHex.startsWith('f9')) {
    return 'Orange';
  }
  if (cleanHex.startsWith('8b') || cleanHex.startsWith('7c') || cleanHex.startsWith('a8') || cleanHex.startsWith('93')) {
    return 'Purple';
  }
  if (cleanHex.startsWith('ec') || cleanHex.startsWith('db') || cleanHex.startsWith('f4') || cleanHex.startsWith('e0')) {
    return 'Magenta';
  }
  if (cleanHex.startsWith('14') || cleanHex.startsWith('06') || cleanHex.startsWith('0d')) {
    return 'Teal';
  }
  if (cleanHex.startsWith('ee') || cleanHex.startsWith('facc')) {
    return 'Yellow';
  }

  return 'Auto';
}
