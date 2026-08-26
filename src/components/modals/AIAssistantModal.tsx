import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2, Tag, Calendar, Clock, MapPin } from 'lucide-react';
import { CalendarEvent, EventGroup } from '../../types/calendar';
import { format } from 'date-fns';

interface AIAssistantModalProps {
  calendarId: string;
  groupsMap: Map<string, EventGroup>;
  onAddEvents: (events: Partial<CalendarEvent>[]) => void;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  calendarId,
  groupsMap,
  onAddEvents,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedEvents, setParsedEvents] = useState<Partial<CalendarEvent>[] | null>(null);

  const samplePrompts = [
    'Schedule Team Sprint Demo next Tuesday at 10am for Product Releases group',
    'Set up Primary On-Call shift for Mark from Monday 9am to Friday 5pm',
    'Add Leadership Quarterly Sync on Thursday 2pm in Boardroom 4A',
    'Design review meeting with UX team tomorrow at 3pm for 1 hour'
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setParsedEvents(null);

    try {
      const res = await fetch('/api/ai/parse-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, calendarId }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to process AI schedule request');
      }

      const data = await res.json();
      if (data.events && Array.isArray(data.events)) {
        setParsedEvents(data.events);
      } else {
        throw new Error('No events returned');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while communicating with Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndAdd = () => {
    if (parsedEvents && parsedEvents.length > 0) {
      onAddEvents(parsedEvents);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-blue-600 flex items-center justify-center shadow-xs text-white">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Gemini AI Schedule Assistant
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                Type natural language instructions to generate and color-categorize calendar events
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Prompt Form */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              What would you like to schedule?
            </label>
            <div className="relative">
              <textarea
                rows={3}
                required
                placeholder="e.g. Schedule Product Retro on Friday at 3pm for 1 hour with Alex and Sarah, under Product & Releases group..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-3.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Event</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Prompt Suggestions */}
          {!parsedEvents && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                Try clicking a sample prompt:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(sample);
                    }}
                    className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 text-left text-xs font-medium text-gray-700 dark:text-slate-300 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <span className="truncate">{sample}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}

          {/* Extracted Events Preview */}
          {parsedEvents && parsedEvents.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Extracted Event ({parsedEvents.length})
                </h3>
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Review before saving to calendar</span>
              </div>

              <div className="space-y-3">
                {parsedEvents.map((evt, i) => {
                  const group = groupsMap.get(evt.groupId || '') || (Array.from(groupsMap.values()) as EventGroup[])[0];
                  const groupColor = group?.color || '#3B82F6';

                  return (
                    <div
                      key={i}
                      className="p-4 rounded-r-lg rounded-l-none bg-white dark:bg-slate-950 border-y border-r border-gray-200 dark:border-slate-800 space-y-2 shadow-2xs"
                      style={{
                        borderLeftWidth: '5px',
                        borderLeftColor: groupColor,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{evt.title}</h4>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-800"
                          style={{ backgroundColor: groupColor + '20' }}
                        >
                          {group?.name || 'General'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>
                            {evt.start
                              ? format(new Date(evt.start), 'MMM d, yyyy @ h:mm a')
                              : 'TBD'}
                          </span>
                        </div>

                        {evt.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>{evt.location}</span>
                          </div>
                        )}
                      </div>

                      {evt.description && (
                        <p className="text-xs text-gray-600 dark:text-slate-400 font-normal mt-1">{evt.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {parsedEvents && parsedEvents.length > 0 && (
            <button
              onClick={handleConfirmAndAdd}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Add to Shared Calendar</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
