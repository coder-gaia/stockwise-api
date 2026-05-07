import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'
import prisma from '../lib/prisma'

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  const token = header.split(' ')[1]
  const payload = verifyAccessToken(token)

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    res.status(401).json({ error: 'User not found' })
    return
  }

  res.locals.user = { userId: user.id, storeId: user.storeId, role: user.role }
  next()
}


export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.role !== 'OWNER') {
    res.status(403).json({ error: 'Owner access required' })
    return
  }
  next()
}