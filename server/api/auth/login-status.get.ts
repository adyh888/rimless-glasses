export default defineEventHandler((event) => {
  const ip = getClientIp(event)
  const lockedMs = isLocked(ip)
  return {
    captchaRequired: needsCaptcha(ip),
    locked: lockedMs > 0,
    lockedSeconds: Math.ceil(lockedMs / 1000),
  }
})
