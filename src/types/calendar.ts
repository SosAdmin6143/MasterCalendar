export interface EventGroup {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color string, e.g. '#3B82F6'
  textColor?: string; // Optional custom text color
  outlookCategory?: string; // Standard Outlook category name hint
  icon?: string; // Lucide icon name hint
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  groupId: string; // ID of the EventGroup
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO String (e.g., 2026-08-25T10:00:00.000Z)
  end: string;   // ISO String (e.g., 2026-08-25T11:00:00.000Z)
  isAllDay?: boolean;
  attendees?: string[]; // Array of emails or names
  resources?: string[]; // Array of equipment, room, tools, or assets added
  organizer?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedCalendar {
  id: string;
  name: string;
  description: string;
  timeZone: string;
  ownerName: string;
  groups: EventGroup[];
  events: CalendarEvent[];
  createdAt: string;
  updatedAt: string;
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda' | 'matrix';
