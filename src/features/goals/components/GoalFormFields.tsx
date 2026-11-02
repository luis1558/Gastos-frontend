import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '../../../components/ui/Input'

export interface GoalFormValues {
  name: string
  target_amount: number
  target_date?: string
  notes?: string
}

interface GoalFormFieldsProps {
  register: UseFormRegister<GoalFormValues>
  errors: FieldErrors<GoalFormValues>
  amountHint?: string
}

export function GoalFormFields({ register, errors, amountHint }: GoalFormFieldsProps) {
  return (
    <>
      <Input
        id="goal_name"
        label="¿Cómo se llama tu meta?"
        placeholder="Ej: PlayStation 5, arriendo de diciembre…"
        error={errors.name?.message}
        {...register('name')}
      />
      <div>
        <Input
          id="goal_target_amount"
          label="¿Cuánto necesitas?"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0"
          error={errors.target_amount?.message}
          {...register('target_amount', { valueAsNumber: true })}
        />
        {amountHint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{amountHint}</p>}
      </div>
      <div>
        <Input
          id="goal_target_date"
          label="¿Para cuándo lo necesitas? (opcional)"
          type="date"
          {...register('target_date')}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Puedes dejarlo vacío si no hay una fecha.</p>
      </div>
      <Input id="goal_notes" label="Notas (opcional)" placeholder="Algo que quieras recordar" {...register('notes')} />
    </>
  )
}
