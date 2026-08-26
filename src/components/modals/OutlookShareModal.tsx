import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Globe, 
  Smartphone, 
  Monitor, 
  HelpCircle,
  Sparkles,
  Code2,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { SharedCalendar, EventGroup } from '../../types/calendar';
import { generateICSFeed } from '../../utils/icsGenerator';

interface OutlookShareModalProps {
  calendar: SharedCalendar;
  groups: EventGroup[];
  initialGroupId?: string;
  onClose: () => void;
}

export const OutlookShareModal: React.FC<OutlookShareModalProps> = ({
  calendar,
  groups,
  initialGroupId,
  onClose,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || 'ALL');
  const [activeTab, setActiveTab] = useState<'guide' | 'urls' | 'inspector'>('urls');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [guidePlatform, setGuidePlatform] = useState<'outlook-web' | 'outlook-desktop' | 'outlook-mobile' | 'apple-google'>('outlook-web');

  // Build origin URL dynamically
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://colorcal.app';
  const cleanHost = origin.replace(/^https?:\/\//, '');

  const feedPath = selectedGroupId === 'ALL'
    ? `/api/calendar/${calendar.id}/feed.ics`
    : `/api/calendar/${calendar.id}/group/${selectedGroupId}/feed.ics`;

  const httpUrl = `${origin}${feedPath}`;
  const webcalUrl = `webcal://${cleanHost}${feedPath}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadICSFile = () => {
    const rawICS = generateICSFeed(
      calendar,
      selectedGroupId === 'ALL' ? undefined : selectedGroupId,
      origin
    );
    const blob = new Blob([rawICS], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calendar.name.replace(/[^a-zA-Z0-9_-]/g, '_')}${selectedGroupId !== 'ALL' ? '_group' : ''}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Preview ICS output for inspector tab
  const rawICSPreview = generateICSFeed(
    calendar,
    selectedGroupId === 'ALL' ? undefined : selectedGroupId,
    origin
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Add to Microsoft Outlook
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                Subscribe via iCal Webcal URL with automatic color category mapping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-gray-50/50 dark:bg-slate-950/50 px-6 pt-3 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('urls')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'urls'
                  ? 'border-gray-900 dark:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-900 shadow-2xs'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Subscription Feed Links</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-gray-900 dark:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-900 shadow-2xs'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Step-by-Step Outlook Setup</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inspector'
                  ? 'border-gray-900 dark:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-900 shadow-2xs'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>iCal Code Inspector</span>
            </button>
          </div>

          {/* Group Feed Filter Selector */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 pb-2 font-medium">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-800 dark:text-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Export All Groups (Master Feed)</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  Only Group: {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: Subscription URL Links */}
          {activeTab === 'urls' && (
            <div className="space-y-6">
              
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-normal">
                  <strong className="text-blue-950 dark:text-blue-100 font-bold block mb-0.5">
                    Live Outlook Synchronization Active
                  </strong>
                  Subscribe in Outlook using either the <code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-blue-900 dark:text-blue-100 font-mono">webcal://</code> link or the <code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-blue-900 dark:text-blue-100 font-mono">https://</code> feed URL. Outlook will auto-refresh events every 15 minutes and map category group colors dynamically!
                </div>
              </div>

              {/* Webcal Link Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 flex items-center justify-between">
                  <span>1. One-Click Webcal Subscription Link (Recommended)</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60">
                    Opens Outlook Directly
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webcalUrl}
                    className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-gray-800 dark:text-slate-200 font-mono select-all focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                  <button
                    onClick={() => copyToClipboard(webcalUrl, 'webcal')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    {copiedType === 'webcal' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === 'webcal' ? 'Copied!' : 'Copy Webcal'}</span>
                  </button>
                  <a
                    href={webcalUrl}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition-colors"
                    title="Launch Webcal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Standard HTTP ICS Feed Link Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
                  2. Standard iCal Feed HTTP URL (For Outlook Web & Google/Apple Calendar)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={httpUrl}
                    className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-gray-800 dark:text-slate-200 font-mono select-all focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                  <button
                    onClick={() => copyToClipboard(httpUrl, 'http')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {copiedType === 'http' ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === 'http' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* Direct .ics Download Option */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">Manual Import (.ics File)</h4>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 font-normal">Download static .ics file for offline Outlook import.</p>
                </div>
                <button
                  onClick={downloadICSFile}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Download .ics File</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: Step-by-Step Outlook Setup Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              
              {/* Platform Selector Tabs */}
              <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-800">
                <button
                  onClick={() => setGuidePlatform('outlook-web')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    guidePlatform === 'outlook-web'
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-2xs font-bold'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Outlook on the Web</span>
                </button>

                <button
                  onClick={() => setGuidePlatform('outlook-desktop')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    guidePlatform === 'outlook-desktop'
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-2xs font-bold'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Outlook Desktop</span>
                </button>

                <button
                  onClick={() => setGuidePlatform('outlook-mobile')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    guidePlatform === 'outlook-mobile'
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-2xs font-bold'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Outlook Mobile</span>
                </button>
              </div>

              {/* Instructions Steps */}
              {guidePlatform === 'outlook-web' && (
                <div className="space-y-4 bg-gray-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Adding to Outlook on the Web (Office 365 / Outlook.com)
                  </h3>
                  <ol className="space-y-3 text-xs text-gray-600 dark:text-slate-400 list-decimal list-inside leading-relaxed font-normal">
                    <li className="pl-1">
                      Copy the <strong className="text-gray-900 dark:text-slate-200">Standard iCal Feed HTTP URL</strong> above.
                    </li>
                    <li className="pl-1">
                      Open <a href="https://outlook.office.com/calendar" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">Outlook.office.com/calendar</a> in your web browser.
                    </li>
                    <li className="pl-1">
                      In the left sidebar, click <strong className="text-gray-900 dark:text-slate-200">"Add calendar"</strong> (or <strong className="text-gray-900 dark:text-slate-200">"Subscribe from web"</strong>).
                    </li>
                    <li className="pl-1">
                      Select <strong className="text-gray-900 dark:text-slate-200">"Subscribe from web"</strong> in the left panel.
                    </li>
                    <li className="pl-1">
                      Paste the feed URL into the input field, enter a calendar name (e.g. <em>"ColorCal - Team"</em>), choose an icon/color, and click <strong className="text-gray-900 dark:text-slate-200">"Import"</strong>.
                    </li>
                    <li className="pl-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      🎉 All group color categories will automatically render in Outlook!
                    </li>
                  </ol>
                </div>
              )}

              {guidePlatform === 'outlook-desktop' && (
                <div className="space-y-4 bg-gray-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Adding to Outlook Desktop App (Windows & Mac)
                  </h3>
                  <ol className="space-y-3 text-xs text-gray-600 dark:text-slate-400 list-decimal list-inside leading-relaxed font-normal">
                    <li className="pl-1">
                      Click <strong className="text-gray-900 dark:text-slate-200">"Copy Webcal Link"</strong> or <strong className="text-gray-900 dark:text-slate-200">"Copy Link"</strong> above.
                    </li>
                    <li className="pl-1">
                      Open the Microsoft Outlook Desktop application.
                    </li>
                    <li className="pl-1">
                      Switch to the <strong className="text-gray-900 dark:text-slate-200">Calendar view</strong> (icon on bottom or left navigation bar).
                    </li>
                    <li className="pl-1">
                      Right-click on <strong className="text-gray-900 dark:text-slate-200">"My Calendars"</strong> or click <strong className="text-gray-900 dark:text-slate-200">"Add Calendar"</strong> → <strong className="text-gray-900 dark:text-slate-200">"From Internet..."</strong>.
                    </li>
                    <li className="pl-1">
                      Paste the webcal or http URL and click <strong className="text-gray-900 dark:text-slate-200">OK</strong>.
                    </li>
                    <li className="pl-1">
                      Click <strong className="text-gray-900 dark:text-slate-200">"Yes"</strong> to confirm subscribing to the Internet Calendar and updating automatically.
                    </li>
                  </ol>
                </div>
              )}

              {guidePlatform === 'outlook-mobile' && (
                <div className="space-y-4 bg-gray-50 dark:bg-slate-950 p-5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Adding to Outlook Mobile (iOS & Android)
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed font-normal">
                    When you subscribe to the calendar on Outlook Web or Desktop (using the steps above), Microsoft 365 automatically syncs the subscribed calendar to your <strong className="text-gray-900 dark:text-slate-200">Outlook Mobile app</strong>!
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500 font-normal">
                    Alternatively, on iOS, tap the <code className="bg-gray-100 dark:bg-slate-900 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono">webcal://</code> link on your iPhone to subscribe directly into your device's default calendar.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Raw iCal Code Inspector */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">RFC 5545 iCalendar (.ics) Data Payload</h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 font-normal">
                    This raw specification is delivered live to Outlook with standard <code className="text-blue-600 dark:text-blue-400 font-mono">CATEGORIES</code> and <code className="text-blue-600 dark:text-blue-400 font-mono">X-OUTLOOK-COLOR</code> tags.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(rawICSPreview, 'raw')}
                  className="px-3 py-1 text-xs font-semibold rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'raw' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'raw' ? 'Copied Code' : 'Copy Payload'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-gray-900 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72 scrollbar-thin select-all shadow-inner">
                {rawICSPreview}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Feed URL Status: Live & Ready</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
