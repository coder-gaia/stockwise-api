import { Request, Response } from 'express'
import { z } from 'zod'
import * as authService from '../services/auth.service'

const registerSchema = z.object({
  storeName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { storeName, email, password } = parsed.data
  const { accessToken, refreshToken } = await authService.register(storeName, email, password)

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
  res.status(201).json({ accessToken })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { email, password } = parsed.data
  const { accessToken, refreshToken } = await authService.login(email, password)

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
  res.json({ accessToken })
}

export async function refreshToken(req: Request, res: Response) {
  const token = req.cookies?.refreshToken
  if (!token) {
    res.status(401).json({ error: 'No refresh token' })
    return
  }

  const { accessToken, refreshToken } = await authService.refresh(token)

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
  res.json({ accessToken })
}