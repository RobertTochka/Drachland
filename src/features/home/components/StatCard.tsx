import type { LucideIcon } from 'lucide-react'
import { formatGameNumber } from '@/features/game/model/catalog'

type StatCardProps = { label: string; value: number; icon: LucideIcon; tone: 'income' | 'taxes' }

export function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  const isIncome = tone === 'income'
  return (
    <div className={`stat-card flex min-w-0 items-center gap-[10px] rounded-[17px] px-[12px] py-[13px] ${isIncome ? 'stat-card--income' : 'stat-card--taxes'}`}>
      <div className={`flex size-[33px] shrink-0 items-center justify-center rounded-[11px] ${isIncome ? 'bg-[#54D9E820] text-[#5DDAEF]' : 'bg-[#FF98501F] text-[#FFA56D]'}`}>
        <Icon aria-hidden="true" size={17} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium text-[#9E9194]">{label}</p>
        <p className={`mt-[3px] whitespace-nowrap text-[17px] font-bold leading-none tracking-[-0.035em] tabular-nums ${isIncome ? 'text-[#7DDFEE]' : 'text-[#FFD1AA]'}`}>
          {isIncome ? '+' : '−'}{formatGameNumber(value)}
        </p>
      </div>
    </div>
  )
}
