import { APP_CURRENCY, APP_LOCALE } from '@/config/app'

export function parseMoneyToMinor(value: string) {
  const normalized = value.replace(/[^\d.,-]/g, '').replace(',', '.')
  if (!normalized || normalized === '-' || Number.isNaN(Number(normalized)))
    return null
  return Math.round(Number(normalized) * 100)
}

export function formatMoney(amountMinor: number) {
  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency: APP_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100)
}
