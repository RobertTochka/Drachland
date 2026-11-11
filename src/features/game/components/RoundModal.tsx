'use client'

import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Coins,
  RotateCcw,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import { formatGameNumber, ASSET_BY_ID } from '../model/catalog'
import type {
  RoundAction,
  RoundPreview,
  RoundReport
} from '../lib/game-economy'
import { DialogShell } from './DialogShell'

type Props = {
  preview: RoundPreview
  onSettle: (choice: RoundAction, repaymentAmount?: number) => RoundReport
  onClose: () => void
}

export function RoundModal({ preview, onSettle, onClose }: Props) {
  const [report, setReport] = useState<RoundReport | null>(null)
  const [pending, setPending] = useState(false)
  const [repaymentInput, setRepaymentInput] = useState('0')

  const due = preview.loan?.due ?? 0
  const enteredAmount =
    repaymentInput.trim() === '' ? 0 : Number(repaymentInput)
  const repaymentAmount = Number.isFinite(enteredAmount)
    ? Math.min(due, Math.max(0, Math.floor(enteredAmount)))
    : 0
  const remainingBeforeInterest = Math.max(0, due - repaymentAmount)
  const isDefaulted = Boolean(preview.loan?.defaulted)
  const lastCreditRound = Boolean(preview.loan?.round === 3 && !isDefaulted)

  const commit = (choice: RoundAction, amount?: number) => {
    if (pending || report) return
    setPending(true)
    const completed = onSettle(choice, amount)
    setReport(completed)
  }

  const updateRepayment = (value: string) => {
    if (value === '') {
      setRepaymentInput('')
      return
    }
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return
    setRepaymentInput(String(Math.min(due, Math.max(0, Math.floor(numeric)))))
  }

  return (
    <DialogShell
      eyebrow={`КРУГ ${preview.round}`}
      title={report ? 'Круг завершён!' : 'Итоги круга'}
      icon={report ? <Sparkles size={23} /> : <Coins size={23} />}
      onClose={onClose}
    >
      <div
        className='round-hero'
        key={report ? 'completed' : 'preview'}
      >
        <p>{report ? 'ИТОГО ЗА КРУГ' : 'НАЧИСЛЕНИЕ ЗА КРУГ'}</p>
        <strong
          className={report && report.finalPayout < 0 ? 'is-negative' : ''}
        >
          {report
            ? (report.finalPayout >= 0 ? '+' : '−') +
              formatGameNumber(Math.abs(report.finalPayout))
            : (preview.net >= 0 ? '+' : '−') +
              formatGameNumber(Math.abs(preview.net))}
        </strong>
        <span>
          {report
            ? 'Расчёт сохранён. Карты снова активны.'
            : 'Данные по текущим картам'}
        </span>
      </div>

      <div className='round-breakdown'>
        <div>
          <span>
            <ArrowUpRight size={15} /> Доход от компаний
          </span>
          <b>+{formatGameNumber(preview.income)}</b>
        </div>
        {preview.minimumBonus > 0 && (
          <div>
            <span>
              <Sparkles size={15} /> Доплата до 12
            </span>
            <b className='accent-warm'>
              +{formatGameNumber(preview.minimumBonus)}
            </b>
          </div>
        )}
        <div>
          <span>
            <ArrowDownRight size={15} /> Транспортные налоги
          </span>
          <b className='accent-danger'>−{formatGameNumber(preview.taxes)}</b>
        </div>
        {report && report.creditPaid > 0 && (
          <div>
            <span>
              <Coins size={15} /> Погашение кредита
            </span>
            <b className='accent-danger'>
              −{formatGameNumber(report.creditPaid)}
            </b>
          </div>
        )}
        {preview.flippedCount > 0 && (
          <div>
            <span>
              <RotateCcw size={15} /> Перевернутых компаний
            </span>
            <b>{preview.flippedCount}</b>
          </div>
        )}
      </div>

      {report ? (
        <>
          {report.jailed && (
            <div className='notice notice--danger'>
              <ShieldAlert size={19} />
              <div>
                <b>Отправка в тюрьму</b>
                <p>
                  Для оплаты долга {formatGameNumber(report.liquidationDebt)}{' '}
                  проданы компании на {formatGameNumber(report.soldValue)}.{' '}
                  {report.unpaidDebt
                    ? `Остаток долга: ${formatGameNumber(report.unpaidDebt)}.`
                    : 'Кредит закрыт.'}
                </p>
                {report.soldIds.length > 0 && (
                  <p className='mt-2'>
                    Проданы:{' '}
                    {report.soldIds
                      .map(id => ASSET_BY_ID.get(id)?.name ?? id)
                      .join(', ')}
                    .
                  </p>
                )}
              </div>
            </div>
          )}
          {!report.jailed && report.nextDebt > 0 && (
            <div className='notice notice--info'>
              <Coins size={17} />
              <div>
                {report.creditPaid > 0
                  ? `Частично погашено ${formatGameNumber(report.creditPaid)}. `
                  : 'Кредит перенесён на следующий круг. '}
                {preview.loan?.defaulted ? (
                  <>
                    Остаток просроченного долга:{' '}
                    <b>{formatGameNumber(report.nextDebt)}</b>.
                  </>
                ) : (
                  <>
                    Остаток долга: <b>{formatGameNumber(report.nextDebt)}</b>.
                  </>
                )}
              </div>
            </div>
          )}
          <button
            type='button'
            className='modal-primary mt-4'
            onClick={onClose}
          >
            Продолжить игру <Check size={18} />
          </button>
        </>
      ) : (
        <>
          {preview.loan ? (
            <div className='credit-decision'>
              <div className='credit-decision__heading flex justify-between gap-2'>
                <span>Активный кредит</span>
                <b>{preview.loan.round}/3 круг</b>
              </div>
              <div className='credit-decision__due'>
                К погашению <b>{formatGameNumber(preview.loan.due)}</b>
              </div>

              <label
                className='credit-repay'
                htmlFor='round-repayment'
              >
                <span>Погасить</span>
                <span className='credit-repay__field'>
                  <input
                    id='round-repayment'
                    type='number'
                    inputMode='numeric'
                    min={0}
                    max={preview.loan.due}
                    step={1}
                    value={repaymentInput}
                    disabled={pending}
                    onChange={event => updateRepayment(event.target.value)}
                    onBlur={() => {
                      if (repaymentInput.trim() === '') setRepaymentInput('0')
                    }}
                    aria-label='Сумма частичного погашения кредита'
                  />
                  <span>из {formatGameNumber(preview.loan.due)}</span>
                </span>
              </label>

              {repaymentAmount > 0 && repaymentAmount < due && (
                <p className='credit-repay__hint'>
                  После платежа останется{' '}
                  {formatGameNumber(remainingBeforeInterest)}
                  {isDefaulted ? ' просроченного долга.' : ' долга.'}
                </p>
              )}

              {lastCreditRound && (
                <div className='notice notice--danger mt-3'>
                  <CircleAlert size={18} />
                  <div>
                    Последний круг! Если после платежа останется долг, компании
                    будут проданы для его покрытия, а игрок отправится в тюрьму.
                  </div>
                </div>
              )}
              {isDefaulted && (
                <div className='notice notice--danger mt-3'>
                  <ShieldAlert size={18} />
                  <div>
                    Кредит уже просрочен. Частичный платёж уменьшит долг, но
                    продлить его нельзя.
                  </div>
                </div>
              )}
              <button
                type='button'
                className='modal-primary mt-3'
                disabled={pending || repaymentAmount < 1}
                onClick={() => commit('repay', repaymentAmount)}
              >
                Погасить {formatGameNumber(repaymentAmount)}
              </button>
              {!isDefaulted && (
                <button
                  type='button'
                  className='modal-secondary mt-2'
                  disabled={pending}
                  onClick={() => commit('defer')}
                >
                  {lastCreditRound
                    ? 'Нет, продать активы и идти в тюрьму'
                    : `Нет, перенести (долг +${formatGameNumber(preview.extensionFee)})`}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className='notice notice--info mt-3'>
                <Check size={16} />
                <div>
                  Кредита нет. Доход для расчета не может быть ниже 12 до вычета
                  налогов.
                </div>
              </div>
              <button
                type='button'
                className='modal-primary mt-4'
                disabled={pending}
                onClick={() => commit('no-loan')}
              >
                Зачислить и завершить круг <Check size={18} />
              </button>
              <button
                type='button'
                className='modal-text mt-2'
                onClick={onClose}
              >
                Отменить
              </button>
            </>
          )}
        </>
      )}
    </DialogShell>
  )
}
