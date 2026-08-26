import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Share2, 
  Plus, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Layers,
  LayoutGrid,
  CalendarDays,
  CalendarRange,
  List,
  Columns,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { SharedCalendar, CalendarViewMode } from '../types/calendar';

interface HeaderProps {
  calendars: SharedCalendar[];
  activeCalendar: SharedCalendar;
  onSelectCalendar: (cal: SharedCalendar) => void;
  onCreateCalendar: () => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  currentDate: Date;
  onNavigateDate: (direction: 'prev' | 'next' | 'today') => void;
  onOpenShareModal: () => void;
  onOpenShareGroup?: (groupId: string) => void;
  onFocusSubCalendar?: (groupId: string | null) => void;
  onOpenEventModal: () => void;
  onOpenAIModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  calendars,
  activeCalendar,
  onSelectCalendar,
  onCreateCalendar,
  viewMode,
  onViewModeChange,
  currentDate,
  onNavigateDate,
  onOpenShareModal,
  onOpenShareGroup,
  onFocusSubCalendar,
  onOpenEventModal,
  onOpenAIModal,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-2.5 gap-3">
          
          {/* Brand & Calendar Selector */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                M
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">Master Calendar</h1>
                  <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/60">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Synced with Outlook</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Selector Dropdown */}
            <div className="relative group">
              <select
                value={activeCalendar.id}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    onCreateCalendar();
                  } else {
                    const found = calendars.find((c) => c.id === e.target.value);
                    if (found) onSelectCalendar(found);
                  }
                }}
                className="bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 text-xs font-medium py-1.5 px-3 pr-8 rounded-lg border border-gray-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
              >
                {calendars.map((cal) => (
                  <option key={cal.id} value={cal.id}>
                    📅 {cal.name}
                  </option>
                ))}
                <option value="NEW">+ Create New Shared Calendar...</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls & Today */}
          <div className="flex items-center justify-between sm:justify-center gap-1 bg-gray-50 dark:bg-slate-950 p-1 rounded-lg border border-gray-200 dark:border-slate-800">
            <button
              onClick={() => onNavigateDate('prev')}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateDate('today')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => onNavigateDate('next')}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-gray-900 dark:text-white px-2 min-w-[130px] text-center">
              {formattedDate}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden no-scrollbar py-0.5">
            
            {/* View Mode Switcher */}
            <div className="flex items-center bg-gray-50 dark:bg-slate-950 rounded-lg p-1 border border-gray-200 dark:border-slate-800">
              <button
                onClick={() => onViewModeChange('month')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-gray-200 dark:border-slate-700'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Month View"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Month</span>
              </button>

              <button
                onClick={() => onViewModeChange('week')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-gray-200 dark:border-slate-700'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Week View"
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Week</span>
              </button>

              <button
                onClick={() => onViewModeChange('day')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-gray-200 dark:border-slate-700'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Day View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Day</span>
              </button>

              <button
                onClick={() => onViewModeChange('agenda')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-gray-200 dark:border-slate-700'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Agenda List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Agenda</span>
              </button>

              <button
                onClick={() => onViewModeChange('matrix')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-gray-200 dark:border-slate-700'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Group Matrix View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Groups</span>
              </button>
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-800 transition-all cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAIModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span>AI Create</span>
            </button>

            {/* Add to Outlook / Share Button Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 shadow-2xs">
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-l-lg transition-all cursor-pointer"
                  title="Open Share & Outlook Subscription Center"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Share / Add to Outlook</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowShareDropdown(!showShareDropdown)}
                  className="px-2 py-1.5 border-l border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-r-lg transition-all cursor-pointer"
                  title="Select specific group feed to share"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </button>
              </div>

              {showShareDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-84 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 p-3 z-[100] animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Select Calendar Feed</span>
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500">Live Outlook Feeds</span>
                  </div>

                  {/* Option 1: Master Calendar */}
                  <div className="mb-3">
                    <button
                      onClick={() => {
                        setShowShareDropdown(false);
                        onOpenShareModal();
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between gap-3 transition-all cursor-pointer group/item"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                          M
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400">
                            Master Calendar
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                            Includes All {activeCalendar.groups.length} Event Groups
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full flex-shrink-0">
                        Full
                      </span>
                    </button>
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 px-1 mb-1.5">
                    Individual Group Feeds ({activeCalendar.groups.length})
                  </div>

                  <div className="space-y-1">
                    {activeCalendar.groups.map((group) => (
                      <div
                        key={group.id}
                        className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/80 flex items-center justify-between gap-2 transition-colors group/gitem"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowShareDropdown(false);
                            if (onFocusSubCalendar) onFocusSubCalendar(group.id);
                          }}
                          className="flex items-center gap-2 min-w-0 truncate text-left flex-1 cursor-pointer"
                        >
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                          <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 group-hover/gitem:text-blue-600 dark:group-hover/gitem:text-blue-400 truncate">
                            {group.name}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {onFocusSubCalendar && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowShareDropdown(false);
                                onFocusSubCalendar(group.id);
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 cursor-pointer"
                              title="Open Sub-Calendar Web Link View"
                            >
                              Web View
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowShareDropdown(false);
                              if (onOpenShareGroup) onOpenShareGroup(group.id);
                              else onOpenShareModal();
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 cursor-pointer"
                            title="Outlook Subscription Feed"
                          >
                            Feed
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setShowShareDropdown(false);
                        onOpenShareModal();
                      }}
                      className="w-full py-1.5 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Open Outlook Subscription Setup Center →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Event Button */}
            <button
              onClick={onOpenEventModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Event</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};

