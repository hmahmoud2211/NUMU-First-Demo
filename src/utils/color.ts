/** Small colour helpers for illustration shading (hex in, hex/rgba out). */
type Rgb = [number, number, number];

function toRgb(hex: string): Rgb {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.replace(/(.)/g, '$1$1') : raw.slice(0, 6);
  const value = parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, '0')).join('')}`;
}

/** Blends `from` towards `to` by `amount` (0–1). */
function mix(from: string, to: string, amount: number): string {
  const a = toRgb(from);
  const b = toRgb(to);
  return toHex([a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount]);
}

export function lighten(hex: string, amount: number): string {
  return mix(hex, '#FFFFFF', amount);
}

/** Darkens towards a deep violet rather than black, which keeps shadows colourful. */
export function darken(hex: string, amount: number): string {
  return mix(hex, '#22104A', amount);
}
