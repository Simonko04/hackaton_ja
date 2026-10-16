import React, { useState } from 'react';
import type { FormFieldType } from '../App';

export type FieldPaletteProps = {
  onAdd: (type: FormFieldType) => void;
};

const categories: Array<{
  key: string;
  title: string;
  items: Array<{ type: FormFieldType; label: string }>;
}> = [
  {
    key: 'basic',
    title: 'Základné',
    items: [
      { type: 'text', label: 'TEXTOVÝ RIADOK' },
      { type: 'textarea', label: 'TEXTOVÉ OKNO' },
      { type: 'number', label: 'ČÍSLO' },
      { type: 'text', label: 'MENA' },
      { type: 'text', label: 'HĽADANIE IČO' },
      { type: 'select', label: 'ROZBAĽOVACIA PONUKA' },
      { type: 'select', label: 'EDITOVATEĽNÝ VÝBER' },
      { type: 'select', label: 'VÝBER JEDNA MOŽNOSŤ' },
      { type: 'checkbox', label: 'ZAŠKRTÁVACIE POLÍČKO' },
      { type: 'select', label: 'VÝBER VIAC MOŽNOSTÍ' },
      { type: 'text', label: 'STATICKÝ ÚDAJ' },
      { type: 'email', label: 'E-MAIL' },
      { type: 'text', label: 'IBAN' },
      { type: 'checkbox', label: 'POVINNÝ SÚHLAS' },
      { type: 'text', label: 'PODPIS PRE TLAČ' },
      { type: 'textarea', label: 'WYSIWYG EDITOR' },
    ],
  },
  {
    key: 'calculations',
    title: 'Výpočty',
    items: [
      { type: 'number', label: 'SČÍTAC' },
      { type: 'number', label: 'NÁSOBIČ' },
      { type: 'number', label: 'PERCENTO' },
    ],
  },
  {
    key: 'budget',
    title: 'Rozpočet',
    items: [
      { type: 'text', label: 'PODSEKCIA' },
      { type: 'text', label: 'ROZPOČTOVÁ TABUĽKA' },
      { type: 'text', label: 'OPAKOVANIE ROZPOČTOVEJ TABUĽKY' },
      { type: 'text', label: 'DODATOČNÁ ÚROVEŇ ROZPOČTU' },
    ],
  },
  {
    key: 'sections',
    title: 'Sekcie',
    items: [
      { type: 'text', label: 'SEKCIA' },
      { type: 'text', label: 'PODSEKCIA' },
      { type: 'text', label: 'OPAKOVACIA PODSEKCIA' },
      { type: 'text', label: 'POPUP SEKCIA' },
      { type: 'text', label: 'ROZCESTNÍK' },
      { type: 'text', label: 'POLOŽKA ROZCESTNÍKA' },
      { type: 'text', label: 'OPAKOVACIA POLOŽKA ROZCESTNÍKA' },
    ],
  },
  {
    key: 'files',
    title: 'Súbory',
    items: [
      { type: 'text', label: 'ZOZNAM SÚBOROV' },
      { type: 'text', label: 'OBRÁZKY' },
    ],
  },
  {
    key: 'calendar',
    title: 'Kalendár',
    items: [
      { type: 'date', label: 'DÁTUM' },
      { type: 'text', label: 'ROZMEDZIE DÁTUMOV' },
      { type: 'text', label: 'MESIAC' },
    ],
  },
  {
    key: 'table-base',
    title: 'Tabuľka základné',
    items: [
      { type: 'text', label: 'TABUĽKA' },
      { type: 'text', label: 'TEXTOVÝ RIADOK' },
      { type: 'textarea', label: 'TEXTOVÉ OKNO' },
      { type: 'number', label: 'ČÍSLO' },
      { type: 'text', label: 'MENA' },
      { type: 'select', label: 'ROZBAĽOVACIA PONUKA' },
      { type: 'select', label: 'EDITOVATEĽNÝ VÝBER' },
      { type: 'checkbox', label: 'ZAŠKRTÁVACIE POLÍČKO' },
      { type: 'text', label: 'STATICKÝ ÚDAJ' },
      { type: 'text', label: 'ZOZNAM SÚBOROV' },
      { type: 'text', label: 'HĽADANIE IČO' },
      { type: 'email', label: 'E-MAIL' },
      { type: 'text', label: 'POPUP SEKCIA' },
    ],
  },
  {
    key: 'table-cal',
    title: 'Tabuľka kalendár',
    items: [
      { type: 'date', label: 'DÁTUM' },
      { type: 'text', label: 'ROZMEDZIE DÁTUMOV' },
      { type: 'text', label: 'MESIAC' },
    ],
  },
  {
    key: 'table-other',
    title: 'Tabuľka iné',
    items: [
      { type: 'text', label: 'ČÍSLO A RIADKU' },
      { type: 'text', label: 'UUID' },
      { type: 'text', label: 'RIADOK TABUĽKY' },
      { type: 'text', label: 'STATICKÝ TEXT' },
      { type: 'text', label: 'BUNKA TABUĽKY' },
    ],
  },
  {
    key: 'indicators',
    title: 'Indikátory',
    items: [
      { type: 'text', label: 'PLNENIE INDIKÁTOROV' },
      { type: 'text', label: 'VLASTNÉ INDIKÁTORY' },
      { type: 'text', label: 'SUMÁR INDIKÁTOROV' },
    ],
  },
  {
    key: 'advanced',
    title: 'Pokročilé funkcie',
    items: [
      { type: 'text', label: 'SKRYTÉ' },
      { type: 'text', label: 'SKRYTÝ DYNAMICKÁ HODNOTA' },
      { type: 'text', label: 'UUID' },
      { type: 'text', label: 'MAPA - ÚZEMIE' },
      { type: 'text', label: 'JS KÓD' },
      { type: 'text', label: 'VALIDAČNÝ PROVOK' },
      { type: 'text', label: 'VALIDAČNÝ KONTAINER' },
      { type: 'text', label: 'JS CALLBACK' },
      { type: 'text', label: 'TABUĽKA: JS CALLBACK' },
      { type: 'text', label: 'HĽADANIE V IMPORTE' },
      { type: 'text', label: 'HĽADANIE VO VLASTNÝCH DÁTACH' },
      { type: 'text', label: 'PDF GENERÁTOR' },
      { type: 'text', label: 'VLASTNÝ EXCEL IMPORT' },
    ],
  },
  {
    key: 'table-calc',
    title: 'Tabuľka výpočty',
    items: [
      { type: 'number', label: 'NÁSOBIČ' },
      { type: 'number', label: 'SČÍTAC' },
      { type: 'number', label: 'PERCENTO' },
    ],
  },
];

export default function FieldPalette({ onAdd }: FieldPaletteProps) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => (initial[cat.key] = true));
    return initial;
  });

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>, label: string, type: FormFieldType) => {
    event.dataTransfer.setData('application/form-field', type);
    event.dataTransfer.setData('text/plain', label);
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <section className="sidebar-section" aria-label="Palette polí">
      <span className="small-label">Typy formulárových položiek</span>

      {categories.map((cat) => (
        <div key={cat.key} className="category">
          <button
            type="button"
            className="category-header"
            aria-expanded={!!open[cat.key]}
            onClick={() => setOpen((s) => ({ ...s, [cat.key]: !s[cat.key] }))}
          >
            <span className="category-toggle" aria-hidden>☰</span>
            <span>{cat.title}</span>
            <span style={{ marginLeft: 'auto', opacity: 0.7 }}>{open[cat.key] ? '▾' : '▸'}</span>
          </button>

          {open[cat.key] && (
            <div className="category-items" role="list">
              {cat.items.map((item, idx) => (
                <button
                  key={`${cat.key}-${idx}`}
                  className="palette-item palette-item-large"
                  type="button"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.label, item.type)}
                  onClick={() => onAdd(item.type)}
                  title={`Pridať ${item.label}`}
                  aria-label={`Pridať ${item.label}`}
                >
                  <div style={{ width: '100%', textAlign: 'center' }}>{item.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
