import svgCaptcha from 'svg-captcha'

export default defineEventHandler((event) => {
  const cap = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
    background: '#f3f4f6',
    ignoreChars: '0o1ilI',
  })
  const id = createCaptcha(cap.text)
  setCookie(event, 'captcha_id', id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  })
  setHeader(event, 'Content-Type', 'image/svg+xml')
  setHeader(event, 'Cache-Control', 'no-store')
  return cap.data
})
