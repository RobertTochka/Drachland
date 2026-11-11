'use client'

import { useState } from 'react'
import { BoardPicker } from '@/features/game/components/BoardPicker'
import { CreditModal } from '@/features/game/components/CreditModal'
import { ResetModal } from '@/features/game/components/ResetModal'
import { RoundModal } from '@/features/game/components/RoundModal'
import { useGameState } from '@/features/game/hooks/use-game-state'
import { BottomControlPanel } from './BottomControlPanel'
import { GameHeader } from './GameHeader'
import { OwnedCompaniesBoard } from './OwnedCompaniesBoard'
import { DeleteModal } from '@/features/game/components/DeleteModal'

type OpenModal = 'none' | 'board' | 'credit' | 'round' | 'reset' | 'delete'

export function HomeScreen() {
  const [modal, setModal] = useState<OpenModal>('none')
  const [assetId, setAssetId] = useState<null | number>(null)
  const {
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
  } = useGameState()

  const openDelete = (id: number) => {
    setAssetId(id)
    setModal('delete')
  }
  const closeDelete = () => {
    setAssetId(null)
    setModal('none')
  }
  const removeComp = () => {
    if (!assetId) return
    removeAsset(assetId)
    setModal('none')
    setAssetId(null)
  }

  return (
    <main className='game-background relative isolate min-h-[100dvh] overflow-hidden text-[#FCF6F1]'>
      <div
        aria-hidden='true'
        className='ambient ambient--left'
      />
      <div
        aria-hidden='true'
        className='ambient ambient--right'
      />
      <div className='phone-shell relative mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden'>
        <GameHeader
          round={game.roundNumber}
          earned={game.totalEarned}
          inJail={false}
          onRestart={() => setModal('reset')}
        />
        <div className='min-h-0 flex-1 px-[8px] pb-[6px]'>
          <OwnedCompaniesBoard
            assets={assets}
            flippedIds={game.flippedIds}
            onFlip={flipAsset}
            onRemove={removeAsset}
            onOpenDelete={openDelete}
            totalPrice={totals.price}
          />
        </div>
        <BottomControlPanel
          income={totals.income}
          taxes={totals.taxes}
          onOpenBoard={() => setModal('board')}
          onOpenCredit={() => setModal('credit')}
          onFinishRound={() => setModal('round')}
        />
      </div>
      {hydrated && modal === 'board' && (
        <BoardPicker
          ownedIds={game.ownedIds}
          onSelect={addAsset}
          onClose={() => setModal('none')}
          income={totals.income}
          taxes={totals.taxes}
        />
      )}
      {hydrated && modal === 'credit' && (
        <CreditModal
          loan={game.loan}
          inJail={game.inJail}
          onTakeLoan={takeLoan}
          onDeleteLoan={deleteLoan}
          onReleaseJail={releaseJail}
          onClose={() => setModal('none')}
        />
      )}
      {hydrated && modal === 'round' && (
        <RoundModal
          preview={preview}
          onSettle={finishRound}
          onClose={() => setModal('none')}
        />
      )}
      {hydrated && modal === 'reset' && (
        <ResetModal
          onClose={() => setModal('none')}
          onConfirm={() => {
            resetGame()
            setModal('none')
          }}
        />
      )}
      {hydrated && modal === 'delete' && (
        <DeleteModal
          onClose={closeDelete}
          onConfirm={removeComp}
        />
      )}
    </main>
  )
}
