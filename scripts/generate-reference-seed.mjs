/**
 * Generates supabase/seed_reference_library.sql
 * Run: node scripts/generate-reference-seed.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(s) {
  return String(s).replace(/'/g, "''");
}

/** ~120 global apparel / footwear / luxury / fast-fashion names (lowercase for DB lookup) */
const BRAND_NAMES = [
  'nike',
  'adidas',
  'puma',
  'reebok',
  'new balance',
  'converse',
  'vans',
  'skechers',
  'asics',
  'mizuno',
  'fila',
  'kappa',
  'lululemon',
  'athleta',
  'columbia',
  'patagonia',
  'arcteryx',
  'salomon',
  'merrell',
  'timberland',
  'birkenstock',
  'crocs',
  'hunter',
  'dr martens',
  'hm',
  'zara',
  'uniqlo',
  'gap',
  'old navy',
  'banana republic',
  'jcrew',
  'madewell',
  'everlane',
  'anthropologie',
  'urban outfitters',
  'free people',
  'aritzia',
  'reformation',
  'allbirds',
  'outdoor voices',
  'shein',
  'primark',
  'asos',
  'boohoo',
  'missguided',
  'fashion nova',
  'forever 21',
  'american eagle',
  'aeropostale',
  'hollister',
  'abercrombie',
  'levis',
  'wrangler',
  'lee',
  'carhartt',
  'dickies',
  'calvin klein',
  'tommy hilfiger',
  'ralph lauren',
  'hugo boss',
  'gucci',
  'prada',
  'louis vuitton',
  'burberry',
  'chanel',
  'hermes',
  'versace',
  'armani',
  'diesel',
  'guess',
  'michael kors',
  'kate spade',
  'coach',
  'tory burch',
  'marc jacobs',
  'dkny',
  'tom ford',
  'balenciaga',
  'saint laurent',
  'bottega veneta',
  'fendi',
  'valentino',
  'moncler',
  'canada goose',
  'mackage',
  'woolrich',
  'barbour',
  'north face',
  'marmot',
  'mammut',
  'osprey',
  'under armour',
  'champion',
  'russell athletic',
  'starter',
  'ellesse',
  'superdry',
  'ted baker',
  'reiss',
  'cos',
  'arket',
  'other stories',
  'weekday',
  'pull bear',
  'bershka',
  'stradivarius',
  'massimo dutti',
  'oak fort',
  'uniqlo u',
  'muji',
  'kipling',
  'eastpak',
  'jansport',
  'herschel',
  'fjallraven',
  'roxy',
  'quiksilver',
  'billabong',
  'oneill',
  'volcom',
  'hurley',
  'element',
  'rvca',
  'nautica',
  'izod',
  'chaps',
  'dockers',
  'van heusen',
  'speedo',
  'arena',
  'tyr',
  'zoggs',
];

const NOTE_STYLES = [
  (n) =>
    `${cap(n)}: Large global brand; sustainability and labor reporting vary by region and product line—verify certifications for the item you bought.`,
  (n) =>
    `${cap(n)}: Fast-fashion or high-volume retailer; low prices can pressure factories and environmental targets; use score as directional only.`,
  (n) =>
    `${cap(n)}: Premium or luxury label; smaller runs can improve traceability, but leather, exotic materials, and subcontracting still need scrutiny.`,
  (n) =>
    `${cap(n)}: Outdoor or athletic focus; many publish climate goals—check materials (recycled vs virgin synthetics) for each garment.`,
  (n) =>
    `${cap(n)}: Denim or workwear heritage; water, chemistry, and dyeing impacts matter—look for third-party programs when available.`,
  (n) =>
    `${cap(n)}: Online-native brand; supply chain transparency and speed-to-market can be uneven; treat score as a starting point.`,
  (n) =>
    `${cap(n)}: Department-store or multi-brand context; policies depend on parent company and factory mix.`,
  (n) =>
    `${cap(n)}: Value segment; social and environmental performance varies widely by factory and country of cut-and-sew.`,
];

function cap(name) {
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Curated notes for well-known brands; others use NOTE_STYLES[hash % n]. */
const BRAND_NOTE_OVERRIDES = {
  nike:
    'Sportswear leader; publishes sustainability goals and some supplier disclosure—verify for the specific product you own.',
  adidas:
    'Major athletic brand; recycled materials and climate programs are public; factory conditions vary by country.',
  puma: 'Athletic and lifestyle; sustainability reporting exists; check materials and country of sewing.',
  reebok: 'Athletic heritage; now under Authentic Brands—programs vary; treat as directional.',
  'new balance': 'Some US manufacturing; most shoes still global; labor and materials vary by line.',
  converse: 'Canvas classics; rubber and cotton impacts; parent VF publishes responsibility goals.',
  vans: 'Skate/lifestyle; parent VF; synthetics and rubber in many styles.',
  skechers: 'Comfort footwear at volume; supply chain scale creates typical fast-retail pressure.',
  asics: 'Running focus; materials chemistry and durability tradeoffs; Asia-heavy manufacturing.',
  mizuno: 'Japanese athletic brand; smaller global footprint than Nike/Adidas; verify per item.',
  fila: 'Lifestyle and sport; licensed production common—traceability varies.',
  kappa: 'European sport heritage; global licensing; factory mix varies.',
  lululemon: 'Athleisure leader; publishes goals on chemistry and climate; synthetics common.',
  athleta: 'Gap Inc. women’s active; some recycled content programs; verify fabric blend.',
  columbia: 'Outdoor mass market; waterproofing chemistry varies; recycled content increasing.',
  patagonia:
    'Outdoor brand with strong environmental activism and repair programs; still verify each product’s materials.',
  arcteryx: 'Technical outerwear; DWR and membranes; premium pricing does not guarantee perfect traceability.',
  salomon: 'Outdoor performance; Amer Sports supply chains; chemistry and country vary.',
  merrell: 'Outdoor footwear; leather and rubber; parent Wolverine—programs vary.',
  timberland: 'Work and outdoor boots; leather tanning and adhesives matter; parent VF.',
  birkenstock: 'Footbed and leather; durability helps footprint per wear; verify leather source.',
  crocs: 'Foam clogs; fossil-based materials; some bio-content lines emerging.',
  hunter: 'Rubber boots; PVC/rubber chemistry; UK heritage with global manufacturing.',
  'dr martens': 'Leather boots; tanning and durability; global factory network.',
  hm: 'European fast fashion at scale; transparency initiatives exist—factory conditions vary by country.',
  zara: 'Inditex fast fashion; rapid turnaround; parent publishes sustainability programs—verify factory tier.',
  uniqlo: 'Volume basics; materials R&D and energy programs; labor varies by supplier country.',
  gap: 'Multi-brand US retailer; supplier codes published; performance varies by factory.',
  'old navy': 'Value line under Gap Inc.; high volume; same structural pressures as mass retail.',
  'banana republic': 'Gap Inc. premium-ish line; materials and sewing locations vary.',
  jcrew: 'US heritage retail; financial restructuring history; supplier mix changes over time.',
  madewell: 'Denim and casual; some sustainable cotton programs; verify each item.',
  everlane: 'Marketed transparency; compare marketing to third-party audits when possible.',
  anthropologie: 'URBN brand; eclectic sourcing; artisan vs mass-made varies by SKU.',
  'urban outfitters': 'URBN; young fashion; supply chain similar to other mid retailers.',
  'free people': 'URBN bohemian line; materials mix; verify fibers and country.',
  aritzia:
    'Canadian fashion retailer; publishes supplier expectations; factory-level conditions vary by product line.',
  reformation: 'Climate-focused marketing; mixed fibers; check actual blend and country on tag.',
  allbirds: 'Natural and low-carbon materials story; footwear supply chain still global.',
  'outdoor voices': 'Activewear brand; smaller scale than giants; materials vary by season.',
  shein:
    'Ultra-fast fashion e-commerce; very high volume and low prices create acute supply chain and sustainability pressure.',
  primark: 'Value mass retailer; low prices and high volume—expect supply chain pressure; score is directional.',
  asos: 'Online marketplace + own brand; supplier breadth makes consistency hard.',
  boohoo: 'UK online fast fashion; subcontracting and UK factory scandals have been reported—elevated scrutiny.',
  missguided: 'Online young fashion; similar structural issues to other ultra-fast brands.',
  'fashion nova': 'Influencer-led fast fashion; very rapid turnaround; supply chain opacity common.',
  'forever 21': 'US fast fashion; bankruptcy history; supplier churn—verify when possible.',
  'american eagle': 'Mall teen retail; denim programs exist; volume sourcing typical.',
  aeropostale: 'Mall basics; licensed international production; typical mass retail profile.',
  hollister: 'Abercrombie teen line; similar sourcing to parent; coastal manufacturing mix.',
  abercrombie: 'Teen retail; publishes supplier list in part; factory conditions vary.',
  levis: 'Denim heritage; Water<Less and worker programs public; finishing chemistry still matters.',
  wrangler: 'Kontoor denim; workwear; cotton and finishing impacts.',
  lee: 'Kontoor denim; similar to Wrangler; verify country and blend.',
  carhartt: 'Workwear; durability reduces per-use impact; heavy cotton and synthetics.',
  dickies: 'Work uniforms; polyester-cotton blends common; global sewing.',
  'calvin klein': 'PVH portfolio; licensing heavy; quality and ethics vary by licensee.',
  'tommy hilfiger': 'PVH; premium mass; supplier disclosure partial.',
  'ralph lauren': 'Luxury and polo mass; leather and cotton; subcontracting in luxury lines.',
  'hugo boss': 'German premium; publishes responsibility reporting; leather and wool supply chains.',
  gucci: 'Kering luxury; strong climate rhetoric; leather and exotic materials need scrutiny.',
  prada: 'Italian luxury; manufacturing partly in-house; subcontracting still exists.',
  'louis vuitton': 'LVMH leather goods; high margin; supply chain opacity in parts of sourcing.',
  burberry: 'UK heritage luxury; fur policy changed; check materials and country.',
  chanel: 'Private luxury; limited public supplier detail; leather and tweed supply chains.',
  hermes: 'Leather and silk leader; craftsmanship focus; animal and land impacts remain.',
  versace: 'Luxury fashion; licensing in accessories; verify product line.',
  armani: 'Italian luxury and diffusion lines; licensing broad—consistency varies.',
  diesel: 'Denim and premium casual; finishing chemistry; Italy and global sewing.',
  guess: 'US contemporary; subcontracting; labor issues have surfaced in supply chain historically.',
  'michael kors': 'Accessible luxury; licensed watches and bags; factory breadth.',
  'kate spade': 'Tapestry brand; bags and apparel; supplier codes improving.',
  coach: 'Tapestry leathergoods; publishes some supplier data.',
  'tory burch': 'Contemporary; foundation programs separate from manufacturing ethics.',
  'marc jacobs': 'Designer diffusion; licensing; verify each category.',
  dkny: 'G-III licensed; mass production of designer nameplate.',
  'tom ford': 'Luxury; small batch vs licensed beauty/eyewear differ.',
  balenciaga: 'Kering luxury; streetwear scale; synthetics and leather.',
  'saint laurent': 'Kering; leather and silk; supply chain similar to group peers.',
  'bottega veneta': 'Kering leather intrecciato; Italian manufacturing emphasis.',
  fendi: 'LVMH; fur policy evolving; leather supply chains.',
  valentino: 'Italian couture and RTW; subcontracting in some categories.',
  moncler: 'Down outerwear; animal welfare and traceability programs—verify certifications.',
  'canada goose': 'Down and fur heritage; traceability programs; animal ethics debated.',
  mackage: 'Premium outerwear; leather and down; verify fill and tanning.',
  woolrich: 'Outdoor heritage; wool and down; manufacturing globalized.',
  barbour: 'Waxed cotton; UK heritage; some overseas sewing.',
  'north face': 'VF outdoor; recycled polyester push; DWR chemistry varies.',
  marmot: 'Outdoor; same broad supply chain issues as peers.',
  mammut: 'Alpine technical; chemistry and membranes.',
  osprey: 'Bags; recycled fabrics increasing; Asia assembly.',
  'under armour': 'Athletic performance; synthetics-heavy; publishes some goals.',
  champion: 'Basics and fleece; HanesBrands; cotton and polyester at volume.',
  superdry: 'UK-Japanese style branding; global sourcing.',
  'ted baker': 'UK contemporary; licensing abroad; verify product category.',
  reiss: 'UK premium high street; smaller runs than fast fashion.',
  cos: 'H&M Group minimal design; materials better than HM entry line on average—still fast retail pace.',
  arket: 'H&M Group; materials focus; European manufacturing for some lines.',
  'other stories': 'H&M Group; varied sourcing.',
  weekday: 'H&M Group; denim and casual.',
  'pull bear': 'Inditex casual; similar structural notes as Zara.',
  bershka: 'Inditex young fashion; fast turnaround.',
  stradivarius: 'Inditex women’s; similar to Zara family.',
  'massimo dutti': 'Inditex premium basics; wool and leather lines.',
  'oak fort': 'Canadian minimal; smaller brand—verify each item.',
  muji: 'Japanese minimal; natural fibers in many categories; global manufacturing.',
  kipling: 'VF bags; nylon and synthetics.',
  eastpak: 'VF bags; recycled content increasing.',
  jansport: 'VF backpacks; polyester dominant.',
  herschel: 'Lifestyle bags; Asia manufacturing typical.',
  fjallraven: 'Outdoor; waxed cotton and wool; chemistry and down policies.',
  roxy: 'Boardsport women’s; Quiksilver family; synthetics common.',
  quiksilver: 'Boardsport; polyester swim and outerwear.',
  billabong: 'Board lifestyle; similar materials profile.',
  oneill: 'Surf; neoprene and synthetics.',
  volcom: 'Skate/surf; cotton and synthetics mix.',
  hurley: 'Nike-owned surf; neoprene and boardshorts.',
  element: 'Skate; cotton tees and synthetics outerwear.',
  rvca: 'Board lifestyle; artist collabs; mixed sourcing.',
  nautica: 'VF menswear; cotton knits and outerwear.',
  izod: 'PVH casual; licensed production.',
  chaps: 'Ralph Lauren licensed mass; typical department store profile.',
  dockers: 'Kontoor khakis; cotton and stretch blends.',
  'van heusen': 'PVH dress shirts; global sewing.',
  speedo: 'Swim; nylon/spandex; parent Pentland.',
  arena: 'Competitive swim; synthetics dominant.',
  tyr: 'Competitive swim; performance synthetics.',
  zoggs: 'Swim; similar to peers.',
};

function brandRow(name) {
  const h = hash(name);
  const e = 42 + (h % 38);
  const s = 40 + ((h >> 3) % 40);
  const t = 38 + ((h >> 7) % 42);
  const o = Math.round((e + s + t) / 3);
  const note = BRAND_NOTE_OVERRIDES[name] ?? NOTE_STYLES[h % NOTE_STYLES.length](name);
  return [name, e, s, t, o, note];
}

/** Major garment-export and manufacturing locations (risk = higher means more reported sector risk; edit to match your sources) */
const COUNTRIES = [
  ['Bangladesh', 66, 'Major garment exporter; wage and factory safety have been widely reported—risk reflects sector averages, not every facility.'],
  ['Cambodia', 58, 'Garment sector has documented labor and wage issues; unions and oversight vary by factory.'],
  ['China', 52, 'Huge manufacturing base; quality and labor conditions vary sharply by province and supplier tier.'],
  ['Vietnam', 50, 'Fast-growing apparel hub; labor costs rising; compliance improving in leading factories but uneven elsewhere.'],
  ['India', 54, 'Textile and garment clusters are diverse; informal work and subcontracting can hide conditions.'],
  ['Indonesia', 53, 'Large apparel sector; island geography and subcontracting complicate oversight.'],
  ['Pakistan', 56, 'Cotton and garment production; labor rights reporting varies by region and factory.'],
  ['Myanmar', 68, 'Political instability and labor protections have been weak; elevated manufacturing risk.'],
  ['Sri Lanka', 48, 'Established garment exporter; some factories meet high standards, others less so.'],
  ['Philippines', 49, 'Smaller apparel share than neighbors; conditions depend on factory and product type.'],
  ['Thailand', 46, 'Mixed manufacturing; migrant labor issues have been reported in parts of the sector.'],
  ['Malaysia', 47, 'Electronics and some apparel; migrant workforce governance has drawn scrutiny.'],
  ['Laos', 55, 'Growing garment sector; transparency and enforcement can lag larger neighbors.'],
  ['Mexico', 45, 'Nearshoring hub; USMCA context; labor reform ongoing—factory-level variance is high.'],
  ['Guatemala', 57, 'Apparel for export; wage and union issues have been reported in parts of the sector.'],
  ['Honduras', 58, 'Export processing zones common; labor advocacy has highlighted concerns in some plants.'],
  ['El Salvador', 56, 'Smaller garment base; conditions vary by buyer and factory.'],
  ['Nicaragua', 57, 'Apparel exports; political and labor context adds uncertainty.'],
  ['Haiti', 62, 'Economic stress and weak institutions raise labor and safety risk in parts of the sector.'],
  ['Dominican Republic', 51, 'Mixed apparel and free zones; some strong factories, others less transparent.'],
  ['Brazil', 48, 'Domestic market and some export; labor law exists but informal work persists in places.'],
  ['Colombia', 49, 'Growing nearshoring; region-specific labor issues in parts of manufacturing.'],
  ['Peru', 47, 'Cotton and alpaca supply chains; traceability varies by cooperative vs industrial mill.'],
  ['Argentina', 50, 'Smaller apparel export role; macro stress can affect factory stability.'],
  ['Morocco', 52, 'EU-facing apparel; labor standards enforcement varies.'],
  ['Tunisia', 53, 'Textile and apparel for Europe; economic pressure on wages has been reported.'],
  ['Egypt', 54, 'Cotton and garment; sector size brings uneven oversight across factories.'],
  ['Jordan', 51, 'Export zones for US/EU; migrant worker governance has had documented gaps.'],
  ['Ethiopia', 59, 'Rapid garment growth; low wages and union space have drawn international attention.'],
  ['Kenya', 55, 'Apparel for export; EPZ model—conditions depend heavily on buyer audits.'],
  ['Lesotho', 56, 'Small country, large garment share of exports; wage pressure and job volatility reported.'],
  ['Madagascar', 58, 'Apparel exports; institutional capacity for labor inspection can be limited.'],
  ['South Korea', 38, 'Higher-income manufacturing; fewer apparel cut-and-sew exports than in the past.'],
  ['Taiwan', 40, 'Advanced textiles; smaller garment sewing share, generally stronger labor institutions.'],
  ['Japan', 36, 'Domestic premium manufacturing; high labor standards relative to many apparel hubs.'],
  ['Portugal', 42, 'EU footwear and textiles; EU labor rules apply.'],
  ['Spain', 41, 'EU manufacturing; Inditex cluster—standards vary by tier.'],
  ['Italy', 39, 'Luxury leather and textiles; strong craft sector, subcontracting can still obscure traceability.'],
  ['Romania', 48, 'EU apparel sewing; wage competition with Western Europe.'],
  ['Bulgaria', 47, 'EU textile and apparel; similar dynamics to Romania.'],
  ['Poland', 44, 'EU manufacturing; labor rules strong; apparel share modest.'],
  ['Ukraine', 52, 'Conflict and disruption affect reliability and worker displacement—not only a labor-score issue.'],
  ['Moldova', 54, 'Apparel for EU; economic stress and emigration affect the sector.'],
  ['United States', 35, 'Smaller cut-and-sew share; labor law relatively strong where manufacturing remains.'],
  ['United Kingdom', 37, 'Limited mass apparel sewing; higher labor costs and regulation.'],
  ['Germany', 36, 'Machinery and technical textiles; not a low-cost sewing hub.'],
  ['France', 38, 'Luxury atelier work; different profile than mass garment export countries.'],
  ['Netherlands', 37, 'Design and logistics hub more than large-scale sewing.'],
  ['Belgium', 38, 'Small manufacturing base; EU standards.'],
  ['Ireland', 36, 'Minimal apparel sewing; high labor standards.'],
  ['Turkey', 49, 'Major EU-adjacent supplier; Syrian refugee workforce integration has been a documented issue in parts of textiles.'],
  ['Greece', 48, 'Smaller apparel sector; economic stress in past decade affected stability.'],
];

/** Common garment fibers (keys match normalizeMaterialKey / DB) */
const MATERIALS = [
  ['cotton', 62, 72, null, 'Conventional cotton uses a lot of water and often pesticides; organic or BCI-type programs score better.', 0],
  ['organic cotton', 78, 76, null, 'Avoids most synthetic pesticides; still uses water—better than conventional for many metrics.', 0],
  ['polyester', 38, 55, 'Synthetic; can feel less breathable and shed microfibers in washing.', 'Petroleum-based; energy-intensive; not biodegradable.', 0],
  ['recycled polyester', 52, 60, 'Still sheds microfibers; lower virgin oil use than standard polyester.', 'Depends on recycling quality and energy source.', 0],
  ['nylon', 42, 58, 'Strong synthetic; common in activewear.', 'Petroleum-based; energy-intensive.', 0],
  ['wool', 68, 80, null, 'Renewable animal fiber; land use, methane, and animal welfare vary by farm.', 0],
  ['linen', 72, 78, null, 'Flax-based; lower water than cotton for fiber in many studies; wrinkles easily.', 0],
  ['hemp', 75, 74, null, 'Fast-growing; often lower inputs than cotton—processing and softening steps matter.', 0],
  ['viscose', 48, 62, 'Wood-based rayon; chemical processing can harm workers and rivers if not managed.', 'Check for lyocell/modal processes or certified pulp when possible.', 0],
  ['modal', 58, 70, 'Usually softer than viscose; still chemical processing—source matters.', 'Wood pulp sourcing and chemical recovery matter for impact.', 0],
  ['lyocell', 68, 72, null, 'Closed-loop lyocell (e.g. Tencel-type) is often better than generic viscose.', 0],
  ['elastane', 35, 50, 'Adds stretch; almost always blended.', 'Petroleum-based; washing can release microfibers from synthetic blends.', 0],
  ['acrylic', 36, 52, 'Warm, wool-like synthetic; pills; not breathable like wool.', 'Petroleum-based; sheds microfibers.', 0],
  ['silk', 64, 82, null, 'Natural protein fiber; energy for rearing silkworms; animal ethics vary.', 0],
  ['cashmere', 58, 75, null, 'Soft wool; overgrazing in some regions has hurt land—quality and sourcing matter.', 0],
  ['alpaca', 66, 78, null, 'Often lower methane per kg than sheep in some studies; welfare and land use still count.', 0],
  ['down', 52, 70, 'Warmth-to-weight; insulation quality varies.', 'Live-plucking is unethical—certified traceable down is strongly preferred.', 0],
  ['leather', 45, 68, 'Durable; tanning chemistry and worker exposure are concerns.', 'Animal ethics and traceability vary by source.', 0],
  ['polyurethane', 34, 48, 'Coatings and faux leather.', 'Fossil-based; durability vs plastics tradeoffs.', 0],
  ['bamboo', 55, 65, 'Often rayon labeled bamboo; chemical process dominates footprint.', 'Verify whether it is mechanically processed bast fiber vs viscose rayon.', 0],
  ['rayon', 46, 60, 'Generic regenerated cellulose.', 'Similar cautions as viscose unless branded lyocell/modal with better chemistry.', 0],
  ['recycled wool', 70, 75, null, 'Extends fiber life; quality depends on blend and processing.', 0],
  ['angora', 50, 72, 'Animal welfare controversies; many brands have restricted sourcing.', 'Check certifications and brand policies before buying.', 0],
  ['mohair', 56, 76, null, 'Animal fiber; welfare and land use depend on farm practices.', 0],
  [
    'cupro',
    44,
    58,
    'Regenerated cellulose; chemical intensive—similar family to viscose.',
    'Similar to viscose; prefer closed-loop or certified chemistry when possible.',
    0,
  ],
];

function sqlBrands() {
  const rows = BRAND_NAMES.map((name) => {
    const [n, e, s, t, o, note] = brandRow(name);
    return `('${esc(n)}', ${e}, ${s}, ${t}, ${o}, '${esc(note)}')`;
  });
  return `-- Reference brands (${rows.length} rows)
INSERT INTO public.brands (name, ethics_score, sustainability_score, transparency_score, overall_brand_score, notes)
VALUES
${rows.join(',\n')}
ON CONFLICT (name) DO UPDATE SET
  ethics_score = excluded.ethics_score,
  sustainability_score = excluded.sustainability_score,
  transparency_score = excluded.transparency_score,
  overall_brand_score = excluded.overall_brand_score,
  notes = excluded.notes;

`;
}

function sqlCountries() {
  const rows = COUNTRIES.map(([n, r, note]) => `('${esc(n)}', ${r}, '${esc(note)}')`);
  return `-- Manufacturing countries (${rows.length} rows)
INSERT INTO public.countries (name, manufacturing_risk_score, note)
VALUES
${rows.join(',\n')}
ON CONFLICT (name) DO UPDATE SET
  manufacturing_risk_score = excluded.manufacturing_risk_score,
  note = excluded.note;

`;
}

function sqlMaterials() {
  const rows = MATERIALS.map(([n, s, q, h, sn, adj]) => {
    const hSql = h === null ? 'NULL' : `'${esc(h)}'`;
    const snSql = sn === null ? 'NULL' : `'${esc(sn)}'`;
    return `('${esc(n)}', ${s}, ${q}, ${hSql}, ${snSql}, ${adj})`;
  });
  return `-- Garment materials (${rows.length} rows)
INSERT INTO public.materials (name, sustainability_score, quality_score, health_note, sustainability_note, score_adjustment)
VALUES
${rows.join(',\n')}
ON CONFLICT (name) DO UPDATE SET
  sustainability_score = excluded.sustainability_score,
  quality_score = excluded.quality_score,
  health_note = excluded.health_note,
  sustainability_note = excluded.sustainability_note,
  score_adjustment = excluded.score_adjustment;

`;
}

const header = `-- YARN reference library (generated by scripts/generate-reference-seed.mjs)
-- Directional scores and notes—replace with your own research and sources.
-- Re-run: node scripts/generate-reference-seed.mjs

`;

const out = header + sqlBrands() + sqlCountries() + sqlMaterials();

const target = path.join(__dirname, '..', 'supabase', 'seed_reference_library.sql');
fs.writeFileSync(target, out, 'utf8');
console.log(`Wrote ${target} (${BRAND_NAMES.length} brands, ${COUNTRIES.length} countries, ${MATERIALS.length} materials)`);
