import React from 'react';
import { Layers, Plus, Settings2, Check, Eye, EyeOff, Share2 } from 'lucide-react';
import { EventGroup, CalendarEvent } from '../types/calendar';

interface GroupFilterBarProps {
  groups: EventGroup[];
  events: CalendarEvent[];
  visibleGroupIds: Set<string>;
  onToggleGroup: (groupId: string) => void;
  onToggleAll: (showAll: boolean) => void;
  onOpenManageGroups: () => void;
  onOpenAddGroup: () => void;
  onOpenShareGroup?: (groupId: string) => void;
  onCopyAndOpenWebLink?: (groupId: string) => void;
}

export const GroupFilterBar: React.FC<GroupFilterBarProps> = ({
  groups,
  events,
  visibleGroupIds,
  onToggleGroup,
  onToggleAll,
  onOpenManageGroups,
  onOpenAddGroup,
  onOpenShareGroup,
  onCopyAndOpenWebLink,
}) => {
  const allSelected = visibleGroupIds.size === groups.length;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 transition-colors">
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Group Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden no-scrollbar py-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mr-1 select-none">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Event Groups:</span>
          </div>

          <button
            onClick={() => onToggleAll(!allSelected)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 border cursor-pointer ${
              allSelected
                ? 'bg-gray-900 dark:bg-blue-600 text-white border-gray-900 dark:border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-950 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            {allSelected ? <Eye className="w-3 h-3 text-blue-400 dark:text-blue-200" /> : <EyeOff className="w-3 h-3" />}
            <span>All Groups</span>
          </button>

          {groups.map((group) => {
            const isVisible = visibleGroupIds.has(group.id);
            const count = events.filter((e) => e.groupId === group.id).length;

            return (
              <div
                key={group.id}
                className={`group/pill relative flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isVisible
                    ? 'shadow-xs border-transparent font-semibold dark:text-slate-100'
                    : 'bg-white dark:bg-slate-950 text-gray-400 dark:text-slate-600 border-gray-200 dark:border-slate-800 opacity-60'
                }`}
                style={
                  isVisible
                    ? {
                        backgroundColor: group.color + '22',
                        borderColor: group.color,
                      }
                    : {}
                }
              >
                {/* Toggle Group Visibility Button */}
                <button
                  type="button"
                  onClick={() => onToggleGroup(group.id)}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className={`truncate max-w-[140px] ${!isVisible ? 'line-through' : ''}`}>
                    {group.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                    {count}
                  </span>
                  {isVisible && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                </button>

                {/* Direct Share & Focus Sub-Calendar Buttons */}
                <div className="flex items-center gap-0.5 ml-1 border-l border-gray-200 dark:border-slate-800 pl-1">
                  {onCopyAndOpenWebLink && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyAndOpenWebLink(group.id);
                      }}
                      className="px-1.5 py-0.5 rounded-full hover:bg-white dark:hover:bg-slate-800 text-[10px] font-bold text-gray-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                      title={`Copy and open ${group.name} web link in new tab`}
                    >
                      Web Link
                    </button>
                  )}

                  {onOpenShareGroup && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenShareGroup(group.id);
                      }}
                      className="p-1 rounded-full hover:bg-white/80 dark:hover:bg-slate-800 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      title={`Share ${group.name} feed & links`}
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Category Settings & Quick Add Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddGroup}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-950 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>New Group</span>
          </button>

          <button
            onClick={onOpenManageGroups}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-950 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Manage Color Palette & Outlook Categories"
          >
            <Settings2 className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />
            <span className="hidden sm:inline">Manage Groups</span>
          </button>
        </div>

      </div>
    </div>
  );
};


