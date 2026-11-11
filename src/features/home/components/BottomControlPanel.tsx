import { ArrowDownLeft, ArrowUpRight, CreditCard, Store } from 'lucide-react'
import { ActionButton } from './ActionButton'
import { StatCard } from './StatCard'
import { HoldToFinish } from './HoldToFinish'

type Props = {
  income: number
  taxes: number
  onOpenBoard: () => void
  onOpenCredit: () => void
  onFinishRound: () => void
}

export function BottomControlPanel({
  income,
  taxes,
  onOpenBoard,
  onOpenCredit,
  onFinishRound
}: Props) {
  return (
    <footer className='relative z-20 shrink-0 px-[8px] pt-[2px] pb-[calc(env(safe-area-inset-bottom)+12px)]'>
      <div className='control-panel rounded-[24px] p-[12px]'>
        <div className='grid grid-cols-2 gap-[9px]'>
          <StatCard
            label='Доход за круг'
            value={income}
            icon={ArrowUpRight}
            tone='income'
          />
          <StatCard
            label='Налоги за круг'
            value={taxes}
            icon={ArrowDownLeft}
            tone='taxes'
          />
        </div>
        <div className='mt-[10px] grid grid-cols-2 gap-[9px]'>
          <ActionButton
            label='Взять кредит'
            icon={CreditCard}
            onClick={onOpenCredit}
          />
          <ActionButton
            label='Купить активы'
            icon={Store}
            onClick={onOpenBoard}
          />
        </div>
        <div className='mt-[9px]'>
          <HoldToFinish onComplete={onFinishRound} />
        </div>
      </div>
    </footer>
  )
}
