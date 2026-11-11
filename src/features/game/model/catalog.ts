import rawCatalog from '../data/original-game-data.json'

/** Источник: распакованный APK /assets/flutter_assets/assets/data/data.json. */
export type OriginalGameEntry = {
  id: number
  name: string
  image: string
  price: number
  income: number
  expend: number
  flippable: boolean
  flip: boolean
}

export type AssetKind = 'company' | 'transport' | 'car' | 'weapon'

export type GameAsset = OriginalGameEntry & {
  imageUrl: string
  kind: AssetKind
  tax: number
}

export const ORIGINAL_CATALOG: OriginalGameEntry[] = rawCatalog as OriginalGameEntry[]

function getKind(entry: OriginalGameEntry): AssetKind {
  if (entry.id >= 39 && entry.id <= 42) return 'car'
  if ((entry.id >= 37 && entry.id <= 38) || (entry.id >= 43 && entry.id <= 46)) return 'weapon'
  if (entry.income > 0) return 'company'
  return 'transport'
}

function convertEntry(entry: OriginalGameEntry): GameAsset {
  return {
    ...entry,
    imageUrl: `/assets/${entry.image.split('/').pop()}`,
    kind: getKind(entry),
    tax: Math.max(0, -entry.expend),
  }
}

/** Доска new_mini: 50–86 — компании и транспорт; 37–46 — машины и оружие. */
export const BOARD_ASSETS: GameAsset[] = ORIGINAL_CATALOG
  .filter((entry) => (entry.id >= 50 && entry.id <= 86) || (entry.id >= 37 && entry.id <= 46))
  .map(convertEntry)

export const ASSET_BY_ID = new Map(BOARD_ASSETS.map((asset) => [asset.id, asset]))

export const ASSET_KIND_LABEL: Record<AssetKind, string> = {
  company: 'Компания', transport: 'Транспорт', car: 'Автомобиль', weapon: 'Оружие',
}

export function formatGameNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)
}
