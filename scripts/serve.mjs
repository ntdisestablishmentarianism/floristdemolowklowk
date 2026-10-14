/**
 * Zero-dependency static file server for local preview.
 * Usage: npm run serve  (then open http://localhost:8080)
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const PORT = Number(process.env.PORT) || 8080
const HOST = process.env.HOST || '0.0.0.0'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function resolveFile(pathname) {
  // Strip query/hash and prevent traversal outside ROOT.
  const clean = decodeURIComponent(pathname.split('?')[0].split('#')[0])
  const rel = normalize(clean).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '')
  let target = join(ROOT, rel)
  if (!target.startsWith(ROOT)) return null
  try {
    const info = await stat(target)
    if (info.isDirectory()) target = join(target, 'index.html')
  } catch {
    return null
  }
  try {
    const info = await stat(target)
    return info.isFile() ? target : null
  } catch {
    return null
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const file = await resolveFile(url.pathname === '/' ? '/index.html' : url.pathname)
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('404 Not Found')
    return
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    res.end(body)
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('500 Server Error')
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Kopou preview: http://localhost:${PORT}  (bound ${HOST}:${PORT})`)
})
