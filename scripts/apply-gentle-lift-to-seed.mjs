/**
 * One-shot: applies gentleLiftScore / gentleLiftRisk to supabase/seed_reference_library.sql
 * Preserves line structure and notes. Re-run after manual SQL edits if needed.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gentleLiftRisk, gentleLiftScore } from './score-calibration.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, '..', 'supabase', 'seed_reference_library.sql');

const lines = fs.readFileSync(target, 'utf8').split('\n');
const out = [];

let inBrands = false;
let inCountries = false;
let inMaterials = false;

for (const line of lines) {
  let next = line;

  if (line.includes('INSERT INTO public.brands')) {
    inBrands = true;
    inCountries = false;
    inMaterials = false;
  } else if (line.includes('INSERT INTO public.countries')) {
    inBrands = false;
    inCountries = true;
    inMaterials = false;
  } else if (line.includes('INSERT INTO public.materials')) {
    inBrands = false;
    inCountries = false;
    inMaterials = true;
  } else if (line.startsWith('ON CONFLICT')) {
    inBrands = false;
    inCountries = false;
    inMaterials = false;
  }

  if (inBrands && line.startsWith("('")) {
    const m = line.match(/^\('([^']*)', (\d+), (\d+), (\d+), (\d+), (.*)$/);
    if (m) {
      const [, name, e, s, t, _o, rest] = m;
      const e2 = gentleLiftScore(e);
      const s2 = gentleLiftScore(s);
      const t2 = gentleLiftScore(t);
      const o2 = Math.round((e2 + s2 + t2) / 3);
      next = `('${name}', ${e2}, ${s2}, ${t2}, ${o2}, ${rest}`;
    }
  } else if (inCountries && line.startsWith("('")) {
    const m = line.match(/^\('([^']*)', (\d+), (.*)$/);
    if (m) {
      const [, name, risk, rest] = m;
      const r2 = gentleLiftRisk(risk);
      next = `('${name}', ${r2}, ${rest}`;
    }
  } else if (inMaterials && line.startsWith("('")) {
    const m = line.match(/^\('([^']*)', (\d+), (\d+), (.*)$/);
    if (m) {
      const [, name, sus, qual, rest] = m;
      const s2 = gentleLiftScore(sus);
      const q2 = gentleLiftScore(qual);
      next = `('${name}', ${s2}, ${q2}, ${rest}`;
    }
  }

  out.push(next);
}

fs.writeFileSync(target, out.join('\n'), 'utf8');
console.log(`Updated ${target} with gentle calibration.`);
