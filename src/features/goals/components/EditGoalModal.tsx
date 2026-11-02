import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import type { Goal } from '../../../types/models'
import { useUpdateGoal } from '../hooks'
import { GoalFormFields, type GoalFormValues } from './GoalFormFields'
import { goalSchema } from './goalSchema'

interface EditGoalModalProps {
  goal: Goal
  isOpen: boolean
  onClose: () => void
}

export function EditGoalModal({ goal, isOpen, onClose }: EditGoalModalProps) {
  if (!isOpen) return null
  return <EditGoalForm goal={goal} onClose={onClose} />
}

function EditGoalForm({ goal, onClose }: Omit<EditGoalModalProps, 'isOpen'>) {
  const updateGoal = useUpdateGoal(goal.id)
  const { register, handleSubmit, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal.name,
      target_amount: Number(goal.target_amount),
      target_date: goal.target_date ?? '',
      notes: goal.notes ?? '',
    },
  })

  const onSubmit = (data: GoalFormValues) => {
    updateGoal.mutate(
      {
        name: data.name,
        target_amount: data.target_amount,
        // An empty date clears it; the backend keeps the old one only when the field is omitted.
        target_date: data.target_date || null,
        notes: data.notes || null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal isOpen onClose={onClose} title="Editar meta" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <GoalFormFields register={register} errors={errors} />
        <Button type="submit" loading={updateGoal.isPending} className="w-full min-h-11">
          Guardar cambios
        </Button>
      </form>
    </Modal>
  )
}
