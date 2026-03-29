-- Backfill short_description for every row in brands, materials, and countries.
-- Prerequisites: migration 20260328140000_add_short_descriptions.sql and reference data (e.g. seed_reference_library.sql).
-- Safe to re-run; overwrites short_description from current notes / sustainability_note / health_note / note.
-- Optional: run seed_short_descriptions_examples.sql after this to override specific rows with hand-tuned copy.

-- Brands: reference notes + pointer to scores (truncates long notes before the second sentence).
UPDATE public.brands
SET short_description = CASE
  WHEN COALESCE(trim(notes), '') = '' THEN
    'This entry is scored in our reference library using ethics, sustainability, and transparency. See Scores below for the breakdown.'
  WHEN length(trim(notes)) <= 280 THEN
    trim(notes) || ' Scores below reflect how this label ranks in our library on ethics, sustainability, and transparency.'
  ELSE
    left(trim(notes), 277) || '... Scores below reflect how this label ranks in our library on ethics, sustainability, and transparency.'
END;

-- Materials: sustainability + health notes, then pointer to scores (base text truncated so the suffix is never cut off).
UPDATE public.materials
SET short_description = CASE
  WHEN COALESCE(trim(sustainability_note), '') = '' AND COALESCE(trim(health_note), '') = '' THEN
    'This fiber is scored in our materials reference for sustainability and quality. See Scores for impact details.'
  ELSE
    (
      CASE
        WHEN length(
          trim(COALESCE(sustainability_note, '')) ||
          CASE WHEN COALESCE(trim(health_note), '') <> '' THEN ' ' || trim(health_note) ELSE '' END
        ) <= 380 THEN
          trim(COALESCE(sustainability_note, '')) ||
          CASE WHEN COALESCE(trim(health_note), '') <> '' THEN ' ' || trim(health_note) ELSE '' END
        ELSE
          left(
            trim(COALESCE(sustainability_note, '')) ||
            CASE WHEN COALESCE(trim(health_note), '') <> '' THEN ' ' || trim(health_note) ELSE '' END,
            377
          ) || '...'
      END
    ) || ' See Scores for sustainability and quality impact.'
END;

-- Countries: manufacturing note + pointer to scores.
UPDATE public.countries
SET short_description = CASE
  WHEN COALESCE(trim(note), '') = '' THEN
    'Manufacturing risk for this country is modeled in our reference library. See Scores and how this list works.'
  WHEN length(trim(note)) <= 300 THEN
    trim(note) || ' See Scores for how this affects manufacturing risk in our model.'
  ELSE
    left(trim(note), 297) || '... See Scores for how this affects manufacturing risk in our model.'
END;
