/**
 * Области карточек на board_new_mini.png, измеренные по изображению APK.
 * Координатная сетка: 1280 x 1181, масштабируется вместе с изображением.
 * Специальные клетки/бонусы не включены: в data.json они не имеют цены.
 */
export const BOARD_REFERENCE_SIZE = { width: 1280, height: 1181 } as const

export type BoardHotspot = {
  id: number
  x: number
  y: number
  width: number
  height: number
}

export const BOARD_HOTSPOTS: BoardHotspot[] = [
  { id: 50, x: 12, y: 958, width: 124, height: 78 },   // Boos
  { id: 51, x: 12, y: 875, width: 124, height: 78 },   // Fuma
  { id: 52, x: 12, y: 791, width: 124, height: 78 },   // Kine
  { id: 53, x: 12, y: 706, width: 124, height: 78 },   // Starducks
  { id: 54, x: 12, y: 499, width: 124, height: 78 },   // Camone
  { id: 55, x: 12, y: 332, width: 124, height: 77 },   // Noberto Savalli
  { id: 56, x: 12, y: 249, width: 124, height: 78 },   // Pomoraunt
  { id: 57, x: 139, y: 123, width: 79, height: 120 },  // FCK
  { id: 58, x: 305, y: 123, width: 80, height: 120 },  // Gevorgio Armyani
  { id: 59, x: 390, y: 123, width: 82, height: 120 },  // Gangsta Cola
  { id: 60, x: 601, y: 123, width: 80, height: 120 },  // ExFeed
  { id: 61, x: 684, y: 123, width: 79, height: 120 },  // Abibas
  { id: 62, x: 767, y: 123, width: 80, height: 120 },  // Hemres
  { id: 63, x: 850, y: 123, width: 79, height: 120 },  // MonsterCard
  { id: 64, x: 932, y: 123, width: 79, height: 120 },  // Moroboro
  { id: 65, x: 1015, y: 123, width: 79, height: 120 }, // Dorex
  { id: 66, x: 1144, y: 706, width: 120, height: 78 }, // Darley Havidson
  { id: 67, x: 1144, y: 791, width: 120, height: 78 }, // Bencedes Merz
  { id: 68, x: 1144, y: 875, width: 120, height: 78 }, // Sonya Plantation
  { id: 69, x: 1144, y: 958, width: 120, height: 78 }, // Looking
  { id: 70, x: 975, y: 1041, width: 78, height: 119 }, // McRonalds
  { id: 71, x: 884, y: 1041, width: 85, height: 119 }, // Gamsung
  { id: 72, x: 599, y: 1041, width: 80, height: 119 }, // Plane 1
  { id: 73, x: 805, y: 1041, width: 79, height: 119 }, // Plane 2
  { id: 74, x: 514, y: 1041, width: 82, height: 119 }, // Nefix
  { id: 75, x: 431, y: 1041, width: 80, height: 119 }, // Roleh
  { id: 76, x: 139, y: 1041, width: 80, height: 119 }, // Boat 1
  { id: 77, x: 348, y: 1041, width: 81, height: 119 }, // Boat 2
  { id: 78, x: 139, y: 579, width: 79, height: 123 },  // GooGirl
  { id: 79, x: 221, y: 579, width: 81, height: 123 },  // Hahazon
  { id: 80, x: 305, y: 579, width: 82, height: 123 },  // PineApple
  { id: 81, x: 390, y: 579, width: 81, height: 123 },  // Minisoft
  { id: 82, x: 602, y: 579, width: 79, height: 123 },  // Heli 1
  { id: 83, x: 683, y: 706, width: 120, height: 78 },  // Heli 2
  { id: 84, x: 683, y: 791, width: 120, height: 78 },  // Leog
  { id: 85, x: 683, y: 875, width: 120, height: 78 },  // Nuscafe
  { id: 86, x: 683, y: 958, width: 120, height: 78 },  // Plane 3
]

export function findHotspot(x: number, y: number): BoardHotspot | undefined {
  return BOARD_HOTSPOTS.find(
    (hotspot) =>
      x >= hotspot.x && x <= hotspot.x + hotspot.width &&
      y >= hotspot.y && y <= hotspot.y + hotspot.height,
  )
}

// Дополнительные кликабельные объекты на доске — автомобили и оружие.
BOARD_HOTSPOTS.push(
  { id: 37, x: 221, y: 123, width: 80, height: 120 },  // Shotgun1 (legal)
  { id: 38, x: 12, y: 415, width: 124, height: 78 },   // Shotgun2 (legal)
  { id: 39, x: 474, y: 246, width: 123, height: 79 },  // BMW
  { id: 40, x: 474, y: 329, width: 123, height: 79 },  // Acura
  { id: 41, x: 474, y: 414, width: 123, height: 79 },  // Ferrari
  { id: 42, x: 474, y: 498, width: 123, height: 79 },  // Lamborghini
  { id: 43, x: 1144, y: 247, width: 120, height: 78 }, // Pitbull
  { id: 44, x: 1144, y: 331, width: 120, height: 78 }, // Colt
  { id: 45, x: 1144, y: 415, width: 120, height: 78 }, // SW Python
  { id: 46, x: 1144, y: 498, width: 120, height: 78 }, // UZI
)
