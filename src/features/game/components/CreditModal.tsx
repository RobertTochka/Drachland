'use client'

import { useState } from 'react'
import {
  CreditCard,
  Landmark,
  ShieldAlert,
  Trash2,
  TrendingUp
} from 'lucide-react'
import type { Loan } from '../lib/game-economy'
import { initialLoanDue, loanExtensionFee } from '../lib/game-economy'
import { formatGameNumber } from '../model/catalog'
import { DialogShell } from './DialogShell'

type Props = {
  loan: Loan | null
  inJail: boolean
  onTakeLoan: (amount: number) => void
  onDeleteLoan: () => void
  onReleaseJail: () => void
  onClose: () => void
}

export function CreditModal({
  loan,
  inJail,
  onTakeLoan,
  onDeleteLoan,
  onReleaseJail,
  onClose
}: Props) {
  const [rawAmount, setRawAmount] = useState('5')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const parsed = Number(rawAmount)
  const valid =
    rawAmount.trim() !== '' &&
    Number.isSafeInteger(parsed) &&
    parsed >= 1 &&
    parsed <= 100
  const repayment = valid ? initialLoanDue(parsed) : 0
  const surcharge = valid ? loanExtensionFee(parsed) : 0

  return (
    <DialogShell
      eyebrow='ФИНАНСЫ'
      title='Кредитный центр'
      onClose={onClose}
      icon={<CreditCard size={23} />}
    >
      {loan ? (
        <>
          <div
            className={`loan-status ${loan.defaulted ? 'loan-status--danger' : ''}`}
          >
            <div className='flex items-center justify-between gap-2'>
              <span>
                {loan.defaulted ? 'ПРОСРОЧЕННЫЙ КРЕДИТ' : 'АКТИВНЫЙ КРЕДИТ'}
              </span>
              <Landmark size={18} />
            </div>
            <strong>{formatGameNumber(loan.due)}</strong>
            <p>Осталось погасить</p>
          </div>
          <div className='credit-details'>
            <div>
              <span>Первоначально взято</span>
              <b>{formatGameNumber(loan.principal)}</b>
            </div>
            <div>
              <span>Сумма к возврату</span>
              <b>{formatGameNumber(loan.due)}</b>
            </div>
            <div>
              <span>Круг с кредитом</span>
              <b>{loan.round} из 3</b>
            </div>
            {!loan.defaulted && (
              <div>
                <span>Штраф за перенос</span>
                <b>+{formatGameNumber(loanExtensionFee(loan.principal))}</b>
              </div>
            )}
          </div>
          <div className='notice notice--info mt-3'>
            <TrendingUp size={17} />
            <div>
              В конце круга можно погасить долг или продлить его. На третьем
              круге отказ приведет к продаже компаний и тюрьме.
            </div>
          </div>
          {confirmDelete ? (
            <div className='delete-confirm mt-4'>
              <b>Удалить текущий кредит?</b>
              <div className='mt-3 grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  className='modal-secondary'
                  onClick={() => setConfirmDelete(false)}
                >
                  Отмена
                </button>
                <button
                  type='button'
                  className='modal-danger'
                  onClick={() => {
                    onDeleteLoan()
                    onClose()
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ) : (
            <button
              type='button'
              className='modal-danger mt-4'
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} /> Удалить кредит
            </button>
          )}
        </>
      ) : (
        <>
          <div className='loan-intro'>
            <p>Одновременно доступен только один кредит</p>
            <strong>Сколько нужно?</strong>
            <span>От 1 до 100 игровых единиц</span>
          </div>
          <label
            className='credit-label'
            htmlFor='loan-amount'
          >
            СУММА КРЕДИТА
          </label>
          <div className='credit-input-wrap'>
            <Landmark size={20} />
            <input
              id='loan-amount'
              type='number'
              min='1'
              max='100'
              step='1'
              inputMode='numeric'
              value={rawAmount}
              onChange={event => setRawAmount(event.target.value)}
              aria-invalid={!valid}
            />
            <span>ед.</span>
          </div>
          {!valid && (
            <p className='credit-error'>Введите целое число от 1 до 100.</p>
          )}
          <div className='credit-preview'>
            <div>
              <span>Вы получите</span>
              <b>{valid ? formatGameNumber(parsed) : '—'}</b>
            </div>
            <div>
              <span>Вернуть в конце круга</span>
              <b className='accent-warm'>
                {valid ? formatGameNumber(repayment) : '—'}
              </b>
            </div>
            <div>
              <span>Каждый перенос</span>
              <b>{valid ? `+${formatGameNumber(surcharge)}` : '—'}</b>
            </div>
          </div>
          <p className='credit-note'>
            Переплата: 50% от суммы (минимум 5). За перенос: 30% от исходной
            суммы (минимум 3). Округление вверх.
          </p>
          <button
            className='modal-primary mt-4'
            type='button'
            disabled={!valid}
            onClick={() => {
              onTakeLoan(parsed)
              onClose()
            }}
          >
            Взять кредит <CreditCard size={24} />
          </button>
        </>
      )}
    </DialogShell>
  )
}
