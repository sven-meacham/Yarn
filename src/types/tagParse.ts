export type FieldKey = 'brand' | 'materials' | 'country';

export type ParsedMaterial = { name: string; percent: number };

export type ParsedTag = {
  brand: string;
  materials: ParsedMaterial[];
  country: string;
};

export type FullScanResult = {
  parsed: ParsedTag;
  rawText: string;
  explanation: string;
  brandScore: number;
  materialScore: number;
  countryScore: number;
  overallScore: number;
  countryNote: string | null;
  brandName: string;
  /** Local file URI of the tag photo (for results UI). */
  tagImageUri: string | null;
  /** Which fields were not detected; user can add details to refine scoring. */
  missingFields: Partial<Record<FieldKey, true>>;
};
