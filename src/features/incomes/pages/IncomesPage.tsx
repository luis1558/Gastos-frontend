import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useIncome, useUpsertIncome } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatCurrency, getCurrentYear, getCurrentMonth } from '../../../utils/format'
import { MONTH_NAMES } from '../../../utils/constants'

const incomeSchema = z.object({
  base_income: z.number().min(0, 'No puede ser negativo'),
  extra_income: z.number().min(0, 'No puede ser negativo'),
  notes: z.string().optional(),
})

type IncomeForm = z.infer<typeof incomeSchema>

export function IncomesPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [month, setMonth] = useState(getCurrentMonth())
  const { data: income, isLoading } = useIncome(year, month)
  const upsertIncome = useUpsertIncome()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IncomeForm>({
    resolver: zodResolver(incomeSchema),
  })

  useEffect(() => {
    if (income) {
      reset({
        base_income: income.base_income,
        extra_income: income.extra_income,
        notes: income.notes || '',
      })
    } else {
      reset({ base_income: 0, extra_income: 0, notes: '' })
    }
  }, [income, reset])

  const onSubmit = (data: IncomeForm) => {
    upsertIncome.mutate({
      year,
      month,
      data: {
        base_income: Number(data.base_income),
        extra_income: Number(data.extra_income),
        notes: data.notes || null,
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Ingresos"
        description="Configura tus ingresos mensuales"
      />

      <div className="flex gap-2 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          {MONTH_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {MONTH_NAMES[month]} {year}
          </h2>

          {income && (
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ingreso Base</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(income.base_income)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ingreso Extra</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(income.extra_income)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(income.base_income + income.extra_income)}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="base_income"
                label="Ingreso Base"
                type="number"
                step="0.01"
                placeholder="0"
                error={errors.base_income?.message}
                {...register('base_income', { valueAsNumber: true })}
              />
              <Input
                id="extra_income"
                label="Ingreso Extra"
                type="number"
                step="0.01"
                placeholder="0"
                error={errors.extra_income?.message}
                {...register('extra_income', { valueAsNumber: true })}
              />
            </div>
            <Input
              id="notes"
              label="Notas (opcional)"
              placeholder="Notas sobre tus ingresos"
              {...register('notes')}
            />
            <Button type="submit" loading={upsertIncome.isPending}>
              Guardar
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
