import { useForm } from 'react-hook-form'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { formatCurrency } from '../../../utils/format'
import type { GoalOverview } from '../../../types/models'
import { useSetOpeningBalance } from '../hooks'

interface OpeningBalanceModalProps {
  overview: GoalOverview
  isOpen: boolean
  onClose: () => void
}

export function OpeningBalanceModal({ overview, isOpen, onClose }: OpeningBalanceModalProps) {
  if (!isOpen) return null
  return <OpeningBalanceForm overview={overview} onClose={onClose} />
}

function OpeningBalanceForm({ overview, onClose }: Omit<OpeningBalanceModalProps, 'isOpen'>) {
  const setOpeningBalance = useSetOpeningBalance()
  const { register, handleSubmit, formState: { errors } } = useForm<{ opening_balance: number }>({
    defaultValues: { opening_balance: Number(overview.opening_balance) },
  })

  const onSubmit = (data: { opening_balance: number }) => {
    setOpeningBalance.mutate(Number(data.opening_balance), { onSuccess: onClose })
  }

  return (
    <Modal isOpen onClose={onClose} title="Saldo inicial" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tu saldo se calcula con todos tus ingresos menos todos tus gastos. Si ya tenías dinero antes de empezar a usar la app,
          indícalo aquí y se sumará.
        </p>
        <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
          <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Ingresos</span><span>{formatCurrency(Number(overview.total_income))}</span></div>
          <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Gastos</span><span>-{formatCurrency(Number(overview.total_expenses))}</span></div>
        </div>
        <Input
          id="opening_balance"
          label="Dinero que ya tenía"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0"
          error={errors.opening_balance?.message}
          {...register('opening_balance', { valueAsNumber: true, required: 'Ingresa un monto (puede ser 0)' })}
        />
        <Button type="submit" loading={setOpeningBalance.isPending} className="w-full min-h-11">
          Guardar
        </Button>
      </form>
    </Modal>
  )
}
