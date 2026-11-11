import { AlertTriangle, RotateCcw } from 'lucide-react'
import { DialogShell } from './DialogShell'

export function ResetModal({
  onClose,
  onConfirm
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <DialogShell
      eyebrow='НОВАЯ ИГРА'
      title='Сбросить прогресс?'
      icon={<RotateCcw size={22} />}
      onClose={onClose}
    >
      <div className='notice notice--danger mt-3'>
        <AlertTriangle size={20} />
        <div>
          <b>Это действие необратимо.</b>
          <p>
            Будут удалены все компании, транспорт, машины и оружие; сбросятся
            перевороты карт, кредит, доходы за круги, номер круга и отметка о
            тюрьме.
          </p>
        </div>
      </div>
      <button
        type='button'
        className='modal-danger mt-5'
        onClick={onConfirm}
      >
        Да, начать заново
      </button>
      <button
        type='button'
        className='modal-secondary mt-2'
        onClick={onClose}
      >
        Нет, продолжить игру
      </button>
    </DialogShell>
  )
}
