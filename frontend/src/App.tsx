import React from 'react';

export type FormFieldType = 'text' | 'textarea' | 'checkbox' | 'select' | 'number' | 'date' | 'email';

type Field = {
  id: string;
  type: FormFieldType;
  label: string;
  internalName: string;
  value: string;
  required?: boolean;
  placeholder?: string;
};

const initialFields: Field[] = [
  {
    id: '1',
    type: 'text',
    label: 'Textový riadok',
    internalName: 'textovy_riadok',
    value: 'Zadajte text',
    placeholder: 'Zadajte text',
    required: false,
  },
  {
    id: '2',
    type: 'text',
    label: 'Názov organizácie',
    internalName: 'nazov_organizacie',
    value: 'Názov organizácie',
    required: false,
  },
  {
    id: '3',
    type: 'email',
    label: 'E-mail',
    internalName: 'email',
    value: 'vas@email.sk',
    placeholder: 'vas@email.sk',
    required: true,
  },
  {
    id: '4',
    type: 'text',
    label: 'IČO',
    internalName: 'ico',
    value: 'Zadajte IČO',
    required: true,
  },
];

const paletteItems = [
  ['TEXTOVÝ RIADOK', 'TEXTOVÉ OKNO', 'ČÍSLO', 'E-MAIL'],
  ['SČÍTAC', 'NÁSOBIČ', 'PERCENTO'],
  ['SEKCIA', 'PODSEKCIA', 'OPAKOVACIA PODSEKCIA'],
];

export default function App() {
  const [fields, setFields] = React.useState<Field[]>(initialFields);
  const [selectedId, setSelectedId] = React.useState<string>('1');

  const selectedField = fields.find((field) => field.id === selectedId) ?? fields[0];

  const updateSelected = (patch: Partial<Field>) => {
    setFields((prev) => prev.map((field) => (field.id === selectedId ? { ...field, ...patch } : field)));
  };

  return (
    <div className="formbuilder-app">
      <header className="topbar-shell">
        <div className="topbar-row">
          <div className="brand-area">
            <div className="brand-mark">F</div>
            <span className="brand-name">Formuláre</span>
          </div>

          <nav className="top-links" aria-label="Breadcrumby">
            <span className="crumb">Formuláre</span>
            <span className="crumb muted">&gt;</span>
            <span className="crumb muted">Moje formuláre</span>
            <span className="crumb muted">&gt;</span>
            <span className="crumb active">Editor formulára</span>
          </nav>

          <div className="header-actions">
            <button className="chip-button" aria-label="Pomocník">?</button>
            <button className="chip-button" aria-label="Nastavenia">⚙</button>
            <div className="user-badge">SK</div>
          </div>
        </div>
      </header>

      <div className="editor-shell">
        <aside className="sidebar left-sidebar">
          <div className="sidebar-header-row">
            <button className="icon-btn" type="button">←</button>
            <div className="sidebar-title">Informácie o organizácii</div>
          </div>

          <div className="save-note">Všetky zmeny sú uložené</div>

          <div className="tree-section tree-root">
            <div className="tree-head">Štruktúra formulára</div>
            <div className="search-shell">
              <input placeholder="Nájsť pole alebo sekciu" aria-label="Search" />
            </div>

            <div className="section-list">
              <div className="tree-block active-block">
                <div className="tree-block-title">Informácie o organizácii</div>
                {fields.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    className={`tree-item ${selectedId === field.id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(field.id)}
                  >
                    <span className="tree-bullet" />
                    {field.label}
                  </button>
                ))}
              </div>

              <div className="tree-block secondary-block">
                <div className="tree-block-title">Súhrn informácie o projekte</div>
                <button className="tree-item" type="button">
                  <span className="tree-bullet" />
                  Názov organizácie
                </button>
                <button className="tree-item" type="button">
                  <span className="tree-bullet" />
                  E-mail
                </button>
              </div>

              <div className="tree-block secondary-block">
                <div className="tree-block-title">Rozpočet</div>
                <button className="tree-item" type="button">
                  <span className="tree-bullet" />
                  E-mail
                </button>
              </div>
            </div>
          </div>

          <button className="plus-button" type="button">+ Pridať prvok</button>
        </aside>

        <main className="main-panel">
          <div className="main-toolbar">
            <div className="toolbar-left">
              <button className="circle-btn" type="button">←</button>
              <div className="toolbar-text">Informácie o organizácii</div>
            </div>

            <div className="toolbar-actions">
              <button className="mini-btn">Späť na zoznam</button>
              <button className="mini-btn">Náhľad</button>
              <button className="mini-btn">Zatvoriť</button>
              <button className="primary-btn">Uložiť</button>
            </div>
          </div>

          <div className="editor-content">
            <div className="field-header-line">
              <div className="field-header-meta">
                <span className="field-badge">{selectedField.label}</span>
                <span className="field-tag">{selectedField.type}</span>
              </div>
              <div className="field-header-actions">
                <button className="soft-btn">Duplikovať</button>
                <button className="soft-btn pill-btn">⋯</button>
              </div>
            </div>

            <div className="tab-row">
              <button className="tab active">Základné údaje</button>
              <button className="tab">Pomocné texty</button>
              <button className="tab">Viditeľnosť</button>
              <button className="tab">Šablóny</button>
            </div>

            <div className="editor-layout">
              <div className="editor-form-panel">
                <div className="field-group">
                  <label>Typ poľa</label>
                  <select value={selectedField.type} onChange={(e) => updateSelected({ type: e.target.value as FormFieldType })}>
                    <option value="text">Textový riadok</option>
                    <option value="textarea">Textové okno</option>
                    <option value="number">Číslo</option>
                    <option value="email">E-mail</option>
                    <option value="select">Výber</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Interný názov</label>
                  <input value={selectedField.internalName} onChange={(e) => updateSelected({ internalName: e.target.value })} />
                </div>

                <div className="field-group">
                  <label>Názov poľa</label>
                  <div className="toolbar-inline">
                    <button type="button">B</button>
                    <button type="button">I</button>
                    <button type="button">U</button>
                    <button type="button">S</button>
                    <button type="button">≡</button>
                    <button type="button">⌘</button>
                  </div>
                  <textarea value={selectedField.label} onChange={(e) => updateSelected({ label: e.target.value })} />
                </div>

                <div className="tag-row">
                  <span className="tag-label">Tag</span>
                  <div className="tag-field">
                    <input value={selectedField.placeholder ?? ''} onChange={(e) => updateSelected({ placeholder: e.target.value })} placeholder="Zadajte text" />
                    <button type="button" className="tag-add">+</button>
                  </div>
                </div>

                <div className="checkbox-row">
                  <label>
                    <input type="checkbox" checked={!!selectedField.required} onChange={(e) => updateSelected({ required: e.target.checked })} />
                    Povinné pole
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Editovateľné
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked />
                    Skrytý názov
                  </label>
                </div>

                <div className="field-group compact-group">
                  <label>Predvolená hodnota</label>
                  <input value={selectedField.value} onChange={(e) => updateSelected({ value: e.target.value })} />
                </div>

                <div className="field-group compact-group">
                  <label>Validácia</label>
                  <select>
                    <option>Nie je nastavená</option>
                    <option>Nutné vyplniť</option>
                    <option>Kontrola emailu</option>
                  </select>
                </div>
              </div>

              <aside className="preview-panel">
                <div className="preview-header">Sekcia 1 z 8</div>
                <div className="mini-section-box">
                  <h4>Informácie o organizácii</h4>
                  <div className="mini-field">
                    <span>IČO</span>
                    <input value="Zadajte IČO" readOnly />
                  </div>
                  <div className="mini-field">
                    <span>E-mail</span>
                    <input value="vas@email.sk" readOnly />
                  </div>
                  <div className="mini-field">
                    <span>Názov</span>
                    <input value="Názov organizácie" readOnly />
                  </div>
                </div>

                <div className="preview-card">
                  <div className="preview-label">{selectedField.label}</div>
                  <input value={selectedField.value || selectedField.placeholder || ''} readOnly />
                </div>

                <div className="preview-options">
                  <div className="option-row">
                    <span>✓</span>
                    <span>Skryté pole</span>
                  </div>
                  <div className="option-row active-row">
                    <span>✓</span>
                    <span>Vlastný náhľad</span>
                  </div>
                </div>

                <div className="preview-footer">
                  <button className="secondary-btn">Zrušiť</button>
                  <button className="primary-btn small-btn">Uložiť</button>
                </div>
              </aside>
            </div>
          </div>
        </main>

        <aside className="sidebar right-sidebar">
          <div className="palette-header">Paleta polí</div>
          {paletteItems.map((group, index) => (
            <div key={index} className="palette-group">
              <div className="palette-title">{index === 0 ? 'Základné' : index === 1 ? 'Výpočty' : 'Sekcie'}</div>
              <div className="palette-list">
                {group.map((item) => (
                  <button key={item} type="button" className="palette-item" onClick={() => setSelectedId('1')}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
