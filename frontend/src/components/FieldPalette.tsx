import { useState } from 'react';
import type { Field, FormFieldType } from './FormBuilder';

export type FieldPaletteProps = {
  onAdd: (type: FormFieldType) => void;
};

const options: Array<{ type: FormFieldType; label: string; icon: string }> = [
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'textarea', label: 'Text area', icon: '▭' },
  { type: 'checkbox', label: 'Checkbox', icon: '✓' },
  { type: 'select', label: 'Select', icon: '▣' },
];

export default function FieldPalette({ onAdd }: FieldPaletteProps) {
  return (
    <div className="sidebar-section">
      <span className="small-label">Field palette</span>
      <div className="field-palette">
        {options.map((option) => (
          <button key={option.type} className="palette-item" type="button" onClick={() => onAdd(option.type)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="palette-chip">{option.icon}</span>
              <span>{option.label}</span>
            </div>
            <span className="inline-icon">+</span>
          </button>
        ))}
      </div>
    </div>
  );
}
