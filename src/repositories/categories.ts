import { db } from '@/database/db'
import { nowIso } from '@/domain/date'
import type { Category, CategoryType } from '@/types/models'

export async function listCategories(includeArchived = false) {
  const categories = await db.categories.toArray()
  const visibleCategories = includeArchived
    ? categories
    : categories.filter((category) => !category.isArchived)
  return visibleCategories.sort((left, right) =>
    left.name.localeCompare(right.name),
  )
}

export async function saveCategory(input: {
  id?: string
  name: string
  type: CategoryType
}) {
  const timestamp = nowIso()
  if (input.id) {
    await db.categories.update(input.id, {
      name: input.name,
      type: input.type,
      updatedAt: timestamp,
    })
    return input.id
  }
  const category: Category = {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    isDefault: false,
    isArchived: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await db.categories.add(category)
  return category.id
}
