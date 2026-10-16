import React from 'react';
import FieldPalette from './components/FieldPalette';
import FormCanvas from './components/FormCanvas';
import FieldSettings from './components/FieldSettings';

export type FormFieldType = 'text' | 'textarea' | 'checkbox' | 'select' | 'number' | 'date' | 'email';
export type Field = { id: string; type: FormFieldType; label: string; options?: string[]; placeholder?: string; required?: boolean; help?: string; pattern?: string };

export default function FormBuilder() {
  const [fields, setFields] = React.useState<Field[]>([]);
  const [name, setName] = React.useState('Nový formulár');
  const [templates, setTemplates] = React.useState<any[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => { fetchTemplates(); }, []);

  function addField(fieldType: FormFieldType) {
    const f: Field = { id: String(Date.now()) + Math.random().toString(16).slice(2), type: fieldType, label: fieldType === 'text' ? 'Textový riadok' : fieldType, placeholder: '' };
    if (fieldType === 'select') f.options = ['Možnosť 1', 'Možnosť 2'];
    setFields((prev) => [...prev, f]);
    setSelectedId(f.id);
  }

  function updateField(id: string, patch: Partial<Field>) { setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f))); }
  function removeField(id: string) { setFields((prev) => prev.filter((f) => f.id !== id)); if (selectedId === id) setSelectedId(null); }
  function reorderFields(newOrder: Field[]) { setFields(newOrder); }

  async function saveTemplate() {
    const payload = { name, schema: fields };
    try {
      const res = await fetch('/api/templates', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { fetchTemplates(); alert('Šablóna uložená'); } else alert('Uloženie zlyhalo');
    } catch (e) { console.error(e); alert('Uloženie zlyhalo (network)'); }
  }

  async function fetchTemplates() { try { const res = await fetch('/api/templates'); const data = await res.json(); setTemplates(data || []); } catch (e) { console.error(e); } }

  function loadTemplate(t: any) { setName(t.name); setFields(t.schema); setSelectedId(null); }

  function exportJSON() { const payload = { name, schema: fields }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${name.replace(/\s+/g, '_') || 'template'}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="app-shell">
      <div className="container">
        <aside className="sidebar" aria-label="Paleta">
          <div className="topbar">
            <div className="brand"><div className="brand-mark" aria-hidden></div><h1>Formbuilder</h1></div>
            <div className="toolbar-actions">
              <button className="btn btn-small" type="button">Náhľad</button>
              <button className="btn btn-small" type="button">Kódy</button>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <FieldPalette onAdd={addField} />

            <div className="sidebar-section" style={{ marginTop: 14 }}>
              <span className="small-label">Šablóny</span>
              <div className="template-list">
                {templates.map((t) => (
                  <div key={t.id} className="template-item">
                    <div className="template-head">
                      <div className="template-name">{t.name}</div>
                      <div className="template-badges"><span className="badge">{Array.isArray(t.schema) ? t.schema.length : 0}</span></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button className="btn btn-small" onClick={() => loadTemplate(t)}>Načítať</button>
                      <a className="btn btn-small" href={`/api/templates/${t.id}/export.csv`} style={{ textDecoration: 'none' }}>Export CSV</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

        <main className="workspace" aria-live="polite">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <h2 style={{ margin: 0 }}>{name}</h2>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>{fields.length} položiek</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => { setFields([]); setName('Nový formulár'); setSelectedId(null); }}>Vyčistiť</button>
              <button className="btn btn-primary" onClick={saveTemplate}>Uložiť šablónu</button>
              <button className="btn btn-ghost" onClick={exportJSON}>Export</button>
            </div>
          </div>

          <FormCanvas fields={fields} onChange={updateField} onRemove={removeField} onReorder={reorderFields} onSelect={(id: string) => setSelectedId(id)} />

        </main>

        <aside style={{ width: 320 }} aria-label="Nastavenia poľa">
          <div className="sidebar" style={{ padding: 12 }}>
            <span className="small-label">Nastavenia</span>
            {selectedField ? (
              <FieldSettings field={selectedField} onChange={(patch) => updateField(selectedField.id, patch)} onRemove={() => removeField(selectedField.id)} />
            ) : (
              <div className="empty-state">Vyber pole na úpravu</div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}
