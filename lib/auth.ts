import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth'
const JWT_SECRET = process.env.AUTH_JWT_SECRET || ''

export function signToken(payload: any, expiresIn: string = '12h') {
  if (!JWT_SECRET) throw new Error('AUTH_JWT_SECRET not set')
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string): any {
  if (!JWT_SECRET) throw new Error('AUTH_JWT_SECRET not set')
  return jwt.verify(token, JWT_SECRET)
}

export function readAuthCookie(req: NextRequest): string | null {
  const c = req.cookies.get(COOKIE_NAME)
  return c?.value || null
}

export function writeAuthCookie(token: string): HeadersInit {
  const secure = process.env.NODE_ENV === 'production'
  const cookie = `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; ${secure ? 'Secure; ' : ''}`
  return { 'Set-Cookie': cookie }
}

export function clearAuthCookie(): HeadersInit {
  const secure = process.env.NODE_ENV === 'production'
  const cookie = `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; ${secure ? 'Secure; ' : ''}`
  return { 'Set-Cookie': cookie }
}

export function adminWritesEnabled(): boolean {
  return String(process.env.ADMIN_ENABLED).toLowerCase() === 'true'
}


