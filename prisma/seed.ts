import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {

    const existing = await prisma.store.findFirst()
    if (existing) {
      console.log('✓ Seed já aplicado, pulando')
    return
  }

  await prisma.movement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.store.deleteMany()

  const passwordHash = await bcrypt.hash('demo123', 10)

  const store = await prisma.store.create({
    data: {
      name: 'Mercadinho Demo',
      users: {
        create: { email: 'demo@stockwise.app', passwordHash, role: 'OWNER' },
      },
    },
    include: { users: true },
  })

  const owner = store.users[0]

  const productsData = [
    { name: 'Arroz 5kg',               currentStock: 3,  minStock: 10 },
    { name: 'Feijão Carioca 1kg',      currentStock: 8,  minStock: 5  },
    { name: 'Açúcar Refinado 1kg',     currentStock: 0,  minStock: 8  },
    { name: 'Óleo de Soja 900ml',      currentStock: 15, minStock: 6  },
    { name: 'Sal Refinado 1kg',        currentStock: 12, minStock: 4  },
    { name: 'Café Torrado 500g',       currentStock: 5,  minStock: 6  },
    { name: 'Macarrão Espaguete 500g', currentStock: 22, minStock: 8  },
    {
      name: 'Leite Integral 1L',
      currentStock: 4,
      minStock: 12,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ]

  const products = await Promise.all(
    productsData.map((p) => prisma.product.create({ data: { storeId: store.id, ...p } }))
  )

  const now = Date.now()
  let idx = 0

  for (const product of products) {
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000)

      if (daysAgo % 4 === 0) {
        await prisma.movement.create({
          data: {
            productId: product.id,
            userId: owner.id,
            type: 'IN',
            quantity: Math.floor(Math.random() * 15) + 5,
            idempotencyKey: `seed-${product.id}-in-${idx++}`,
            createdAt: date,
          },
        })
      }

      if (daysAgo % 2 === 0 && Math.random() > 0.25) {
        await prisma.movement.create({
          data: {
            productId: product.id,
            userId: owner.id,
            type: 'OUT',
            quantity: Math.floor(Math.random() * 4) + 1,
            idempotencyKey: `seed-${product.id}-out-${idx++}`,
            createdAt: date,
          },
        })
      }
    }
  }

  console.log('✓ Seed concluído')
  console.log('  email: demo@stockwise.app')
  console.log('  senha: demo123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())