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
};

const sectionStructure = [
  {
    title: 'Informácie o organizácii',
    children: [
      'IČO',
      'E-mail',
      'Názov',
      'Verejná správa',
      'IBAN',
      'Údaje o oprávnenej osobe',
      'Číslo',
      'Činost',
      'Počet žiadateľov',
      'Dátum zápisu',
      'Zmluva č.',
    ],
  },
  {
    title: 'Súhrn informácie o projekte',
    children: [
      'Príjem',
      'Prihádzanie',
      'Náklady projektu',
      'Zostavenie',
      'Doplňujúce informácie',
      'Rozpočet',
      'Prihody',
      'Čestné prehlásenie',
    ],
  },
  {
    title: 'Rozpočet',
    children: ['Rozpočet', 'Rozpočet', 'Podsekcia'],
  },
];

const defaultFields: Field[] = [
  { id: 'f1', type: 'text', label: 'Textový riadok', placeholder: 'Zadajte text', required: false },
  { id: 'f2', type: 'text', label: 'Názov organizácie', placeholder: 'Názov organizácie', required: false },
  { id: 'f3', type: 'email', label: 'E-mail', placeholder: 'vas@email.sk', required: true },
  { id: 'f4', type: 'text', label: 'IČO', placeholder: 'Zadajte IČO', required: true },
  { id: 'f5', type: 'select', label: 'Výber', options: ['Možnosť 1', 'Možnosť 2'], placeholder: 'Vyberte', required: false },
];

const paletteGroups = [
  {
    key: 'basic',
    title: 'Základné',
    items: ['Textový riadok', 'Textové okno', 'Číslo', 'Mena', 'Hľadanie IČO', 'Rozbaľovacia ponuka', 'Editovateľný výber'],
  },
  {
    key: 'calc',
    title: 'Výpočty',
    items: ['Sčítac', 'Násobič', 'Percento'],
  },
  {
    key: 'budget',
    title: 'Rozpočet',
    items: ['Podsekcia', 'Rozpočtová tabuľka', 'Opakovanie rozpočtovej tabuľky'],
  },
  {
    key: 'sections',
    title: 'Sekcie',
    items: ['Sekcia', 'Podsekcia', 'Opakovacia podsekcia', 'Popup sekcia'],
  },
  {
    key: 'files',
    title: 'Súbory',
    items: ['Zoznam súborov', 'Obrázky'],
  },
  {
    key: 'calendar',
    title: 'Kalendár',
    items: ['Dátum', 'Rozmedzie dátumov', 'Mesiac'],
  },
  {
    key: 'tables',
    title: 'Tabuľka',
    items: ['Tabuľka', 'Výpočty', 'Kalendár', 'Iné'],
  },
  {
    key: 'indicators',
    title: 'Indikátory',
    items: ['Plnenie indikátorov', 'Vlastné indikátory', 'Súhrn indikátorov'],
  },
];

export default function App() {
  const [selectedFieldId, setSelectedFieldId] = React.useState<string>('f4');
  const [sectionsOpen, setSectionsOpen] = React.useState<Record<string, boolean>>({
    basic: true,
    calc: true,
    budget: true,
    sections: true,
    files: true,
    calendar: true,
    tables: true,
    indicators: true,
  });

  const selectedField = defaultFields.find((f) => f.id === selectedFieldId) ?? defaultFields[0];

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
            {sectionStructure.map((section) => (
              <div key={section.title} className="tree-section">
                <div className="tree-section-header">{section.title}</div>
                <div className="tree-leafs">
                  {section.children.map((child, idx) => (
                    <button
                      key={`${section.title}-${idx}`}
                      className={`tree-leaf ${selectedField.label === child ? 'selected' : ''}`}
                      onClick={() => setSelectedFieldId(defaultFields[idx % defaultFields.length].id)}
                    >
                      <span className="leaf-dot" />
                      {child}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="add-field-btn" type="button">+ Pridať prvok</button>
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
                <div className="field-chip">Textový riadok</div>
                <span className="field-type">Text</span>
              </div>
              <div className="mini-tools">
                <button className="ghost-btn tiny">Duplikovať</button>
                <button className="ghost-btn tiny danger">⋯</button>
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
                  <select value="Textový riadok">
                    <option>Textový riadok</option>
                    <option>Textové okno</option>
                    <option>Číslo</option>
                  </select>
                </div>

                <div className="field-form-group">
                  <label>Interný názov</label>
                  <input value="textovy_riadok" readOnly />
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
                  <textarea value="Textový riadok" readOnly />
                </div>

                <div className="tag-row">
                  <div className="tag-box">Tag</div>
                  <input value="" placeholder="Pridať tag" readOnly />
                  <button className="tiny-badge">+</button>
                </div>

                <div className="checkbox-row">
                  <label><input type="checkbox" checked readOnly /> Povinné pole</label>
                  <label><input type="checkbox" checked readOnly /> Editovateľné</label>
                  <label><input type="checkbox" readOnly /> Skrytý názov</label>
                </div>

                <div className="field-form-group compact">
                  <label>Predvolená hodnota</label>
                  <input value="" placeholder="Predvolená hodnota" readOnly />
                </div>

                <div className="field-form-group compact">
                  <label>Validácia</label>
                  <select value="Nie je nastavená">
                    <option>Nie je nastavená</option>
                    <option>Nutné vyplniť</option>
                    <option>Email</option>
                  </select>
                </div>
              </div>

              <aside className="right-editor">
                <div className="section-label">Sekcia 1 z 8</div>
                <div className="section-box">
                  <div className="mini-heading">Informácie o organizácii</div>
                  <div className="label-row">
                    <span>IČO</span>
                    <input value="" placeholder="Zadajte IČO" readOnly />
                  </div>
                  <div className="label-row">
                    <span>E-mail</span>
                    <input value="vas@email.sk" readOnly />
                  </div>
                  <div className="label-row">
                    <span>Názov</span>
                    <input value="Názov organizácie" readOnly />
                  </div>
                </div>

                <div className="selected-field-card">
                  <div className="selected-header">Textový riadok</div>
                  <input value="Zadajte text" readOnly />
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
          <div className="right-panel-header">Sekcia</div>
          <div className="field-stack">
            {paletteGroups.map((group, index) => (
              <div key={group.key} className={`palette-group ${sectionsOpen[group.key] ? 'open' : ''}`}>
                <button
                  type="button"
                  className="palette-group-header"
                  onClick={() => setSectionsOpen((prev) => ({ ...prev, [group.key]: !prev[group.key] }))}
                >
                  <span>{group.title}</span>
                  <span>{sectionsOpen[group.key] ? '▾' : '▸'}</span>
                </button>

                {sectionsOpen[group.key] && (
                  <div className="palette-group-items">
                    {group.items.map((item, idx) => (
                      <button
                        key={`${group.key}-${idx}`}
                        type="button"
                        className={`small-field-item ${index === 0 && idx === 0 ? 'selected' : ''}`}
                        onClick={() => setSelectedFieldId(defaultFields[(idx + index) % defaultFields.length].id)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

