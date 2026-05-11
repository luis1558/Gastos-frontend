import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from './api'
import { useAuthStore } from '../../stores/authStore'
import { ROUTES } from '../../utils/constants'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      navigate(ROUTES.DASHBOARD)
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
      navigate(ROUTES.DASHBOARD)
    },
  })
}
