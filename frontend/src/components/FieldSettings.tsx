import React from 'react';
import type { Field } from '../App';

export type FieldSettingsProps = {
  field: Field;
  onChange: (patch: Partial<Field>) => void;
  onRemove: () => void;
};

export default function FieldSettings({ field, onChange, onRemove }: FieldSettingsProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{field.label}</h3>
        <button className="btn btn-small" onClick={onRemove} style={{ background: 'transparent', border: '1px solid var(--line)' }}>Odstrániť</button>
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label className="small-label">Názov poľa</label>
        <input className="form-input" value={field.label} onChange={(e) => onChange({ label: e.target.value })} />

        <label className="small-label">Placeholder</label>
        <input className="form-input" value={field.placeholder ?? ''} onChange={(e) => onChange({ placeholder: e.target.value })} />

        {field.type === 'select' && (
          <>
            <label className="small-label">Možnosti (oddelené čiarkou)</label>
            <input className="form-input" value={(field.options ?? []).join(', ')} onChange={(e) => onChange({ options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={Boolean(field.required)} onChange={(e) => onChange({ required: e.target.checked })} />
          <span className="small-label">Povinné pole</span>
        </label>

        <label className="small-label">Help text</label>
        <input className="form-input" value={field.help ?? ''} onChange={(e) => onChange({ help: e.target.value })} />

        <label className="small-label">Validation pattern (RegExp)</label>
        <input className="form-input" value={field.pattern ?? ''} onChange={(e) => onChange({ pattern: e.target.value })} />
      </div>
    </div>
  );
}
