const { test } = require('node:test')
const assert = require('node:assert/strict')
const { BOARD_ASSETS, ASSET_BY_ID } = require('../.game-tests/features/game/model/catalog.js')
const { BOARD_HOTSPOTS } = require('../.game-tests/features/game/model/board-hotspots.js')
const { calculateTotals } = require('../.game-tests/features/game/lib/calculate-totals.js')
const {
  EMPTY_GAME, issueLoan, initialLoanDue, loanExtensionFee,
  previewRound, settleRound, pickCompaniesToSell,
} = require('../.game-tests/features/game/lib/game-economy.js')

const state = (ownedIds = [], rest = {}) => ({ ...EMPTY_GAME, ownedIds, ...rest })

test('На доске доступны 30 компаний, 7 транспортных карт, 4 автомобиля и 6 единиц оружия', () => {
  assert.equal(BOARD_ASSETS.length, 47)
  assert.equal(BOARD_HOTSPOTS.length, 47)
  assert.equal(new Set(BOARD_HOTSPOTS.map(({ id }) => id)).size, 47)
  for (const { id } of BOARD_HOTSPOTS) assert.ok(ASSET_BY_ID.has(id))
  assert.deepEqual(['company', 'transport', 'car', 'weapon'].map(kind =>
    BOARD_ASSETS.filter(item => item.kind === kind).length), [30, 7, 4, 6])
})

test('Машины и оружие не меняют доход и налоги', () => {
  const assets = [39, 40, 41, 42, 37, 38, 43, 44, 45, 46].map(id => ASSET_BY_ID.get(id))
  const totals = calculateTotals(assets)
  assert.equal(totals.income, 0)
  assert.equal(totals.taxes, 0)
  assert.equal(totals.other, 10)
})

test('Перевернутая компания перестает приносить доход, транспортный налог остается', () => {
  const owned = [50, 81, 72].map(id => ASSET_BY_ID.get(id))
  const full = calculateTotals(owned)
  const flipped = calculateTotals(owned, [81])
  assert.equal(full.income, 24)
  assert.equal(full.taxes, 10)
  assert.equal(flipped.income, 4)
  assert.equal(flipped.taxes, 10)
})

test('Гарантированный доход 12 начисляется до налогов', () => {
  assert.equal(previewRound(state()).net, 12)
  assert.equal(previewRound(state([50, 51])).income, 9)
  assert.equal(previewRound(state([50, 51])).net, 12)
  assert.equal(previewRound(state([81, 72])).net, 10) // 20 доход − 10 налогов
  assert.equal(previewRound(state([72, 73])).net, -8) // 12 гарантированно − 20 налогов
})

test('Кредитные формулы: 5→10 и 20→30, затем 20% за круг', () => {
  assert.equal(initialLoanDue(5), 10)
  assert.equal(initialLoanDue(20), 30)
  assert.equal(loanExtensionFee(5), 2)
  assert.equal(loanExtensionFee(20), 4)
})

test('Три непогашенных круга кредита 20 → 30,34,38,42 + тюрьма', () => {
  let game = issueLoan(state([50, 51, 52, 53, 81]), 20)
  assert.equal(game.loan.round, 1)
  assert.equal(game.loan.due, 30)
  game = settleRound(game, 'defer').next
  assert.equal(game.loan.round, 2)
  assert.equal(game.loan.due, 34)
  game = settleRound(game, 'defer').next
  assert.equal(game.loan.round, 3)
  assert.equal(game.loan.due, 38)
  const { next, report } = settleRound(game, 'defer')
  assert.equal(report.liquidationDebt, 42)
  assert.ok(report.soldValue >= 42)
  assert.equal(next.inJail, true)
  assert.equal(next.loan, null)
  assert.ok(next.ownedIds.length < game.ownedIds.length)
})

test('Если денег от продажи недостаточно, остаток долга остается просроченным', () => {
  let game = issueLoan(state([50]), 20)
  game = settleRound(game, 'defer').next
  game = settleRound(game, 'defer').next
  const { next, report } = settleRound(game, 'defer')
  assert.equal(report.soldValue, 6)
  assert.equal(report.unpaidDebt, 36)
  assert.equal(next.loan.due, 36)
  assert.equal(next.loan.defaulted, true)
  assert.equal(next.inJail, true)
  assert.throws(() => settleRound(next, 'defer'))
})

test('Погашение вычитается из результата, закрывает кредит и не отправляет в тюрьму', () => {
  const game = issueLoan(state([81]), 5)
  const { next, report } = settleRound(game, 'repay')
  assert.equal(report.finalPayout, 10) // 20 дохода − 10 кредита
  assert.equal(next.loan, null)
  assert.equal(next.inJail, false)
  assert.equal(next.roundNumber, 2)
  assert.equal(next.totalEarned, 10)
})

test('При завершении круга перевернутые карты автоматически раскрываются', () => {
  const game = state([50, 81], { flippedIds: [50, 81] })
  const { next, report } = settleRound(game, 'no-loan')
  assert.equal(report.income, 0)
  assert.equal(report.guaranteedIncome, 12)
  assert.equal(report.flippedCount, 2)
  assert.deepEqual(next.flippedIds, [])
})

test('Ликвидация подбирает сумму не меньше долга с минимальным превышением', () => {
  const selected = pickCompaniesToSell([50, 51, 52, 53], 14)
  assert.equal(selected.value, 14)
  assert.equal(selected.ids.length, 2)
})
