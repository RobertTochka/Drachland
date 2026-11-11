import type { LucideIcon } from 'lucide-react'

type ActionButtonProps = {
  label: string
  icon: LucideIcon
  variant?: 'default' | 'primary'
  className?: string
  onClick?: () => void
}

export function ActionButton({ label, icon: Icon, variant = 'default', className = '', onClick }: ActionButtonProps) {
  return (
    <button type="button" disabled={!onClick} onClick={onClick}
      title={!onClick ? 'Функция появится позже' : undefined}
      className={`action-button ${variant === 'primary' ? 'action-button--primary' : 'action-button--default'} ${className}`}>
      <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
      <span>{label}</span>
    </button>
  )
}
