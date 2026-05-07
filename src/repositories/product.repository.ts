import prisma from '../lib/prisma'

export async function createProduct(data: {
  storeId: string
  name: string
  minStock: number
  expiresAt?: Date
}) {
  return prisma.product.create({ data })
}

export async function findProductsByStore(storeId: string) {
  return prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findProductById(id: string, storeId: string) {
  return prisma.product.findFirst({ where: { id, storeId } })
}

export async function updateProduct(
  id: string,
  data: { name?: string; minStock?: number; expiresAt?: Date | null }
) {
  return prisma.product.update({ where: { id }, data })
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } })
}