import type { H3Event } from 'h3'
import { randomUUID } from 'crypto'

const FAIL_THRESHOLD = 3
const LOCK_THRESHOLD = 8
const LOCK_DURATION = 5 * 60_000
const FAIL_WINDOW = 15 * 60_000
const CAPTCHA_TTL = 5 * 60_000

type FailRecord = { count: number; firstAt: number; lockedUntil: number }
type CaptchaRecord = { text: string; expireAt: number }

const failMap = new Map<string, FailRecord>()
const captchaMap = new Map<string, CaptchaRecord>()

setInterval(() => {
  const now = Date.now()
  for (const [ip, r] of failMap) {
    if (now - r.firstAt > FAIL_WINDOW && r.lockedUntil < now) failMap.delete(ip)
  }
  for (const [id, c] of captchaMap) {
    if (c.expireAt < now) captchaMap.delete(id)
  }
}, 600_000)

export function getClientIp(event: H3Event): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = getHeader(event, 'x-real-ip')
  if (real) return real
  return event.node?.req?.socket?.remoteAddress || 'unknown'
}

export function isLocked(ip: string): number {
  const r = failMap.get(ip)
  if (!r) return 0
  const remaining = r.lockedUntil - Date.now()
  return remaining > 0 ? remaining : 0
}

export function needsCaptcha(ip: string): boolean {
  const r = failMap.get(ip)
  if (!r) return false
  if (Date.now() - r.firstAt > FAIL_WINDOW) return false
  return r.count >= FAIL_THRESHOLD
}

export function recordFailure(ip: string) {
  const now = Date.now()
  let r = failMap.get(ip)
  if (!r || now - r.firstAt > FAIL_WINDOW) {
    r = { count: 0, firstAt: now, lockedUntil: 0 }
  }
  r.count += 1
  if (r.count >= LOCK_THRESHOLD) {
    r.lockedUntil = now + LOCK_DURATION
  }
  failMap.set(ip, r)
}

export function clearFailures(ip: string) {
  failMap.delete(ip)
}

export function createCaptcha(text: string): string {
  const id = randomUUID()
  captchaMap.set(id, { text: text.toLowerCase(), expireAt: Date.now() + CAPTCHA_TTL })
  return id
}

export function verifyCaptcha(id: string, input: string): boolean {
  if (!id || !input) return false
  const c = captchaMap.get(id)
  if (!c) return false
  captchaMap.delete(id)
  if (c.expireAt < Date.now()) return false
  return c.text === input.trim().toLowerCase()
}
