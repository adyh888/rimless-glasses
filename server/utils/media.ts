const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov']

export function isVideoUrl(url: string): boolean {
  if (!url) return false
  const ext = url.slice(url.lastIndexOf('.')).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext)
}

export const VIDEO_MIME_MAP: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
}
