import { z } from 'zod'
import * as productRepo from '../repositories/product.repository'
import * as movementRepo from '../repositories/movement.repository'
import { MovementType } from '@prisma/client'

export const createProductSchema = z.object({
  name: z.string().min(1),
  minStock: z.number().int().min(0),
  expiresAt: z.string().datetime().optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  minStock: z.number().int().min(0).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
})

export const movementSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  note: z.string().optional(),
  idempotencyKey: z.string().uuid('idempotencyKey must be a valid UUID'),
})

export async function createProduct(
  storeId: string,
  input: z.infer<typeof createProductSchema>
) {
  return productRepo.createProduct({
    storeId,
    name: input.name,
    minStock: input.minStock,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
  })
}

export async function listProducts(storeId: string) {
  return productRepo.findProductsByStore(storeId)
}

export async function updateProduct(
  id: string,
  storeId: string,
  input: z.infer<typeof updateProductSchema>
) {
  const product = await productRepo.findProductById(id, storeId)
  if (!product) throw { status: 404, message: 'Product not found' }

  return productRepo.updateProduct(id, {
    name: input.name,
    minStock: input.minStock,
    expiresAt: input.expiresAt === null ? null : input.expiresAt ? new Date(input.expiresAt) : undefined,
  })
}

export async function deleteProduct(id: string, storeId: string) {
  const product = await productRepo.findProductById(id, storeId)
  if (!product) throw { status: 404, message: 'Product not found' }

  return productRepo.deleteProduct(id)
}

export async function registerMovement(
  productId: string,
  storeId: string,
  userId: string,
  input: z.infer<typeof movementSchema>
) {
  const existing = await movementRepo.findMovementByIdempotencyKey(input.idempotencyKey)
  if (existing) return existing

  const product = await productRepo.findProductById(productId, storeId)
  if (!product) throw { status: 404, message: 'Product not found' }

  if (input.type === 'OUT' && product.currentStock - input.quantity < 0) {
    throw { status: 409, message: 'Insufficient stock' }
  }

  const [movement] = await movementRepo.createMovementWithStockUpdate({
    productId,
    userId,
    type: input.type as MovementType,
    quantity: input.quantity,
    note: input.note,
    idempotencyKey: input.idempotencyKey,
    currentStock: product.currentStock,
  })

  return movement
}

export async function getMovementHistory(
  productId: string,
  storeId: string,
  page: number,
  limit: number
) {
  const product = await productRepo.findProductById(productId, storeId)
  if (!product) throw { status: 404, message: 'Product not found' }

  return movementRepo.findMovementsByProduct(productId, page, limit)
}

export async function getLowStockAlerts(storeId: string) {
  const products = await productRepo.findProductsByStore(storeId)
  return products.filter((p) => p.currentStock <= p.minStock)
}