'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  title: string
  eyebrow: string
  children: ReactNode
  onClose?: () => void
  icon?: ReactNode
}

export function DialogShell({
  title,
  eyebrow,
  children,
  onClose,
  icon
}: Props) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div
      className='dialog-overlay'
      onMouseDown={event => {
        if (event.target === event.currentTarget && onClose) onClose()
      }}
    >
      <section
        className='game-dialog'
        role='dialog'
        aria-modal='true'
        aria-label={title}
      >
        <div className='dialog-top flex items-start gap-3'>
          {icon && <div className='dialog-icon'>{icon}</div>}
          <div className='min-w-0 flex-1'>
            <p className='dialog-eyebrow'>{eyebrow}</p>
            <h2 className='dialog-title'>{title}</h2>
          </div>
          {onClose && (
            <button
              type='button'
              onClick={onClose}
              className='dialog-close'
              aria-label='Закрыть'
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className='dialog-content'>{children}</div>
      </section>
    </div>
  )
}
