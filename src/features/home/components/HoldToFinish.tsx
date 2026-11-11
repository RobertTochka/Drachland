'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent
} from 'react'
import { ArrowRight, Timer } from 'lucide-react'

const HOLD_MS = 1000

export function HoldToFinish({ onComplete }: { onComplete: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressed = useRef(false)
  const [holding, setHolding] = useState(false)
  const stop = useCallback(() => {
    pressed.current = false
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
    setHolding(false)
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
    setHolding(true)
    timer.current = setTimeout(() => {
      pressed.current = false
      timer.current = null
      setHolding(false)
      onComplete()
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
    <button
      type='button'
      className={`finish-hold ${holding ? 'is-holding' : ''}`}
      onPointerDown={pointerDown}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onPointerLeave={stop}
      onKeyDown={keyDown}
      onKeyUp={keyUp}
      onContextMenu={event => event.preventDefault()}
      aria-label='Удерживайте 1 секунду для завершения круга'
    >
      <span
        className='finish-hold__fill'
        aria-hidden='true'
      />
      <span className='finish-hold__content'>
        <Timer size={19} />
        <span>{holding ? 'Держите...' : 'Завершить круг'}</span>
        <ArrowRight size={19} />
      </span>
      <span className='finish-hold__hint'>Удерживать 1 сек.</span>
    </button>
  )
}
