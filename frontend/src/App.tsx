import React from 'react';

export type FormFieldType = 'text' | 'textarea' | 'checkbox' | 'select' | 'number' | 'date' | 'email';
export type Field = {
  id: string;
  type: FormFieldType;
  label: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  help?: string;
  pattern?: string;
  internalName?: string;
};

const initialSections = [
  {
    id: 's1',
    title: 'Informácie o organizácii',
    children: [],
  },
  {
    id: 's2',
    title: 'Súhrn informácie o projekte',
    children: [],
  },
  {
    id: 's3',
    title: 'Rozpočet',
    children: [],
  },
];

const initialFields: Field[] = [
  { id: 'f1', type: 'text', label: 'Textový riadok', placeholder: 'Zadajte text', required: false, internalName: 'textovy_riadok' },
  { id: 'f2', type: 'text', label: 'Názov organizácie', placeholder: 'Názov organizácie', required: false, internalName: 'nazov_organizacie' },
  { id: 'f3', type: 'email', label: 'E-mail', placeholder: 'vas@email.sk', required: true, internalName: 'email' },
  { id: 'f4', type: 'text', label: 'IČO', placeholder: 'Zadajte IČO', required: true, internalName: 'ico' },
  { id: 'f5', type: 'select', label: 'Výber', options: ['Možnosť 1', 'Možnosť 2'], placeholder: 'Vyberte', required: false, internalName: 'vyber' },
];

export default function App() {
  const [fields, setFields] = React.useState<Field[]>(initialFields);
  const [sections, setSections] = React.useState(initialSections);
  const [selectedFieldId, setSelectedFieldId] = React.useState<string>(fields[0].id);
  const [values, setValues] = React.useState<Record<string, string | boolean>>({});

  React.useEffect(() => {
    // ensure each section has some children mapped to field ids for demo
    setSections((prev) => prev.map((s, i) => ({ ...s, children: fields.slice(i, i + 2).map((f) => f.id) })));
  }, [fields]);

  function updateField(id: string, patch: Partial<Field>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function setValue(id: string, val: string | boolean) {
    setValues((prev) => ({ ...prev, [id]: val }));
  }

  function addFieldOfType(type: FormFieldType) {
    const f: Field = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      type,
      label: type === 'text' ? 'Textový riadok' : type,
      placeholder: '',
      internalName: `${type}_${Date.now()}`,
    };
    setFields((prev) => [...prev, f]);
    setSelectedFieldId(f.id);
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setValues((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (selectedFieldId === id) setSelectedFieldId(fields[0]?.id ?? null as any);
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? fields[0];

  return (
    <div className="formbuilder-app">
      <header className="topbar-shell">
        <div className="topbar-row">
          <div className="brand-area">
            <div className="brand-mark">F</div>
            <span className="brand-name">Formuláre</span>
          </div>

          <nav className="top-links" aria-label="Sekcie">
            <button className="tab-link active">Formuláre</button>
            <button className="tab-link">Moje formuláre</button>
            <button className="tab-link">Editor formulára</button>
          </nav>

          <div className="header-actions">
            <button className="chip-button">⚙</button>
            <button className="chip-button">⎋</button>
            <div className="user-badge">SK</div>
          </div>
        </div>
      </header>

      <div className="editor-shell">
        <aside className="sidebar left-sidebar">
          <div className="sidebar-header">
            <button className="mini-icon" type="button">←</button>
            <div className="sidebar-title">Informácie o organizácii</div>
          </div>

          <div className="sidebar-search-row">
            <input value="" placeholder="Nájsť pole alebo sekciu" readOnly />
          </div>

          <div className="tree-root">
            {sections.map((section) => (
              <div key={section.id} className="tree-section">
                <div className="tree-section-header">{section.title}</div>
                <div className="tree-leafs">
                  {section.children.map((childId) => {
                    const f = fields.find((x) => x.id === childId)!;
                    return (
                      <button
                        key={childId}
                        className={`tree-leaf ${selectedFieldId === childId ? 'selected' : ''}`}
                        onClick={() => setSelectedFieldId(childId)}
                      >
                        <span className="leaf-dot" />
                        {f?.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button className="add-field-btn" type="button" onClick={() => addFieldOfType('text')}>+ Pridať prvok</button>
        </aside>

        <main className="main-panel">
          <div className="panel-toolbar top-main-toolbar">
            <div className="breadcrumb">Informácie o organizácii</div>
            <div className="toolbar-actions-lg">
              <button className="ghost-btn">Zrušiť</button>
              <button className="ghost-btn">Zatvoriť</button>
              <button className="primary-btn">Uložiť</button>
            </div>
          </div>

          <div className="panel-card editor-surface">
            <div className="field-header-row">
              <div className="field-title-wrap">
                <div className="field-chip">{selectedField?.label ?? ''}</div>
                <span className="field-type">{selectedField?.type}</span>
              </div>
              <div className="mini-tools">
                <button className="ghost-btn tiny" onClick={() => { if (selectedField) { addFieldOfType(selectedField.type); } }}>Duplikovať</button>
                <button className="ghost-btn tiny danger" onClick={() => selectedField && removeField(selectedField.id)}>Odstrániť</button>
              </div>
            </div>

            <div className="tabs-row">
              <button className="tab active">Základné údaje</button>
              <button className="tab">Pomocné texty</button>
              <button className="tab">Viditeľnosť</button>
              <button className="tab">Šablóny</button>
            </div>

            <div className="editor-grid">
              <div className="editor-column left-editor">
                <div className="field-form-group">
                  <label>Typ poľa</label>
                  <select value={selectedField?.type} onChange={(e) => selectedField && updateField(selectedField.id, { type: e.target.value as FormFieldType })}>
                    <option value="text">Textový riadok</option>
                    <option value="textarea">Textové okno</option>
                    <option value="number">Číslo</option>
                    <option value="email">E-mail</option>
                    <option value="select">Výber</option>
                  </select>
                </div>

                <div className="field-form-group">
                  <label>Interný názov</label>
                  <input value={selectedField?.internalName ?? ''} onChange={(e) => selectedField && updateField(selectedField.id, { internalName: e.target.value })} />
                </div>

                <div className="field-form-group">
                  <label>Názov poľa</label>
                  <div className="toolbar-inline">
                    <button type="button">B</button>
                    <button type="button">I</button>
                    <button type="button">U</button>
                    <button type="button">S</button>
                    <button type="button">≡</button>
                    <button type="button">⌘</button>
                  </div>
                  <textarea value={selectedField?.label ?? ''} onChange={(e) => selectedField && updateField(selectedField.id, { label: e.target.value })} />
                </div>

                <div className="tag-row">
                  <div className="tag-box">Tag</div>
                  <input value={selectedField?.placeholder ?? ''} onChange={(e) => selectedField && updateField(selectedField.id, { placeholder: e.target.value })} placeholder="Pridať tag" />
                  <button className="tiny-badge">+</button>
                </div>

                <div className="checkbox-row">
                  <label><input type="checkbox" checked={Boolean(selectedField?.required)} onChange={(e) => selectedField && updateField(selectedField.id, { required: e.target.checked })} /> Povinné pole</label>
                  <label><input type="checkbox" checked={false} onChange={() => {}} /> Editovateľné</label>
                  <label><input type="checkbox" checked={false} onChange={() => {}} /> Skrytý názov</label>
                </div>

                <div className="field-form-group compact">
                  <label>Predvolená hodnota</label>
                  <input value={String(values[selectedField?.id ?? ''] ?? '')} onChange={(e) => selectedField && setValue(selectedField.id, e.target.value)} placeholder="Predvolená hodnota" />
                </div>

                <div className="field-form-group compact">
                  <label>Validácia</label>
                  <select value={selectedField?.pattern ?? ''} onChange={(e) => selectedField && updateField(selectedField.id, { pattern: e.target.value })}>
                    <option value="">Nie je nastavená</option>
                    <option value="required">Nutné vyplniť</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <aside className="right-editor">
                <div className="section-label">Sekcia 1 z {sections.length}</div>
                <div className="section-box">
                  <div className="mini-heading">Informácie o organizácii</div>
                  <div className="label-row">
                    <span>IČO</span>
                    <input value={values['f4'] ?? ''} onChange={(e) => setValue('f4', e.target.value)} placeholder="Zadajte IČO" />
                  </div>
                  <div className="label-row">
                    <span>E-mail</span>
                    <input value={values['f3'] ?? ''} onChange={(e) => setValue('f3', e.target.value)} />
                  </div>
                  <div className="label-row">
                    <span>Názov</span>
                    <input value={values['f2'] ?? ''} onChange={(e) => setValue('f2', e.target.value)} />
                  </div>
                </div>

                <div className="selected-field-card">
                  <div className="selected-header">{selectedField?.label}</div>
                  <input value={String(values[selectedField?.id ?? ''] ?? '')} onChange={(e) => selectedField && setValue(selectedField.id, e.target.value)} placeholder={selectedField?.placeholder ?? ''} />
                </div>

                <div className="setting-list">
                  <div className="setting-item">
                    <span className="toggle-icon">✓</span>
                    <span>Skryté pole</span>
                  </div>
                  <div className="setting-item bright">
                    <span className="toggle-icon">✓</span>
                    <span>Vlastný náhľad</span>
                  </div>
                </div>

                <div className="bottom-actions">
                  <button className="secondary-btn">Zrušiť</button>
                  <button className="primary-btn">Uložiť</button>
                </div>
              </aside>
            </div>
          </div>
        </main>

        <aside className="sidebar right-sidebar">
          <div className="right-panel-header">Paleta polí</div>
          <div className="field-stack">
            <div className="palette-group">
              <button className="palette-group-header">Základné <span>▾</span></button>
              <div className="palette-group-items">
                <button className="small-field-item" onClick={() => addFieldOfType('text')}>TEXTOVÝ RIADOK</button>
                <button className="small-field-item" onClick={() => addFieldOfType('textarea')}>TEXTOVÉ OKNO</button>
                <button className="small-field-item" onClick={() => addFieldOfType('number')}>ČÍSLO</button>
                <button className="small-field-item" onClick={() => addFieldOfType('email')}>E-MAIL</button>
              </div>
            </div>

            <div className="palette-group">
              <button className="palette-group-header">Výpočty <span>▾</span></button>
              <div className="palette-group-items">
                <button className="small-field-item" onClick={() => addFieldOfType('number')}>SČÍTAC</button>
                <button className="small-field-item" onClick={() => addFieldOfType('number')}>NÁSOBIČ</button>
                <button className="small-field-item" onClick={() => addFieldOfType('number')}>PERCENTO</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
