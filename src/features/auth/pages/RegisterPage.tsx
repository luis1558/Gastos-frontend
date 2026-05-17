import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../../layouts/AuthLayout'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../utils/constants'
import { useRegister } from '../hooks'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  full_name: z.string().optional(),
  privacy_accepted: z.literal(true, { message: 'Debes aceptar la política de privacidad' }),
})

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const registerMutation = useRegister()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data)
  }

  return (
    <AuthLayout title="Crear Cuenta" subtitle="Regístrate para comenzar a gestionar tus gastos">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="full_name"
          label="Nombre (opcional)"
          placeholder="Tu nombre"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        {registerMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            {registerMutation.error.message || 'Error al registrarse'}
          </div>
        )}

        <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            id="privacy_accepted"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
            {...register('privacy_accepted')}
          />
          <label htmlFor="privacy_accepted">
            Acepto que esta app respeta mi privacidad. Mis datos financieros son solo míos, no se comparten con terceros ni se usan para ningún otro propósito.
          </label>
        </div>
        {errors.privacy_accepted && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.privacy_accepted.message}</p>
        )}

        <Button type="submit" loading={registerMutation.isPending} className="w-full">
          Crear Cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿Ya tienes cuenta?{' '}
        <Link to={ROUTES.LOGIN} className="text-indigo-600 hover:text-indigo-500 font-medium dark:text-indigo-400 dark:hover:text-indigo-300">
          Iniciar Sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
