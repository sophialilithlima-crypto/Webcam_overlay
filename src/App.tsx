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
type BackgroundConfig = { mode: 'transparent' | 'solid' | 'gradient' | 'image'; color: string; color2: string; angle: number; imageSrc?: string; imageFit?: 'cover' | 'contain' | 'stretch'; imagePosition?: string; imageOpacity?: number; overlayColor?: string; overlayOpacity?: number }
type InspectorTab = 'layers' | 'element' | 'background' | 'canvas'
type ElementSection = 'content' | 'style' | 'transform'
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
  objectPosition?: string
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration?: 'none' | 'underline' | 'line-through'
  textShadowEnabled?: boolean
  radius?: number
  rotation?: number
  opacity?: number
  borderColor?: string
  borderWidth?: number
  shadow?: boolean
  fontFamily?: string
  fontUrl?: string
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
  widgetBackgroundColor?: string
  widgetBackgroundOpacity?: number
  widgetTextColor?: string
  widgetTitleColor?: string
  widgetBorderColor?: string
  widgetBorderWidth?: number
  widgetRadius?: number
  widgetPadding?: number
  widgetGap?: number
  widgetFontFamily?: string
  widgetFontUrl?: string
  widgetShowIcon?: boolean
  widgetAnimation?: 'none' | 'subtle' | 'energetic'
  widgetCustomCss?: string
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
    if (scene.background !== undefined && (!scene.background || !['transparent', 'solid', 'gradient', 'image'].includes(scene.background.mode))) return false
    if (scene.background?.imageSrc !== undefined && typeof scene.background.imageSrc !== 'string') return false
    if (scene.background?.imageSrc && !isSafeImageSource(scene.background.imageSrc)) return false

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
      if (source.fontUrl !== undefined && typeof source.fontUrl !== 'string') return false
      if (source.widgetFontUrl !== undefined && typeof source.widgetFontUrl !== 'string') return false
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
        fontUrl: typeof source.fontUrl === 'string' ? source.fontUrl.slice(0, 1000) : undefined,
        objectPosition: typeof source.objectPosition === 'string' ? source.objectPosition.slice(0, 40) : 'center center',
        textTransform: ['uppercase', 'lowercase', 'capitalize'].includes(source.textTransform ?? '') ? source.textTransform : 'none',
        textDecoration: ['underline', 'line-through'].includes(source.textDecoration ?? '') ? source.textDecoration : 'none',
        widgetBackgroundOpacity: clamp(Number.isFinite(source.widgetBackgroundOpacity) ? Number(source.widgetBackgroundOpacity) : 0.92, 0, 1),
        widgetBorderWidth: clamp(Number.isFinite(source.widgetBorderWidth) ? Number(source.widgetBorderWidth) : 1, 0, 12),
        widgetRadius: clamp(Number.isFinite(source.widgetRadius) ? Number(source.widgetRadius) : 12, 0, 80),
        widgetPadding: clamp(Number.isFinite(source.widgetPadding) ? Number(source.widgetPadding) : 12, 0, 48),
        widgetGap: clamp(Number.isFinite(source.widgetGap) ? Number(source.widgetGap) : 8, 0, 32),

        text: typeof source.text === 'string' ? source.text.slice(0, 2000) : undefined,
        widgetTitle: typeof source.widgetTitle === 'string' ? source.widgetTitle.slice(0, 90) : undefined,
        widgetText: typeof source.widgetText === 'string' ? source.widgetText.slice(0, 300) : undefined,
        widgetItems: typeof source.widgetItems === 'string' ? source.widgetItems.slice(0, 1200) : undefined,
        widgetKind: source.type === 'widget' ? ((knownWidget ? source.widgetKind : undefined) ?? 'goal') : source.widgetKind,
      }
    })
    const rawBackground = scene.background
    const background: BackgroundConfig = {
      mode: rawBackground && ['transparent', 'solid', 'gradient', 'image'].includes(rawBackground.mode) ? rawBackground.mode : 'transparent',
      color: typeof rawBackground?.color === 'string' ? rawBackground.color : '#171923',
      color2: typeof rawBackground?.color2 === 'string' ? rawBackground.color2 : '#28243c',
      angle: clamp(Number.isFinite(rawBackground?.angle) ? Number(rawBackground?.angle) : 135, 0, 360),
      imageSrc: typeof rawBackground?.imageSrc === 'string' && isSafeImageSource(rawBackground.imageSrc) ? rawBackground.imageSrc : undefined,
      imageFit: rawBackground?.imageFit === 'contain' || rawBackground?.imageFit === 'stretch' ? rawBackground.imageFit : 'cover',
      imagePosition: typeof rawBackground?.imagePosition === 'string' ? rawBackground.imagePosition.slice(0, 40) : 'center center',
      imageOpacity: clamp(Number.isFinite(rawBackground?.imageOpacity) ? Number(rawBackground?.imageOpacity) : 1, 0, 1),
      overlayColor: typeof rawBackground?.overlayColor === 'string' ? rawBackground.overlayColor : '#000000',
      overlayOpacity: clamp(Number.isFinite(rawBackground?.overlayOpacity) ? Number(rawBackground?.overlayOpacity) : 0, 0, 1),
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
    style.textTransform = source.textTransform ?? 'none'
    style.textDecoration = source.textDecoration ?? 'none'
    style.textShadow = source.textShadowEnabled === false ? 'none' : '0 2px 12px #0005'
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

function isSafeImageSource(source: string): boolean {
  if (/^data:image\/(png|jpeg|webp|gif|svg\+xml);/i.test(source)) return source.length <= MAX_PROJECT_JSON_CHARS
  try {
    const parsed = new URL(source)
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.href.length < 2000
  } catch {
    return false
  }
}

function hexToRgba(color: string, alpha = 1): string {
  const normalized = color.trim().replace('#', '')
  const expanded = normalized.length === 3 ? normalized.split('').map((part) => part + part).join('') : normalized
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return `rgba(0, 0, 0, ${clamp(alpha, 0, 1)})`
  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${clamp(alpha, 0, 1)})`
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
  if (mode === 'gradient') return { backgroundColor: background?.color ?? '#171923', backgroundImage: `linear-gradient(${background?.angle ?? 135}deg, ${background?.color ?? '#25233a'}, ${background?.color2 ?? '#10121a'})` }
  const imageSrc = background?.imageSrc && isSafeImageSource(background.imageSrc) ? background.imageSrc : ''
  if (!imageSrc) return { backgroundColor: background?.color ?? '#171923', backgroundImage: isPreview ? 'repeating-conic-gradient(#262936 0% 25%, #1c1f29 0% 50%)' : 'none', backgroundSize: '24px 24px' }
  const fadeImage = 1 - clamp(background?.imageOpacity ?? 1, 0, 1)
  const overlayOpacity = clamp(background?.overlayOpacity ?? 0, 0, 1)
  const imageUrl = `url(${JSON.stringify(imageSrc)})`
  const backgroundLayers = [
    `linear-gradient(${hexToRgba(background?.overlayColor ?? '#000000', overlayOpacity)}, ${hexToRgba(background?.overlayColor ?? '#000000', overlayOpacity)})`,
    `linear-gradient(${hexToRgba(background?.color ?? '#171923', fadeImage)}, ${hexToRgba(background?.color ?? '#171923', fadeImage)})`,
    imageUrl,
  ]
  const fit = background?.imageFit ?? 'cover'
  return {
    backgroundColor: background?.color ?? '#171923',
    backgroundImage: backgroundLayers.join(', '),
    backgroundSize: `100% 100%, 100% 100%, ${fit === 'stretch' ? '100% 100%' : fit}`,
    backgroundPosition: `center center, center center, ${background?.imagePosition ?? 'center center'}`,
    backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
  }
}

function backgroundPositionPercent(position: string | undefined, axis: 'x' | 'y'): number {
  const value = (position ?? 'center center').trim().toLowerCase()
  const tokens = value.split(/\s+/)
  const percentages = tokens.filter((token) => /^-?\d+(?:\.\d+)?%$/.test(token)).map((token) => clamp(Number(token.slice(0, -1)), 0, 100))
  if (percentages.length) return percentages[axis === 'x' ? 0 : Math.min(1, percentages.length - 1)] ?? 50
  if (axis === 'x') {
    if (tokens.includes('left')) return 0
    if (tokens.includes('right')) return 100
    return 50
  }
  if (tokens.includes('top')) return 0
  if (tokens.includes('bottom')) return 100
  return 50
}

function externalFontFamilyFromUrl(urlValue: string, sourceId: string): { family: string; faceName: string; kind: 'stylesheet' | 'font' } | null {
  try {
    const url = new URL(urlValue.trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    const path = url.pathname.toLowerCase()
    if (url.hostname === 'fonts.googleapis.com' || path.endsWith('.css')) {
      const familyParam = url.searchParams.get('family')
      const family = familyParam ? familyParam.split(':')[0].replace(/\+/g, ' ').replace(/[^\p{L}\p{N} _-]/gu, '').trim() : ''
      return { family: family ? `"${family}", sans-serif` : '', faceName: family, kind: 'stylesheet' }
    }
    const extension = path.match(/\.(woff2?|ttf|otf)$/)?.[1]
    if (!extension) return null
    const faceName = `WebFont_${sourceId.replace(/[^a-zA-Z0-9_]/g, '').slice(-30) || 'Custom'}`
    return { family: `"${faceName}", sans-serif`, faceName, kind: 'font' }
  } catch {
    return null
  }
}

function customWidgetDeclarations(source: SceneSource): CSSProperties {
  const allowed = new Set(['color', 'background', 'background-color', 'border', 'border-radius', 'border-color', 'border-width', 'border-style', 'padding', 'gap', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-shadow', 'box-shadow', 'text-transform', 'text-align', 'filter', 'backdrop-filter'])
  const result: Record<string, string> = {}
  for (const declaration of (source.widgetCustomCss ?? '').split(';')) {
    const colon = declaration.indexOf(':')
    if (colon < 1) continue
    const property = declaration.slice(0, colon).trim().toLowerCase()
    const value = declaration.slice(colon + 1).trim()
    if (!allowed.has(property) || !value || /[{}<>]/.test(value) || /url\s*\(|expression\s*\(/i.test(value) || value.length > 120) continue
    result[property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())] = value
  }
  return result as CSSProperties
}

function ExternalFontLoader({ project }: { project: Project }) {
  useEffect(() => {
    const sources = project.scenes.flatMap((scene) => scene.sources).filter((source) => (source.type === 'text' && source.fontUrl?.trim()) || (source.type === 'widget' && source.widgetFontUrl?.trim()))
    const activeResourceIds = new Set<string>()
    for (const source of sources) {
      const fontUrl = source.type === 'widget' ? source.widgetFontUrl : source.fontUrl
      const currentFontFamily = source.type === 'widget' ? source.widgetFontFamily : source.fontFamily
      const info = externalFontFamilyFromUrl(fontUrl ?? '', source.id)
      if (!info) continue
      try {
        const url = new URL(fontUrl!.trim())
        const resourceId = `overlay-font-${Array.from(`${source.id}-${url.href}`).reduce((hash, char) => ((hash * 31) + char.charCodeAt(0)) >>> 0, 7).toString(36)}`
        activeResourceIds.add(resourceId)
        if (info.kind === 'stylesheet') {
          let link = document.getElementById(resourceId) as HTMLLinkElement | null
          if (!link) {
            link = document.createElement('link')
            link.id = resourceId
            link.rel = 'stylesheet'
            document.head.appendChild(link)
          }
          if (link.href !== url.href) link.href = url.href
        } else {
          let style = document.getElementById(resourceId) as HTMLStyleElement | null
          if (!style) {
            style = document.createElement('style')
            style.id = resourceId
            document.head.appendChild(style)
          }
          const firstFamily = (currentFontFamily ?? info.family).split(',')[0].trim().replace(/^['"]|['"]$/g, '') || info.faceName
          const format = url.pathname.toLowerCase().endsWith('.woff2') ? 'woff2' : url.pathname.toLowerCase().endsWith('.woff') ? 'woff' : url.pathname.toLowerCase().endsWith('.otf') ? 'opentype' : 'truetype'
          style.textContent = `@font-face{font-family:${JSON.stringify(firstFamily)};src:url(${JSON.stringify(url.href)}) format(${JSON.stringify(format)});font-style:normal;font-weight:100 900;font-display:swap;}`
        }
      } catch {
        // A fonte inválida é ignorada sem interromper o editor.
      }
    }
    document.querySelectorAll<HTMLElement>('[id^="overlay-font-"]').forEach((element) => {
      if (!activeResourceIds.has(element.id)) element.remove()
    })
  }, [project])
  return null
}

function WidgetContent({ source, testToken = 0 }: { source: SceneSource; testToken?: number }) {
  const kind = source.widgetKind ?? 'goal'
  const accent = source.widgetAccent ?? source.color ?? '#8d85ff'
  const widgetAppearance = {
    '--widget-accent': accent,
    '--widget-text-color': source.widgetTextColor ?? '#f2f3fb',
    '--widget-title-color': source.widgetTitleColor ?? '#ffffff',
    '--widget-border-color': source.widgetBorderColor ?? 'color-mix(in srgb, var(--widget-accent) 42%, #424456)',
    '--widget-border-width': `${source.widgetBorderWidth ?? 1}px`,
    '--widget-radius': `${source.widgetRadius ?? 12}px`,
    '--widget-padding': `${source.widgetCompact ? Math.min(source.widgetPadding ?? 12, 6) : source.widgetPadding ?? 12}px`,
    '--widget-gap': `${source.widgetCompact ? Math.min(source.widgetGap ?? 8, 4) : source.widgetGap ?? 8}px`,
    '--widget-background': source.widgetBackgroundColor ? hexToRgba(source.widgetBackgroundColor, source.widgetBackgroundOpacity ?? 0.92) : 'var(--widget-theme-background)',
    '--widget-font-family': source.widgetFontFamily?.trim() || 'inherit',
  } as CSSProperties
  const widgetRootStyle = { ...widgetAppearance, ...customWidgetDeclarations(source) } as CSSProperties
  const widgetMotion = `widget-motion-${source.widgetAnimation ?? 'subtle'}`
  const showHeader = source.widgetShowHeader !== false
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
    return <div className={`stream-widget webcam-frame-widget widget-theme-${source.widgetTheme ?? 'neon'} ${widgetMotion} ${source.widgetShowIcon === false ? 'widget-no-icon' : ''}`} style={widgetRootStyle}>
      <div className="webcam-frame-corner corner-tl" /><div className="webcam-frame-corner corner-tr" />
      <div className="webcam-frame-corner corner-bl" /><div className="webcam-frame-corner corner-br" />
      <span className="webcam-frame-label">{source.widgetTitle || 'WEBCAM'}</span>
    </div>
  }

  if (kind === 'live-badge') {
    return <div className={`stream-widget live-badge-widget widget-theme-${source.widgetTheme ?? 'minimal'} ${widgetMotion} ${source.widgetShowIcon === false ? 'widget-no-icon' : ''}`} style={widgetRootStyle}>
      <span className="live-badge-dot" />
      <span className="live-badge-copy"><strong>{source.widgetTitle || 'AO VIVO'}</strong><small>{source.widgetText || 'TRANSMITINDO'}</small></span>
    </div>
  }

  return <div className={`stream-widget widget-${kind} widget-theme-${source.widgetTheme ?? 'glass'} ${widgetMotion} ${source.widgetCompact ? 'widget-compact' : ''} ${source.widgetShowIcon === false ? 'widget-no-icon' : ''} ${alertVisible ? 'alert-triggered' : ''}`} style={widgetRootStyle}>
    {kind === 'alert' && <>
      <div className="widget-alert-icon">✦</div>
      <div className="widget-alert-content"><span className="widget-kicker">{alertVisible ? 'NOVO EVENTO!' : (source.widgetTitle || 'ALERTA DE EVENTO')}</span><strong>{alertVisible ? (source.widgetValue || 'pixelrider') : (source.widgetValue || 'Novo seguidor')}</strong><small>{source.widgetText || 'começou a seguir o canal'}</small></div>
    </>}

    {kind === 'chat' && <>
      {showHeader && <div className="widget-header"><strong>{source.widgetTitle || 'CHAT AO VIVO'}</strong></div>}
      <div className="chat-messages">{(lines.length ? lines : ['LuaGamer: Oi, chat!', 'PixelRider: Boa live!', 'nina: Qual é o jogo?', 'Gui: Cheguei agora']).map((line, index) => {
        const separator = line.indexOf(':')
        const username = separator >= 0 ? line.slice(0, separator) : `viewer${index + 1}`
        const message = separator >= 0 ? line.slice(separator + 1).trim() : line
        return <div className="chat-message" key={`${line}-${index}`}><strong style={{ color: ['#b8a8ff', '#74dfc5', '#ffbd83', '#85c8ff'][index % 4] }}>{username}</strong><span>{message}</span></div>
      })}</div>
      <div className="chat-input-sample"><span>Enviar mensagem…</span><b>↗</b></div>
    </>}

    {kind === 'events' && <>
      {showHeader && <div className="widget-header"><strong>{source.widgetTitle || 'ATIVIDADE RECENTE'}</strong></div>}
      <div className="event-items">{(lines.length ? lines : ['Novo seguidor · pixelrider', 'Nova inscrição · lua_gamer', 'Apoio · catbits · R$ 10', 'Raid · canal_da_nina · 24']).slice(0, 6).map((line, index) => {
        const parts = line.split('·').map((part) => part.trim())
        return <div className="event-item" key={`${line}-${index}`}><span className={`event-type-icon event-icon-${index % 4}`}>{['↗', '★', '♥', '✦'][index % 4]}</span><span className="event-copy"><strong>{parts[0]}</strong><small>{parts.slice(1).join(' · ') || 'viewer_exemplo'}</small></span></div>
      })}</div>
    </>}

    {kind === 'goal' && <>
      {showHeader && <div className="widget-header"><strong>{source.widgetTitle || 'META DA LIVE'}</strong></div>}
      {source.widgetText && <p className="widget-muted-line">{source.widgetText}</p>}
      <div className="goal-numbers"><strong>{source.widgetValue ?? '68'}</strong><span>/ {source.widgetTarget ?? '100'}</span><b>{Math.round(progress)}%</b></div>
      <div className="goal-track"><span style={{ width: `${progress}%` }} /></div>
      <small className="goal-footnote">{progress >= 100 ? 'Meta alcançada!' : `${Math.max(0, targetValue - currentValue)} para alcançar a meta`}</small>
    </>}

    {kind === 'latest' && <>
      <div className="latest-icon">☆</div><div className="latest-copy"><span className="widget-kicker">{source.widgetTitle || 'ÚLTIMO SEGUIDOR'}</span><strong>{source.widgetText || 'pixelrider'}</strong></div>
    </>}

    {kind === 'socials' && <>
      {showHeader && source.widgetTitle && <div className="widget-header"><strong>{source.widgetTitle}</strong><span className="widget-header-pill">PERFIS</span></div>}
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
      {showHeader && <div className="widget-header"><strong>{source.widgetTitle || 'ENQUETE DA LIVE'}</strong></div>}
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
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('layers')
  const [elementSection, setElementSection] = useState<ElementSection>('content')
  const [backgroundUrlInput, setBackgroundUrlInput] = useState('')
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
    setInspectorTab('layers')
    setElementSection('content')
    setInteraction(null)
    setOpenSceneMenuId(null)
    setSourceMenuOpen(false)
    setMessage('')
  }

  function addScene() {
    const scene: Scene = { id: newId('scene'), name: `Cena ${project.scenes.length + 1}`, sources: [], background: { mode: 'transparent', color: '#171923', color2: '#28243c', angle: 135, imageFit: 'cover', imagePosition: 'center center', imageOpacity: 1, overlayColor: '#000000', overlayOpacity: 0 }, width: activeScene?.width ?? 1920, height: activeScene?.height ?? 1080 }
    setProject((current) => ({ ...current, scenes: [...current.scenes, scene], activeSceneId: scene.id }))
    setSelectedSourceId(null)
    setInspectorTab('layers')
    setElementSection('content')
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
    const scene = (name: string, sources: SceneSource[], background: BackgroundConfig = { mode: 'transparent', color: '#171923', color2: '#25233a', angle: 135, imageFit: 'cover', imagePosition: 'center center', imageOpacity: 1, overlayColor: '#000000', overlayOpacity: 0 }): Scene => ({
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
    setInspectorTab('layers')
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
    setInspectorTab('layers')
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
    setInspectorTab('element')
    setElementSection('content')
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
    setInspectorTab('element')
    setElementSection('content')
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
      if (currentProject.activeSceneId === targetSceneId && additions.length) { setSelectedSourceId(additions[additions.length - 1].id); setInspectorTab('element'); setElementSection('content') }
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
      setMessage('Escolha uma imagem PNG, JPG, WebP, GIF ou SVG para usar como plano de fundo.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage('O arquivo deve ter até 1,5 MB para manter o projeto leve.')
      return
    }
    try {
      const imageSrc = await parseLocalImageData(file)
      const nextBackground: BackgroundConfig = {
        ...(activeScene.background ?? { mode: 'image', color: '#171923', color2: '#25233a', angle: 135 }),
        mode: 'image', imageSrc, imageFit: activeScene.background?.imageFit ?? 'cover', imagePosition: activeScene.background?.imagePosition ?? 'center center', imageOpacity: activeScene.background?.imageOpacity ?? 1, overlayColor: activeScene.background?.overlayColor ?? '#000000', overlayOpacity: activeScene.background?.overlayOpacity ?? 0,
      }
      updateScene({ background: nextBackground })
      setInspectorTab('background')
      setMessage(`Imagem “${file.name}” definida como plano de fundo da cena.`)
    } catch {
      setMessage('Não foi possível importar essa imagem de fundo.')
    }
  }

  function applyBackgroundUrl() {
    const candidate = backgroundUrlInput.trim()
    if (!isSafeImageSource(candidate) || candidate.startsWith('data:')) {
      setMessage('Informe um link de imagem HTTP ou HTTPS válido.')
      return
    }
    updateScene({ background: {
      ...(activeScene.background ?? { mode: 'image', color: '#171923', color2: '#25233a', angle: 135 }),
      mode: 'image', imageSrc: candidate, imageFit: activeScene.background?.imageFit ?? 'cover', imagePosition: activeScene.background?.imagePosition ?? 'center center', imageOpacity: activeScene.background?.imageOpacity ?? 1, overlayColor: activeScene.background?.overlayColor ?? '#000000', overlayOpacity: activeScene.background?.overlayOpacity ?? 0,
    } })
    setInspectorTab('background')
    setMessage('Imagem de fundo vinculada ao endereço informado. Ela precisa continuar acessível pela internet.')
  }

  function applyFontUrl() {
    if (!selectedSource || selectedSource.type !== 'text') return
    const candidate = (selectedSource.fontUrl ?? '').trim()
    const info = externalFontFamilyFromUrl(candidate, selectedSource.id)
    if (!info) {
      setMessage('Link de fonte inválido. Use uma URL HTTPS para Google Fonts CSS ou um arquivo .woff2, .woff, .ttf ou .otf.')
      return
    }
    if (info.family) updateSelected({ fontFamily: info.family })
    else updateSelected({ fontFamily: selectedSource.fontFamily || info.family })
    setMessage('Link de fonte aplicado. A fonte pode demorar alguns segundos para carregar e depende de permissão de acesso do servidor.')
  }

  function applyWidgetFontUrl() {
    if (!selectedSource || selectedSource.type !== 'widget') return
    const candidate = (selectedSource.widgetFontUrl ?? '').trim()
    const info = externalFontFamilyFromUrl(candidate, selectedSource.id)
    if (!info) {
      setMessage('Link de fonte inválido. Use Google Fonts CSS ou um arquivo .woff2, .woff, .ttf ou .otf.')
      return
    }
    if (info.family) updateSelected({ widgetFontFamily: info.family })
    else updateSelected({ widgetFontFamily: selectedSource.widgetFontFamily || info.family })
    setMessage('Fonte aplicada ao widget. O carregamento depende da disponibilidade da URL e das permissões do servidor.')
  }

  function toggleVisibility(sourceId: string) {
    updateActiveScene((scene) => ({
      ...scene,
      sources: scene.sources.map((source) => source.id === sourceId ? { ...source, visible: !source.visible } : source),
    }))
  }

  function deleteSource(sourceId: string) {
    updateActiveScene((scene) => ({ ...scene, sources: scene.sources.filter((source) => source.id !== sourceId) }))
    if (selectedSourceId === sourceId) { setSelectedSourceId(null); setInspectorTab('layers') }
  }

  function duplicateSource(source: SceneSource) {
    const copy: SceneSource = placeWithoutOverlap(activeScene.sources, { ...source, id: newId('source'), name: `${source.name} (cópia)`.slice(0, 70), x: clamp(source.x + 3, 0, 100 - source.w), y: clamp(source.y + 3, 0, 100 - source.h) })
    updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, copy] }))
    setSelectedSourceId(copy.id)
    setInspectorTab('element')
    setElementSection('content')
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
    setInspectorTab('layers')
    setElementSection('content')
    setBackgroundUrlInput('')
    setSourceMenuOpen(false)
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
    setInspectorTab('element')
    setElementSection('content')
    setInteraction({
      sourceId: source.id, mode,
      pointerX: event.clientX, pointerY: event.clientY,
      x: source.x, y: source.y, w: source.w, h: source.h,
    })
  }

  return (
    <div className="app-shell">
      <ExternalFontLoader project={project} />
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
                <button type="button" onClick={() => { backgroundDesignInputRef.current?.click(); setShowExportMenu(false) }}>Definir imagem de fundo</button>
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
            <div className="preview-canvas" ref={stageRef} style={{ ...sceneBackgroundStyle(activeScene, true), aspectRatio: `${activeScene.width ?? 1920} / ${activeScene.height ?? 1080}` }} onPointerDown={() => { setSelectedSourceId(null); setInspectorTab('background') }}>
              {activeScene.sources.filter((source) => source.visible).map((source, index) => (
                <div
                  className={`canvas-object object-${source.type} ${source.type === 'shape' ? `shape-${source.shapeKind ?? 'rectangle'}` : ''} ${source.locked ? 'locked' : ''} ${selectedSourceId === source.id ? 'is-selected' : ''}`}
                  key={source.id}
                  style={sourceStyle(source, index)}
                  onPointerDown={(event) => beginInteraction(event, source, 'move')}
                  onClick={(event) => { event.stopPropagation(); setSelectedSourceId(source.id); setInspectorTab('element') }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Selecionar e mover ${source.name}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedSourceId(source.id); setInspectorTab('element') }
                  }}
                >
                  {source.type === 'text' && <span className="object-text" style={{ textTransform: source.textTransform ?? 'none', textDecoration: source.textDecoration ?? 'none', textShadow: source.textShadowEnabled === false ? 'none' : undefined }}>{source.text || source.name}</span>}
                  {source.type === 'shape' && <span className={`shape-inner shape-inner-${source.shapeKind ?? 'rectangle'}`} />}
                  {source.type === 'image' && source.src && <img src={source.src} alt={source.name} draggable={false} style={{ objectFit: source.objectFit ?? 'contain', objectPosition: source.objectPosition ?? 'center center' }} />}
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
        <footer className="studio-footer"><span className="footer-tip"><span className="tip-icon">i</span> As alterações são salvas automaticamente neste navegador.</span><span className="footer-version">WEBCAM_OVERLAY · 2.3.0</span></footer>
      </main>

      <aside className="inspector-panel">
        <div className="inspector-heading">
          <div><p className="eyebrow">ESTÚDIO</p><h2>Inspetor</h2></div>
          {inspectorTab === 'layers' && <button className="icon-button add-button" type="button" onClick={() => setSourceMenuOpen((open) => !open)} title="Adicionar fonte" aria-label="Adicionar fonte">+</button>}
        </div>
        <nav className="inspector-tabs" aria-label="Painéis do inspetor">
          <button type="button" className={inspectorTab === 'layers' ? 'active' : ''} onClick={() => { setInspectorTab('layers'); setSourceMenuOpen(false) }}>Camadas</button>
          <button type="button" className={inspectorTab === 'element' ? 'active' : ''} disabled={!selectedSource} onClick={() => { setInspectorTab('element'); setElementSection('content') }}>Elemento</button>
          <button type="button" className={inspectorTab === 'background' ? 'active' : ''} onClick={() => { setInspectorTab('background'); setSourceMenuOpen(false); setBackgroundUrlInput(activeScene.background?.imageSrc?.startsWith('http') ? activeScene.background.imageSrc : '') }}>Fundo</button>
          <button type="button" className={inspectorTab === 'canvas' ? 'active' : ''} onClick={() => { setInspectorTab('canvas'); setSourceMenuOpen(false) }}>Tela</button>
        </nav>

        {inspectorTab === 'layers' && <>
          {sourceMenuOpen && <div className="source-menu"><p className="eyebrow">ELEMENTOS BÁSICOS</p>
            {(['text', 'shape', 'camera', 'image', 'browser'] as Exclude<SourceType, 'widget'>[]).map((type) => <button key={type} type="button" onClick={() => addSource(type)}><span className={`source-icon icon-${type}`}>{sourceGlyph(type)}</span><span><strong>{sourceLabel(type)}</strong><small>{{ text: 'Texto, tipografia e efeitos', shape: 'Retângulo, círculo, linha ou pílula', camera: 'Webcam do dispositivo', image: 'Arquivo PNG, JPG ou WebP', browser: 'Página ou widget web incorporado' }[type]}</small></span><span className="menu-arrow">›</span></button>)}
            <div className="widget-library-title"><p className="eyebrow">WIDGETS PARA STREAM</p><span>{WIDGET_OPTIONS.length}</span></div>
            <input className="text-input widget-search" value={widgetSearch} onChange={(event) => setWidgetSearch(event.target.value)} placeholder="Buscar widget..." aria-label="Buscar widget" />
            {WIDGET_OPTIONS.filter((option) => `${option.label} ${option.description}`.toLocaleLowerCase('pt-BR').includes(widgetSearch.toLocaleLowerCase('pt-BR'))).map((option) => <button key={option.kind} type="button" onClick={() => addWidget(option.kind)}><span className="source-icon icon-widget">{option.glyph}</span><span><strong>{option.label}</strong><small>{option.description}</small></span><span className="menu-arrow">›</span></button>)}
            {WIDGET_OPTIONS.filter((option) => `${option.label} ${option.description}`.toLocaleLowerCase('pt-BR').includes(widgetSearch.toLocaleLowerCase('pt-BR'))).length === 0 && <p className="widget-no-results">Nenhum widget encontrado.</p>}
          </div>}
          <div className="source-list-heading"><span className="eyebrow">CAMADAS DA CENA</span><span className="count-badge">{activeScene.sources.length}</span></div>
          <div className="source-list">
            {activeScene.sources.length === 0 && <div className="empty-state"><span>＋</span><strong>Cena vazia</strong><p>Adicione texto, imagens, webcam, formas ou widgets usando o botão +.</p></div>}
            {[...activeScene.sources].map((source, index) => ({ source, index })).reverse().map(({ source, index }) => (
              <div className={`source-row ${selectedSourceId === source.id ? 'selected' : ''}`} key={source.id}>
                <button className="source-select" type="button" onClick={() => { setSelectedSourceId(source.id); setInspectorTab('element'); setElementSection('content') }}><span className={`source-icon icon-${source.type}`}>{sourceGlyph(source.type)}</span><span className="source-name">{source.name}</span></button>
                <button className="tiny-action layer-action" type="button" title="Subir camada" aria-label="Subir camada" disabled={index === activeScene.sources.length - 1} onClick={() => moveLayer(source.id, 1)}>↑</button>
                <button className="tiny-action layer-action" type="button" title="Descer camada" aria-label="Descer camada" disabled={index === 0} onClick={() => moveLayer(source.id, -1)}>↓</button>
                <button className={`tiny-action ${source.visible ? 'visible' : ''}`} type="button" onClick={() => toggleVisibility(source.id)} title={source.visible ? 'Ocultar fonte' : 'Mostrar fonte'} aria-label={source.visible ? 'Ocultar fonte' : 'Mostrar fonte'}>{source.visible ? '◉' : '◌'}</button>
                <button className="tiny-action remove-action" type="button" onClick={() => deleteSource(source.id)} title="Remover fonte" aria-label={`Remover ${source.name}`}>×</button>
              </div>
            ))}
          </div>
          <div className="inspector-tip"><span className="note-icon">i</span><p>Selecione uma camada para abrir seus controles. Fundo e resolução estão em painéis separados.</p></div>
        </>}

        {inspectorTab === 'element' && <div className="inspector-workspace">
          {!selectedSource && <div className="empty-state"><span>◇</span><strong>Nenhum elemento selecionado</strong><p>Escolha uma camada ou clique em um objeto na prévia.</p><button className="wide-action" type="button" onClick={() => setInspectorTab('layers')}>Ver camadas</button></div>}
          {selectedSource && <>
            <div className="properties-panel context-properties">
              <div className="properties-heading"><div><p className="eyebrow">EDITANDO ELEMENTO</p><h3>{selectedSource.name}</h3></div><span className="property-type">{sourceLabel(selectedSource.type)}</span></div>
              <div className="element-subtabs" role="tablist" aria-label="Opções do elemento">
                <button type="button" className={elementSection === 'content' ? 'active' : ''} onClick={() => setElementSection('content')}>Conteúdo</button>
                <button type="button" className={elementSection === 'style' ? 'active' : ''} onClick={() => setElementSection('style')}>Estilo</button>
                <button type="button" className={elementSection === 'transform' ? 'active' : ''} onClick={() => setElementSection('transform')}>Posição</button>
              </div>

              {elementSection === 'content' && <div className="property-fields">
                <label className="field-label" htmlFor="source-name">Nome da camada</label>
                <input id="source-name" className="text-input" value={selectedSource.name} maxLength={70} onChange={(event) => updateSelected({ name: event.target.value })} />
                {selectedSource.type === 'text' && <>
                  <label className="field-label" htmlFor="source-text">Texto exibido</label>
                  <textarea id="source-text" className="text-input textarea-input" rows={4} maxLength={2000} value={selectedSource.text ?? ''} onChange={(event) => updateSelected({ text: event.target.value })} placeholder="Digite a mensagem..." />
                  <p className="field-hint">Use quebras de linha para distribuir o texto em várias linhas.</p>
                </>}
                {selectedSource.type === 'shape' && <>
                  <label className="field-label" htmlFor="shape-kind">Formato</label>
                  <select id="shape-kind" className="text-input" value={selectedSource.shapeKind ?? 'rectangle'} onChange={(event) => updateSelected({ shapeKind: event.target.value as SceneSource['shapeKind'] })}><option value="rectangle">Retângulo</option><option value="circle">Círculo / elipse</option><option value="pill">Pílula</option><option value="line">Linha</option></select>
                </>}
                {selectedSource.type === 'image' && <>
                  <p className="field-hint">A imagem foi importada como uma camada independente. Para substituir o arquivo, remova-a e importe outra.</p>
                  <label className="field-label" htmlFor="image-fit">Modo de ajuste</label>
                  <select id="image-fit" className="text-input" value={selectedSource.objectFit ?? 'contain'} onChange={(event) => updateSelected({ objectFit: event.target.value as 'contain' | 'cover' })}><option value="contain">Mostrar imagem inteira</option><option value="cover">Preencher a área</option></select>
                </>}
                {selectedSource.type === 'browser' && <>
                  <label className="field-label" htmlFor="browser-url">URL da página/widget</label>
                  <input id="browser-url" className="text-input" type="url" value={selectedSource.url ?? ''} onChange={(event) => updateSelected({ url: event.target.value })} placeholder="https://..." />
                  <p className="field-hint">Alguns sites bloqueiam incorporação em iframe. Use URLs HTTP ou HTTPS.</p>
                </>}
                {selectedSource.type === 'camera' && <>
                  <div className="feature-note"><span className="note-icon">i</span><p>A webcam exige permissão do navegador. O áudio não é capturado nesta versão.</p></div>
                  <button className="wide-action" type="button" onClick={enableCamera}>{cameraStream ? 'Reativar webcam' : 'Ativar webcam'}</button>
                  {cameraStream && <button className="wide-action quiet-action" type="button" onClick={() => { cameraStream.getTracks().forEach((track) => track.stop()); setCameraStream(null); setMessage('Webcam desativada.') }}>Desativar webcam</button>}
                  {cameraError && <p className="error-note">{cameraError}</p>}
                </>}
                {selectedSource.type === 'widget' && <>
                  <div className="widget-inspector-note"><span className="note-icon">i</span><p>Dados de demonstração. Personalize o conteúdo e o visual nas abas deste elemento.</p></div>
                  <label className="field-label" htmlFor="widget-kind">Tipo de widget</label>
                  <select id="widget-kind" className="text-input" value={selectedSource.widgetKind ?? 'goal'} onChange={(event) => updateSelected({ widgetKind: event.target.value as WidgetKind })}>{WIDGET_OPTIONS.map((option) => <option key={option.kind} value={option.kind}>{option.label}</option>)}</select>
                  <label className="field-label" htmlFor="widget-title">Título / rótulo</label>
                  <input id="widget-title" className="text-input" value={selectedSource.widgetTitle ?? ''} maxLength={90} onChange={(event) => updateSelected({ widgetTitle: event.target.value })} placeholder="Título exibido" />
                  {['alert', 'latest', 'countdown', 'music', 'sponsor', 'ticker', 'goal', 'live-badge', 'webcam-frame', 'clock', 'viewer', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? 'goal') && <>
                    <label className="field-label" htmlFor="widget-text">Mensagem / descrição</label>
                    <textarea id="widget-text" className="text-input textarea-input" rows={3} maxLength={1000} value={selectedSource.widgetText ?? ''} onChange={(event) => updateSelected({ widgetText: event.target.value })} placeholder="Texto complementar" />
                  </>}
                  {['chat', 'events', 'socials', 'poll', 'leaderboard'].includes(selectedSource.widgetKind ?? '') && <>
                    <label className="field-label" htmlFor="widget-items">Itens do widget</label>
                    <textarea id="widget-items" className="text-input textarea-input widget-items-input" rows={6} maxLength={3000} value={selectedSource.widgetItems ?? ''} onChange={(event) => updateSelected({ widgetItems: event.target.value })} placeholder={selectedSource.widgetKind === 'chat' ? 'Nome: mensagem (uma por linha)' : selectedSource.widgetKind === 'poll' ? 'Opção | votos' : selectedSource.widgetKind === 'leaderboard' ? 'Nome | valor (uma linha por apoiador)' : 'Tipo · nome · valor'} />
                    <p className="field-hint">Uma linha para cada item. Os dados serão exibidos como exemplos locais.</p>
                  </>}
                  {['goal', 'viewer', 'alert', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? '') && <>
                    <label className="field-label" htmlFor="widget-value">{selectedSource.widgetKind === 'goal' ? 'Valor atual' : selectedSource.widgetKind === 'tip-jar' ? 'Total arrecadado (R$)' : selectedSource.widgetKind === 'stream-boss' ? 'Vida atual do chefe (%)' : selectedSource.widgetKind === 'viewer' ? 'Espectadores (exemplo)' : 'Nome do evento (exemplo)'}</label>
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
                  {selectedSource.widgetKind === 'alert' && <button className="wide-action test-alert-button" type="button" onClick={() => setAlertTestTokens((current) => ({ ...current, [selectedSource.id]: (current[selectedSource.id] ?? 0) + 1 }))}>✦ Testar alerta</button>}
                </>}
              </div>}

              {elementSection === 'style' && <div className="property-fields">
                {selectedSource.type === 'text' && <>
                  <p className="eyebrow section-eyebrow">TIPOGRAFIA</p>
                  <label className="field-label" htmlFor="source-font-size">Tamanho do texto</label>
                  <div className="range-row"><input id="source-font-size" type="range" min="8" max="160" value={selectedSource.fontSize ?? 30} onChange={(event) => updateSelected({ fontSize: Number(event.target.value) })} /><span>{selectedSource.fontSize ?? 30}px</span></div>
                  <label className="field-label" htmlFor="source-color">Cor do texto</label>
                  <ColorField id="source-color" value={selectedSource.color ?? '#ffffff'} onChange={(color) => updateSelected({ color })} />
                  <label className="field-label" htmlFor="source-font-family">Família tipográfica</label>
                  <input id="source-font-family" className="text-input" list="font-family-presets" value={selectedSource.fontFamily ?? 'Inter, system-ui, sans-serif'} onChange={(event) => updateSelected({ fontFamily: event.target.value })} placeholder="Ex.: Arial, sans-serif" />
                  <datalist id="font-family-presets"><option value="Inter, system-ui, sans-serif" /><option value="Arial, Helvetica, sans-serif" /><option value="Georgia, serif" /><option value="'Trebuchet MS', sans-serif" /><option value="'Courier New', monospace" /><option value="Impact, sans-serif" /><option value="system-ui, sans-serif" /></datalist>
                  <label className="field-label" htmlFor="source-font-url">Importar fonte por link</label>
                  <input id="source-font-url" className="text-input" type="url" value={selectedSource.fontUrl ?? ''} onChange={(event) => updateSelected({ fontUrl: event.target.value })} placeholder="https://fonts.googleapis.com/css2?..." />
                  <button className="wide-action" type="button" onClick={applyFontUrl}>Carregar fonte do link</button>
                  <p className="field-hint">Aceita URL CSS do Google Fonts ou arquivo .woff2/.woff/.ttf/.otf. O servidor precisa permitir acesso externo (CORS para arquivos de fonte).</p>
                  <label className="field-label" htmlFor="source-font-weight">Peso</label>
                  <select id="source-font-weight" className="text-input" value={selectedSource.fontWeight ?? 750} onChange={(event) => updateSelected({ fontWeight: Number(event.target.value) })}><option value="300">Leve</option><option value="400">Normal</option><option value="500">Médio</option><option value="600">Seminegrito</option><option value="700">Negrito</option><option value="750">Seminegrito alto</option><option value="800">Extra negrito</option><option value="900">Preto</option></select>
                  <label className="field-label" htmlFor="source-align">Alinhamento do texto</label>
                  <select id="source-align" className="text-input" value={selectedSource.textAlign ?? 'left'} onChange={(event) => updateSelected({ textAlign: event.target.value as 'left' | 'center' | 'right' })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select>
                  <label className="field-label" htmlFor="source-line-height">Altura de linha</label>
                  <div className="range-row"><input id="source-line-height" type="range" min="0.8" max="2" step="0.05" value={selectedSource.lineHeight ?? 1.12} onChange={(event) => updateSelected({ lineHeight: Number(event.target.value) })} /><span>{(selectedSource.lineHeight ?? 1.12).toFixed(2)}</span></div>
                  <label className="field-label" htmlFor="source-spacing">Espaçamento entre letras</label>
                  <div className="range-row"><input id="source-spacing" type="range" min="-4" max="12" step="0.5" value={selectedSource.letterSpacing ?? -0.5} onChange={(event) => updateSelected({ letterSpacing: Number(event.target.value) })} /><span>{selectedSource.letterSpacing ?? -0.5}px</span></div>
                  <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.italic)} onChange={(event) => updateSelected({ italic: event.target.checked })} /><span>Itálico</span></label>
                  <label className="field-label" htmlFor="source-text-transform">Transformação do texto</label><select id="source-text-transform" className="text-input" value={selectedSource.textTransform ?? 'none'} onChange={(event) => updateSelected({ textTransform: event.target.value as SceneSource['textTransform'] })}><option value="none">Como digitado</option><option value="uppercase">MAIÚSCULAS</option><option value="lowercase">minúsculas</option><option value="capitalize">Primeira Letra Maiúscula</option></select>
                  <label className="field-label" htmlFor="source-text-decoration">Decoração do texto</label><select id="source-text-decoration" className="text-input" value={selectedSource.textDecoration ?? 'none'} onChange={(event) => updateSelected({ textDecoration: event.target.value as SceneSource['textDecoration'] })}><option value="none">Nenhuma</option><option value="underline">Sublinhado</option><option value="line-through">Tachado</option></select>
                  <label className="lock-toggle"><input type="checkbox" checked={selectedSource.textShadowEnabled !== false} onChange={(event) => updateSelected({ textShadowEnabled: event.target.checked })} /><span>Sombra nas letras</span></label>
                  <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.textBackground)} onChange={(event) => updateSelected({ textBackground: event.target.checked })} /><span>Fundo atrás do texto</span></label>
                  {selectedSource.textBackground && <><label className="field-label" htmlFor="text-background-color">Cor do fundo do texto</label><ColorField id="text-background-color" value={selectedSource.textBackgroundColor ?? '#11121b'} onChange={(color) => updateSelected({ textBackgroundColor: color })} /></>}
                </>}
                {selectedSource.type === 'shape' && <>
                  <p className="eyebrow section-eyebrow">FORMA</p>
                  <label className="field-label" htmlFor="shape-color">Cor / preenchimento</label><ColorField id="shape-color" value={selectedSource.color ?? '#7772f2'} onChange={(color) => updateSelected({ color })} />
                  <label className="field-label" htmlFor="shape-radius">Arredondamento</label><div className="range-row"><input id="shape-radius" type="range" min="0" max="100" value={selectedSource.radius ?? 4} onChange={(event) => updateSelected({ radius: Number(event.target.value) })} /><span>{selectedSource.radius ?? 4}px</span></div>
                </>}
                {selectedSource.type === 'image' && <><p className="field-hint">Controle o corte, posição interna, borda e transparência desta imagem.</p><label className="field-label" htmlFor="image-fit-style">Ajuste</label><select id="image-fit-style" className="text-input" value={selectedSource.objectFit ?? 'contain'} onChange={(event) => updateSelected({ objectFit: event.target.value as 'contain' | 'cover' })}><option value="contain">Conter</option><option value="cover">Cobrir</option></select><label className="field-label" htmlFor="image-position-style">Posição dentro da moldura</label><select id="image-position-style" className="text-input" value={selectedSource.objectPosition ?? 'center center'} onChange={(event) => updateSelected({ objectPosition: event.target.value })}><option value="center center">Centro</option><option value="top center">Topo</option><option value="bottom center">Base</option><option value="left center">Esquerda</option><option value="right center">Direita</option><option value="top left">Superior esquerda</option><option value="top right">Superior direita</option><option value="bottom left">Inferior esquerda</option><option value="bottom right">Inferior direita</option></select></>}
                {selectedSource.type === 'widget' && <>
                  <p className="eyebrow section-eyebrow">TEMA DO WIDGET</p>
                  <label className="field-label" htmlFor="widget-theme">Estilo base</label>
                  <select id="widget-theme" className="text-input" value={selectedSource.widgetTheme ?? 'glass'} onChange={(event) => updateSelected({ widgetTheme: event.target.value as WidgetTheme })}><option value="glass">Vidro translúcido</option><option value="neon">Neon gamer</option><option value="minimal">Minimalista</option><option value="solid">Fundo sólido</option></select>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-accent">Cor de destaque</label><ColorField id="widget-accent" value={selectedSource.widgetAccent ?? '#8d85ff'} onChange={(widgetAccent) => updateSelected({ widgetAccent })} /></div><div><label className="field-label" htmlFor="widget-bg-color">Fundo personalizado</label><ColorField id="widget-bg-color" value={selectedSource.widgetBackgroundColor ?? '#141722'} onChange={(widgetBackgroundColor) => updateSelected({ widgetBackgroundColor })} /></div></div>
                  <label className="field-label" htmlFor="widget-bg-opacity">Opacidade do fundo</label><div className="range-row"><input id="widget-bg-opacity" type="range" min="0" max="1" step="0.05" value={selectedSource.widgetBackgroundOpacity ?? 0.92} onChange={(event) => updateSelected({ widgetBackgroundOpacity: Number(event.target.value) })} /><span>{Math.round((selectedSource.widgetBackgroundOpacity ?? 0.92) * 100)}%</span></div>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-text-color">Cor do conteúdo</label><ColorField id="widget-text-color" value={selectedSource.widgetTextColor ?? '#f2f3fb'} onChange={(widgetTextColor) => updateSelected({ widgetTextColor })} /></div><div><label className="field-label" htmlFor="widget-title-color">Cor dos títulos</label><ColorField id="widget-title-color" value={selectedSource.widgetTitleColor ?? '#ffffff'} onChange={(widgetTitleColor) => updateSelected({ widgetTitleColor })} /></div></div>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-border-color">Cor da borda</label><ColorField id="widget-border-color" value={selectedSource.widgetBorderColor ?? '#555779'} onChange={(widgetBorderColor) => updateSelected({ widgetBorderColor })} /></div><div><label className="field-label" htmlFor="widget-border-width">Espessura</label><input id="widget-border-width" className="text-input" type="number" min="0" max="12" value={selectedSource.widgetBorderWidth ?? 1} onChange={(event) => updateSelected({ widgetBorderWidth: clamp(Number(event.target.value) || 0, 0, 12) })} /></div></div>
                  <label className="field-label" htmlFor="widget-radius">Cantos arredondados</label><div className="range-row"><input id="widget-radius" type="range" min="0" max="80" value={selectedSource.widgetRadius ?? 12} onChange={(event) => updateSelected({ widgetRadius: Number(event.target.value) })} /><span>{selectedSource.widgetRadius ?? 12}px</span></div>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-padding">Espaço interno</label><input id="widget-padding" className="text-input" type="number" min="0" max="48" value={selectedSource.widgetPadding ?? 12} onChange={(event) => updateSelected({ widgetPadding: clamp(Number(event.target.value) || 0, 0, 48) })} /></div><div><label className="field-label" htmlFor="widget-gap">Espaço entre itens</label><input id="widget-gap" className="text-input" type="number" min="0" max="32" value={selectedSource.widgetGap ?? 8} onChange={(event) => updateSelected({ widgetGap: clamp(Number(event.target.value) || 0, 0, 32) })} /></div></div>
                  <label className="field-label" htmlFor="widget-font-family">Família tipográfica</label><input id="widget-font-family" className="text-input" value={selectedSource.widgetFontFamily ?? ''} onChange={(event) => updateSelected({ widgetFontFamily: event.target.value })} placeholder="Herdar padrão do widget" />
                  <label className="field-label" htmlFor="widget-font-url">Importar fonte para este widget por link</label><input id="widget-font-url" className="text-input" type="url" value={selectedSource.widgetFontUrl ?? ''} onChange={(event) => updateSelected({ widgetFontUrl: event.target.value })} placeholder="https://fonts.googleapis.com/css2?..." />
                  <button className="wide-action" type="button" onClick={applyWidgetFontUrl}>Carregar fonte do widget</button>
                  <label className="field-label" htmlFor="widget-motion">Animação</label><select id="widget-motion" className="text-input" value={selectedSource.widgetAnimation ?? 'subtle'} onChange={(event) => updateSelected({ widgetAnimation: event.target.value as SceneSource['widgetAnimation'] })}><option value="none">Sem animações</option><option value="subtle">Suave</option><option value="energetic">Mais chamativa</option></select>
                  <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetShowHeader !== false} onChange={(event) => updateSelected({ widgetShowHeader: event.target.checked })} /><span>Mostrar cabeçalho (quando suportado)</span></label>
                  <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.widgetCompact)} onChange={(event) => updateSelected({ widgetCompact: event.target.checked })} /><span>Modo compacto</span></label>
                  <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetShowIcon !== false} onChange={(event) => updateSelected({ widgetShowIcon: event.target.checked })} /><span>Mostrar ícones decorativos</span></label>
                  <div className="field-divider" />
                  <p className="eyebrow section-eyebrow">CSS PERSONALIZADO · AVANÇADO</p>
                  <label className="field-label" htmlFor="widget-custom-css">Declarações CSS</label><textarea id="widget-custom-css" className="text-input textarea-input" rows={4} maxLength={1200} value={selectedSource.widgetCustomCss ?? ''} onChange={(event) => updateSelected({ widgetCustomCss: event.target.value })} placeholder={'ex.: text-transform: uppercase;\nborder-style: dashed;\nletter-spacing: 0.05em;'} />
                  <p className="field-hint">Use declarações separadas por ponto e vírgula. Por segurança, seletores, scripts e regras globais não são aceitos.</p>
                </>}
                <div className="field-divider" />
                <p className="eyebrow section-eyebrow">ACABAMENTO DO ELEMENTO</p>
                <label className="field-label" htmlFor="source-opacity">Opacidade geral</label><div className="range-row"><input id="source-opacity" type="range" min="0" max="1" step="0.05" value={selectedSource.opacity ?? 1} onChange={(event) => updateSelected({ opacity: Number(event.target.value) })} /><span>{Math.round((selectedSource.opacity ?? 1) * 100)}%</span></div>
                <label className="field-label" htmlFor="source-border-width">Espessura da borda externa</label><div className="range-row"><input id="source-border-width" type="range" min="0" max="20" step="1" value={selectedSource.borderWidth ?? 0} onChange={(event) => updateSelected({ borderWidth: Number(event.target.value) })} /><span>{selectedSource.borderWidth ?? 0}px</span></div>
                <label className="field-label" htmlFor="source-border-color">Cor da borda externa</label><ColorField id="source-border-color" value={selectedSource.borderColor ?? '#ffffff'} onChange={(borderColor) => updateSelected({ borderColor })} />
                {selectedSource.type !== 'shape' && <><label className="field-label" htmlFor="source-radius-general">Arredondamento externo</label><div className="range-row"><input id="source-radius-general" type="range" min="0" max="100" step="1" value={selectedSource.radius ?? 4} onChange={(event) => updateSelected({ radius: Number(event.target.value) })} /><span>{selectedSource.radius ?? 4}px</span></div></>}
                <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.shadow)} onChange={(event) => updateSelected({ shadow: event.target.checked })} /><span>Sombra projetada</span></label>
                {selectedSource.type === 'camera' && <label className="lock-toggle"><input type="checkbox" checked={selectedSource.cameraMirror !== false} onChange={(event) => updateSelected({ cameraMirror: event.target.checked })} /><span>Espelhar webcam</span></label>}
              </div>}

              {elementSection === 'transform' && <div className="property-fields">
                <p className="eyebrow section-eyebrow">POSIÇÃO E TAMANHO · % DA TELA</p>
                <div className="geometry-grid">
                  <NumberField label="X" value={selectedSource.x} onChange={(x) => updateSelected({ x: clamp(x, 0, 100 - selectedSource.w) })} />
                  <NumberField label="Y" value={selectedSource.y} onChange={(y) => updateSelected({ y: clamp(y, 0, 100 - selectedSource.h) })} />
                  <NumberField label="Largura" value={selectedSource.w} onChange={(w) => updateSelected({ w: clamp(w, 4, 100 - selectedSource.x) })} />
                  <NumberField label="Altura" value={selectedSource.h} onChange={(h) => updateSelected({ h: clamp(h, 4, 100 - selectedSource.y) })} />
                </div>
                <label className="field-label" htmlFor="source-rotation">Rotação</label><div className="range-row"><input id="source-rotation" type="range" min="-180" max="180" step="1" value={selectedSource.rotation ?? 0} onChange={(event) => updateSelected({ rotation: Number(event.target.value) })} /><span>{selectedSource.rotation ?? 0}°</span></div>
                <label className="field-label">Alinhamento rápido</label>
                <div className="align-grid">
                  <button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('left')}>◧ Esquerda</button><button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('center-x')}>↔ Centro</button><button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('right')}>Direita ◨</button><button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('top')}>↑ Topo</button><button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('center-y')}>↕ Meio</button><button type="button" disabled={Boolean(selectedSource.locked)} onClick={() => alignSelected('bottom')}>Base ↓</button>
                </div>
                <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.locked)} onChange={(event) => updateSelected({ locked: event.target.checked })} /><span>Bloquear movimento no canvas</span></label>
                <div className="property-actions"><button className="wide-action" type="button" onClick={() => duplicateSource(selectedSource)}>Duplicar elemento</button><button className="wide-action danger-action" type="button" onClick={() => deleteSource(selectedSource.id)}>Excluir elemento</button></div>
              </div>}
            </div>
          </>}
        </div>}

        {inspectorTab === 'background' && <div className="scene-settings-panel background-settings-panel">
          <div className="properties-heading"><div><p className="eyebrow">CENA ATUAL</p><h3>Plano de fundo</h3></div><span className="property-type">{activeScene.name}</span></div>
          <label className="field-label" htmlFor="scene-background-mode">Tipo de fundo</label>
          <select id="scene-background-mode" className="text-input" value={activeScene.background?.mode ?? 'transparent'} onChange={(event) => updateScene({ background: { ...(activeScene.background ?? { color: '#25233a', color2: '#10121a', angle: 135 }), mode: event.target.value as BackgroundConfig['mode'] } })}><option value="transparent">Transparente (overlay)</option><option value="solid">Cor sólida</option><option value="gradient">Gradiente</option><option value="image">Imagem de fundo</option></select>
          {(activeScene.background?.mode === 'solid' || activeScene.background?.mode === 'gradient' || activeScene.background?.mode === 'image') && <><label className="field-label" htmlFor="scene-bg-color">Cor base</label><ColorField id="scene-bg-color" value={activeScene.background?.color ?? '#171923'} onChange={(color) => updateScene({ background: { ...(activeScene.background ?? { mode: 'solid', color2: '#10121a', angle: 135 }), color } })} /></>}
          {activeScene.background?.mode === 'gradient' && <><label className="field-label" htmlFor="scene-bg-color2">Segunda cor</label><ColorField id="scene-bg-color2" value={activeScene.background.color2 ?? '#10121a'} onChange={(color2) => updateScene({ background: { ...activeScene.background!, color2 } })} /><label className="field-label" htmlFor="scene-bg-angle">Ângulo do gradiente</label><div className="range-row"><input id="scene-bg-angle" type="range" min="0" max="360" value={activeScene.background.angle ?? 135} onChange={(event) => updateScene({ background: { ...activeScene.background!, angle: Number(event.target.value) } })} /><span>{activeScene.background.angle ?? 135}°</span></div></>}
          {activeScene.background?.mode === 'image' && <>
            <div className="background-import-card"><strong>{activeScene.background.imageSrc ? 'Imagem definida' : 'Nenhuma imagem selecionada'}</strong><small>Use arquivo local ou URL pública de imagem.</small><button className="wide-action" type="button" onClick={() => backgroundDesignInputRef.current?.click()}>Escolher imagem do computador</button></div>
            <label className="field-label" htmlFor="background-image-url">Ou usar link da imagem</label>
            <input id="background-image-url" className="text-input" type="url" value={backgroundUrlInput} onChange={(event) => setBackgroundUrlInput(event.target.value)} placeholder="https://site.com/imagem.webp" />
            <button className="wide-action" type="button" onClick={applyBackgroundUrl}>Aplicar link de imagem</button>
            <label className="field-label" htmlFor="background-image-fit">Preenchimento</label>
            <select id="background-image-fit" className="text-input" value={activeScene.background.imageFit ?? 'cover'} onChange={(event) => updateScene({ background: { ...activeScene.background!, imageFit: event.target.value as BackgroundConfig['imageFit'] } })}><option value="cover">Cobrir a tela (pode cortar)</option><option value="contain">Mostrar imagem inteira</option><option value="stretch">Esticar para preencher</option></select>
            <label className="field-label" htmlFor="background-image-position">Ponto de ancoragem</label>
            <select id="background-image-position" className="text-input" value={activeScene.background.imagePosition ?? 'center center'} onChange={(event) => updateScene({ background: { ...activeScene.background!, imagePosition: event.target.value } })}><option value="center center">Centro</option><option value="top center">Topo</option><option value="bottom center">Base</option><option value="left center">Esquerda</option><option value="right center">Direita</option><option value="top left">Superior esquerda</option><option value="top right">Superior direita</option><option value="bottom left">Inferior esquerda</option><option value="bottom right">Inferior direita</option></select>
            <label className="field-label" htmlFor="background-image-x">Posição horizontal da imagem</label><div className="range-row"><input id="background-image-x" type="range" min="0" max="100" value={backgroundPositionPercent(activeScene.background.imagePosition, 'x')} onChange={(event) => updateScene({ background: { ...activeScene.background!, imagePosition: `${event.target.value}% ${backgroundPositionPercent(activeScene.background?.imagePosition, 'y')}%` } })} /><span>{backgroundPositionPercent(activeScene.background.imagePosition, 'x')}%</span></div>
            <label className="field-label" htmlFor="background-image-y">Posição vertical da imagem</label><div className="range-row"><input id="background-image-y" type="range" min="0" max="100" value={backgroundPositionPercent(activeScene.background.imagePosition, 'y')} onChange={(event) => updateScene({ background: { ...activeScene.background!, imagePosition: `${backgroundPositionPercent(activeScene.background?.imagePosition, 'x')}% ${event.target.value}%` } })} /><span>{backgroundPositionPercent(activeScene.background.imagePosition, 'y')}%</span></div>
            <label className="field-label" htmlFor="background-image-opacity">Opacidade da imagem</label><div className="range-row"><input id="background-image-opacity" type="range" min="0" max="1" step="0.05" value={activeScene.background.imageOpacity ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, imageOpacity: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.imageOpacity ?? 1) * 100)}%</span></div>
            <div className="field-divider" />
            <label className="field-label" htmlFor="background-overlay-color">Cor de sobreposição</label><ColorField id="background-overlay-color" value={activeScene.background.overlayColor ?? '#000000'} onChange={(overlayColor) => updateScene({ background: { ...activeScene.background!, overlayColor } })} />
            <label className="field-label" htmlFor="background-overlay-opacity">Intensidade da sobreposição</label><div className="range-row"><input id="background-overlay-opacity" type="range" min="0" max="0.9" step="0.05" value={activeScene.background.overlayOpacity ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, overlayOpacity: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.overlayOpacity ?? 0) * 100)}%</span></div>
            {activeScene.background.imageSrc && <button className="wide-action danger-action" type="button" onClick={() => updateScene({ background: { ...activeScene.background!, mode: 'transparent', imageSrc: undefined, imageOpacity: 1, overlayOpacity: 0 } })}>Remover imagem de fundo</button>}
          </>}
          <p className="field-hint">O fundo é independente dos widgets. Um overlay transparente permite deixar o vídeo do jogo visível atrás da composição.</p>
        </div>}

        {inspectorTab === 'canvas' && <div className="scene-settings-panel canvas-settings-panel">
          <div className="properties-heading"><div><p className="eyebrow">CONFIGURAÇÃO</p><h3>Tela da cena</h3></div></div>
          <label className="field-label" htmlFor="scene-name">Nome da cena</label>
          <input id="scene-name" className="text-input" value={activeScene.name} maxLength={40} onChange={(event) => updateScene({ name: event.target.value })} />
          <label className="field-label" htmlFor="scene-resolution">Resolução</label>
          <select id="scene-resolution" className="text-input" value={`${activeScene.width ?? 1920}x${activeScene.height ?? 1080}`} onChange={(event) => { const [width, height] = event.target.value.split('x').map(Number); updateScene({ width, height }) }}><option value="1920x1080">Full HD · 1920 × 1080</option><option value="1280x720">HD · 1280 × 720</option><option value="1080x1920">Vertical · 1080 × 1920</option><option value="1080x1080">Quadrado · 1080 × 1080</option><option value="2560x1440">QHD · 2560 × 1440</option></select>
          <p className="field-hint">As posições são relativas à composição. Alterar a resolução preserva a localização proporcional dos elementos.</p>
          <div className="field-divider" />
          <button className="wide-action" type="button" onClick={() => setInspectorTab('background')}>Editar plano de fundo</button>
          <button className="wide-action" type="button" onClick={() => setInspectorTab('layers')}>Organizar camadas</button>
        </div>}
        <div className="inspector-footer"><span className="status-dot" /> {inspectorTab === 'element' ? 'Editando apenas o elemento selecionado' : inspectorTab === 'background' ? 'Fundo separado das camadas' : inspectorTab === 'canvas' ? 'Configurações da tela' : 'Camadas e widgets'}</div>
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
    <ExternalFontLoader project={project} />
    {activeScene.sources.filter((source) => source.visible).map((source, index) => <div key={source.id} className={`overlay-object overlay-${source.type} ${source.type === 'shape' ? `shape-${source.shapeKind ?? 'rectangle'}` : ''}`} style={sourceStyle(source, index)}>
      {source.type === 'text' && <span className="object-text" style={{ textTransform: source.textTransform ?? 'none', textDecoration: source.textDecoration ?? 'none', textShadow: source.textShadowEnabled === false ? 'none' : undefined }}>{source.text || source.name}</span>}
      {source.type === 'shape' && <span className={`shape-inner shape-inner-${source.shapeKind ?? 'rectangle'}`} style={{ background: source.color ?? '#7772f2', borderRadius: source.shapeKind === 'circle' ? '50%' : source.shapeKind === 'pill' ? '999px' : source.shapeKind === 'line' ? '999px' : `${source.radius ?? 4}px` }} />}
      {source.type === 'image' && source.src && <img src={source.src} alt={source.name} draggable={false} style={{ objectFit: source.objectFit ?? 'contain', objectPosition: source.objectPosition ?? 'center center' }} />}
      {source.type === 'browser' && <iframe className="browser-frame" title={source.name} src={getBrowserUrl(source.url)} sandbox="allow-scripts allow-forms allow-popups" referrerPolicy="no-referrer" loading="lazy" tabIndex={-1} />}
      {source.type === 'camera' && (cameraStream ? <video className="camera-video" autoPlay muted playsInline style={{ transform: source.cameraMirror === false ? 'none' : 'scaleX(-1)' }} ref={(element) => { if (element && element.srcObject !== cameraStream) element.srcObject = cameraStream }} /> : <div className="overlay-camera-placeholder" />)}
      {source.type === 'widget' && <WidgetContent source={source} />}
    </div>)}
  </div>
}

export default App
