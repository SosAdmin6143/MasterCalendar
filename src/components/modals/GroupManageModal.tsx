import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Palette, Check, Tag, Share2 } from 'lucide-react';
import { EventGroup } from '../../types/calendar';
import { PRESET_COLORS } from '../ui/ColorPalette';

interface GroupManageModalProps {
  groups: EventGroup[];
  initialCreateMode?: boolean;
  onSaveGroup: (group: Partial<EventGroup>) => void;
  onDeleteGroup: (groupId: string) => void;
  onOpenShareGroup?: (groupId: string) => void;
  onClose: () => void;
}

export const GroupManageModal: React.FC<GroupManageModalProps> = ({
  groups,
  initialCreateMode = false,
  onSaveGroup,
  onDeleteGroup,
  onOpenShareGroup,
  onClose,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(initialCreateMode ? 'NEW' : null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].hex);
  const [outlookCategory, setOutlookCategory] = useState(PRESET_COLORS[0].outlookCategory);

  const startNewGroup = () => {
    setEditingGroupId('NEW');
    setName('');
    setDescription('');
    setColor(PRESET_COLORS[0].hex);
    setOutlookCategory(PRESET_COLORS[0].outlookCategory);
  };

  const startEditGroup = (g: EventGroup) => {
    setEditingGroupId(g.id);
    setName(g.name);
    setDescription(g.description || '');
    setColor(g.color);
    setOutlookCategory(g.outlookCategory || 'Blue Category');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveGroup({
      ...(editingGroupId !== 'NEW' ? { id: editingGroupId! } : {}),
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      outlookCategory,
    });

    setEditingGroupId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Manage Event Groups & Outlook Categories
            </h2>
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
          
          {/* Create or Edit Group Form */}
          {editingGroupId !== null ? (
            <form onSubmit={handleSave} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  {editingGroupId === 'NEW' ? 'Create New Custom Group' : 'Edit Group Category'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingGroupId(null)}
                  className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Product Design, Finance, Marketing Ops..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Color Preset Palette Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-2">
                  Select Color & Outlook Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRESET_COLORS.map((preset) => {
                    const isSelected = color.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => {
                          setColor(preset.hex);
                          setOutlookCategory(preset.outlookCategory);
                        }}
                        className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all text-xs font-medium cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-blue-600 border-transparent bg-white dark:bg-slate-800 shadow-xs'
                            : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </span>
                        <span className="text-[10px] text-gray-700 dark:text-slate-300 truncate w-full text-center font-semibold">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Color Override */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">Custom Hex:</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded border border-gray-200 dark:border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-24 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs font-mono text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">
                  Group Description
                </label>
                <input
                  type="text"
                  placeholder="Short explanation of what events belong here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGroupId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white shadow-xs cursor-pointer"
                >
                  Save Group
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={startNewGroup}
              className="w-full py-3 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Custom Event Group</span>
            </button>
          )}

          {/* Group List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
              Configured Group Categories ({groups.length})
            </h3>

            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="p-3.5 rounded-lg bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 flex items-center justify-between gap-3 group hover:border-gray-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{group.name}</h4>
                        <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                          {group.color}
                        </span>
                      </div>
                      {group.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5 font-normal">{group.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenShareGroup && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenShareGroup(group.id);
                        }}
                        className="p-1.5 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                        title="Get Share / Outlook Feed Link for this Group"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEditGroup(group)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Group"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {groups.length > 1 && (
                      <button
                        onClick={() => onDeleteGroup(group.id)}
                        className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
