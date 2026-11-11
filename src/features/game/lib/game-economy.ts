import { ASSET_BY_ID, type GameAsset } from '../model/catalog'
import { calculateTotals } from './calculate-totals'

export type Loan = {
  principal: number
  due: number
  /** Номер круга с момента выдачи: 1, 2 или 3. */
  round: number
  defaulted: boolean
}

export type GameState = {
  ownedIds: number[]
  flippedIds: number[]
  roundNumber: number
  totalEarned: number
  loan: Loan | null
  inJail: boolean
}

export type RoundAction = 'repay' | 'defer' | 'no-loan'

export type RoundPreview = {
  round: number
  income: number
  guaranteedIncome: number
  minimumBonus: number
  taxes: number
  net: number
  flippedCount: number
  loan: Loan | null
  extensionFee: number
}

export type RoundReport = RoundPreview & {
  action: RoundAction
  creditPaid: number
  finalPayout: number
  soldIds: number[]
  soldValue: number
  liquidationDebt: number
  unpaidDebt: number
  jailed: boolean
  nextDebt: number
}

export const EMPTY_GAME: GameState = {
  ownedIds: [],
  flippedIds: [],
  roundNumber: 1,
  totalEarned: 0,
  loan: null,
  inJail: false
}

/** Первый круг: долг = S + max(5, ceil(0.5 * S)). */
export function initialLoanDue(principal: number): number {
  if (principal < 5) return principal * 2
  return principal + Math.max(5, Math.ceil(principal * 0.5))
}

/** За каждый круг без погашения: + max(3, ceil(0.3 * S)). */
export function loanExtensionFee(principal: number): number {
  return Math.max(3, Math.ceil(principal * 0.3))
}

export function issueLoan(state: GameState, principal: number): GameState {
  if (
    state.loan ||
    !Number.isSafeInteger(principal) ||
    principal < 1 ||
    principal > 100
  )
    return state
  return {
    ...state,
    loan: {
      principal,
      due: initialLoanDue(principal),
      round: 1,
      defaulted: false
    }
  }
}

export function previewRound(state: GameState): RoundPreview {
  const assets = state.ownedIds
    .map(id => ASSET_BY_ID.get(id))
    .filter(asset => asset !== undefined)
  const totals = calculateTotals(assets, state.flippedIds)
  const guaranteedIncome = Math.max(12, totals.income)
  return {
    round: state.roundNumber,
    income: totals.income,
    guaranteedIncome,
    minimumBonus: guaranteedIncome - totals.income,
    taxes: totals.taxes,
    net: guaranteedIncome - totals.taxes,
    flippedCount: totals.flipped,
    loan: state.loan ? { ...state.loan } : null,
    extensionFee: state.loan ? loanExtensionFee(state.loan.principal) : 0
  }
}

/**
 * Подбирает минимальный по общей стоимости набор компаний для распродажи.
 * При равной сумме предпочитаются меньшее количество карт.
 * В случае недостатка активов возвращает все имеющиеся компании.
 */
export function pickCompaniesToSell(
  ids: number[],
  due: number
): { ids: number[]; value: number } {
  const companies = ids
    .map(id => ASSET_BY_ID.get(id))
    .filter(
      (asset): asset is GameAsset =>
        asset?.kind === 'company' && asset.price > 0
    )
  const possible = new Map<number, number[]>([[0, []]])
  for (const company of companies) {
    for (const [value, selected] of Array.from(possible)) {
      const nextValue = value + company.price
      const existing = possible.get(nextValue)
      if (!existing || selected.length + 1 < existing.length) {
        possible.set(nextValue, [...selected, company.id])
      }
    }
  }
  const all = [...possible.entries()].sort(
    (a, b) => a[0] - b[0] || a[1].length - b[1].length
  )
  const chosen = all.find(([value]) => value >= due) ?? all[all.length - 1]
  return { ids: chosen[1], value: chosen[0] }
}

export function settleRound(
  state: GameState,
  action: RoundAction
): { next: GameState; report: RoundReport } {
  const preview = previewRound(state)
  if (!state.loan && action !== 'no-loan')
    throw new Error('Нет кредита для расчета')
  if (state.loan && action === 'no-loan')
    throw new Error('Не выбран способ расчета по кредиту')
  if (state.loan?.defaulted && action === 'defer')
    throw new Error('Просроченный кредит нельзя продлить')

  let loan = state.loan
  let creditPaid = 0
  let soldIds: number[] = []
  let soldValue = 0
  let liquidationDebt = 0
  let unpaidDebt = 0
  let jailed = false

  if (loan && action === 'repay') {
    creditPaid = loan.due
    loan = null
  } else if (loan && action === 'defer') {
    const increasedDebt = loan.due + loanExtensionFee(loan.principal)
    if (loan.round >= 3) {
      liquidationDebt = increasedDebt
      const sale = pickCompaniesToSell(state.ownedIds, increasedDebt)
      soldIds = sale.ids
      soldValue = sale.value
      unpaidDebt = Math.max(0, increasedDebt - soldValue)
      jailed = true
      loan =
        unpaidDebt > 0
          ? { ...loan, due: unpaidDebt, round: 3, defaulted: true }
          : null
    } else {
      loan = { ...loan, due: increasedDebt, round: loan.round + 1 }
    }
  }

  const finalPayout = preview.net - creditPaid
  const removed = new Set(soldIds)
  const next: GameState = {
    ...state,
    ownedIds: state.ownedIds.filter(id => !removed.has(id)),
    flippedIds: [],
    loan,
    roundNumber: state.roundNumber + 1,
    totalEarned: state.totalEarned + finalPayout,
    inJail: state.inJail || jailed
  }
  return {
    next,
    report: {
      ...preview,
      action,
      creditPaid,
      finalPayout,
      soldIds,
      soldValue,
      liquidationDebt,
      unpaidDebt,
      jailed,
      nextDebt: loan?.due ?? 0
    }
  }
}
