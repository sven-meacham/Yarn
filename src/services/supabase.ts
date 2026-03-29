import { createClient } from '@supabase/supabase-js';

import { normalizeBrandForLookup } from '@/src/utils/brands';
import { normalizeMaterialKey } from '@/src/utils/materials';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn(
    'YARN: Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Add them to .env',
  );
}

export const supabase = createClient(url ?? '', anon ?? '');

export type BrandRow = {
  id: string;
  name: string;
  ethics_score: number;
  sustainability_score: number;
  transparency_score: number;
  overall_brand_score: number;
  notes: string | null;
  /** Two-sentence blurbs for Top detail — set in Supabase after migration. */
  short_description?: string | null;
};

export type MaterialRow = {
  id: string;
  name: string;
  sustainability_score: number;
  quality_score: number;
  health_note: string | null;
  sustainability_note: string | null;
  score_adjustment: number | null;
  short_description?: string | null;
};

export type CountryRow = {
  id: string;
  name: string;
  manufacturing_risk_score: number;
  note: string | null;
  short_description?: string | null;
};

export async function fetchBrandByName(name: string): Promise<BrandRow | null> {
  const normalized = normalizeBrandForLookup(name);
  if (!normalized) return null;
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('name', normalized)
    .maybeSingle();
  if (error) {
    console.warn('fetchBrandByName', error.message);
    return null;
  }
  return data as BrandRow | null;
}

export async function fetchMaterialByName(name: string): Promise<MaterialRow | null> {
  const normalized = normalizeMaterialKey(name);
  if (!normalized) return null;
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('name', normalized)
    .maybeSingle();
  if (error) {
    console.warn('fetchMaterialByName', error.message);
    return null;
  }
  return data as MaterialRow | null;
}

export async function fetchCountryByName(name: string): Promise<CountryRow | null> {
  const q = name.trim();
  if (!q) return null;
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .ilike('name', q)
    .maybeSingle();
  if (error) {
    console.warn('fetchCountryByName', error.message);
    return null;
  }
  return data as CountryRow | null;
}

export async function fetchBrandById(id: string): Promise<BrandRow | null> {
  if (!id?.trim()) return null;
  const { data, error } = await supabase.from('brands').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.warn('fetchBrandById', error.message);
    return null;
  }
  return data as BrandRow | null;
}

export async function fetchMaterialById(id: string): Promise<MaterialRow | null> {
  if (!id?.trim()) return null;
  const { data, error } = await supabase.from('materials').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.warn('fetchMaterialById', error.message);
    return null;
  }
  return data as MaterialRow | null;
}

export async function fetchCountryById(id: string): Promise<CountryRow | null> {
  if (!id?.trim()) return null;
  const { data, error } = await supabase.from('countries').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.warn('fetchCountryById', error.message);
    return null;
  }
  return data as CountryRow | null;
}

/** Top brands by overall score (higher = better). */
export async function fetchTopBrands(limit = 10): Promise<BrandRow[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('overall_brand_score', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('fetchTopBrands', error.message);
    return [];
  }
  return (data ?? []) as BrandRow[];
}

/** Top materials by sustainability score. */
export async function fetchTopMaterials(limit = 10): Promise<MaterialRow[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('sustainability_score', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('fetchTopMaterials', error.message);
    return [];
  }
  return (data ?? []) as MaterialRow[];
}

/** Best manufacturing countries = lowest manufacturing risk. */
export async function fetchTopCountries(limit = 10): Promise<CountryRow[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('manufacturing_risk_score', { ascending: true })
    .limit(limit);
  if (error) {
    console.warn('fetchTopCountries', error.message);
    return [];
  }
  return (data ?? []) as CountryRow[];
}
