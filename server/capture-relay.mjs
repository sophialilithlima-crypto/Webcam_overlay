import { createServer } from 'node:http'
import { WebSocket, WebSocketServer } from 'ws'
import { pathToFileURL } from 'node:url'

const HOST = '127.0.0.1'
const PORT = Number(process.env.CAPTURE_RELAY_PORT || 4174)
const ALLOWED_TYPES = new Set(['request', 'available', 'offer', 'answer', 'ice', 'ended', 'project-sync'])
const PROJECT_SYNC_KEY = 'webcam-overlay-project-sync'
const MAX_RELAY_PAYLOAD = 8_000_000

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
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_RELAY_PAYLOAD, perMessageDeflate: false })
  let latestProjectSnapshot = null

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
      if (isBinary || raw.length > MAX_RELAY_PAYLOAD) return
      let message
      try { message = JSON.parse(raw.toString()) } catch { return }
      if (!message || typeof message !== 'object' || !ALLOWED_TYPES.has(message.type)) return

      // The browser app and OBS Browser Source have separate browser storage contexts.
      // Keep the latest scene JSON in this loopback-only relay and send it to overlay clients.
      // The relay never receives or records the actual video stream; WebRTC carries capture media.
      if (message.type === 'project-sync') {
        if (message.captureKey !== PROJECT_SYNC_KEY || !['publish', 'request'].includes(message.action)) return
        client.captureKeys.add(PROJECT_SYNC_KEY)
        if (message.action === 'publish') {
          if (!message.project || typeof message.project !== 'object' || Array.isArray(message.project)) return
          const snapshot = JSON.stringify({ type: 'project-sync', action: 'snapshot', captureKey: PROJECT_SYNC_KEY, project: message.project, revision: Date.now() })
          if (Buffer.byteLength(snapshot) > MAX_RELAY_PAYLOAD - 1024) return
          latestProjectSnapshot = snapshot
          for (const peer of wss.clients) {
            if (peer !== client && peer.readyState === WebSocket.OPEN && peer.captureKeys?.has(PROJECT_SYNC_KEY)) {
              try { peer.send(snapshot) } catch { /* Ignore a client that is already closing. */ }
            }
          }
        } else if (latestProjectSnapshot && client.readyState === WebSocket.OPEN) {
          try { client.send(latestProjectSnapshot) } catch { /* Ignore a client that is already closing. */ }
        }
        return
      }

      if (typeof message.captureKey !== 'string' || message.captureKey.length > 300) return
      client.captureKeys.add(message.captureKey)
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
