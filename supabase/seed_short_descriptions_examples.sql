-- Run after migration 20260328140000_add_short_descriptions.sql
-- For every row at once, run seed_short_descriptions_all.sql first (derived from notes columns).
-- This file is optional hand-tuned overrides; run it after seed_short_descriptions_all.sql if you use it.
-- Edit copy anytime in Supabase Table Editor → short_description

-- Materials (examples)
UPDATE public.materials
SET short_description = 'Grown without most synthetic pesticides, organic cotton usually scores better for soil and farm workers than conventional cotton. It still uses water and energy, so we pair it with a full sustainability score in the library.'
WHERE name = 'organic cotton';

UPDATE public.materials
SET short_description = 'Conventional cotton is soft and common, but growing it often uses a lot of water and pesticides. Our score reflects that tradeoff versus greener options like organic or recycled fibers.'
WHERE name = 'cotton';

UPDATE public.materials
SET short_description = 'Polyester is durable and cheap, but it is oil-based, energy-intensive to make, and can shed microfibers when washed. It ranks lower on sustainability than most natural fibers in our model.'
WHERE name = 'polyester';

-- Country (example)
UPDATE public.countries
SET short_description = 'Japan has strong labor institutions and a smaller share of cut-and-sew than many apparel hubs. The risk index here is lower than in many high-volume garment exporters.'
WHERE name = 'Japan';

-- Brand (example)
UPDATE public.brands
SET short_description = 'Birkenstock is known for durable footwear and published responsibility goals; leather sourcing still matters for each product. The overall score blends ethics, sustainability, and transparency in our library.'
WHERE name = 'birkenstock';
