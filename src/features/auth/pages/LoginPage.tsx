import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../../layouts/AuthLayout'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { ROUTES } from '../../../utils/constants'
import { useLogin } from '../hooks'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    login.mutate(data)
  }

  return (
    <AuthLayout title="Iniciar Sesión" subtitle="Ingresa a tu cuenta de Gastos">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {login.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            {login.error.message || 'Error al iniciar sesión'}
          </div>
        )}

        <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
          <input
            type="checkbox"
            id="privacy"
            defaultChecked
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <label htmlFor="privacy">
            Esta app respeta tu privacidad. Tus datos financieros son solo tuyos, no se comparten con terceros ni se usan para ningún otro propósito.
          </label>
        </div>

        <Button type="submit" loading={login.isPending} className="w-full">
          Iniciar Sesión
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{' '}
        <Link to={ROUTES.REGISTER} className="text-indigo-600 hover:text-indigo-500 font-medium dark:text-indigo-400 dark:hover:text-indigo-300">
          Registrarse
        </Link>
      </p>
    </AuthLayout>
  )
}
