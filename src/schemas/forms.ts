import { z } from 'zod'

import {
  accountTypes,
  adjustmentDirections,
  scheduledBehaviors,
  scheduledFrequencies,
} from '@/types/models'

const positiveAmount = z
  .number()
  .int()
  .positive('Nominal harus lebih dari nol.')
const optionalText = z.string().trim().optional()

export const accountSchema = z.object({
  name: z.string().trim().min(1, 'Nama akun wajib diisi.'),
  type: z.enum(accountTypes),
  initialBalanceMinor: z.number().int(),
  icon: optionalText,
})

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi.'),
  type: z.enum(['income', 'expense']),
})

export const transactionFormSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer', 'adjustment']),
    accountId: optionalText,
    fromAccountId: optionalText,
    toAccountId: optionalText,
    amountMinor: positiveAmount,
    adjustmentDirection: z.enum(adjustmentDirections).optional(),
    categoryId: optionalText,
    note: optionalText,
    transactionDate: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
        'Gunakan format dd/mm/yyyy jj:mm:ss.',
      ),
  })
  .superRefine((value, context) => {
    if (value.type === 'transfer') {
      if (!value.fromAccountId)
        context.addIssue({
          code: 'custom',
          path: ['fromAccountId'],
          message: 'Akun asal wajib diisi.',
        })
      if (!value.toAccountId)
        context.addIssue({
          code: 'custom',
          path: ['toAccountId'],
          message: 'Akun tujuan wajib diisi.',
        })
      if (value.fromAccountId && value.fromAccountId === value.toAccountId) {
        context.addIssue({
          code: 'custom',
          path: ['toAccountId'],
          message: 'Akun harus berbeda.',
        })
      }
      return
    }
    if (!value.accountId)
      context.addIssue({
        code: 'custom',
        path: ['accountId'],
        message: 'Akun wajib diisi.',
      })
    if (value.type === 'adjustment' && !value.adjustmentDirection) {
      context.addIssue({
        code: 'custom',
        path: ['adjustmentDirection'],
        message: 'Arah penyesuaian wajib diisi.',
      })
    }
  })

export const scheduledTransactionSchema = z
  .object({
    name: z.string().trim().min(1, 'Nama wajib diisi.'),
    type: z.enum(['income', 'expense', 'transfer']),
    accountId: optionalText,
    fromAccountId: optionalText,
    toAccountId: optionalText,
    amountMinor: positiveAmount,
    categoryId: optionalText,
    note: optionalText,
    frequency: z.enum(scheduledFrequencies),
    interval: z.number().int().positive(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    monthOfYear: z.number().int().min(1).max(12).optional(),
    startDate: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
        'Gunakan format dd/mm/yyyy jj:mm:ss.',
      ),
    endDate: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
        'Gunakan format dd/mm/yyyy jj:mm:ss.',
      )
      .optional(),
    behavior: z.enum(scheduledBehaviors),
  })
  .superRefine((value, context) => {
    if (value.type === 'transfer') {
      if (!value.fromAccountId)
        context.addIssue({
          code: 'custom',
          path: ['fromAccountId'],
          message: 'Akun asal wajib diisi.',
        })
      if (!value.toAccountId)
        context.addIssue({
          code: 'custom',
          path: ['toAccountId'],
          message: 'Akun tujuan wajib diisi.',
        })
      if (value.fromAccountId && value.fromAccountId === value.toAccountId) {
        context.addIssue({
          code: 'custom',
          path: ['toAccountId'],
          message: 'Akun harus berbeda.',
        })
      }
      return
    }
    if (!value.accountId)
      context.addIssue({
        code: 'custom',
        path: ['accountId'],
        message: 'Akun wajib diisi.',
      })
  })
