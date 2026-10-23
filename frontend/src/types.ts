export type FormItemType =
  | "SECTION" | "SUB_SECTION" | "POPUP_SECTION"
  | "SIMPLE_STRING" | "TEXT" | "NUMBER" | "CURRENCY" | "IBAN" | "EMAIL"
  | "SELECT" | "MULTIVALUE_CHECKBOX" | "DATE" | "DATE_RANGE"
  | "TABLE_LIST" | "TABLE_ITEM_STRING" | "TABLE_ITEM_TEXT" | "TABLE_ITEM_NUMBER"
  | "TABLE_ITEM_CURRENCY" | "TABLE_ITEM_SELECT" | "TABLE_ITEM_ROW_NUMBER"
  | "BUDGET" | "BUDGET_SECTION"
  | "FILE_LIST" | "REQUIRED_AGREEMENT"
  | "SIGNPOST" | "SIGNPOST_ITEM"
  | "COMPANY_SEARCH" | "STATIC_STRING" | "HIDDEN";

export type FormItem = {
  type: FormItemType;
  name: string;
  tag: string;
  mandatory?: boolean;
  heading?: string;
  description?: string;
  hint?: string;
  placeholder?: string;
  config?: Record<string, unknown>;
  children?: FormItem[];
  // UI only
  _id: string;
  _expanded?: boolean;
};

export type FormRoot = {
  type: "root";
  view_custom_template: null;
  diff_custom_template: null;
  diff_style: "default";
  children: FormItem[];
};
