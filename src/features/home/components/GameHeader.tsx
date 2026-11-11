import Image from 'next/image'
import { RotateCcw, Landmark, LockKeyhole } from 'lucide-react'
import { gameAssets } from '@/shared/assets/game-assets'
import { formatGameNumber } from '@/features/game/model/catalog'

type Props = {
  round: number
  earned: number
  inJail: boolean
  onRestart: () => void
}

export function GameHeader({ round, earned, inJail, onRestart }: Props) {
  return (
    <header className='game-header shrink-0 px-[14px] pt-[calc(env(safe-area-inset-top)+17px)] pb-[8px]'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-[14px]'>
          <div className='app-icon relative size-[47px] shrink-0 overflow-hidden rounded-[15px]'>
            <Image
              src={gameAssets.icon}
              alt='Иконка DRACHLAND'
              fill
              sizes='47px'
              priority
              className='object-cover'
            />
          </div>
          <div className='flex min-w-0 flex-col gap-[3px]'>
            <Image
              src={gameAssets.logo}
              alt='DRACHLAND'
              width={180}
              height={76}
              priority
              className='h-[32px] w-[156px] object-contain object-left brightness-0 invert'
            />
          </div>
        </div>
        <button
          type='button'
          onClick={onRestart}
          aria-label='Сбросить игру'
          title='Начать новую игру'
          className='icon-button shrink-0'
        >
          <RotateCcw
            size={20}
            strokeWidth={1.9}
          />
        </button>
      </div>
      <div className='header-meta mt-[13px] flex items-center justify-between gap-2'>
        <span className='round-badge'>
          <span className='pulse-dot' />
          КРУГ {round}
        </span>
      </div>
      {inJail && (
        <div className='jail-ribbon mt-3'>
          <LockKeyhole size={14} /> ТЮРЬМА · просрочка кредита
        </div>
      )}
    </header>
  )
}
