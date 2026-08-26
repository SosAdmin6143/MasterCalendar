export interface ColorPreset {
  hex: string;
  name: string;
  outlookCategory: string;
  badgeClass: string;
}

export const PRESET_COLORS: ColorPreset[] = [
  { hex: '#8B5CF6', name: 'Royal Purple', outlookCategory: 'Purple Category', badgeClass: 'bg-purple-500 text-white' },
  { hex: '#0284C7', name: 'Sky Blue', outlookCategory: 'Blue Category', badgeClass: 'bg-sky-500 text-white' },
  { hex: '#EF4444', name: 'Crimson Red', outlookCategory: 'Red Category', badgeClass: 'bg-red-500 text-white' },
  { hex: '#10B981', name: 'Emerald Green', outlookCategory: 'Green Category', badgeClass: 'bg-emerald-500 text-white' },
  { hex: '#F59E0B', name: 'Amber Orange', outlookCategory: 'Orange Category', badgeClass: 'bg-amber-500 text-white' },
  { hex: '#EC4899', name: 'Rose Pink', outlookCategory: 'Magenta Category', badgeClass: 'bg-pink-500 text-white' },
  { hex: '#14B8A6', name: 'Teal Turquoise', outlookCategory: 'Teal Category', badgeClass: 'bg-teal-500 text-white' },
  { hex: '#6366F1', name: 'Indigo Violet', outlookCategory: 'Indigo Category', badgeClass: 'bg-indigo-500 text-white' },
  { hex: '#EAB308', name: 'Sunny Yellow', outlookCategory: 'Yellow Category', badgeClass: 'bg-yellow-500 text-slate-900' },
  { hex: '#64748B', name: 'Slate Gray', outlookCategory: 'Gray Category', badgeClass: 'bg-slate-500 text-white' },
];
