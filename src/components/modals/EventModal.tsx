import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Tag, Users, Trash2, Repeat, AlignLeft } from 'lucide-react';
import { CalendarEvent, EventGroup } from '../../types/calendar';

interface EventModalProps {
  groups: EventGroup[];
  editingEvent?: CalendarEvent | null;
  initialDate?: Date;
  initialGroupId?: string;
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  groups,
  editingEvent,
  initialDate,
  initialGroupId,
  onSave,
  onDelete,
  onClose,
}) => {
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
  const [attendeesInput, setAttendeesInput] = useState(
    editingEvent?.attendees ? editingEvent.attendees.join(', ') : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const attendees = attendeesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

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
      attendees,
      updatedAt: new Date().toISOString(),
    };

    onSave(eventData);
  };

  const selectedGroup = groups.find((g) => g.id === groupId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: selectedGroup?.color || '#3B82F6' }}
            />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              {editingEvent ? 'Edit Calendar Event' : 'Create New Event'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
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
                className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
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

          {/* Attendees */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Attendees (comma separated emails)</span>
            </label>
            <input
              type="text"
              placeholder="alex@company.com, sarah@company.com"
              value={attendeesInput}
              onChange={(e) => setAttendeesInput(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer"
              >
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
