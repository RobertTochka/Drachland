'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ASSET_BY_ID, type GameAsset } from '../model/catalog'
import { calculateTotals } from '../lib/calculate-totals'
import {
  EMPTY_GAME,
  issueLoan,
  previewRound,
  settleRound,
  type GameState,
  type RoundAction
} from '../lib/game-economy'

const KEY = 'drachland.game.v3'
const OLD_ASSETS_KEY = 'drachland.owned-assets.v1'

function restoreGame(): GameState {
  try {
    const saved = window.localStorage.getItem(KEY)
    if (!saved) {
      const original: unknown = JSON.parse(
        window.localStorage.getItem(OLD_ASSETS_KEY) ?? '[]'
      )
      const ids = Array.isArray(original)
        ? [
            ...new Set(
              original.filter(
                (value): value is number =>
                  typeof value === 'number' && ASSET_BY_ID.has(value)
              )
            )
          ]
        : []
      return { ...EMPTY_GAME, ownedIds: ids }
    }
    const parsed: unknown = JSON.parse(saved)
    if (typeof parsed !== 'object' || !parsed || Array.isArray(parsed))
      return { ...EMPTY_GAME }
    const data = parsed as Record<string, unknown>
    const ownedIds = Array.isArray(data.ownedIds)
      ? [
          ...new Set(
            data.ownedIds.filter(
              (id): id is number =>
                typeof id === 'number' && ASSET_BY_ID.has(id)
            )
          )
        ]
      : []
    const flippedIds = Array.isArray(data.flippedIds)
      ? [
          ...new Set(
            data.flippedIds.filter(
              (id): id is number =>
                typeof id === 'number' &&
                ownedIds.includes(id) &&
                ASSET_BY_ID.get(id)?.kind === 'company'
            )
          )
        ]
      : []
    let loan: GameState['loan'] = null
    if (
      typeof data.loan === 'object' &&
      data.loan &&
      !Array.isArray(data.loan)
    ) {
      const obj = data.loan as Record<string, unknown>
      if (
        typeof obj.principal === 'number' &&
        Number.isSafeInteger(obj.principal) &&
        obj.principal > 0 &&
        obj.principal <= 100000 &&
        typeof obj.due === 'number' &&
        Number.isSafeInteger(obj.due) &&
        obj.due > 0 &&
        typeof obj.round === 'number' &&
        Number.isInteger(obj.round) &&
        obj.round >= 1 &&
        obj.round <= 3
      ) {
        loan = {
          principal: obj.principal,
          due: obj.due,
          round: obj.round,
          defaulted: obj.defaulted === true
        }
      }
    }
    return {
      ownedIds,
      flippedIds,
      loan,
      roundNumber:
        typeof data.roundNumber === 'number' &&
        Number.isSafeInteger(data.roundNumber) &&
        data.roundNumber >= 1
          ? data.roundNumber
          : 1,
      totalEarned:
        typeof data.totalEarned === 'number' &&
        Number.isFinite(data.totalEarned)
          ? data.totalEarned
          : 0,
      inJail: data.inJail === true
    }
  } catch {
    return { ...EMPTY_GAME }
  }
}

export function useGameState() {
  const [game, setGame] = useState<GameState>(EMPTY_GAME)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setGame(restoreGame())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(KEY, JSON.stringify(game))
    } catch {
      /* Работа без хранилища возможна до перезагрузки. */
    }
  }, [game, hydrated])

  const addAsset = useCallback((id: number) => {
    if (!ASSET_BY_ID.has(id)) return
    setGame(prev =>
      prev.ownedIds.includes(id)
        ? prev
        : { ...prev, ownedIds: [...prev.ownedIds, id] }
    )
  }, [])
  const removeAsset = useCallback((id: number) => {
    setGame(prev => ({
      ...prev,
      ownedIds: prev.ownedIds.filter(current => current !== id),
      flippedIds: prev.flippedIds.filter(current => current !== id)
    }))
  }, [])
  const flipAsset = useCallback((id: number) => {
    if (ASSET_BY_ID.get(id)?.kind !== 'company') return
    setGame(prev => {
      if (!prev.ownedIds.includes(id)) return prev
      return {
        ...prev,
        flippedIds: prev.flippedIds.includes(id)
          ? prev.flippedIds.filter(current => current !== id)
          : [...prev.flippedIds, id]
      }
    })
  }, [])
  const takeLoan = useCallback(
    (amount: number) => setGame(prev => issueLoan(prev, amount)),
    []
  )
  const deleteLoan = useCallback(
    () => setGame(prev => ({ ...prev, loan: null })),
    []
  )
  const releaseJail = useCallback(
    () => setGame(prev => ({ ...prev, inJail: false })),
    []
  )
  const resetGame = useCallback(() => {
    setGame({ ...EMPTY_GAME })
    try {
      window.localStorage.removeItem(OLD_ASSETS_KEY)
    } catch {
      /* noop */
    }
  }, [])

  const finishRound = useCallback(
    (action: RoundAction) => {
      const result = settleRound(game, action)
      setGame(result.next)
      return result.report
    },
    [game]
  )

  const assets: GameAsset[] = useMemo(
    () =>
      game.ownedIds
        .map(id => ASSET_BY_ID.get(id))
        .filter((item): item is GameAsset => item !== undefined),
    [game.ownedIds]
  )
  const totals = useMemo(
    () => calculateTotals(assets, game.flippedIds),
    [assets, game.flippedIds]
  )
  const preview = useMemo(() => previewRound(game), [game])

  return {
    game,
    assets,
    totals,
    preview,
    hydrated,
    addAsset,
    removeAsset,
    flipAsset,
    takeLoan,
    deleteLoan,
    releaseJail,
    resetGame,
    finishRound
  }
}
