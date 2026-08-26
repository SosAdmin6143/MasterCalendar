import React, { useState } from 'react';
import { CalendarEvent, EventGroup } from '../../types/calendar';
import { format, isSameDay } from 'date-fns';
import { Search, Clock, MapPin, Users, Filter, Calendar, Box } from 'lucide-react';

interface AgendaViewProps {
  events: CalendarEvent[];
  groupsMap: Map<string, EventGroup>;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  events,
  groupsMap,
  onSelectEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');

  // Filter & sort events by date ascending
  const filteredEvents = events
    .filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesGroup = selectedGroupId === 'ALL' || e.groupId === selectedGroupId;
      return matchesSearch && matchesGroup;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Group events by date string
  const groupedByDate = new Map<string, CalendarEvent[]>();
  filteredEvents.forEach((evt) => {
    const dateKey = format(new Date(evt.start), 'yyyy-MM-dd');
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(evt);
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs p-4 sm:p-6 transition-colors">
      
      {/* Search & Group Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, locations, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {(Array.from(groupsMap.values()) as EventGroup[]).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agenda List */}
      <div className="mt-6 flex-1 overflow-y-auto space-y-8 pr-2">
        {groupedByDate.size === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 dark:bg-slate-950/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700 dark:text-slate-300">No events found</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Try adjusting your search query or group filter.</p>
          </div>
        ) : (
          Array.from(groupedByDate.entries()).map(([dateKey, dateEvents]) => {
            const dateObj = new Date(dateEvents[0].start);

            return (
              <div key={dateKey} className="space-y-3">
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-2 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                    {format(dateObj, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                    {dateEvents.length} event{dateEvents.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Event Cards */}
                <div className="grid gap-3 pl-3">
                  {dateEvents.map((evt) => {
                    const group = groupsMap.get(evt.groupId);
                    const groupColor = group?.color || '#3B82F6';

                    return (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        className="group p-4 rounded-r-xl rounded-l-none bg-white dark:bg-slate-950 hover:bg-gray-50/60 dark:hover:bg-slate-800/60 border-y border-r border-gray-200 dark:border-slate-800 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                        style={{
                          borderLeftWidth: '5px',
                          borderLeftColor: groupColor,
                        }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800"
                              style={{ backgroundColor: groupColor + '20' }}
                            >
                              {group?.name || 'General'}
                            </span>
                            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              {evt.isAllDay
                                ? 'All Day'
                                : `${format(new Date(evt.start), 'h:mm a')} - ${format(
                                    new Date(evt.end),
                                    'h:mm a'
                                  )}`}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {evt.title}
                          </h4>

                          {evt.description && (
                            <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-1 font-normal">
                              {evt.description}
                            </p>
                          )}

                          {evt.attendees && evt.attendees.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-md">
                                <Users className="w-3 h-3" />
                                <span>{evt.attendees.length} Attendee{evt.attendees.length > 1 ? 's' : ''}:</span>
                              </span>
                              {evt.attendees.slice(0, 3).map((att, i) => (
                                <span key={i} className="text-[10px] font-semibold bg-emerald-100/60 dark:bg-slate-800 text-emerald-900 dark:text-slate-200 px-2 py-0.5 rounded">
                                  {att}
                                </span>
                              ))}
                              {evt.attendees.length > 3 && (
                                <span className="text-[10px] font-semibold text-gray-400">
                                  +{evt.attendees.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {evt.resources && evt.resources.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-md">
                                <Box className="w-3 h-3" />
                                <span>{evt.resources.length} Resource{evt.resources.length > 1 ? 's' : ''}:</span>
                              </span>
                              {evt.resources.slice(0, 3).map((res, i) => (
                                <span key={i} className="text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded">
                                  {res}
                                </span>
                              ))}
                              {evt.resources.length > 3 && (
                                <span className="text-[10px] font-semibold text-gray-400">
                                  +{evt.resources.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {evt.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 flex-shrink-0 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span className="truncate max-w-[200px]">{evt.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
