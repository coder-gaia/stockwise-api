import bcrypt from 'bcryptjs'
import { findUserByEmail, createStoreWithOwner } from '../repositories/auth.repository'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import prisma from '../lib/prisma'

export async function register(storeName: string, email: string, password: string) {
  const existing = await findUserByEmail(email)
  if (existing) throw { status: 409, message: 'Email already in use' }

  const passwordHash = await bcrypt.hash(password, 10)
  const store = await createStoreWithOwner({ storeName, email, passwordHash })
  const owner = store.users[0]

  const accessToken = signAccessToken({ userId: owner.id, role: owner.role })
  const refreshToken = signRefreshToken({ userId: owner.id })

  return { accessToken, refreshToken }
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email)
  if (!user) throw { status: 401, message: 'Invalid credentials' }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw { status: 401, message: 'Invalid credentials' }

  const accessToken = signAccessToken({ userId: user.id, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id })

  return { accessToken, refreshToken }
}

export async function refresh(token: string) {
  const payload = verifyRefreshToken(token)

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) throw { status: 401, message: 'User not found' }

  const accessToken = signAccessToken({ userId: user.id, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id })

  return { accessToken, refreshToken }
}