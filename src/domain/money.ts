import { APP_CURRENCY, APP_LOCALE } from '@/config/app'

export function parseMoneyToMinor(value: string) {
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.')
  const normalized = cleaned.startsWith('-')
    ? `-${cleaned.replace(/-/g, '')}`
    : cleaned.replace(/-/g, '')
  if (!normalized || normalized === '-' || Number.isNaN(Number(normalized)))
    return null
  return Math.round(Number(normalized) * 100)
}

export function formatMoneyInput(value: string | number) {
  const text = String(value)
  const sign = text.trim().startsWith('-') ? '-' : ''
  const digits = text.replace(/\D/g, '')
  if (!digits) return sign
  return `${sign}${new Intl.NumberFormat(APP_LOCALE).format(Number(digits))}`
}

export function formatMoney(amountMinor: number) {
  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency: APP_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100)
}
