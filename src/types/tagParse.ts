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
};
