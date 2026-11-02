import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { ChoiceCards } from '../../../components/ui/ChoiceCards'
import { INTEREST_TYPES, RATE_PERIODS, RATE_TYPES } from '../../../utils/constants'
import { formatCurrency } from '../../../utils/format'
import type { InterestType, RatePeriod, RateType } from '../../../types/models'
import { estimateInterest } from '../interest'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface InterestFormValues {
  original_amount: number
  origin_date: string
  due_date?: string
  interest_type: InterestType
  rate_type: RateType
  rate_period: RatePeriod
  interest_rate?: number
}

interface InterestFieldsProps {
  values: InterestFormValues
  register: UseFormRegister<InterestFormValues>
  errors: FieldErrors<InterestFormValues>
  onChange: (field: 'interest_type' | 'rate_type', value: string) => void
}

const DEFAULT_PREVIEW_DAYS = 365

function previewDays(originDate: string, dueDate?: string): { days: number; label: string } {
  if (originDate && dueDate) {
    const days = Math.round((new Date(dueDate).getTime() - new Date(originDate).getTime()) / 86_400_000)
    if (days > 0) return { days, label: 'hasta el vencimiento' }
  }
  return { days: DEFAULT_PREVIEW_DAYS, label: 'en 1 año' }
}

export function InterestFields({ values, register, errors, onChange }: InterestFieldsProps) {
  const hasInterest = values.interest_type !== 'none'
  const amount = Number(values.original_amount)
  const rate = Number(values.interest_rate)
  const { days, label } = previewDays(values.origin_date, values.due_date)
  const interest = estimateInterest({
    amount,
    interestType: values.interest_type,
    rate,
    period: values.rate_period,
    days,
  })

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
      <ChoiceCards
        label="Interés"
        columns={3}
        value={values.interest_type}
        options={INTEREST_TYPES}
        onChange={(value) => onChange('interest_type', value)}
      />

      {hasInterest && (
        <>
          <div className="grid grid-cols-5 gap-2 items-start">
            <div className="col-span-3">
              <Input
                id="interest_rate"
                label="Tasa de interés"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="Ej: 12"
                error={errors.interest_rate?.message}
                {...register('interest_rate', { valueAsNumber: true })}
              />
            </div>
            <div className="col-span-2">
              <Select
                id="rate_period"
                label="Periodo"
                options={RATE_PERIODS.map((p) => ({ value: p.value, label: p.label }))}
                {...register('rate_period')}
              />
            </div>
          </div>

          <ChoiceCards
            label="Tipo de tasa"
            value={values.rate_type}
            options={RATE_TYPES}
            onChange={(value) => onChange('rate_type', value)}
          />

          {interest > 0 && (
            <div className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-100">
              <p className="font-medium">Estimación {label} (sin pagos)</p>
              <p className="mt-1">
                Interés: <strong>{formatCurrency(interest)}</strong> · Total: <strong>{formatCurrency(amount + interest)}</strong>
              </p>
              {values.rate_type === 'variable' && (
                <p className="mt-1 text-xs opacity-80">
                  Con tasa variable el cálculo real cambia cuando registres nuevas tasas desde el detalle de la deuda.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
