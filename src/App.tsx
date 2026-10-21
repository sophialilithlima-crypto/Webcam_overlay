import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ChangeEvent, CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import './App.css'

type WidgetKind = 'alert' | 'chat' | 'events' | 'goal' | 'latest' | 'socials' | 'countdown' | 'clock' | 'viewer' | 'ticker' | 'music' | 'poll' | 'sponsor' | 'webcam-frame' | 'live-badge' | 'tip-jar' | 'stream-boss' | 'leaderboard'
type WidgetTheme = 'glass' | 'neon' | 'minimal' | 'solid'
type SourceType = 'text' | 'shape' | 'camera' | 'image' | 'browser' | 'widget'
type BackgroundConfig = { mode: 'transparent' | 'solid' | 'gradient'; color: string; color2: string; angle: number }
type SceneSource = {
  id: string
  type: SourceType
  name: string
  visible: boolean
  locked?: boolean
  x: number
  y: number
  w: number
  h: number
  text?: string
  color?: string
  fontSize?: number
  src?: string
  objectFit?: 'contain' | 'cover'
  radius?: number
  rotation?: number
  opacity?: number
  borderColor?: string
  borderWidth?: number
  shadow?: boolean
  fontFamily?: string
  fontWeight?: number
  textAlign?: 'left' | 'center' | 'right'
  italic?: boolean
  letterSpacing?: number
  lineHeight?: number
  textBackground?: boolean
  textBackgroundColor?: string
  shapeKind?: 'rectangle' | 'circle' | 'pill' | 'line'
  url?: string
  cameraMirror?: boolean
  widgetKind?: WidgetKind
  widgetTitle?: string
  widgetText?: string
  widgetValue?: string
  widgetTarget?: string
  widgetItems?: string
  widgetAccent?: string
  widgetSeconds?: number
  widgetRunning?: boolean
  widgetTheme?: WidgetTheme
  widgetShowHeader?: boolean
  widgetCompact?: boolean
  isBackgroundAsset?: boolean
}
type Scene = { id: string; name: string; sources: SceneSource[]; background?: BackgroundConfig; width?: number; height?: number }
type Project = { version: 1; activeSceneId: string; scenes: Scene[] }
type Interaction = {
  sourceId: string
  mode: 'move' | 'resize'
  pointerX: number
  pointerY: number
  x: number
  y: number
  w: number
  h: number
}

const STORAGE_KEY = 'webcam-overlay-project-v2'
const LEGACY_STORAGE_KEY = 'webcam-overlay-project-v1'
const MAX_IMAGE_BYTES = 1_500_000
const MAX_IMPORT_BATCH_BYTES = 1_500_000
const MAX_PROJECT_JSON_CHARS = 2_150_000

const WIDGET_OPTIONS: { kind: WidgetKind; label: string; description: string; glyph: string }[] = [
  { kind: 'alert', label: 'Alertas de evento', description: 'Seguidor, inscrição, raid ou doação (demonstração)', glyph: '✦' },
  { kind: 'chat', label: 'Caixa de chat', description: 'Mensagens com nomes, cores e estilo editáveis', glyph: '☷' },
  { kind: 'events', label: 'Atividade recente', description: 'Últimos follows, subs, raids e apoios', glyph: '↗' },
  { kind: 'goal', label: 'Barra de meta', description: 'Seguidores, inscrições ou arrecadação', glyph: '▰' },
  { kind: 'latest', label: 'Último apoiador', description: 'Etiqueta para último seguidor ou inscrito', glyph: '☆' },
  { kind: 'socials', label: 'Redes sociais', description: 'Perfis e nomes das redes do streamer', glyph: '◎' },
  { kind: 'countdown', label: 'Contagem regressiva', description: 'Temporizador para início ou retorno', glyph: '◷' },
  { kind: 'clock', label: 'Relógio', description: 'Hora local para streams e maratonas', glyph: '◴' },
  { kind: 'viewer', label: 'Status e espectadores', description: 'Selo AO VIVO e contador demonstrativo', glyph: '●' },
  { kind: 'ticker', label: 'Faixa rolante', description: 'Avisos, comandos ou mensagem de apoio', glyph: '⇠' },
  { kind: 'music', label: 'Tocando agora', description: 'Faixa e artista editáveis manualmente', glyph: '♫' },
  { kind: 'poll', label: 'Enquete', description: 'Opções e votos de demonstração', glyph: '◫' },
  { kind: 'sponsor', label: 'Patrocinador / marca', description: 'Logo textual e mensagem de parceria', glyph: '◆' },
  { kind: 'webcam-frame', label: 'Moldura de webcam', description: 'Borda decorativa com rótulo', glyph: '▣' },
  { kind: 'live-badge', label: 'Selo AO VIVO', description: 'Indicador de transmissão e tema personalizável', glyph: '●' },
  { kind: 'tip-jar', label: 'Jarra de apoio', description: 'Barra visual de contribuições e objetivo', glyph: '♥' },
  { kind: 'stream-boss', label: 'Chefe da transmissão', description: 'Barra de vida editável para interação da comunidade', glyph: '⚔' },
  { kind: 'leaderboard', label: 'Ranking de apoiadores', description: 'Lista editável de maiores apoiadores', glyph: '♛' },
]

function makeDefaultProject(): Project {
  return {
    version: 1,
    activeSceneId: 'scene-live',
    scenes: [
      {
        id: 'scene-live',
        name: 'Ao vivo',
        sources: [
          {
            id: 'source-camera', type: 'camera', name: 'Webcam', visible: true,
            x: 5, y: 9, w: 30, h: 48, radius: 4,
          },
          {
            id: 'source-lower-third', type: 'shape', name: 'Barra de identificação',
            visible: true, x: 5, y: 70, w: 48, h: 16, color: '#7772f2', radius: 2,
          },
          {
            id: 'source-title', type: 'text', name: 'Título', visible: true,
            x: 7, y: 72, w: 43, h: 11, text: 'SUA MARCA AQUI', color: '#ffffff', fontSize: 36,
          },
          {
            id: 'widget-live-badge', type: 'widget', widgetKind: 'live-badge', name: 'Selo AO VIVO', visible: true,
            x: 84, y: 4, w: 11, h: 6, widgetTitle: 'AO VIVO', widgetText: 'TRANSMITINDO', widgetAccent: '#ff4e70', widgetTheme: 'minimal',
          },
          {
            id: 'widget-goal', type: 'widget', widgetKind: 'goal', name: 'Meta de seguidores', visible: true,
            x: 65, y: 15, w: 30, h: 13, widgetTitle: 'META DE SEGUIDORES', widgetText: 'Rumo à próxima meta', widgetValue: '68', widgetTarget: '100', widgetAccent: '#8d85ff', widgetTheme: 'glass',
          },
          {
            id: 'widget-events', type: 'widget', widgetKind: 'events', name: 'Atividade recente', visible: true,
            x: 65, y: 31, w: 30, h: 31, widgetTitle: 'ATIVIDADE RECENTE', widgetItems: 'Novo seguidor · pixelrider\nNova inscrição · lua_gamer\nApoio · catbits · R$ 10\nRaid · canal_da_nina · 24', widgetAccent: '#8d85ff', widgetTheme: 'glass',
          },
          {
            id: 'widget-socials', type: 'widget', widgetKind: 'socials', name: 'Redes sociais', visible: true,
            x: 5, y: 91, w: 67, h: 6, widgetTitle: 'ME ENCONTRE', widgetItems: 'Twitch  @seucanal\nInstagram  @seuperfil\nYouTube  @seucanal', widgetAccent: '#8d85ff', widgetTheme: 'minimal',
          },
          {
            id: 'widget-latest', type: 'widget', widgetKind: 'latest', name: 'Último seguidor', visible: true,
            x: 65, y: 67, w: 30, h: 10, widgetTitle: 'ÚLTIMO SEGUIDOR', widgetText: 'pixelrider', widgetAccent: '#70e1c1', widgetTheme: 'minimal',
          },
        ],
      },
      {
        id: 'scene-start', name: 'Começando',
        sources: [
          {
            id: 'source-start-accent', type: 'shape', name: 'Acento', visible: true,
            x: 8, y: 26, w: 1.2, h: 45, color: '#9187ff', radius: 1,
          },
          {
            id: 'source-start-title', type: 'text', name: 'Mensagem principal', visible: true,
            x: 12, y: 31, w: 66, h: 16, text: 'COMEÇAMOS EM INSTANTES', color: '#f5f4ff', fontSize: 46,
          },
          {
            id: 'source-start-subtitle', type: 'text', name: 'Subtítulo', visible: true,
            x: 12, y: 49, w: 55, h: 9, text: 'Prepare-se. A transmissão vai começar.', color: '#b5b5cc', fontSize: 22,
          },
        ],
      },
      {
        id: 'scene-break', name: 'Intervalo',
        sources: [
          {
            id: 'source-break-shape', type: 'shape', name: 'Forma decorativa', visible: true,
            x: 74, y: 19, w: 17, h: 29, color: '#7772f2', radius: 10,
          },
          {
            id: 'source-break-title', type: 'text', name: 'Mensagem', visible: true,
            x: 12, y: 39, w: 54, h: 15, text: 'VOLTAMOS JÁ', color: '#ffffff', fontSize: 54,
          },
          {
            id: 'source-break-subtitle', type: 'text', name: 'Complemento', visible: true,
            x: 12, y: 56, w: 48, h: 8, text: 'Faça uma pausa e fique por aqui.', color: '#b5b5cc', fontSize: 22,
          },
        ],
      },
    ],
  }
}

function isValidProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Project>
  const allowedTypes: SourceType[] = ['text', 'shape', 'camera', 'image', 'browser', 'widget']
  const allowedWidgetKinds = WIDGET_OPTIONS.map((option) => option.kind)
  if (candidate.version !== 1 || !Array.isArray(candidate.scenes) || candidate.scenes.length === 0 || candidate.scenes.length > 100) return false

  const sceneIds = new Set<string>()
  for (const scene of candidate.scenes) {
    if (!scene || typeof scene.id !== 'string' || !scene.id || sceneIds.has(scene.id) || typeof scene.name !== 'string' || !Array.isArray(scene.sources) || scene.sources.length > 250) return false
    sceneIds.add(scene.id)
    if (scene.width !== undefined && (!Number.isFinite(scene.width) || scene.width < 320 || scene.width > 3840)) return false
    if (scene.height !== undefined && (!Number.isFinite(scene.height) || scene.height < 320 || scene.height > 3840)) return false
    if (scene.background !== undefined && (!scene.background || !['transparent', 'solid', 'gradient'].includes(scene.background.mode))) return false

    const sourceIds = new Set<string>()
    for (const source of scene.sources) {
      if (!source || typeof source !== 'object' || typeof source.id !== 'string' || !source.id || sourceIds.has(source.id) ||
        typeof source.name !== 'string' || !allowedTypes.includes(source.type)) return false
      sourceIds.add(source.id)
      if (source.widgetKind !== undefined && !allowedWidgetKinds.includes(source.widgetKind)) return false
      if (source.visible !== undefined && typeof source.visible !== 'boolean') return false
      if (source.locked !== undefined && typeof source.locked !== 'boolean') return false
      if (source.x !== undefined && !Number.isFinite(source.x)) return false
      if (source.y !== undefined && !Number.isFinite(source.y)) return false
      if (source.w !== undefined && !Number.isFinite(source.w)) return false
      if (source.h !== undefined && !Number.isFinite(source.h)) return false
      if (source.src !== undefined && typeof source.src !== 'string') return false
      if (source.text !== undefined && typeof source.text !== 'string') return false
      if (source.color !== undefined && typeof source.color !== 'string') return false
      if (source.url !== undefined && typeof source.url !== 'string') return false
    }
  }
  return true
}

function normalizeProject(parsed: Project): Project {
  const scenes = parsed.scenes.map((scene) => {
    const sources = scene.sources.map((source) => {
      const x = clamp(Number.isFinite(source.x) ? Number(source.x) : 8, 0, 96)
      const y = clamp(Number.isFinite(source.y) ? Number(source.y) : 8, 0, 96)
      const w = clamp(Number.isFinite(source.w) ? Number(source.w) : 30, 4, 100 - x)
      const h = clamp(Number.isFinite(source.h) ? Number(source.h) : 12, 4, 100 - y)
      const knownWidget = WIDGET_OPTIONS.some((option) => option.kind === source.widgetKind)
      return {
        ...source,
        name: source.name.slice(0, 70) || 'Fonte',
        visible: source.visible !== false,
        x, y, w, h,
        opacity: clamp(Number.isFinite(source.opacity) ? Number(source.opacity) : 1, 0, 1),
        rotation: clamp(Number.isFinite(source.rotation) ? Number(source.rotation) : 0, -180, 180),
        fontSize: clamp(Number.isFinite(source.fontSize) ? Number(source.fontSize) : 30, 8, 160),
        text: typeof source.text === 'string' ? source.text.slice(0, 2000) : undefined,
        widgetTitle: typeof source.widgetTitle === 'string' ? source.widgetTitle.slice(0, 90) : undefined,
        widgetText: typeof source.widgetText === 'string' ? source.widgetText.slice(0, 300) : undefined,
        widgetItems: typeof source.widgetItems === 'string' ? source.widgetItems.slice(0, 1200) : undefined,
        widgetKind: source.type === 'widget' ? ((knownWidget ? source.widgetKind : undefined) ?? 'goal') : source.widgetKind,
      }
    })
    const rawBackground = scene.background
    const background: BackgroundConfig = {
      mode: rawBackground && ['transparent', 'solid', 'gradient'].includes(rawBackground.mode) ? rawBackground.mode : 'transparent',
      color: typeof rawBackground?.color === 'string' ? rawBackground.color : '#171923',
      color2: typeof rawBackground?.color2 === 'string' ? rawBackground.color2 : '#28243c',
      angle: clamp(Number.isFinite(rawBackground?.angle) ? Number(rawBackground?.angle) : 135, 0, 360),
    }
    return {
      ...scene,
      name: scene.name.trim().slice(0, 40) || 'Cena',
      width: clamp(Number.isFinite(scene.width) ? Number(scene.width) : 1920, 320, 3840),
      height: clamp(Number.isFinite(scene.height) ? Number(scene.height) : 1080, 320, 3840),
      background,
      sources: separateOverlappingText(sources),
    }
  })
  const activeSceneId = scenes.some((scene) => scene.id === parsed.activeSceneId) ? parsed.activeSceneId : scenes[0].id
  return { version: 1, activeSceneId, scenes }
}

function readProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isValidProject(parsed)) return normalizeProject(parsed)
    }
  } catch {
    // Dados ausentes ou corrompidos: iniciar com um projeto padrão.
  }
  return makeDefaultProject()
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function overlapScore(a: Pick<SceneSource, 'x' | 'y' | 'w' | 'h'>, b: Pick<SceneSource, 'x' | 'y' | 'w' | 'h'>) {
  const intersectionWidth = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x))
  const intersectionHeight = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
  const intersection = intersectionWidth * intersectionHeight
  const smallerArea = Math.max(1, Math.min(a.w * a.h, b.w * b.h))
  return intersection / smallerArea
}

function rectanglesOverlap(a: Pick<SceneSource, 'x' | 'y' | 'w' | 'h'>, b: Pick<SceneSource, 'x' | 'y' | 'w' | 'h'>) {
  // Compare against the smaller object so a small title overlapping a large overlay panel is not missed.
  return overlapScore(a, b) > 0.08
}

function placeWithoutOverlap(sources: SceneSource[], candidate: SceneSource): SceneSource {
  const bounded = {
    ...candidate,
    w: clamp(candidate.w, 4, 100),
    h: clamp(candidate.h, 4, 100),
    x: clamp(candidate.x, 0, 100 - clamp(candidate.w, 4, 100)),
    y: clamp(candidate.y, 0, 100 - clamp(candidate.h, 4, 100)),
  }
  const obstacles = sources.filter((source) => source.visible && !source.isBackgroundAsset)
  if (!obstacles.some((source) => rectanglesOverlap(bounded, source))) return bounded

  const stepX = Math.max(3, Math.min(8, Math.round(bounded.w * 0.25)))
  const stepY = Math.max(3, Math.min(8, Math.round(bounded.h * 0.3)))
  const positions: { x: number; y: number; distance: number; overlap: number }[] = [{ x: bounded.x, y: bounded.y, distance: 0, overlap: 0 }]
  for (let y = 2; y <= 100 - bounded.h; y += stepY) {
    for (let x = 2; x <= 100 - bounded.w; x += stepX) {
      const rect = { ...bounded, x, y }
      const overlap = obstacles.reduce((total, source) => total + overlapScore(rect, source), 0)
      positions.push({ x, y, distance: Math.abs(x - bounded.x) + Math.abs(y - bounded.y) * 1.15, overlap })
    }
  }
  // Prefer any genuinely free slot. If the canvas is full, pick the slot with the least overlap rather
  // than shifting by a fixed offset and placing the new item directly over another title.
  const free = positions.filter((position) => !obstacles.some((source) => rectanglesOverlap({ ...bounded, x: position.x, y: position.y }, source)))
    .sort((a, b) => a.distance - b.distance)[0]
  if (free) return { ...bounded, x: free.x, y: free.y }

  positions.sort((a, b) => a.overlap - b.overlap || a.distance - b.distance)
  const best = positions[0]
  return { ...bounded, x: best?.x ?? bounded.x, y: best?.y ?? bounded.y }
}

function separateOverlappingText(sources: SceneSource[]): SceneSource[] {
  const result: SceneSource[] = []
  for (const source of sources) {
    if (source.type !== 'text') {
      result.push(source)
      continue
    }
    const previousText = result.filter((item) => item.type === 'text' && item.visible)
    const overlapsPreviousText = previousText.some((item) => rectanglesOverlap(source, item))
    result.push(overlapsPreviousText ? placeWithoutOverlap(previousText, source) : source)
  }
  return result
}

function persistProject(project: Project): boolean {
  try {
    const serialized = JSON.stringify(project)
    if (serialized.length > MAX_PROJECT_JSON_CHARS) return false
    localStorage.setItem(STORAGE_KEY, serialized)
    return true
  } catch {
    return false
  }
}

function parseLocalImageData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Não foi possível ler a imagem.'))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
}

function imageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth || 1, height: image.naturalHeight || 1 })
    image.onerror = () => resolve({ width: 1, height: 1 })
    image.src = dataUrl
  })
}

function sourceLabel(type: SourceType) {
  return ({ text: 'Texto', shape: 'Forma', camera: 'Câmera', image: 'Imagem', browser: 'Navegador', widget: 'Widget' })[type]
}

function sourceGlyph(type: SourceType) {
  return ({ text: 'T', shape: '◇', camera: '◉', image: '▧', browser: '↗', widget: '✦' })[type]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function safeFileName(name: string) {
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'webcam-overlay'
}

function downloadProject(project: Project) {
  const data = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeFileName(project.scenes.find((scene) => scene.id === project.activeSceneId)?.name ?? 'webcam-overlay')}-projeto.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function sourceStyle(source: SceneSource, index: number): CSSProperties {
  const style: CSSProperties = {
    left: `${source.x}%`,
    top: `${source.y}%`,
    width: `${source.w}%`,
    height: `${source.h}%`,
    zIndex: index + 1,
    borderRadius: `${source.radius ?? 4}px`,
  }
  style.opacity = source.opacity ?? 1
  style.transform = `rotate(${source.rotation ?? 0}deg)`
  style.borderColor = source.borderColor ?? 'transparent'
  style.borderWidth = `${source.borderWidth ?? 0}px`
  style.borderStyle = 'solid'
  style.boxShadow = source.shadow ? '0 8px 28px #0008' : 'none'
  if (source.type === 'text') {
    style.color = source.color ?? '#ffffff'
    style.fontSize = `clamp(8px, ${(source.fontSize ?? 30) / 19.2}cqw, 160px)`
    style.fontFamily = source.fontFamily ?? 'Inter, system-ui, sans-serif'
    style.fontWeight = source.fontWeight ?? 750
    style.textAlign = source.textAlign ?? 'left'
    style.fontStyle = source.italic ? 'italic' : 'normal'
    style.letterSpacing = `${(source.letterSpacing ?? -0.5) / 19.2}cqw`
    style.lineHeight = source.lineHeight ?? 1.12
    style.backgroundColor = source.textBackground ? (source.textBackgroundColor ?? '#11121b') : 'transparent'
    style.padding = source.textBackground ? '0.22em 0.35em' : '0'
  }
  if (source.type === 'shape') style.backgroundColor = source.color ?? '#7772f2'
  if (source.type === 'widget') {
    Object.assign(style, { '--widget-accent': source.widgetAccent ?? source.color ?? '#8d85ff' })
  }
  if (source.type === 'camera' || source.type === 'image' || source.type === 'browser') style.overflow = 'hidden'
  return style
}

function getBrowserUrl(url: string | undefined) {
  if (!url?.trim()) return 'about:blank'
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : 'about:blank'
  } catch {
    return 'about:blank'
  }
}

function sceneBackgroundStyle(scene: Scene, isPreview = false): CSSProperties {
  const background = scene.background
  const mode = background?.mode ?? 'transparent'
  if (mode === 'transparent') {
    return isPreview
      ? { backgroundColor: 'transparent', backgroundImage: 'repeating-conic-gradient(#262936 0% 25%, #1c1f29 0% 50%)', backgroundSize: '24px 24px' }
      : { backgroundColor: 'transparent', backgroundImage: 'none' }
  }
  if (mode === 'solid') return { backgroundColor: background?.color ?? '#171923', backgroundImage: 'none' }
  return { backgroundColor: background?.color ?? '#171923', backgroundImage: `linear-gradient(${background?.angle ?? 135}deg, ${background?.color ?? '#25233a'}, ${background?.color2 ?? '#10121a'})` }
}

function WidgetContent({ source, testToken = 0 }: { source: SceneSource; testToken?: number }) {
  const kind = source.widgetKind ?? 'goal'
  const accent = source.widgetAccent ?? source.color ?? '#8d85ff'
  const [remaining, setRemaining] = useState(source.widgetSeconds ?? 600)
  const [now, setNow] = useState(() => new Date())
  const [alertVisible, setAlertVisible] = useState(false)

  useEffect(() => {
    setRemaining(source.widgetSeconds ?? 600)
  }, [source.widgetSeconds, kind])

  useEffect(() => {
    if (kind !== 'countdown' || source.widgetRunning === false) return
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [kind, source.widgetRunning])

  useEffect(() => {
    if (kind !== 'clock') return
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [kind])

  useEffect(() => {
    if (kind !== 'alert' || testToken <= 0) return
    setAlertVisible(true)
    const timeout = window.setTimeout(() => setAlertVisible(false), 4200)
    return () => window.clearTimeout(timeout)
  }, [kind, testToken])

  const lines = (source.widgetItems ?? '').split('\n').map((line) => line.trim()).filter(Boolean)
  const currentValue = Number.parseFloat((source.widgetValue ?? '68').replace(/[^\d.]/g, '')) || 0
  const targetValue = Math.max(1, Number.parseFloat((source.widgetTarget ?? '100').replace(/[^\d.]/g, '')) || 100)
  const progress = Math.min(100, Math.max(0, (currentValue / targetValue) * 100))
  const time = remaining >= 3600
    ? `${String(Math.floor(remaining / 3600)).padStart(2, '0')}:${String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
    : `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`

  if (kind === 'webcam-frame') {
    return <div className={`stream-widget webcam-frame-widget widget-theme-${source.widgetTheme ?? 'neon'}`} style={{ '--widget-accent': accent } as CSSProperties}>
      <div className="webcam-frame-corner corner-tl" /><div className="webcam-frame-corner corner-tr" />
      <div className="webcam-frame-corner corner-bl" /><div className="webcam-frame-corner corner-br" />
      <span className="webcam-frame-label">{source.widgetTitle || 'WEBCAM'}</span>
    </div>
  }

  if (kind === 'live-badge') {
    return <div className={`stream-widget live-badge-widget widget-theme-${source.widgetTheme ?? 'minimal'}`} style={{ '--widget-accent': accent } as CSSProperties}>
      <span className="live-badge-dot" />
      <span className="live-badge-copy"><strong>{source.widgetTitle || 'AO VIVO'}</strong><small>{source.widgetText || 'TRANSMITINDO'}</small></span>
    </div>
  }

  return <div className={`stream-widget widget-${kind} widget-theme-${source.widgetTheme ?? 'glass'} ${alertVisible ? 'alert-triggered' : ''}`} style={{ '--widget-accent': accent } as CSSProperties}>
    {kind === 'alert' && <>
      <div className="widget-alert-icon">✦</div>
      <div className="widget-alert-content"><span className="widget-kicker">{alertVisible ? 'NOVO EVENTO!' : (source.widgetTitle || 'ALERTA DE EVENTO')}</span><strong>{alertVisible ? (source.widgetValue || 'pixelrider') : (source.widgetValue || 'Novo seguidor')}</strong><small>{source.widgetText || 'começou a seguir o canal'}</small></div>
    </>}

    {kind === 'chat' && <>
      <div className="widget-header"><strong>{source.widgetTitle || 'CHAT AO VIVO'}</strong></div>
      <div className="chat-messages">{(lines.length ? lines : ['LuaGamer: Oi, chat!', 'PixelRider: Boa live!', 'nina: Qual é o jogo?', 'Gui: Cheguei agora']).map((line, index) => {
        const separator = line.indexOf(':')
        const username = separator >= 0 ? line.slice(0, separator) : `viewer${index + 1}`
        const message = separator >= 0 ? line.slice(separator + 1).trim() : line
        return <div className="chat-message" key={`${line}-${index}`}><strong style={{ color: ['#b8a8ff', '#74dfc5', '#ffbd83', '#85c8ff'][index % 4] }}>{username}</strong><span>{message}</span></div>
      })}</div>
      <div className="chat-input-sample"><span>Enviar mensagem…</span><b>↗</b></div>
    </>}

    {kind === 'events' && <>
      <div className="widget-header"><strong>{source.widgetTitle || 'ATIVIDADE RECENTE'}</strong></div>
      <div className="event-items">{(lines.length ? lines : ['Novo seguidor · pixelrider', 'Nova inscrição · lua_gamer', 'Apoio · catbits · R$ 10', 'Raid · canal_da_nina · 24']).slice(0, 6).map((line, index) => {
        const parts = line.split('·').map((part) => part.trim())
        return <div className="event-item" key={`${line}-${index}`}><span className={`event-type-icon event-icon-${index % 4}`}>{['↗', '★', '♥', '✦'][index % 4]}</span><span className="event-copy"><strong>{parts[0]}</strong><small>{parts.slice(1).join(' · ') || 'viewer_exemplo'}</small></span></div>
      })}</div>
    </>}

    {kind === 'goal' && <>
      <div className="widget-header"><strong>{source.widgetTitle || 'META DA LIVE'}</strong></div>
      {source.widgetText && <p className="widget-muted-line">{source.widgetText}</p>}
      <div className="goal-numbers"><strong>{source.widgetValue ?? '68'}</strong><span>/ {source.widgetTarget ?? '100'}</span><b>{Math.round(progress)}%</b></div>
      <div className="goal-track"><span style={{ width: `${progress}%` }} /></div>
      <small className="goal-footnote">{progress >= 100 ? 'Meta alcançada!' : `${Math.max(0, targetValue - currentValue)} para alcançar a meta`}</small>
    </>}

    {kind === 'latest' && <>
      <div className="latest-icon">☆</div><div className="latest-copy"><span className="widget-kicker">{source.widgetTitle || 'ÚLTIMO SEGUIDOR'}</span><strong>{source.widgetText || 'pixelrider'}</strong></div>
    </>}

    {kind === 'socials' && <>
      {source.widgetTitle && <div className="widget-header"><strong>{source.widgetTitle}</strong><span className="widget-header-pill">PERFIS</span></div>}
      <div className="social-list">{(lines.length ? lines : ['Twitch  @seucanal', 'Instagram  @seuperfil', 'YouTube  @seucanal']).map((line, index) => {
        const separator = line.search(/[·|]/)
        const label = separator >= 0 ? line.slice(0, separator).trim() : line.split(/\s+/)[0]
        const account = separator >= 0 ? line.slice(separator + 1).trim() : line.slice(label.length).trim()
        return <div className="social-item" key={`${line}-${index}`}><span>{['T', '◎', '▶', '♪'][index % 4]}</span><strong>{label}</strong><small>{account || '@seuperfil'}</small></div>
      })}</div>
    </>}

    {kind === 'countdown' && <>
      <span className="widget-kicker">{source.widgetTitle || 'COMEÇAMOS EM'}</span>
      <strong className="countdown-time">{time}</strong>
      <small className="widget-muted-line">{remaining === 0 ? 'Está na hora!' : (source.widgetText || 'Prepare-se para a transmissão')}</small>
    </>}

    {kind === 'clock' && <>
      <span className="widget-kicker">{source.widgetTitle || 'HORA LOCAL'}</span>
      <strong className="clock-time">{now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
      <small className="widget-muted-line">{now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</small>
    </>}

    {kind === 'viewer' && <>
      <span className="live-badge-dot" /><div className="viewer-copy"><span className="widget-kicker">{source.widgetTitle || 'AO VIVO'}</span><strong>{source.widgetValue || '128'} <small>espectadores</small></strong></div>
    </>}

    {kind === 'ticker' && <>
      <span className="ticker-star">✦</span><div className="ticker-window"><div className="ticker-track"><span>{source.widgetText || 'SIGA O CANAL  •  ATIVE AS NOTIFICAÇÕES  •  COMPARTILHE A LIVE  •  OBRIGADO POR ASSISTIR  •  '}</span><span aria-hidden="true">{source.widgetText || 'SIGA O CANAL  •  ATIVE AS NOTIFICAÇÕES  •  COMPARTILHE A LIVE  •  OBRIGADO POR ASSISTIR  •  '}</span></div></div>
    </>}

    {kind === 'music' && <>
      <div className="music-art">♫</div><div className="music-copy"><span className="widget-kicker">{source.widgetTitle || 'TOCANDO AGORA'}</span><strong>{source.widgetText || 'Nome da música'}</strong><small>{source.widgetValue || 'Artista / álbum'}</small></div><span className="music-bars"><i /><i /><i /><i /></span>
    </>}

    {kind === 'poll' && <>
      <div className="widget-header"><strong>{source.widgetTitle || 'ENQUETE DA LIVE'}</strong></div>
      <div className="poll-options">{(lines.length ? lines : ['Aventura | 42', 'RPG | 28', 'FPS | 30']).slice(0, 4).map((line, index) => {
        const [name, valueText] = line.split('|').map((part) => part.trim())
        const votes = Math.max(0, Number.parseFloat(valueText ?? '0') || 0)
        const maxVotes = Math.max(1, ...(lines.length ? lines : ['Aventura | 42', 'RPG | 28', 'FPS | 30']).map((item) => Number.parseFloat(item.split('|')[1] ?? '0') || 0))
        return <div className="poll-option" key={`${line}-${index}`}><div><span>{name}</span><b>{Math.round((votes / maxVotes) * 100)}%</b></div><div className="poll-track"><span style={{ width: `${(votes / maxVotes) * 100}%` }} /></div></div>
      })}</div>
    </>}

    {kind === 'tip-jar' && <>
      <div className="widget-header"><strong>{source.widgetTitle || 'JARRA DE APOIO'}</strong></div>
      <div className="tip-jar-content">
        <div className="tip-jar-vessel"><div className="tip-jar-liquid" style={{ height: `${progress}%` }} /></div>
        <div className="tip-jar-stats"><span className="widget-kicker">{source.widgetText || 'ARRECADADO'}</span><strong>R$ {currentValue.toLocaleString('pt-BR')}</strong><div className="goal-track"><span style={{ width: `${progress}%` }} /></div><small>Meta: R$ {targetValue.toLocaleString('pt-BR')}</small></div>
      </div>
    </>}

    {kind === 'stream-boss' && <>
      <div className="widget-header"><strong>{source.widgetTitle || 'CHEFE DA TRANSMISSÃO'}</strong><span className="boss-level">LV. 1</span></div>
      <div className="boss-health-labels"><span>VIDA DO CHEFE</span><strong>{Math.round(progress)}%</strong></div>
      <div className="boss-health-track"><span style={{ width: `${progress}%` }} /></div>
      <small className="widget-muted-line">{source.widgetText || 'A comunidade reduz a barra em eventos reais, quando integrada.'}</small>
    </>}

    {kind === 'leaderboard' && <>
      <div className="widget-header"><strong>{source.widgetTitle || 'TOP APOIADORES'}</strong></div>
      <div className="leaderboard-list">{(lines.length ? lines : ['pixelrider | R$ 150', 'lua_gamer | R$ 80', 'catbits | R$ 45', 'nina | R$ 25']).slice(0, 5).map((line, index) => {
        const [name, amount] = line.split('|').map((part) => part.trim())
        return <div className="leaderboard-row" key={`${line}-${index}`}><span className={`leaderboard-rank rank-${index + 1}`}>{index + 1}</span><strong>{name || `Apoiador ${index + 1}`}</strong><small>{amount || '—'}</small></div>
      })}</div>
    </>}

    {kind === 'sponsor' && <>
      <div className="sponsor-mark">◆</div><div className="sponsor-copy"><span className="widget-kicker">{source.widgetTitle || 'APOIO'}</span><strong>{source.widgetText || 'SUA MARCA AQUI'}</strong><small>{source.widgetValue || 'Parceiro oficial da live'}</small></div>
    </>}
  </div>
}

function App() {
  const overlayMode = new URLSearchParams(window.location.search).get('mode') === 'overlay'
  return overlayMode ? <OverlayView /> : <Editor />
}

function Editor() {
  const [project, setProject] = useState<Project>(() => readProject())
  const projectRef = useRef(project)
  projectRef.current = project
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>('source-title')
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false)
  const [widgetSearch, setWidgetSearch] = useState('')
  const [showPackMenu, setShowPackMenu] = useState(false)
  const [alertTestTokens, setAlertTestTokens] = useState<Record<string, number>>({})
  const [message, setMessage] = useState('')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [interaction, setInteraction] = useState<Interaction | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [openSceneMenuId, setOpenSceneMenuId] = useState<string | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const undoStackRef = useRef<Project[]>([])
  const redoStackRef = useRef<Project[]>([])
  const historySnapshotRef = useRef<Project>(project)
  const stageRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const backgroundDesignInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const activeScene = useMemo(
    () => project.scenes.find((scene) => scene.id === project.activeSceneId) ?? project.scenes[0],
    [project],
  )
  const selectedSource = activeScene?.sources.find((source) => source.id === selectedSourceId) ?? null

  useEffect(() => {
    // Evita gravar no localStorage a cada movimento do mouse enquanto o usuário arrasta.
    if (interaction) return
    if (!persistProject(project)) {
      setMessage('O projeto excede o limite seguro de armazenamento deste navegador. Exporte o JSON antes de adicionar mais imagens ou remova assets grandes.')
    }
  }, [project, interaction])

  useEffect(() => {
    if (interaction) return
    if (JSON.stringify(project) === JSON.stringify(historySnapshotRef.current)) return
    undoStackRef.current.push(historySnapshotRef.current)
    if (undoStackRef.current.length > 60) undoStackRef.current.shift()
    redoStackRef.current = []
    historySnapshotRef.current = project
    setCanUndo(undoStackRef.current.length > 0)
    setCanRedo(false)
  }, [project, interaction])

  useEffect(() => {
    return () => cameraStream?.getTracks().forEach((track) => track.stop())
  }, [cameraStream])

  useEffect(() => {
    if (!interaction) return
    const onMove = (event: PointerEvent) => {
      const rect = stageRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0 || rect.height === 0) return
      const dx = ((event.clientX - interaction.pointerX) / rect.width) * 100
      const dy = ((event.clientY - interaction.pointerY) / rect.height) * 100
      setProject((current) => ({
        ...current,
        scenes: current.scenes.map((scene) => scene.id !== current.activeSceneId ? scene : {
          ...scene,
          sources: scene.sources.map((source) => {
            if (source.id !== interaction.sourceId || source.locked) return source
            if (interaction.mode === 'move') {
              return {
                ...source,
                x: clamp(interaction.x + dx, 0, 100 - source.w),
                y: clamp(interaction.y + dy, 0, 100 - source.h),
              }
            }
            return {
              ...source,
              w: clamp(interaction.w + dx, 4, 100 - source.x),
              h: clamp(interaction.h + dy, 4, 100 - source.y),
            }
          }),
        }),
      }))
    }
    const onUp = () => setInteraction(null)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [interaction])

  const updateActiveScene = useCallback((updater: (scene: Scene) => Scene) => {
    setProject((current) => ({
      ...current,
      scenes: current.scenes.map((scene) => scene.id === current.activeSceneId ? updater(scene) : scene),
    }))
    setMessage('')
  }, [])

  function updateSelected(changes: Partial<SceneSource>) {
    if (!selectedSource) return
    updateActiveScene((scene) => ({
      ...scene,
      sources: scene.sources.map((source) => source.id === selectedSource.id ? { ...source, ...changes } : source),
    }))
  }

  function alignSelected(alignment: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') {
    if (!selectedSource || selectedSource.locked) return
    const positions: Record<typeof alignment, Partial<SceneSource>> = {
      left: { x: 0 },
      'center-x': { x: (100 - selectedSource.w) / 2 },
      right: { x: 100 - selectedSource.w },
      top: { y: 0 },
      'center-y': { y: (100 - selectedSource.h) / 2 },
      bottom: { y: 100 - selectedSource.h },
    }
    updateSelected(positions[alignment])
  }

  function selectScene(scene: Scene) {
    setProject((current) => ({ ...current, activeSceneId: scene.id }))
    setSelectedSourceId(scene.sources[0]?.id ?? null)
    setInteraction(null)
    setOpenSceneMenuId(null)
    setSourceMenuOpen(false)
    setMessage('')
  }

  function addScene() {
    const scene: Scene = { id: newId('scene'), name: `Cena ${project.scenes.length + 1}`, sources: [], background: { mode: 'transparent', color: '#171923', color2: '#28243c', angle: 135 }, width: activeScene?.width ?? 1920, height: activeScene?.height ?? 1080 }
    setProject((current) => ({ ...current, scenes: [...current.scenes, scene], activeSceneId: scene.id }))
    setSelectedSourceId(null)
    setInteraction(null)
    setSourceMenuOpen(false)
    setShowPackMenu(false)
    setOpenSceneMenuId(null)
    setMessage('Cena vazia criada. Novos elementos serão posicionados automaticamente para reduzir sobreposições.')
  }

  function applyStarterPack(pack: 'gaming' | 'chatting' | 'minimal' | 'vertical') {
    const accent = ({ gaming: '#8d85ff', chatting: '#70d9c0', minimal: '#d4d6e4', vertical: '#70d9c0' })[pack]
    const dimensions = pack === 'vertical' ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 }
    const widget = (kind: WidgetKind, name: string, x: number, y: number, w: number, h: number, settings: Partial<SceneSource> = {}): SceneSource => ({
      id: newId('widget'), type: 'widget', widgetKind: kind, name, visible: true, x, y, w, h,
      radius: 8, opacity: 1, shadow: true, widgetAccent: accent, widgetTheme: pack === 'minimal' ? 'minimal' : pack === 'gaming' ? 'neon' : 'glass', widgetShowHeader: true,
      ...settings,
    })
    const text = (name: string, content: string, x: number, y: number, w: number, h: number, fontSize: number, color = '#ffffff'): SceneSource => ({
      id: newId('text'), type: 'text', name, text: content, visible: true, x, y, w, h, fontSize, color, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800, textAlign: 'left',
    })
    const camera = (x: number, y: number, w: number, h: number): SceneSource => ({ id: newId('camera'), type: 'camera', name: 'Webcam', visible: true, x, y, w, h, radius: 8, cameraMirror: true, shadow: true })
    const scene = (name: string, sources: SceneSource[], background: BackgroundConfig = { mode: 'transparent', color: '#171923', color2: '#25233a', angle: 135 }): Scene => ({
      id: newId('scene'), name, sources, background, width: dimensions.width, height: dimensions.height,
    })
    let additions: Scene[] = []

    if (pack === 'gaming') {
      additions = [
        scene('Gameplay · kit gamer', [
          camera(5, 10, 25, 43),
          widget('webcam-frame', 'Moldura de webcam', 4, 9, 27, 45, { widgetTitle: 'WEBCAM' }),
          widget('live-badge', 'Selo AO VIVO', 82, 4, 13, 7, { widgetTitle: 'AO VIVO', widgetText: 'TRANSMITINDO' }),
          widget('events', 'Atividade recente', 72, 14, 23, 31, { widgetTitle: 'ÚLTIMOS EVENTOS', widgetItems: 'Novo seguidor · pixelrider\nNova inscrição · lua_gamer\nApoio · catbits · R$ 10' }),
          widget('goal', 'Meta de seguidores', 70, 49, 25, 12, { widgetTitle: 'META DE SEGUIDORES', widgetText: 'Próxima meta', widgetValue: '68', widgetTarget: '100' }),
          widget('ticker', 'Faixa de redes', 5, 91, 90, 6, { widgetText: 'SIGA NAS REDES  •  OBRIGADO POR ESTAR AQUI  •  ' }),
        ]),
        scene('Começando · kit gamer', [
          text('Título principal', 'COMEÇAMOS EM INSTANTES', 12, 28, 76, 13, 48),
          text('Subtítulo', 'Pegue algo para beber e fique por aqui.', 12, 44, 70, 7, 23, '#bebcda'),
          widget('countdown', 'Contagem regressiva', 12, 57, 28, 17, { widgetTitle: 'A LIVE COMEÇA EM', widgetSeconds: 300, widgetText: 'Prepare-se' }),
          widget('socials', 'Redes sociais', 48, 57, 40, 17, { widgetTitle: 'ACOMPANHE TAMBÉM', widgetItems: 'Twitch · @seucanal\nInstagram · @seuperfil\nYouTube · @seucanal' }),
        ], { mode: 'gradient', color: '#17142b', color2: '#0b111d', angle: 135 }),
        scene('Intervalo · kit gamer', [
          text('Mensagem', 'VOLTAMOS JÁ', 12, 32, 56, 13, 54),
          text('Complemento', 'Faça uma pausa. Em breve estamos de volta.', 12, 48, 70, 7, 22, '#c4c1df'),
          widget('clock', 'Relógio', 12, 65, 22, 12, { widgetTitle: 'HORA LOCAL' }),
          widget('music', 'Tocando agora', 40, 65, 35, 13, { widgetTitle: 'TOCANDO AGORA', widgetText: 'Nome da música', widgetValue: 'Artista' }),
        ], { mode: 'gradient', color: '#17142b', color2: '#0b111d', angle: 135 }),
      ]
    } else if (pack === 'chatting') {
      additions = [
        scene('Conversa · kit', [
          camera(5, 10, 29, 47),
          widget('webcam-frame', 'Moldura da câmera', 4, 9, 31, 49, { widgetTitle: 'AO VIVO' }),
          widget('chat', 'Chat demonstrativo', 67, 10, 28, 55, { widgetTitle: 'CONVERSA DA LIVE' }),
          widget('latest', 'Último seguidor', 5, 68, 28, 10, { widgetTitle: 'NOVO POR AQUI', widgetText: 'pixelrider' }),
          widget('music', 'Música atual', 37, 70, 29, 12, { widgetTitle: 'TOCANDO AGORA' }),
          widget('socials', 'Redes sociais', 5, 91, 60, 6, { widgetItems: 'Instagram · @seuperfil\nYouTube · @seucanal' }),
        ]),
        scene('Começando · conversa', [text('Título', 'VAMOS CONVERSAR', 12, 30, 72, 12, 48), text('Subtítulo', 'Acomode-se e mande um oi no chat.', 12, 46, 70, 8, 24, '#b6dcd4'), widget('countdown', 'Contagem', 12, 62, 26, 16, { widgetSeconds: 300 })], { mode: 'gradient', color: '#102a2a', color2: '#0d111c', angle: 135 }),
        scene('Intervalo · conversa', [text('Mensagem', 'PAUSA RÁPIDA', 12, 34, 55, 12, 50), widget('clock', 'Relógio', 12, 51, 22, 12, { widgetTitle: 'HORA LOCAL' }), widget('ticker', 'Aviso', 5, 91, 90, 6, { widgetText: 'JÁ VOLTAMOS  •  OBRIGADO PELA COMPANHIA  •  ' })], { mode: 'gradient', color: '#102a2a', color2: '#0d111c', angle: 135 }),
      ]
    } else if (pack === 'minimal') {
      additions = [
        scene('Ao vivo · minimalista', [camera(7, 12, 23, 40), widget('live-badge', 'Status ao vivo', 84, 5, 11, 6, { widgetTitle: 'AO VIVO', widgetText: '' }), widget('latest', 'Último seguidor', 7, 68, 25, 9, { widgetTitle: 'ÚLTIMO SEGUIDOR', widgetText: 'pixelrider', widgetTheme: 'minimal' }), widget('socials', 'Redes', 7, 91, 53, 6, { widgetTitle: '', widgetItems: 'Twitch · @seucanal\nInstagram · @seuperfil', widgetTheme: 'minimal' })]),
        scene('Começando · minimalista', [text('Título', 'COMEÇAMOS EM BREVE', 12, 34, 65, 12, 43), widget('countdown', 'Contagem regressiva', 12, 51, 22, 14, { widgetTitle: 'EM', widgetTheme: 'minimal' })], { mode: 'solid', color: '#101218', color2: '#101218', angle: 0 }),
        scene('Intervalo · minimalista', [text('Mensagem', 'VOLTAMOS JÁ', 12, 38, 50, 12, 54), widget('socials', 'Redes sociais', 12, 56, 45, 14, { widgetItems: 'Twitch · @seucanal\nInstagram · @seuperfil', widgetTheme: 'minimal' })], { mode: 'solid', color: '#101218', color2: '#101218', angle: 0 }),
      ]
    } else {
      additions = [
        scene('Vertical · ao vivo', [camera(8, 8, 84, 37), widget('webcam-frame', 'Moldura vertical', 7, 7, 86, 39, { widgetTitle: 'WEBCAM' }), widget('live-badge', 'Status ao vivo', 62, 3, 30, 5, { widgetTitle: 'AO VIVO', widgetText: '' }), widget('chat', 'Chat vertical', 8, 49, 84, 23, { widgetTitle: 'CHAT AO VIVO' }), widget('goal', 'Meta vertical', 8, 75, 84, 9, { widgetTitle: 'META DE SEGUIDORES', widgetValue: '68', widgetTarget: '100' }), widget('ticker', 'Faixa vertical', 5, 94, 90, 4, { widgetText: 'SIGA O CANAL  •  OBRIGADO POR ASSISTIR  •  ' })], { mode: 'gradient', color: '#16152b', color2: '#0c1018', angle: 135 }),
        scene('Vertical · começando', [text('Título vertical', 'COMEÇAMOS EM INSTANTES', 8, 27, 84, 13, 46), widget('countdown', 'Contagem vertical', 8, 45, 84, 15, { widgetSeconds: 300 }), widget('socials', 'Redes verticais', 8, 66, 84, 16, { widgetItems: 'Twitch · @seucanal\nInstagram · @seuperfil' })], { mode: 'gradient', color: '#16152b', color2: '#0c1018', angle: 135 }),
        scene('Vertical · intervalo', [text('Intervalo vertical', 'VOLTAMOS JÁ', 8, 37, 84, 13, 54), widget('clock', 'Relógio vertical', 8, 55, 45, 13, { widgetTitle: 'HORA LOCAL' }), widget('ticker', 'Aviso vertical', 5, 94, 90, 4, { widgetText: 'JÁ VOLTAMOS  •  FIQUE POR AQUI  •  ' })], { mode: 'gradient', color: '#16152b', color2: '#0c1018', angle: 135 }),
      ]
    }

    if (pack === 'vertical') {
      additions = [...additions, scene('Vertical · encerramento', [
        text('Mensagem de encerramento', 'OBRIGADO POR ASSISTIR', 8, 30, 84, 12, 46),
        text('Até a próxima', 'Até a próxima transmissão', 8, 44, 84, 6, 22, '#b9bdd2'),
        widget('socials', 'Redes sociais', 8, 56, 84, 16, { widgetTitle: 'ME ACOMPANHE', widgetItems: 'Instagram · @seuperfil\nYouTube · @seucanal' }),
        widget('ticker', 'Mensagem final', 5, 94, 90, 4, { widgetText: 'OBRIGADO PELA COMPANHIA  •  SIGA NAS REDES  •  ' }),
      ], { mode: 'gradient', color: '#16152b', color2: '#0c1018', angle: 135 })]
    } else {
      additions = [...additions, scene(`Encerramento · ${pack === 'gaming' ? 'gamer' : pack === 'chatting' ? 'conversa' : 'minimalista'}`, [
        text('Mensagem de encerramento', 'OBRIGADO POR ASSISTIR', 10, 31, 76, 12, 46),
        text('Até a próxima', 'Até a próxima transmissão.', 10, 45, 65, 7, 22, '#b9bdd2'),
        widget('socials', 'Redes sociais', 10, 57, 68, 13, { widgetTitle: 'ME ACOMPANHE', widgetItems: 'Instagram · @seuperfil\nYouTube · @seucanal' }),
        widget('ticker', 'Mensagem final', 5, 91, 90, 6, { widgetText: 'OBRIGADO PELA COMPANHIA  •  SIGA NAS REDES  •  ' }),
      ], { mode: 'gradient', color: pack === 'chatting' ? '#102a2a' : '#17142b', color2: '#0b111d', angle: 135 })]
    }

    setProject((current) => ({ ...current, scenes: [...current.scenes, ...additions], activeSceneId: additions[0].id }))
    setSelectedSourceId(additions[0].sources[0]?.id ?? null)
    setShowPackMenu(false)
    setSourceMenuOpen(false)
    setMessage(`Kit adicionado com ${additions.length} cenas. Você pode editar todos os elementos.`)
  }

  function renameScene(scene: Scene) {
    const name = window.prompt('Nome da cena:', scene.name)
    if (name === null) return
    const cleanName = name.trim().slice(0, 40)
    if (!cleanName) return
    setProject((current) => ({
      ...current,
      scenes: current.scenes.map((item) => item.id === scene.id ? { ...item, name: cleanName } : item),
    }))
  }

  function duplicateScene(scene: Scene) {
    const copy: Scene = {
      ...scene,
      id: newId('scene'),
      name: `${scene.name} (cópia)`.slice(0, 40),
      sources: scene.sources.map((source) => ({ ...source, id: newId('source') })),
      background: scene.background ? { ...scene.background } : undefined,
    }
    setProject((current) => ({ ...current, scenes: [...current.scenes, copy], activeSceneId: copy.id }))
    setSelectedSourceId(copy.sources[0]?.id ?? null)
    setOpenSceneMenuId(null)
    setMessage('Cena duplicada.')
  }

  function deleteScene(scene: Scene) {
    if (project.scenes.length <= 1) {
      setMessage('O projeto precisa ter pelo menos uma cena.')
      return
    }
    if (!window.confirm(`Excluir a cena “${scene.name}”?`)) return
    const remaining = project.scenes.filter((item) => item.id !== scene.id)
    const nextActive = scene.id === project.activeSceneId ? remaining[0] : activeScene
    setProject((current) => ({ ...current, scenes: remaining, activeSceneId: nextActive.id }))
    setSelectedSourceId(nextActive.sources[0]?.id ?? null)
  }

  function addSource(type: Exclude<SourceType, 'widget'>) {
    if (type === 'image') {
      imageInputRef.current?.click()
      setSourceMenuOpen(false)
      return
    }
    const count = activeScene.sources.filter((source) => source.type === type).length + 1
    const defaults: Record<Exclude<SourceType, 'image' | 'widget'>, Partial<SceneSource>> = {
      text: { x: 7 + (Math.floor((count - 1) / 5) % 2) * 47, y: 8 + ((count - 1) % 5) * 15, w: 42, h: 10, text: 'Seu texto', color: '#ffffff', fontSize: 34, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 750, textAlign: 'left', letterSpacing: -0.5, lineHeight: 1.12 },
      shape: { x: 38, y: 30, w: 20, h: 22, color: '#7772f2', radius: 10, shapeKind: 'rectangle' },
      camera: { x: 35, y: 20, w: 30, h: 45, radius: 5, cameraMirror: true },
      browser: { x: 32, y: 25, w: 36, h: 34, url: 'https://example.com', radius: 4 },
    }
    const source: SceneSource = placeWithoutOverlap(activeScene.sources, {
      id: newId('source'), type, name: `${sourceLabel(type)} ${count}`, visible: true,
      ...defaults[type],
    } as SceneSource)
    updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, source] }))
    setSelectedSourceId(source.id)
    setSourceMenuOpen(false)
  }

  function addWidget(kind: WidgetKind) {
    const presets: Record<WidgetKind, { x: number; y: number; w: number; h: number; title: string; text?: string; value?: string; target?: string; items?: string; seconds?: number; accent: string; theme: WidgetTheme }> = {
      alert: { x: 35, y: 8, w: 30, h: 13, title: 'ALERTA DE EVENTO', text: 'começou a seguir o canal', value: 'pixelrider', accent: '#8d85ff', theme: 'neon' },
      chat: { x: 70, y: 12, w: 26, h: 45, title: 'CHAT AO VIVO', items: 'LuaGamer: Oi, chat!\nPixelRider: Boa live!\nnina: Qual é o jogo?\nGui: Cheguei agora', accent: '#8d85ff', theme: 'glass' },
      events: { x: 70, y: 59, w: 26, h: 29, title: 'ATIVIDADE RECENTE', items: 'Novo seguidor · pixelrider\nNova inscrição · lua_gamer\nApoio · catbits · R$ 10\nRaid · canal_da_nina · 24', accent: '#8d85ff', theme: 'glass' },
      goal: { x: 59, y: 72, w: 32, h: 13, title: 'META DE SEGUIDORES', text: 'Rumo à próxima meta', value: '68', target: '100', accent: '#8d85ff', theme: 'glass' },
      latest: { x: 5, y: 59, w: 27, h: 11, title: 'ÚLTIMO SEGUIDOR', text: 'pixelrider', accent: '#70e1c1', theme: 'minimal' },
      socials: { x: 5, y: 91, w: 67, h: 6, title: 'ME ENCONTRE', items: 'Twitch · @seucanal\nInstagram · @seuperfil\nYouTube · @seucanal', accent: '#8d85ff', theme: 'minimal' },
      countdown: { x: 34, y: 34, w: 32, h: 20, title: 'COMEÇAMOS EM', text: 'Prepare-se para a transmissão', seconds: 600, accent: '#8d85ff', theme: 'neon' },
      clock: { x: 40, y: 8, w: 20, h: 12, title: 'HORA LOCAL', accent: '#8d85ff', theme: 'glass' },
      viewer: { x: 78, y: 4, w: 17, h: 7, title: 'AO VIVO', value: '128', accent: '#ff4e70', theme: 'minimal' },
      ticker: { x: 5, y: 91, w: 90, h: 6, title: 'AVISO DA LIVE', text: 'SIGA O CANAL  •  ATIVE AS NOTIFICAÇÕES  •  COMPARTILHE A LIVE  •  OBRIGADO POR ASSISTIR  •  ', accent: '#8d85ff', theme: 'solid' },
      music: { x: 5, y: 76, w: 26, h: 12, title: 'TOCANDO AGORA', text: 'Nome da música', value: 'Artista / álbum', accent: '#70e1c1', theme: 'glass' },
      poll: { x: 69, y: 52, w: 27, h: 35, title: 'ENQUETE DA LIVE', items: 'Aventura | 42\nRPG | 28\nFPS | 30', accent: '#8d85ff', theme: 'glass' },
      sponsor: { x: 5, y: 5, w: 27, h: 11, title: 'APOIO', text: 'SUA MARCA AQUI', value: 'Parceiro oficial da live', accent: '#f1c778', theme: 'glass' },
      'webcam-frame': { x: 4, y: 8, w: 32, h: 50, title: 'WEBCAM', accent: '#8d85ff', theme: 'neon' },
      'live-badge': { x: 82, y: 4, w: 13, h: 7, title: 'AO VIVO', text: 'TRANSMITINDO', accent: '#ff4e70', theme: 'minimal' },
      'tip-jar': { x: 68, y: 50, w: 26, h: 29, title: 'JARRA DE APOIO', text: 'ARRECADADO', value: '135', target: '250', accent: '#70d9c0', theme: 'glass' },
      'stream-boss': { x: 35, y: 8, w: 30, h: 15, title: 'CHEFE DA TRANSMISSÃO', text: 'A comunidade está enfrentando o chefe', value: '65', target: '100', accent: '#ff4e70', theme: 'neon' },
      leaderboard: { x: 69, y: 48, w: 27, h: 35, title: 'TOP APOIADORES', items: 'pixelrider | R$ 150\nlua_gamer | R$ 80\ncatbits | R$ 45\nnina | R$ 25', accent: '#f1c778', theme: 'glass' },
    }
    const preset = presets[kind]
    const count = activeScene.sources.filter((source) => source.type === 'widget' && source.widgetKind === kind).length + 1
    const labels: Record<WidgetKind, string> = {
      alert: 'Alertas de evento', chat: 'Caixa de chat', events: 'Atividade recente', goal: 'Barra de meta', latest: 'Último apoiador', socials: 'Redes sociais', countdown: 'Contagem regressiva', clock: 'Relógio', viewer: 'Status e espectadores', ticker: 'Faixa rolante', music: 'Tocando agora', poll: 'Enquete', sponsor: 'Patrocinador', 'webcam-frame': 'Moldura de webcam', 'live-badge': 'Selo AO VIVO', 'tip-jar': 'Jarra de apoio', 'stream-boss': 'Chefe da transmissão', leaderboard: 'Ranking de apoiadores',
    }
    const source: SceneSource = placeWithoutOverlap(activeScene.sources, {
      id: newId('widget'), type: 'widget', widgetKind: kind, name: `${labels[kind]} ${count}`,
      visible: true, x: preset.x, y: preset.y, w: preset.w, h: preset.h,
      radius: 7, opacity: 1, rotation: 0, shadow: true,
      widgetTitle: preset.title, widgetText: preset.text, widgetValue: preset.value,
      widgetTarget: preset.target, widgetItems: preset.items, widgetSeconds: preset.seconds ?? 600,
      widgetRunning: true, widgetAccent: preset.accent, widgetTheme: preset.theme,
      widgetShowHeader: true, widgetCompact: false,
    })
    updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, source] }))
    setSelectedSourceId(source.id)
    setSourceMenuOpen(false)
    setMessage(`${labels[kind]} adicionado. Os dados são exemplos editáveis.`)
  }

  async function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget as HTMLInputElement
    const files: File[] = Array.from(input.files ?? [])
    input.value = ''
    if (files.length === 0) return
    const targetSceneId = activeScene.id
    const supported = files.filter((file) => {
      const extension = file.name.toLowerCase().split('.').pop() ?? ''
      return file.type.startsWith('image/') || extension === 'svg'
    })
    const ignoredCount = files.length - supported.length
    const totalBytes = supported.reduce((total, file) => total + file.size, 0)
    if (supported.some((file) => file.size > MAX_IMAGE_BYTES)) {
      setMessage('Cada imagem deve ter até 1,5 MB para manter o projeto leve. Importe arquivos menores.')
      return
    }
    if (totalBytes > MAX_IMPORT_BATCH_BYTES) {
      setMessage('O total por importação é de 1,5 MB para reduzir erros de armazenamento. Importe o restante em outro lote.')
      return
    }
    if (supported.length === 0) {
      setMessage('Não encontrei imagens compatíveis nos arquivos selecionados.')
      return
    }
    try {
      const loaded = await Promise.all(supported.map(async (file) => {
        const src = await parseLocalImageData(file)
        const dimensions = await imageDimensions(src)
        return { file, src, dimensions }
      }))
      const currentProject = projectRef.current
      const targetScene = currentProject.scenes.find((scene) => scene.id === targetSceneId)
      if (!targetScene) {
        setMessage('A cena de destino não existe mais. Selecione a cena novamente e importe os arquivos.')
        return
      }
      let placedSources = [...targetScene.sources]
      const additions = loaded.map(({ file, src, dimensions }) => {
        const canvasRatio = (targetScene.width ?? 1920) / (targetScene.height ?? 1080)
        const imageRatio = dimensions.width / Math.max(1, dimensions.height)
        const w = imageRatio >= 1 ? 28 : clamp(28 * imageRatio, 12, 28)
        const h = clamp((w * canvasRatio) / Math.max(0.1, imageRatio), 12, 48)
        const candidate: SceneSource = {
          id: newId('image'), type: 'image', name: file.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'Design importado',
          visible: true, x: 36, y: 30, w, h, src, objectFit: 'contain', radius: 4, rotation: 0, opacity: 1,
        }
        const placed = placeWithoutOverlap(placedSources, candidate)
        placedSources = [...placedSources, placed]
        return placed
      })
      const nextProject: Project = {
        ...currentProject,
        scenes: currentProject.scenes.map((scene) => scene.id === targetSceneId ? { ...scene, sources: [...scene.sources, ...additions] } : scene),
      }
      if (JSON.stringify(nextProject).length > MAX_PROJECT_JSON_CHARS) {
        setMessage('Esses assets ultrapassariam o limite seguro de armazenamento do navegador. Remova imagens antigas ou importe arquivos menores.')
        return
      }
      setProject(nextProject)
      if (currentProject.activeSceneId === targetSceneId && additions.length) setSelectedSourceId(additions[additions.length - 1].id)
      const ignoredNote = ignoredCount ? ` ${ignoredCount} arquivo(s) sem suporte foram ignorados.` : ''
      setMessage(`${loaded.length} ${loaded.length === 1 ? 'elemento importado' : 'elementos importados'}. O posicionamento automático evitou sobreposições quando havia espaço.${ignoredNote}`)
    } catch {
      setMessage('Não foi possível ler um dos arquivos de imagem.')
    }
  }

  async function onBackgroundDesignSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    const extension = file.name.toLowerCase().split('.').pop() ?? ''
    if (!(file.type.startsWith('image/') || extension === 'svg')) {
      setMessage('Escolha uma imagem PNG, JPG, WebP, GIF ou SVG para importar como design completo.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage('O arquivo deve ter até 1,5 MB para manter o projeto leve.')
      return
    }
    const targetSceneId = activeScene.id
    try {
      const src = await parseLocalImageData(file)
      const source: SceneSource = {
        id: newId('design'), type: 'image', name: `${file.name.replace(/\.[^.]+$/, '').slice(0, 52) || 'Design'} · fundo`,
        visible: true, x: 0, y: 0, w: 100, h: 100, src, objectFit: 'contain', radius: 0, rotation: 0, opacity: 1, isBackgroundAsset: true,
      }
      const currentProject = projectRef.current
      const targetScene = currentProject.scenes.find((scene) => scene.id === targetSceneId)
      if (!targetScene) {
        setMessage('A cena de destino não existe mais. Selecione a cena novamente e importe o design.')
        return
      }
      const nextProject: Project = {
        ...currentProject,
        scenes: currentProject.scenes.map((scene) => scene.id === targetSceneId ? { ...scene, sources: [source, ...scene.sources] } : scene),
      }
      if (JSON.stringify(nextProject).length > MAX_PROJECT_JSON_CHARS) {
        setMessage('Esse design ultrapassaria o limite seguro de armazenamento. Remova imagens grandes ou importe um arquivo menor.')
        return
      }
      setProject(nextProject)
      if (currentProject.activeSceneId === targetSceneId) setSelectedSourceId(source.id)
      setMessage('Design importado como camada de fundo. O arquivo original fica como uma imagem editável; seus elementos internos só serão separados se forem importados como projeto JSON com camadas.')
    } catch {
      setMessage('Não foi possível importar esse design.')
    }
  }

  function toggleVisibility(sourceId: string) {
    updateActiveScene((scene) => ({
      ...scene,
      sources: scene.sources.map((source) => source.id === sourceId ? { ...source, visible: !source.visible } : source),
    }))
  }

  function deleteSource(sourceId: string) {
    updateActiveScene((scene) => ({ ...scene, sources: scene.sources.filter((source) => source.id !== sourceId) }))
    if (selectedSourceId === sourceId) setSelectedSourceId(null)
  }

  function duplicateSource(source: SceneSource) {
    const copy: SceneSource = placeWithoutOverlap(activeScene.sources, { ...source, id: newId('source'), name: `${source.name} (cópia)`.slice(0, 70), x: clamp(source.x + 3, 0, 100 - source.w), y: clamp(source.y + 3, 0, 100 - source.h) })
    updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, copy] }))
    setSelectedSourceId(copy.id)
    setMessage('Fonte duplicada.')
  }

  function updateScene(changes: Partial<Scene>) {
    setProject((current) => ({ ...current, scenes: current.scenes.map((scene) => scene.id === current.activeSceneId ? { ...scene, ...changes } : scene) }))
    setMessage('')
  }

  useEffect(() => {
    function handleShortcuts(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const editingText = Boolean(target && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable))
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        if (persistProject(project)) setMessage('Projeto salvo neste navegador.')
        else setMessage('Não foi possível salvar: o projeto excede o limite seguro de armazenamento. Exporte o JSON ou remova imagens grandes.')
        return
      }
      if (editingText) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undo()
        return
      }
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
        event.preventDefault()
        redo()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && selectedSource) {
        event.preventDefault()
        duplicateSource(selectedSource)
        return
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedSource) {
        event.preventDefault()
        deleteSource(selectedSource.id)
        return
      }
      if (!selectedSource || selectedSource.locked) return
      const step = event.shiftKey ? 5 : 1
      const positions: Record<string, { x: number; y: number }> = {
        ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step },
      }
      const movement = positions[event.key]
      if (!movement) return
      event.preventDefault()
      updateSelected({
        x: clamp(selectedSource.x + movement.x, 0, 100 - selectedSource.w),
        y: clamp(selectedSource.y + movement.y, 0, 100 - selectedSource.h),
      })
    }
    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [project, selectedSource, activeScene, selectedSourceId])

  function moveLayer(sourceId: string, direction: -1 | 1) {
    updateActiveScene((scene) => {
      const index = scene.sources.findIndex((source) => source.id === sourceId)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= scene.sources.length) return scene
      const sources = [...scene.sources]
      ;[sources[index], sources[nextIndex]] = [sources[nextIndex], sources[index]]
      return { ...scene, sources }
    })
  }

  async function enableCamera() {
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Seu navegador não disponibiliza câmera neste contexto. Use localhost ou HTTPS.')
      return
    }
    try {
      cameraStream?.getTracks().forEach((track) => track.stop())
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setCameraStream(stream)
      setCameraError('')
      setMessage('Webcam ativada nesta aba.')
    } catch {
      setCameraError('A câmera não foi autorizada ou está em uso por outro aplicativo.')
    }
  }

  function saveProject() {
    if (persistProject(project)) setMessage('Projeto salvo neste navegador.')
    else setMessage('Não foi possível salvar: o projeto excede o limite seguro de armazenamento. Exporte o JSON ou remova imagens grandes.')
  }

  function undo() {
    const previous = undoStackRef.current.pop()
    if (!previous) return
    redoStackRef.current.push(project)
    historySnapshotRef.current = previous
    setProject(previous)
    const nextScene = previous.scenes.find((scene) => scene.id === previous.activeSceneId) ?? previous.scenes[0]
    setSelectedSourceId(nextScene?.sources[0]?.id ?? null)
    setCanUndo(undoStackRef.current.length > 0)
    setCanRedo(true)
    setMessage('Última alteração desfeita.')
  }

  function redo() {
    const next = redoStackRef.current.pop()
    if (!next) return
    undoStackRef.current.push(project)
    historySnapshotRef.current = next
    setProject(next)
    const nextScene = next.scenes.find((scene) => scene.id === next.activeSceneId) ?? next.scenes[0]
    setSelectedSourceId(nextScene?.sources[0]?.id ?? null)
    setCanUndo(true)
    setCanRedo(redoStackRef.current.length > 0)
    setMessage('Alteração reaplicada.')
  }

  function importProject(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_PROJECT_JSON_CHARS) {
      setMessage('O arquivo de projeto é muito grande para importar com segurança neste navegador (limite aproximado de 2,1 MB).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result))
        if (!isValidProject(parsed)) throw new Error('invalid')
        const repaired = normalizeProject(parsed)
        if (JSON.stringify(repaired).length > MAX_PROJECT_JSON_CHARS) {
          setMessage('Esse arquivo excede o limite seguro de armazenamento do navegador. Reduza as imagens incorporadas antes de importar.')
          return
        }
        setProject(repaired)
        const active = repaired.scenes.find((scene) => scene.id === repaired.activeSceneId)
        setSelectedSourceId(active?.sources[0]?.id ?? null)
        setInteraction(null)
        undoStackRef.current = []
        redoStackRef.current = []
        historySnapshotRef.current = repaired
        setCanUndo(false)
        setCanRedo(false)
        setMessage('Projeto importado com sucesso. O histórico anterior foi limpo para evitar misturar projetos.')
      } catch {
        setMessage('O arquivo não parece ser um projeto Webcam_overlay válido.')
      }
    }
    reader.onerror = () => setMessage('Não foi possível ler o arquivo selecionado.')
    reader.readAsText(file)
  }

  function resetEverything() {
    const confirmed = window.confirm('Redefinir tudo? Isso substituirá suas cenas, fontes, imagens importadas e configurações pelo projeto inicial. Essa ação não pode ser desfeita. Exporte o JSON antes se quiser guardar uma cópia.')
    if (!confirmed) return
    const next = makeDefaultProject()
    cameraStream?.getTracks().forEach((track) => track.stop())
    setCameraStream(null)
    setCameraError('')
    setInteraction(null)
    setProject(next)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (backgroundDesignInputRef.current) backgroundDesignInputRef.current.value = ''
    if (importInputRef.current) importInputRef.current.value = ''
    const initialScene = next.scenes.find((scene) => scene.id === next.activeSceneId) ?? next.scenes[0]
    setSelectedSourceId(initialScene?.sources.find((source) => source.id === 'source-title')?.id ?? initialScene?.sources[0]?.id ?? null)
    undoStackRef.current = []
    redoStackRef.current = []
    historySnapshotRef.current = next
    setCanUndo(false)
    setCanRedo(false)
    setAlertTestTokens({})
    setWidgetSearch('')
    setSourceMenuOpen(false)
    setShowPackMenu(false)
    setShowExportMenu(false)
    setOpenSceneMenuId(null)
    setMessage('Tudo foi redefinido para o projeto inicial. Você pode começar novamente.')
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // O salvamento automático tentará persistir o projeto inicial logo depois.
    }
  }

  function beginInteraction(event: ReactPointerEvent<HTMLElement>, source: SceneSource, mode: Interaction['mode']) {
    if (source.locked) return
    event.preventDefault()
    event.stopPropagation()
    setSelectedSourceId(source.id)
    setInteraction({
      sourceId: source.id, mode,
      pointerX: event.clientX, pointerY: event.clientY,
      x: source.x, y: source.y, w: source.w, h: source.h,
    })
  }

  return (
    <div className="app-shell">
      <aside className="app-rail">
        <div className="brand-mark" title="Webcam_overlay">W<span>.</span></div>
        <div className="rail-divider" />
        <div className="rail-active" title="Estúdio">▧</div>
        <div className="rail-bottom"><span className="rail-version">BETA</span></div>
      </aside>

      <aside className="scenes-panel">
        <div className="panel-brand">
          <div><p className="eyebrow">WEBCAM_OVERLAY</p><h1>Estúdio</h1></div>
          <span className="beta-dot" />
        </div>
        <div className="scene-heading">
          <span className="eyebrow">CENAS</span>
          <div className="scene-heading-actions">
            <button className="kit-button" type="button" onClick={() => setShowPackMenu((open) => !open)}>Kits</button>
            <button className="icon-button" type="button" onClick={addScene} title="Criar cena" aria-label="Criar cena">+</button>
          </div>
        </div>
        {showPackMenu && <div className="starter-pack-menu">
          <p className="eyebrow">ADICIONAR CONJUNTO DE CENAS</p>
          <button type="button" onClick={() => applyStarterPack('gaming')}><strong>Gaming neon</strong><small>Gameplay, começando e intervalo</small></button>
          <button type="button" onClick={() => applyStarterPack('chatting')}><strong>Just chatting</strong><small>Webcam, chat, música e redes</small></button>
          <button type="button" onClick={() => applyStarterPack('minimal')}><strong>Minimalista</strong><small>Overlay discreto e limpo</small></button>
          <button type="button" onClick={() => applyStarterPack('vertical')}><strong>Vertical / mobile</strong><small>Cenas 9:16 para conteúdo vertical</small></button>
        </div>}
        <div className="scene-list">
          {project.scenes.map((scene, index) => (
            <div className={`scene-card-wrap ${scene.id === activeScene.id ? 'active' : ''}`} key={scene.id}>
              <button className={`scene-card ${scene.id === activeScene.id ? 'active' : ''}`} type="button" onClick={() => selectScene(scene)}>
                <div className="scene-thumbnail"><span className="thumbnail-lines"><i /><i /></span><span className="scene-number">{String(index + 1).padStart(2, '0')}</span></div>
                <span className="scene-info"><strong>{scene.name}</strong><small>{scene.sources.length} {scene.sources.length === 1 ? 'fonte' : 'fontes'}</small></span>
              </button>
              <div className="scene-actions">
                <button type="button" aria-label={`Opções de ${scene.name}`} title="Opções da cena" onClick={() => setOpenSceneMenuId((current) => current === scene.id ? null : scene.id)}>···</button>
                {openSceneMenuId === scene.id && <div className="scene-action-menu">
                  <button type="button" onClick={() => { renameScene(scene); setOpenSceneMenuId(null) }}>Renomear</button>
                  <button type="button" onClick={() => duplicateScene(scene)}>Duplicar</button>
                  <button type="button" onClick={() => { deleteScene(scene); setOpenSceneMenuId(null) }}>Excluir</button>
                </div>}
              </div>
            </div>
          ))}
        </div>
        <div className="scenes-footer"><span className="status-dot" /><span>Projeto local</span></div>
      </aside>

      <main className="studio-main">
        <header className="topbar">
          <div className="topbar-title"><p className="eyebrow">ÁREA DE TRABALHO</p><h2>{activeScene.name}</h2></div>
          <div className="topbar-actions">
            <span className="resolution-badge">{activeScene.width ?? 1920} × {activeScene.height ?? 1080}</span>
            <button className="history-button" type="button" disabled={!canUndo} onClick={undo} title="Desfazer (Ctrl+Z)" aria-label="Desfazer">↶</button>
            <button className="history-button" type="button" disabled={!canRedo} onClick={redo} title="Refazer (Ctrl+Y)" aria-label="Refazer">↷</button>
            <div className="export-wrapper">
              <button className="secondary-button" type="button" onClick={() => setShowExportMenu((open) => !open)}>Projeto <span>⌄</span></button>
              {showExportMenu && <div className="export-menu">
                <button type="button" onClick={() => { downloadProject(project); setShowExportMenu(false); setMessage('Arquivo JSON exportado.') }}>Exportar JSON</button>
                <button type="button" onClick={() => { importInputRef.current?.click(); setShowExportMenu(false) }}>Importar projeto / design editável (JSON)</button>
                <button type="button" onClick={() => { imageInputRef.current?.click(); setShowExportMenu(false) }}>Importar elementos (PNG, SVG, GIF…)</button>
                <button type="button" onClick={() => { backgroundDesignInputRef.current?.click(); setShowExportMenu(false) }}>Importar design completo como fundo</button>
                <button className="menu-danger" type="button" onClick={() => { setShowExportMenu(false); resetEverything() }}>Redefinir tudo…</button>
                <a href={`${window.location.pathname}?mode=overlay`} target="_blank" rel="noreferrer" onClick={() => setShowExportMenu(false)}>Abrir modo overlay ↗</a>
              </div>}
            </div>
            <button className="save-button" type="button" onClick={saveProject}><span>✓</span> Salvar</button>
          </div>
        </header>

        <section className="preview-section">
          <div className="preview-heading">
            <div><span className="eyebrow">TELA DE COMPOSIÇÃO</span><h3>Pré-visualização</h3></div>
            <span className="local-badge"><i /> EDITOR</span>
          </div>
          <div className="preview-frame">
            <div className="preview-canvas" ref={stageRef} style={{ ...sceneBackgroundStyle(activeScene, true), aspectRatio: `${activeScene.width ?? 1920} / ${activeScene.height ?? 1080}` }} onPointerDown={() => setSelectedSourceId(null)}>
              {activeScene.sources.filter((source) => source.visible).map((source, index) => (
                <div
                  className={`canvas-object object-${source.type} ${source.type === 'shape' ? `shape-${source.shapeKind ?? 'rectangle'}` : ''} ${source.locked ? 'locked' : ''} ${selectedSourceId === source.id ? 'is-selected' : ''}`}
                  key={source.id}
                  style={sourceStyle(source, index)}
                  onPointerDown={(event) => beginInteraction(event, source, 'move')}
                  onClick={(event) => { event.stopPropagation(); setSelectedSourceId(source.id) }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Selecionar e mover ${source.name}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedSourceId(source.id) }
                  }}
                >
                  {source.type === 'text' && <span className="object-text">{source.text || source.name}</span>}
                  {source.type === 'shape' && <span className={`shape-inner shape-inner-${source.shapeKind ?? 'rectangle'}`} />}
                  {source.type === 'image' && source.src && <img src={source.src} alt={source.name} draggable={false} style={{ objectFit: source.objectFit ?? 'contain' }} />}
                  {source.type === 'browser' && <iframe className="browser-frame" title={source.name} src={getBrowserUrl(source.url)} sandbox="allow-scripts allow-forms allow-popups" referrerPolicy="no-referrer" loading="lazy" tabIndex={-1} />}
                  {source.type === 'camera' && (cameraStream
                    ? <video className="camera-video" autoPlay muted playsInline style={{ transform: source.cameraMirror === false ? 'none' : 'scaleX(-1)' }} ref={(element) => { if (element && element.srcObject !== cameraStream) element.srcObject = cameraStream }} />
                    : <div className="camera-placeholder"><span className="camera-symbol">◉</span><strong>{source.name}</strong><small>Clique em “Ativar webcam” nas propriedades</small></div>)}
                  {source.type === 'widget' && <WidgetContent source={source} testToken={alertTestTokens[source.id] ?? 0} />}
                  {selectedSourceId === source.id && <><span className="selection-label">{source.name}</span><button className="resize-handle" type="button" aria-label={`Redimensionar ${source.name}`} onPointerDown={(event) => beginInteraction(event, source, 'resize')} /></>}
                </div>
              ))}
              {activeScene.sources.every((source) => !source.visible) && <div className="canvas-empty"><span>◫</span><strong>Nenhuma fonte visível</strong><small>Ative uma camada ou adicione um elemento.</small></div>}
              {activeScene.sources.length === 0 && <div className="canvas-empty"><span>＋</span><strong>Sua cena está vazia</strong><small>Adicione uma fonte pelo painel à direita.</small></div>}
            </div>
          </div>
          <div className="preview-caption"><span><span className="status-dot" /> Arraste para mover · canto inferior para redimensionar</span><span>Proporção {activeScene.width ?? 1920}:{activeScene.height ?? 1080}</span></div>
        </section>
        <footer className="studio-footer"><span className="footer-tip"><span className="tip-icon">i</span> As alterações são salvas automaticamente neste navegador.</span><span className="footer-version">WEBCAM_OVERLAY · 2.2.1</span></footer>
      </main>

      <aside className="inspector-panel">
        <div className="inspector-heading"><div><p className="eyebrow">ORGANIZAÇÃO</p><h2>Fontes</h2></div><button className="icon-button add-button" type="button" onClick={() => setSourceMenuOpen((open) => !open)} title="Adicionar fonte" aria-label="Adicionar fonte">+</button></div>
        {sourceMenuOpen && <div className="source-menu"><p className="eyebrow">ELEMENTOS BÁSICOS</p>
          {(['text', 'shape', 'camera', 'image', 'browser'] as Exclude<SourceType, 'widget'>[]).map((type) => <button key={type} type="button" onClick={() => addSource(type)}><span className={`source-icon icon-${type}`}>{sourceGlyph(type)}</span><span><strong>{sourceLabel(type)}</strong><small>{{ text: 'Texto com tipografia e efeitos', shape: 'Retângulo, círculo, linha ou pílula', camera: 'Webcam do dispositivo', image: 'Arquivo PNG, JPG ou WebP', browser: 'Página ou widget web incorporado' }[type]}</small></span><span className="menu-arrow">›</span></button>)}
          <div className="widget-library-title"><p className="eyebrow">WIDGETS PARA STREAM</p><span>{WIDGET_OPTIONS.length}</span></div>
          <input className="text-input widget-search" value={widgetSearch} onChange={(event) => setWidgetSearch(event.target.value)} placeholder="Buscar widget..." aria-label="Buscar widget" />
          {WIDGET_OPTIONS.filter((option) => `${option.label} ${option.description}`.toLocaleLowerCase('pt-BR').includes(widgetSearch.toLocaleLowerCase('pt-BR'))).map((option) => <button key={option.kind} type="button" onClick={() => addWidget(option.kind)}><span className="source-icon icon-widget">{option.glyph}</span><span><strong>{option.label}</strong><small>{option.description}</small></span><span className="menu-arrow">›</span></button>)}
          {WIDGET_OPTIONS.filter((option) => `${option.label} ${option.description}`.toLocaleLowerCase('pt-BR').includes(widgetSearch.toLocaleLowerCase('pt-BR'))).length === 0 && <p className="widget-no-results">Nenhum widget encontrado.</p>}
        </div>}
        <div className="source-list-heading"><span className="eyebrow">CAMADAS DA CENA</span><span className="count-badge">{activeScene.sources.length}</span></div>
        <div className="source-list">
          {activeScene.sources.length === 0 && <p className="empty-list">Ainda não existem fontes nesta cena. Use o botão + para adicionar uma.</p>}
          {[...activeScene.sources].map((source, index) => ({ source, index })).reverse().map(({ source, index }) => (
            <div className={`source-row ${selectedSourceId === source.id ? 'selected' : ''}`} key={source.id}>
              <button className="source-select" type="button" onClick={() => setSelectedSourceId(source.id)}><span className={`source-icon icon-${source.type}`}>{sourceGlyph(source.type)}</span><span className="source-name">{source.name}</span></button>
              <button className="tiny-action layer-action" type="button" title="Subir camada" aria-label="Subir camada" disabled={index === activeScene.sources.length - 1} onClick={() => moveLayer(source.id, 1)}>↑</button>
              <button className="tiny-action layer-action" type="button" title="Descer camada" aria-label="Descer camada" disabled={index === 0} onClick={() => moveLayer(source.id, -1)}>↓</button>
              <button className={`tiny-action ${source.visible ? 'visible' : ''}`} type="button" onClick={() => toggleVisibility(source.id)} title={source.visible ? 'Ocultar fonte' : 'Mostrar fonte'} aria-label={source.visible ? 'Ocultar fonte' : 'Mostrar fonte'}>{source.visible ? '◉' : '◌'}</button>
              <button className="tiny-action remove-action" type="button" onClick={() => deleteSource(source.id)} title="Remover fonte" aria-label={`Remover ${source.name}`}>×</button>
            </div>
          ))}
        </div>

        <div className="properties-panel">
          <div className="properties-heading"><div><p className="eyebrow">PERSONALIZAÇÃO</p><h3>Propriedades</h3></div>{selectedSource && <span className="property-type">{sourceLabel(selectedSource.type)}</span>}</div>
          {!selectedSource && <p className="empty-properties">Selecione uma fonte na prévia ou na lista para editar suas propriedades.</p>}
          {selectedSource && <div className="property-fields">
            <label className="field-label" htmlFor="source-name">Nome</label>
            <input id="source-name" className="text-input" value={selectedSource.name} maxLength={70} onChange={(event) => updateSelected({ name: event.target.value })} />
            {selectedSource.type === 'text' && <>
              <label className="field-label" htmlFor="source-text">Conteúdo do texto</label>
              <textarea id="source-text" className="text-input textarea-input" rows={3} maxLength={400} value={selectedSource.text ?? ''} onChange={(event) => updateSelected({ text: event.target.value })} placeholder="Digite sua mensagem..." />
              <label className="field-label" htmlFor="source-font-size">Tamanho da fonte</label>
              <div className="range-row"><input id="source-font-size" type="range" min="12" max="100" value={selectedSource.fontSize ?? 30} onChange={(event) => updateSelected({ fontSize: Number(event.target.value) })} /><span>{selectedSource.fontSize ?? 30}px</span></div>
              <label className="field-label" htmlFor="source-color">Cor do texto</label>
              <ColorField id="source-color" value={selectedSource.color ?? '#ffffff'} onChange={(color) => updateSelected({ color })} />
              <label className="field-label" htmlFor="source-font-family">Família tipográfica</label>
              <input id="source-font-family" className="text-input" list="font-family-presets" value={selectedSource.fontFamily ?? 'Inter, system-ui, sans-serif'} onChange={(event) => updateSelected({ fontFamily: event.target.value })} placeholder="Ex.: Arial, sans-serif" />
              <datalist id="font-family-presets"><option value="Inter, system-ui, sans-serif" /><option value="Arial, Helvetica, sans-serif" /><option value="Georgia, serif" /><option value="'Trebuchet MS', sans-serif" /><option value="'Courier New', monospace" /><option value="Impact, sans-serif" /><option value="system-ui, sans-serif" /></datalist>
              <p className="field-hint">Você também pode digitar uma família tipográfica instalada no dispositivo.</p>
              <label className="field-label" htmlFor="source-font-weight">Peso da fonte</label>
              <select id="source-font-weight" className="text-input" value={selectedSource.fontWeight ?? 750} onChange={(event) => updateSelected({ fontWeight: Number(event.target.value) })}><option value="300">Leve</option><option value="400">Normal</option><option value="500">Médio</option><option value="600">Seminegrito</option><option value="700">Negrito</option><option value="750">Seminegrito alto (padrão)</option><option value="800">Extra negrito</option><option value="900">Preto</option></select>
              <label className="field-label" htmlFor="source-align">Alinhamento</label>
              <select id="source-align" className="text-input" value={selectedSource.textAlign ?? 'left'} onChange={(event) => updateSelected({ textAlign: event.target.value as 'left' | 'center' | 'right' })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select>
              <label className="field-label" htmlFor="source-line-height">Altura de linha</label>
              <div className="range-row"><input id="source-line-height" type="range" min="0.8" max="2" step="0.05" value={selectedSource.lineHeight ?? 1.12} onChange={(event) => updateSelected({ lineHeight: Number(event.target.value) })} /><span>{(selectedSource.lineHeight ?? 1.12).toFixed(2)}</span></div>
              <label className="field-label" htmlFor="source-spacing">Espaçamento entre letras</label>
              <div className="range-row"><input id="source-spacing" type="range" min="-4" max="12" step="0.5" value={selectedSource.letterSpacing ?? -0.5} onChange={(event) => updateSelected({ letterSpacing: Number(event.target.value) })} /><span>{selectedSource.letterSpacing ?? -0.5}px</span></div>
              <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.italic)} onChange={(event) => updateSelected({ italic: event.target.checked })} /><span>Itálico</span></label>
              <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.textBackground)} onChange={(event) => updateSelected({ textBackground: event.target.checked })} /><span>Fundo atrás do texto</span></label>
              {selectedSource.textBackground && <><label className="field-label" htmlFor="text-background-color">Cor do fundo do texto</label><ColorField id="text-background-color" value={selectedSource.textBackgroundColor ?? '#11121b'} onChange={(color) => updateSelected({ textBackgroundColor: color })} /></>}
            </>}
            {selectedSource.type === 'shape' && <>
              <label className="field-label" htmlFor="shape-kind">Formato</label>
              <select id="shape-kind" className="text-input" value={selectedSource.shapeKind ?? 'rectangle'} onChange={(event) => updateSelected({ shapeKind: event.target.value as SceneSource['shapeKind'] })}><option value="rectangle">Retângulo</option><option value="circle">Círculo / elipse</option><option value="pill">Pílula</option><option value="line">Linha</option></select>
              <label className="field-label" htmlFor="shape-color">Cor da forma</label>
              <ColorField id="shape-color" value={selectedSource.color ?? '#7772f2'} onChange={(color) => updateSelected({ color })} />
              <label className="field-label" htmlFor="shape-radius">Arredondamento</label>
              <div className="range-row"><input id="shape-radius" type="range" min="0" max="100" value={selectedSource.radius ?? 4} onChange={(event) => updateSelected({ radius: Number(event.target.value) })} /><span>{selectedSource.radius ?? 4}px</span></div>
            </>}
            {selectedSource.type === 'image' && <>
              <label className="field-label" htmlFor="image-fit">Ajuste da imagem</label>
              <select id="image-fit" className="text-input" value={selectedSource.objectFit ?? 'contain'} onChange={(event) => updateSelected({ objectFit: event.target.value as 'contain' | 'cover' })}><option value="contain">Mostrar imagem inteira</option><option value="cover">Preencher área</option></select>
              <p className="field-hint">Para trocar a imagem, remova esta fonte e adicione outra.</p>
            </>}
            {selectedSource.type === 'browser' && <>
              <label className="field-label" htmlFor="browser-url">Endereço da página / widget</label>
              <input id="browser-url" className="text-input" type="url" value={selectedSource.url ?? ''} onChange={(event) => updateSelected({ url: event.target.value })} placeholder="https://..." />
              <p className="field-hint">Alguns sites bloqueiam incorporação externa. Use apenas endereços HTTP ou HTTPS.</p>
            </>}
            {selectedSource.type === 'camera' && <>
              <div className="feature-note"><span className="note-icon">i</span><p>A webcam aparece após conceder permissão ao navegador. O áudio não é capturado nesta versão.</p></div>
              <button className="wide-action" type="button" onClick={enableCamera}>{cameraStream ? 'Reativar webcam' : 'Ativar webcam'}</button>
              {cameraStream && <button className="wide-action quiet-action" type="button" onClick={() => { cameraStream.getTracks().forEach((track) => track.stop()); setCameraStream(null); setMessage('Webcam desativada.') }}>Desativar webcam</button>}
              {cameraError && <p className="error-note">{cameraError}</p>}
            </>}
            {selectedSource.type === 'widget' && <>
              <div className="widget-inspector-note"><span className="note-icon">i</span><p>Widget em modo de demonstração. Os dados são editáveis, mas ainda não vêm de uma conta conectada.</p></div>
              <label className="field-label" htmlFor="widget-kind">Tipo de widget</label>
              <select id="widget-kind" className="text-input" value={selectedSource.widgetKind ?? 'goal'} onChange={(event) => updateSelected({ widgetKind: event.target.value as WidgetKind })}>{WIDGET_OPTIONS.map((option) => <option key={option.kind} value={option.kind}>{option.label}</option>)}</select>
              <label className="field-label" htmlFor="widget-title">Título / rótulo</label>
              <input id="widget-title" className="text-input" value={selectedSource.widgetTitle ?? ''} maxLength={90} onChange={(event) => updateSelected({ widgetTitle: event.target.value })} placeholder="Título exibido no widget" />
              {['alert', 'latest', 'countdown', 'music', 'sponsor', 'ticker', 'goal', 'live-badge'].includes(selectedSource.widgetKind ?? 'goal') && <>
                <label className="field-label" htmlFor="widget-text">Mensagem / descrição</label>
                <textarea id="widget-text" className="text-input textarea-input" rows={2} maxLength={300} value={selectedSource.widgetText ?? ''} onChange={(event) => updateSelected({ widgetText: event.target.value })} placeholder="Texto complementar" />
              </>}
              {['chat', 'events', 'socials', 'poll', 'leaderboard'].includes(selectedSource.widgetKind ?? '') && <>
                <label className="field-label" htmlFor="widget-items">Conteúdo (uma linha por item)</label>
                <textarea id="widget-items" className="text-input textarea-input widget-items-input" rows={5} maxLength={1200} value={selectedSource.widgetItems ?? ''} onChange={(event) => updateSelected({ widgetItems: event.target.value })} placeholder={selectedSource.widgetKind === 'chat' ? 'Nome: mensagem' : selectedSource.widgetKind === 'poll' ? 'Opção | votos' : selectedSource.widgetKind === 'leaderboard' ? 'Nome | valor (uma linha por apoiador)' : 'Tipo · nome · valor'} />
                <p className="field-hint">Chat: “Nome: mensagem”. Enquete: “Opção | votos”. Eventos e redes: uma entrada por linha.</p>
              </>}
              {['goal', 'viewer', 'alert', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? '') && <>
                <label className="field-label" htmlFor="widget-value">{selectedSource.widgetKind === 'goal' ? 'Valor atual' : selectedSource.widgetKind === 'tip-jar' ? 'Total arrecadado (R$)' : selectedSource.widgetKind === 'stream-boss' ? 'Vida atual do chefe (%)' : selectedSource.widgetKind === 'viewer' ? 'Espectadores (valor ilustrativo)' : 'Nome ilustrativo'}</label>
                <input id="widget-value" className="text-input" value={selectedSource.widgetValue ?? ''} onChange={(event) => updateSelected({ widgetValue: event.target.value })} placeholder={['goal', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? '') ? '68' : 'Exemplo'} />
              </>}
              {['goal', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? '') && <>
                <label className="field-label" htmlFor="widget-target">{selectedSource.widgetKind === 'stream-boss' ? 'Vida total do chefe' : selectedSource.widgetKind === 'tip-jar' ? 'Meta de apoio (R$)' : 'Valor da meta'}</label>
                <input id="widget-target" className="text-input" type="number" min="1" value={selectedSource.widgetTarget ?? '100'} onChange={(event) => updateSelected({ widgetTarget: event.target.value })} />
              </>}
              {selectedSource.widgetKind === 'countdown' && <>
                <label className="field-label" htmlFor="widget-seconds">Duração inicial (segundos)</label>
                <input id="widget-seconds" className="text-input" type="number" min="0" max="604800" value={selectedSource.widgetSeconds ?? 600} onChange={(event) => updateSelected({ widgetSeconds: clamp(Number(event.target.value) || 0, 0, 604800) })} />
                <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetRunning !== false} onChange={(event) => updateSelected({ widgetRunning: event.target.checked })} /><span>Executar contagem</span></label>
              </>}
              {selectedSource.widgetKind === 'alert' && <button className="wide-action test-alert-button" type="button" onClick={() => setAlertTestTokens((current) => ({ ...current, [selectedSource.id]: (current[selectedSource.id] ?? 0) + 1 }))}>✦ Testar animação do alerta</button>}
              <label className="field-label" htmlFor="widget-theme">Estilo visual</label>
              <select id="widget-theme" className="text-input" value={selectedSource.widgetTheme ?? 'glass'} onChange={(event) => updateSelected({ widgetTheme: event.target.value as WidgetTheme })}><option value="glass">Vidro / translúcido</option><option value="neon">Neon / gamer</option><option value="minimal">Minimalista</option><option value="solid">Fundo sólido</option></select>
              <label className="field-label" htmlFor="widget-accent">Cor de destaque</label>
              <ColorField id="widget-accent" value={selectedSource.widgetAccent ?? '#8d85ff'} onChange={(widgetAccent) => updateSelected({ widgetAccent })} />
            </>}
            <div className="field-divider" />
            <p className="eyebrow geometry-label">APARÊNCIA</p>
            <label className="field-label" htmlFor="source-opacity">Opacidade</label>
            <div className="range-row"><input id="source-opacity" type="range" min="0" max="1" step="0.05" value={selectedSource.opacity ?? 1} onChange={(event) => updateSelected({ opacity: Number(event.target.value) })} /><span>{Math.round((selectedSource.opacity ?? 1) * 100)}%</span></div>
            <label className="field-label" htmlFor="source-rotation">Rotação</label>
            <div className="range-row"><input id="source-rotation" type="range" min="-180" max="180" step="1" value={selectedSource.rotation ?? 0} onChange={(event) => updateSelected({ rotation: Number(event.target.value) })} /><span>{selectedSource.rotation ?? 0}°</span></div>
            <label className="field-label" htmlFor="source-border-width">Espessura da borda</label>
            <div className="range-row"><input id="source-border-width" type="range" min="0" max="20" step="1" value={selectedSource.borderWidth ?? 0} onChange={(event) => updateSelected({ borderWidth: Number(event.target.value) })} /><span>{selectedSource.borderWidth ?? 0}px</span></div>
            <label className="field-label" htmlFor="source-border-color">Cor da borda</label>
            <ColorField id="source-border-color" value={selectedSource.borderColor ?? '#ffffff'} onChange={(color) => updateSelected({ borderColor: color })} />
            {selectedSource.type !== 'shape' && <><label className="field-label" htmlFor="source-radius">Arredondamento</label><div className="range-row"><input id="source-radius" type="range" min="0" max="100" step="1" value={selectedSource.radius ?? 4} onChange={(event) => updateSelected({ radius: Number(event.target.value) })} /><span>{selectedSource.radius ?? 4}px</span></div></>}
            <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.shadow)} onChange={(event) => updateSelected({ shadow: event.target.checked })} /><span>Sombra projetada</span></label>
            {selectedSource.type === 'camera' && <label className="lock-toggle"><input type="checkbox" checked={selectedSource.cameraMirror !== false} onChange={(event) => updateSelected({ cameraMirror: event.target.checked })} /><span>Espelhar webcam</span></label>}
            <div className="field-divider" />
            <p className="eyebrow geometry-label">POSIÇÃO E TAMANHO · % DA TELA</p>
            <div className="geometry-grid">
              <NumberField label="X" value={selectedSource.x} onChange={(x) => updateSelected({ x: clamp(x, 0, 100 - selectedSource.w) })} />
              <NumberField label="Y" value={selectedSource.y} onChange={(y) => updateSelected({ y: clamp(y, 0, 100 - selectedSource.h) })} />
              <NumberField label="Largura" value={selectedSource.w} onChange={(w) => updateSelected({ w: clamp(w, 4, 100 - selectedSource.x) })} />
              <NumberField label="Altura" value={selectedSource.h} onChange={(h) => updateSelected({ h: clamp(h, 4, 100 - selectedSource.y) })} />
            </div>
            <label className="field-label">Alinhamento rápido</label>
            <div className="align-grid">
              <button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('left')} title="Alinhar à esquerda">◧ Esquerda</button>
              <button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('center-x')} title="Centralizar horizontalmente">↔ Centro</button>
              <button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('right')} title="Alinhar à direita">Direita ◨</button>
              <button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('top')} title="Alinhar ao topo">↑ Topo</button>
              <button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('center-y')} title="Centralizar verticalmente">↕ Meio</button>
              <button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('bottom')} title="Alinhar à base">Base ↓</button>
            </div>
            <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.locked)} onChange={(event) => updateSelected({ locked: event.target.checked })} /><span>Bloquear posição</span></label>
            <div className="property-actions"><button className="wide-action" type="button" onClick={() => duplicateSource(selectedSource)}>Duplicar fonte</button><button className="wide-action danger-action" type="button" onClick={() => deleteSource(selectedSource.id)}>Excluir fonte</button></div>
          </div>}
        </div>
        <div className="scene-settings-panel">
          <div className="properties-heading"><div><p className="eyebrow">CONFIGURAÇÃO</p><h3>Tela da cena</h3></div></div>
          <label className="field-label" htmlFor="scene-background-mode">Plano de fundo</label>
          <select id="scene-background-mode" className="text-input" value={activeScene.background?.mode ?? 'transparent'} onChange={(event) => updateScene({ background: { mode: event.target.value as BackgroundConfig['mode'], color: activeScene.background?.color ?? '#25233a', color2: activeScene.background?.color2 ?? '#10121a', angle: activeScene.background?.angle ?? 135 } })}><option value="transparent">Transparente (overlay)</option><option value="solid">Cor sólida</option><option value="gradient">Gradiente</option></select>
          {(activeScene.background?.mode ?? 'transparent') !== 'transparent' && <><label className="field-label" htmlFor="scene-bg-color">Cor principal</label><ColorField id="scene-bg-color" value={activeScene.background?.color ?? '#25233a'} onChange={(color) => updateScene({ background: { mode: activeScene.background?.mode ?? 'solid', color, color2: activeScene.background?.color2 ?? '#10121a', angle: activeScene.background?.angle ?? 135 } })} /></>}
          {activeScene.background?.mode === 'gradient' && <><label className="field-label" htmlFor="scene-bg-color2">Segunda cor</label><ColorField id="scene-bg-color2" value={activeScene.background.color2 ?? '#10121a'} onChange={(color2) => updateScene({ background: { ...activeScene.background!, color2 } })} /><label className="field-label" htmlFor="scene-bg-angle">Ângulo do gradiente</label><div className="range-row"><input id="scene-bg-angle" type="range" min="0" max="360" value={activeScene.background.angle ?? 135} onChange={(event) => updateScene({ background: { ...activeScene.background!, angle: Number(event.target.value) } })} /><span>{activeScene.background.angle ?? 135}°</span></div></>}
          <label className="field-label" htmlFor="scene-resolution">Resolução da composição</label>
          <select id="scene-resolution" className="text-input" value={`${activeScene.width ?? 1920}x${activeScene.height ?? 1080}`} onChange={(event) => { const [width, height] = event.target.value.split('x').map(Number); updateScene({ width, height }) }}><option value="1920x1080">Full HD · 1920 × 1080</option><option value="1280x720">HD · 1280 × 720</option><option value="1080x1920">Vertical · 1080 × 1920</option><option value="1080x1080">Quadrado · 1080 × 1080</option><option value="2560x1440">QHD · 2560 × 1440</option></select>
          <p className="field-hint">A posição e o tamanho dos elementos são relativos à tela, então funcionam em todas as resoluções.</p>
        </div>
        <div className="inspector-footer"><span className="status-dot" /> Modo de edição local</div>
      </aside>

      <input ref={imageInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" multiple onChange={onImageSelected} />
      <input ref={backgroundDesignInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={onBackgroundDesignSelected} />
      <input ref={importInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={importProject} />
      {message && <div className="save-toast" role="status"><span>✓</span>{message}<button type="button" onClick={() => setMessage('')} aria-label="Fechar aviso">×</button></div>}
    </div>
  )
}

function ColorField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return <div className="color-field"><input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} /><span>{value.toUpperCase()}</span></div>
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="number-field"><span>{label}</span><div><input type="number" min="0" max="100" step="1" value={Math.round(value * 10) / 10} onChange={(event) => onChange(Number(event.target.value) || 0)} /><small>%</small></div></label>
}

function OverlayView() {
  const [project, setProject] = useState<Project>(() => readProject())
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const activeScene = project.scenes.find((scene) => scene.id === project.activeSceneId) ?? project.scenes[0]
  const needsCamera = activeScene?.sources.some((source) => source.visible && source.type === 'camera') ?? false

  useEffect(() => {
    document.documentElement.classList.add('overlay-document')
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed: unknown = JSON.parse(event.newValue)
          if (isValidProject(parsed)) setProject(parsed)
        } catch {
          // Ignorar uma gravação transitória inválida.
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      document.documentElement.classList.remove('overlay-document')
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    if (!needsCamera || !navigator.mediaDevices?.getUserMedia) {
      setCameraStream((previous) => {
        previous?.getTracks().forEach((track) => track.stop())
        return null
      })
      return
    }
    let active = true
    let ownedStream: MediaStream | null = null
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
      if (!active) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      ownedStream = stream
      setCameraStream(stream)
    }).catch(() => {
      // Overlay continua funcionando mesmo sem acesso à câmera.
    })
    return () => {
      active = false
      ownedStream?.getTracks().forEach((track) => track.stop())
    }
  }, [needsCamera])

  if (!activeScene) return null
  return <div className="overlay-output" aria-label={`Overlay: ${activeScene.name}`} style={sceneBackgroundStyle(activeScene)}>
    {activeScene.sources.filter((source) => source.visible).map((source, index) => <div key={source.id} className={`overlay-object overlay-${source.type} ${source.type === 'shape' ? `shape-${source.shapeKind ?? 'rectangle'}` : ''}`} style={sourceStyle(source, index)}>
      {source.type === 'text' && <span className="object-text">{source.text || source.name}</span>}
      {source.type === 'shape' && <span className={`shape-inner shape-inner-${source.shapeKind ?? 'rectangle'}`} style={{ background: source.color ?? '#7772f2', borderRadius: source.shapeKind === 'circle' ? '50%' : source.shapeKind === 'pill' ? '999px' : source.shapeKind === 'line' ? '999px' : `${source.radius ?? 4}px` }} />}
      {source.type === 'image' && source.src && <img src={source.src} alt={source.name} draggable={false} style={{ objectFit: source.objectFit ?? 'contain' }} />}
      {source.type === 'browser' && <iframe className="browser-frame" title={source.name} src={getBrowserUrl(source.url)} sandbox="allow-scripts allow-forms allow-popups" referrerPolicy="no-referrer" loading="lazy" tabIndex={-1} />}
      {source.type === 'camera' && (cameraStream ? <video className="camera-video" autoPlay muted playsInline style={{ transform: source.cameraMirror === false ? 'none' : 'scaleX(-1)' }} ref={(element) => { if (element && element.srcObject !== cameraStream) element.srcObject = cameraStream }} /> : <div className="overlay-camera-placeholder" />)}
      {source.type === 'widget' && <WidgetContent source={source} />}
    </div>)}
  </div>
}

export default App
