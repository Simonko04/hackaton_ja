import React, { useState, useCallback } from "react";
import type { FormItem, FormItemType, FormRoot } from "./types";

function genId() { return Math.random().toString(36).slice(2, 9); }
function nameToTag(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
}
function stripUi(item: FormItem): object {
  const { _id, _expanded, children, ...rest } = item;
  return { ...rest, ...(children ? { children: children.map(stripUi) } : {}) };
}
function exportForm(items: FormItem[]): FormRoot {
  return { type:"root", view_custom_template:null, diff_custom_template:null, diff_style:"default", children: items.map(stripUi) };
}
function findItem(items: FormItem[], id: string): FormItem | null {
  for (const it of items) {
    if (it._id === id) return it;
    if (it.children) { const f = findItem(it.children, id); if (f) return f; }
  }
  return null;
}
function updateTree(items: FormItem[], id: string, patch: Partial<FormItem>): FormItem[] {
  return items.map(it => it._id === id ? { ...it, ...patch } : it.children ? { ...it, children: updateTree(it.children, id, patch) } : it);
}
function removeTree(items: FormItem[], id: string): FormItem[] {
  return items.filter(it => it._id !== id).map(it => it.children ? { ...it, children: removeTree(it.children, id) } : it);
}
function insertAt(items: FormItem[], targetId: string, newItem: FormItem, pos: 'before'|'after'|'inside'): FormItem[] {
  const result: FormItem[] = [];
  for (const item of items) {
    if (item._id === targetId) {
      if (pos === 'before') result.push(newItem, item);
      else if (pos === 'after') result.push(item, newItem);
      else result.push({ ...item, _expanded: true, children: [...(item.children ?? []), newItem] });
    } else {
      result.push(item.children ? { ...item, children: insertAt(item.children, targetId, newItem, pos) } : item);
    }
  }
  return result;
}

function moveItem(items: FormItem[], fromId: string, targetId: string, pos: 'before'|'after'|'inside'): FormItem[] {
  let moved: FormItem | null = null;
  function extract(nodes: FormItem[]): FormItem[] {
    return nodes
      .filter(n => { if (n._id === fromId) { moved = n; return false; } return true; })
      .map(n => n.children ? { ...n, children: extract(n.children) } : n);
  }
  const cleaned = extract(items);
  if (!moved) return items;
  return insertAt(cleaned, targetId, moved, pos);
}

function addToParent(items: FormItem[], parentId: string | null, newItem: FormItem): FormItem[] {
  if (!parentId) return [...items, newItem];
  return items.map(it => {
    if (it._id === parentId) return { ...it, _expanded: true, children: [...(it.children ?? []), newItem] };
    if (it.children) return { ...it, children: addToParent(it.children, parentId, newItem) };
    return it;
  });
}

// ===== PALETTE =====
const PALETTE: { cat: string; items: { type: FormItemType; label: string }[] }[] = [
  { cat: "Základné", items: [
    { type: "SIMPLE_STRING",        label: "Textový riadok" },
    { type: "TEXT",                 label: "Textové okno" },
    { type: "NUMBER",               label: "Číslo" },
    { type: "CURRENCY",             label: "Mena" },
    { type: "COMPANY_SEARCH",       label: "Hľadanie IČO" },
    { type: "SELECT",               label: "Rozbaľovacia ponuka" },
    { type: "EDITABLE_SELECT",      label: "Editovateľný výber" },
    { type: "SINGLE_CHECKBOX",      label: "Výber jedna možnosť" },
    { type: "MULTIVALUE_CHECKBOX",  label: "Výber viac možností" },
    { type: "STATIC_STRING",        label: "Statický údaj" },
    { type: "EMAIL",                label: "E-mail" },
    { type: "IBAN",                 label: "IBAN" },
    { type: "REQUIRED_AGREEMENT",   label: "Povinný súhlas" },
    { type: "SIGNATURE",            label: "Podpis pre tlač" },
    { type: "WYSIWYG",              label: "WYSIWYG editor" },
  ]},
  { cat: "Výpočty", items: [
    { type: "SUM",                  label: "Sčítač" },
    { type: "NUMBER",               label: "Násobič" },
    { type: "PERCENT",              label: "Percento" },
  ]},
  { cat: "Rozpočet", items: [
    { type: "BUDGET_SECTION",       label: "Podsekcia" },
    { type: "BUDGET",               label: "Rozpočtová tabuľka" },
    { type: "BUDGET_REPEATABLE",    label: "Opakovanie rozpočtovej tabuľky" },
    { type: "BUDGET_EXTRA_LEVEL",   label: "Dodatočná úroveň rozpočtu" },
  ]},
  { cat: "Sekcie", items: [
    { type: "SECTION",              label: "Sekcia" },
    { type: "SUB_SECTION",          label: "Podsekcia" },
    { type: "REPEATABLE_SECTION",   label: "Opakovacia podsekcia" },
    { type: "POPUP_SECTION",        label: "Popup sekcia" },
    { type: "SIGNPOST",             label: "Rozcestník" },
    { type: "SIGNPOST_ITEM",        label: "Položka rozcestníka" },
    { type: "REPEATABLE_SIGNPOST_ITEM", label: "Opakovacia položka rozcestníka" },
  ]},
  { cat: "Súbory", items: [
    { type: "FILE_LIST",            label: "Zoznam súborov" },
    { type: "IMAGES",               label: "Obrázky" },
  ]},
  { cat: "Kalendár", items: [
    { type: "DATE",                 label: "Dátum" },
    { type: "DATE_RANGE",           label: "Rozmedie dátumov" },
    { type: "MONTH",                label: "Mesiac" },
  ]},
  { cat: "Tabuľka základné", items: [
    { type: "TABLE_LIST",           label: "Tabuľka" },
    { type: "TABLE_ITEM_STRING",    label: "Textový riadok" },
    { type: "TABLE_ITEM_TEXT",      label: "Textové okno" },
    { type: "TABLE_ITEM_NUMBER",    label: "Číslo" },
    { type: "TABLE_ITEM_CURRENCY",  label: "Mena" },
    { type: "TABLE_ITEM_SELECT",    label: "Rozbaľovacia ponuka" },
    { type: "EDITABLE_TABLE_ITEM_SELECT", label: "Editovateľný výber" },
    { type: "TABLE_ITEM_CHECKBOX",  label: "Zaškrtávacie políčko" },
    { type: "STATIC_STRING",        label: "Statický údaj" },
    { type: "FILE_LIST",            label: "Zoznam súborov" },
    { type: "COMPANY_SEARCH",       label: "Hľadanie IČO" },
    { type: "EMAIL",                label: "E-mail" },
    { type: "POPUP_SECTION",        label: "Popup sekcia" },
  ]},
  { cat: "Tabuľka výpočty", items: [
    { type: "TABLE_ITEM_PRODUCT",   label: "Násobič" },
    { type: "TABLE_ITEM_SUM",       label: "Sčítač" },
    { type: "TABLE_ITEM_PERCENT",   label: "Percento" },
  ]},
  { cat: "Tabuľka kalendár", items: [
    { type: "TABLE_ITEM_DATE",      label: "Dátum" },
    { type: "TABLE_ITEM_MONTH",     label: "Mesiac" },
  ]},
  { cat: "Tabuľka iné", items: [
    { type: "TABLE_ITEM_ROW_NUMBER",label: "Číslo riadku" },
    { type: "TABLE_ITEM_UUID",      label: "UUID" },
    { type: "TABLE_ITEM_ROW",       label: "Riadok tabuľky" },
    { type: "TABLE_ITEM_STATIC_MULTITEXT", label: "Statický multitext" },
    { type: "TABLE_ITEM_JS_CALLBACK", label: "Bunka tabuľky" },
  ]},
  { cat: "Indikátory", items: [
    { type: "INDICATOR_FILL",       label: "Plnenie indikátorov" },
    { type: "INDICATOR_CUSTOM",     label: "Vlastné indikátory" },
    { type: "INDICATOR_SUM",        label: "Sumár indikátorov" },
  ]},
  { cat: "Pokročilé funkcie", items: [
    { type: "HIDDEN",               label: "Skryté" },
    { type: "HIDDEN_DYNAMIC",       label: "Skrytá dynamická hodnota" },
    { type: "UUID",                 label: "UUID" },
    { type: "MAP",                  label: "Mapa - územie" },
    { type: "JS_CODE",              label: "JS kód" },
    { type: "VALIDATION_ITEM",      label: "Validačný prvok" },
    { type: "VALIDATION_CONTAINER", label: "Validačný kontainer" },
    { type: "JS_CALLBACK",          label: "JS callback" },
    { type: "TABLE_ITEM_JS_CALLBACK", label: "Tabuľka: JS callback" },
    { type: "IMPORT_SEARCH",        label: "Hľadanie v importe" },
    { type: "CUSTOM_DATA_SEARCH",   label: "Hľadanie vo vlastných dátach" },
    { type: "PDF_GENERATOR",        label: "PDF generátor" },
    { type: "CUSTOM_EXCEL_IMPORT",  label: "Vlastný Excel import" },
  ]},
];

// ===== HELPERS =====
function mk(type: FormItemType, name: string, extra?: Partial<FormItem>): FormItem {
  const id = genId();
  const hasChildren = ["SECTION","SUB_SECTION","REPEATABLE_SECTION","POPUP_SECTION","SIGNPOST",
    "SIGNPOST_ITEM","REPEATABLE_SIGNPOST_ITEM","TABLE_LIST","BUDGET","BUDGET_SECTION"].includes(type);
  return { _id: id, _expanded: true, type, name, tag: nameToTag(name), heading: name,
    mandatory: false, config: { is_readonly: 0 }, ...(hasChildren ? { children: [] } : {}), ...extra };
}
function sec(name: string, children: FormItem[], extra?: Partial<FormItem>): FormItem {
  return { ...mk("SECTION", name), children, _expanded: true, ...extra };
}
function sub(name: string, children: FormItem[], extra?: Partial<FormItem>): FormItem {
  return { ...mk("SUB_SECTION", name), children, _expanded: true, ...extra };
}
function rep(name: string, children: FormItem[]): FormItem {
  return { ...mk("REPEATABLE_SECTION", name), children, _expanded: false };
}
function fld(type: FormItemType, name: string, extra?: Partial<FormItem>): FormItem {
  return { ...mk(type, name), ...extra };
}

// ===== DEFAULT STRUCTURE (z obrazka 3) =====
const INITIAL: FormItem[] = [
  sec("Informácie o organizácii", [
    fld("COMPANY_SEARCH", "IČO"),
    fld("SIMPLE_STRING",  "E-mail"),
    fld("SIMPLE_STRING",  "Web"),
    fld("SIMPLE_STRING",  "Bankové spojenie"),
    fld("IBAN",           "IBAN"),
  ]),
  sec("Údaje o oprávnených osobách", [
    sub("Štatutárny zástupca", [
      fld("SIMPLE_STRING", "Meno štatutárneho zástupcu"),
      fld("SIMPLE_STRING", "Email štatutárneho zástupcu"),
      fld("SIMPLE_STRING", "Telefón"),
    ]),
    fld("TEXT",           "Ciele"),
    fld("TEXT",           "Činnosť"),
    fld("NUMBER",         "Počet účastníkov"),
    fld("TEXT",           "Ľudské zdroje"),
    fld("SIMPLE_STRING",  "Známka ŠK"),
  ]),
  sec("Súhrnné informácie o projekte", [
    fld("SIMPLE_STRING",  "Názov"),
    sub("Kontaktná osoba", [
      fld("SIMPLE_STRING", "Zmluva"),
      fld("DATE",          "Dátum"),
      fld("SIMPLE_STRING", "Miesto"),
      fld("SIMPLE_STRING", "Adresa"),
      fld("SIMPLE_STRING", "Región"),
      fld("SIMPLE_STRING", "Verejnoprospešný účel"),
    ]),
    rep("Realizačný tím", [
      fld("SIMPLE_STRING", "Meno a priezvisko"),
      fld("SIMPLE_STRING", "Úloha"),
      fld("SIMPLE_STRING", "Organizácia"),
      fld("SIMPLE_STRING", "E-mail"),
      fld("SIMPLE_STRING", "Telefón"),
    ]),
    fld("TEXT",           "Zapojenie dobrovoľníkov"),
  ]),
  sec("Problémy, riešenia, očakávané výsledky", [
    fld("TEXT",  "Problém"),
    fld("TEXT",  "Nariešenia"),
    fld("TEXT",  "Riešenia"),
    fld("TEXT",  "Súvislosť"),
    fld("TEXT",  "Cieľová skupina"),
    fld("TEXT",  "Očakávané výsledky projektu"),
    fld("TEXT",  "Meranie"),
    fld("TEXT",  "Iná"),
    fld("TEXT",  "Dopad"),
  ]),
  sec("Podrobné informácie o aktivitách projektu", [
    fld("TEXT",  "Intro"),
    rep("Aktivity", [
      fld("SIMPLE_STRING", "Názov"),
      fld("DATE",          "Začiatok"),
      fld("DATE",          "Koniec"),
      fld("TEXT",          "Popis"),
      fld("TEXT",          "Predpoklad"),
    ]),
  ]),
  sec("Doplňujúce informácie", [
    fld("TEXT",  "Udržateľnosť"),
    fld("TEXT",  "Spolupracovníci"),
    sub("Propagácia", [
      fld("TEXT",          "Akým spôsobom"),
      fld("SIMPLE_STRING", "Kde"),
      fld("DATE",          "Dátum"),
    ]),
  ]),
  sec("Rozpočet", [
    fld("BUDGET",        "Rozpočet"),
    fld("TEXT",          "Komentár"),
    fld("CURRENCY",      "Minimum"),
    fld("CURRENCY",      "Verejné zdroje"),
    fld("CURRENCY",      "Podnikateľský príspevok"),
    fld("CURRENCY",      "Neziskoviny"),
    fld("CURRENCY",      "Individuálny darca"),
  ]),
  sec("Prílohy", [
    fld("FILE_LIST",     "Prílohy"),
  ]),
  sec("Čestné prehlásenia", [
    fld("REQUIRED_AGREEMENT", "Čestné prehlásenie", { config: { value: "Vyhlasujem, že všetky uvedené informácie sú pravdivé a úplné.", is_readonly: 0 } }),
  ]),
];

// ===== SECTION TYPE RULES =====
// Returns the effective type when dropped into a given parent context
function resolveDropType(paletteType: FormItemType, parentType: FormItemType | 'root'): FormItemType {
  if (paletteType === 'SECTION') {
    if (parentType === 'root') return 'SECTION';
    if (['SECTION','SUB_SECTION','REPEATABLE_SECTION'].includes(parentType as string)) return 'SUB_SECTION';
    return 'SUB_SECTION';
  }
  return paletteType;
}

// Returns whether a type can be dropped into a parent
function canDropInto(itemType: FormItemType, parentType: FormItemType | 'root'): boolean {
  switch (itemType) {
    case 'SECTION':       return parentType === 'root';
    case 'SUB_SECTION':   return ['SECTION','SUB_SECTION'].includes(parentType as string);
    case 'REPEATABLE_SECTION': return ['SECTION'].includes(parentType as string);
    case 'POPUP_SECTION': return ['SECTION','SUB_SECTION'].includes(parentType as string);
    case 'SIGNPOST':      return parentType !== 'root';
    case 'SIGNPOST_ITEM': return ['SIGNPOST'].includes(parentType as string);
    case 'REPEATABLE_SIGNPOST_ITEM': return ['SIGNPOST'].includes(parentType as string);
    default:              return parentType !== 'root';
  }
}

type Tab = "basic" | "help" | "condition" | "json";
type CondOp = "eq"|"neq"|"gt"|"lt"|"gte"|"lte"|"empty"|"notempty";
const OP_LABEL: Record<CondOp,string> = { eq:"je rovne", neq:"nie je rovne", gt:"vacsie ako", lt:"mensie ako", gte:"vacsie/rovne", lte:"mensie/rovne", empty:"je prazdne", notempty:"nie je prazdne" };

function condExpr(field: string, op: CondOp, val: string) {
  if (op==="empty") return `empty(${field})`;
  if (op==="notempty") return `notempty(${field})`;
  return `${op}(${field}, ${val})`;
}

// ===== PDF RENDERER =====
function PdfField({ item, selId, onSel, parentId, setActiveParentId }: {
  item: FormItem; selId: string;
  onSel: (id: string) => void;
  parentId: string;
  setActiveParentId: (id: string) => void;
}) {
  const isSel = item._id === selId;
  const cfg = (item.config ?? {}) as Record<string, unknown>;
  const vals = cfg.values as Record<string, string> | undefined;
  const click = () => { onSel(item._id); setActiveParentId(parentId); };

    if (item.type === "TABLE_LIST" || item.type === "BUDGET_SECTION") {
    const cols = item.children ?? [];
    return (
      <div className={"pdf-block" + (isSel ? " pdf-sel" : "")} onClick={click}>
        {item.heading && <div className="pdf-block-label" dangerouslySetInnerHTML={{ __html: item.heading }} />}
        <table className="pdf-table">
          <thead><tr>{cols.map(c => <th key={c._id}>{c.heading ?? c.name}</th>)}</tr></thead>
          <tbody><tr>{cols.map(c => <td key={c._id}>&nbsp;</td>)}</tr><tr>{cols.map(c => <td key={c._id}>&nbsp;</td>)}</tr></tbody>
        </table>
      </div>
    );
  }
    if (item.type === "BUDGET") {
    return (
      <div className={"pdf-block" + (isSel ? " pdf-sel" : "")} onClick={click}>
        <div className="pdf-block-label" dangerouslySetInnerHTML={{ __html: item.heading ?? item.name }} />
        <table className="pdf-table">
          <thead>
            <tr>
              <th>Položka</th>
              <th style={{width:120}}>{String(cfg.requested_sum_label ?? "Požadované")}</th>
              <th style={{width:120}}>{String(cfg.own_sum_label ?? "Vlastné zdroje")}</th>
              <th style={{width:120}}>Celkové náklady</th>
            </tr>
          </thead>
          <tbody>
            {(item.children ?? []).map(bs => (
              <React.Fragment key={bs._id}>
                <tr><td colSpan={4} className="pdf-budget-cat">{bs.name}</td></tr>
                <tr><td>&nbsp;</td><td>0,00 €</td><td>0,00 €</td><td>0,00 €</td></tr>
              </React.Fragment>
            ))}
            <tr className="pdf-budget-total"><td><strong>Spolu</strong></td><td>0,00 €</td><td>0,00 €</td><td>0,00 €</td></tr>
          </tbody>
        </table>
      </div>
    );
  }
    if (item.type === "FILE_LIST") {
    return (
      <div className={"pdf-row" + (isSel ? " pdf-sel" : "")} onClick={click}>
        <div className="pdf-row-label" dangerouslySetInnerHTML={{ __html: item.heading ?? item.name }} />
        <div className="pdf-row-val pdf-file-area">Priložiť súbor...</div>
      </div>
    );
  }
  if (item.type === "REQUIRED_AGREEMENT") {
    return (
      <div className={"pdf-agree" + (isSel ? " pdf-sel" : "")} onClick={click}>
        <div className="pdf-checkbox-sq"></div>
        <span>{String(cfg.value ?? item.heading ?? item.name)}</span>
      </div>
    );
  }
    if (item.type === "MULTIVALUE_CHECKBOX") {
    const options = Object.keys(vals ?? { "Možnosť A": "", "Možnosť B": "" });
    return (
      <div className={"pdf-block" + (isSel ? " pdf-sel" : "")} onClick={click}>
        {item.heading && <div className="pdf-block-label" dangerouslySetInnerHTML={{ __html: item.heading }} />}
        <table className="pdf-table">
          <tbody>{options.map(k => (
            <tr key={k}><td style={{width:24}}><div className="pdf-checkbox-sq"/></td><td>{k}</td></tr>
          ))}</tbody>
        </table>
      </div>
    );
  }
    if (item.type === "SIGNPOST") {
    const opts = item.children ?? [];
    return (
      <div className={"pdf-block" + (isSel ? " pdf-sel" : "")} onClick={click}>
        <div className="pdf-block-label" dangerouslySetInnerHTML={{ __html: item.heading ?? item.name }} />
        <table className="pdf-table"><tbody><tr>
          {opts.map(o => <td key={o._id}><div className="pdf-checkbox-sq" style={{display:"inline-block",marginRight:6}}/>{o.name}</td>)}
        </tr></tbody></table>
      </div>
    );
  }
    if (item.type === "COMPANY_SEARCH") {
    return (
      <div className={"pdf-block" + (isSel ? " pdf-sel" : "")} onClick={click}>
        <div className="pdf-row" style={{borderBottom:"1px solid #000"}}>
          <div className="pdf-row-label" dangerouslySetInnerHTML={{ __html: item.heading ?? "Vložte IČO" }} />
          <div className="pdf-row-val"></div>
        </div>
        {["Názov subjektu","Ulica a číslo","Obec","PSČ","IČO","IČ DPH","DIČ","Právna forma"].map(f => (
          <div key={f} className="pdf-row" style={{borderBottom:"1px solid #ccc"}}>
            <div className="pdf-row-label" style={{fontSize:"8pt",fontWeight:700}}>{f}</div>
            <div className="pdf-row-val"></div>
          </div>
        ))}
      </div>
    );
  }
    // TEXT - tall
    if (item.type === "TEXT" || item.type === "WYSIWYG") {
      const content = cfg.content as string | undefined;
      return (
        <div className={"pdf-row pdf-row-tall" + (isSel ? " pdf-sel" : "")} onClick={click}>
          <div className="pdf-row-label"><span dangerouslySetInnerHTML={{ __html: item.heading ?? item.name }} />{item.mandatory && <span className="pdf-req"> *</span>}</div>
          <div className="pdf-row-val" style={{minHeight: 80, color: content ? '#000' : '#ccc', whiteSpace: 'pre-wrap'}}>{content || ''}</div>
        </div>
      );
    }
    // DATE_RANGE - two cols
  if (item.type === "DATE_RANGE") {
    return (
      <div className={"pdf-row" + (isSel ? " pdf-sel" : "")} onClick={click}>
        <div className="pdf-row-label"><span dangerouslySetInnerHTML={{ __html: item.heading ?? item.name }} />{item.mandatory && <span className="pdf-req"> *</span>}</div>
        <div className="pdf-row-val" style={{display:"flex",gap:0}}>
          <div style={{flex:1,borderRight:"1px solid #ccc",padding:"3px 6px",fontSize:"8pt",color:"#aaa"}}>Od: DD.MM.RRRR</div>
          <div style={{flex:1,padding:"3px 6px",fontSize:"8pt",color:"#aaa"}}>Do: DD.MM.RRRR</div>
        </div>
      </div>
    );
  }
    // default single row
    const content = cfg.content as string | undefined;
    return (
      <div className={"pdf-row" + (isSel ? " pdf-sel" : "")} onClick={click}>
        <div className="pdf-row-label"><span dangerouslySetInnerHTML={{ __html: item.heading ?? item.name }} />{item.mandatory && <span className="pdf-req"> *</span>}</div>
        <div className="pdf-row-val" style={{color: content ? '#000' : '#ccc'}}>{content || ''}</div>
      </div>
    );
}

// A4 pri 96dpi = 1123px. Obsah stranky (bez paddingu 50+70=120px) = 1003px.
// Pouzivame 940px ako bezpecny threshold (s rezervou na okraje).
const A4_CONTENT_H = 940;

function estimateSecHeight(sec: FormItem): number {
  let h = 48; // nadpis sekcie
  for (const child of sec.children ?? []) {
    if (["SUB_SECTION","POPUP_SECTION"].includes(child.type)) {
      h += 24; // hlavička podsekcie
      for (const f of child.children ?? []) h += estimateFieldH(f);
    } else {
      h += estimateFieldH(child);
    }
  }
  if ((sec.children?.length ?? 0) === 0) h += 36;
  h += 16; // spodný okraj sekcie
  return h;
}

function estimateFieldH(item: FormItem): number {
  const content = item.config?.content as string | undefined;
  const contentLines = content ? Math.ceil(content.length / 55) : 0;
  switch (item.type) {
    case "TEXT": case "WYSIWYG": return Math.max(88, 28 + contentLines * 16);
    case "COMPANY_SEARCH": return 230;
    case "TABLE_LIST": return 60 + (item.children?.length ?? 2) * 22;
    case "BUDGET_SECTION": return 60 + (item.children?.length ?? 2) * 22;
    case "BUDGET": return 80 + (item.children?.length ?? 0) * 46;
    case "MULTIVALUE_CHECKBOX": return 28 + Object.keys((item.config?.values as Record<string,string>) ?? {"a":"","b":""}).length * 24;
    case "REQUIRED_AGREEMENT": return 30;
    case "SIGNPOST": return 52;
    case "FILE_LIST": case "IMAGES": return 44;
    case "DATE_RANGE": return 28;
    default: return 26;
  }
}

function PdfPages({ items, selId, onSel, setActiveParentId, savedIds }: {
  items: FormItem[]; selId: string;
  onSel: (id: string) => void;
  setActiveParentId: (id: string) => void;
  savedIds: Set<string>;
}) {
  // Pack sections into pages using height estimation
  const pages: FormItem[][] = [];
  let current: FormItem[] = [];
  let usedH = 0;

  for (const sec of items) {
    const h = estimateSecHeight(sec);
    // If section alone is taller than a page, give it its own page(s)
    if (usedH > 0 && usedH + h > A4_CONTENT_H) {
      pages.push(current);
      current = [];
      usedH = 0;
    }
    current.push(sec);
    usedH += h;
  }
  if (current.length > 0) pages.push(current);

  const total = pages.length;

  return (
    <>
      {pages.map((page, pi) => (
        <div key={pi} className="pdf-page">
          {page.map(sec => (
            <PdfSection
              key={sec._id} sec={sec} selId={selId}
              onSel={onSel} setActiveParentId={setActiveParentId}
              isUnsaved={!savedIds.has(sec._id)}
            />
          ))}
          <div className="pdf-page-num">Strana {pi + 1} / {total}</div>
        </div>
      ))}
    </>
  );
}

function PdfSection({ sec, selId, onSel, setActiveParentId, isUnsaved }: {
  sec: FormItem; selId: string;
  onSel: (id: string) => void;
  setActiveParentId: (id: string) => void;
  isUnsaved?: boolean;
}) {
  const isSel = sec._id === selId;
  const children = sec.children ?? [];
  return (
    <div className={"pdf-section" + (isSel ? " pdf-sel" : "") + (isUnsaved ? " pdf-unsaved" : "")}>
            <div className="pdf-section-title" onClick={() => { onSel(sec._id); setActiveParentId(sec._id); }}
        dangerouslySetInnerHTML={{ __html: (sec.heading ?? sec.name).toUpperCase() }}
      />
      <div className="pdf-fields-group">
        {children.map(child => {
          if (["SUB_SECTION","POPUP_SECTION"].includes(child.type)) {
            return (
              <div key={child._id} className={"pdf-subsection" + (child._id === selId ? " pdf-sel" : "")}>
                <div className="pdf-subsection-title" onClick={() => { onSel(child._id); setActiveParentId(child._id); }}
                    dangerouslySetInnerHTML={{ __html: (child.heading ?? child.name).toUpperCase() }}
                  />
                {(child.children ?? []).map(f => (
                  <PdfField key={f._id} item={f} selId={selId} onSel={onSel} parentId={child._id} setActiveParentId={setActiveParentId}/>
                ))}
              </div>
            );
          }
          return <PdfField key={child._id} item={child} selId={selId} onSel={onSel} parentId={sec._id} setActiveParentId={setActiveParentId}/>;
        })}
        {children.length === 0 && <div style={{padding:"12px",color:"#aaa",fontSize:"9pt",textAlign:"center"}}>— prázdna sekcia —</div>}
      </div>
    </div>
  );
}

// ===== LEGACY WIDGET (unused but keeps TS happy) =====
function FieldWidget({ item }: { item: FormItem }) {
  const cfg = (item.config ?? {}) as Record<string,unknown>;
  const vals = cfg.values as Record<string,string> | undefined;
  switch(item.type) {
    case "TEXT": return <textarea className="fw-textarea" rows={3} placeholder={item.placeholder ?? "Zadajte text..."} readOnly />;
    case "NUMBER": case "CURRENCY": return <input className="fw-input" type="number" placeholder="0" readOnly />;
    case "DATE": return <input className="fw-input" type="date" readOnly />;
    case "DATE_RANGE": return <div className="fw-row"><input className="fw-input" type="date" readOnly /><span>-</span><input className="fw-input" type="date" readOnly /></div>;
    case "IBAN": return <input className="fw-input" type="text" placeholder={item.placeholder ?? "SK00 0000 ..."} readOnly />;
    case "SELECT": return <select className="fw-input"><option>-- Vyberte --</option>{Object.keys(vals??{}).map(k=><option key={k}>{k}</option>)}</select>;
    case "MULTIVALUE_CHECKBOX": return <div className="fw-checks">{Object.keys(vals??{"Moznost A":"","Moznost B":""}).map(k=><label key={k} className="fw-chk"><input type="checkbox"/><span>{k}</span></label>)}</div>;
    case "FILE_LIST": return <div className="fw-file">Nahrat subor...</div>;
    case "REQUIRED_AGREEMENT": return <label className="fw-chk"><input type="checkbox"/><span>{String(cfg.value ?? "Souhlasim")}</span></label>;
    case "TABLE_LIST": return <div className="fw-table">Tabulka ({(item.children??[]).length} stlpcov)</div>;
    case "BUDGET": return <div className="fw-budget">Rozpocet</div>;
    case "SIGNPOST": return <div className="fw-signpost">Rozcestnik</div>;
    case "HIDDEN": return <div className="fw-hidden">Skryte pole</div>;
    case "COMPANY_SEARCH": return <div className="fw-ico"><input className="fw-input" type="text" placeholder="Zadajte ICO..." readOnly /><button className="fw-ico-btn">Hladat</button></div>;
    default: return <input className="fw-input" type="text" placeholder={item.placeholder ?? "Zadajte..."} readOnly />;
  }
}

const SECTION_TYPES: FormItemType[] = ["SECTION","SUB_SECTION","REPEATABLE_SECTION","POPUP_SECTION","TABLE_LIST","BUDGET","SIGNPOST","SIGNPOST_ITEM","REPEATABLE_SIGNPOST_ITEM","BUDGET_SECTION"];

export default function App() {
  const [items, setItems] = useState<FormItem[]>(INITIAL);
  const [selId, setSelId] = useState<string>("f1");
  const [activeParentId, setActiveParentId] = useState<string>("s1");
  const [palOpen, setPalOpen] = useState<Record<string,boolean>>({});
  const [showPalette, setShowPalette] = useState(false);
  const [dragging, setDragging] = useState<{ source: 'palette'|'tree'; type?: FormItemType; label?: string; itemId?: string }|null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; pos: 'before'|'after'|'inside' }|null>(null);
  const [tab, setTab] = useState<Tab>("basic");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("Vsetky zmeny su ulozene");
  const [condField, setCondField] = useState("");
  const [condOp, setCondOp] = useState<CondOp>("eq");
  const [condVal, setCondVal] = useState("");
  const [powerMode, setPowerMode] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const sel = findItem(items, selId);

  const upd = useCallback((patch: Partial<FormItem>) => {
    setItems(prev => updateTree(prev, selId, patch));
    setSaveMsg("Neulozene zmeny...");
  }, [selId]);

  const addItem = useCallback((type: FormItemType, label: string) => {
    // Resolve context-aware type (SECTION → SUB_SECTION when inside a SECTION)
    const parent = findItem(items, activeParentId);
    const parentType: FormItemType | 'root' = parent?.type ?? 'root';
    const resolvedType = resolveDropType(type, parentType);
    const isContainer = SECTION_TYPES.includes(resolvedType);
    const newItem: FormItem = {
      _id: genId(), type: resolvedType, name: label,
      tag: nameToTag(label), heading: label,
      mandatory: false, config: { is_readonly: 0 },
      ...(isContainer ? { children: [], _expanded: true } : {}),
    };
    // Sections go to root, fields go under activeParentId
    const targetParent = isContainer && resolvedType === 'SECTION' ? null : activeParentId;
    setItems(prev => addToParent(prev, targetParent, newItem));
    setSelId(newItem._id);
    setSaveMsg("Neuložené zmeny...");
  }, [activeParentId, items]);

  const removeItem = useCallback(() => {
    setItems(prev => removeTree(prev, selId));
    setSelId("");
    setSaveMsg("Neulozene zmeny...");
  }, [selId]);

  const save = useCallback(async () => {
    setSaving(true); setSaveMsg("Ukladam...");
    // Mark all current items as saved
    const allIds: string[] = [];
    function collectIds(nodes: FormItem[]) { nodes.forEach(n => { allIds.push(n._id); if (n.children) collectIds(n.children); }); }
    collectIds(items);
    try {
      const body = JSON.stringify({ name: "Formular vyzvy", schema: exportForm(items) });
      const res = await fetch("/api/templates", { method:"POST", headers:{"content-type":"application/json"}, body });
      setSaveMsg(res.ok ? "Vsetky zmeny su ulozene" : "Chyba pri ukladani");
      setSavedIds(new Set(allIds));
    } catch { setSaveMsg("Ulozene lokalne"); setSavedIds(new Set(allIds)); }
    finally { setSaving(false); }
  }, [items]);

  const exportJson = useCallback(() => {
    const json = JSON.stringify(exportForm(items), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'formular.json'; a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const importJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          const toItem = (node: Record<string, unknown>): FormItem => ({
            _id: genId(), _expanded: true,
            type: (node.type as FormItemType) ?? 'SIMPLE_STRING',
            name: String(node.name ?? ''),
            tag: String(node.tag ?? ''),
            heading: String(node.heading ?? node.name ?? ''),
            mandatory: Boolean(node.mandatory),
            placeholder: node.placeholder as string | undefined,
            description: node.description as string | undefined,
            hint: node.hint as string | undefined,
            config: (node.config as Record<string, unknown>) ?? {},
            children: Array.isArray(node.children) ? node.children.map(toItem) : undefined,
          });
          const loaded = Array.isArray(data.children) ? data.children.map(toItem) : [];
          setItems(loaded);
          setSaveMsg('Import dokonceny – uloz zmeny');
        } catch { alert('Neplatny JSON subor'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const downloadPdfDirect = useCallback(async () => {
    const el = document.getElementById('pdf-pages-root');
    if (!el) return;
    // Dynamically load html2pdf from CDN
    if (!(window as unknown as Record<string,unknown>)['html2pdf']) {
      await new Promise<void>((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        s.onload = () => res(); s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    const h2p = (window as unknown as Record<string, unknown>)['html2pdf'] as (arg?: unknown) => { set: (o: unknown) => { from: (el: HTMLElement) => { save: () => void } } };
    h2p().set({ margin:10, filename:'formular.pdf', html2canvas:{ scale:2, useCORS:true }, jsPDF:{ unit:'mm', format:'a4', orientation:'portrait' } }).from(el).save();
  }, []);

  const allTags = items.flatMap(function flat(it: FormItem): string[] {
    return [it.tag, ...(it.children?.flatMap(flat) ?? [])];
  });

  function renderLeftTree(nodes: FormItem[], depth = 0): React.ReactNode {
    return nodes.map(node => {
      const isSection = SECTION_TYPES.includes(node.type);
      const isSel = node._id === selId;
      const isActive = node._id === activeParentId;
      const icon = isSection ? (node._expanded ? "📂" : "📁") : "📄";
      const dt = dropTarget;
      const isDropInside = dt?.id === node._id && dt.pos === 'inside';
      return (
        <div key={node._id} className="ltree-node">
          {dt?.id === node._id && dt.pos === 'before' && <div className="drop-line" />}
          <div
              className={"ltree-item" + (isSel ? " ltree-sel" : "") + (isActive && isSection ? " ltree-active-parent" : "") + (isDropInside ? " drop-inside" : "") + (depth > 0 ? " ltree-child" : "")}
              style={{ paddingLeft: 10 + depth * 20, borderLeft: depth > 0 ? `2px solid rgba(42,48,69,${Math.min(0.4 + depth * 0.2, 1)})` : undefined }}
            draggable
            onDragStart={e => { e.stopPropagation(); setDragging({ source: 'tree', itemId: node._id }); e.dataTransfer.effectAllowed = 'move'; }}
            onDragEnd={() => { setDragging(null); setDropTarget(null); }}
            onDragOver={e => {
              e.preventDefault(); e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const y = e.clientY - rect.top;
              const h = rect.height;
              const pos = isSection && y > h * 0.25 && y < h * 0.75 ? 'inside' : y < h / 2 ? 'before' : 'after';
              setDropTarget({ id: node._id, pos });
            }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null); }}
            onDrop={e => {
              e.preventDefault(); e.stopPropagation();
              if (!dropTarget) return;
              if (dragging?.source === 'palette' && dragging.type) {
                const newItem: FormItem = { _id: genId(), type: dragging.type, name: dragging.label ?? dragging.type, tag: nameToTag(dragging.label ?? dragging.type), heading: dragging.label, mandatory: false, config: { is_readonly: 0 }, ...(SECTION_TYPES.includes(dragging.type) ? { children: [], _expanded: true } : {}) };
                setItems(prev => insertAt(prev, node._id, newItem, dropTarget.pos));
                setSelId(newItem._id);
              } else if (dragging?.source === 'tree' && dragging.itemId && dragging.itemId !== node._id) {
                setItems(prev => moveItem(prev, dragging.itemId!, node._id, dropTarget.pos));
              }
              setDragging(null); setDropTarget(null); setSaveMsg("Neulozene zmeny...");
            }}
            onClick={() => { setSelId(node._id); if (isSection) setActiveParentId(node._id); }}
          >
            {isSection && (
              <span className="ltree-exp" onClick={e => { e.stopPropagation(); setItems(prev => updateTree(prev, node._id, { _expanded: !node._expanded })); }}>
                {node._expanded ? "▼" : "▶"}
              </span>
            )}
            <span className="ltree-icon">{icon}</span>
            <span className="ltree-label">{node.name}</span>
            <button
              className="ltree-del"
              title={isSection ? "Zmazať sekciu aj s poliami" : "Zmazať pole"}
              onClick={e => {
                e.stopPropagation();
                const childCount = node.children?.length ?? 0;
                const msg = isSection && childCount > 0
                  ? `Naozaj chcete zmazať "${node.name}" aj so všetkými ${childCount} položkami vnútri? Táto akcia sa nedá vrátiť.`
                  : `Naozaj chcete zmazať "${node.name}"?`;
                if (!window.confirm(msg)) return;
                setItems(prev => removeTree(prev, node._id));
                if (selId === node._id) setSelId("");
                setSaveMsg("Neulozene zmeny...");
              }}
            >✕</button>
          </div>
          {dt?.id === node._id && dt.pos === 'after' && <div className="drop-line" />}
          {isSection && node._expanded && node.children && renderLeftTree(node.children, depth + 1)}
        </div>
      );
    });
  }

  function renderTree(nodes: FormItem[], depth = 0): React.ReactNode {
    return nodes.map(node => {
      const isSection = SECTION_TYPES.includes(node.type);
      const isSel = node._id === selId;
      return (
        <div key={node._id} style={{ marginLeft: depth * 12 }}>
          <button
            className={"tree-item" + (isSel ? " selected" : "") + (isSection ? " tree-section-item" : "")}
            onClick={() => { setSelId(node._id); if (isSection) setActiveParentId(node._id); }}
          >
            {isSection && <span className="tree-exp" onClick={e => { e.stopPropagation(); setItems(prev => updateTree(prev, node._id, { _expanded: !node._expanded })); }}>{node._expanded ? "v" : ">"}</span>}
            {!isSection && <span className="tree-bullet" />}
            <span className="tree-item-label">{node.name}</span>
            <span className="tree-item-tag">{node.tag}</span>
            {node.mandatory && <span className="tree-req">*</span>}
          </button>
          {isSection && node._expanded && node.children && renderTree(node.children, depth + 1)}
        </div>
      );
    });
  }

  function renderLiveSection(sec: FormItem): React.ReactNode {
    const isTopSel = sec._id === selId;
    return (
      <div key={sec._id} className={"live-section" + (isTopSel ? " live-sel" : "")} onClick={() => { setSelId(sec._id); setActiveParentId(sec._id); }}>
        <div className="live-sec-head">
          <span className="live-sec-title">{sec.heading ?? sec.name}</span>
          {sec.mandatory && <span className="live-req-badge">Povinne</span>}
        </div>
        {(sec.children ?? []).map(field => {
          const isSel = field._id === selId;
          const isSubSec = SECTION_TYPES.includes(field.type);
          if (isSubSec) return (
            <div key={field._id} className={"live-subsection" + (isSel ? " live-sel" : "")} onClick={e => { e.stopPropagation(); setSelId(field._id); setActiveParentId(field._id); }}>
              <div className="live-subsec-head">{field.heading ?? field.name}</div>
              {(field.children ?? []).map(sub => (
                <div key={sub._id} className={"live-field" + (sub._id === selId ? " live-sel" : "")} onClick={e => { e.stopPropagation(); setSelId(sub._id); setActiveParentId(field._id); }}>
                  <div className="live-field-label">{sub.heading ?? sub.name}{sub.mandatory && <span className="live-req"> *</span>}</div>
                  {sub.description && <div className="live-field-desc" dangerouslySetInnerHTML={{ __html: sub.description }} />}
                  <FieldWidget item={sub} />
                  {sub.hint && <div className="live-field-hint">{sub.hint}</div>}
                </div>
              ))}
            </div>
          );
          return (
            <div key={field._id} className={"live-field" + (isSel ? " live-sel" : "")} onClick={e => { e.stopPropagation(); setSelId(field._id); setActiveParentId(sec._id); }}>
              <div className="live-field-label">{field.heading ?? field.name}{field.mandatory && <span className="live-req"> *</span>}</div>
              {field.description && <div className="live-field-desc" dangerouslySetInnerHTML={{ __html: field.description }} />}
              <FieldWidget item={field} />
              {field.hint && <div className="live-field-hint">{field.hint}</div>}
            </div>
          );
        })}
        {(sec.children ?? []).length === 0 && (
          <div className="live-empty">Sem kliknite a potom pridajte pole z palety vlavo</div>
        )}
      </div>
    );
  }

  const downloadPdf_OLD = () => {
    const page = document.querySelector('.pdf-page') as HTMLElement;
    if (!page) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Formular</title><style>
      body { margin: 0; font-family: 'Times New Roman', serif; font-size: 11pt; }
      .pdf-page { padding: 40px 50px; }
      .pdf-section { margin-bottom: 24px; }
      .pdf-section-title { font-size: 13pt; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 12px; }
      .pdf-subsection { margin-bottom: 14px; }
      .pdf-subsection-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; background: #000; color: #fff; padding: 2px 8px; display: inline-block; margin-bottom: 0; }
      .pdf-field { display: flex; border: 1px solid #000; border-top: 0; min-height: 22px; }
      .pdf-field:first-of-type { border-top: 1px solid #000; }
      .pdf-field-label { font-size: 9pt; padding: 3px 6px; min-width: 160px; max-width: 220px; border-right: 1px solid #000; background: #f5f5f5; }
      .pdf-field-value { flex: 1; padding: 3px 6px; font-size: 9pt; color: #999; }
      .pdf-field-tall .pdf-field-value { min-height: 55px; }
      .pdf-field-full { flex-direction: column; }
      .pdf-field-full .pdf-field-label { max-width: none; border-right: 0; border-bottom: 1px solid #000; }
      .pdf-table { width: 100%; border-collapse: collapse; }
      .pdf-table th { font-size: 8pt; font-weight: 700; border: 1px solid #000; padding: 3px 5px; background: #f0f0f0; }
      .pdf-table td { font-size: 8pt; border: 1px solid #000; padding: 3px 5px; height: 20px; }
      .pdf-table-label { font-size: 9pt; font-weight: 700; margin-bottom: 3px; }
      .pdf-table-wrap { margin-bottom: 12px; }
      .pdf-budget-wrap { border: 1px solid #000; margin-bottom: 12px; }
      .pdf-budget-header { display: grid; grid-template-columns: 1fr 130px 130px 130px; border-bottom: 1px solid #000; }
      .pdf-budget-header span { font-size: 8pt; font-weight: 700; padding: 3px 5px; border-right: 1px solid #000; text-align: center; }
      .pdf-budget-section-name { font-size: 9pt; font-weight: 700; padding: 3px 8px; background: #f0f0f0; border-bottom: 1px solid #ccc; }
      .pdf-budget-row { display: grid; grid-template-columns: 1fr 130px 130px 130px; border-bottom: 1px solid #eee; min-height: 20px; }
      .pdf-budget-row span { font-size: 8pt; padding: 2px 5px; border-right: 1px solid #eee; color: #999; }
      .pdf-budget-total { display: flex; justify-content: space-between; padding: 5px 8px; background: #f5f5f5; font-weight: 700; font-size: 9pt; }
      .pdf-file-box { border: 1px solid #000; padding: 10px; min-height: 45px; font-size: 9pt; color: #999; margin-bottom: 12px; }
      .pdf-agreement { display: flex; align-items: flex-start; gap: 7px; padding: 5px 0; font-size: 9pt; border-bottom: 1px solid #ddd; }
      .pdf-checkbox-sq { width: 11px; height: 11px; border: 1.5px solid #000; flex-shrink: 0; margin-top: 1px; display: inline-block; }
      .pdf-signpost-wrap { border: 1px solid #000; margin-bottom: 12px; }
      .pdf-signpost-q { font-size: 9pt; font-weight: 700; padding: 5px 8px; border-bottom: 1px solid #ccc; }
      .pdf-signpost-opts { display: flex; }
      .pdf-signpost-opt { flex: 1; border-right: 1px solid #ccc; padding: 4px 8px; font-size: 9pt; }
      .pdf-req { color: #cc0000; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    </style></head><body><div class="pdf-page">${page.innerHTML}</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) { setTimeout(() => { w.print(); }, 800); }
  };

  return (
    <div className="formbuilder-app">
      <header className="topbar-shell">
        <div className="topbar-row">
          <div className="brand-area">
            <div className="brand-mark">F</div>
            <span className="brand-name">eGrant Builder</span>
          </div>
          <nav className="top-links">
            <span className="crumb">Formulare</span>
            <span className="crumb muted">&gt;</span>
            <span className="crumb active">Editor formulara</span>
          </nav>
          <div className="header-actions">
            <label className="power-toggle">
              <input type="checkbox" checked={powerMode} onChange={e => setPowerMode(e.target.checked)} />
              <span>Power mode</span>
            </label>
            <div className="save-chip">{saveMsg}</div>
            <button className="primary-btn" onClick={save} disabled={saving}>{saving ? "Ukladam..." : "Ulozit"}</button>
          </div>
        </div>
      </header>

      <div className="editor-shell">
        {/* LEFT PANEL 1: Palette */}
        <aside className="panel-palette">
          <div className="panel-head">Typy polí</div>
          <div className="pal-hint">Pridať do: <strong>{findItem(items, activeParentId)?.name ?? "—"}</strong></div>
          <div className="pal-scroll">
            {PALETTE.map(cat => (
              <div key={cat.cat} className="pal-cat">
                <button className="pal-cat-btn" onClick={() => setPalOpen(p => ({ ...p, [cat.cat]: !p[cat.cat] }))}>
                  <span>{palOpen[cat.cat] ? "▾" : "▸"}</span> {cat.cat}
                </button>
                {palOpen[cat.cat] && cat.items.map((it, i) => (
                  <button
                    key={i} className="pal-item"
                    draggable
                    onDragStart={e => { setDragging({ source: 'palette', type: it.type, label: it.label }); e.dataTransfer.effectAllowed = 'copy'; }}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => addItem(it.type, it.label)}
                    title={it.type}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* LEFT PANEL 2: Tree */}
        <aside className="panel-tree">
          <div className="panel-head">Štruktúra formulára</div>
          <div className="ltree-scroll">
            <div className="ltree-root-label">📋 Formulár</div>
            {renderLeftTree(items)}
          </div>
          <button className="ltree-new-sec" onClick={() => {
            const id = genId();
            setItems(prev => [...prev, { _id:id, _expanded:true, type:"SECTION", name:"Nova sekcia", tag:nameToTag("Nova sekcia "+id), heading:"Nova sekcia", config:{ add_print_pagebreak:0 }, children:[] }]);
            setActiveParentId(id); setSaveMsg("Neulozene zmeny...");
          }}>+ Nová sekcia</button>
        </aside>

        {/* CENTER: PDF Preview */}
        <main className="live-panel">
          <div className="live-toolbar">
            <span className="live-title">PDF náhľad</span>
            <span className="live-sub">Kliknite na pole → otvorí nastavenia vpravo&nbsp;&nbsp;•&nbsp;&nbsp;Takto bude vyzerať vytlačený formulár</span>
            <button className="pdf-export-btn" onClick={downloadPdfDirect}>&#128424; Stiahnuť PDF</button>
            <button className="pdf-export-btn" onClick={exportJson} style={{marginLeft:6}}>&#8595; Export JSON</button>
            <button className="pdf-export-btn" onClick={importJson} style={{marginLeft:6}}>&#8593; Import JSON</button>
          </div>
          <div className="live-scroll">
            <div id="pdf-pages-root" className="pdf-pages-root">
              {items.filter(it => it.type === "SECTION").length === 0 ? (
                <div className="pdf-page">
                  <div className="pdf-empty-hint">
                    <h3>Formulár je prázdny</h3>
                    <p>Pridať sekciu tlačidlom nižšie,<br />potom pretiahnuť polia z palety vľavo do stromu.</p>
                  </div>
                </div>
              ) : (
                <PdfPages
                  items={items.filter(it => it.type === "SECTION")}
                  selId={selId}
                  onSel={setSelId}
                  setActiveParentId={setActiveParentId}
                  savedIds={savedIds}
                />
              )}
            </div>
            <button className="pdf-add-sec" onClick={() => {
              const id = genId();
              setItems(prev => [...prev, { _id:id, _expanded:true, type:"SECTION", name:"Nova sekcia", tag:nameToTag("Nova sekcia " + id), heading:"Nova sekcia", config:{ add_print_pagebreak:0 }, children:[] }]);
              setActiveParentId(id); setSaveMsg("Neulozene zmeny...");
            }}>+ Pridat sekciu</button>
          </div>
        </main>

        {/* RIGHT: Settings + Tree */}
        <aside className="sidebar right-sidebar">
          {/* field settings */}
          {sel ? (
            <div className="settings-panel">
              <div className="settings-head">
                <div>
                  <div className="settings-name">{sel.name}</div>
                  <div className="settings-type">{sel.type} · tag: <code>{sel.tag}</code></div>
                </div>
                <button className="del-btn" onClick={removeItem} title="Odstranit">✕</button>
              </div>

              <div className="tab-row">
                {(["basic","help","condition"] as Tab[]).map(t => (
                    <button key={t} className={"tab" + (tab===t ? " active" : "")} onClick={() => setTab(t)}>
                      {t==="basic" ? "Základné údaje" : t==="help" ? "Pomocné texty" : "Podmienka"}
                    </button>
                  ))}
                  <button className={"tab" + (tab==="json" ? " active" : "")} onClick={() => setTab("json")}>JSON</button>
              </div>

              {tab === "basic" && (
                <div className="settings-body">
                  <div className="sg">
                    <label>Typ</label>
                    <input value={sel.type} readOnly className="tag-input" />
                  </div>
                  <div className="sg">
                    <label>Interný názov</label>
                    <input value={sel.name} onChange={e => upd({ name: e.target.value })} />
                  </div>
                  <div className="sg">
                    <label>Tag <span className="tag-lock">🔒 nemeniteľný po vytvorení</span></label>
                    <input value={sel.tag} readOnly className="tag-input" />
                    <div className="tag-example">Použitie v šablóne: <code>{`{{${sel.tag}}}`}</code></div>
                  </div>
                  <div className="sg-check">
                    <label><input type="checkbox" checked={!!sel.mandatory} onChange={e => upd({ mandatory: e.target.checked })} /> Povinná položka</label>
                    <label><input type="checkbox" checked={!!(sel.config?.recommended)} onChange={e => upd({ config: { ...(sel.config ?? {}), recommended: e.target.checked } })} /> Odporúčaná</label>
                    <label><input type="checkbox" checked={!!(sel.config?.personal_data)} onChange={e => upd({ config: { ...(sel.config ?? {}), personal_data: e.target.checked } })} /> Osobný údaj</label>
                  </div>
                  <div className="sg">
                    <label>Názov <span className="field-note">(nadpis v dokumente)</span></label>
                    <input value={sel.heading ?? ""} onChange={e => upd({ heading: e.target.value })} />
                  </div>
                  <div className="sg">
                    <label>Zdrojový tag</label>
                    <input value={(sel.config?.source_tag as string) ?? ""} onChange={e => upd({ config: { ...(sel.config ?? {}), source_tag: e.target.value } })} placeholder="napr. nazov_projektu" />
                  </div>
                  <div className="sg expr-group">
                    <label>Výraz pre zobrazenie v prehľadoch</label>
                    <input value={(sel.config?.expr_overview as string) ?? ""} onChange={e => upd({ config: { ...(sel.config ?? {}), expr_overview: e.target.value } })} />
                  </div>
                  <div className="sg expr-group">
                    <label>Výraz pre zobrazenie vo formulári</label>
                    <input value={(sel.config?.show_when as string) ?? ""} onChange={e => upd({ config: { ...(sel.config ?? {}), show_when: e.target.value } })} />
                  </div>
                  <div className="sg expr-group">
                    <label>Výraz pre zapnutie validácie</label>
                    <input value={(sel.config?.expr_validate as string) ?? ""} onChange={e => upd({ config: { ...(sel.config ?? {}), expr_validate: e.target.value } })} />
                  </div>
                  <div className="sg expr-group">
                    <label>Výraz pre zapnutie povinnosti</label>
                    <input value={(sel.config?.expr_mandatory as string) ?? ""} onChange={e => upd({ config: { ...(sel.config ?? {}), expr_mandatory: e.target.value } })} />
                  </div>
                                    <div className="sg">
                    <label>Obsah <span className="field-note">(text viditeľný v PDF náhľade)</span></label>
                    <textarea rows={3} value={(sel.config?.content as string) ?? ""} onChange={e => upd({ config: { ...(sel.config ?? {}), content: e.target.value } })} placeholder="Zadajte text, ktorý sa zobrazí v PDF..." />
                  </div>
                  <div className="sg">
                    <label>Placeholder <span className="field-note">(nápoveda vo formulári, nie v PDF)</span></label>
                    <input value={sel.placeholder ?? ""} onChange={e => upd({ placeholder: e.target.value })} placeholder="Napr.: Zadajte hodnotu..." />
                  </div>
                  {sel.type === "SELECT" && (
                    <div className="sg">
                      <label>Moznosti (kazdu na novy riadok, format: klic=popis)</label>
                      <textarea rows={5}
                        value={Object.entries((sel.config?.values as Record<string,string>|undefined) ?? {}).map(([k,v]) => `${k}=${v}`).join("\n")}
                        onChange={e => {
                          const vals: Record<string,string> = {};
                          e.target.value.split("\n").forEach(l => { const [k,...rest]=l.split("="); if(k.trim()) vals[k.trim()]=rest.join("=").trim(); });
                          upd({ config: { ...(sel.config ?? {}), values: vals } });
                        }}
                      />
                    </div>
                  )}
                  {sel.type === "TEXT" && (
                    <div className="sg">
                      <label>Max znakov</label>
                      <input type="number" value={String((sel.config?.max_chars as number|undefined) ?? "")} onChange={e => upd({ config: { ...(sel.config ?? {}), max_chars: Number(e.target.value) } })} />
                    </div>
                  )}
                  <div className="sg-check">
                    <label><input type="checkbox" checked={!!sel.mandatory} onChange={e => upd({ mandatory: e.target.checked })} /> Povinne pole</label>
                    <label><input type="checkbox" checked={!(sel.config?.is_readonly)} onChange={e => upd({ config: { ...(sel.config ?? {}), is_readonly: e.target.checked ? 0 : 1 } })} /> Editovatelne</label>
                  </div>
                </div>
              )}

              {tab === "help" && (
                <div className="settings-body">
                  <div className="sg">
                    <label>Popis <span className="field-note">(zobrazí sa pod názvom poľa)</span></label>
                    <textarea rows={4} value={sel.description ?? ""} onChange={e => upd({ description: e.target.value })} placeholder="Napr.: Zadajte platné IČO vašej organizácie" />
                  </div>
                  <div className="sg">
                    <label>Nápoveda <span className="field-note">(zobrazí sa ako tooltip/hint)</span></label>
                    <textarea rows={3} value={sel.hint ?? ""} onChange={e => upd({ hint: e.target.value })} placeholder="Napr.: Zaokrúhlite na celé číslo" />
                  </div>
                  <div className="sg">
                    <label>Testová hodnota</label>
                    <input value={(sel.config?.test_value as string) ?? ""} onChange={e => upd({ config: { ...(sel.config ?? {}), test_value: e.target.value } })} placeholder="Hodnota pre testovanie šablón" />
                  </div>
                </div>
              )}

              {tab === "condition" && (
                <div className="settings-body">
                  <p className="cond-intro">Nastavte kedy sa toto pole zobrazuje. Podmienka sa ulozi ako vyraz kompatibilny s eGrant.</p>
                  <div className="cond-builder">
                    <div className="sg">
                      <label>Pole</label>
                      <select value={condField} onChange={e => setCondField(e.target.value)}>
                        <option value="">-- Vyberte pole --</option>
                        {allTags.filter(t => t !== sel.tag).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="sg">
                      <label>Podmienka</label>
                      <select value={condOp} onChange={e => setCondOp(e.target.value as CondOp)}>
                        {Object.entries(OP_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    {condOp !== "empty" && condOp !== "notempty" && (
                      <div className="sg">
                        <label>Hodnota</label>
                        <input value={condVal} onChange={e => setCondVal(e.target.value)} placeholder="napr. 5000" />
                      </div>
                    )}
                    <div className="cond-preview">
                      Vyraz: <code>{condField ? condExpr(condField, condOp, condVal) : "—"}</code>
                    </div>
                    <button className="apply-cond-btn" disabled={!condField} onClick={() => {
                      const expr = condExpr(condField, condOp, condVal);
                      upd({ config: { ...(sel.config ?? {}), show_when: expr } });
                    }}>Pouzit podmienku</button>
                    {sel.config?.show_when && (
                      <div className="cond-active">
                        Aktivna podmienka: <code>{String(sel.config.show_when)}</code>
                        <button className="cond-clear" onClick={() => { const cfg = { ...(sel.config ?? {}) }; delete cfg.show_when; upd({ config: cfg }); }}>Odstranit</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === "json" && (
                <div className="settings-body">
                  <pre className="json-preview">{JSON.stringify(stripUi(sel), null, 2)}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="settings-empty">Kliknite na pole v strede pre jeho editaciu</div>
          )}
        </aside>
      </div>
    </div>
  );
}


