import React from 'react';
import type { FormFieldType } from './FormBuilder';

export type FieldPaletteProps = {
  onAdd: (type: FormFieldType) => void;
};

const options: Array<{ type: FormFieldType; label: string; icon: string }> = [
  { type: 'text', label: 'Textový riadok', icon: 'T' },
  { type: 'textarea', label: 'Textové okno', icon: '▭' },
  { type: 'checkbox', label: 'Zaškrtávacie', icon: '✓' },
  { type: 'select', label: 'Výber (select)', icon: '▣' },
];

export default function FieldPalette({ onAdd }: FieldPaletteProps) {
  return (
    <section className="sidebar-section" aria-label="Palette polí">
      <span className="small-label">Typy položiek</span>
      <div className="field-palette" role="list">
        {options.map((option) => (
          <button
            key={option.type}
            className="palette-item"
            type="button"
            onClick={() => onAdd(option.type)}
            title={`Pridať ${option.label}`}
            aria-label={`Pridať ${option.label}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="palette-chip" aria-hidden>{option.icon}</span>
              <span>{option.label}</span>
            </div>
            <span className="inline-icon" aria-hidden>+</span>
          </button>
        ))}
      </div>
    </section>
  );
}
