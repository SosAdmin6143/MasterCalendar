import React from 'react';
import { CalendarEvent, EventGroup } from '../../types/calendar';
import { isSameDay, format } from 'date-fns';
import { Clock, MapPin, Users, Calendar, Plus, Tag } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  groupsMap: Map<string, EventGroup>;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
  onOpenEventModal: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  groupsMap,
  onSelectEvent,
  onSelectDate,
  onOpenEventModal,
}) => {
  const dayEvents = events
    .filter((e) => isSameDay(currentDate, new Date(e.start)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs p-4 sm:p-6 transition-colors">
      
      {/* Day Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Day Overview</span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5 tracking-tight">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">
            {dayEvents.length} scheduled event{dayEvents.length !== 1 ? 's' : ''} on this day
          </p>
        </div>

        <button
          onClick={onOpenEventModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event to Day</span>
        </button>
      </div>

      {/* Events Timeline / List */}
      <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-2">
        {dayEvents.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 dark:bg-slate-950/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700 dark:text-slate-300">No events scheduled</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mx-auto mt-1">
              There are no events on this date. Click '+ New Event' or use the AI Schedule Assistant to create one.
            </p>
          </div>
        ) : (
          dayEvents.map((evt) => {
            const group = groupsMap.get(evt.groupId);
            const groupColor = group?.color || '#3B82F6';

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="group relative p-4 sm:p-5 rounded-r-xl rounded-l-none bg-white dark:bg-slate-950 hover:bg-gray-50/50 dark:hover:bg-slate-800/60 border-y border-r border-gray-200 dark:border-slate-800 transition-all shadow-xs hover:shadow-md cursor-pointer"
                style={{
                  borderLeftWidth: '5px',
                  borderLeftColor: groupColor,
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    {/* Category Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800"
                        style={{ backgroundColor: groupColor + '20' }}
                      >
                        <Tag className="w-3 h-3" style={{ color: groupColor }} />
                        {group?.name || 'General'}
                      </span>
                      {evt.isAllDay && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 uppercase">
                          ALL DAY
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {evt.title}
                    </h3>

                    {/* Description */}
                    {evt.description && (
                      <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                        {evt.description}
                      </p>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-400 pt-2 font-medium">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>
                          {evt.isAllDay
                            ? 'All Day'
                            : `${format(new Date(evt.start), 'h:mm a')} - ${format(
                                new Date(evt.end),
                                'h:mm a'
                              )}`}
                        </span>
                      </div>

                      {evt.location && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{evt.location}</span>
                        </div>
                      )}

                      {evt.attendees && evt.attendees.length > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400">
                          <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{evt.attendees.length} attendee(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
