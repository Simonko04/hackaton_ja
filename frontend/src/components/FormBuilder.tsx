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
import type { Field, FormFieldType } from './FormBuilder';

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

  return (
    <div>
      <div className="canvas-header">
        <h2>Form editor</h2>
        <span className="badge">{fields.length} fields</span>
      </div>

      {fields.length === 0 ? (
        <div className="empty-state">No fields yet. Add one from the palette.</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
            <div className="field-list">
              {fields.map((field) => (
                <SortableItem key={field.id} id={field.id}>
                  <div className="field-card">
                    <div className="field-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="drag-handle">⋮⋮</span>
                        <span className="field-code"><span className="dot" />{field.type}</span>
                      </div>
                      <button className="icon-btn" type="button" onClick={() => onRemove(field.id)}>Delete</button>
                    </div>

                    <div className="input-wrap">
                      <label className="small-label" style={{ marginBottom: 0 }}>Label</label>
                      <input
                        className="form-input"
                        value={field.label}
                        onChange={(e) => onChange(field.id, { label: e.target.value })}
                      />
                    </div>

                    {field.type === 'select' && (
                      <div className="input-wrap">
                        <label className="small-label" style={{ marginBottom: 0 }}>Options</label>
                        <input
                          className="form-input"
                          value={(field.options ?? []).join(', ')}
                          onChange={(e) =>
                            onChange(field.id, {
                              options: e.target.value
                                .split(',')
                                .map((item) => item.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="preview-block">
        <div className="canvas-header" style={{ marginBottom: 10 }}>
          <h2>Live preview</h2>
        </div>

        <div className="preview-card">
          {fields.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>Start by adding fields to your form.</div>
          ) : (
            fields.map((field) => (
              <div key={field.id} className="preview-row">
                <label>{field.label}</label>

                {field.type === 'text' && (
                  <input
                    className="form-input"
                    value={typeof values[field.id] === 'string' ? (values[field.id] as string) : ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={typeof values[field.id] === 'string' ? (values[field.id] as string) : ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                  />
                )}

                {field.type === 'checkbox' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={Boolean(values[field.id])}
                      onChange={(e) => setValue(field.id, e.target.checked)}
                    />
                    <span>{field.label}</span>
                  </label>
                )}

                {field.type === 'select' && (
                  <select
                    className="form-select"
                    value={typeof values[field.id] === 'string' ? (values[field.id] as string) : ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                  >
                    <option value="">Select option</option>
                    {(field.options ?? []).map((option, index) => (
                      <option key={`${field.id}-${option}-${index}`} value={option}>{option}</option>
                    ))}
                  </select>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
