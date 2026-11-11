import type { GameAsset } from '../model/catalog'

export type PortfolioTotals = {
  price: number
  income: number
  taxes: number
  netIncome: number
  companies: number
  transport: number
  other: number
  flipped: number
}

/** Перевернутые компании не приносят доход, однако остальные показатели сохраняются. */
export function calculateTotals(assets: GameAsset[], flippedIds: number[] = []): PortfolioTotals {
  const flipped = new Set(flippedIds)
  const result: PortfolioTotals = {
    price: 0, income: 0, taxes: 0, netIncome: 0,
    companies: 0, transport: 0, other: 0, flipped: 0,
  }
  for (const asset of assets) {
    result.price += asset.price
    result.taxes += asset.tax
    if (asset.kind === 'company') {
      result.companies++
      if (flipped.has(asset.id)) result.flipped++
      else result.income += asset.income
    } else if (asset.kind === 'transport') {
      result.transport++
    } else {
      result.other++
    }
  }
  result.netIncome = result.income - result.taxes
  return result
}
