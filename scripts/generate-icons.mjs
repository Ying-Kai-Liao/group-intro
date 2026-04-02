/**
 * Generates 32x32 pixel art PNG icons for group-intro app.
 * Uses `sharp` to compose raw RGBA pixel data into PNG files.
 */

import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "icons");

const W = 32;
const H = 32;

// Color palette (RGBA)
const _ = [0, 0, 0, 0];       // transparent
const K = [0, 0, 0, 255];      // black
const W_ = [255, 255, 255, 255]; // white
const Y = [255, 220, 0, 255];   // yellow
const YD = [200, 160, 0, 255];  // dark yellow
const BR = [180, 100, 30, 255]; // brown
const BRD = [120, 60, 10, 255]; // dark brown
const BL = [40, 120, 220, 255]; // blue
const BLD = [20, 60, 160, 255]; // dark blue
const GR = [60, 180, 60, 255];  // green
const GRD = [30, 110, 30, 255]; // dark green
const RD = [220, 50, 50, 255];  // red
const RDD = [150, 20, 20, 255]; // dark red
const GY = [160, 160, 160, 255]; // gray
const GYD = [90, 90, 90, 255];  // dark gray
const GYL = [210, 210, 210, 255]; // light gray
const PR = [160, 60, 220, 255]; // purple
const PRD = [100, 20, 160, 255]; // dark purple
const CY = [0, 200, 220, 255];  // cyan
const OR = [240, 140, 0, 255];  // orange
const ORD = [180, 90, 0, 255];  // dark orange
const PK = [240, 100, 160, 255]; // pink
const TN = [200, 170, 120, 255]; // tan/skin
const BG = [60, 40, 20, 255];   // very dark brown

// Helper: build pixel buffer from 32x32 array of color refs
function makeImage(pixels) {
  // pixels is a flat array of 1024 color entries (each is [r,g,b,a])
  const buf = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const [r, g, b, a] = pixels[i];
    buf[i * 4 + 0] = r;
    buf[i * 4 + 1] = g;
    buf[i * 4 + 2] = b;
    buf[i * 4 + 3] = a;
  }
  return buf;
}

async function save(name, pixels) {
  const buf = makeImage(pixels);
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
    .png()
    .toFile(join(OUT_DIR, `${name}.png`));
  console.log(`  wrote ${name}.png`);
}

// Helper: fill a 32x32 grid with transparent, then paint rows
// grid is an array of 32 strings of length 32 using single chars mapped to colors
function grid(rows, palette) {
  const pixels = [];
  for (let y = 0; y < H; y++) {
    const row = rows[y] || "";
    for (let x = 0; x < W; x++) {
      const ch = row[x] || " ";
      pixels.push(palette[ch] || _);
    }
  }
  return pixels;
}

// ==============================================================
// ICON DEFINITIONS
// ==============================================================

// FOLDER - classic manila folder
const folderRows = [
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "   YYYY                         ",
  "  YYYYYY                        ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "  YYYYYYYYYYYYYYYYYYYYYYYYYY    ",
  "   DDDDDDDDDDDDDDDDDDDDDDDDD    ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
];

await save("folder", grid(folderRows, {
  " ": _,
  "Y": Y,
  "D": YD,
}));

// FLOPPY DISK
const floppyRows = [
  "                                ",
  "                                ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KWWWWWWWWWWWWWWKKKKKKKKK     ",
  "   KWWWWWWWWWWWWWWKGGGGGGGK     ",
  "   KWWWWWWWWWWWWWWKGGGGGGGK     ",
  "   KWWWWWWWWWWWWWWKGGGGGGGK     ",
  "   KWWWWWWWWWWWWWWKGGGGGGGK     ",
  "   KKKKKKKKKKKKKKKKGGGGGGGK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KGGGGGGKKKKKKKKKKKKKKKKK     ",
  "   KGGGGGGKKKKKKKKKKKKKKKKK     ",
  "   KGGGGGGKKKKKKKKKKKKKKKKK     ",
  "   KGGGGGGKKKKKKKKKKKKKKKKK     ",
  "   KGGGGGGKKKKKKKKKKKKKKKKK     ",
  "   KGGGGGGKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
];

await save("floppy", grid(floppyRows, {
  " ": _,
  "K": K,
  "W": GYL,
  "G": GY,
}));

// TERMINAL - screen with prompt
const terminalRows = [
  "                                ",
  "                                ",
  "  KKKKKKKKKKKKKKKKKKKKKKKKKK    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGGGK    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGGGK    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGGGK    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGkk    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGGGK    ",
  "  KGGyGGGGGGGGGGGGGGGGGGGGK    ",
  "  KGyyyGGGGGGGGGGGGGGGGGGGK    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGbK    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGGGK    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGGGK    ",
  "  KGGGGGGGGGGGGGGGGGGGGGGGGK    ",
  "  KKKKKKKKKKKKKKKKKKKKKKKKKK    ",
  "  KKKKKKKKKKKKKKKKKKKKKKKKKK    ",
  "  KKKKKKKKKKKKKKKKKKKKKKKKK     ",
  "        KKKKKKKKKKKKK           ",
  "        KKKKKKKKKKKKK           ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
];

await save("terminal", grid(terminalRows, {
  " ": _,
  "K": K,
  "G": [20, 40, 20, 255],  // dark green bg
  "g": GR,                 // green text
  "y": [200, 200, 0, 255], // yellow prompt
  "b": [200, 200, 200, 255], // block cursor
  "k": [10, 20, 10, 255],  // shadow
}));

// GAMEBOY
const gameboyRows = [
  "                                ",
  "      KKKKKKKKKKKKKKKK          ",
  "     KKKKKKKKKKKKKKKKKKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KLLLLLLLLLLLLLLLLKK        ",
  "     KKKKKKKKKKKKKKKKKKK        ",
  "     KKKK KKKK    RKRKK        ",
  "     KKKK KKKK   KRRKKKK        ",
  "     K KKKKKK K   RRKKKK        ",
  "     KKKK KKKK   KKKKKKK        ",
  "     KKKKKKKKKKKKKKKKKKKK       ",
  "     KKKKKKKKKKKKKKKKKKKK       ",
  "     KKKK  BBKK  AAKKKK        ",
  "     KKKK  BBKK  AAKKKK        ",
  "     KKKKKKKKKKKKKKKKKKKK       ",
  "     KKKKKKKKKKKKKKKKKKKK       ",
  "      KKKKKKKKKKKKKKKKKKK       ",
  "        KKKKKKKKKKKKKKK         ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
];

await save("gameboy", grid(gameboyRows, {
  " ": _,
  "K": [140, 140, 150, 255],
  "L": [140, 180, 100, 255], // screen
  "R": RD,
  "B": BL,
  "A": [200, 50, 200, 255],
}));

// CASSETTE TAPE
const cassetteRows = [
  "                                ",
  "                                ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "   KWWWWWWWWWWWWWWWWWWWWWK     ",
  "   KWWWWWWWWWWWWWWWWWWWWWK     ",
  "   KWWWwwwwwwwwwwwwwwwWWWK     ",
  "   KWWWwKKKKKKKKKKKKwwWWWK     ",
  "   KWWWwKOOOKKKOOOKwwWWWK      ",
  "   KWWWwKOOOKKKOOOKwwWWWK      ",
  "   KWWWwKOOOKKKOOOKwwWWWK      ",
  "   KWWWwKKKKKKKKKKKKwwWWWK     ",
  "   KWWWwwwwwwwwwwwwwwwWWWK     ",
  "   KWWWwwwwwDDDwwwwwwwWWWK     ",
  "   KWWWwwwwwwwwwwwwwwwWWWK     ",
  "   KWWWWWWWWWWWWWWWWWWWWWK     ",
  "   KWWWWWWWWWWWWWWWWWWWWWK     ",
  "   KKKKKKKKKKKKKKKKKKKKKKKK     ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
];

await save("cassette", grid(cassetteRows, {
  " ": _,
  "K": K,
  "W": [220, 220, 220, 255],
  "w": [180, 180, 180, 255],
  "O": [100, 100, 100, 255], // reel hub
  "D": [80, 80, 80, 255],    // direction arrow area
}));

// STAR - 5-pointed pixel star
const starRows = [
  "                                ",
  "                                ",
  "                                ",
  "               YY               ",
  "              YYYY              ",
  "              YYYY              ",
  "   YYYYYYYYYYYYYYYYYYYYYYYYYYY  ",
  "    YYYYYYYYYYYYYYYYYYYYYYYYYY  ",
  "     YYYYYYYYYYYYYYYYYYYYYY     ",
  "      YYYYYYYYYYYYYYYYYYYYY     ",
  "       YYYYYYYYYYYYYYYYY        ",
  "        YYYYYYYYYYYYYY          ",
  "       YYYYYYYYYYYYYYYYYY       ",
  "      YYYY          YYYYY       ",
  "     YYYY            YYYYY      ",
  "    YYYY               YYYY     ",
  "   YYYY                 YYYY    ",
  "  YYYY                   YYYY   ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
];

// Actually let's do a proper 5-pointed star using a coordinate-based approach
function makeStarPixels() {
  const pixels = Array(W * H).fill(_);
  const cx = 15.5, cy = 15.5;
  const outerR = 13, innerR = 5.5;
  const points = 5;

  // Get star polygon vertices
  const verts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    verts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }

  // Point-in-polygon test for each pixel
  function inPoly(px, py) {
    let inside = false;
    const n = verts.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = verts[i][0], yi = verts[i][1];
      const xj = verts[j][0], yj = verts[j][1];
      if ((yi > py) !== (yj > py) &&
          px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (inPoly(x + 0.5, y + 0.5)) {
        pixels[y * W + x] = Y;
      }
    }
  }
  // Outline pass
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (pixels[y * W + x] === Y) {
        // Check if any neighbor is transparent
        const neighbors = [
          [x-1,y],[x+1,y],[x,y-1],[x,y+1]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || pixels[ny * W + nx] === _) {
            pixels[y * W + x] = YD;
            break;
          }
        }
      }
    }
  }
  return pixels;
}

await save("star", makeStarPixels());

// SKULL
function makeSkullPixels() {
  const pixels = Array(W * H).fill(_);

  // Skull shape: draw an oval head + jaw
  const cx = 15.5, cy = 13;
  const rx = 11, ry = 10;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      if (dx * dx / (rx * rx) + dy * dy / (ry * ry) <= 1) {
        pixels[y * W + x] = GYL;
      }
    }
  }

  // Jaw rectangle below
  for (let y = 20; y < 28; y++) {
    for (let x = 8; x < 24; x++) {
      pixels[y * W + x] = GYL;
    }
  }

  // Teeth gaps (dark lines)
  for (let y = 23; y < 28; y++) {
    for (const gx of [11, 15, 19]) {
      pixels[y * W + gx] = K;
    }
  }

  // Eye sockets (black circles)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const le = Math.hypot(x + 0.5 - 11, y + 0.5 - 13);
      const re = Math.hypot(x + 0.5 - 20, y + 0.5 - 13);
      if (le < 3.5 || re < 3.5) {
        pixels[y * W + x] = K;
      }
    }
  }

  // Nose (small triangle)
  for (const [px, py] of [[15,17],[16,17],[15,18],[16,18]]) {
    pixels[py * W + px] = K;
  }

  // Outline
  const orig = [...pixels];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (orig[y * W + x] === GYL) {
        for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || orig[ny * W + nx] === _) {
            pixels[y * W + x] = GY;
            break;
          }
        }
      }
    }
  }

  return pixels;
}

await save("skull", makeSkullPixels());

// HEART
function makeHeartPixels() {
  const pixels = Array(W * H).fill(_);

  function inHeart(px, py) {
    // Heart formula: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
    // Normalize to [-1,1] range
    const x = (px - 15.5) / 12;
    const y = -(py - 19) / 11; // flip y
    const val = Math.pow(x*x + y*y - 1, 3) - x*x * y*y*y;
    return val <= 0;
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (inHeart(x + 0.5, y + 0.5)) {
        pixels[y * W + x] = RD;
      }
    }
  }

  // Outline
  const orig = [...pixels];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (orig[y * W + x] === RD) {
        for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || orig[ny * W + nx] === _) {
            pixels[y * W + x] = RDD;
            break;
          }
        }
      }
    }
  }

  // Highlight
  if (pixels[9 * W + 10] === RD) pixels[9 * W + 10] = PK;
  if (pixels[10 * W + 11] === RD) pixels[10 * W + 11] = PK;

  return pixels;
}

await save("heart", makeHeartPixels());

// POTION - bottle with colored liquid
const potionRows = [
  "                                ",
  "                                ",
  "                                ",
  "              KK                ",
  "             KGGK               ",
  "             KGGK               ",
  "            KKKKK               ",
  "           KPPPPPK              ",
  "          KPPPPPPPK             ",
  "         KPPPPPPPPPK            ",
  "         KPPPPPPPPPK            ",
  "         KPPPPPPPPPK            ",
  "         KPPPPPPPPPK            ",
  "         KPPpppppPPK            ",
  "         KPPpppppPPK            ",
  "         KPPpppppPPK            ",
  "         KPPPPPPPPPK            ",
  "         KPPPPPPPPPK            ",
  "         KPPPPPPPPPK            ",
  "          KPPPPPPPK             ",
  "           KPPPPPK              ",
  "            KKKKK               ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
];

await save("potion", grid(potionRows, {
  " ": _,
  "K": K,
  "G": GY,
  "P": PR,
  "p": [200, 100, 255, 255],  // lighter purple highlight
}));

// SWORD - diagonal pixel sword
const swordRows = [
  "                K               ",
  "               KYK              ",
  "              KYYK              ",
  "             KYYYK              ",
  "            KYYYYK              ",
  "           KYYYYYK              ",
  "          KYYYYYYK              ",
  "         KYYYYYYYK              ",
  "        KYYYYYYYYK              ",
  "       KYYYYYYYYYK              ",
  "      KYYYYYYYYYYK              ",
  "     KYYYYYYYYYYYK              ",
  "    KYYYYYYYYYYYYK              ",
  "   KYYYYYYYYYYYYYK              ",
  "  KYYYYYYYYYYYYYYK              ",
  "  KYYYYYYYYYYYYYYK              ",
  "   KBBBBBBBBBBBBK               ",
  "      K    K                    ",
  "       K  K                     ",
  "        KK                      ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
];

await save("sword", grid(swordRows, {
  " ": _,
  "K": K,
  "Y": GYL,
  "B": BR,
}));

// GEM - diamond shape with facets
function makeGemPixels() {
  const pixels = Array(W * H).fill(_);

  // Diamond outline: top triangle + bottom triangle
  // Top half: y 6..15, bottom: y 16..26
  const cx = 15;

  for (let y = 6; y <= 15; y++) {
    const half = Math.round((y - 6) * 9 / 9 + 1);
    for (let x = cx - half; x <= cx + half; x++) {
      pixels[y * W + x] = BL;
    }
  }
  for (let y = 16; y <= 26; y++) {
    const half = Math.round((26 - y) * 10 / 10);
    for (let x = cx - half; x <= cx + half; x++) {
      pixels[y * W + x] = BL;
    }
  }

  // Facets: lighter regions
  for (let y = 6; y <= 12; y++) {
    const half = Math.round((y - 6) * 9 / 9 + 1);
    for (let x = cx - half + 1; x <= cx; x++) {
      if (pixels[y * W + x] === BL) pixels[y * W + x] = CY;
    }
  }
  for (let y = 16; y <= 22; y++) {
    const half = Math.round((26 - y) * 10 / 10);
    for (let x = cx + 1; x <= cx + half - 1; x++) {
      if (pixels[y * W + x] === BL) pixels[y * W + x] = [100, 180, 255, 255];
    }
  }

  // Outline
  const orig = [...pixels];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (orig[y * W + x] !== _) {
        for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || orig[ny * W + nx] === _) {
            pixels[y * W + x] = BLD;
            break;
          }
        }
      }
    }
  }

  return pixels;
}

await save("gem", makeGemPixels());

// MUSHROOM - Mario-style red mushroom with spots
function makeMushroomPixels() {
  const pixels = Array(W * H).fill(_);

  const cx = 15.5;

  // Cap: semicircle top half
  for (let y = 4; y <= 18; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - 14;
      if (dx * dx / (13 * 13) + dy * dy / (11 * 11) <= 1 && y <= 14) {
        pixels[y * W + x] = RD;
      }
    }
  }
  // Lower cap overhang
  for (let y = 14; y <= 18; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - 14;
      if (dx * dx / (13 * 13) + dy * dy / (11 * 11) <= 1) {
        pixels[y * W + x] = RDD;
      }
    }
  }

  // Stem
  for (let y = 18; y <= 26; y++) {
    for (let x = 9; x <= 21; x++) {
      pixels[y * W + x] = TN;
    }
  }

  // Eyes on stem
  for (const [ex, ey] of [[11,20],[11,21],[19,20],[19,21]]) {
    pixels[ey * W + ex] = K;
  }

  // White spots on cap
  const spotCenters = [[12, 9, 2.5], [20, 9, 2], [15, 6, 1.5]];
  for (const [sx, sy, sr] of spotCenters) {
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (Math.hypot(x + 0.5 - sx, y + 0.5 - sy) < sr) {
          if (pixels[y * W + x] === RD) pixels[y * W + x] = W_;
        }
      }
    }
  }

  // Outline
  const orig = [...pixels];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (orig[y * W + x] !== _) {
        for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || orig[ny * W + nx] === _) {
            pixels[y * W + x] = K;
            break;
          }
        }
      }
    }
  }

  return pixels;
}

await save("mushroom", makeMushroomPixels());

console.log("All icons generated.");
