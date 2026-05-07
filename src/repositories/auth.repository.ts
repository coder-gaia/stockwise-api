import prisma from '../lib/prisma'

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createStoreWithOwner(data: {
  storeName: string
  email: string
  passwordHash: string
}) {
  return prisma.store.create({
    data: {
      name: data.storeName,
      users: {
        create: {
          email: data.email,
          passwordHash: data.passwordHash,
          role: 'OWNER',
        },
      },
    },
    include: { users: true },
  })
}