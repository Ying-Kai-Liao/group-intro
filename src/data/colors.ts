export interface AccentColor {
  id: string;
  hex: string;
  label: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: "coral", hex: "#ff6b6b", label: "Coral" },
  { id: "gold", hex: "#ffd93d", label: "Gold" },
  { id: "mint", hex: "#6bcb77", label: "Mint" },
  { id: "sky", hex: "#4d96ff", label: "Sky" },
  { id: "lavender", hex: "#b088f9", label: "Lavender" },
  { id: "peach", hex: "#ff9a76", label: "Peach" },
  { id: "cyan", hex: "#00d2d3", label: "Cyan" },
  { id: "pink", hex: "#ff6b9d", label: "Pink" },
  { id: "lime", hex: "#c7f464", label: "Lime" },
];

export const DEFAULT_COLOR = "#5a5a8a";
