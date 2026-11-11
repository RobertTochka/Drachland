import { Trash } from 'lucide-react'
import { DialogShell } from './DialogShell'

export function DeleteModal({
  onClose,
  onConfirm
}: {
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <DialogShell
      eyebrow='Удаление'
      title='Удалить?'
      icon={<Trash size={22} />}
      onClose={onClose}
    >
      <button
        type='button'
        className='modal-danger mt-5 mb-5'
        onClick={onConfirm}
      >
        Да, удалить
      </button>
    </DialogShell>
  )
}
