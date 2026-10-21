import { createServer } from 'node:http'
import { WebSocket, WebSocketServer } from 'ws'
import { pathToFileURL } from 'node:url'

const HOST = '127.0.0.1'
const PORT = Number(process.env.CAPTURE_RELAY_PORT || 4174)
const ALLOWED_TYPES = new Set(['request', 'available', 'offer', 'answer', 'ice', 'ended'])

function allowedOrigin(origin) {
  if (!origin || origin === 'null') return true
  try {
    const url = new URL(origin)
    return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
  } catch {
    return false
  }
}

export async function startCaptureRelay() {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' })
    response.end('Webcam_overlay capture relay is running on loopback only.\n')
  })
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1_000_000, perMessageDeflate: false })

  server.on('upgrade', (request, socket, head) => {
    if (!allowedOrigin(request.headers.origin)) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n')
      socket.destroy()
      return
    }
    wss.handleUpgrade(request, socket, head, (client) => wss.emit('connection', client, request))
  })

  wss.on('connection', (client) => {
    client.captureKeys = new Set()
    client.on('error', () => { /* Client disconnects do not affect the relay process. */ })
    client.on('message', (raw, isBinary) => {
      if (isBinary || raw.length > 1_000_000) return
      let message
      try { message = JSON.parse(raw.toString()) } catch { return }
      if (!message || typeof message !== 'object' || !ALLOWED_TYPES.has(message.type)) return
      if (typeof message.captureKey !== 'string' || message.captureKey.length > 300) return
      client.captureKeys.add(message.captureKey)
      // The relay runs only on loopback. It transports signaling messages, never the video itself.
      // WebRTC carries the encrypted media stream directly between the browser contexts.
      const payload = JSON.stringify(message)
      for (const peer of wss.clients) {
        if (peer !== client && peer.readyState === WebSocket.OPEN && peer.captureKeys?.has(message.captureKey)) {
          try { peer.send(payload) } catch { /* Ignore a client that is already closing. */ }
        }
      }
    })
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(PORT, HOST, () => {
      server.removeAllListeners('error')
      resolve()
    })
  })

  console.log(`[capture-relay] ws://${HOST}:${PORT} (loopback only)`)
  return {
    close: async () => {
      for (const client of wss.clients) client.terminate()
      await new Promise((resolve) => wss.close(() => resolve(undefined)))
      await new Promise((resolve) => server.close(() => resolve(undefined)))
    },
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startCaptureRelay().catch((error) => {
    console.error('[capture-relay] Could not start:', error)
    process.exitCode = 1
  })
}
