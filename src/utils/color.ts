export type RgbColor = [number, number, number]

export type HexColor = `#${string}`

export function alphaToHex(alpha: number): string {
  return Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
}

export function alphaCompositing(foregroundHex: HexColor, backgroundHex: HexColor, alpha: number): HexColor {
  if (alpha < 0 || alpha > 1) throw new Error('Invalid alpha value')
  const foreground = hexToRgb(foregroundHex)
  const background = hexToRgb(backgroundHex)
  const result: RgbColor = [0, 0, 0]

  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(alpha * foreground[i] + (1 - alpha) * background[i])
  }

  return rgbToHex(result)
}

export function rgbToHex(rgb: RgbColor): HexColor {
  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function isHexColor(color: string): color is HexColor {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
}

export function hexToRgb(hex: HexColor): RgbColor {
  if (!isHexColor(hex)) throw new Error('Invalid hex color')
  const result: RgbColor = [0, 0, 0]

  if (hex.length === 4) {
    hex = hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }

  const num = Number.parseInt(hex.slice(1), 16)
  result[0] = num >> 16
  result[1] = (num >> 8) & 255
  result[2] = num & 255

  return result
}
