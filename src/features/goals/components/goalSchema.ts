import { z } from 'zod'

export const goalSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  target_amount: z.number({ message: 'Ingresa un monto' }).positive('El monto debe ser mayor a 0'),
  target_date: z.string().optional(),
  notes: z.string().optional(),
})
