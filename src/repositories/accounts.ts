import { db } from '@/database/db'
import { nowIso } from '@/domain/date'
import type { Account, AccountType } from '@/types/models'

export async function listAccounts(includeArchived = false) {
  const accounts = await db.accounts.toArray()
  const visibleAccounts = includeArchived
    ? accounts
    : accounts.filter((account) => !account.isArchived)
  return visibleAccounts.sort((left, right) =>
    left.name.localeCompare(right.name),
  )
}

export async function getAccount(id: string) {
  return db.accounts.get(id)
}

export async function saveAccount(input: {
  id?: string
  name: string
  type: AccountType
  initialBalanceMinor: number
  icon?: string
}) {
  const timestamp = nowIso()
  if (input.id) {
    const existing = await db.accounts.get(input.id)
    if (!existing) throw new Error('Akun tidak ditemukan.')
    await db.accounts.update(input.id, { ...input, updatedAt: timestamp })
    return input.id
  }

  const account: Account = {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    initialBalanceMinor: input.initialBalanceMinor,
    icon: input.icon,
    isArchived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await db.accounts.add(account)
  return account.id
}
