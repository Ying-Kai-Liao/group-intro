export interface PixelIcon {
  id: string;
  label: string;
  src: string; // path in /public/icons/
}

export const PIXEL_ICONS: PixelIcon[] = [
  { id: "folder", label: "Folder", src: "/icons/folder.png" },
  { id: "floppy", label: "Floppy Disk", src: "/icons/floppy.png" },
  { id: "terminal", label: "Terminal", src: "/icons/terminal.png" },
  { id: "gameboy", label: "Gameboy", src: "/icons/gameboy.png" },
  { id: "cassette", label: "Cassette", src: "/icons/cassette.png" },
  { id: "star", label: "Star", src: "/icons/star.png" },
  { id: "skull", label: "Skull", src: "/icons/skull.png" },
  { id: "heart", label: "Heart", src: "/icons/heart.png" },
  { id: "potion", label: "Potion", src: "/icons/potion.png" },
  { id: "sword", label: "Sword", src: "/icons/sword.png" },
  { id: "gem", label: "Gem", src: "/icons/gem.png" },
  { id: "mushroom", label: "Mushroom", src: "/icons/mushroom.png" },
];

export const DEFAULT_ICON = "folder";

export function getIconById(id: string): PixelIcon {
  return PIXEL_ICONS.find((icon) => icon.id === id) || PIXEL_ICONS[0];
}
