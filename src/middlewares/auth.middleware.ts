import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  const token = header.split(' ')[1]
  const payload = verifyAccessToken(token)
  res.locals.user = payload
  next()
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.role !== 'OWNER') {
    res.status(403).json({ error: 'Owner access required' })
    return
  }
  next()
}