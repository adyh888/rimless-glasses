import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { H3Event } from 'h3'
const getSecret = () => {
  return useRuntimeConfig().jwtSecret || 'fallback-secret'
}
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}
export function signToken(payload: object): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}
export function verifyToken(token: string): any {
  return jwt.verify(token, getSecret())
}
export function getAuthUser(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  try {
    return verifyToken(authHeader.slice(7))
  } catch {
    return null
  }
}
