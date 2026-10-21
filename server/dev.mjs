import { createServer } from 'vite'
import { startCaptureRelay } from './capture-relay.mjs'

let relay
let vite
let stopping = false

async function stop() {
  if (stopping) return
  stopping = true
  try { await vite?.close() } catch { /* Continue shutting down. */ }
  try { await relay?.close() } catch { /* Continue shutting down. */ }
}

try {
  relay = await startCaptureRelay()
  vite = await createServer({ server: { host: '127.0.0.1', port: 5173, strictPort: true } })
  await vite.listen()
  vite.printUrls()
  console.log('\nCaptura para abas e Browser Source: mantenha esta janela aberta enquanto usa o relay local.\n')
} catch (error) {
  console.error('\nNão foi possível iniciar o estúdio e o relay de captura.')
  console.error(error instanceof Error ? error.message : error)
  console.error('Confirme se as portas 5173 e 4174 estão livres.\n')
  await stop()
  process.exitCode = 1
}

process.on('SIGINT', () => { void stop().finally(() => process.exit(0)) })
process.on('SIGTERM', () => { void stop().finally(() => process.exit(0)) })
