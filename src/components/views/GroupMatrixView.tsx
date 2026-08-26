import React from 'react';
import { CalendarEvent, EventGroup } from '../../types/calendar';
import { format } from 'date-fns';
import { Clock, MapPin, Plus, Share2 } from 'lucide-react';

interface GroupMatrixViewProps {
  groups: EventGroup[];
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onOpenAddEventForGroup: (groupId: string) => void;
  onOpenShareGroup: (groupId: string) => void;
}

export const GroupMatrixView: React.FC<GroupMatrixViewProps> = ({
  groups,
  events,
  onSelectEvent,
  onOpenAddEventForGroup,
  onOpenShareGroup,
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs p-4 sm:p-6 transition-colors">
      
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Event Group Matrix</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
            Side-by-side breakdown of events per color category. Easily manage or export specific group feeds to Outlook.
          </p>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="mt-6 flex-1 overflow-x-auto scrollbar-thin">
        <div className="flex gap-4 min-w-max pb-4">
          {groups.map((group) => {
            const groupEvents = events
              .filter((e) => e.groupId === group.id)
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

            return (
              <div
                key={group.id}
                className="w-80 flex-shrink-0 bg-gray-50/50 dark:bg-slate-950/50 rounded-xl border border-gray-200 dark:border-slate-800 p-4 flex flex-col justify-between shadow-2xs"
              >
                <div>
                  {/* Group Header */}
                  <div
                    className="p-3 rounded-lg border mb-4 flex items-center justify-between shadow-xs bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800"
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: group.color,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                        {group.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenShareGroup(group.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Export only this group to Outlook"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenAddEventForGroup(group.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="Add event to this category"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {group.description && (
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mb-3 px-1 leading-relaxed font-normal">
                      {group.description}
                    </p>
                  )}

                  {/* Group Events Stack */}
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                    {groupEvents.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-400 dark:text-slate-600 border border-dashed border-gray-200 dark:border-slate-800 rounded-lg">
                        No events in this group
                      </div>
                    ) : (
                      groupEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => onSelectEvent(evt)}
                          className="p-3 rounded-r-lg rounded-l-none bg-white dark:bg-slate-900 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 border-y border-r border-gray-200 dark:border-slate-800 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftColor: group.color,
                          }}
                        >
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{evt.title}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-slate-400 font-semibold uppercase mt-1">
                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>
                              {format(new Date(evt.start), 'MMM d, h:mm a')}
                            </span>
                          </div>

                          {evt.location && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-slate-400 truncate mt-1">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span className="truncate">{evt.location}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer Count */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-800 text-right text-[11px] font-semibold text-gray-400 dark:text-slate-500">
                  Total: {groupEvents.length} event(s)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
