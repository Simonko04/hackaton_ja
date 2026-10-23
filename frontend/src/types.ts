export type FormItemType =
  // Sekcie
  | "SECTION"
  | "SUB_SECTION"
  | "REPEATABLE_SECTION"
  | "POPUP_SECTION"
  | "SIGNPOST"
  | "SIGNPOST_ITEM"
  | "REPEATABLE_SIGNPOST_ITEM"
  // Základné polia
  | "SIMPLE_STRING"
  | "TEXT"
  | "WYSIWYG"
  | "NUMBER"
  | "CURRENCY"
  | "IBAN"
  | "EMAIL"
  | "SELECT"
  | "EDITABLE_SELECT"
  | "SINGLE_CHECKBOX"
  | "MULTIVALUE_CHECKBOX"
  | "DATE"
  | "DATE_RANGE"
  | "MONTH"
  | "COMPANY_SEARCH"
  | "FILE_LIST"
  | "IMAGES"
  | "REQUIRED_AGREEMENT"
  | "STATIC_STRING"
  | "SIGNATURE"
  // Výpočty
  | "SUM"
  | "PERCENT"
  // Rozpočet
  | "BUDGET"
  | "BUDGET_SECTION"
  | "BUDGET_REPEATABLE"
  | "BUDGET_EXTRA_LEVEL"
  // Tabuľka základné
  | "TABLE_LIST"
  | "TABLE_ITEM_STRING"
  | "TABLE_ITEM_TEXT"
  | "TABLE_ITEM_NUMBER"
  | "TABLE_ITEM_CURRENCY"
  | "TABLE_ITEM_SELECT"
  | "EDITABLE_TABLE_ITEM_SELECT"
  | "TABLE_ITEM_CHECKBOX"
  | "TABLE_ITEM_STATIC_MULTITEXT"
  | "TABLE_ITEM_EMAIL"
  | "TABLE_ITEM_POPUP_SECTION"
  // Tabuľka výpočty
  | "TABLE_ITEM_SUM"
  | "TABLE_ITEM_PRODUCT"
  | "TABLE_ITEM_PERCENT"
  // Tabuľka kalendár
  | "TABLE_ITEM_DATE"
  | "TABLE_ITEM_MONTH"
  // Tabuľka iné
  | "TABLE_ITEM_ROW_NUMBER"
  | "TABLE_ITEM_UUID"
  | "TABLE_ITEM_ROW"
  | "TABLE_ITEM_JS_CALLBACK"
  // Indikátory
  | "INDICATOR_FILL"
  | "INDICATOR_CUSTOM"
  | "INDICATOR_SUM"
  // Pokročilé funkcie
  | "HIDDEN"
  | "HIDDEN_DYNAMIC"
  | "UUID"
  | "MAP"
  | "JS_CODE"
  | "VALIDATION_ITEM"
  | "VALIDATION_CONTAINER"
  | "JS_CALLBACK"
  | "IMPORT_SEARCH"
  | "CUSTOM_DATA_SEARCH"
  | "PDF_GENERATOR"
  | "CUSTOM_EXCEL_IMPORT"








  | "HIDDEN"
  | "CALCULATED"
  | "LOOKUP"
  | "MATRIX"
  | "RATING"
  | "SLIDER"
  | "ADDRESS"
  | "SIGNATURE"
  | "PHONE"
  | "URL"
  | "COLOR"
  | "TOGGLE"
  | "CHECKBOX"
  | "RADIO"
  | "AUTOCOMPLETE"
  | "RICH_TEXT"
  | "CODE"
  | "IMAGE"
  | "VIDEO"
  | "DIVIDER"
  | "SPACER"
  | "HEADING"
  | "PARAGRAPH"
  | "WIZARD_SECTION"
  | "TAB_SECTION"
  | "GRID_SECTION"
  | "COLUMN_SECTION";
export type SelectOption = {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
  icon?: string;
  color?: string;
  group?: string;
};







export type ValidationRule = {
  type:
    | "required"
    | "min"
    | "max"
    | "minLength"
















    | "maxLength"
    | "pattern"
    | "email"
    | "url"
    | "iban"
    | "custom";
  value?: string | number | boolean;
  message?: string;
  pattern?: string;
};













export type ConditionalLogic = {
  action?: "show" | "hide" | "enable" | "disable" | "require" | "set_value";
  conditions?: Array<{
    field: string;
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "not_contains"
      | "greater_than"
      | "less_than"
      | "is_empty"
      | "is_not_empty"
      | "starts_with"
      | "ends_with"
      | "in"
      | "not_in";
    value?: string | number | boolean | string[] | number[];
  }>;
  logic?: "AND" | "OR";
  value?: string | number | boolean;
};



export type ColumnDefinition = {
  key: string;
  label: string;



  type: FormItemType;
  width?: number | string;
  mandatory?: boolean;
  config?: Record<string, unknown>;
  options?: SelectOption[];
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  hidden?: boolean;
};


























export type BudgetCategory = {
  id: string;
  label: string;
  description?: string;
  maxAmount?: number;
  currency?: string;




};




export type FileUploadConfig = {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  storageProvider?: string;
  uploadEndpoint?: string;
  previewEnabled?: boolean;
};

export type TableConfig = {
  columns?: ColumnDefinition[];
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
  removeRowLabel?: string;
  showRowNumbers?: boolean;
  allowReorder?: boolean;
  allowDuplicate?: boolean;
  summaryRow?: boolean;
  summaryConfig?: Record<string, "sum" | "avg" | "min" | "max" | "count">;
};

export type BudgetConfig = {
  categories?: BudgetCategory[];
  totalBudget?: number;
  currency?: string;
  allowOverride?: boolean;
  showSummary?: boolean;
  vatEnabled?: boolean;
  vatRate?: number;
};

export type SignpostConfig = {
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
  iconPosition?: "left" | "top" | "right";
};
      | "is_not_empty"
      | "starts_with"
      | "ends_with"
      | "in"
      | "not_in";
    value?: string | number | boolean | string[] | number[];
  }>;
  logic?: "AND" | "OR";
  value?: string | number | boolean;
};



export type ColumnDefinition = {
  key: string;
  label: string;



  type: FormItemType;
  width?: number | string;
  mandatory?: boolean;
  config?: Record<string, unknown>;
  options?: SelectOption[];
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  hidden?: boolean;
};


























export type BudgetCategory = {
  id: string;
  label: string;
  description?: string;
  maxAmount?: number;
  currency?: string;




};




export type FileUploadConfig = {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  storageProvider?: string;
  uploadEndpoint?: string;
  previewEnabled?: boolean;
};

export type TableConfig = {
  columns?: ColumnDefinition[];
  minRows?: number;
  maxRows?: number;
  addRowLabel?: string;
  removeRowLabel?: string;
  showRowNumbers?: boolean;
  allowReorder?: boolean;
  allowDuplicate?: boolean;
  summaryRow?: boolean;
  summaryConfig?: Record<string, "sum" | "avg" | "min" | "max" | "count">;
};

export type BudgetConfig = {
  categories?: BudgetCategory[];
  totalBudget?: number;
  currency?: string;
  allowOverride?: boolean;
  showSummary?: boolean;
  vatEnabled?: boolean;
  vatRate?: number;
};

export type SignpostConfig = {
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
  iconPosition?: "left" | "top" | "right";
};

export type SectionConfig = {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  columns?: 1 | 2 | 3 | 4;
  layout?: "vertical" | "horizontal" | "grid";
  repeatMin?: number;
  repeatMax?: number;
  addButtonLabel?: string;
  removeButtonLabel?: string;
  popupTitle?: string;
  popupWidth?: "sm" | "md" | "lg" | "xl" | "full";
  wizardSteps?: string[];
  tabLabels?: string[];
};

export type NumberConfig = {
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
  thousandsSeparator?: boolean;
  prefix?: string;
  suffix?: string;
  allowNegative?: boolean;
};

export type CurrencyConfig = {
  currency?: string;
  currencySymbol?: string;
  currencyPosition?: "prefix" | "suffix";
  min?: number;
  max?: number;
  decimalPlaces?: number;
  allowNegative?: boolean;
};

export type DateConfig = {
  dateFormat?: string;
  timeEnabled?: boolean;
  timeFormat?: "12h" | "24h";
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  disabledDays?: number[];
  defaultToToday?: boolean;
  rangeMin?: string;
  rangeMax?: string;
};

export type SelectConfig = {
  options?: SelectOption[];
  optionsSource?: "static" | "api" | "lookup";
  optionsEndpoint?: string;
  optionsLabelKey?: string;
  optionsValueKey?: string;
  allowSearch?: boolean;
  allowClear?: boolean;
  multiple?: boolean;
  maxSelections?: number;
  groupBy?: string;
  sortOptions?: boolean;
};

export type TextConfig = {
  minLength?: number;
  maxLength?: number;
  rows?: number;
  autoResize?: boolean;
  wordCount?: boolean;
  characterCount?: boolean;
  allowFormatting?: boolean;
};

export type FileListConfig = FileUploadConfig & {
  showFileList?: boolean;
  fileListLayout?: "list" | "grid";
  showFileSize?: boolean;
  showFileType?: boolean;
  showUploadDate?: boolean;
  allowRename?: boolean;
  allowDelete?: boolean;
};

export type CalculatedConfig = {
  formula?: string;
  dependencies?: string[];
  outputFormat?: "number" | "currency" | "text" | "date";
  decimalPlaces?: number;
  currency?: string;
};

export type LookupConfig = {
  source?: string;
  endpoint?: string;
  labelKey?: string;
  valueKey?: string;
  searchFields?: string[];
  displayFields?: string[];
  minSearchLength?: number;
  debounceMs?: number;
  mappings?: Array<{
    sourceField: string;
    targetField: string;
  }>;
};

export type MatrixConfig = {
  rows?: SelectOption[];
  columns?: SelectOption[];
  cellType?: "radio" | "checkbox" | "text" | "number" | "select";
  allowMultiple?: boolean;
};

export type RatingConfig = {
  maxRating?: number;
  icon?: "star" | "heart" | "thumb" | "circle" | "custom";
  customIcon?: string;
  allowHalf?: boolean;
  showLabel?: boolean;
  labels?: string[];
};

export type SliderConfig = {
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  showTicks?: boolean;
  tickInterval?: number;
  range?: boolean;
  orientation?: "horizontal" | "vertical";
};

export type AddressConfig = {
  fields?: Array<
    | "street"
    | "street2"
    | "city"
    | "region"
    | "postalCode"
    | "country"
  >;
  defaultCountry?: string;
  autocomplete?: boolean;
  mapEnabled?: boolean;
};

export type SignatureConfig = {
  width?: number;
  height?: number;
  backgroundColor?: string;
  penColor?: string;
  outputFormat?: "png" | "svg" | "base64";
};

export type CompanySearchConfig = {
  country?: string;
  searchEndpoint?: string;
  minSearchLength?: number;
  debounceMs?: number;
  displayFields?: string[];
  mappings?: Array<{
    sourceField: string;
    targetField: string;
  }>;
};

export type FormItemConfig =
  | TableConfig
  | BudgetConfig
  | SignpostConfig
  | SectionConfig
  | NumberConfig
  | CurrencyConfig
  | DateConfig
  | SelectConfig
  | TextConfig
  | FileListConfig
  | CalculatedConfig
  | LookupConfig
  | MatrixConfig
  | RatingConfig
  | SliderConfig
  | AddressConfig
  | SignatureConfig
  | CompanySearchConfig
  | Record<string, unknown>;

export type FormItem = {
  type: FormItemType;
  name: string;
  tag: string;
  mandatory?: boolean;
  heading?: string;
  description?: string;
  hint?: string;
  placeholder?: string;
  defaultValue?: string | number | boolean | string[] | number[] | null;
  readOnly?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  validations?: ValidationRule[];
  conditionalLogic?: ConditionalLogic[];
  config?: FormItemConfig;
  options?: SelectOption[];
  children?: FormItem[];
  columns?: ColumnDefinition[];
  cssClass?: string;
  style?: Record<string, string>;
  width?: "full" | "half" | "third" | "quarter" | number;
  order?: number;
  group?: string;
  icon?: string;
  tooltip?: string;
  labelPosition?: "top" | "left" | "right" | "hidden";
  labelWidth?: number | string;
  dataSource?: string;
  dataSourceConfig?: Record<string, unknown>;
  permissions?: {
    view?: string[];
    edit?: string[];
  };
  // UI only
  _id: string;
  _expanded?: boolean;
  _selected?: boolean;
  _dirty?: boolean;
  _error?: string;
  _parentId?: string;
  _depth?: number;
  _index?: number;
};

export type FormRoot = {
  type: "root";
  view_custom_template: string | null;
  diff_custom_template: string | null;
  diff_style: "default" | "track_changes" | "side_by_side";
  name?: string;
  description?: string;
  version?: string | number;
  locale?: string;
  theme?: string;
  layout?: "vertical" | "horizontal" | "grid";
  columns?: 1 | 2 | 3 | 4;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  showProgress?: boolean;
  progressStyle?: "bar" | "steps" | "percentage";
  allowDraft?: boolean;
  allowPrint?: boolean;
  allowExport?: boolean;
  validationMode?: "onSubmit" | "onChange" | "onBlur";
  permissions?: {
    view?: string[];
    edit?: string[];
    submit?: string[];
    delete?: string[];
  };
  metadata?: Record<string, unknown>;
  children: FormItem[];