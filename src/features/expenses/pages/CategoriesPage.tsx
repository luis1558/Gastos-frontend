import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories, useCreateCategory, useUpdateCategory } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Loading } from '../../../components/ui/Loading'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { FiPlus, FiEdit2 } from 'react-icons/fi'

const categorySchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  color: z.string().optional(),
  icon: z.string().optional(),
})

type CategoryForm = z.infer<typeof categorySchema>

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
    .replace(/[á]/g, 'a')
    .replace(/[é]/g, 'e')
    .replace(/[í]/g, 'i')
    .replace(/[ó]/g, 'o')
    .replace(/[ú]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ü]/g, 'u')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null)

  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  })

  const openEdit = (cat: { id: string; name: string }) => {
    setEditing(cat)
    setValue('name', cat.name)
    setModalOpen(true)
  }

  const openCreate = () => {
    setEditing(null)
    reset()
    setModalOpen(true)
  }

  const onSubmit = (data: CategoryForm) => {
    if (editing) {
      updateCategory.mutate({ id: editing.id, data }, {
        onSuccess: () => { setModalOpen(false); reset() },
      })
    } else {
      createCategory.mutate({ ...data, slug: slugify(data.name) }, {
        onSuccess: () => { setModalOpen(false); reset() },
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Administra las categorías de gastos"
        action={
          <Button onClick={openCreate} size="sm">
            <FiPlus size={16} className="mr-1" /> Nueva Categoría
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cat.color || '#6366f1' }}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cat.slug}</p>
                </div>
              </div>
              <button
                onClick={() => openEdit(cat)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors dark:hover:bg-indigo-900/30"
              >
                <FiEdit2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Sin categorías"
            description="Crea categorías para organizar tus gastos"
            action={<Button onClick={openCreate}><FiPlus size={16} className="mr-1" /> Crear Categoría</Button>}
          />
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Nombre"
            placeholder="Ej: Supermercado"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            id="color"
            label="Color (hex)"
            placeholder="#6366f1"
            {...register('color')}
          />
          <Input
            id="icon"
            label="Icono (opcional)"
            placeholder="icon-name"
            {...register('icon')}
          />
          <Button type="submit" loading={createCategory.isPending || updateCategory.isPending} className="w-full">
            {editing ? 'Actualizar' : 'Crear'} Categoría
          </Button>
        </form>
      </Modal>
    </div>
  )
}
