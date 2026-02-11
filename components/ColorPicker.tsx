import React from 'react';
import { COLORS } from '../types';

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className={`w-8 h-8 rounded-full transition-all ${color} ${
            selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-80 hover:opacity-100'
          }`}
          aria-label="Select color"
        />
      ))}
    </div>
  );
};