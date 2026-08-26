import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Users,
  Trash2,
  Repeat,
  AlignLeft,
  Box,
  Plus,
  Check,
  Edit2,
  ExternalLink,
  Copy,
  Wrench,
  Laptop,
  Tv
} from 'lucide-react';
import { CalendarEvent, EventGroup } from '../../types/calendar';
import { format } from 'date-fns';

interface EventModalProps {
  groups: EventGroup[];
  editingEvent?: CalendarEvent | null;
  initialDate?: Date;
  initialGroupId?: string;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

const PRESET_ATTENDEES = [
  'btaylor@sissines.com',
  'engineering@company.com',
  'qa@company.com',
  'sjenkins@company.com',
  'devops@company.com',
  'culture@company.com',
  'dkim@company.com'
];

const PRESET_RESOURCES = [
  'Conference Room 3B',
  'Main Auditorium AV',
  'HD Projector & Screen',
  'Wireless Mics (x2)',
  'Zoom Room Pro',
  'Participant Laptops',
  'Whiteboard & Markers',
  'Figma Design Spec',
  'Release Runbook PDF'
];

export const EventModal: React.FC<EventModalProps> = ({
  groups,
  editingEvent,
  initialDate,
  initialGroupId,
  onSave,
  onDelete,
  onClose,
}) => {
  // If clicking an existing event, open in 'overview' mode first so user can view details and attendees instantly
  const [activeTab, setActiveTab] = useState<'overview' | 'edit'>(
    editingEvent ? 'overview' : 'edit'
  );

  // Format initial ISO date for HTML datetime-local input (YYYY-MM-THH:mm)
  const formatForInput = (d: Date | string) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return '';

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}T${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
  };

  const defaultStart = editingEvent
    ? editingEvent.start
    : initialDate
    ? new Date(initialDate.setHours(9, 0, 0, 0)).toISOString()
    : new Date(new Date().setHours(9, 0, 0, 0)).toISOString();

  const defaultEnd = editingEvent
    ? editingEvent.end
    : initialDate
    ? new Date(initialDate.setHours(10, 0, 0, 0)).toISOString()
    : new Date(new Date().setHours(10, 0, 0, 0)).toISOString();

  const [title, setTitle] = useState(editingEvent?.title || '');
  const [groupId, setGroupId] = useState(
    editingEvent?.groupId || initialGroupId || (groups[0] ? groups[0].id : '')
  );
  const [location, setLocation] = useState(editingEvent?.location || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [startInput, setStartInput] = useState(formatForInput(defaultStart));
  const [endInput, setEndInput] = useState(formatForInput(defaultEnd));
  const [isAllDay, setIsAllDay] = useState(editingEvent?.isAllDay || false);
  const [recurrence, setRecurrence] = useState<CalendarEvent['recurrence']>(
    editingEvent?.recurrence || 'none'
  );
  const [organizer, setOrganizer] = useState(editingEvent?.organizer || '');

  // Attendees state
  const [attendeesList, setAttendeesList] = useState<string[]>(
    editingEvent?.attendees || []
  );
  const [newAttendeeInput, setNewAttendeeInput] = useState('');
  const [copiedAttendeeIndex, setCopiedAttendeeIndex] = useState<number | null>(null);

  // Resources state
  const [resourcesList, setResourcesList] = useState<string[]>(
    editingEvent?.resources || []
  );
  const [newResourceInput, setNewResourceInput] = useState('');
  const [copiedResourceIndex, setCopiedResourceIndex] = useState<number | null>(null);

  const handleAddAttendee = (attendeeEmail?: string) => {
    const emailToAdd = attendeeEmail || newAttendeeInput;
    if (!emailToAdd.trim()) return;
    if (attendeesList.includes(emailToAdd.trim())) {
      setNewAttendeeInput('');
      return;
    }
    const updated = [...attendeesList, emailToAdd.trim()];
    setAttendeesList(updated);
    setNewAttendeeInput('');

    // Auto-save if viewing existing event in overview mode
    if (editingEvent && activeTab === 'overview') {
      onSave({
        id: editingEvent.id,
        attendees: updated,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleRemoveAttendee = (indexToRemove: number) => {
    const updated = attendeesList.filter((_, idx) => idx !== indexToRemove);
    setAttendeesList(updated);

    if (editingEvent && activeTab === 'overview') {
      onSave({
        id: editingEvent.id,
        attendees: updated,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleAddResource = (resName?: string) => {
    const textToAdd = resName || newResourceInput;
    if (!textToAdd.trim()) return;
    if (resourcesList.includes(textToAdd.trim())) {
      setNewResourceInput('');
      return;
    }
    const updated = [...resourcesList, textToAdd.trim()];
    setResourcesList(updated);
    setNewResourceInput('');

    if (editingEvent && activeTab === 'overview') {
      onSave({
        id: editingEvent.id,
        resources: updated,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleRemoveResource = (indexToRemove: number) => {
    const updated = resourcesList.filter((_, idx) => idx !== indexToRemove);
    setResourcesList(updated);

    if (editingEvent && activeTab === 'overview') {
      onSave({
        id: editingEvent.id,
        resources: updated,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventData: Partial<CalendarEvent> = {
      ...(editingEvent ? { id: editingEvent.id } : {}),
      title: title.trim(),
      groupId,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      start: new Date(startInput).toISOString(),
      end: new Date(endInput).toISOString(),
      isAllDay,
      recurrence,
      organizer: organizer.trim() || undefined,
      attendees: attendeesList,
      resources: resourcesList,
      updatedAt: new Date().toISOString(),
    };

    onSave(eventData);
  };

  const selectedGroup = groups.find((g) => g.id === groupId);

  const formatDisplayTime = (startIso: string, endIso: string, allDay?: boolean) => {
    try {
      const s = new Date(startIso);
      const e = new Date(endIso);
      if (allDay) {
        return `${format(s, 'EEEE, MMMM d, yyyy')} • All-Day`;
      }
      return `${format(s, 'EEEE, MMMM d, yyyy')} • ${format(s, 'h:mm a')} - ${format(e, 'h:mm a')}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header Bar */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 shadow-2xs"
              style={{ backgroundColor: selectedGroup?.color || '#3B82F6' }}
            />
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {editingEvent ? editingEvent.title : 'Create New Event'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    backgroundColor: selectedGroup?.color ? `${selectedGroup.color}20` : '#3B82F620',
                    color: selectedGroup?.color || '#3B82F6'
                  }}
                >
                  {selectedGroup?.name || 'General'}
                </span>
                {editingEvent && (
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500">
                    ID: {editingEvent.id}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editingEvent && (
              <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Edit Details
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & RESOURCES MODE (When clicking an existing event) */}
        {editingEvent && activeTab === 'overview' ? (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            {/* Date & Time Header */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/80 dark:bg-slate-950/80 border border-gray-100 dark:border-slate-800">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                  {formatDisplayTime(editingEvent.start, editingEvent.end, editingEvent.isAllDay)}
                </div>
                {editingEvent.recurrence && editingEvent.recurrence !== 'none' && (
                  <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1">
                    <Repeat className="w-3 h-3" />
                    <span className="capitalize">Repeats {editingEvent.recurrence}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location / Link */}
            {editingEvent.location && (
              <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="font-semibold">{editingEvent.location}</span>
                {editingEvent.location.startsWith('http') && (
                  <a
                    href={editingEvent.location}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded hover:underline flex items-center gap-1"
                  >
                    <span>Join Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* --- HIGHLIGHTED ATTENDEES ADDED SECTION --- */}
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Attendees & Guests Added</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                  {attendeesList.length} Attendee{attendeesList.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* List of Attendees */}
              {attendeesList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attendeesList.map((att, index) => {
                    const initials = att
                      .split('@')[0]
                      .split(/[\._-]/)
                      .map((part) => part[0]?.toUpperCase() || '')
                      .join('')
                      .slice(0, 2) || 'U';

                    return (
                      <div
                        key={index}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs group/att"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate" title={att}>
                            {att}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover/att:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(att);
                              setCopiedAttendeeIndex(index);
                              setTimeout(() => setCopiedAttendeeIndex(null), 1500);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                            title="Copy email address"
                          >
                            {copiedAttendeeIndex === index ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttendee(index)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove attendee"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 text-center bg-white/60 dark:bg-slate-900/60 rounded-lg border border-dashed border-emerald-200 dark:border-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400">
                  No attendees added to this event yet.
                </div>
              )}

              {/* Direct Quick Add Attendee Input */}
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type email or team member name..."
                    value={newAttendeeInput}
                    onChange={(e) => setNewAttendeeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAttendee();
                      }
                    }}
                    className="flex-1 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAttendee()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Preset Team Member Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Quick Add Team:</span>
                  {PRESET_ATTENDEES.slice(0, 5).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddAttendee(preset)}
                      className="px-2 py-0.5 bg-white/80 dark:bg-slate-900/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-slate-800 rounded-md text-[10px] font-semibold text-gray-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* --- SECONDARY RESOURCES SECTION --- */}
            {resourcesList.length > 0 && (
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hardware & Resources ({resourcesList.length})</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resourcesList.map((res, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300"
                    >
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {editingEvent.description && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Notes & Description</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-xs text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {editingEvent.description}
                </div>
              </div>
            )}

            {/* Attendees */}
            {editingEvent.attendees && editingEvent.attendees.length > 0 && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Attendees ({editingEvent.attendees.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editingEvent.attendees.map((a, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(editingEvent.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Event</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit All Details</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* TAB 2: EDIT FORM MODE (For creating or editing full event details) */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UX Audit Phase 1 or Client Sync"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Group / Category Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Event Group / Category *</span>
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.outlookCategory || 'Category'})
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Start Time *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white font-semibold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>End Time *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white font-semibold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* All Day & Recurrence Row */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-slate-700 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">All-Day Event</span>
              </label>

              <div className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Location / Meeting Link</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Conference Room 3B or https://teams.microsoft.com/..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Resources Section in Edit Form */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-blue-950 dark:text-blue-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Resources & Equipment Added</span>
                </span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">
                  {resourcesList.length} items
                </span>
              </label>

              {/* Tag Chips */}
              {resourcesList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {resourcesList.map((res, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-blue-900 dark:text-blue-200 shadow-2xs"
                    >
                      <span>{res}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(idx)}
                        className="p-0.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type resource name and press Add..."
                  value={newResourceInput}
                  onChange={(e) => setNewResourceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddResource();
                    }
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddResource()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Presets:</span>
                {PRESET_RESOURCES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddResource(preset)}
                    className="px-2 py-0.5 bg-white/80 dark:bg-slate-900/80 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-slate-800 rounded text-[10px] font-semibold text-gray-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                <span>Description / Notes</span>
              </label>
              <textarea
                rows={3}
                placeholder="Add agenda, links, or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-3 text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Attendees Section in Edit Form */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Attendees & Guests Added</span>
                </span>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-normal">
                  {attendeesList.length} people
                </span>
              </label>

              {/* Tag Chips */}
              {attendeesList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {attendeesList.map((att, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 text-emerald-900 dark:text-emerald-200 shadow-2xs"
                    >
                      <span>{att}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(idx)}
                        className="p-0.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type email and press Add..."
                  value={newAttendeeInput}
                  onChange={(e) => setNewAttendeeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAttendee();
                    }
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddAttendee()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Team Presets:</span>
                {PRESET_ATTENDEES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddAttendee(preset)}
                    className="px-2 py-0.5 bg-white/80 dark:bg-slate-900/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-slate-800 rounded text-[10px] font-semibold text-gray-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              {editingEvent && onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(editingEvent.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Event</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer font-bold"
                >
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
