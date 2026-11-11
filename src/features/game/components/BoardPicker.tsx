'use client'

import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent
} from 'react'
import { Check, CheckCheck, Minus, Plus, X } from 'lucide-react'
import { BOARD_ASSETS, ASSET_BY_ID, formatGameNumber } from '../model/catalog'
import {
  BOARD_HOTSPOTS,
  BOARD_REFERENCE_SIZE,
  findHotspot
} from '../model/board-hotspots'

const BOARD_RATIO = 3690 / 4000
const MIN_SCALE = 1
const MAX_SCALE = 5
const clamp = (value: number, lower: number, upper: number) =>
  Math.max(lower, Math.min(upper, value))

type Position = { x: number; y: number }
type Transform = Position & { scale: number }
const INITIAL_TRANSFORM: Transform = { scale: 1, x: 0, y: 0 }

type BoardPickerProps = {
  ownedIds: number[]
  onSelect: (id: number) => void
  onClose: () => void
  income: number
  taxes: number
}

export function BoardPicker({
  ownedIds,
  onSelect,
  onClose,
  income,
  taxes
}: BoardPickerProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const activePointers = useRef(new Map<number, Position>())
  const tapOrigin = useRef<{
    id: number
    x: number
    y: number
    started: number
  } | null>(null)
  const transformRef = useRef<Transform>(INITIAL_TRANSFORM)
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM)
  const [feedback, setFeedback] = useState('Выберите карточку на игровом поле')

  useEffect(() => {
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = oldOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const updateTransform = useCallback((next: Transform) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const scale = clamp(next.scale, MIN_SCALE, MAX_SCALE)
    const baseWidth = viewport.clientWidth
    const baseHeight = baseWidth * BOARD_RATIO
    const overflowX = Math.max(
      0,
      (baseWidth * scale - viewport.clientWidth) / 2
    )
    const overflowY = Math.max(
      0,
      (baseHeight * scale - viewport.clientHeight) / 2
    )
    const limited = {
      scale,
      x: clamp(next.x, -overflowX, overflowX),
      y: clamp(next.y, -overflowY, overflowY)
    }
    transformRef.current = limited
    setTransform(limited)
  }, [])

  const zoomAt = useCallback(
    (
      factor: number,
      clientX?: number,
      clientY?: number,
      deltaX = 0,
      deltaY = 0
    ) => {
      const viewport = viewportRef.current
      if (!viewport) return
      const rect = viewport.getBoundingClientRect()
      const focusX =
        (clientX ?? rect.left + rect.width / 2) - rect.left - rect.width / 2
      const focusY =
        (clientY ?? rect.top + rect.height / 2) - rect.top - rect.height / 2
      const previous = transformRef.current
      const scale = clamp(previous.scale * factor, MIN_SCALE, MAX_SCALE)
      const ratio = scale / previous.scale
      const nextPanX = previous.x + deltaX
      const nextPanY = previous.y + deltaY
      updateTransform({
        scale,
        x: focusX + (nextPanX - focusX) * ratio,
        y: focusY + (nextPanY - focusY) * ratio
      })
    },
    [updateTransform]
  )

  const chooseAt = useCallback(
    (clientX: number, clientY: number) => {
      const viewport = viewportRef.current
      if (!viewport) return
      const bounds = viewport.getBoundingClientRect()
      const localX = clientX - bounds.left - bounds.width / 2
      const localY = clientY - bounds.top - bounds.height / 2
      const t = transformRef.current
      const boardX =
        ((localX - t.x) / t.scale / bounds.width + 0.5) *
        BOARD_REFERENCE_SIZE.width
      const boardY =
        ((localY - t.y) / t.scale / (bounds.width * BOARD_RATIO) + 0.5) *
        BOARD_REFERENCE_SIZE.height
      const hotspot = findHotspot(boardX, boardY)
      if (!hotspot) {
        setFeedback('Выберите карточку на игровом поле')
        return
      }
      const asset = ASSET_BY_ID.get(hotspot.id)
      if (!asset) return
      if (ownedIds.includes(asset.id)) {
        setFeedback(`${asset.name} уже в вашем портфеле`)
        return
      }
      onSelect(asset.id)
      setFeedback(
        `✓ ${asset.name} · ${asset.price ? `Цена ${asset.price}` : 'Без стоимости'} · ${asset.income ? `Доход +${asset.income}` : asset.tax ? `Налог −${asset.tax}` : 'Без дохода и налогов'}`
      )
    },
    [ownedIds, onSelect]
  )

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    activePointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY
    })
    if (activePointers.current.size === 1) {
      tapOrigin.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        started: Date.now()
      }
    } else {
      tapOrigin.current = null
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointers = activePointers.current
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    const next = { x: event.clientX, y: event.clientY }
    if (
      tapOrigin.current &&
      Math.hypot(next.x - tapOrigin.current.x, next.y - tapOrigin.current.y) > 9
    ) {
      tapOrigin.current = null
    }

    if (pointers.size === 1) {
      const t = transformRef.current
      updateTransform({
        ...t,
        x: t.x + next.x - previous.x,
        y: t.y + next.y - previous.y
      })
    } else if (pointers.size === 2) {
      const before = [...pointers.values()]
      pointers.set(event.pointerId, next)
      const after = [...pointers.values()]
      const oldDistance = Math.hypot(
        before[0].x - before[1].x,
        before[0].y - before[1].y
      )
      const newDistance = Math.hypot(
        after[0].x - after[1].x,
        after[0].y - after[1].y
      )
      const previousCenter = {
        x: (before[0].x + before[1].x) / 2,
        y: (before[0].y + before[1].y) / 2
      }
      const nextCenter = {
        x: (after[0].x + after[1].x) / 2,
        y: (after[0].y + after[1].y) / 2
      }
      zoomAt(
        oldDistance > 0 ? newDistance / oldDistance : 1,
        nextCenter.x,
        nextCenter.y,
        nextCenter.x - previousCenter.x,
        nextCenter.y - previousCenter.y
      )
      return
    }
    pointers.set(event.pointerId, next)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointers = activePointers.current
    const tap = tapOrigin.current
    const isTap =
      pointers.size === 1 &&
      tap?.id === event.pointerId &&
      Math.hypot(event.clientX - tap.x, event.clientY - tap.y) <= 9 &&
      Date.now() - tap.started < 900
    pointers.delete(event.pointerId)
    tapOrigin.current = null
    if (isTap) chooseAt(event.clientX, event.clientY)
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    activePointers.current.delete(event.pointerId)
    tapOrigin.current = null
  }

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    zoomAt(event.deltaY < 0 ? 1.14 : 1 / 1.14, event.clientX, event.clientY)
  }

  return (
    <div
      className='board-picker'
      role='dialog'
      aria-modal='true'
      aria-label='Игровое поле для выбора компаний'
    >
      <div className='board-picker__header'>
        <div className='min-w-0'>
          <p className='board-picker__eyebrow'>ИГРОВОЕ ПОЛЕ</p>
          <h2 className='board-picker__title'>
            Выбор активов{' '}
            <span className='ml-2'>
              {ownedIds.length}/{BOARD_ASSETS.length}
            </span>
          </h2>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='board-picker__close'
          aria-label='Закрыть поле'
        >
          <X size={22} />
        </button>
      </div>

      <div
        className='board-picker__viewport'
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onWheel={handleWheel}
        onContextMenu={event => event.preventDefault()}
      >
        <div
          className='board-picker__canvas'
          style={{
            transform: `translate(-50%, -50%) translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`
          }}
        >
          <Image
            src='/assets/board_new_mini.webp'
            alt='Игровая доска DRACHLAND с компаниями и транспортом'
            width={4000}
            height={3690}
            sizes='100vw'
            quality={88}
            unoptimized
            priority
            draggable={false}
            className='board-picker__image'
          />
          {BOARD_HOTSPOTS.filter(({ id }) => ownedIds.includes(id)).map(
            area => (
              <div
                key={area.id}
                className='board-picker__owned'
                style={{
                  left: `${(area.x / BOARD_REFERENCE_SIZE.width) * 100}%`,
                  top: `${(area.y / BOARD_REFERENCE_SIZE.height) * 100}%`,
                  width: `${(area.width / BOARD_REFERENCE_SIZE.width) * 100}%`,
                  height: `${(area.height / BOARD_REFERENCE_SIZE.height) * 100}%`
                }}
              >
                <Check
                  size={14}
                  strokeWidth={3}
                />
              </div>
            )
          )}
        </div>
        <div
          className='board-picker__zoom'
          aria-label='Управление масштабом'
          onPointerDown={event => event.stopPropagation()}
          onPointerMove={event => event.stopPropagation()}
          onPointerUp={event => event.stopPropagation()}
        >
          <button
            type='button'
            aria-label='Увеличить'
            onClick={() => zoomAt(1.45)}
          >
            <Plus size={20} />
          </button>
          <div className='board-picker__scale'>
            {Math.round(transform.scale * 100)}%
          </div>
          <button
            type='button'
            aria-label='Уменьшить'
            onClick={() => zoomAt(1 / 1.45)}
          >
            <Minus size={20} />
          </button>
          <button
            type='button'
            aria-label='Показать всё поле'
            onClick={() => updateTransform(INITIAL_TRANSFORM)}
            className='board-picker__reset'
          >
            1:1
          </button>
        </div>
      </div>

      <div className='board-picker__footer'>
        <p
          className='board-picker__feedback'
          aria-live='polite'
        >
          <CheckCheck size={16} />
          {feedback}
        </p>
        <div className='board-picker__summary'>
          <span>
            Доход <b>+{formatGameNumber(income)}</b>
          </span>
          <span>
            Налоги <b>−{formatGameNumber(taxes)}</b>
          </span>
        </div>
        <button
          type='button'
          className='board-picker__done'
          onClick={onClose}
        >
          Готово <Check size={18} />
        </button>
      </div>
    </div>
  )
}
