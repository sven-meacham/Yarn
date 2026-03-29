/**
 * Shared gentle reference calibration (0–100 scores and country risk).
 * Goals: lift the mid band so typical “okay” items read above ~50–55 without
 * flattening everyone near 100 (cap) or inverting order (monotonic).
 *
 * Used by generate-reference-seed.mjs and apply-gentle-lift-to-seed.mjs.
 */

/** @param {number} n */
export function gentleLiftScore(n) {
  const x = Math.max(0, Math.min(100, Math.round(Number(n))));
  // ~+4 pts at low-mid; a bit more as x rises; keeps spread
  const tilt = 4 + (x - 42) * 0.1;
  const out = Math.round(x + tilt);
  return Math.max(38, Math.min(94, out));
}

/**
 * Lower manufacturing risk = better for environment/labor in our model.
 * Gentle reduction so country *display* (100 − risk) gains a few points, not +20.
 * @param {number} risk
 */
export function gentleLiftRisk(risk) {
  const x = Math.max(0, Math.min(100, Math.round(Number(risk))));
  const reduction = 3 + Math.round((x - 40) * 0.06);
  return Math.max(28, Math.min(72, x - reduction));
}
