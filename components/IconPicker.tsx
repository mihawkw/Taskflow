import React from 'react';
import { ICONS } from '../types';

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (icon: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
      {ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onSelect(icon)}
          className={`w-10 h-10 flex items-center justify-center text-xl rounded-full transition-all ${
            selectedIcon === icon ? 'bg-white shadow-md scale-110 ring-2 ring-blue-500' : 'hover:bg-gray-200'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};