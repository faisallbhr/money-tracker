import { db } from '@/database/db'
import { nowIso } from '@/domain/date'
import type { Category, CategoryType } from '@/types/models'

export interface CategoryFilter {
  includeArchived?: boolean
  type?: CategoryType
  search?: string
  limit?: number
  offset?: number
}

export async function listCategories(filter: boolean | CategoryFilter = false) {
  const options =
    typeof filter === 'boolean' ? { includeArchived: filter } : filter
  const categories = await db.categories.toArray()
  const search = options.search?.trim().toLowerCase()
  const visibleCategories = options.includeArchived
    ? categories
    : categories.filter((category) => !category.isArchived)
  const filteredCategories = visibleCategories
    .filter((category) => !options.type || category.type === options.type)
    .filter(
      (category) => !search || category.name.toLowerCase().includes(search),
    )
    .sort((left, right) => left.name.localeCompare(right.name))

  return typeof options.limit === 'number'
    ? filteredCategories.slice(
        options.offset || 0,
        (options.offset || 0) + options.limit,
      )
    : filteredCategories
}

export async function getCategory(id: string) {
  return db.categories.get(id)
}

export async function findCategoryByName(type: CategoryType, name: string) {
  const normalizedName = name.trim().toLowerCase()
  const categories = await listCategories({ type })
  return categories.find(
    (category) => category.name.toLowerCase() === normalizedName,
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
