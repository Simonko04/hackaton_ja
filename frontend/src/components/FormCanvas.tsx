import { useState } from 'react';
import type { Field, FormFieldType } from './FormBuilder';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

export type FormCanvasProps = {
  fields: Field[];
  onChange: (id: string, patch: Partial<Field>) => void;
  onRemove: (id: string) => void;
  onReorder: (list: Field[]) => void;
};

export default function FormCanvas({ fields, onChange, onRemove, onReorder }: FormCanvasProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [values, setValues] = useState<Record<string, string | boolean>>({});

  function setValue(id: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(fields, oldIndex, newIndex));
    }
  }

  async function submitPreview() {
    try {
      const res = await fetch('/api/submissions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ templateId: null, data: values }) });
      if (res.ok) { alert('Submission saved'); setValues({}); }
      else { alert('Save failed'); }
    } catch (e) { console.error(e); alert('Save failed'); }
  }

  return (
    <section aria-label="Editor formulára">
      <div className="canvas-header">
        <h2>Editor formulára</h2>
        <span className="badge">{fields.length} položiek</span>
      </div>

      {fields.length === 0 ? (
        <div className="empty-state">Žiadne polia. Pridajte z palety vľavo.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
            <div className="field-list" role="list">
              {fields.map((field) => (
                <SortableItem key={field.id} id={field.id}>
                  <article className="field-card" role="listitem" aria-labelledby={`label-${field.id}`}>
                    <div className="field-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="drag-handle" aria-hidden>⋮⋮</span>
                        <div className="field-code"><span className="dot" />{field.type}</div>
                      </div>
                      <div>
                        <button className="icon-btn" type="button" aria-label={`Vymazať ${field.label}`} onClick={() => onRemove(field.id)}>Odstrániť</button>
                      </div>
                    </div>

                    <div className="input-wrap">
                      <label id={`label-${field.id}`} htmlFor={`input-${field.id}`} className="small-label">Názov poľa</label>
                      <input id={`input-${field.id}`} className="form-input" value={field.label} onChange={(e) => onChange(field.id, { label: e.target.value })} />
                    </div>

                    {field.type === 'select' && (
                      <div className="input-wrap">
                        <label className="small-label" htmlFor={`options-${field.id}`}>Možnosti (oddelené čiarkou)</label>
                        <input id={`options-${field.id}`} className="form-input" value={(field.options ?? []).join(', ')} onChange={(e) => onChange(field.id, { options: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                      </div>
                    )}
                  </article>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="preview-block">
        <div className="canvas-header" style={{ marginBottom: 10 }}>
          <h2>Náhľad</h2>
        </div>

        <div className="preview-card">
          {fields.length === 0 ? (
            <div className="empty-state">Pridajte polia pre zobrazenie náhľadu.</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); submitPreview(); }}>
              {fields.map((field) => (
                <div key={field.id} className="preview-row">
                  <label htmlFor={`input-preview-${field.id}`} style={{ fontWeight: 700 }}>{field.label}</label>

                  {field.type === 'text' && (
                    <input id={`input-preview-${field.id}`} className="form-input" value={typeof values[field.id] === 'string' ? (values[field.id] as string) : ''} onChange={(e) => setValue(field.id, e.target.value)} />
                  )}

                  {field.type === 'textarea' && (
                    <textarea id={`input-preview-${field.id}`} className="form-textarea" rows={4} value={typeof values[field.id] === 'string' ? (values[field.id] as string) : ''} onChange={(e) => setValue(field.id, e.target.value)} />
                  )}

                  {field.type === 'checkbox' && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input id={`input-preview-${field.id}`} type="checkbox" checked={Boolean(values[field.id])} onChange={(e) => setValue(field.id, e.target.checked)} />
                      <span>{field.label}</span>
                    </label>
                  )}

                  {field.type === 'select' && (
                    <select id={`input-preview-${field.id}`} className="form-select" value={typeof values[field.id] === 'string' ? (values[field.id] as string) : ''} onChange={(e) => setValue(field.id, e.target.value)}>
                      <option value="">Vyberte možnosť</option>
                      {(field.options ?? []).map((option, index) => (
                        <option key={`${field.id}-${option}-${index}`} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" type="submit">Odoslať náhľad</button>
                <button className="btn btn-ghost btn-small" type="button" onClick={() => { const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `submission_${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }}>Export JSON</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
