import Image from 'next/image'
import { Building2, Layers3, Plus, X, RotateCcw, Zap } from 'lucide-react'
import type { GameAsset } from '@/features/game/model/catalog'
import {
  ASSET_KIND_LABEL,
  formatGameNumber
} from '@/features/game/model/catalog'
import {
  KeyboardEvent,
  PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

function EmptyPortfolio() {
  return (
    <div className='flex max-w-[290px] flex-col items-center px-4 text-center'>
      <div className='portfolio-illustration relative mb-[18px] flex h-[150px] w-[240px] items-center justify-center'>
        <div className='portfolio-ring portfolio-ring--outer' />
        <div className='portfolio-ring portfolio-ring--inner' />
        <div className='ghost-card ghost-card--left'>
          <div className='ghost-card__line w-[51%]' />
          <div className='ghost-card__line mt-[9px] w-[72%] opacity-40' />
        </div>
        <div className='ghost-card ghost-card--right'>
          <div className='ghost-card__line w-[52%]' />
          <div className='ghost-card__line mt-[9px] w-[68%] opacity-40' />
        </div>
        <div className='portfolio-center relative z-10 flex size-[74px] items-center justify-center rounded-[24px]'>
          <Building2
            size={34}
            strokeWidth={1.5}
          />
        </div>
        <div className='portfolio-plus portfolio-plus--a'>
          <Plus size={14} />
        </div>
        <div className='portfolio-plus portfolio-plus--b'>
          <Plus size={12} />
        </div>
      </div>
      <h2 className='text-[19px] font-bold tracking-[-.04em] text-white'>
        Построй свою империю
      </h2>
      <p className='mt-[8px] text-[12px] leading-[1.6] text-[#92909D]'>
        Нажми «Купить активы», чтобы выбрать компании, транспорт, машины и
        оружие
      </p>
    </div>
  )
}

const HOLD_MS = 500

function OwnedAssetCard({
  asset,
  flipped,
  onFlip,
  onRemove,
  onComplete
}: {
  asset: GameAsset
  flipped: boolean
  onFlip: (id: number) => void
  onRemove: (id: number) => void
  onComplete: (id: number) => void
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressed = useRef(false)

  const isCompany = asset.kind === 'company'

  const stop = useCallback(() => {
    pressed.current = false
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
  }, [])
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    []
  )

  const start = useCallback(() => {
    if (pressed.current) return
    pressed.current = true
    timer.current = setTimeout(() => {
      pressed.current = false
      timer.current = null
      onComplete(asset.id)
    }, HOLD_MS)
  }, [onComplete])

  const pointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    start()
  }

  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (!event.repeat) start()
    }
  }

  const keyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      stop()
    }
  }

  return (
    <article
      className={`owned-asset-card ${flipped ? 'owned-asset-card--flipped' : ''}`}
      onPointerDown={pointerDown}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onPointerLeave={stop}
      onKeyDown={keyDown}
      onKeyUp={keyUp}
      onContextMenu={event => event.preventDefault()}
    >
      <div className='owned-asset-card__image-wrap'>
        <div className={`asset-flip__inner ${flipped ? 'is-flipped' : ''}`}>
          <div className='asset-flip__front'>
            <Image
              src={asset.imageUrl}
              alt={asset.name}
              width={370}
              height={208}
              unoptimized
              className='owned-asset-card__image'
            />
          </div>
          <div className='asset-flip__back'>
            <Zap size={18} />
            <strong>ДОХОД НА ПАУЗЕ</strong>
            <span>До следующего круга</span>
          </div>
        </div>
        {isCompany && (
          <button
            type='button'
            className='owned-asset-card__image-tap'
            onClick={() => onFlip(asset.id)}
            aria-label={
              flipped ? `Развернуть ${asset.name}` : `Перевернуть ${asset.name}`
            }
            title='Нажмите, чтобы перевернуть'
          />
        )}
      </div>
      <div className='owned-asset-card__body'>
        <h3 title={asset.name}>{asset.name}</h3>
        <div className='owned-asset-card__info'>
          {isCompany ? (
            <span
              className={flipped ? 'muted-label' : 'owned-asset-card__income'}
            >
              {flipped
                ? 'Доход 0 · перевернута'
                : `Доход +${formatGameNumber(asset.income)}`}
            </span>
          ) : asset.tax > 0 ? (
            <span className='owned-asset-card__tax'>
              Налог −{formatGameNumber(asset.tax)}
            </span>
          ) : (
            <span className='muted-label'>Без дохода и налогов</span>
          )}
        </div>
      </div>
    </article>
  )
}

export function OwnedCompaniesBoard({
  assets,
  flippedIds,
  onFlip,
  onRemove,
  onOpenDelete,
  totalPrice
}: {
  assets: GameAsset[]
  flippedIds: number[]
  onFlip: (id: number) => void
  onRemove: (id: number) => void
  onOpenDelete: (id: number) => void
  totalPrice: number
}) {
  const flips = new Set(flippedIds)
  return (
    <section
      aria-labelledby='portfolio-heading'
      className='asset-board relative flex h-full min-h-0 flex-col overflow-hidden rounded-[26px]'
    >
      <div
        aria-hidden
        className='asset-board__glow'
      />
      <div
        aria-hidden
        className='asset-board__mesh'
      />
      <div className='relative z-10 flex shrink-0 items-start justify-between gap-2 px-[16px] pt-[12px]'>
        <div>
          <h1
            id='portfolio-heading'
            className='text-[20px] leading-tight font-extrabold tracking-[-.05em] text-white'
          >
            Мои активы
          </h1>
        </div>
        <div className='asset-counter flex items-center gap-2 rounded-xl px-3 py-[5px]'>
          <Layers3 size={16} />
          <span className='text-[13px] font-bold tabular-nums'>
            {assets.length}
          </span>
        </div>
      </div>
      {assets.length ? (
        <div className='owned-assets-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-[12px] pt-[12px] pb-[12px]'>
          <div className='grid grid-cols-2 items-start gap-[10px]'>
            {assets.map(asset => (
              <OwnedAssetCard
                key={asset.id}
                asset={asset}
                flipped={flips.has(asset.id)}
                onFlip={onFlip}
                onRemove={onRemove}
                onComplete={onOpenDelete}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className='relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto overscroll-contain'>
          <EmptyPortfolio />
        </div>
      )}
      <div className='relative z-10 mx-[18px] flex shrink-0 items-center justify-between gap-2 border-t border-white/[.08] py-[13px]'>
        <span className='text-[10px] text-[#9C95A1]'>
          Общая стоимость{' '}
          <b className='text-[#E9D7C9]'>{formatGameNumber(totalPrice)}</b>
        </span>
        <span className='asset-footer-count'>
          <span className='pulse-dot' /> {assets.length} активов
          {!!flippedIds.length && (
            <>
              <span className='pulse-dot' />
              {flippedIds.length} без дохода
            </>
          )}
        </span>
      </div>
    </section>
  )
}
