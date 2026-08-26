import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SharedCalendar, CalendarEvent, EventGroup, CalendarViewMode } from './types/calendar';
import { Header } from './components/Header';
import { GroupFilterBar } from './components/GroupFilterBar';
import { MonthView } from './components/views/MonthView';
import { WeekView } from './components/views/WeekView';
import { DayView } from './components/views/DayView';
import { AgendaView } from './components/views/AgendaView';
import { GroupMatrixView } from './components/views/GroupMatrixView';

import { OutlookShareModal } from './components/modals/OutlookShareModal';
import { EventModal } from './components/modals/EventModal';
import { GroupManageModal } from './components/modals/GroupManageModal';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { getPublicOrigin } from './utils/urlHelper';

import { Globe, Link as LinkIcon, Check, Eye, RefreshCw, Layers, Sparkles } from 'lucide-react';

export default function App() {
  const [calendars, setCalendars] = useState<SharedCalendar[]>([]);
  const [activeCalendarId, setActiveCalendarId] = useState<string>('cal-default');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Focused Sub-Calendar Web View state
  const [focusedSubCalendarId, setFocusedSubCalendarId] = useState<string | null>(null);
  const [copiedSubLink, setCopiedSubLink] = useState<boolean>(false);

  // Active state filters & date controls
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [visibleGroupIds, setVisibleGroupIds] = useState<Set<string>>(new Set());

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('colorcal_theme') === 'dark' || 
      (!('colorcal_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('colorcal_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('colorcal_theme', 'light');
    }
  }, [isDarkMode]);

  // Modal Visibility States
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareInitialGroupId, setShareInitialGroupId] = useState<string | undefined>(undefined);
  
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventInitialDate, setEventInitialDate] = useState<Date | undefined>(undefined);
  const [eventInitialGroupId, setEventInitialGroupId] = useState<string | undefined>(undefined);

  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [groupModalCreateMode, setGroupModalCreateMode] = useState<boolean>(false);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);

  // Master Calendar Lock State
  const REQUIRED_MASTER_PASSWORD = import.meta.env.VITE_MASTER_PASSWORD;
  const [isMasterLocked, setIsMasterLocked] = useState<boolean>(!!REQUIRED_MASTER_PASSWORD);
  const [masterPasswordInput, setMasterPasswordInput] = useState<string>('');
  const [masterPasswordError, setMasterPasswordError] = useState<boolean>(false);

  // Fetch calendars on mount & setup real-time sync
  useEffect(() => {
    fetchCalendars();

    // Auto-sync every 8 seconds for real-time Master Calendar synchronization across shared links
    const syncInterval = setInterval(() => {
      fetchCalendarsSilent();
    }, 8000);

    const handleFocus = () => fetchCalendarsSilent();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const parseUrlSubCalendar = useCallback((calendarList: SharedCalendar[]) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const subParam = params.get('subcalendar') || params.get('group') || params.get('sub');
    
    if (subParam) {
      const activeCal = calendarList.find((c) => c.id === activeCalendarId) || calendarList[0];
      if (activeCal && activeCal.groups.some((g) => g.id === subParam)) {
        setFocusedSubCalendarId(subParam);
        setVisibleGroupIds(new Set([subParam]));
        return;
      }
    }
  }, [activeCalendarId]);

  const fetchCalendars = async () => {
    try {
      const res = await fetch('/api/calendars');
      if (res.ok) {
        const list: SharedCalendar[] = await res.json();
        setCalendars(list);
        
        if (list.length > 0) {
          const current = list.find((c) => c.id === activeCalendarId) || list[0];
          setActiveCalendarId(current.id);
          
          // Check URL parameter for focused sub-calendar
          const params = new URLSearchParams(window.location.search);
          const subParam = params.get('subcalendar') || params.get('group') || params.get('sub');
          
          if (subParam && current.groups.some((g) => g.id === subParam)) {
            setFocusedSubCalendarId(subParam);
            setVisibleGroupIds(new Set([subParam]));
          } else {
            setVisibleGroupIds(new Set(current.groups.map((g) => g.id)));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load calendars', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarsSilent = async () => {
    try {
      const res = await fetch('/api/calendars');
      if (res.ok) {
        const list: SharedCalendar[] = await res.json();
        setCalendars(list);
      }
    } catch (err) {
      console.error('Silent sync failed', err);
    }
  };

  // Handle focusing a specific Sub-Calendar and updating URL search parameters
  const handleFocusSubCalendar = (groupId: string | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);

    if (groupId) {
      setFocusedSubCalendarId(groupId);
      setVisibleGroupIds(new Set([groupId]));
      url.searchParams.set('subcalendar', groupId);
    } else {
      setFocusedSubCalendarId(null);
      url.searchParams.delete('subcalendar');
      url.searchParams.delete('group');
      url.searchParams.delete('sub');
      if (activeCalendar) {
        setVisibleGroupIds(new Set(activeCalendar.groups.map((g) => g.id)));
      }
    }

    window.history.pushState({}, '', url.toString());
  };

  const handleCopySubCalendarWebLink = (groupId: string) => {
    const origin = getPublicOrigin() || (typeof window !== 'undefined' ? window.location.origin : '');
    const shareUrl = `${origin}/?subcalendar=${groupId}`;

    // Open link in new tab synchronously to avoid popup blockers
    window.open(shareUrl, '_blank');

    const fallbackCopy = (content: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedSubLink(true);
        setTimeout(() => setCopiedSubLink(false), 2000);
      } catch (err) {
        console.error('Copy failed', err);
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          setCopiedSubLink(true);
          setTimeout(() => setCopiedSubLink(false), 2000);
        },
        () => fallbackCopy(shareUrl)
      );
    } else {
      fallbackCopy(shareUrl);
    }
  };

  const activeCalendar = useMemo(() => {
    return calendars.find((c) => c.id === activeCalendarId) || calendars[0];
  }, [calendars, activeCalendarId]);

  // Keep groups Map for fast lookup
  const groupsMap = useMemo(() => {
    const map = new Map<string, EventGroup>();
    if (activeCalendar && activeCalendar.groups) {
      activeCalendar.groups.forEach((g) => map.set(g.id, g));
    }
    return map;
  }, [activeCalendar]);

  const focusedGroup = useMemo(() => {
    return focusedSubCalendarId ? groupsMap.get(focusedSubCalendarId) : null;
  }, [focusedSubCalendarId, groupsMap]);

  // Sync visible groups when active calendar changes or focused sub-calendar changes
  useEffect(() => {
    if (activeCalendar && activeCalendar.groups) {
      if (focusedSubCalendarId) {
        setVisibleGroupIds(new Set([focusedSubCalendarId]));
      } else {
        setVisibleGroupIds(new Set(activeCalendar.groups.map((g) => g.id)));
      }
    }
  }, [activeCalendar?.id, focusedSubCalendarId]);

  // Filter events based on visible group IDs
  const filteredEvents = useMemo(() => {
    if (!activeCalendar || !activeCalendar.events) return [];
    return activeCalendar.events.filter((e) => visibleGroupIds.has(e.groupId));
  }, [activeCalendar, visibleGroupIds]);

  // Update active calendar state & persist to Express server
  const saveCalendar = async (updatedCal: SharedCalendar) => {
    try {
      setCalendars((prev) => prev.map((c) => (c.id === updatedCal.id ? updatedCal : c)));
      
      await fetch(`/api/calendars/${updatedCal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCal),
      });
    } catch (err) {
      console.error('Error saving calendar updates', err);
    }
  };

  // --- Handlers for Calendar Actions ---

  const handleCreateNewCalendar = async () => {
    const calName = prompt('Enter name for the new shared calendar:', 'New Project Schedule');
    if (!calName) return;

    try {
      const res = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: calName, ownerName: 'Team Admin' }),
      });
      if (res.ok) {
        const newCal: SharedCalendar = await res.json();
        setCalendars((prev) => [...prev, newCal]);
        setActiveCalendarId(newCal.id);
        setVisibleGroupIds(new Set(newCal.groups.map((g) => g.id)));
      }
    } catch (err) {
      console.error('Error creating calendar', err);
    }
  };

  const handleNavigateDate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const d = new Date(currentDate);
    const amount = direction === 'next' ? 1 : -1;

    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + amount);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + amount * 7);
    } else if (viewMode === 'day') {
      d.setDate(d.getDate() + amount);
    } else {
      d.setMonth(d.getMonth() + amount);
    }

    setCurrentDate(d);
  };

  const handleToggleGroup = (groupId: string) => {
    const next = new Set(visibleGroupIds);
    if (next.has(groupId)) {
      next.delete(groupId);
    } else {
      next.add(groupId);
    }
    setVisibleGroupIds(next);
  };

  const handleToggleAllGroups = (showAll: boolean) => {
    if (!activeCalendar) return;
    if (showAll) {
      setVisibleGroupIds(new Set(activeCalendar.groups.map((g) => g.id)));
    } else {
      setVisibleGroupIds(new Set());
    }
  };

  // --- Event CRUD ---

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (!activeCalendar) return;

    let updatedEvents = [...activeCalendar.events];

    if (eventData.id) {
      // Edit existing event
      updatedEvents = updatedEvents.map((e) =>
        e.id === eventData.id ? ({ ...e, ...eventData } as CalendarEvent) : e
      );
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        id: 'evt-' + Date.now().toString(36),
        calendarId: activeCalendar.id,
        groupId: eventData.groupId || activeCalendar.groups[0]?.id || 'grp-1',
        title: eventData.title || 'Untitled Event',
        description: eventData.description,
        location: eventData.location,
        start: eventData.start || new Date().toISOString(),
        end: eventData.end || new Date(Date.now() + 3600000).toISOString(),
        isAllDay: eventData.isAllDay || false,
        attendees: eventData.attendees || [],
        resources: eventData.resources || [],
        recurrence: eventData.recurrence || 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedEvents.push(newEvent);
    }

    const updatedCal = { ...activeCalendar, events: updatedEvents };
    saveCalendar(updatedCal);

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!activeCalendar) return;
    const updatedEvents = activeCalendar.events.filter((e) => e.id !== eventId);
    const updatedCal = { ...activeCalendar, events: updatedEvents };
    saveCalendar(updatedCal);

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleAddAIEvents = (events: Partial<CalendarEvent>[]) => {
    if (!activeCalendar) return;

    const newEvents: CalendarEvent[] = events.map((e, idx) => ({
      id: 'evt-ai-' + Date.now().toString(36) + '-' + idx,
      calendarId: activeCalendar.id,
      groupId: e.groupId || activeCalendar.groups[0]?.id || 'grp-1',
      title: e.title || 'AI Scheduled Event',
      description: e.description,
      location: e.location,
      start: e.start || new Date().toISOString(),
      end: e.end || new Date(Date.now() + 3600000).toISOString(),
      isAllDay: e.isAllDay || false,
      attendees: e.attendees || [],
      recurrence: e.recurrence || 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const updatedCal = {
      ...activeCalendar,
      events: [...activeCalendar.events, ...newEvents],
    };

    saveCalendar(updatedCal);
  };

  // --- Group / Category CRUD ---

  const handleSaveGroup = (groupData: Partial<EventGroup>) => {
    if (!activeCalendar) return;

    let updatedGroups = [...activeCalendar.groups];

    if (groupData.id) {
      updatedGroups = updatedGroups.map((g) =>
        g.id === groupData.id ? ({ ...g, ...groupData } as EventGroup) : g
      );
    } else {
      const newGroup: EventGroup = {
        id: 'grp-' + Date.now().toString(36),
        name: groupData.name || 'New Group',
        description: groupData.description,
        color: groupData.color || '#3B82F6',
        outlookCategory: groupData.outlookCategory || 'Blue Category',
      };
      updatedGroups.push(newGroup);
      // Automatically show newly created group
      setVisibleGroupIds((prev) => new Set([...prev, newGroup.id]));
    }

    const updatedCal = { ...activeCalendar, groups: updatedGroups };
    saveCalendar(updatedCal);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (!activeCalendar || activeCalendar.groups.length <= 1) return;
    
    if (confirm('Are you sure? Events in this group will be reassigned to the first group.')) {
      const fallbackGroupId = activeCalendar.groups.find((g) => g.id !== groupId)?.id || 'grp-1';
      
      const updatedGroups = activeCalendar.groups.filter((g) => g.id !== groupId);
      const updatedEvents = activeCalendar.events.map((e) =>
        e.groupId === groupId ? { ...e, groupId: fallbackGroupId } : e
      );

      const updatedCal = {
        ...activeCalendar,
        groups: updatedGroups,
        events: updatedEvents,
      };

      saveCalendar(updatedCal);
    }
  };

  if (loading || !activeCalendar) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center text-gray-900 dark:text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">Loading Master Calendar Workspace...</p>
        </div>
      </div>
    );
  }

  // Master Lock Screen
  if (isMasterLocked && !focusedSubCalendarId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-blue-600 dark:text-blue-400">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Master Calendar Locked</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
            Please enter the master password to access the full calendar workspace, or use a specific sub-calendar link.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (masterPasswordInput === REQUIRED_MASTER_PASSWORD) {
                setIsMasterLocked(false);
                setMasterPasswordError(false);
              } else {
                setMasterPasswordError(true);
              }
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <input
                type="password"
                placeholder="Enter password..."
                value={masterPasswordInput}
                onChange={(e) => setMasterPasswordInput(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-950 border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  masterPasswordError ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'border-gray-200 dark:border-slate-800'
                }`}
                autoFocus
              />
              {masterPasswordError && (
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">Incorrect password.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition-colors"
            >
              Unlock Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors">
      
      {/* App Header */}
      <Header
        calendars={calendars}
        activeCalendar={activeCalendar}
        onSelectCalendar={(cal) => setActiveCalendarId(cal.id)}
        onCreateCalendar={handleCreateNewCalendar}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentDate={currentDate}
        onNavigateDate={handleNavigateDate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isSubCalendarMode={Boolean(focusedSubCalendarId)}
        focusedGroup={focusedGroup}
        onOpenShareModal={() => {
          setShareInitialGroupId(focusedSubCalendarId || 'ALL');
          setShowShareModal(true);
        }}
        onOpenShareGroup={(groupId) => {
          setShareInitialGroupId(groupId);
          setShowShareModal(true);
        }}
        onFocusSubCalendar={handleFocusSubCalendar}
        onOpenEventModal={() => {
          setEditingEvent(null);
          setEventInitialDate(new Date());
          setEventInitialGroupId(focusedSubCalendarId || undefined);
          setShowEventModal(true);
        }}
        onOpenAIModal={() => setShowAIModal(true)}
      />

      {/* Group Color Filter Bar (Only shown on Master Calendar) */}
      {!focusedSubCalendarId && (
        <GroupFilterBar
          groups={activeCalendar.groups}
          events={activeCalendar.events}
          visibleGroupIds={visibleGroupIds}
          onToggleGroup={handleToggleGroup}
          onToggleAll={handleToggleAllGroups}
          onCopyAndOpenWebLink={handleCopySubCalendarWebLink}
          onOpenShareGroup={(groupId) => {
            setShareInitialGroupId(groupId);
            setShowShareModal(true);
          }}
          onOpenManageGroups={() => {
            setGroupModalCreateMode(false);
            setShowGroupModal(true);
          }}
          onOpenAddGroup={() => {
            setGroupModalCreateMode(true);
            setShowGroupModal(true);
          }}
        />
      )}

      {/* Focused Sub-Calendar Banner (Only shown in Standalone Sub-Calendar Link View) */}
      {focusedGroup && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-purple-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border border-purple-200/80 dark:border-purple-900/50 shadow-2xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-2xs"
              style={{ backgroundColor: focusedGroup.color }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {focusedGroup.name} Sub-Calendar
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Sub-Calendar Shared View
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="truncate">{focusedGroup.description || 'Dedicated sub-calendar view'}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Synced with Master Calendar
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy shareable web link */}
            <button
              type="button"
              onClick={() => handleCopySubCalendarWebLink(focusedGroup.id)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Copy shareable browser web link for this sub-calendar"
            >
              {copiedSubLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <LinkIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
              <span>{copiedSubLink ? 'Web Link Copied!' : 'Copy Web Link'}</span>
            </button>

            {/* Outlook Subscription modal trigger */}
            <button
              type="button"
              onClick={() => {
                setShareInitialGroupId(focusedGroup.id);
                setShowShareModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Outlook Feed</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Calendar View Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col min-h-[calc(100vh-140px)]">
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={filteredEvents}
            groupsMap={groupsMap}
            onSelectEvent={(evt) => {
              setEditingEvent(evt);
              setShowEventModal(true);
            }}
            onSelectDate={(date) => {
              setEditingEvent(null);
              setEventInitialDate(date);
              setShowEventModal(true);
            }}
          />
        )}

        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={filteredEvents}
            groupsMap={groupsMap}
            onSelectEvent={(evt) => {
              setEditingEvent(evt);
              setShowEventModal(true);
            }}
            onSelectDate={(date) => {
              setEditingEvent(null);
              setEventInitialDate(date);
              setShowEventModal(true);
            }}
          />
        )}

        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            events={filteredEvents}
            groupsMap={groupsMap}
            onSelectEvent={(evt) => {
              setEditingEvent(evt);
              setShowEventModal(true);
            }}
            onSelectDate={(date) => setCurrentDate(date)}
            onOpenEventModal={() => {
              setEditingEvent(null);
              setEventInitialDate(currentDate);
              setShowEventModal(true);
            }}
          />
        )}

        {viewMode === 'agenda' && (
          <AgendaView
            events={filteredEvents}
            groupsMap={groupsMap}
            onSelectEvent={(evt) => {
              setEditingEvent(evt);
              setShowEventModal(true);
            }}
          />
        )}

        {viewMode === 'matrix' && (
          <GroupMatrixView
            groups={activeCalendar.groups}
            events={activeCalendar.events}
            onSelectEvent={(evt) => {
              setEditingEvent(evt);
              setShowEventModal(true);
            }}
            onOpenAddEventForGroup={(groupId) => {
              setEditingEvent(null);
              setEventInitialDate(new Date());
              setEventInitialGroupId(groupId);
              setShowEventModal(true);
            }}
            onOpenShareGroup={(groupId) => {
              setShareInitialGroupId(groupId);
              setShowShareModal(true);
            }}
          />
        )}
      </main>

      {/* MODALS */}

      {/* 1. Outlook Subscription Share Modal */}
      {showShareModal && (
        <OutlookShareModal
          calendar={activeCalendar}
          groups={activeCalendar.groups}
          initialGroupId={shareInitialGroupId}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* 2. Event Add/Edit Modal */}
      {showEventModal && (
        <EventModal
          groups={activeCalendar.groups}
          editingEvent={editingEvent}
          initialDate={eventInitialDate}
          initialGroupId={eventInitialGroupId}
          isSubCalendarLocked={Boolean(focusedSubCalendarId)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* 3. Manage Event Groups Modal */}
      {showGroupModal && (
        <GroupManageModal
          groups={activeCalendar.groups}
          initialCreateMode={groupModalCreateMode}
          onSaveGroup={handleSaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onOpenShareGroup={(groupId) => {
            setShareInitialGroupId(groupId);
            setShowShareModal(true);
          }}
          onClose={() => setShowGroupModal(false)}
        />
      )}

      {/* 4. Gemini AI Schedule Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal
          calendarId={activeCalendar.id}
          groupsMap={groupsMap}
          onAddEvents={handleAddAIEvents}
          onClose={() => setShowAIModal(false)}
        />
      )}

    </div>
  );
}
