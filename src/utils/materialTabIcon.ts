import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Pick a simple Ionicons glyph for a material name (tops list). */
export function materialTabIcon(name: string): IconName {
  const n = name.toLowerCase();
  if (n.includes('cotton') || n.includes('hemp') || n.includes('linen')) return 'leaf-outline';
  if (n.includes('poly') || n.includes('nylon') || n.includes('acrylic')) return 'flask-outline';
  if (n.includes('wool') || n.includes('cashmere') || n.includes('alpaca') || n.includes('mohair'))
    return 'paw-outline';
  if (n.includes('silk')) return 'color-filter-outline';
  if (n.includes('leather') || n.includes('down')) return 'shirt-outline';
  if (n.includes('viscose') || n.includes('rayon') || n.includes('modal') || n.includes('lyocell'))
    return 'water-outline';
  return 'shirt-outline';
}
