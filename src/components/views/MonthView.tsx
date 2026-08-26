import React from 'react';
import { CalendarEvent, EventGroup } from '../../types/calendar';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  format 
} from 'date-fns';
import { MapPin, Clock } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  groupsMap: Map<string, EventGroup>;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  groupsMap,
  onSelectEvent,
  onSelectDate,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-950/80 text-xs font-bold text-gray-400 dark:text-slate-500 py-3 text-center">
        {weekDays.map((day) => (
          <div key={day} className="tracking-wider uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1 border-b border-r border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayIsToday = isToday(day);

          // Find events on this day
          const dayEvents = events.filter((e) => {
            const start = new Date(e.start);
            return isSameDay(day, start);
          });

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2.5 border-t border-l border-gray-100 dark:border-slate-800 transition-colors cursor-pointer group flex flex-col justify-between hover:bg-gray-50/80 dark:hover:bg-slate-800/60 ${
                !isCurrentMonth ? 'bg-gray-50/30 dark:bg-slate-950/30 opacity-40 dark:opacity-30' : ''
              } ${dayIsToday ? 'bg-blue-50/20 dark:bg-blue-950/30' : ''}`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-flex items-center justify-center text-xs w-6 h-6 rounded-md transition-transform ${
                    dayIsToday
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : isCurrentMonth
                      ? 'text-gray-900 dark:text-slate-100 font-semibold'
                      : 'text-gray-400 dark:text-slate-600'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium hidden sm:inline">
                    {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Day Events Stack */}
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto scrollbar-none">
                {dayEvents.slice(0, 3).map((evt) => {
                  const group = groupsMap.get(evt.groupId);
                  const groupColor = group?.color || '#3B82F6';

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="px-2 py-1 rounded-r-md rounded-l-none text-xs font-medium border-y border-r border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-slate-100 transition-all hover:translate-x-0.5 cursor-pointer truncate flex items-center justify-between gap-1 shadow-2xs"
                      style={{
                        backgroundColor: groupColor + '18',
                        borderLeftWidth: '4px',
                        borderLeftColor: groupColor,
                      }}
                      title={`${evt.title} (${group?.name || 'Group'})`}
                    >
                      <div className="truncate flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold truncate text-gray-900 dark:text-slate-100">{evt.title}</span>
                      </div>
                      {!evt.isAllDay && (
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold uppercase flex-shrink-0 hidden md:inline">
                          {format(new Date(evt.start), 'h:mma')}
                        </span>
                      )}
                    </div>
                  );
                })}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-blue-600 dark:text-blue-300 font-semibold px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-center">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
