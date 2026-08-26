import React from 'react';
import { CalendarEvent, EventGroup } from '../../types/calendar';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  format 
} from 'date-fns';
import { Clock, MapPin, Box, Users } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  groupsMap: Map<string, EventGroup>;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  groupsMap,
  onSelectEvent,
  onSelectDate,
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 AM to 9:00 PM

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
      
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-950/80 text-xs font-bold text-gray-400 dark:text-slate-500 py-3 text-center sticky top-0 z-10">
        <div className="text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-center font-bold">
          <Clock className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-slate-500" /> Time
        </div>
        {days.map((day) => {
          const dayIsToday = isToday(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors flex flex-col items-center"
            >
              <span className="uppercase text-[11px] tracking-wider text-gray-400 dark:text-slate-500 font-bold">
                {format(day, 'EEE')}
              </span>
              <span
                className={`mt-1 inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-md ${
                  dayIsToday
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-900 dark:text-slate-100'
                }`}
              >
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hourly Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin max-h-[700px]">
        <div className="grid grid-cols-8 divide-x divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          
          {/* Time Labels Column */}
          <div className="divide-y divide-gray-100 dark:divide-slate-800 text-right pr-3 text-gray-400 dark:text-slate-500 text-[11px] font-semibold uppercase">
            {hours.map((hour) => (
              <div key={hour} className="h-16 flex items-start justify-end pt-1">
                {format(new Date().setHours(hour, 0, 0, 0), 'h aa')}
              </div>
            ))}
          </div>

          {/* 7 Day Columns */}
          {days.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(day, new Date(e.start)));

            return (
              <div
                key={day.toISOString()}
                className="relative divide-y divide-gray-100 dark:divide-slate-800 min-h-[960px] bg-white dark:bg-slate-900 hover:bg-gray-50/40 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Hourly Background Lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => {
                      const slotDate = new Date(day);
                      slotDate.setHours(hour, 0, 0, 0);
                      onSelectDate(slotDate);
                    }}
                    className="h-16 border-b border-gray-100 dark:border-slate-800 cursor-pointer hover:bg-blue-50/20 dark:hover:bg-blue-950/20"
                  />
                ))}

                {/* Event Overlays */}
                {dayEvents.map((evt) => {
                  const group = groupsMap.get(evt.groupId);
                  const groupColor = group?.color || '#3B82F6';

                  const startDate = new Date(evt.start);
                  const endDate = new Date(evt.end);

                  const startHour = startDate.getHours() + startDate.getMinutes() / 60;
                  const endHour = endDate.getHours() + endDate.getMinutes() / 60;
                  const duration = Math.max(endHour - startHour, 0.75); // At least 45 mins height

                  // Calculate top position relative to hour 7
                  const topOffset = Math.max((startHour - 7) * 64, 0);
                  const height = duration * 64;

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="absolute left-1 right-1 p-2 rounded-r-lg rounded-l-none border-y border-r border-gray-200 dark:border-slate-700 text-xs font-medium shadow-xs transition-all hover:shadow-md hover:z-20 cursor-pointer flex flex-col justify-between overflow-hidden"
                      style={{
                        top: `${topOffset}px`,
                        height: `${height}px`,
                        backgroundColor: groupColor + '20',
                        borderLeftWidth: '4px',
                        borderLeftColor: groupColor,
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-slate-100 leading-tight truncate">
                          <span className="truncate">{evt.title}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase mt-0.5">
                          {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                        </div>
                      </div>

                      {evt.attendees && evt.attendees.length > 0 && (
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-1 truncate">
                          <Users className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{evt.attendees.length} Attendee{evt.attendees.length > 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {evt.resources && evt.resources.length > 0 && (
                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 truncate">
                          <Box className="w-2.5 h-2.5 flex-shrink-0" />
                          <span className="truncate">{evt.resources.length} Resource{evt.resources.length > 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {evt.location && (
                        <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="w-2.5 h-2.5 text-gray-400 dark:text-slate-500" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};
