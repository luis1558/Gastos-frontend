import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCounterparties, useCreateCounterparty } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Modal } from '../../../components/ui/Modal'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { COUNTERPARTY_TYPES } from '../../../utils/constants'
import { FiPlus, FiUser } from 'react-icons/fi'

const counterpartySchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  type: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
})

type CounterpartyForm = z.infer<typeof counterpartySchema>

export function CounterpartiesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: counterparties, isLoading } = useCounterparties()
  const createCounterparty = useCreateCounterparty()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CounterpartyForm>({
    resolver: zodResolver(counterpartySchema),
  })

  const onSubmit = (data: CounterpartyForm) => {
    createCounterparty.mutate(data as any, {
      onSuccess: () => { setModalOpen(false); reset() },
    })
  }

  return (
    <div>
      <PageHeader
        title="Contrapartes"
        description="Personas o entidades con las que tienes deudas"
        action={
          <Button onClick={() => setModalOpen(true)} size="sm">
            <FiPlus size={16} className="mr-1" /> Nueva Contraparte
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : counterparties && counterparties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {counterparties.map((cp) => (
            <Card key={cp.id} className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full dark:bg-gray-800">
                <FiUser size={20} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{cp.name}</p>
                {cp.type && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {COUNTERPARTY_TYPES.find((t) => t.value === cp.type)?.label || cp.type}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Sin contrapartes"
            description="Registra las personas o entidades con las que tienes deudas"
            action={<Button onClick={() => setModalOpen(true)}><FiPlus size={16} className="mr-1" /> Crear Contraparte</Button>}
          />
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Contraparte">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Nombre"
            placeholder="Nombre de la contraparte"
            error={errors.name?.message}
            {...register('name')}
          />
          <Select
            id="type"
            label="Tipo"
            options={COUNTERPARTY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            placeholder="Seleccionar (opcional)"
            {...register('type')}
          />
          <Input
            id="phone"
            label="Teléfono (opcional)"
            placeholder="+56 9 1234 5678"
            {...register('phone')}
          />
          <Input
            id="email"
            label="Email (opcional)"
            type="email"
            placeholder="correo@ejemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="notes"
            label="Notas (opcional)"
            placeholder="Notas adicionales"
            {...register('notes')}
          />
          <Button type="submit" loading={createCounterparty.isPending} className="w-full">
            Guardar Contraparte
          </Button>
        </form>
      </Modal>
    </div>
  )
}
