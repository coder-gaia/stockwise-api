import prisma from '../lib/prisma'
import { MovementType } from '@prisma/client'

export async function createMovementWithStockUpdate(data: {
  productId: string
  userId: string
  type: MovementType
  quantity: number
  note?: string
  idempotencyKey: string
  currentStock: number
}) {
  const delta = data.type === 'IN' ? data.quantity : -data.quantity

  return prisma.$transaction([
    prisma.movement.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        type: data.type,
        quantity: data.quantity,
        note: data.note,
        idempotencyKey: data.idempotencyKey,
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: { currentStock: data.currentStock + delta },
    }),
  ])
}

export async function findMovementByIdempotencyKey(key: string) {
  return prisma.movement.findUnique({ where: { idempotencyKey: key } })
}

export async function findMovementsByProduct(
  productId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit

  const [movements, total] = await prisma.$transaction([
    prisma.movement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { email: true, role: true } } },
    }),
    prisma.movement.count({ where: { productId } }),
  ])

  return { movements, total, page, limit }
}