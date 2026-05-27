const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov']

export function isVideoUrl(url: string): boolean {
  if (!url) return false
  const ext = url.slice(url.lastIndexOf('.')).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext)
}
