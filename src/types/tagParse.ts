export type CategoryExplanations = {
  brand: string;
  materials: string;
  country: string;
};

/** Sub-scores from Supabase when the brand exists in the library (for results UI). */
export type BrandLibraryBreakdown = {
  libraryOverall: number;
  ethics: number;
  sustainability: number;
  transparency: number;
};

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
  /** Brand practices (library overall_brand_score) — ethics / sustainability / transparency blend. */
  brandScore?: number;
  /** Fiber sustainability (library), weighted by blend — used in overall. */
  materialScore: number;
  /** Fiber quality / hand-feel index (library), weighted by blend — used in overall. */
  materialQualityScore?: number;
  countryScore: number;
  overallScore: number;
  countryNote: string | null;
  brandName: string;
  /** Local file URI of the tag photo (for results UI). */
  tagImageUri: string | null;
  /** Which fields were not detected; user can add details to refine scoring. */
  missingFields: Partial<Record<FieldKey, true>>;
  /** Plain-language breakdown (Supabase-backed when data exists). */
  categoryExplanations: CategoryExplanations;
  /** Ethics / sustainability / transparency from library when brand row exists. */
  brandLibraryBreakdown?: BrandLibraryBreakdown | null;
};
