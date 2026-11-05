import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ChangeEvent, CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, SyntheticEvent } from 'react'
import './App.css'

type WidgetKind = 'alert' | 'chat' | 'events' | 'goal' | 'latest' | 'socials' | 'countdown' | 'clock' | 'viewer' | 'ticker' | 'music' | 'poll' | 'sponsor' | 'webcam-frame' | 'live-badge' | 'tip-jar' | 'stream-boss' | 'leaderboard'
type WidgetTheme = 'glass' | 'neon' | 'minimal' | 'solid'
type SourceType = 'text' | 'shape' | 'camera' | 'image' | 'video' | 'capture' | 'browser' | 'widget'
type VideoClip = { id: string; name: string; src: string; start?: number; end?: number; trimEnabled?: boolean }
type SlideshowImage = { id: string; name: string; src: string };
type AnimatedThemeName = 'custom' | 'aurora' | 'stars' | 'cyber-grid' | 'waves' | 'gradient-flow' | 'matrix-rain' | 'liquid-lava' | 'bokeh' | 'sunset-clouds' | 'electric-pulse' | 'particles' | 'laser-grid' | 'deep-ocean' | 'prism';
type BackgroundConfig = { mode: 'transparent' | 'solid' | 'gradient' | 'image' | 'video' | 'screen' | 'animated' | 'slideshow'; color: string; color2: string; angle: number; animatedTheme?: AnimatedThemeName; animatedSpeed?: number; animatedIntensity?: number; animatedAccent?: string; animatedBlur?: number; animatedGlow?: number; animatedGrain?: number; animatedVignette?: number; animatedDensity?: number; animatedScale?: number; animatedDirection?: 'normal' | 'reverse' | 'alternate'; animatedLayers?: 'soft' | 'balanced' | 'rich'; animatedBrightness?: number; animatedContrast?: number; animatedSaturation?: number; animatedHueRotate?: number; animatedBlendMode?: 'normal' | 'screen' | 'multiply' | 'overlay' | 'lighten'; imageSrc?: string; slideshowImages?: SlideshowImage[]; slideshowIntervalSeconds?: number; slideshowTransition?: 'fade' | 'slide' | 'zoom' | 'blur' | 'none'; slideshowTransitionDuration?: number; slideshowLoop?: boolean; slideshowShuffle?: boolean; slideshowFit?: 'cover' | 'contain' | 'stretch'; slideshowPosition?: string; slideshowOpacity?: number; slideshowBrightness?: number; slideshowContrast?: number; slideshowSaturation?: number; slideshowHueRotate?: number; slideshowBlur?: number; slideshowZoom?: number; slideshowKenBurns?: boolean; slideshowOverlayColor?: string; slideshowOverlayOpacity?: number; imageFit?: 'cover' | 'contain' | 'stretch'; imagePosition?: string; imageOpacity?: number; videoSrc?: string; videoClips?: VideoClip[]; videoFit?: 'cover' | 'contain' | 'stretch'; videoPosition?: string; videoOpacity?: number; videoStart?: number; videoEnd?: number; videoTrimEnabled?: boolean; videoLoop?: boolean; videoMuted?: boolean; videoVolume?: number; videoPlaybackRate?: number; videoBrightness?: number; videoContrast?: number; videoSaturation?: number; videoHueRotate?: number; overlayColor?: string; overlayOpacity?: number }
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
  videoClips?: VideoClip[]
  objectFit?: 'contain' | 'cover'
  objectPosition?: string
  videoStart?: number
  videoEnd?: number
  videoTrimEnabled?: boolean
  videoLoop?: boolean
  videoMuted?: boolean
  videoVolume?: number
  videoPlaybackRate?: number
  videoBrightness?: number
  videoContrast?: number
  videoSaturation?: number
  videoHueRotate?: number
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
  widgetVariant?: string
  widgetTitle?: string
  widgetText?: string
  widgetValue?: string
  widgetTarget?: string
  widgetItems?: string
  widgetMaxItems?: number
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
  widgetShowBackground?: boolean
  widgetShowBorder?: boolean
  widgetShowShadow?: boolean
  widgetBackdropBlur?: number
  widgetFontSize?: number
  widgetFontWeight?: number
  widgetLineHeight?: number
  widgetLetterSpacing?: number
  widgetTitleSize?: number
  widgetTitleLetterSpacing?: number
  widgetTextAlign?: 'left' | 'center' | 'right'
  widgetBackgroundImage?: string
  widgetBackgroundImageFit?: 'cover' | 'contain' | 'stretch'
  widgetBackgroundImageOpacity?: number
  widgetBackgroundImagePosition?: string
  widgetSubtitleColor?: string
  widgetValueColor?: string
  widgetTrackColor?: string
  widgetFillColor?: string
  widgetItemBackgroundColor?: string
  widgetItemBorderColor?: string
  chatBubbleEnabled?: boolean
  chatBubbleColor?: string
  chatBubbleOpacity?: number
  chatBubbleRadius?: number
  chatBubblePaddingX?: number
  chatBubblePaddingY?: number
  chatBubbleBorderColor?: string
  chatBubbleBorderWidth?: number
  chatUsernameColorMode?: 'palette' | 'uniform'
  chatUsernameColor?: string
  chatNameColors?: string
  chatBubbleColors?: string
  chatLayout?: 'stacked' | 'inline'
  chatUsernamePlacement?: 'same-bubble' | 'separate'
  socialProfiles?: SocialProfile[]
  goalFreeLayout?: boolean
  goalPartEditMode?: boolean
  goalParts?: GoalPart[]
  frameOverlayImage?: string
  chatUsernamePill?: boolean
  chatUsernamePillColor?: string
  chatUsernamePillOpacity?: number
  chatUsernamePillRadius?: number
  chatUsernamePillPaddingX?: number
  chatUsernamePillPaddingY?: number
  chatUsernamePillBorderColor?: string
  chatUsernamePillBorderWidth?: number
  chatBubbleShadow?: boolean
  chatUsernameFontFamily?: string
  chatMessageFontFamily?: string
  chatUsernameFontWeight?: number
  chatMessageLineHeight?: number
  chatMessageColor?: string
  chatTimestampColor?: string
  chatUsernameFontSize?: number
  chatMessageFontSize?: number
  chatLineGap?: number
  chatShowInput?: boolean
  chatShowTimestamp?: boolean
  chatTextShadow?: boolean
  chatShowBadges?: boolean
  clockShowDate?: boolean
  clockShowSeconds?: boolean
  clock24h?: boolean
  clockDateFormat?: 'short' | 'long' | 'time'
  clockColor?: string
  clockDateColor?: string
  clockTextShadow?: boolean
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
const VIDEO_DB_NAME = 'webcam-overlay-media-v1'
const VIDEO_STORE_NAME = 'videos'
const MAX_IMAGE_BYTES = 1_500_000
// Vídeos são armazenados como Blob no IndexedDB; não ficam limitados pela quota pequena do localStorage.
const MAX_VIDEO_BYTES = 50_000_000
const MAX_VIDEO_BATCH_BYTES = 75_000_000
const MAX_VIDEO_PROJECT_BYTES = 75_000_000
const MAX_IMPORT_BATCH_BYTES = 1_500_000
const MAX_LOCAL_PROJECT_CHARS = 2_150_000
// O JSON exportado pode incluir vídeos em base64 para ser portátil entre computadores.
const MAX_PROJECT_JSON_CHARS = 125_000_000

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

type WidgetVariantOption = { value: string; label: string }
type SocialProfile = { id: string; platform: string; account: string; logoSrc?: string; logoUrl?: string; color?: string }
type GoalPartKind = 'title' | 'subtitle' | 'current' | 'separator' | 'target' | 'percent' | 'bar' | 'footer' | 'custom-text' | 'icon' | 'shape' | 'image'
type GoalPart = { id: string; type: GoalPartKind; label?: string; visible: boolean; x: number; y: number; w: number; h: number; color?: string; fontSize?: number; fontWeight?: number; align?: 'left' | 'center' | 'right'; verticalAlign?: 'top' | 'center' | 'bottom'; backgroundColor?: string; radius?: number; padding?: number; src?: string; shapeKind?: 'rectangle' | 'circle' | 'pill'; opacity?: number; rotation?: number; borderColor?: string; borderWidth?: number; fontFamily?: string; objectFit?: 'contain' | 'cover' | 'fill'; italic?: boolean; letterSpacing?: number; textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'; shadowEnabled?: boolean; shadowColor?: string; gradientEnabled?: boolean; gradientColor?: string; gradientAngle?: number }

// Variantes são presets visuais do mesmo widget: mantêm os mesmos dados e controles.
const WIDGET_VARIANTS: Record<WidgetKind, WidgetVariantOption[]> = {
  alert: [
    { value: 'default', label: 'Clássico' }, { value: 'banner', label: 'Banner horizontal' },
    { value: 'centered', label: 'Centralizado' }, { value: 'minimal', label: 'Minimalista' },
    { value: 'neon', label: 'Neon' }, { value: 'outline', label: 'Contorno' }, { value: 'compact', label: 'Compacto' },
  ],
  chat: [
    { value: 'default', label: 'Mensagens empilhadas' }, { value: 'plain', label: 'Só texto · sem balões' },
    { value: 'inline', label: 'Nome e mensagem na mesma linha' }, { value: 'compact', label: 'Compacto' },
    { value: 'soft-bubbles', label: 'Balões suaves' }, { value: 'neon', label: 'Neon' }, { value: 'outline', label: 'Contorno' },
  ],
  events: [
    { value: 'default', label: 'Lista clássica' }, { value: 'cards', label: 'Cartões' },
    { value: 'timeline', label: 'Linha do tempo' }, { value: 'horizontal', label: 'Faixa horizontal' },
    { value: 'compact', label: 'Compacto' }, { value: 'minimal', label: 'Minimalista' },
  ],
  goal: [
    { value: 'default', label: 'Barra clássica' }, { value: 'minimal', label: 'Minimalista' },
    { value: 'segmented', label: 'Barra segmentada' }, { value: 'milestones', label: 'Marcos de progresso' },
    { value: 'ring', label: 'Anel circular' }, { value: 'vertical', label: 'Barra vertical' },
    { value: 'stacked', label: 'Valores empilhados' }, { value: 'neon', label: 'Neon luminoso' },
    { value: 'outline', label: 'Contorno' },
  ],
  latest: [
    { value: 'default', label: 'Cartão clássico' }, { value: 'badge', label: 'Selo compacto' },
    { value: 'minimal', label: 'Só texto' }, { value: 'horizontal', label: 'Faixa horizontal' },
    { value: 'neon', label: 'Neon' }, { value: 'outline', label: 'Contorno' },
  ],
  socials: [
    { value: 'default', label: 'Lista horizontal' }, { value: 'chips', label: 'Etiquetas / chips' },
    { value: 'vertical', label: 'Lista vertical' }, { value: 'compact', label: 'Compacto' },
    { value: 'minimal', label: 'Minimalista' }, { value: 'outline', label: 'Contorno' },
  ],
  countdown: [
    { value: 'default', label: 'Clássico' }, { value: 'digital', label: 'Painel digital' },
    { value: 'minimal', label: 'Somente números' }, { value: 'pill', label: 'Pílula' },
    { value: 'poster', label: 'Cartaz central' }, { value: 'neon', label: 'Neon' },
  ],
  clock: [
    { value: 'default', label: 'Relógio clássico' }, { value: 'digital', label: 'Digital monoespaçado' },
    { value: 'minimal', label: 'Somente números' }, { value: 'pill', label: 'Pílula' }, { value: 'outline', label: 'Contorno' },
  ],
  viewer: [
    { value: 'default', label: 'Status e contagem' }, { value: 'pill', label: 'Selo arredondado' },
    { value: 'counter', label: 'Contador em destaque' }, { value: 'minimal', label: 'Minimalista' },
    { value: 'neon', label: 'Neon pulsante' }, { value: 'outline', label: 'Contorno' },
  ],
  ticker: [
    { value: 'default', label: 'Faixa rolante' }, { value: 'headline', label: 'Manchete' },
    { value: 'compact', label: 'Compacta' }, { value: 'neon', label: 'Neon' },
    { value: 'minimal', label: 'Sem fundo' }, { value: 'outline', label: 'Contorno' },
  ],
  music: [
    { value: 'default', label: 'Cartão de música' }, { value: 'compact', label: 'Compacto' },
    { value: 'minimal', label: 'Minimalista' }, { value: 'feature', label: 'Capa em destaque' },
    { value: 'neon', label: 'Neon' }, { value: 'outline', label: 'Contorno' },
  ],
  poll: [
    { value: 'default', label: 'Barras de votação' }, { value: 'cards', label: 'Cartões por opção' },
    { value: 'compact', label: 'Compacta' }, { value: 'horizontal', label: 'Opções lado a lado' },
    { value: 'minimal', label: 'Minimalista' }, { value: 'neon', label: 'Neon' },
  ],
  sponsor: [
    { value: 'default', label: 'Marca clássica' }, { value: 'badge', label: 'Selo de patrocinador' },
    { value: 'horizontal', label: 'Faixa horizontal' }, { value: 'minimal', label: 'Somente texto' },
    { value: 'neon', label: 'Neon' }, { value: 'outline', label: 'Contorno' },
  ],
  'webcam-frame': [
    { value: 'default', label: 'Cantos decorativos' }, { value: 'corners', label: 'Cantos finos' },
    { value: 'neon', label: 'Moldura neon' }, { value: 'minimal', label: 'Moldura discreta' }, { value: 'solid', label: 'Borda completa' },
    { value: 'double', label: 'Borda dupla' }, { value: 'gradient', label: 'Borda gradiente' },
    { value: 'pixel', label: 'Pixel / retrô' }, { value: 'hud', label: 'HUD gamer' }, { value: 'label-top', label: 'Etiqueta superior' },
    { value: 'bottom-bar', label: 'Faixa inferior' }, { value: 'soft-glow', label: 'Brilho suave' },
  ],
  'live-badge': [
    { value: 'default', label: 'Selo completo' }, { value: 'pill', label: 'Pílula' },
    { value: 'minimal', label: 'Somente indicador e título' }, { value: 'dot-only', label: 'Somente ponto' },
    { value: 'outline', label: 'Contorno' }, { value: 'neon', label: 'Neon' },
  ],
  'tip-jar': [
    { value: 'default', label: 'Jarra e progresso' }, { value: 'progress', label: 'Barra de progresso' },
    { value: 'compact', label: 'Compacto' }, { value: 'minimal', label: 'Somente valores' },
    { value: 'neon', label: 'Neon' }, { value: 'outline', label: 'Contorno' },
  ],
  'stream-boss': [
    { value: 'default', label: 'Barra de vida clássica' }, { value: 'health', label: 'Vida em destaque' },
    { value: 'arcade', label: 'Arcade' }, { value: 'compact', label: 'Compacto' },
    { value: 'minimal', label: 'Minimalista' }, { value: 'neon', label: 'Neon' },
  ],
  leaderboard: [
    { value: 'default', label: 'Ranking numerado' }, { value: 'cards', label: 'Cartões por pessoa' },
    { value: 'podium', label: 'Pódio para os três primeiros' }, { value: 'compact', label: 'Compacto' },
    { value: 'minimal', label: 'Minimalista' }, { value: 'neon', label: 'Neon' },
  ],
}

function parseLocalizedNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  let normalized = value.trim().replace(/[^0-9.,-]/g, '')
  if (!normalized) return fallback
  if (normalized.includes(',')) normalized = normalized.replace(/\./g, '').replace(',', '.')
  else if (/^-?\d{1,3}(?:\.\d{3})+$/.test(normalized)) normalized = normalized.replace(/\./g, '')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

function createDefaultGoalParts(): GoalPart[] {
  // Ponto de partida parecido com overlays de live: o progresso ocupa o fundo da faixa e os números ficam independentes sobre ele.
  return [
    { id: 'goal-bar', type: 'bar', label: 'Fundo e progresso', visible: true, x: 0, y: 0, w: 100, h: 100, fontSize: 12, color: '#ffffff', fontWeight: 700, align: 'left', radius: 0 },
    { id: 'goal-title', type: 'title', label: 'Título da meta', visible: true, x: 1.5, y: 0, w: 47, h: 100, fontSize: 13, color: '#ffffff', fontWeight: 900, align: 'left', italic: true, letterSpacing: -0.35, textTransform: 'uppercase' },
    { id: 'goal-current', type: 'current', label: 'Valor atual', visible: true, x: 49.5, y: 0, w: 18, h: 100, fontSize: 14, color: '#ffffff', fontWeight: 850, align: 'right' },
    { id: 'goal-separator', type: 'separator', label: '/', visible: true, x: 68, y: 0, w: 3, h: 100, fontSize: 13, color: '#d4d4dc', fontWeight: 700, align: 'center' },
    { id: 'goal-target', type: 'target', label: 'Meta', visible: true, x: 72, y: 0, w: 26.5, h: 100, fontSize: 14, color: '#ffffff', fontWeight: 850, align: 'right' },
    { id: 'goal-percent', type: 'percent', label: 'Percentual', visible: false, x: 79, y: 36, w: 21, h: 18, fontSize: 11, color: '#ffffff', fontWeight: 800, align: 'right' },
    { id: 'goal-footer', type: 'footer', label: 'Texto auxiliar', visible: false, x: 0, y: 79, w: 100, h: 18, fontSize: 9, color: '#b8b8c4', fontWeight: 500, align: 'left' },
  ]
}

function socialProfilesFromItems(items: string): SocialProfile[] {
  const lines = items.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  return lines.map((line, index) => {
    const separator = line.search(/[·|]/)
    const platform = (separator >= 0 ? line.slice(0, separator) : line.split(/\s+/)[0]).trim() || `Rede ${index + 1}`
    const account = (separator >= 0 ? line.slice(separator + 1) : line.slice(platform.length)).trim() || '@seuperfil'
    return { id: `social-${index + 1}`, platform, account }
  })
}

function getSocialProfiles(source: SceneSource): SocialProfile[] {
  if (Array.isArray(source.socialProfiles)) return source.socialProfiles
  const legacy = socialProfilesFromItems(source.widgetItems ?? '')
  return legacy.length ? legacy : [
    { id: 'social-twitch', platform: 'Twitch', account: '@seucanal' },
    { id: 'social-instagram', platform: 'Instagram', account: '@seuperfil' },
    { id: 'social-youtube', platform: 'YouTube', account: '@seucanal' },
  ]
}

function parseNamedColors(value: string | undefined): Record<string, string> {
  const output: Record<string, string> = {}
  for (const entry of (value ?? '').split(/\r?\n/)) {
    const match = entry.match(/^\s*([^=:#]+)\s*=\s*(#[0-9a-fA-F]{3,8})\s*$/)
    if (match) output[match[1].trim().toLowerCase()] = match[2]
  }
  return output
}

function getChatUserNames(items: string | undefined): string[] {
  const lines = (items ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const sample = lines.length ? lines : ['LuaGamer: Oi, chat!', 'PixelRider: Boa live!', 'nina: Qual é o jogo?', 'Gui: Cheguei agora']
  return [...new Set(sample.map((line) => {
    const separator = line.indexOf(':')
    return separator >= 0 ? line.slice(0, separator).trim() : ''
  }).filter(Boolean))].slice(0, 24)
}

const SOCIAL_LOGO_CATALOG: Record<string, { slug: string; color: string }> = {
  twitch: { slug: 'twitch', color: '9146FF' }, instagram: { slug: 'instagram', color: 'E4405F' },
  youtube: { slug: 'youtube', color: 'FF0033' }, tiktok: { slug: 'tiktok', color: 'FFFFFF' },
  discord: { slug: 'discord', color: '5865F2' }, kick: { slug: 'kick', color: '53FC18' },
  facebook: { slug: 'facebook', color: '0866FF' }, x: { slug: 'x', color: 'FFFFFF' }, twitter: { slug: 'x', color: 'FFFFFF' },
  spotify: { slug: 'spotify', color: '1DB954' }, reddit: { slug: 'reddit', color: 'FF4500' },
  patreon: { slug: 'patreon', color: 'FF424D' }, github: { slug: 'github', color: 'FFFFFF' }, steam: { slug: 'steam', color: 'FFFFFF' },
  threads: { slug: 'threads', color: 'FFFFFF' }, linkedin: { slug: 'linkedin', color: '0A66C2' },
  pinterest: { slug: 'pinterest', color: 'BD081C' }, telegram: { slug: 'telegram', color: '26A5E4' },
  whatsapp: { slug: 'whatsapp', color: '25D366' }, trovo: { slug: 'trovo', color: '1476FF' },
}

function suggestedSocialLogoUrl(platform: string): string | null {
  const normalized = platform.toLowerCase().replace(/[^a-z0-9]/g, '')
  const match = Object.entries(SOCIAL_LOGO_CATALOG).find(([name]) => normalized === name || normalized.includes(name))?.[1]
  return match ? `https://cdn.simpleicons.org/${match.slug}/${match.color}` : null
}

function socialGlyph(platform: string): string {
  const value = platform.toLowerCase()
  if (value.includes('twitch')) return '▣'
  if (value.includes('instagram')) return '◎'
  if (value.includes('youtube')) return '▶'
  if (value.includes('tiktok')) return '♪'
  if (value.includes('discord')) return '◈'
  if (value === 'x' || value.includes('twitter')) return '𝕏'
  if (value.includes('kick')) return 'K'
  if (value.includes('facebook')) return 'f'
  if (value.includes('spotify')) return '♫'
  return platform.trim().charAt(0).toUpperCase() || '↗'
}

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
  const allowedTypes: SourceType[] = ['text', 'shape', 'camera', 'image', 'video', 'capture', 'browser', 'widget']
  const allowedWidgetKinds = WIDGET_OPTIONS.map((option) => option.kind)
  if (candidate.version !== 1 || !Array.isArray(candidate.scenes) || candidate.scenes.length === 0 || candidate.scenes.length > 100) return false

  const sceneIds = new Set<string>()
  for (const scene of candidate.scenes) {
    if (!scene || typeof scene.id !== 'string' || !scene.id || sceneIds.has(scene.id) || typeof scene.name !== 'string' || !Array.isArray(scene.sources) || scene.sources.length > 250) return false
    sceneIds.add(scene.id)
    if (scene.width !== undefined && (!Number.isFinite(scene.width) || scene.width < 320 || scene.width > 3840)) return false
    if (scene.height !== undefined && (!Number.isFinite(scene.height) || scene.height < 320 || scene.height > 3840)) return false
    if (scene.background !== undefined && (!scene.background || !['transparent', 'solid', 'gradient', 'image', 'video', 'screen', 'animated', 'slideshow'].includes(scene.background.mode))) return false
    if (scene.background?.imageSrc !== undefined && typeof scene.background.imageSrc !== 'string') return false
    if (scene.background?.imageSrc && !isSafeImageSource(scene.background.imageSrc)) return false
    if (scene.background?.slideshowImages !== undefined && (!Array.isArray(scene.background.slideshowImages) || scene.background.slideshowImages.length > 20000 || scene.background.slideshowImages.some((image) => !image || typeof image.id !== 'string' || !image.id || typeof image.name !== 'string' || typeof image.src !== 'string' || !isSafeImageSource(image.src)))) return false
    if (scene.background?.slideshowIntervalSeconds !== undefined && (!Number.isFinite(scene.background.slideshowIntervalSeconds) || scene.background.slideshowIntervalSeconds < 1 || scene.background.slideshowIntervalSeconds > 3600)) return false
    if (scene.background?.slideshowTransitionDuration !== undefined && (!Number.isFinite(scene.background.slideshowTransitionDuration) || scene.background.slideshowTransitionDuration < 0 || scene.background.slideshowTransitionDuration > 10)) return false
    if (scene.background?.slideshowLoop !== undefined && typeof scene.background.slideshowLoop !== 'boolean') return false
    if (scene.background?.slideshowShuffle !== undefined && typeof scene.background.slideshowShuffle !== 'boolean') return false
    if (scene.background?.slideshowKenBurns !== undefined && typeof scene.background.slideshowKenBurns !== 'boolean') return false
    if (scene.background?.videoSrc !== undefined && typeof scene.background.videoSrc !== 'string') return false
    if (scene.background?.videoSrc && !isSafeVideoSource(scene.background.videoSrc)) return false
    if (scene.background?.videoClips !== undefined && (!Array.isArray(scene.background.videoClips) || scene.background.videoClips.length < 1 || scene.background.videoClips.length > 40 || scene.background.videoClips.some((clip) => !clip || typeof clip.id !== 'string' || !clip.id || typeof clip.name !== 'string' || typeof clip.src !== 'string' || !isSafeVideoSource(clip.src) || (clip.start !== undefined && (!Number.isFinite(clip.start) || clip.start < 0 || clip.start > 3600)) || (clip.end !== undefined && (!Number.isFinite(clip.end) || clip.end < 0 || clip.end > 3600)) || (clip.trimEnabled !== undefined && typeof clip.trimEnabled !== 'boolean')))) return false
    if (scene.background?.videoStart !== undefined && (!Number.isFinite(scene.background.videoStart) || scene.background.videoStart < 0 || scene.background.videoStart > 3600)) return false
    if (scene.background?.videoEnd !== undefined && (!Number.isFinite(scene.background.videoEnd) || scene.background.videoEnd < 0 || scene.background.videoEnd > 3600)) return false
    if (scene.background?.videoTrimEnabled !== undefined && typeof scene.background.videoTrimEnabled !== 'boolean') return false
    if (scene.background?.videoLoop !== undefined && typeof scene.background.videoLoop !== 'boolean') return false
    if (scene.background?.videoMuted !== undefined && typeof scene.background.videoMuted !== 'boolean') return false
    if (scene.background?.videoVolume !== undefined && (!Number.isFinite(scene.background.videoVolume) || scene.background.videoVolume < 0 || scene.background.videoVolume > 1)) return false
    if (scene.background?.videoPlaybackRate !== undefined && (!Number.isFinite(scene.background.videoPlaybackRate) || scene.background.videoPlaybackRate < 0.25 || scene.background.videoPlaybackRate > 2)) return false
    if (scene.background?.videoBrightness !== undefined && (!Number.isFinite(scene.background.videoBrightness) || scene.background.videoBrightness < 0 || scene.background.videoBrightness > 2)) return false
    if (scene.background?.videoContrast !== undefined && (!Number.isFinite(scene.background.videoContrast) || scene.background.videoContrast < 0 || scene.background.videoContrast > 2)) return false
    if (scene.background?.videoSaturation !== undefined && (!Number.isFinite(scene.background.videoSaturation) || scene.background.videoSaturation < 0 || scene.background.videoSaturation > 2)) return false
    if (scene.background?.videoHueRotate !== undefined && (!Number.isFinite(scene.background.videoHueRotate) || scene.background.videoHueRotate < 0 || scene.background.videoHueRotate > 360)) return false

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
      if (source.type === 'video' && source.src && !isSafeVideoSource(source.src)) return false
      if (source.videoClips !== undefined && (!Array.isArray(source.videoClips) || source.videoClips.length < 1 || source.videoClips.length > 40 || source.videoClips.some((clip) => !clip || typeof clip.id !== 'string' || !clip.id || typeof clip.name !== 'string' || typeof clip.src !== 'string' || !isSafeVideoSource(clip.src) || (clip.start !== undefined && (!Number.isFinite(clip.start) || clip.start < 0 || clip.start > 3600)) || (clip.end !== undefined && (!Number.isFinite(clip.end) || clip.end < 0 || clip.end > 3600)) || (clip.trimEnabled !== undefined && typeof clip.trimEnabled !== 'boolean')))) return false
      if (source.videoStart !== undefined && (!Number.isFinite(source.videoStart) || source.videoStart < 0 || source.videoStart > 3600)) return false
      if (source.videoEnd !== undefined && (!Number.isFinite(source.videoEnd) || source.videoEnd < 0 || source.videoEnd > 3600)) return false
      if (source.videoTrimEnabled !== undefined && typeof source.videoTrimEnabled !== 'boolean') return false
      if (source.videoLoop !== undefined && typeof source.videoLoop !== 'boolean') return false
      if (source.videoMuted !== undefined && typeof source.videoMuted !== 'boolean') return false
      if (source.videoVolume !== undefined && (!Number.isFinite(source.videoVolume) || source.videoVolume < 0 || source.videoVolume > 1)) return false
      if (source.videoPlaybackRate !== undefined && (!Number.isFinite(source.videoPlaybackRate) || source.videoPlaybackRate < 0.25 || source.videoPlaybackRate > 2)) return false
      if (source.videoBrightness !== undefined && (!Number.isFinite(source.videoBrightness) || source.videoBrightness < 0 || source.videoBrightness > 2)) return false
      if (source.videoContrast !== undefined && (!Number.isFinite(source.videoContrast) || source.videoContrast < 0 || source.videoContrast > 2)) return false
      if (source.videoSaturation !== undefined && (!Number.isFinite(source.videoSaturation) || source.videoSaturation < 0 || source.videoSaturation > 2)) return false
      if (source.videoHueRotate !== undefined && (!Number.isFinite(source.videoHueRotate) || source.videoHueRotate < 0 || source.videoHueRotate > 360)) return false
      if (source.fontUrl !== undefined && typeof source.fontUrl !== 'string') return false
      if (source.widgetFontUrl !== undefined && typeof source.widgetFontUrl !== 'string') return false
      if (source.widgetBackgroundImage !== undefined && typeof source.widgetBackgroundImage !== 'string') return false
      if (source.widgetBackgroundImage && !isSafeImageSource(source.widgetBackgroundImage)) return false
      if (source.chatNameColors !== undefined && typeof source.chatNameColors !== 'string') return false
      if (source.chatBubbleColors !== undefined && typeof source.chatBubbleColors !== 'string') return false
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
        ...(source.videoClips ? { videoClips: source.videoClips.slice(0, 40).map((clip) => ({ ...clip, name: clip.name.slice(0, 140), start: clamp(Number.isFinite(clip.start) ? Number(clip.start) : 0, 0, 3600), end: clamp(Number.isFinite(clip.end) ? Number(clip.end) : 0, 0, 3600), trimEnabled: clip.trimEnabled === true })) } : {}),
        ...(source.type === 'video' ? {
          videoStart: clamp(Number.isFinite(source.videoStart) ? Number(source.videoStart) : 0, 0, 3600),
          videoEnd: clamp(Number.isFinite(source.videoEnd) ? Number(source.videoEnd) : 0, 0, 3600),
          videoTrimEnabled: source.videoTrimEnabled === true,
          videoLoop: source.videoLoop !== false,
          videoMuted: source.videoMuted !== false,
          videoVolume: clamp(Number.isFinite(source.videoVolume) ? Number(source.videoVolume) : 0.8, 0, 1),
          videoPlaybackRate: clamp(Number.isFinite(source.videoPlaybackRate) ? Number(source.videoPlaybackRate) : 1, 0.25, 2),
          videoBrightness: clamp(Number.isFinite(source.videoBrightness) ? Number(source.videoBrightness) : 1, 0, 2),
          videoContrast: clamp(Number.isFinite(source.videoContrast) ? Number(source.videoContrast) : 1, 0, 2),
          videoSaturation: clamp(Number.isFinite(source.videoSaturation) ? Number(source.videoSaturation) : 1, 0, 2),
          videoHueRotate: clamp(Number.isFinite(source.videoHueRotate) ? Number(source.videoHueRotate) : 0, 0, 360),
        } : {}),
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
        widgetItems: typeof source.widgetItems === 'string' ? source.widgetItems.slice(0, 3000) : undefined,
        ...(Array.isArray(source.socialProfiles) ? { socialProfiles: source.socialProfiles.filter((profile) => profile && typeof profile.id === 'string' && typeof profile.platform === 'string' && typeof profile.account === 'string').slice(0, 30).map((profile) => ({ id: profile.id.slice(0, 100), platform: profile.platform.slice(0, 60), account: profile.account.slice(0, 100), ...(typeof profile.logoSrc === 'string' && profile.logoSrc.length < MAX_IMAGE_BYTES * 1.5 && isSafeImageSource(profile.logoSrc) ? { logoSrc: profile.logoSrc } : {}), ...(typeof profile.logoUrl === 'string' && isSafeImageSource(profile.logoUrl) ? { logoUrl: profile.logoUrl.slice(0, 1000) } : {}), ...(typeof profile.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(profile.color) ? { color: profile.color } : {}) })) } : {}),
        ...(Array.isArray(source.goalParts) ? { goalParts: source.goalParts.filter((part) => part && typeof part.id === 'string' && ['title','subtitle','current','separator','target','percent','bar','footer','custom-text','icon','shape','image'].includes(part.type)).slice(0, 100).map((part) => ({ ...part, id: part.id.slice(0, 80), label: typeof part.label === 'string' ? part.label.slice(0, 300) : '', visible: part.visible !== false, x: clamp(Number(part.x) || 0, 0, 99), y: clamp(Number(part.y) || 0, 0, 99), w: clamp(Number(part.w) || 10, 1, 100 - clamp(Number(part.x) || 0, 0, 99)), h: clamp(Number(part.h) || 10, 1, 100 - clamp(Number(part.y) || 0, 0, 99)), fontSize: clamp(Number(part.fontSize) || 13, 6, 80), fontWeight: clamp(Number(part.fontWeight) || 700, 100, 900), color: typeof part.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(part.color) ? part.color : '#ffffff', ...(typeof part.src === 'string' && part.src.length <= MAX_IMAGE_BYTES * 1.5 && isSafeImageSource(part.src) ? { src: part.src } : {}), ...(typeof part.shapeKind === 'string' && ['rectangle','circle','pill'].includes(part.shapeKind) ? { shapeKind: part.shapeKind as GoalPart['shapeKind'] } : {}), opacity: clamp(Number.isFinite(part.opacity) ? Number(part.opacity) : 1, 0, 1), rotation: clamp(Number.isFinite(part.rotation) ? Number(part.rotation) : 0, -180, 180), borderWidth: clamp(Number.isFinite(part.borderWidth) ? Number(part.borderWidth) : 0, 0, 12), ...(typeof part.borderColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(part.borderColor) ? { borderColor: part.borderColor } : {}), ...(typeof part.fontFamily === 'string' ? { fontFamily: part.fontFamily.slice(0, 120) } : {}), ...(typeof part.objectFit === 'string' && ['contain','cover','fill'].includes(part.objectFit) ? { objectFit: part.objectFit as GoalPart['objectFit'] } : {}), ...(typeof part.verticalAlign === 'string' && ['top','center','bottom'].includes(part.verticalAlign) ? { verticalAlign: part.verticalAlign as GoalPart['verticalAlign'] } : {}), italic: part.italic === true, letterSpacing: clamp(Number.isFinite(part.letterSpacing) ? Number(part.letterSpacing) : 0, -5, 30), ...(typeof part.textTransform === 'string' && ['none','uppercase','lowercase','capitalize'].includes(part.textTransform) ? { textTransform: part.textTransform as GoalPart['textTransform'] } : {}), shadowEnabled: part.shadowEnabled === true, ...(typeof part.shadowColor === 'string' && /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(part.shadowColor) ? { shadowColor: part.shadowColor } : {}), gradientEnabled: part.gradientEnabled === true, ...(typeof part.gradientColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(part.gradientColor) ? { gradientColor: part.gradientColor } : {}), gradientAngle: clamp(Number.isFinite(part.gradientAngle) ? Number(part.gradientAngle) : 135, 0, 360) })) } : {}),
        ...(typeof source.frameOverlayImage === 'string' && source.frameOverlayImage.length < MAX_IMAGE_BYTES * 1.5 && isSafeImageSource(source.frameOverlayImage) ? { frameOverlayImage: source.frameOverlayImage } : {}),
        ...(source.type === 'widget' ? {
          widgetShowBackground: source.widgetShowBackground ?? !['chat', 'clock'].includes(source.widgetKind ?? ''),
          widgetShowBorder: source.widgetShowBorder ?? !['chat', 'clock'].includes(source.widgetKind ?? ''),
          widgetShowShadow: source.widgetShowShadow ?? !['chat', 'clock'].includes(source.widgetKind ?? ''),
          widgetBackdropBlur: clamp(Number.isFinite(source.widgetBackdropBlur) ? Number(source.widgetBackdropBlur) : (source.widgetTheme === 'glass' && !['chat', 'clock'].includes(source.widgetKind ?? '') ? 8 : 0), 0, 30),
          widgetShowHeader: source.widgetShowHeader ?? !['chat', 'clock'].includes(source.widgetKind ?? ''),
          ...(source.widgetKind === 'chat' ? {
            chatBubbleEnabled: source.chatBubbleEnabled ?? true,
            chatBubbleColor: source.chatBubbleColor ?? '#e979b2',
            chatBubbleOpacity: clamp(Number.isFinite(source.chatBubbleOpacity) ? Number(source.chatBubbleOpacity) : 0.88, 0, 1),
            chatShowInput: source.chatShowInput ?? false,
            chatUsernamePlacement: source.chatUsernamePlacement ?? 'separate',
          } : {}),
          ...(source.widgetKind === 'clock' ? {
            clockShowDate: source.clockShowDate ?? false,
            clockShowSeconds: source.clockShowSeconds ?? true,
            clock24h: source.clock24h ?? true,
            clockTextShadow: source.clockTextShadow ?? false,
          } : {}),
        } : {}),
        widgetKind: source.type === 'widget' ? ((knownWidget ? source.widgetKind : undefined) ?? 'goal') : source.widgetKind,
      }
    })
    const rawBackground = scene.background
    const background: BackgroundConfig = {
      mode: rawBackground && ['transparent', 'solid', 'gradient', 'image', 'video', 'screen', 'animated', 'slideshow'].includes(rawBackground.mode) ? rawBackground.mode : 'transparent',
      animatedTheme: (['custom', 'stars', 'cyber-grid', 'waves', 'gradient-flow', 'matrix-rain', 'liquid-lava', 'bokeh', 'sunset-clouds', 'electric-pulse', 'particles', 'laser-grid', 'deep-ocean', 'prism'].includes(rawBackground?.animatedTheme ?? '') ? rawBackground?.animatedTheme : 'aurora') as AnimatedThemeName,
      animatedSpeed: clamp(Number.isFinite(rawBackground?.animatedSpeed) ? Number(rawBackground?.animatedSpeed) : 1, 0.25, 3),
      animatedIntensity: clamp(Number.isFinite(rawBackground?.animatedIntensity) ? Number(rawBackground?.animatedIntensity) : 0.75, 0, 1),
      animatedAccent: typeof rawBackground?.animatedAccent === 'string' ? rawBackground.animatedAccent : '#8d85ff',
      animatedBlur: clamp(Number.isFinite(rawBackground?.animatedBlur) ? Number(rawBackground?.animatedBlur) : 26, 0, 80),
      animatedGlow: clamp(Number.isFinite(rawBackground?.animatedGlow) ? Number(rawBackground?.animatedGlow) : 0.7, 0, 1),
      animatedGrain: clamp(Number.isFinite(rawBackground?.animatedGrain) ? Number(rawBackground?.animatedGrain) : 0.08, 0, 0.3),
      animatedVignette: clamp(Number.isFinite(rawBackground?.animatedVignette) ? Number(rawBackground?.animatedVignette) : 0.25, 0, 1),
      animatedDensity: clamp(Number.isFinite(rawBackground?.animatedDensity) ? Number(rawBackground?.animatedDensity) : 1, 0.25, 3),
      animatedScale: clamp(Number.isFinite(rawBackground?.animatedScale) ? Number(rawBackground?.animatedScale) : 1, 0.5, 2),
      animatedDirection: rawBackground?.animatedDirection === 'reverse' || rawBackground?.animatedDirection === 'normal' ? rawBackground.animatedDirection : 'alternate',
      animatedLayers: rawBackground?.animatedLayers === 'soft' || rawBackground?.animatedLayers === 'rich' ? rawBackground.animatedLayers : 'balanced',
      animatedBrightness: clamp(Number.isFinite(rawBackground?.animatedBrightness) ? Number(rawBackground?.animatedBrightness) : 1, 0, 2),
      animatedContrast: clamp(Number.isFinite(rawBackground?.animatedContrast) ? Number(rawBackground?.animatedContrast) : 1, 0, 2),
      animatedSaturation: clamp(Number.isFinite(rawBackground?.animatedSaturation) ? Number(rawBackground?.animatedSaturation) : 1, 0, 3),
      animatedHueRotate: clamp(Number.isFinite(rawBackground?.animatedHueRotate) ? Number(rawBackground?.animatedHueRotate) : 0, 0, 360),
      animatedBlendMode: ['screen', 'multiply', 'overlay', 'lighten'].includes(rawBackground?.animatedBlendMode ?? '') ? rawBackground?.animatedBlendMode as BackgroundConfig['animatedBlendMode'] : 'normal',
      color: typeof rawBackground?.color === 'string' ? rawBackground.color : '#171923',
      color2: typeof rawBackground?.color2 === 'string' ? rawBackground.color2 : '#28243c',
      angle: clamp(Number.isFinite(rawBackground?.angle) ? Number(rawBackground?.angle) : 135, 0, 360),
      slideshowImages: Array.isArray(rawBackground?.slideshowImages) ? rawBackground.slideshowImages.filter((image) => image && typeof image.id === 'string' && typeof image.name === 'string' && typeof image.src === 'string' && isSafeImageSource(image.src)).map((image) => ({ id: image.id.slice(0, 100), name: image.name.slice(0, 180), src: image.src })) : [],
      slideshowIntervalSeconds: clamp(Number.isFinite(rawBackground?.slideshowIntervalSeconds) ? Number(rawBackground?.slideshowIntervalSeconds) : 10, 1, 3600),
      slideshowTransition: (['slide', 'zoom', 'blur', 'none'].includes(rawBackground?.slideshowTransition ?? '') ? rawBackground?.slideshowTransition : 'fade') as NonNullable<BackgroundConfig['slideshowTransition']>,
      slideshowTransitionDuration: clamp(Number.isFinite(rawBackground?.slideshowTransitionDuration) ? Number(rawBackground?.slideshowTransitionDuration) : 1.2, 0, 10),
      slideshowLoop: rawBackground?.slideshowLoop !== false,
      slideshowShuffle: rawBackground?.slideshowShuffle === true,
      slideshowFit: rawBackground?.slideshowFit === 'contain' || rawBackground?.slideshowFit === 'stretch' ? rawBackground.slideshowFit : 'cover',
      slideshowPosition: typeof rawBackground?.slideshowPosition === 'string' ? rawBackground.slideshowPosition.slice(0, 40) : 'center center',
      slideshowOpacity: clamp(Number.isFinite(rawBackground?.slideshowOpacity) ? Number(rawBackground?.slideshowOpacity) : 1, 0, 1),
      slideshowBrightness: clamp(Number.isFinite(rawBackground?.slideshowBrightness) ? Number(rawBackground?.slideshowBrightness) : 1, 0, 2),
      slideshowContrast: clamp(Number.isFinite(rawBackground?.slideshowContrast) ? Number(rawBackground?.slideshowContrast) : 1, 0, 2),
      slideshowSaturation: clamp(Number.isFinite(rawBackground?.slideshowSaturation) ? Number(rawBackground?.slideshowSaturation) : 1, 0, 2),
      slideshowHueRotate: clamp(Number.isFinite(rawBackground?.slideshowHueRotate) ? Number(rawBackground?.slideshowHueRotate) : 0, 0, 360),
      slideshowBlur: clamp(Number.isFinite(rawBackground?.slideshowBlur) ? Number(rawBackground?.slideshowBlur) : 0, 0, 20),
      slideshowZoom: clamp(Number.isFinite(rawBackground?.slideshowZoom) ? Number(rawBackground?.slideshowZoom) : 1, 0.8, 1.5),
      slideshowKenBurns: rawBackground?.slideshowKenBurns === true,
      slideshowOverlayColor: typeof rawBackground?.slideshowOverlayColor === 'string' ? rawBackground.slideshowOverlayColor : '#000000',
      slideshowOverlayOpacity: clamp(Number.isFinite(rawBackground?.slideshowOverlayOpacity) ? Number(rawBackground?.slideshowOverlayOpacity) : 0, 0, 1),
      imageSrc: typeof rawBackground?.imageSrc === 'string' && isSafeImageSource(rawBackground.imageSrc) ? rawBackground.imageSrc : undefined,
      imageFit: rawBackground?.imageFit === 'contain' || rawBackground?.imageFit === 'stretch' ? rawBackground.imageFit : 'cover',
      imagePosition: typeof rawBackground?.imagePosition === 'string' ? rawBackground.imagePosition.slice(0, 40) : 'center center',
      imageOpacity: clamp(Number.isFinite(rawBackground?.imageOpacity) ? Number(rawBackground?.imageOpacity) : 1, 0, 1),
      videoSrc: typeof rawBackground?.videoSrc === 'string' && isSafeVideoSource(rawBackground.videoSrc) ? rawBackground.videoSrc : undefined,
      videoFit: rawBackground?.videoFit === 'contain' || rawBackground?.videoFit === 'stretch' ? rawBackground.videoFit : 'cover',
      videoPosition: typeof rawBackground?.videoPosition === 'string' ? rawBackground.videoPosition.slice(0, 40) : 'center center',
      videoOpacity: clamp(Number.isFinite(rawBackground?.videoOpacity) ? Number(rawBackground?.videoOpacity) : 1, 0, 1),
      videoStart: clamp(Number.isFinite(rawBackground?.videoStart) ? Number(rawBackground?.videoStart) : 0, 0, 3600),
      videoEnd: clamp(Number.isFinite(rawBackground?.videoEnd) ? Number(rawBackground?.videoEnd) : 0, 0, 3600),
      videoTrimEnabled: rawBackground?.videoTrimEnabled === true,
      videoLoop: rawBackground?.videoLoop !== false,
      videoMuted: rawBackground?.videoMuted !== false,
      videoVolume: clamp(Number.isFinite(rawBackground?.videoVolume) ? Number(rawBackground?.videoVolume) : 0.8, 0, 1),
      videoPlaybackRate: clamp(Number.isFinite(rawBackground?.videoPlaybackRate) ? Number(rawBackground?.videoPlaybackRate) : 1, 0.25, 2),
      videoBrightness: clamp(Number.isFinite(rawBackground?.videoBrightness) ? Number(rawBackground?.videoBrightness) : 1, 0, 2),
      videoContrast: clamp(Number.isFinite(rawBackground?.videoContrast) ? Number(rawBackground?.videoContrast) : 1, 0, 2),
      videoSaturation: clamp(Number.isFinite(rawBackground?.videoSaturation) ? Number(rawBackground?.videoSaturation) : 1, 0, 2),
      videoHueRotate: clamp(Number.isFinite(rawBackground?.videoHueRotate) ? Number(rawBackground?.videoHueRotate) : 0, 0, 360),
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
    if (serialized.length > MAX_LOCAL_PROJECT_CHARS) return false
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

type StoredVideoAsset = { id: string; name: string; mimeType: string; blob: Blob; savedAt: number }

function openVideoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Este navegador não oferece armazenamento IndexedDB.'))
      return
    }
    const request = indexedDB.open(VIDEO_DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(VIDEO_STORE_NAME)) db.createObjectStore(VIDEO_STORE_NAME, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o armazenamento de mídia.'))
    request.onblocked = () => reject(new Error('O armazenamento de mídia está bloqueado por outra aba. Feche outras abas do Webcam_overlay e tente novamente.'))
  })
}

function saveVideoBlob(blob: Blob, name: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let db: IDBDatabase | undefined
    try {
      const extension = name.toLowerCase().split('.').pop() ?? ''
      const guessedMime: Record<string, string> = {
        mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg', ogg: 'video/ogg',
        mov: 'video/quicktime', '3gp': 'video/3gpp', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
        wmv: 'video/x-ms-wmv', mpeg: 'video/mpeg', mpg: 'video/mpeg', ts: 'video/mp2t', m2ts: 'video/mp2t',
        png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif',
      }
      const inferred = guessedMime[extension] ?? 'application/octet-stream'
      const mediaBlob = blob.type.startsWith('video/') || blob.type.startsWith('image/') ? blob : new Blob([blob], { type: inferred })
      db = await openVideoDatabase()
      const id = newId('asset')
      const transaction = db.transaction(VIDEO_STORE_NAME, 'readwrite')
      transaction.objectStore(VIDEO_STORE_NAME).put({ id, name: name.slice(0, 160), mimeType: mediaBlob.type || guessedMime[extension] || 'video/mp4', blob: mediaBlob, savedAt: Date.now() } satisfies StoredVideoAsset)
      transaction.oncomplete = () => { db?.close(); resolve(`idb-video://${id}`) }
      transaction.onerror = () => { db?.close(); reject(transaction.error ?? new Error('Não foi possível salvar o arquivo de vídeo.')) }
      transaction.onabort = () => { db?.close(); reject(transaction.error ?? new Error('O salvamento do vídeo foi cancelado.')) }
    } catch (error) {
      db?.close()
      reject(error)
    }
  })
}

function clearStoredVideoAssets(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let db: IDBDatabase | undefined
    try {
      db = await openVideoDatabase()
      const transaction = db.transaction(VIDEO_STORE_NAME, 'readwrite')
      transaction.objectStore(VIDEO_STORE_NAME).clear()
      transaction.oncomplete = () => { db?.close(); resolve() }
      transaction.onerror = () => { db?.close(); reject(transaction.error ?? new Error('Não foi possível limpar os vídeos locais.')) }
      transaction.onabort = () => { db?.close(); reject(transaction.error ?? new Error('A limpeza de vídeos foi cancelada.')) }
    } catch (error) {
      db?.close()
      reject(error)
    }
  })
}

function getVideoBlob(reference: string): Promise<Blob | null> {
  return new Promise(async (resolve, reject) => {
    let db: IDBDatabase | undefined
    try {
      const match = reference.match(/^idb-video:\/\/(.+)$/i)
      if (!match) { resolve(null); return }
      db = await openVideoDatabase()
      const transaction = db.transaction(VIDEO_STORE_NAME, 'readonly')
      const request = transaction.objectStore(VIDEO_STORE_NAME).get(match[1])
      request.onsuccess = () => {
        const record = request.result as StoredVideoAsset | undefined
        resolve(record?.blob instanceof Blob ? record.blob : null)
      }
      request.onerror = () => reject(request.error ?? new Error('Não foi possível recuperar o vídeo salvo.'))
      transaction.oncomplete = () => db?.close()
      transaction.onerror = () => { db?.close(); reject(transaction.error ?? new Error('Erro ao ler o vídeo salvo.')) }
    } catch (error) {
      db?.close()
      reject(error)
    }
  })
}

async function getProjectVideoBytes(project: Project): Promise<number> {
  let total = 0
  const countReference = async (reference?: string) => {
    if (!reference) return
    if (reference.startsWith('idb-video://')) {
      const blob = await getVideoBlob(reference)
      if (blob) total += blob.size
    } else if (reference.startsWith('data:video/')) {
      const comma = reference.indexOf(',')
      if (comma >= 0) {
        const payload = reference.slice(comma + 1)
        const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0
        total += Math.max(0, Math.floor(payload.length * 3 / 4) - padding)
      }
    }
  }
  for (const scene of project.scenes) {
    if (scene.background?.videoClips?.length) {
      for (const clip of scene.background.videoClips) await countReference(clip.src)
    } else {
      await countReference(scene.background?.videoSrc)
    }
    for (const source of scene.sources) {
      if (source.type !== 'video') continue
      if (source.videoClips?.length) {
        for (const clip of source.videoClips) await countReference(clip.src)
      } else {
        await countReference(source.src)
      }
    }
  }
  return total
}

function deleteVideoBlob(reference: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    let db: IDBDatabase | undefined
    try {
      const match = reference.match(/^idb-video:\/\/(.+)$/i)
      if (!match) { resolve(); return }
      db = await openVideoDatabase()
      const transaction = db.transaction(VIDEO_STORE_NAME, 'readwrite')
      transaction.objectStore(VIDEO_STORE_NAME).delete(match[1])
      transaction.oncomplete = () => { db?.close(); resolve() }
      transaction.onerror = () => { db?.close(); reject(transaction.error ?? new Error('Não foi possível remover o vídeo local.')) }
      transaction.onabort = () => { db?.close(); reject(transaction.error ?? new Error('A remoção do vídeo foi cancelada.')) }
    } catch (error) {
      db?.close()
      reject(error)
    }
  })
}

function dataUrlToBlob(dataUrl: string): Blob {
  const match = dataUrl.match(/^data:((?:video|image)\/[a-z0-9.+-]+);base64,([\s\S]*)$/i)
  if (!match) throw new Error('A mídia incorporada não tem um formato de dados válido.')
  const binary = atob(match[2])
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new Blob([bytes], { type: match[1] })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Não foi possível incluir o vídeo no arquivo exportado.'))
    reader.onerror = () => reject(new Error('Não foi possível incluir o vídeo no arquivo exportado.'))
    reader.readAsDataURL(blob)
  })
}

function localAssetIdForReference(reference: string): string {
  // Stable, path-safe identifier for a media data URL; content itself is stored only in the loopback relay.
  let first = 0x811c9dc5
  let second = 0x9e3779b9
  for (let index = 0; index < reference.length; index += 1) {
    const code = reference.charCodeAt(index)
    first = Math.imul(first ^ code, 0x01000193) >>> 0
    second = Math.imul(second ^ (code + index), 0x85ebca6b) >>> 0
  }
  return `asset-${first.toString(36)}-${second.toString(36)}-${reference.length.toString(36)}`
}

async function prepareProjectForRelay(project: Project, uploadedRefs: Set<string>, pendingUploads: Map<string, Promise<boolean>>): Promise<Project> {
  const snapshot = JSON.parse(JSON.stringify(project)) as Project
  const relayReference = async (reference: string | undefined, label: string): Promise<string | undefined> => {
    if (!reference) return reference
    const isIndexedAsset = reference.startsWith('idb-video://')
    const isDataAsset = /^data:(?:image|video)\//i.test(reference)
    if (!isIndexedAsset && !isDataAsset) return reference
    const assetId = isIndexedAsset ? reference.slice('idb-video://'.length) : localAssetIdForReference(reference)
    if (!/^[a-z0-9-]{5,100}$/i.test(assetId)) throw new Error(`Identificador inválido para a mídia “${label}”.`)
    if (!uploadedRefs.has(assetId)) {
      let upload = pendingUploads.get(assetId)
      if (!upload) {
        upload = (async () => {
          const blob = isIndexedAsset ? await getVideoBlob(reference) : dataUrlToBlob(reference)
          if (!blob) throw new Error(`A mídia “${label}” não foi encontrada no armazenamento local. Reimporte o arquivo no editor.`)
          const response = await fetch(`http://127.0.0.1:4174/assets/${assetId}`, {
            method: 'POST', headers: { 'Content-Type': blob.type || 'application/octet-stream' }, body: blob,
          })
          if (!response.ok) throw new Error(`O relay do OBS recusou “${label}” (HTTP ${response.status}).`)
          return true
        })().finally(() => pendingUploads.delete(assetId))
        pendingUploads.set(assetId, upload)
      }
      await upload
      uploadedRefs.add(assetId)
    }
    return `http://127.0.0.1:4174/assets/${assetId}`
  }
  for (const scene of snapshot.scenes) {
    const background = scene.background
    if (background?.imageSrc) background.imageSrc = (await relayReference(background.imageSrc, `Imagem de fundo · ${scene.name}`)) ?? background.imageSrc
    if (background?.slideshowImages) {
      background.slideshowImages = await Promise.all(background.slideshowImages.map(async (image) => ({ ...image, src: (await relayReference(image.src, image.name)) ?? image.src })))
    }
    if (background?.videoClips) {
      background.videoClips = await Promise.all(background.videoClips.map(async (clip) => ({ ...clip, src: (await relayReference(clip.src, `${scene.name} · ${clip.name}`)) ?? clip.src })))
      background.videoSrc = background.videoClips[0]?.src ?? background.videoSrc
    } else if (background?.videoSrc) {
      background.videoSrc = (await relayReference(background.videoSrc, `Fundo · ${scene.name}`)) ?? background.videoSrc
    }
    scene.sources = await Promise.all(scene.sources.map(async (source) => {
      let next = { ...source }
      if (source.src) next.src = (await relayReference(source.src, source.name)) ?? source.src
      if (source.widgetBackgroundImage) next.widgetBackgroundImage = (await relayReference(source.widgetBackgroundImage, `${source.name} · imagem de fundo`)) ?? source.widgetBackgroundImage
      if (source.videoClips?.length) {
        next.videoClips = await Promise.all(source.videoClips.map(async (clip) => ({ ...clip, src: (await relayReference(clip.src, `${source.name} · ${clip.name}`)) ?? clip.src })))
        next.src = next.videoClips[0]?.src ?? next.src
      }
      return next
    }))
  }
  return snapshot
}

async function storeEmbeddedVideos(project: Project): Promise<Project> {
  const scenes: Scene[] = []
  const createdReferences: string[] = []
  const storeDataReference = async (reference: string | undefined, label: string): Promise<string | undefined> => {
    if (!reference || !/^data:(?:video|image)\//i.test(reference)) return reference
    const blob = dataUrlToBlob(reference)
    const isImage = blob.type.startsWith('image/')
    if (blob.size > (isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES)) throw new Error(`“${label}” excede o limite de ${Math.round((isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES) / 1_000_000)} MB por arquivo.`)
    const stored = await saveVideoBlob(blob, label)
    createdReferences.push(stored)
    return stored
  }
  try {
    for (const scene of project.scenes) {
      const sources: SceneSource[] = []
      let background = scene.background ? { ...scene.background } : undefined
      if (background?.slideshowImages?.length) {
        const slideshowImages: SlideshowImage[] = []
        for (const image of background.slideshowImages) slideshowImages.push({ ...image, src: (await storeDataReference(image.src, `Carrossel · ${image.name}`)) ?? image.src })
        background = { ...background, slideshowImages }
      }
      if (background?.videoClips?.length) {
        const clips: VideoClip[] = []
        for (const clip of background.videoClips) {
          clips.push({ ...clip, src: (await storeDataReference(clip.src, `Fundo · ${clip.name}`)) ?? clip.src })
        }
        background = { ...background, videoClips: clips, videoSrc: clips[0]?.src ?? background.videoSrc }
      } else if (background?.videoSrc) {
        const stored = await storeDataReference(background.videoSrc, `Fundo · ${scene.name}`)
        background = { ...background, videoSrc: stored }
      }
      for (const source of scene.sources) {
        if (source.type !== 'video') { sources.push(source); continue }
        if (source.videoClips?.length) {
          const clips: VideoClip[] = []
          for (const clip of source.videoClips) {
            clips.push({ ...clip, src: (await storeDataReference(clip.src, `${source.name} · ${clip.name}`)) ?? clip.src })
          }
          sources.push({ ...source, src: clips[0]?.src ?? source.src, videoClips: clips })
        } else if (source.src) {
          const stored = await storeDataReference(source.src, source.name || 'Vídeo importado')
          sources.push({ ...source, src: stored })
        } else {
          sources.push(source)
        }
      }
      scenes.push({ ...scene, background, sources })
    }
    return { ...project, scenes }
  } catch (error) {
    await Promise.allSettled(createdReferences.map(deleteVideoBlob))
    throw error
  }
}

function useResolvedVideoSrc(src: string | undefined): string | undefined {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(() => src && !src.startsWith('idb-video://') ? src : undefined)
  useEffect(() => {
    let cancelled = false
    let objectUrl: string | undefined
    if (!src) {
      setResolvedSrc(undefined)
      return () => { cancelled = true }
    }
    if (!src.startsWith('idb-video://')) {
      setResolvedSrc(src)
      return () => { cancelled = true }
    }
    setResolvedSrc(undefined)
    getVideoBlob(src).then((blob) => {
      if (!blob) throw new Error('O arquivo de vídeo não foi encontrado no armazenamento local.')
      if (cancelled) return
      objectUrl = URL.createObjectURL(blob)
      setResolvedSrc(objectUrl)
    }).catch(() => {
      if (!cancelled) setResolvedSrc(undefined)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])
  return resolvedSrc
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
  return ({ text: 'Texto', shape: 'Forma', camera: 'Câmera', image: 'Imagem', video: 'Vídeo', capture: 'Captura de tela', browser: 'Navegador', widget: 'Widget' })[type]
}

function sourceGlyph(type: SourceType) {
  return ({ text: 'T', shape: '◇', camera: '◉', image: '▧', video: '▶', capture: '▣', browser: '↗', widget: '✦' })[type]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function safeFileName(name: string) {
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'webcam-overlay'
}

async function downloadProject(project: Project) {
  const exportProject: Project = { ...project, scenes: [] }
  const exportReference = async (reference: string | undefined, label: string): Promise<string | undefined> => {
    if (!reference?.startsWith('idb-video://')) return reference
    const blob = await getVideoBlob(reference)
    if (!blob) throw new Error(`A mídia “${label}” não foi encontrada no armazenamento local. Importe-a novamente antes de exportar.`)
    const isImage = blob.type.startsWith('image/')
    if (blob.size > (isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES)) throw new Error(`A mídia “${label}” excede o limite portátil por arquivo.`)
    return blobToDataUrl(blob)
  }
  for (const scene of project.scenes) {
    const sources: SceneSource[] = []
    let background = scene.background ? { ...scene.background } : undefined
    if (background?.slideshowImages?.length) {
      const slideshowImages: SlideshowImage[] = []
      for (const image of background.slideshowImages) slideshowImages.push({ ...image, src: (await exportReference(image.src, image.name)) ?? image.src })
      background = { ...background, slideshowImages }
    }
    if (background?.videoClips?.length) {
      const clips: VideoClip[] = []
      for (const clip of background.videoClips) clips.push({ ...clip, src: (await exportReference(clip.src, clip.name)) ?? clip.src })
      background = { ...background, videoClips: clips, videoSrc: background.videoSrc }
    } else if (background?.videoSrc) {
      background = { ...background, videoSrc: await exportReference(background.videoSrc, `Fundo · ${scene.name}`) }
    }
    for (const source of scene.sources) {
      if (source.type !== 'video') { sources.push(source); continue }
      if (source.videoClips?.length) {
        const clips: VideoClip[] = []
        for (const clip of source.videoClips) clips.push({ ...clip, src: (await exportReference(clip.src, `${source.name} · ${clip.name}`)) ?? clip.src })
        sources.push({ ...source, src: source.src, videoClips: clips })
      } else if (source.src) {
        sources.push({ ...source, src: (await exportReference(source.src, source.name)) ?? source.src })
      } else sources.push(source)
    }
    exportProject.scenes.push({ ...scene, background, sources })
  }
  const serialized = JSON.stringify(exportProject, null, 2)
  if (serialized.length > MAX_PROJECT_JSON_CHARS) throw new Error('O projeto com mídia incorporada ultrapassa o limite de exportação de 125 MB. Exporte menos vídeos por vez ou reduza os arquivos.')
  const data = new Blob([serialized], { type: 'application/json' })
  const url = URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeFileName(project.scenes.find((scene) => scene.id === project.activeSceneId)?.name ?? 'webcam-overlay')}-projeto.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
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
  if (source.type === 'camera' || source.type === 'image' || source.type === 'video' || source.type === 'capture' || source.type === 'browser') style.overflow = 'hidden'
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
  if (/^idb-video:\/\/[a-z0-9-]{5,100}$/i.test(source)) return true
  if (/^data:image\/(png|jpeg|webp|gif|svg\+xml|avif);/i.test(source)) return source.length <= MAX_LOCAL_PROJECT_CHARS
  try {
    const parsed = new URL(source)
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && parsed.href.length < 2000
  } catch {
    return false
  }
}

function isSafeVideoSource(source: string): boolean {
  if (/^idb-video:\/\/[a-z0-9-]{5,100}$/i.test(source)) return true
  if (/^data:video\/[a-z0-9.+-]+;base64,/i.test(source)) return source.length <= MAX_PROJECT_JSON_CHARS
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
  if (mode === 'solid' || mode === 'animated' || mode === 'slideshow') return { backgroundColor: background?.color ?? '#171923', backgroundImage: 'none' }
  if (mode === 'gradient') return { backgroundColor: background?.color ?? '#171923', backgroundImage: `linear-gradient(${background?.angle ?? 135}deg, ${background?.color ?? '#25233a'}, ${background?.color2 ?? '#10121a'})` }
  if (mode === 'video' || mode === 'screen') return { backgroundColor: background?.color ?? '#151823', backgroundImage: isPreview ? 'repeating-conic-gradient(#262936 0% 25%, #1c1f29 0% 50%)' : 'none', backgroundSize: '24px 24px' }
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

function WidgetContent({ source, testToken = 0, editorMode = false, selectedGoalPartId }: { source: SceneSource; testToken?: number; editorMode?: boolean; selectedGoalPartId?: string | null }) {
  const kind = source.widgetKind ?? 'goal'
  const accent = source.widgetAccent ?? source.color ?? '#8d85ff'
  const transparentRoot = source.widgetShowBackground === false || ((kind === 'chat' || kind === 'clock') && source.widgetShowBackground === undefined)
  const widgetBgColor = source.widgetBackgroundColor ?? '#141722'
  const imageSrc = source.widgetBackgroundImage && isSafeImageSource(source.widgetBackgroundImage) ? source.widgetBackgroundImage : ''
  const imageAlpha = clamp(source.widgetBackgroundImageOpacity ?? 1, 0, 1)
  const widgetBgImage = imageSrc
    ? `linear-gradient(${hexToRgba(widgetBgColor, 1 - imageAlpha)}, ${hexToRgba(widgetBgColor, 1 - imageAlpha)}), url(${JSON.stringify(imageSrc)})`
    : undefined
  const defaultBlur = (source.widgetTheme ?? 'glass') === 'glass' ? 8 : 0
  const showBorder = source.widgetShowBorder ?? !(kind === 'chat' || kind === 'clock')
  const showShadow = source.widgetShowShadow ?? !(kind === 'chat' || kind === 'clock')
  // Calculate goal progress before building the style object that consumes it.
  // Keeping these values above widgetAppearance avoids TS2448/TS2454 during build.
  const currentValue = Math.max(0, parseLocalizedNumber(source.widgetValue ?? '68', 0))
  const targetValue = Math.max(1, parseLocalizedNumber(source.widgetTarget ?? '100', 100))
  const progress = Math.min(100, Math.max(0, (currentValue / targetValue) * 100))
  const widgetAppearance = {
    '--widget-accent': accent,
    '--goal-progress': `${progress}%`,
    '--widget-text-color': source.widgetTextColor ?? '#f2f3fb',
    '--widget-title-color': source.widgetTitleColor ?? '#ffffff',
    '--widget-subtitle-color': source.widgetSubtitleColor ?? source.widgetTextColor ?? '#a7acbe',
    '--widget-value-color': source.widgetValueColor ?? source.widgetTitleColor ?? '#ffffff',
    '--widget-track-color': source.widgetTrackColor ?? '#080a14a8',
    '--widget-fill-color': source.widgetFillColor ?? accent,
    '--widget-item-background': source.widgetItemBackgroundColor ? hexToRgba(source.widgetItemBackgroundColor, source.widgetBackgroundOpacity ?? 0.2) : 'transparent',
    '--widget-item-border': source.widgetItemBorderColor ?? 'transparent',
    '--widget-border-color': source.widgetBorderColor ?? 'color-mix(in srgb, var(--widget-accent) 42%, #424456)',
    '--widget-border-width': `${showBorder ? source.widgetBorderWidth ?? 1 : 0}px`,
    '--widget-radius': `${source.widgetRadius ?? 12}px`,
    '--widget-padding': `${source.widgetCompact ? Math.min(source.widgetPadding ?? 12, 6) : source.widgetPadding ?? 12}px`,
    '--widget-gap': `${source.widgetCompact ? Math.min(source.widgetGap ?? 8, 4) : source.widgetGap ?? 8}px`,
    '--widget-background': transparentRoot ? 'transparent' : (source.widgetBackgroundColor ? hexToRgba(source.widgetBackgroundColor, source.widgetBackgroundOpacity ?? 0.92) : 'var(--widget-theme-background)'),
    '--widget-font-family': source.widgetFontFamily?.trim() || 'inherit',
    '--widget-font-size': source.widgetFontSize !== undefined ? `${clamp(source.widgetFontSize, 6, 100)}px` : '16px',
    '--widget-font-weight': clamp(source.widgetFontWeight ?? 500, 100, 900),
    '--widget-line-height': clamp(source.widgetLineHeight ?? 1.25, 0.7, 3),
    '--widget-letter-spacing': `${clamp(source.widgetLetterSpacing ?? 0, -5, 20)}px`,
    '--widget-title-size': source.widgetTitleSize !== undefined ? `${clamp(source.widgetTitleSize, 6, 80)}px` : '12px',
    '--widget-title-letter-spacing': `${clamp(source.widgetTitleLetterSpacing ?? 0.8, -2, 15)}px`,
    '--widget-backdrop-blur': `${transparentRoot ? 0 : clamp(source.widgetBackdropBlur ?? defaultBlur, 0, 30)}px`,
    '--widget-shadow': showShadow ? undefined : 'none',
    '--chat-bubble-background': source.chatBubbleEnabled === false ? 'transparent' : hexToRgba(source.chatBubbleColor ?? '#d85f9b', clamp(source.chatBubbleOpacity ?? 0.78, 0, 1)),
    '--chat-message-color': source.chatMessageColor ?? source.widgetTextColor ?? '#ffffff',
    '--chat-timestamp-color': source.chatTimestampColor ?? '#f7d6e7',
    '--chat-username-size': `${clamp(source.chatUsernameFontSize ?? 12, 6, 60)}px`,
    '--chat-message-size': `${clamp(source.chatMessageFontSize ?? 13, 6, 60)}px`,
    '--chat-line-gap': `${clamp(source.chatLineGap ?? 8, 0, 40)}px`,
    '--chat-bubble-radius': `${clamp(source.chatBubbleRadius ?? 18, 0, 100)}px`,
    '--chat-bubble-padding-x': `${clamp(source.chatBubblePaddingX ?? 10, 0, 60)}px`,
    '--chat-bubble-padding-y': `${clamp(source.chatBubblePaddingY ?? 6, 0, 40)}px`,
    '--chat-bubble-border-color': source.chatBubbleBorderColor ?? 'transparent',
    '--chat-bubble-border-width': `${source.chatBubbleEnabled === false ? 0 : clamp(source.chatBubbleBorderWidth ?? 0, 0, 8)}px`,
    '--clock-color': source.clockColor ?? source.widgetTitleColor ?? '#ffffff',
    '--clock-date-color': source.clockDateColor ?? source.widgetTextColor ?? '#c6c8d5',
    '--clock-font-size': `${clamp(source.widgetFontSize ?? 48, 8, 200)}px`,
    '--clock-font-weight': clamp(source.widgetFontWeight ?? 800, 100, 900),
    '--clock-letter-spacing': `${clamp(source.widgetLetterSpacing ?? -1, -10, 25)}px`,
    '--clock-text-shadow': source.clockTextShadow ? '0 2px 16px #0008' : 'none',
    backgroundImage: transparentRoot ? 'none' : widgetBgImage,
    backgroundSize: imageSrc ? `100% 100%, ${source.widgetBackgroundImageFit === 'stretch' ? '100% 100%' : (source.widgetBackgroundImageFit ?? 'cover')}` : undefined,
    backgroundPosition: imageSrc ? `center center, ${source.widgetBackgroundImagePosition ?? 'center center'}` : undefined,
    backgroundRepeat: imageSrc ? 'no-repeat, no-repeat' : undefined,
    backdropFilter: `blur(${transparentRoot ? 0 : clamp(source.widgetBackdropBlur ?? defaultBlur, 0, 30)}px)`,
    boxShadow: showShadow ? undefined : 'none',
    borderWidth: showBorder ? undefined : 0,
    textAlign: source.widgetTextAlign ?? 'left',
  } as CSSProperties
  const widgetRootStyle = widgetAppearance as CSSProperties
  const widgetMotion = `widget-motion-${source.widgetAnimation ?? 'subtle'}`
  const widgetVariant = (source.widgetVariant ?? 'default').replace(/[^a-z0-9-]/gi, '') || 'default'
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
  const time = remaining >= 3600
    ? `${String(Math.floor(remaining / 3600)).padStart(2, '0')}:${String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
    : `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`

  if (kind === 'webcam-frame') {
    return <div className={`stream-widget webcam-frame-widget widget-theme-${source.widgetTheme ?? 'neon'} widget-variant-${widgetVariant} ${widgetMotion} ${source.widgetShowIcon === false ? 'widget-no-icon' : ''}`} style={widgetRootStyle}>
      <div className="webcam-frame-corner corner-tl" /><div className="webcam-frame-corner corner-tr" />
      <div className="webcam-frame-corner corner-bl" /><div className="webcam-frame-corner corner-br" />
      {source.frameOverlayImage && isSafeImageSource(source.frameOverlayImage) && <img className="webcam-frame-art" src={source.frameOverlayImage} alt="" draggable={false} />}
      <span className="webcam-frame-label">{source.widgetTitle || 'WEBCAM'}</span>
    </div>
  }

  if (kind === 'live-badge') {
    return <div className={`stream-widget live-badge-widget widget-theme-${source.widgetTheme ?? 'minimal'} widget-variant-${widgetVariant} ${widgetMotion} ${source.widgetShowIcon === false ? 'widget-no-icon' : ''}`} style={widgetRootStyle}>
      <span className="live-badge-dot" />
      <span className="live-badge-copy"><strong>{source.widgetTitle || 'AO VIVO'}</strong><small>{source.widgetText || 'TRANSMITINDO'}</small></span>
    </div>
  }

  return <div className={`stream-widget widget-${kind} widget-theme-${source.widgetTheme ?? 'glass'} widget-variant-${widgetVariant} ${widgetMotion} ${source.widgetCompact ? 'widget-compact' : ''} ${source.widgetShowIcon === false ? 'widget-no-icon' : ''} ${transparentRoot ? 'widget-no-background' : ''} ${!showBorder ? 'widget-no-border' : ''} ${!showShadow ? 'widget-no-shadow' : ''} ${source.goalFreeLayout && kind === 'goal' ? 'goal-free-enabled' : ''} ${alertVisible ? 'alert-triggered' : ''}`} style={widgetRootStyle}>
    {kind === 'alert' && <>
      <div className="widget-alert-icon">✦</div>
      <div className="widget-alert-content"><span className="widget-kicker">{alertVisible ? 'NOVO EVENTO!' : (source.widgetTitle || 'ALERTA DE EVENTO')}</span><strong>{alertVisible ? (source.widgetValue || 'pixelrider') : (source.widgetValue || 'Novo seguidor')}</strong><small>{source.widgetText || 'começou a seguir o canal'}</small></div>
    </>}

    {kind === 'chat' && <>
      {showHeader && <div className="widget-header"><strong>{source.widgetTitle || 'CHAT AO VIVO'}</strong></div>}
      <div className="chat-messages">{(lines.length ? lines : ['LuaGamer: Oi, chat!', 'PixelRider: Boa live!', 'nina: Qual é o jogo?', 'Gui: Cheguei agora']).slice(-Math.max(1, Math.min(30, Number(source.widgetMaxItems ?? 8)))).map((line, index) => {
        const separator = line.indexOf(':')
        const username = separator >= 0 ? line.slice(0, separator).trim() : `viewer${index + 1}`
        const message = separator >= 0 ? line.slice(separator + 1).trim() : line
        const mappedColor = (source.chatNameColors ?? '').split(/\r?\n/).map((entry) => entry.match(/^\s*([^=:#]+)\s*=\s*(#[0-9a-fA-F]{3,8})\s*$/)).find((match) => match && match[1].trim().toLowerCase() === username.toLowerCase())?.[2]
        const mappedBubbleColor = (source.chatBubbleColors ?? '').split(/\r?\n/).map((entry) => entry.match(/^\s*([^=:#]+)\s*=\s*(#[0-9a-fA-F]{3,8})\s*$/)).find((match) => match && match[1].trim().toLowerCase() === username.toLowerCase())?.[2]
        const palette = ['#b8a8ff', '#74dfc5', '#ffbd83', '#85c8ff', '#f68dc2', '#a8db77']
        const nameColor = mappedColor ?? (source.chatUsernameColorMode === 'uniform' ? source.chatUsernameColor ?? '#ffffff' : palette[index % palette.length])
        const messageStyle: CSSProperties = {
          backgroundColor: source.chatBubbleEnabled === false ? 'transparent' : hexToRgba(mappedBubbleColor ?? source.chatBubbleColor ?? '#d85f9b', clamp(source.chatBubbleOpacity ?? 0.78, 0, 1)),
          borderColor: source.chatBubbleBorderColor ?? 'transparent',
          borderWidth: source.chatBubbleEnabled === false ? 0 : clamp(source.chatBubbleBorderWidth ?? 0, 0, 8),
          borderStyle: 'solid',
          borderRadius: source.chatBubbleEnabled === false ? 0 : clamp(source.chatBubbleRadius ?? 18, 0, 100),
          padding: source.chatBubbleEnabled === false ? 0 : `${clamp(source.chatBubblePaddingY ?? 6, 0, 40)}px ${clamp(source.chatBubblePaddingX ?? 10, 0, 60)}px`,
          boxShadow: source.chatBubbleEnabled !== false && source.chatBubbleShadow ? '0 2px 10px #0003' : 'none',
          color: source.chatMessageColor ?? source.widgetTextColor ?? '#ffffff',
          fontFamily: source.chatMessageFontFamily?.trim() || source.widgetFontFamily || 'inherit',
          fontSize: `${clamp(source.chatMessageFontSize ?? 13, 6, 60)}px`,
          lineHeight: clamp(source.chatMessageLineHeight ?? 1.35, 0.8, 3),
          textShadow: source.chatTextShadow ? '0 1px 3px #0008' : 'none',
          alignSelf: source.widgetTextAlign === 'right' ? 'flex-end' : source.widgetTextAlign === 'center' ? 'center' : 'flex-start',
        }
        const usernamePillStyle: CSSProperties = {
          color: nameColor,
          fontSize: `${clamp(source.chatUsernameFontSize ?? 12, 6, 60)}px`,
          fontFamily: source.chatUsernameFontFamily?.trim() || source.widgetFontFamily || 'inherit',
          fontWeight: clamp(source.chatUsernameFontWeight ?? 800, 100, 900),
          background: source.chatUsernamePill === false ? 'transparent' : hexToRgba(source.chatUsernamePillColor ?? '#b94780', clamp(source.chatUsernamePillOpacity ?? 0.95, 0, 1)),
          border: `${source.chatUsernamePill === false ? 0 : clamp(source.chatUsernamePillBorderWidth ?? 0, 0, 8)}px solid ${source.chatUsernamePillBorderColor ?? 'transparent'}`,
          borderRadius: source.chatUsernamePill === false ? 0 : clamp(source.chatUsernamePillRadius ?? 999, 0, 100),
          padding: source.chatUsernamePill === false ? 0 : `${clamp(source.chatUsernamePillPaddingY ?? 3, 0, 30)}px ${clamp(source.chatUsernamePillPaddingX ?? 8, 0, 40)}px`,
        }
        const usernameInsideBubble = source.chatUsernamePlacement === 'same-bubble'
        const embeddedUsernameStyle: CSSProperties = { color: nameColor, fontSize: `${clamp(source.chatUsernameFontSize ?? 12, 6, 60)}px`, fontFamily: source.chatUsernameFontFamily?.trim() || source.widgetFontFamily || 'inherit', fontWeight: clamp(source.chatUsernameFontWeight ?? 800, 100, 900), background: 'transparent', border: 0, padding: 0, borderRadius: 0, marginRight: '0.12em' }
        return <div className={`chat-message ${source.chatLayout === 'inline' ? 'chat-layout-inline' : 'chat-layout-stacked'} ${usernameInsideBubble ? 'chat-name-inside-bubble' : ''}`} key={`${line}-${index}`} style={{ alignSelf: source.widgetTextAlign === 'right' ? 'flex-end' : source.widgetTextAlign === 'center' ? 'center' : 'flex-start', alignItems: source.widgetTextAlign === 'right' ? 'flex-end' : source.widgetTextAlign === 'center' ? 'center' : 'flex-start' }}>
          {!usernameInsideBubble && <div className="chat-username-row">
            {source.chatShowBadges && <span className="chat-demo-badge" aria-hidden="true">✦</span>}
            <strong className="chat-username-pill" style={usernamePillStyle}>{username}</strong>
          </div>}
          <div className={`chat-message-bubble ${source.chatBubbleEnabled === false ? 'chat-message-plain' : ''}`} style={messageStyle}>
            {usernameInsideBubble && <strong className="chat-username-in-bubble" style={embeddedUsernameStyle}>{username}</strong>}
            <span>{message}</span>
            {source.chatShowTimestamp && <time style={{ color: source.chatTimestampColor ?? '#f7d6e7' }}>12:{String((index * 7 + 14) % 60).padStart(2, '0')}</time>}
          </div>
        </div>
      })}</div>
      {source.chatShowInput === true && <div className="chat-input-sample"><span>Enviar mensagem…</span><b>↗</b></div>}
    </>}

    {kind === 'events' && <>
      {showHeader && <div className="widget-header"><strong>{source.widgetTitle || 'ATIVIDADE RECENTE'}</strong></div>}
      <div className="event-items">{(lines.length ? lines : ['Novo seguidor · pixelrider', 'Nova inscrição · lua_gamer', 'Apoio · catbits · R$ 10', 'Raid · canal_da_nina · 24']).slice(0, 6).map((line, index) => {
        const parts = line.split('·').map((part) => part.trim())
        return <div className="event-item" key={`${line}-${index}`}><span className={`event-type-icon event-icon-${index % 4}`}>{['↗', '★', '♥', '✦'][index % 4]}</span><span className="event-copy"><strong>{parts[0]}</strong><small>{parts.slice(1).join(' · ') || 'viewer_exemplo'}</small></span></div>
      })}</div>
    </>}

    {kind === 'goal' && (source.goalFreeLayout ? <div className={`goal-free-layout ${editorMode && source.goalPartEditMode ? 'goal-parts-editing' : ''}`}>
      {(Array.isArray(source.goalParts) ? source.goalParts : createDefaultGoalParts()).filter((part) => part.visible !== false).map((part) => {
        const partStyle: CSSProperties = {
          left: `${clamp(part.x, 0, 100)}%`, top: `${clamp(part.y, 0, 100)}%`, width: `${clamp(part.w, 1, 100)}%`, height: `${clamp(part.h, 1, 100)}%`,
          color: part.color ?? '#ffffff', fontSize: `${clamp(part.fontSize ?? (part.type === 'title' ? 13 : 14), 6, 80)}px`, fontWeight: clamp(part.fontWeight ?? 700, 100, 900),
          textAlign: part.align ?? 'left', backgroundColor: part.type === 'shape' ? (part.color ?? part.backgroundColor ?? '#7776ff') : (part.backgroundColor ?? 'transparent'), backgroundImage: part.gradientEnabled && part.type !== 'shape' ? `linear-gradient(${clamp(part.gradientAngle ?? 135, 0, 360)}deg, ${part.backgroundColor ?? '#222222'}, ${part.gradientColor ?? '#6c5ce7'})` : undefined, borderRadius: part.type === 'shape' ? (part.shapeKind === 'circle' ? '50%' : part.shapeKind === 'pill' ? '999px' : `${clamp(part.radius ?? 0, 0, 50)}px`) : `${clamp(part.radius ?? 0, 0, 50)}px`, padding: `${clamp(part.padding ?? 0, 0, 30)}px`, boxSizing: 'border-box', opacity: clamp(part.opacity ?? 1, 0, 1), transform: part.rotation ? `rotate(${clamp(part.rotation, -180, 180)}deg)` : undefined, border: part.type !== 'shape' && part.borderWidth ? `${clamp(part.borderWidth, 0, 12)}px solid ${part.borderColor ?? '#ffffff'}` : undefined, fontFamily: part.fontFamily?.trim() || undefined, fontStyle: part.italic ? 'italic' : 'normal', letterSpacing: `${clamp(part.letterSpacing ?? 0, -5, 30)}px`, textTransform: part.textTransform ?? 'none', textShadow: part.shadowEnabled ? `0 2px 8px ${hexToRgba(part.shadowColor ?? '#000000', 0.6)}` : undefined,
          display: 'flex', alignItems: part.type === 'bar' ? 'stretch' : part.verticalAlign === 'top' ? 'flex-start' : part.verticalAlign === 'bottom' ? 'flex-end' : 'center', justifyContent: part.align === 'center' ? 'center' : part.align === 'right' ? 'flex-end' : 'flex-start',
        }
        const partLabel = part.type === 'title' ? (source.widgetTitle || 'META DA LIVE')
          : part.type === 'subtitle' ? (source.widgetText || 'Rumo à próxima meta')
          : part.type === 'current' ? (source.widgetValue ?? '68')
          : part.type === 'separator' ? (part.label || '/')
          : part.type === 'target' ? (source.widgetTarget ?? '100')
          : part.type === 'percent' ? `${Math.round(progress)}%`
          : part.type === 'footer' ? (part.label && part.label !== 'Texto auxiliar' ? part.label : (progress >= 100 ? 'Meta alcançada!' : `${Math.max(0, targetValue - currentValue)} para alcançar a meta`))
          : part.type === 'custom-text' ? (part.label || 'Novo texto')
          : part.type === 'icon' ? (part.label || '♥') : ''
        return <div key={part.id} className={`goal-free-part goal-free-part-${part.type} ${editorMode && source.goalPartEditMode && selectedGoalPartId === part.id ? 'goal-free-part-selected' : ''}`} style={partStyle}>
          {part.type === 'bar' ? <span className="goal-free-track" style={{ borderRadius: `${clamp(part.radius ?? 4, 0, 50)}px`, background: source.widgetTrackColor ?? '#292b35' }}><span style={{ width: `${progress}%`, background: source.widgetFillColor ?? source.widgetAccent ?? '#8d85ff', borderRadius: `${clamp(part.radius ?? 4, 0, 50)}px` }} /></span>
            : part.type === 'image' ? (part.src && isSafeImageSource(part.src) ? <img src={part.src} alt={part.label || 'Imagem da barra de meta'} draggable={false} style={{ width: '100%', height: '100%', objectFit: part.objectFit ?? 'contain', pointerEvents: 'none' }} /> : <span className="goal-part-image-placeholder">Escolher imagem</span>)
            : part.type === 'shape' ? <span aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%', background: part.gradientEnabled ? `linear-gradient(${clamp(part.gradientAngle ?? 135, 0, 360)}deg, ${part.color ?? '#7776ff'}, ${part.gradientColor ?? '#ffffff'})` : (part.color ?? '#7776ff'), border: `${clamp(part.borderWidth ?? 0, 0, 12)}px solid ${part.borderColor ?? '#ffffff'}`, borderRadius: part.shapeKind === 'circle' ? '50%' : part.shapeKind === 'pill' ? '999px' : `${clamp(part.radius ?? 0, 0, 50)}px`, boxSizing: 'border-box' }} />
            : partLabel}
        </div>
      })}
    </div> : <>
      {showHeader && <div className="widget-header"><strong>{source.widgetTitle || 'META DA LIVE'}</strong></div>}
      {source.widgetText && <p className="widget-muted-line">{source.widgetText}</p>}
      <div className="goal-numbers"><strong>{source.widgetValue ?? '68'}</strong><span>/ {source.widgetTarget ?? '100'}</span><b>{Math.round(progress)}%</b></div>
      <div className="goal-track"><span style={{ width: `${progress}%` }} /></div>
      <small className="goal-footnote">{progress >= 100 ? 'Meta alcançada!' : `${Math.max(0, targetValue - currentValue)} para alcançar a meta`}</small>
    </>)}

    {kind === 'latest' && <>
      <div className="latest-icon">☆</div><div className="latest-copy"><span className="widget-kicker">{source.widgetTitle || 'ÚLTIMO SEGUIDOR'}</span><strong>{source.widgetText || 'pixelrider'}</strong></div>
    </>}

    {kind === 'socials' && <>
      {showHeader && source.widgetTitle && <div className="widget-header"><strong>{source.widgetTitle}</strong><span className="widget-header-pill">PERFIS</span></div>}
      <div className="social-list">{getSocialProfiles(source).map((profile) => {
        const logo = profile.logoSrc || profile.logoUrl || ''
        return <div className="social-item" key={profile.id}>
          <span className="social-logo-box" style={{ color: profile.color ?? accent, borderColor: `${profile.color ?? accent}66` }}>{logo && isSafeImageSource(logo) ? <img className="social-logo-image" src={logo} alt={`${profile.platform} logo`} draggable={false} /> : socialGlyph(profile.platform)}</span>
          <strong>{profile.platform}</strong><small>{profile.account}</small>
        </div>
      })}</div>
    </>}

    {kind === 'countdown' && <>
      {showHeader && <span className="widget-kicker">{source.widgetTitle || 'COMEÇAMOS EM'}</span>}
      <strong className="countdown-time">{time}</strong>
      {source.widgetShowHeader !== false && <small className="widget-muted-line">{remaining === 0 ? 'Está na hora!' : (source.widgetText || 'Prepare-se para a transmissão')}</small>}
    </>}

    {kind === 'clock' && <>
      {showHeader && <span className="widget-kicker">{source.widgetTitle || 'HORA LOCAL'}</span>}
      <strong className="clock-time">{now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', ...(source.clock24h === false ? { hour12: true } : { hour12: false }), ...(source.clockShowSeconds === false ? {} : { second: '2-digit' }) })}</strong>
      {source.clockShowDate !== false && <small className="widget-muted-line clock-date">{now.toLocaleDateString('pt-BR', source.clockDateFormat === 'long' ? { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' } : source.clockDateFormat === 'time' ? { weekday: 'short', day: '2-digit', month: 'short' } : { day: '2-digit', month: '2-digit', year: 'numeric' })}</small>}
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

function formatMediaTime(seconds: number) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0)
  const minutes = Math.floor(safe / 60)
  const remainder = Math.floor(safe % 60)
  const tenths = Math.floor((safe % 1) * 10)
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}.${tenths}`
}

function useResolvedVideoPlaylistSources(clips: VideoClip[]): Record<string, string> {
  const signature = clips.map((clip) => `${clip.id}::${clip.src}`).join('||')
  const [resolvedSources, setResolvedSources] = useState<Record<string, string>>({})
  useEffect(() => {
    let cancelled = false
    const objectUrls: string[] = []
    const resolveAll = async () => {
      const result: Record<string, string> = {}
      for (const clip of clips) {
        if (!clip.src) continue
        if (clip.src.startsWith('idb-video://')) {
          try {
            const blob = await getVideoBlob(clip.src)
            if (blob) {
              const objectUrl = URL.createObjectURL(blob)
              objectUrls.push(objectUrl)
              result[clip.id] = objectUrl
            }
          } catch { /* O estado vazio é apresentado no inspetor se um clipe estiver ausente. */ }
        } else {
          result[clip.id] = clip.src
        }
      }
      if (!cancelled) setResolvedSources(result)
    }
    void resolveAll()
    return () => {
      cancelled = true
      objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
    }
  // Only id and source changes require resolving the media blobs again.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])
  return resolvedSources
}

function TrimmedVideo({ source, className, fit, position }: { source: SceneSource; className: string; fit?: 'cover' | 'contain' | 'fill'; position?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playlistMode = Boolean(source.videoClips?.length)
  const clips: VideoClip[] = playlistMode
    ? (source.videoClips ?? [])
    : source.src ? [{ id: `single-${source.id}`, name: source.name, src: source.src, start: source.videoStart ?? 0, end: source.videoEnd ?? 0, trimEnabled: source.videoTrimEnabled === true }] : []
  const signature = clips.map((clip) => `${clip.id}::${clip.src}`).join('||')
  const resolvedSources = useResolvedVideoPlaylistSources(clips)
  const [clipIndex, setClipIndex] = useState(0)
  const advancingRef = useRef(false)
  const index = Math.min(clipIndex, Math.max(0, clips.length - 1))
  const clip = clips[index]
  const resolvedSrc = clip ? resolvedSources[clip.id] : undefined
  const start = clip?.trimEnabled ? Math.max(0, clip.start ?? 0) : (!playlistMode && source.videoTrimEnabled ? Math.max(0, source.videoStart ?? 0) : 0)
  const end = clip?.trimEnabled ? Math.max(0, clip.end ?? 0) : (!playlistMode && source.videoTrimEnabled ? Math.max(0, source.videoEnd ?? 0) : 0)
  const shouldLoop = source.videoLoop !== false

  useEffect(() => { setClipIndex(0); advancingRef.current = false }, [signature])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !resolvedSrc) return
    advancingRef.current = false
    const initialize = () => {
      if (!videoRef.current || videoRef.current !== video) return
      const safeStart = Number.isFinite(video.duration) ? Math.min(start, Math.max(0, video.duration - 0.05)) : start
      if (Math.abs(video.currentTime - safeStart) > 0.15) {
        try { video.currentTime = safeStart } catch { /* O navegador ainda pode não permitir seek. */ }
      }
      video.playbackRate = clamp(source.videoPlaybackRate ?? 1, 0.25, 2)
      video.volume = clamp(source.videoVolume ?? 0.8, 0, 1)
      video.muted = source.videoMuted !== false
      void video.play().catch(() => { /* Reprodução automática com áudio pode ser bloqueada. */ })
    }
    if (video.readyState >= 1) initialize()
    else video.addEventListener('loadedmetadata', initialize, { once: true })
    return () => video.removeEventListener('loadedmetadata', initialize)
  }, [resolvedSrc, index, start, source.videoPlaybackRate, source.videoVolume, source.videoMuted])

  function advanceClip(video: HTMLVideoElement) {
    if (advancingRef.current) return
    if (index < clips.length - 1) {
      advancingRef.current = true
      setClipIndex(index + 1)
      return
    }
    if (shouldLoop) {
      advancingRef.current = true
      setClipIndex(0)
      return
    }
    video.pause()
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget
    if (end > start + 0.05 && video.currentTime >= end) {
      if (playlistMode && clips.length > 1) advanceClip(video)
      else if (shouldLoop) {
        video.currentTime = Math.min(start, Math.max(0, (video.duration || start) - 0.05))
        void video.play().catch(() => undefined)
      } else video.pause()
    }
  }

  function handleEnded(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget
    if (playlistMode && clips.length > 1) advanceClip(video)
    else if (shouldLoop) {
      video.currentTime = Math.min(start, Math.max(0, (video.duration || start) - 0.05))
      void video.play().catch(() => undefined)
    }
  }

  if (!clip || !resolvedSrc) return <div className={`${className} video-source-placeholder`} aria-label="Vídeo não disponível" />
  return <video
    ref={videoRef}
    className={className}
    src={resolvedSrc}
    autoPlay
    playsInline
    preload="auto"
    muted={source.videoMuted !== false}
    loop={false}
    onLoadedMetadata={(event) => {
      const video = event.currentTarget
      const safeStart = Number.isFinite(video.duration) ? Math.min(start, Math.max(0, video.duration - 0.05)) : start
      try { video.currentTime = safeStart } catch { /* O efeito volta a tentar quando os metadados estiverem prontos. */ }
      advancingRef.current = false
    }}
    onTimeUpdate={handleTimeUpdate}
    onEnded={handleEnded}
    onError={() => { const video = videoRef.current; if (video && playlistMode && clips.length > 1 && index < clips.length - 1) advanceClip(video) }}
    style={{ objectFit: fit ?? source.objectFit ?? 'cover', objectPosition: position ?? source.objectPosition ?? 'center center', filter: `brightness(${source.videoBrightness ?? 1}) contrast(${source.videoContrast ?? 1}) saturate(${source.videoSaturation ?? 1}) hue-rotate(${source.videoHueRotate ?? 0}deg)` }}
  />
}

function VideoSourceControls({ source, onChange, onAddClips }: { source: SceneSource; onChange: (changes: Partial<SceneSource>) => void; onAddClips: () => void }) {
  const resolvedSrc = useResolvedVideoSrc(source.src)
  const [duration, setDuration] = useState(0)
  const [mediaError, setMediaError] = useState('')
  const [urlDraft, setUrlDraft] = useState(source.src?.startsWith('http') ? source.src : '')
  const [urlError, setUrlError] = useState('')
  const maxTime = duration > 0 ? duration : 60
  const start = clamp(source.videoStart ?? 0, 0, maxTime)
  const end = source.videoEnd && source.videoEnd > 0 ? clamp(source.videoEnd, start + 0.1, Math.max(start + 0.1, maxTime)) : maxTime
  const trimActive = source.videoTrimEnabled === true

  useEffect(() => {
    setUrlDraft(source.src?.startsWith('http') ? source.src : '')
    setMediaError('')
    setDuration(0)
  }, [source.src])

  function setStart(value: number) {
    const nextStart = clamp(value, 0, Math.max(0, maxTime - 0.1))
    const nextChanges: Partial<SceneSource> = { videoStart: nextStart, videoTrimEnabled: true }
    if ((source.videoEnd ?? 0) > 0 && (source.videoEnd ?? 0) <= nextStart) nextChanges.videoEnd = Math.min(maxTime, nextStart + 0.1)
    onChange(nextChanges)
  }

  function applyVideoUrl() {
    try {
      const parsed = new URL(urlDraft.trim())
      if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') || parsed.href.length > 2000) throw new Error('URL inválida')
      onChange({ src: parsed.href, videoClips: undefined, videoStart: 0, videoEnd: 0, videoTrimEnabled: false })
      setUrlError('')
    } catch {
      setUrlError('Digite um link direto de vídeo começando com https:// ou http://. A URL deve apontar para o arquivo de vídeo, não para uma página comum.')
    }
  }

  return <div className="video-source-controls">
    <p className="eyebrow section-eyebrow">VÍDEO · MP4, WEBM E OUTROS</p>
    <video
      className="video-inspector-preview"
      src={resolvedSrc}
      controls
      playsInline
      preload="metadata"
      muted={source.videoMuted !== false}
      onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onError={() => setMediaError('O navegador não conseguiu decodificar este vídeo. Tente MP4 com vídeo H.264 ou WebM com VP8/VP9.') }
    />
    <p className="field-hint">{duration > 0 ? `Duração do arquivo: ${formatMediaTime(duration)}.` : source.src?.startsWith('idb-video://') && !resolvedSrc ? 'O vídeo local não foi encontrado neste navegador. Importe o arquivo novamente.' : 'Aguardando o navegador ler a duração do vídeo.'} {source.videoClips?.length ? 'Esta prévia mostra o primeiro clipe; a sequência completa toca na composição.' : 'A prévia aqui tem controles para você conferir o arquivo.'}</p>
    {mediaError && <p className="error-note">{mediaError}</p>}

    {!source.videoClips?.length && <>
    <label className="field-label" htmlFor="video-trim-start">Início do trecho · {formatMediaTime(start)}</label>
    <input id="video-trim-start" className="video-trim-range" type="range" min="0" max={Math.max(0.1, maxTime - 0.1)} step="0.1" value={start} onChange={(event) => setStart(Number(event.target.value))} />
    <label className="field-label" htmlFor="video-trim-end">Fim do trecho · {formatMediaTime(end)}</label>
    <input id="video-trim-end" className="video-trim-range" type="range" min={Math.min(maxTime, start + 0.1)} max={Math.max(maxTime, start + 0.1)} step="0.1" value={end} disabled={!trimActive} onChange={(event) => onChange({ videoTrimEnabled: true, videoEnd: Number(event.target.value) })} />
    <div className="video-time-inputs">
      <label><span>Início (segundos)</span><input className="text-input" type="number" min="0" max={Math.max(0, maxTime - 0.1)} step="0.1" value={Math.round(start * 10) / 10} onChange={(event) => setStart(Number(event.target.value) || 0)} /></label>
      <label><span>Fim (segundos)</span><input className="text-input" type="number" min={Math.min(maxTime, start + 0.1)} max={Math.max(maxTime, start + 0.1)} step="0.1" value={source.videoEnd && source.videoEnd > 0 ? Math.round(source.videoEnd * 10) / 10 : Math.round(maxTime * 10) / 10} onChange={(event) => onChange({ videoTrimEnabled: true, videoEnd: clamp(Number(event.target.value) || maxTime, start + 0.1, Math.max(maxTime, start + 0.1)) })} /></label>
    </div>
    <label className="field-hint video-checkline"><input type="checkbox" checked={Boolean(trimActive)} onChange={(event) => { if (event.target.checked) onChange({ videoTrimEnabled: true, videoStart: 0, videoEnd: duration > 0 ? duration : 10 }); else onChange({ videoTrimEnabled: false, videoStart: 0, videoEnd: 0 }) }} /> Ativar corte de trecho</label>
    <p className="field-hint">Use Início e Fim para reproduzir só uma parte. Desmarcar o corte volta a usar o vídeo inteiro.</p>
    </>}
    {source.videoClips && source.videoClips.length > 0 && <div className="video-playlist-manager">
      <p className="eyebrow">SEQUÊNCIA DE VÍDEOS · {source.videoClips.length} CLIPES</p>
      <p className="field-hint">Todos os clipes são reproduzidos em sequência dentro de uma única camada. Arraste a camada como um único banner; cada trecho pode ter seu próprio corte.</p>
      {source.videoClips.map((clip, index, clips) => <div className="video-playlist-row" key={clip.id}>
        <div className="video-playlist-row-heading"><strong>{index + 1}. {clip.name}</strong><div>
          <button type="button" disabled={index === 0} aria-label="Mover clipe para cima" onClick={() => { const next = [...clips]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange({ videoClips: next, src: next[0].src }) }}>↑</button>
          <button type="button" disabled={index === clips.length - 1} aria-label="Mover clipe para baixo" onClick={() => { const next = [...clips]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange({ videoClips: next, src: next[0].src }) }}>↓</button>
          <button type="button" disabled={clips.length <= 1} aria-label="Remover clipe da sequência" onClick={() => { const next = clips.filter((item) => item.id !== clip.id); if (next.length > 1) onChange({ videoClips: next, src: next[0].src }); else if (next.length === 1) onChange({ videoClips: undefined, src: next[0].src, videoStart: next[0].start ?? 0, videoEnd: next[0].end ?? 0, videoTrimEnabled: next[0].trimEnabled === true }) }}>×</button>
        </div></div>
        <div className="video-playlist-trim-grid">
          <label>Início (s)<input className="text-input" type="number" min="0" max="3600" step="0.1" value={clip.start ?? 0} onChange={(event) => onChange({ videoClips: clips.map((item) => item.id === clip.id ? { ...item, start: Math.max(0, Number(event.target.value) || 0), trimEnabled: true } : item) })} /></label>
          <label>Fim (s, 0 = final)<input className="text-input" type="number" min="0" max="3600" step="0.1" value={clip.end ?? 0} onChange={(event) => onChange({ videoClips: clips.map((item) => item.id === clip.id ? { ...item, end: Math.max(0, Number(event.target.value) || 0), trimEnabled: true } : item) })} /></label>
        </div>
        <label className="checkbox-row"><input type="checkbox" checked={clip.trimEnabled === true} onChange={(event) => onChange({ videoClips: clips.map((item) => item.id === clip.id ? { ...item, trimEnabled: event.target.checked } : item) })} /><span>Cortar este clipe</span></label>
      </div>)}
      <button className="wide-action" type="button" onClick={onAddClips}>+ Acrescentar vídeos à sequência</button>
    </div>}

    <div className="field-divider" />
    <label className="lock-toggle"><input type="checkbox" checked={source.videoLoop !== false} onChange={(event) => onChange({ videoLoop: event.target.checked })} /><span>Repetir em loop</span></label>
    <label className="lock-toggle"><input type="checkbox" checked={source.videoMuted !== false} onChange={(event) => onChange({ videoMuted: event.target.checked })} /><span>Silenciar áudio</span></label>
    <label className="field-label" htmlFor="video-volume">Volume · {Math.round((source.videoVolume ?? 0.8) * 100)}%</label>
    <input id="video-volume" className="video-trim-range" type="range" min="0" max="1" step="0.05" value={source.videoVolume ?? 0.8} disabled={source.videoMuted !== false} onChange={(event) => onChange({ videoVolume: Number(event.target.value) })} />
    <label className="field-label" htmlFor="video-speed">Velocidade de reprodução</label>
    <select id="video-speed" className="text-input" value={source.videoPlaybackRate ?? 1} onChange={(event) => onChange({ videoPlaybackRate: Number(event.target.value) })}><option value="0.25">0,25×</option><option value="0.5">0,5×</option><option value="0.75">0,75×</option><option value="1">Normal · 1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select>
    <div className="field-divider" />
    <p className="eyebrow section-eyebrow">COR E FILTROS</p>
    <label className="field-label" htmlFor="video-brightness">Brilho · {Math.round((source.videoBrightness ?? 1) * 100)}%</label>
    <input id="video-brightness" className="video-trim-range" type="range" min="0" max="2" step="0.05" value={source.videoBrightness ?? 1} onChange={(event) => onChange({ videoBrightness: Number(event.target.value) })} />
    <label className="field-label" htmlFor="video-contrast">Contraste · {Math.round((source.videoContrast ?? 1) * 100)}%</label>
    <input id="video-contrast" className="video-trim-range" type="range" min="0" max="2" step="0.05" value={source.videoContrast ?? 1} onChange={(event) => onChange({ videoContrast: Number(event.target.value) })} />
    <label className="field-label" htmlFor="video-saturation">Saturação · {Math.round((source.videoSaturation ?? 1) * 100)}%</label>
    <input id="video-saturation" className="video-trim-range" type="range" min="0" max="2" step="0.05" value={source.videoSaturation ?? 1} onChange={(event) => onChange({ videoSaturation: Number(event.target.value) })} />
    <label className="field-label" htmlFor="video-hue">Matiz · {Math.round(source.videoHueRotate ?? 0)}°</label>
    <input id="video-hue" className="video-trim-range" type="range" min="0" max="360" step="5" value={source.videoHueRotate ?? 0} onChange={(event) => onChange({ videoHueRotate: Number(event.target.value) })} />
    <label className="field-label" htmlFor="video-direct-url">Ou importar de uma URL direta</label>
    <input id="video-direct-url" className="text-input" type="url" value={urlDraft} onChange={(event) => { setUrlDraft(event.target.value); setUrlError('') }} placeholder="https://site.com/banner.mp4" />
    <button className="wide-action" type="button" onClick={applyVideoUrl}>Aplicar URL do vídeo</button>
    {urlError && <p className="error-note">{urlError}</p>}
    {source.src?.startsWith('idb-video://') && !resolvedSrc && <p className="error-note">Este vídeo não foi localizado no armazenamento deste navegador. Importe o arquivo novamente ou recupere o projeto JSON que contém a mídia.</p>}
    <p className="field-hint">Formatos aceitos na importação: MP4/M4V, WebM, OGV/OGG, MOV, 3GP, MKV, AVI e MPEG. A reprodução depende do navegador e do codec interno; MP4/H.264 é geralmente a opção mais compatível. Links diretos podem falhar se o servidor bloquear a reprodução.</p>
  </div>
}


const WIDGET_STYLE_KEYS = [
  'widgetTheme', 'widgetVariant', 'widgetAccent', 'widgetShowHeader', 'widgetCompact', 'widgetBackgroundColor',
  'widgetBackgroundOpacity', 'widgetTextColor', 'widgetTitleColor', 'widgetBorderColor',
  'widgetBorderWidth', 'widgetRadius', 'widgetPadding', 'widgetGap', 'widgetFontFamily',
  'widgetFontUrl', 'widgetShowIcon', 'widgetAnimation', 'widgetShowBackground',
  'widgetShowBorder', 'widgetShowShadow', 'widgetBackdropBlur', 'widgetFontSize', 'widgetFontWeight',
  'widgetLineHeight', 'widgetLetterSpacing', 'widgetTitleSize', 'widgetTitleLetterSpacing', 'widgetTextAlign',
  'widgetBackgroundImage', 'widgetBackgroundImageFit', 'widgetBackgroundImageOpacity', 'widgetBackgroundImagePosition',
  'widgetSubtitleColor', 'widgetValueColor', 'widgetTrackColor', 'widgetFillColor', 'widgetItemBackgroundColor',
  'widgetItemBorderColor', 'chatBubbleEnabled', 'chatBubbleColor', 'chatBubbleOpacity', 'chatBubbleRadius',
  'chatBubblePaddingX', 'chatBubblePaddingY', 'chatBubbleBorderColor', 'chatBubbleBorderWidth',
  'chatUsernameColorMode', 'chatUsernameColor', 'chatNameColors', 'chatBubbleColors', 'chatLayout', 'chatUsernamePill',
  'chatUsernamePillColor', 'chatUsernamePillOpacity', 'chatUsernamePillRadius', 'chatUsernamePillPaddingX', 'chatUsernamePillPaddingY', 'chatUsernamePillBorderColor', 'chatUsernamePillBorderWidth', 'chatBubbleShadow', 'chatUsernameFontFamily', 'chatMessageFontFamily', 'chatUsernameFontWeight', 'chatMessageLineHeight', 'chatMessageColor', 'chatTimestampColor',
  'chatUsernameFontSize', 'chatMessageFontSize', 'chatLineGap', 'chatShowInput', 'chatShowTimestamp',
  'chatTextShadow', 'chatShowBadges', 'chatUsernamePlacement', 'socialProfiles', 'goalFreeLayout', 'goalPartEditMode', 'goalParts', 'frameOverlayImage', 'clockShowDate', 'clockShowSeconds', 'clock24h', 'clockDateFormat',
  'clockColor', 'clockDateColor', 'clockTextShadow', 'widgetTitle', 'widgetText', 'widgetValue', 'widgetTarget', 'widgetItems', 'widgetMaxItems',
] as const

function downloadWidgetStyle(source: SceneSource) {
  const settings: Record<string, unknown> = {}
  for (const key of WIDGET_STYLE_KEYS) {
    const value = source[key]
    if (value !== undefined) settings[key] = value
  }
  const blob = new Blob([JSON.stringify({ format: 'webcam-overlay-widget-style', version: 1, widgetKind: source.widgetKind ?? 'custom', settings }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeFileName(source.name)}-estilo-widget.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function App() {
  const overlayMode = new URLSearchParams(window.location.search).get('mode') === 'overlay'
  return overlayMode ? <OverlayView /> : <Editor />
}

function Editor() {
  const [project, setProject] = useState<Project>(() => readProject())
  const projectRef = useRef(project)
  const projectRelaySocketRef = useRef<WebSocket | null>(null)
  const relayUploadedAssetRefsRef = useRef<Set<string>>(new Set())
  const relayPendingAssetUploadsRef = useRef<Map<string, Promise<boolean>>>(new Map())
  projectRef.current = project
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false)
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('layers')
  const [elementSection, setElementSection] = useState<ElementSection>('content')
  const [backgroundUrlInput, setBackgroundUrlInput] = useState('')
  const [backgroundVideoUrlInput, setBackgroundVideoUrlInput] = useState('')
  const [widgetBackgroundUrlDraft, setWidgetBackgroundUrlDraft] = useState('')
  const [widgetSearch, setWidgetSearch] = useState('')
  const [showPackMenu, setShowPackMenu] = useState(false)
  const [alertTestTokens, setAlertTestTokens] = useState<Record<string, number>>({})
  const [message, setMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'editing' | 'error'>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [relayStatus, setRelayStatus] = useState<'connecting' | 'connected' | 'offline' | 'external'>('connecting')
  const [showCompositionGuides, setShowCompositionGuides] = useState(false)
  const [showSafeArea, setShowSafeArea] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [interaction, setInteraction] = useState<Interaction | null>(null)
  const [selectedGoalPartId, setSelectedGoalPartId] = useState<string | null>(null)
  const [pendingGoalPartImageId, setPendingGoalPartImageId] = useState<string | null>(null)
  const [frameOverlayUrlDraft, setFrameOverlayUrlDraft] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [openSceneMenuId, setOpenSceneMenuId] = useState<string | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const undoStackRef = useRef<Project[]>([])
  const redoStackRef = useRef<Project[]>([])
  const historySnapshotRef = useRef<Project>(project)
  const stageRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const videoPlaylistTargetRef = useRef<string | null>(null)
  const backgroundDesignInputRef = useRef<HTMLInputElement>(null)
  const backgroundVideoInputRef = useRef<HTMLInputElement>(null)
  const backgroundPlaylistAppendTargetRef = useRef<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const widgetStyleInputRef = useRef<HTMLInputElement>(null)
  const widgetBackgroundInputRef = useRef<HTMLInputElement>(null)
  const frameOverlayInputRef = useRef<HTMLInputElement>(null)
  const goalPartImageInputRef = useRef<HTMLInputElement>(null)
  const animatedThemeInputRef = useRef<HTMLInputElement>(null)
  const slideshowInputRef = useRef<HTMLInputElement>(null)
  const slideshowImportModeRef = useRef<'append' | 'replace'>('append')
  const slideshowTargetSceneRef = useRef<string | null>(null)

  // O evento nativo `cancel` não está exposto como prop JSX em algumas versões dos tipos React.
  // Registramos o listener diretamente no input para limpar o destino se o seletor de arquivos for cancelado.
  useEffect(() => {
    const videoInput = videoInputRef.current
    const backgroundInput = backgroundVideoInputRef.current
    const clearVideoTarget = () => { videoPlaylistTargetRef.current = null }
    const clearBackgroundTarget = () => { backgroundPlaylistAppendTargetRef.current = null }

    videoInput?.addEventListener('cancel', clearVideoTarget)
    backgroundInput?.addEventListener('cancel', clearBackgroundTarget)

    return () => {
      videoInput?.removeEventListener('cancel', clearVideoTarget)
      backgroundInput?.removeEventListener('cancel', clearBackgroundTarget)
    }
  }, [])

  const activeScene = useMemo(
    () => project.scenes.find((scene) => scene.id === project.activeSceneId) ?? project.scenes[0],
    [project],
  )
  const selectedSource = activeScene?.sources.find((source) => source.id === selectedSourceId) ?? null

  useEffect(() => {
    if (!selectedGoalPartId) return
    const isSelectedGoal = selectedSource?.type === 'widget' && selectedSource.widgetKind === 'goal' && selectedSource.goalFreeLayout === true
    const goalParts = selectedSource && Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : []
    if (!isSelectedGoal || !goalParts.some((part) => part.id === selectedGoalPartId)) setSelectedGoalPartId(null)
  }, [selectedSource?.id, selectedSource?.type, selectedSource?.widgetKind, selectedSource?.goalFreeLayout, selectedSource?.goalParts, selectedGoalPartId])

  useEffect(() => {
    setWidgetBackgroundUrlDraft(selectedSource?.type === 'widget' && selectedSource.widgetBackgroundImage?.startsWith('http') ? selectedSource.widgetBackgroundImage : '')
  }, [selectedSource?.id, selectedSource?.widgetBackgroundImage])

  useEffect(() => {
    setFrameOverlayUrlDraft(selectedSource?.type === 'widget' && selectedSource.widgetKind === 'webcam-frame' && selectedSource.frameOverlayImage?.startsWith('http') ? selectedSource.frameOverlayImage : '')
  }, [selectedSource?.id, selectedSource?.frameOverlayImage])

  useEffect(() => {
    // Evita gravar no localStorage a cada movimento do mouse enquanto o usuário arrasta.
    if (interaction) {
      setSaveStatus('editing')
      return
    }
    if (persistProject(project)) {
      setSaveStatus('saved')
      setLastSavedAt(new Date())
    } else {
      setSaveStatus('error')
      setMessage('O projeto excede o limite seguro de armazenamento deste navegador. Exporte o JSON antes de adicionar mais imagens ou remova assets grandes.')
    }
  }, [project, interaction])

  useEffect(() => {
    const isLoopback = ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.protocol === 'http:'
    if (!isLoopback) {
      setRelayStatus('external')
      return
    }
    setRelayStatus('connecting')
    let disposed = false
    let socket: WebSocket | null = null
    let retryTimer: number | undefined
    const publishCurrentProject = () => {
      if (!socket || socket.readyState !== WebSocket.OPEN || interaction) return
      relayUploadedAssetRefsRef.current.clear()
      void prepareProjectForRelay(projectRef.current, relayUploadedAssetRefsRef.current, relayPendingAssetUploadsRef.current).then((relayProject) => {
        if (!socket || socket.readyState !== WebSocket.OPEN || disposed) return
        socket.send(JSON.stringify({ type: 'project-sync', action: 'publish', captureKey: 'webcam-overlay-project-sync', project: relayProject }))
      }).catch((error: unknown) => {
        setMessage(`A sincronização local com o OBS falhou: ${error instanceof Error ? error.message : 'erro ao preparar mídia'}`)
      })
    }
    const connect = () => {
      if (disposed) return
      setRelayStatus('connecting')
      try {
        socket = new WebSocket('ws://127.0.0.1:4174')
        projectRelaySocketRef.current = socket
        socket.onopen = () => {
          setRelayStatus('connected')
          publishCurrentProject()
        }
        socket.onclose = () => {
          if (projectRelaySocketRef.current === socket) projectRelaySocketRef.current = null
          if (!disposed) {
            setRelayStatus('offline')
            retryTimer = window.setTimeout(connect, 1500)
          }
        }
        socket.onerror = () => setRelayStatus('offline')
      } catch {
        setRelayStatus('offline')
        if (!disposed) retryTimer = window.setTimeout(connect, 1500)
      }
    }
    connect()
    return () => {
      disposed = true
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
      if (socket && socket.readyState < WebSocket.CLOSING) socket.close()
      if (projectRelaySocketRef.current === socket) projectRelaySocketRef.current = null
    }
  }, [])

  useEffect(() => {
    if (interaction) return
    const timeout = window.setTimeout(() => {
      const socket = projectRelaySocketRef.current
      if (!socket || socket.readyState !== WebSocket.OPEN) return
      void prepareProjectForRelay(project, relayUploadedAssetRefsRef.current, relayPendingAssetUploadsRef.current).then((relayProject) => {
        if (socket.readyState !== WebSocket.OPEN) return
        socket.send(JSON.stringify({ type: 'project-sync', action: 'publish', captureKey: 'webcam-overlay-project-sync', project: relayProject }))
      }).catch((error: unknown) => {
        setMessage(`Não foi possível atualizar o projeto na Browser Source do OBS: ${error instanceof Error ? error.message : 'erro ao preparar mídia'}`)
      })
    }, 120)
    return () => window.clearTimeout(timeout)
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

  function updateGoalPart(partId: string, changes: Partial<GoalPart>) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'goal') return
    const parts = Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : createDefaultGoalParts()
    updateSelected({ goalParts: parts.map((part) => part.id === partId ? { ...part, ...changes } : part) })
  }

  function addGoalPart(type: GoalPartKind) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'goal') return
    const parts = Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : createDefaultGoalParts()
    if (parts.length >= 100) { setMessage('Esta barra já tem 100 partes. Remova uma parte antes de adicionar outra.'); return }
    const id = `goal-part-${Date.now().toString(36)}`
    const labels: Record<GoalPartKind, string> = { title: 'Título', subtitle: 'Descrição', current: 'Valor atual', separator: '/', target: 'Valor da meta', percent: 'Percentual', bar: 'Barra de progresso', footer: 'Texto auxiliar', 'custom-text': 'Novo texto', icon: '♥', shape: 'Forma', image: 'Imagem' }
    const part: GoalPart = { id, type, label: labels[type], visible: true, x: type === 'bar' ? 10 : 32, y: type === 'bar' ? 58 : 35, w: type === 'bar' ? 80 : type === 'image' || type === 'shape' ? 20 : 35, h: type === 'bar' ? 14 : type === 'image' || type === 'shape' ? 22 : 18, fontSize: 13, color: type === 'shape' ? '#7776ff' : '#ffffff', fontWeight: 700, align: 'left', radius: 4, padding: 0, shapeKind: 'rectangle', opacity: 1, rotation: 0, objectFit: 'contain' }
    updateSelected({ goalFreeLayout: true, goalPartEditMode: true, goalParts: [...parts, part] })
    setSelectedGoalPartId(id)
    if (type === 'image') { setPendingGoalPartImageId(id); goalPartImageInputRef.current?.click() }
  }

  function removeGoalPart(partId: string) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'goal') return
    const parts = Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : createDefaultGoalParts()
    const remaining = parts.filter((part) => part.id !== partId)
    updateSelected({ goalParts: remaining })
    if (selectedGoalPartId === partId) setSelectedGoalPartId(remaining[0]?.id ?? null)
  }

  function moveGoalPart(partId: string, direction: -1 | 1) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'goal') return
    const parts = [...(Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : createDefaultGoalParts())]
    const index = parts.findIndex((part) => part.id === partId)
    const destination = index + direction
    if (index < 0 || destination < 0 || destination >= parts.length) return
    const [part] = parts.splice(index, 1)
    parts.splice(destination, 0, part)
    updateSelected({ goalParts: parts })
  }

  function duplicateGoalPart(partId: string) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'goal') return
    const parts = [...(Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : createDefaultGoalParts())]
    const original = parts.find((part) => part.id === partId)
    if (!original || parts.length >= 100) { if (parts.length >= 100) setMessage('Esta barra já tem 100 partes. Remova uma parte antes de duplicar.'); return }
    const copy: GoalPart = { ...original, id: `goal-part-${Date.now().toString(36)}`, label: `${original.label || original.type} cópia`, x: clamp(original.x + 2, 0, 100 - original.w), y: clamp(original.y + 2, 0, 100 - original.h) }
    const index = parts.findIndex((part) => part.id === partId)
    parts.splice(index + 1, 0, copy)
    updateSelected({ goalParts: parts, goalFreeLayout: true, goalPartEditMode: true })
    setSelectedGoalPartId(copy.id)
  }

  async function onGoalPartImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    const partId = pendingGoalPartImageId
    setPendingGoalPartImageId(null)
    if (!file || !partId) return
    if (!file.type.startsWith('image/')) { setMessage('Escolha um arquivo de imagem para usar na barra de meta.'); return }
    if (file.size > MAX_IMAGE_BYTES) { setMessage('A imagem da barra deve ter até 1,5 MB.'); return }
    try {
      const src = await parseLocalImageData(file)
      if (!isSafeImageSource(src)) throw new Error('Imagem inválida')
      const activeSource = projectRef.current.scenes.find((scene) => scene.id === projectRef.current.activeSceneId)?.sources.find((source) => source.id === selectedSourceId)
      if (!activeSource || activeSource.widgetKind !== 'goal') return
      const parts = Array.isArray(activeSource.goalParts) ? activeSource.goalParts : createDefaultGoalParts()
      const updatedParts = parts.map((part) => part.id === partId ? { ...part, src, label: file.name.slice(0, 120) } : part)
      const candidateProject: Project = { ...projectRef.current, scenes: projectRef.current.scenes.map((scene) => scene.id !== projectRef.current.activeSceneId ? scene : { ...scene, sources: scene.sources.map((item) => item.id === activeSource.id ? { ...item, goalParts: updatedParts, goalFreeLayout: true } : item) }) }
      if (JSON.stringify(candidateProject).length > MAX_LOCAL_PROJECT_CHARS) { setMessage('Esta imagem ultrapassaria o limite de armazenamento local. Use uma imagem menor ou remova assets antigos.'); return }
      setProject(candidateProject)
      setMessage(`Imagem “${file.name}” adicionada à barra de meta.`)
    } catch {
      setMessage('Não foi possível importar essa imagem para a barra de meta.')
    }
  }

  function updateChatNamedColor(field: 'name' | 'bubble', username: string, color: string) {
    if (!selectedSource) return
    const property = field === 'name' ? 'chatNameColors' : 'chatBubbleColors'
    const map = parseNamedColors(selectedSource[property])
    map[username.toLowerCase()] = color
    const visibleNames = Object.keys(map)
    const encoded = visibleNames.map((name) => `${name}=${map[name]}`).join('\n')
    updateSelected({ [property]: encoded } as Partial<SceneSource>)
  }

  function updateSocialProfiles(next: SocialProfile[]) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'socials') return
    const clean = next.slice(0, 30).map((profile, index) => ({ ...profile, id: profile.id || `social-${index + 1}`, platform: profile.platform.slice(0, 60), account: profile.account.slice(0, 100) }))
    updateSelected({ socialProfiles: clean, widgetItems: clean.map((profile) => `${profile.platform} · ${profile.account}`).join('\n') })
  }

  function updateSocialProfile(index: number, changes: Partial<SocialProfile>) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'socials') return
    const profiles = getSocialProfiles(selectedSource)
    updateSocialProfiles(profiles.map((profile, profileIndex) => profileIndex === index ? { ...profile, ...changes } : profile))
  }

  function addSocialProfile() {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'socials') return
    const profiles = getSocialProfiles(selectedSource)
    updateSocialProfiles([...profiles, { id: `social-${Date.now().toString(36)}`, platform: 'Nova rede', account: '@seuperfil' }])
  }

  function removeSocialProfile(index: number) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'socials') return
    updateSocialProfiles(getSocialProfiles(selectedSource).filter((_, profileIndex) => profileIndex !== index))
  }

  function moveSocialProfile(index: number, direction: -1 | 1) {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'socials') return
    const profiles = [...getSocialProfiles(selectedSource)]
    const destination = index + direction
    if (destination < 0 || destination >= profiles.length) return
    const [moved] = profiles.splice(index, 1)
    profiles.splice(destination, 0, moved)
    updateSocialProfiles(profiles)
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
    clearSelection('layers')
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
    clearSelection('layers')
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
    clearSelection('layers')
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
    clearSelection('layers')
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
    clearSelection('layers')
    setInspectorTab('layers')
  }

  function addSource(type: Exclude<SourceType, 'widget'>) {
    if (type === 'image') {
      imageInputRef.current?.click()
      setSourceMenuOpen(false)
      return
    }
    if (type === 'video') {
      videoInputRef.current?.click()
      setSourceMenuOpen(false)
      return
    }
    const count = activeScene.sources.filter((source) => source.type === type).length + 1
    const defaults: Record<Exclude<SourceType, 'image' | 'video' | 'widget'>, Partial<SceneSource>> = {
      text: { x: 7 + (Math.floor((count - 1) / 5) % 2) * 47, y: 8 + ((count - 1) % 5) * 15, w: 42, h: 10, text: 'Seu texto', color: '#ffffff', fontSize: 34, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 750, textAlign: 'left', letterSpacing: -0.5, lineHeight: 1.12 },
      shape: { x: 38, y: 30, w: 20, h: 22, color: '#7772f2', radius: 10, shapeKind: 'rectangle' },
      camera: { x: 35, y: 20, w: 30, h: 45, radius: 5, cameraMirror: true },
      capture: { x: 26, y: 20, w: 48, h: 42, radius: 4 },
      browser: { x: 32, y: 25, w: 36, h: 34, url: 'https://example.com', radius: 4 },
    }
    const source: SceneSource = placeWithoutOverlap(activeScene.sources, {
      id: newId('source'), type, name: `${sourceLabel(type)} ${count}`, visible: true,
      ...defaults[type],
    } as SceneSource)
    updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, source] }))
    selectSource(source.id, 'element')
    setElementSection('content')
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
      widgetShowHeader: kind === 'chat' || kind === 'clock' ? false : true, widgetCompact: false,
      widgetShowBackground: kind === 'chat' || kind === 'clock' ? false : true,
      widgetShowBorder: kind === 'chat' || kind === 'clock' ? false : true,
      widgetShowShadow: kind === 'chat' || kind === 'clock' ? false : true,
      widgetBackdropBlur: kind === 'chat' || kind === 'clock' ? 0 : (preset.theme === 'glass' ? 8 : 0),
      ...(kind === 'chat' ? { chatBubbleEnabled: true, chatBubbleColor: '#e979b2', chatBubbleOpacity: 0.88, chatBubbleRadius: 18, chatBubblePaddingX: 10, chatBubblePaddingY: 6, chatBubbleBorderWidth: 0, chatUsernameColorMode: 'palette' as const, chatMessageColor: '#ffffff', chatShowInput: false, chatLineGap: 8 } : {}),
      ...(kind === 'clock' ? { clockShowDate: false, clockShowSeconds: true, clock24h: true, clockColor: '#ffffff', clockTextShadow: false, widgetFontSize: 48, widgetFontWeight: 800 } : {}),
    })
    updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, source] }))
    selectSource(source.id, 'element')
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
      if (JSON.stringify(nextProject).length > MAX_LOCAL_PROJECT_CHARS) {
        setMessage('Esses assets ultrapassariam o limite seguro de armazenamento do navegador. Remova imagens antigas ou importe arquivos menores.')
        return
      }
      setProject(nextProject)
      if (currentProject.activeSceneId === targetSceneId && additions.length) { selectSource(additions[additions.length - 1].id, 'element'); setElementSection('content') }
      const ignoredNote = ignoredCount ? ` ${ignoredCount} arquivo(s) sem suporte foram ignorados.` : ''
      setMessage(`${loaded.length} ${loaded.length === 1 ? 'elemento importado' : 'elementos importados'}. O posicionamento automático evitou sobreposições quando havia espaço.${ignoredNote}`)
    } catch {
      setMessage('Não foi possível ler um dos arquivos de imagem.')
    }
  }

  async function onVideoSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget as HTMLInputElement
    const files = Array.from(input.files ?? [])
    input.value = ''
    const requestedPlaylistTarget = videoPlaylistTargetRef.current
    videoPlaylistTargetRef.current = null
    if (files.length === 0) return

    const targetSceneId = activeScene.id
    const supportedExtensions = new Set(['mp4', 'm4v', 'webm', 'ogv', 'ogg', 'mov', '3gp', 'mkv', 'avi', 'wmv', 'mpeg', 'mpg', 'ts', 'm2ts'])
    const supported = files.filter((file) => {
      const extension = file.name.toLowerCase().split('.').pop() ?? ''
      return file.type.startsWith('video/') || supportedExtensions.has(extension)
    })
    const ignoredCount = files.length - supported.length
    if (supported.length === 0) {
      setMessage('Selecione vídeos como MP4, M4V, WebM, MOV, OGV/OGG, 3GP, MKV, AVI ou MPEG.')
      return
    }
    const tooLarge = supported.find((file) => file.size > MAX_VIDEO_BYTES)
    if (tooLarge) {
      setMessage(`“${tooLarge.name}” excede o limite de ${Math.round(MAX_VIDEO_BYTES / 1_000_000)} MB por vídeo.`)
      return
    }
    const totalBytes = supported.reduce((total, file) => total + file.size, 0)
    if (totalBytes > MAX_VIDEO_BATCH_BYTES) {
      setMessage(`A seleção excede o limite de ${Math.round(MAX_VIDEO_BATCH_BYTES / 1_000_000)} MB por lote. Importe os vídeos em grupos menores.`)
      return
    }

    let bytesAlreadyUsed = 0
    try {
      bytesAlreadyUsed = await getProjectVideoBytes(projectRef.current)
    } catch (error) {
      setMessage(`Não consegui verificar o espaço dos vídeos: ${error instanceof Error ? error.message : 'armazenamento indisponível'}`)
      return
    }
    if (bytesAlreadyUsed + totalBytes > MAX_VIDEO_PROJECT_BYTES) {
      setMessage(`O projeto aceita até ${Math.round(MAX_VIDEO_PROJECT_BYTES / 1_000_000)} MB de vídeos locais. Atualmente usa ${(bytesAlreadyUsed / 1_000_000).toFixed(1)} MB.`)
      return
    }

    const currentBeforeImport = projectRef.current
    const destination = currentBeforeImport.scenes.find((scene) => scene.id === targetSceneId)
    const appendTargetId = requestedPlaylistTarget ?? (
      selectedSource?.type === 'video' && destination?.sources.some((source) => source.id === selectedSource.id)
        && window.confirm(`Adicionar ${supported.length} vídeo(s) ao final da fonte “${selectedSource.name}”, formando uma única sequência? Clique em Cancelar para criar uma nova sequência ou importar como camadas separadas.`)
        ? selectedSource.id : null
    )
    const combineAsNewPlaylist = !appendTargetId && supported.length > 1 && window.confirm(`Criar uma única fonte sequencial com estes ${supported.length} vídeos? Eles tocarão um após o outro dentro de uma só camada. Clique em Cancelar para importar cada vídeo como camada separada.`)

    setMessage(`Importando ${supported.length} ${supported.length === 1 ? 'vídeo' : 'vídeos'} para o armazenamento local…`)
    const newReferences: string[] = []
    try {
      for (const file of supported) newReferences.push(await saveVideoBlob(file, file.name))
      const currentProject = projectRef.current
      const targetScene = currentProject.scenes.find((scene) => scene.id === targetSceneId)
      if (!targetScene) {
        await Promise.allSettled(newReferences.map(deleteVideoBlob))
        setMessage('A cena de destino não existe mais. Selecione a cena novamente e importe os arquivos.')
        return
      }
      const importedClips: VideoClip[] = supported.map((file, index) => ({ id: newId('clip'), name: file.name.replace(/\.[^.]+$/, '').slice(0, 100) || `Clipe ${index + 1}`, src: newReferences[index], start: 0, end: 0, trimEnabled: false }))
      let additions: SceneSource[] = []
      let updatedSources: SceneSource[] | null = null

      if (appendTargetId) {
        const target = targetScene.sources.find((source) => source.id === appendTargetId && source.type === 'video')
        if (!target) {
          await Promise.allSettled(newReferences.map(deleteVideoBlob))
          setMessage('A fonte selecionada não existe mais. Selecione um vídeo e tente novamente.')
          return
        }
        const existingClips: VideoClip[] = target.videoClips?.length ? target.videoClips : target.src ? [{ id: newId('clip'), name: target.name, src: target.src, start: target.videoStart ?? 0, end: target.videoEnd ?? 0, trimEnabled: target.videoTrimEnabled === true }] : []
        const nextClips = [...existingClips, ...importedClips].slice(0, 40)
        if (nextClips.length < existingClips.length + importedClips.length) {
          await Promise.allSettled(newReferences.map(deleteVideoBlob))
          setMessage('Uma sequência pode ter no máximo 40 clipes. Remova um clipe antes de acrescentar mais vídeos.')
          return
        }
        updatedSources = targetScene.sources.map((source) => source.id === target.id ? { ...source, src: nextClips[0].src, videoClips: nextClips, videoStart: 0, videoEnd: 0, videoTrimEnabled: false } : source)
      } else if (combineAsNewPlaylist) {
        const base: SceneSource = {
          id: newId('video-sequence'), type: 'video', name: `Sequência de vídeos (${importedClips.length} clipes)`, visible: true,
          x: 30, y: 30, w: 40, h: 24, src: importedClips[0].src, videoClips: importedClips,
          objectFit: 'contain', objectPosition: 'center center', radius: 6, rotation: 0, opacity: 1, shadow: false,
          videoStart: 0, videoEnd: 0, videoTrimEnabled: false, videoLoop: targetScene.background?.videoLoop ?? true, videoMuted: targetScene.background?.videoMuted ?? true, videoVolume: targetScene.background?.videoVolume ?? 0.8, videoPlaybackRate: targetScene.background?.videoPlaybackRate ?? 1,
        }
        additions = [placeWithoutOverlap(targetScene.sources, base)]
      } else {
        let placedSources = [...targetScene.sources]
        additions = supported.map((file, index) => {
          const count = placedSources.filter((source) => source.type === 'video').length + 1
          const candidate: SceneSource = {
            id: newId('video'), type: 'video', name: file.name.replace(/\.[^.]+$/, '').slice(0, 60) || `Vídeo ${count}`,
            visible: true, x: 30, y: 30, w: 40, h: 24, src: newReferences[index], objectFit: 'contain', objectPosition: 'center center',
            radius: 6, rotation: 0, opacity: 1, shadow: false,
            videoStart: 0, videoEnd: 0, videoTrimEnabled: false, videoLoop: true, videoMuted: true, videoVolume: 0.8, videoPlaybackRate: 1,
          }
          const placed = placeWithoutOverlap(placedSources, candidate)
          placedSources = [...placedSources, placed]
          return placed
        })
      }

      const nextProject: Project = {
        ...currentProject,
        scenes: currentProject.scenes.map((scene) => scene.id === targetSceneId ? {
          ...scene,
          sources: updatedSources ?? [...scene.sources, ...additions],
        } : scene),
      }
      if (JSON.stringify(nextProject).length > MAX_LOCAL_PROJECT_CHARS) {
        await Promise.allSettled(newReferences.map(deleteVideoBlob))
        setMessage('O projeto excede o limite seguro de armazenamento das configurações. Use clipes menores ou remova outros elementos.')
        return
      }
      setProject(nextProject)
      const selectedId = appendTargetId ?? additions[0]?.id
      if (selectedId) {
        selectSource(selectedId, 'element')
        setElementSection('content')
      }
      const ignoredNote = ignoredCount ? ` ${ignoredCount} arquivo(s) sem suporte foram ignorados.` : ''
      const totalMB = (totalBytes / 1_000_000).toFixed(1)
      const resultLabel = appendTargetId ? `${supported.length} clipe(s) adicionados à sequência` : combineAsNewPlaylist ? `Uma sequência com ${supported.length} clipes criada` : `${additions.length} vídeo(s) importado(s)`
      setMessage(`${resultLabel} (${totalMB} MB). Os arquivos ficam no IndexedDB deste navegador; exporte o JSON para transportá-los.${ignoredNote}`)
    } catch (error) {
      await Promise.allSettled(newReferences.map(deleteVideoBlob))
      setMessage(`Não foi possível importar os vídeos: ${error instanceof Error ? error.message : 'erro de armazenamento'}`)
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

  async function onSlideshowImagesSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const files = Array.from(input.files ?? [])
    input.value = ''
    if (!files.length) return
    const mode = slideshowImportModeRef.current
    const targetSceneId = slideshowTargetSceneRef.current ?? activeScene.id
    slideshowTargetSceneRef.current = null
    slideshowImportModeRef.current = 'append'
    const supported = files.filter((file) => /^(image\/(png|jpeg|webp|gif|svg\+xml|avif))$/i.test(file.type) || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name))
    if (!supported.length) { setMessage('Escolha imagens PNG, JPG, WebP, GIF, SVG ou AVIF.'); return }
    const tooLarge = supported.find((file) => file.size > MAX_IMAGE_BYTES)
    if (tooLarge) { setMessage(`“${tooLarge.name}” ultrapassa 1,5 MB. Comprima ou redimensione essa imagem antes de importá-la.`); return }
    const created: string[] = []
    try {
      setMessage(`Importando ${supported.length} imagem(ns) para o carrossel…`)
      const imported: SlideshowImage[] = []
      for (const file of supported) {
        const src = await saveVideoBlob(file, `Carrossel · ${file.name}`)
        created.push(src)
        imported.push({ id: newId('slide'), name: file.name.slice(0, 180), src })
      }
      const current = projectRef.current
      const target = current.scenes.find((scene) => scene.id === targetSceneId)
      if (!target) throw new Error('A cena de destino não existe mais.')
      const existingBackground = target.background
      const existingImages = mode === 'append' && existingBackground?.mode === 'slideshow' ? (existingBackground.slideshowImages ?? []) : []
      const nextImages = [...existingImages, ...imported]
      const background: BackgroundConfig = {
        ...(existingBackground ?? { color: '#10131b', color2: '#24233b', angle: 135 }),
        mode: 'slideshow', slideshowImages: nextImages,
        slideshowIntervalSeconds: existingBackground?.slideshowIntervalSeconds ?? 10,
        slideshowTransition: existingBackground?.slideshowTransition ?? 'fade',
        slideshowTransitionDuration: existingBackground?.slideshowTransitionDuration ?? 1.2,
        slideshowLoop: existingBackground?.slideshowLoop ?? true,
        slideshowShuffle: existingBackground?.slideshowShuffle ?? false,
        slideshowFit: existingBackground?.slideshowFit ?? 'cover',
        slideshowPosition: existingBackground?.slideshowPosition ?? 'center center',
        slideshowOpacity: existingBackground?.slideshowOpacity ?? 1,
        slideshowBrightness: existingBackground?.slideshowBrightness ?? 1,
        slideshowContrast: existingBackground?.slideshowContrast ?? 1,
        slideshowSaturation: existingBackground?.slideshowSaturation ?? 1,
        slideshowHueRotate: existingBackground?.slideshowHueRotate ?? 0,
        slideshowBlur: existingBackground?.slideshowBlur ?? 0,
        slideshowZoom: existingBackground?.slideshowZoom ?? 1,
        slideshowKenBurns: existingBackground?.slideshowKenBurns ?? false,
        slideshowOverlayColor: existingBackground?.slideshowOverlayColor ?? '#000000',
        slideshowOverlayOpacity: existingBackground?.slideshowOverlayOpacity ?? 0,
      }
      setProject((previous) => ({ ...previous, scenes: previous.scenes.map((scene) => scene.id === targetSceneId ? { ...scene, background } : scene) }))
      setInspectorTab('background')
      setMessage(`${supported.length} imagem(ns) ${mode === 'append' && existingImages.length ? 'adicionada(s)' : 'importada(s)'} ao carrossel. Total: ${nextImages.length}. A quantidade depende do armazenamento disponível no navegador.`)
    } catch (error) {
      await Promise.allSettled(created.map(deleteVideoBlob))
      setMessage(`Não foi possível importar as imagens: ${error instanceof Error ? error.message : 'armazenamento indisponível'}`)
    }
  }

  async function onBackgroundVideoSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget as HTMLInputElement
    const files = Array.from(input.files ?? [])
    input.value = ''
    const appendBackgroundSceneId = backgroundPlaylistAppendTargetRef.current
    backgroundPlaylistAppendTargetRef.current = null
    if (!files.length) return
    const supportedExtensions = new Set(['mp4', 'm4v', 'webm', 'ogv', 'ogg', 'mov', '3gp', 'mkv', 'avi', 'wmv', 'mpeg', 'mpg', 'ts', 'm2ts'])
    const supported = files.filter((file) => file.type.startsWith('video/') || supportedExtensions.has(file.name.toLowerCase().split('.').pop() ?? ''))
    if (!supported.length) { setMessage('Selecione um ou mais arquivos de vídeo compatíveis.'); return }
    if (supported.length > 40) { setMessage('Uma sequência pode ter no máximo 40 clipes.'); return }
    const tooLarge = supported.find((file) => file.size > MAX_VIDEO_BYTES)
    if (tooLarge) { setMessage(`“${tooLarge.name}” excede o limite por arquivo de ${Math.round(MAX_VIDEO_BYTES / 1_000_000)} MB.`); return }
    const totalBytes = supported.reduce((sum, file) => sum + file.size, 0)
    if (totalBytes > MAX_VIDEO_BATCH_BYTES) { setMessage(`A seleção excede ${Math.round(MAX_VIDEO_BATCH_BYTES / 1_000_000)} MB. Importe um grupo menor de vídeos.`); return }
    const targetSceneId = appendBackgroundSceneId ?? activeScene.id
    try {
      const bytesUsed = await getProjectVideoBytes(projectRef.current)
      if (bytesUsed + totalBytes > MAX_VIDEO_PROJECT_BYTES) { setMessage(`O projeto aceita até ${Math.round(MAX_VIDEO_PROJECT_BYTES / 1_000_000)} MB de vídeos locais.`); return }
      setMessage(`Importando ${supported.length} clipe(s) para o fundo…`)
      const refs: string[] = []
      for (const file of supported) refs.push(await saveVideoBlob(file, `Fundo · ${file.name}`))
      const importedClips: VideoClip[] = supported.map((file, index) => ({ id: newId('background-clip'), name: file.name.replace(/\.[^.]+$/, '').slice(0, 100) || `Clipe ${index + 1}`, src: refs[index], start: 0, end: 0, trimEnabled: false }))
      const current = projectRef.current
      const existingScene = current.scenes.find((scene) => scene.id === targetSceneId)
      const existingBackground = existingScene?.background
      const existingClips: VideoClip[] = appendBackgroundSceneId && existingBackground?.mode === 'video'
        ? existingBackground.videoClips?.length
          ? existingBackground.videoClips
          : existingBackground.videoSrc
            ? [{ id: newId('background-existing'), name: 'Vídeo de fundo anterior', src: existingBackground.videoSrc, start: existingBackground.videoStart ?? 0, end: existingBackground.videoEnd ?? 0, trimEnabled: existingBackground.videoTrimEnabled === true }]
            : []
        : []
      const clips = [...existingClips, ...importedClips]
      if (clips.length > 40) {
        await Promise.allSettled(refs.map(deleteVideoBlob))
        setMessage('Uma sequência de fundo pode ter no máximo 40 clipes. Remova clipes ou crie uma nova cena antes de acrescentar vídeos.')
        return
      }
      if (!current.scenes.some((scene) => scene.id === targetSceneId)) {
        await Promise.allSettled(refs.map(deleteVideoBlob))
        setMessage('A cena de destino não existe mais. Selecione-a e tente novamente.')
        return
      }
      setProject((prev) => ({ ...prev, scenes: prev.scenes.map((scene) => scene.id === targetSceneId ? {
        ...scene,
        background: {
          ...(scene.background ?? { mode: 'video' as const, color: '#151823', color2: '#25233a', angle: 135 }),
          mode: 'video', videoSrc: clips[0]?.src ?? refs[0], videoClips: clips.length > 1 ? clips : undefined,
          videoFit: scene.background?.videoFit ?? 'cover', videoPosition: scene.background?.videoPosition ?? 'center center', videoOpacity: scene.background?.videoOpacity ?? 1,
          videoStart: 0, videoEnd: 0, videoTrimEnabled: false, videoLoop: true, videoMuted: true, videoVolume: 0.8, videoPlaybackRate: 1,
        },
      } : scene) }))
      setInspectorTab('background')
      setMessage(appendBackgroundSceneId ? `${supported.length} clipe(s) acrescentado(s) ao fundo. A sequência agora tem ${clips.length} clipes.` : supported.length > 1 ? `Sequência de fundo criada com ${supported.length} clipes. Eles tocarão em ordem dentro do mesmo fundo; exporte o JSON para levar os arquivos.` : `“${supported[0].name}” foi definido como vídeo de fundo.`)
    } catch (error) {
      setMessage(`Não foi possível importar o vídeo de fundo: ${error instanceof Error ? error.message : 'erro de armazenamento'}`)
    }
  }

  function exportAnimatedTheme() {
    const background = activeScene.background ?? { mode: 'animated' as const, color: '#17142b', color2: '#0b111d', angle: 135 }
    const animatedThemeFile = {
      format: 'webcam-overlay-animated-theme',
      version: 1,
      name: `${activeScene.name} · Tema animado`,
      settings: {
        animatedTheme: background.animatedTheme ?? 'aurora',
        color: background.color ?? '#17142b',
        color2: background.color2 ?? '#0b111d',
        angle: background.angle ?? 135,
        animatedAccent: background.animatedAccent ?? '#8d85ff',
        animatedSpeed: background.animatedSpeed ?? 1,
        animatedIntensity: background.animatedIntensity ?? 0.75,
        animatedBlur: background.animatedBlur ?? 26, animatedGlow: background.animatedGlow ?? 0.7,
        animatedGrain: background.animatedGrain ?? 0.08, animatedVignette: background.animatedVignette ?? 0.25,
        animatedDensity: background.animatedDensity ?? 1, animatedScale: background.animatedScale ?? 1,
        animatedDirection: background.animatedDirection ?? 'alternate', animatedLayers: background.animatedLayers ?? 'balanced',
        animatedBrightness: background.animatedBrightness ?? 1, animatedContrast: background.animatedContrast ?? 1,
        animatedSaturation: background.animatedSaturation ?? 1, animatedHueRotate: background.animatedHueRotate ?? 0, animatedBlendMode: background.animatedBlendMode ?? 'normal',
      },
    }
    const blob = new Blob([JSON.stringify(animatedThemeFile, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${safeFileName(activeScene.name)}-tema-animado.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Tema animado exportado. Você pode importá-lo em outra cena ou projeto Webcam_overlay.')
  }

  function importAnimatedTheme(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (file.size > 512_000) {
      setMessage('O arquivo de tema deve ter no máximo 500 KB.')
      return
    }
    if (!file.name.toLowerCase().endsWith('.json')) {
      setMessage('Importe um arquivo de tema animado JSON exportado pelo Webcam_overlay. Para mídia animada, use as opções GIF/WebP ou vídeo logo abaixo.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { format?: unknown; version?: unknown; name?: unknown; settings?: unknown }
        if (parsed.format !== 'webcam-overlay-animated-theme' || parsed.version !== 1 || !parsed.settings || typeof parsed.settings !== 'object' || Array.isArray(parsed.settings)) {
          throw new Error('formato inválido')
        }
        const settings = parsed.settings as Record<string, unknown>
        const allowedThemes = ['custom', 'aurora', 'stars', 'cyber-grid', 'waves', 'gradient-flow', 'matrix-rain', 'liquid-lava', 'bokeh', 'sunset-clouds', 'electric-pulse', 'particles', 'laser-grid', 'deep-ocean', 'prism'] as const
        type ImportedThemeName = typeof allowedThemes[number]
        const importedTheme = allowedThemes.includes(settings.animatedTheme as ImportedThemeName)
          ? settings.animatedTheme as ImportedThemeName
          : 'aurora'
        const safeColor = (value: unknown, fallback: string) => typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim()) ? value.trim() : fallback
        const numberSetting = (value: unknown, fallback: number, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) ? clamp(value, min, max) : fallback
        const current = activeScene.background ?? { mode: 'animated' as const, color: '#17142b', color2: '#0b111d', angle: 135 }
        updateScene({ background: {
          ...current,
          mode: 'animated',
          animatedTheme: importedTheme,
          color: safeColor(settings.color, '#17142b'),
          color2: safeColor(settings.color2, '#0b111d'),
          animatedAccent: safeColor(settings.animatedAccent, '#8d85ff'),
          angle: numberSetting(settings.angle, 135, 0, 360),
          animatedSpeed: numberSetting(settings.animatedSpeed, 1, 0.25, 3),
          animatedIntensity: numberSetting(settings.animatedIntensity, 0.75, 0, 1),
          animatedBlur: numberSetting(settings.animatedBlur, 26, 0, 80), animatedGlow: numberSetting(settings.animatedGlow, 0.7, 0, 1),
          animatedGrain: numberSetting(settings.animatedGrain, 0.08, 0, 0.3), animatedVignette: numberSetting(settings.animatedVignette, 0.25, 0, 1),
          animatedDensity: numberSetting(settings.animatedDensity, 1, 0.25, 3), animatedScale: numberSetting(settings.animatedScale, 1, 0.5, 2),
          animatedDirection: ['normal', 'reverse', 'alternate'].includes(String(settings.animatedDirection)) ? settings.animatedDirection as BackgroundConfig['animatedDirection'] : 'alternate',
          animatedLayers: ['soft', 'balanced', 'rich'].includes(String(settings.animatedLayers)) ? settings.animatedLayers as BackgroundConfig['animatedLayers'] : 'balanced',
          animatedBrightness: numberSetting(settings.animatedBrightness, 1, 0, 2), animatedContrast: numberSetting(settings.animatedContrast, 1, 0, 2),
          animatedSaturation: numberSetting(settings.animatedSaturation, 1, 0, 3), animatedHueRotate: numberSetting(settings.animatedHueRotate, 0, 0, 360),
          animatedBlendMode: ['normal', 'screen', 'multiply', 'overlay', 'lighten'].includes(String(settings.animatedBlendMode)) ? settings.animatedBlendMode as BackgroundConfig['animatedBlendMode'] : 'normal',
        } })
        setInspectorTab('background')
        const themeName = typeof parsed.name === 'string' ? parsed.name.slice(0, 80) : importedTheme
        setMessage(`Tema animado “${themeName}” importado. As cores, velocidade e intensidade foram aplicadas à cena atual.`)
      } catch {
        setMessage('Não foi possível importar o tema. Use um JSON exportado pela opção “Exportar tema animado” do Webcam_overlay.')
      }
    }
    reader.onerror = () => setMessage('Não foi possível ler o arquivo de tema selecionado.')
    reader.readAsText(file)
  }

  function applyBackgroundVideoUrl() {
    const candidate = backgroundVideoUrlInput.trim()
    if (!candidate || !isSafeVideoSource(candidate) || candidate.startsWith('data:') || candidate.startsWith('idb-video://')) {
      setMessage('Informe um link HTTP ou HTTPS direto para um arquivo de vídeo (por exemplo, MP4 ou WebM).')
      return
    }
    updateScene({ background: {
      ...(activeScene.background ?? { mode: 'video', color: '#151823', color2: '#25233a', angle: 135 }),
      mode: 'video', videoSrc: candidate, videoClips: undefined, videoFit: activeScene.background?.videoFit ?? 'cover', videoPosition: activeScene.background?.videoPosition ?? 'center center', videoOpacity: activeScene.background?.videoOpacity ?? 1,
      videoTrimEnabled: false, videoLoop: true, videoMuted: true, videoVolume: 0.8, videoPlaybackRate: 1,
    } })
    setInspectorTab('background')
    setMessage('Vídeo de fundo vinculado ao endereço informado. O link deve apontar diretamente para um arquivo e permitir reprodução pelo navegador.')
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


  function applyWidgetBackgroundUrl() {
    if (!selectedSource || selectedSource.type !== 'widget') return
    const candidate = widgetBackgroundUrlDraft.trim()
    if (candidate && (!isSafeImageSource(candidate) || candidate.startsWith('data:'))) {
      setMessage('Informe um link de imagem HTTP ou HTTPS válido para o fundo do widget.')
      return
    }
    updateSelected({ widgetBackgroundImage: candidate || undefined })
    setMessage(candidate ? 'Imagem de fundo vinculada a este widget.' : 'Imagem de fundo do widget removida.')
  }

  async function onWidgetBackgroundSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file || !selectedSource || selectedSource.type !== 'widget') return
    if (!(file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg'))) {
      setMessage('Escolha uma imagem PNG, JPG, WebP, GIF ou SVG.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage('A imagem de fundo do widget deve ter até 1,5 MB para manter o projeto estável.')
      return
    }
    try {
      const src = await parseLocalImageData(file)
      if (!isSafeImageSource(src)) throw new Error('unsafe image')
      updateSelected({ widgetBackgroundImage: src })
      setWidgetBackgroundUrlDraft('')
      setMessage(`Imagem “${file.name}” definida como fundo do widget selecionado.`)
    } catch {
      setMessage('Não foi possível importar a imagem para este widget.')
    }
  }

  function applyFrameOverlayUrl() {
    if (!selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'webcam-frame') return
    const candidate = frameOverlayUrlDraft.trim()
    if (candidate && (!isSafeImageSource(candidate) || candidate.startsWith('data:'))) {
      setMessage('Informe uma URL de imagem HTTP ou HTTPS válida.')
      return
    }
    updateSelected({ frameOverlayImage: candidate || undefined })
    setMessage(candidate ? 'Imagem da moldura aplicada.' : 'Imagem personalizada da moldura removida.')
  }

  async function onFrameOverlaySelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file || !selectedSource || selectedSource.type !== 'widget' || selectedSource.widgetKind !== 'webcam-frame') return
    if (!file.type.startsWith('image/')) { setMessage('Escolha uma imagem transparente PNG, WebP, SVG ou outro formato aceito pelo navegador.'); return }
    if (file.size > MAX_IMAGE_BYTES) { setMessage('A moldura importada deve ter até 1,5 MB.'); return }
    try {
      const src = await parseLocalImageData(file)
      if (!isSafeImageSource(src)) throw new Error('Imagem inválida')
      updateSelected({ frameOverlayImage: src })
      setFrameOverlayUrlDraft('')
      setMessage(`Moldura “${file.name}” importada.`)
    } catch {
      setMessage('Não foi possível importar essa imagem de moldura.')
    }
  }

  function importWidgetStyle(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file || !selectedSource || selectedSource.type !== 'widget') {
      setMessage('Selecione um widget antes de importar um estilo.')
      return
    }
    if (file.size > MAX_PROJECT_JSON_CHARS) {
      setMessage('O arquivo de estilo é muito grande para importar.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { format?: string; version?: number; settings?: unknown; widgetKind?: string }
        if (parsed.format !== 'webcam-overlay-widget-style' || parsed.version !== 1 || !parsed.settings || typeof parsed.settings !== 'object' || Array.isArray(parsed.settings)) throw new Error('invalid style')
        const incoming = parsed.settings as Record<string, unknown>
        const updates: Partial<SceneSource> = {}
        for (const key of WIDGET_STYLE_KEYS) {
          if (!(key in incoming)) continue
          const value = incoming[key]
          if (typeof value === 'string') {
            if (['widgetBackgroundImage', 'frameOverlayImage'].includes(key) && value && !isSafeImageSource(value)) continue
            ;(updates as Record<string, unknown>)[key] = value.slice(0, ['widgetBackgroundImage', 'frameOverlayImage'].includes(key) ? MAX_LOCAL_PROJECT_CHARS : 3000)
          } else if (typeof value === 'number' && Number.isFinite(value)) {
            ;(updates as Record<string, unknown>)[key] = value
          } else if (typeof value === 'boolean') {
            ;(updates as Record<string, unknown>)[key] = value
          } else if (Array.isArray(value) && key === 'socialProfiles') {
            const profiles = value.filter((item): item is SocialProfile => !!item && typeof item === 'object' && typeof (item as SocialProfile).platform === 'string' && typeof (item as SocialProfile).account === 'string').slice(0, 30).map((item, index) => ({
              id: typeof item.id === 'string' ? item.id.slice(0, 100) : `social-import-${index + 1}`,
              platform: item.platform.slice(0, 60), account: item.account.slice(0, 100),
              ...(typeof item.logoSrc === 'string' && item.logoSrc.length <= MAX_IMAGE_BYTES * 1.5 && isSafeImageSource(item.logoSrc) ? { logoSrc: item.logoSrc } : {}),
              ...(typeof item.logoUrl === 'string' && /^https?:\/\//i.test(item.logoUrl) ? { logoUrl: item.logoUrl.slice(0, 1000) } : {}),
              ...(typeof item.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(item.color) ? { color: item.color } : {}),
            }))
            ;(updates as Record<string, unknown>)[key] = profiles
          } else if (Array.isArray(value) && key === 'goalParts') {
            const allowed: GoalPartKind[] = ['title', 'subtitle', 'current', 'separator', 'target', 'percent', 'bar', 'footer', 'custom-text', 'icon', 'shape', 'image']
            const parts = value.filter((item): item is GoalPart => !!item && typeof item === 'object' && allowed.includes((item as GoalPart).type)).slice(0, 100).map((part, index) => ({
              id: typeof part.id === 'string' ? part.id.slice(0, 80) : `goal-part-import-${index + 1}`,
              type: part.type, label: typeof part.label === 'string' ? part.label.slice(0, 300) : '',
              visible: part.visible !== false, x: clamp(Number(part.x) || 0, 0, 99), y: clamp(Number(part.y) || 0, 0, 99),
              w: clamp(Number(part.w) || 10, 1, 100 - clamp(Number(part.x) || 0, 0, 99)), h: clamp(Number(part.h) || 10, 1, 100 - clamp(Number(part.y) || 0, 0, 99)),
              ...(typeof part.color === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(part.color) ? { color: part.color } : {}),
              ...(Number.isFinite(part.fontSize) ? { fontSize: clamp(Number(part.fontSize), 6, 80) } : {}),
              ...(Number.isFinite(part.fontWeight) ? { fontWeight: clamp(Number(part.fontWeight), 100, 900) } : {}),
              ...(typeof part.align === 'string' && ['left','center','right'].includes(part.align) ? { align: part.align as GoalPart['align'] } : {}),
              ...(typeof part.backgroundColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(part.backgroundColor) ? { backgroundColor: part.backgroundColor } : {}),
              ...(Number.isFinite(part.radius) ? { radius: clamp(Number(part.radius), 0, 50) } : {}),
              ...(Number.isFinite(part.padding) ? { padding: clamp(Number(part.padding), 0, 30) } : {}),
              ...(typeof part.src === 'string' && part.src.length <= MAX_IMAGE_BYTES * 1.5 && isSafeImageSource(part.src) ? { src: part.src } : {}),
              ...(typeof part.shapeKind === 'string' && ['rectangle','circle','pill'].includes(part.shapeKind) ? { shapeKind: part.shapeKind as GoalPart['shapeKind'] } : {}),
              opacity: clamp(Number.isFinite(part.opacity) ? Number(part.opacity) : 1, 0, 1), rotation: clamp(Number.isFinite(part.rotation) ? Number(part.rotation) : 0, -180, 180),
              borderWidth: clamp(Number.isFinite(part.borderWidth) ? Number(part.borderWidth) : 0, 0, 12),
              ...(typeof part.borderColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(part.borderColor) ? { borderColor: part.borderColor } : {}),
              ...(typeof part.fontFamily === 'string' ? { fontFamily: part.fontFamily.slice(0, 120) } : {}),
              ...(typeof part.objectFit === 'string' && ['contain','cover','fill'].includes(part.objectFit) ? { objectFit: part.objectFit as GoalPart['objectFit'] } : {}),
              ...(typeof part.verticalAlign === 'string' && ['top','center','bottom'].includes(part.verticalAlign) ? { verticalAlign: part.verticalAlign as GoalPart['verticalAlign'] } : {}), italic: part.italic === true, letterSpacing: clamp(Number.isFinite(part.letterSpacing) ? Number(part.letterSpacing) : 0, -5, 30), ...(typeof part.textTransform === 'string' && ['none','uppercase','lowercase','capitalize'].includes(part.textTransform) ? { textTransform: part.textTransform as GoalPart['textTransform'] } : {}), shadowEnabled: part.shadowEnabled === true, ...(typeof part.shadowColor === 'string' && /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/.test(part.shadowColor) ? { shadowColor: part.shadowColor } : {}), gradientEnabled: part.gradientEnabled === true, ...(typeof part.gradientColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(part.gradientColor) ? { gradientColor: part.gradientColor } : {}), gradientAngle: clamp(Number.isFinite(part.gradientAngle) ? Number(part.gradientAngle) : 135, 0, 360),
            }))
            ;(updates as Record<string, unknown>)[key] = parts
          }
        }
        updateSelected(updates)
        setMessage('Estilo importado para o widget atual. Posição e tamanho do elemento foram preservados.')
      } catch {
        setMessage('Este arquivo não é um estilo de widget Webcam_overlay compatível. Use um JSON exportado pelo editor.')
      }
    }
    reader.onerror = () => setMessage('Não foi possível ler o arquivo de estilo.')
    reader.readAsText(file)
  }

  function toggleVisibility(sourceId: string) {
    updateActiveScene((scene) => ({
      ...scene,
      sources: scene.sources.map((source) => source.id === sourceId ? { ...source, visible: !source.visible } : source),
    }))
  }

  function deleteSource(sourceId: string) {
    updateActiveScene((scene) => ({ ...scene, sources: scene.sources.filter((source) => source.id !== sourceId) }))
    if (selectedSourceId === sourceId) clearSelection('layers')
  }

  function duplicateSource(source: SceneSource) {
    const copy: SceneSource = placeWithoutOverlap(activeScene.sources, { ...source, id: newId('source'), name: `${source.name} (cópia)`.slice(0, 70), x: clamp(source.x + 3, 0, 100 - source.w), y: clamp(source.y + 3, 0, 100 - source.h) })
    updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, copy] }))
    selectSource(copy.id, 'element')
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
        saveProject()
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

  function toggleSourceLock(sourceId: string) {
    updateActiveScene((scene) => ({
      ...scene,
      sources: scene.sources.map((source) => source.id === sourceId ? { ...source, locked: !source.locked } : source),
    }))
  }

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
    if (persistProject(project)) {
      setSaveStatus('saved')
      setLastSavedAt(new Date())
      setMessage('Projeto salvo neste navegador.')
    } else {
      setSaveStatus('error')
      setMessage('Não foi possível salvar: o projeto excede o limite seguro de armazenamento. Exporte o JSON ou remova imagens grandes.')
    }
  }

  function undo() {
    const previous = undoStackRef.current.pop()
    if (!previous) return
    redoStackRef.current.push(project)
    historySnapshotRef.current = previous
    setProject(previous)
    clearSelection('layers')
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
    clearSelection('layers')
    setCanUndo(true)
    setCanRedo(redoStackRef.current.length > 0)
    setMessage('Alteração reaplicada.')
  }

  function importProject(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (file.size > MAX_PROJECT_JSON_CHARS) {
      setMessage('O arquivo de projeto ultrapassa o limite de importação de 125 MB. Reduza os vídeos incorporados e tente novamente.')
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result))
        if (!isValidProject(parsed)) throw new Error('O JSON não passou pela validação de projeto.')
        const normalized = normalizeProject(parsed)
        const repaired = await storeEmbeddedVideos(normalized)
        if (JSON.stringify(repaired).length > MAX_LOCAL_PROJECT_CHARS) {
          setMessage('O projeto contém imagens ou configurações demais para o armazenamento local do navegador. Reduza imagens incorporadas; vídeos agora são guardados separadamente.')
          return
        }
        setProject(repaired)
        clearSelection('layers')
        setInteraction(null)
        undoStackRef.current = []
        redoStackRef.current = []
        historySnapshotRef.current = repaired
        setCanUndo(false)
        setCanRedo(false)
        setMessage('Projeto importado. Os vídeos incorporados foram extraídos para o armazenamento local do navegador.')
      } catch (error) {
        const detail = error instanceof Error ? ` (${error.message})` : ''
        setMessage(`O arquivo não parece ser um projeto Webcam_overlay válido${detail}`)
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
    setBackgroundVideoUrlInput('')
    setSourceMenuOpen(false)
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (backgroundDesignInputRef.current) backgroundDesignInputRef.current.value = ''
    if (backgroundVideoInputRef.current) backgroundVideoInputRef.current.value = ''
    if (importInputRef.current) importInputRef.current.value = ''
    setSelectedSourceId(null)
    setSelectedGoalPartId(null)
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
    void clearStoredVideoAssets().catch(() => {
      setMessage('Projeto redefinido. Alguns arquivos de vídeo antigos não puderam ser limpos do armazenamento do navegador.')
    })
  }

  function clearSelection(nextTab: InspectorTab = 'layers') {
    setSelectedSourceId(null)
    setSelectedGoalPartId(null)
    setInteraction(null)
    setInspectorTab(nextTab)
  }

  function selectSource(sourceId: string, nextTab: InspectorTab = 'element') {
    // A source selection always clears any previously selected sub-part of a goal widget.
    setSelectedSourceId(sourceId)
    setSelectedGoalPartId(null)
    setInspectorTab(nextTab)
  }

  function isGoalPartSelectionFor(source: SceneSource): boolean {
    return Boolean(
      selectedGoalPartId &&
      selectedSourceId === source.id &&
      source.type === 'widget' &&
      source.widgetKind === 'goal' &&
      source.goalFreeLayout === true
    )
  }

  function beginInteraction(event: ReactPointerEvent<HTMLElement>, source: SceneSource, mode: Interaction['mode']) {
    // Stop the canvas background handler even for locked sources.
    event.stopPropagation()
    selectSource(source.id, 'element')
    setElementSection('content')
    if (source.locked) return
    event.preventDefault()
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
            <span className={`status-pill save-status save-${saveStatus}`} title={lastSavedAt ? `Último salvamento local: ${lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'O projeto é salvo automaticamente neste navegador.'}>
              <i />{saveStatus === 'saved' ? 'Salvo' : saveStatus === 'editing' ? 'Editando' : 'Falha ao salvar'}
            </span>
            <button className="history-button" type="button" disabled={!canUndo} onClick={undo} title="Desfazer (Ctrl+Z)" aria-label="Desfazer">↶</button>
            <button className="history-button" type="button" disabled={!canRedo} onClick={redo} title="Refazer (Ctrl+Y)" aria-label="Refazer">↷</button>
            <div className="export-wrapper">
              <button className="secondary-button" type="button" onClick={() => setShowExportMenu((open) => !open)}>Projeto <span>⌄</span></button>
              {showExportMenu && <div className="export-menu">
                <button type="button" onClick={() => { setShowExportMenu(false); void downloadProject(project).then(() => setMessage('Projeto exportado com mídia incorporada. O JSON pode ficar grande por incluir os vídeos locais.')).catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'Não foi possível exportar o projeto.')) }}>Exportar projeto JSON (inclui vídeos)</button>
                <button type="button" onClick={() => { importInputRef.current?.click(); setShowExportMenu(false) }}>Importar projeto / design editável (JSON)</button>
                <button type="button" onClick={() => { imageInputRef.current?.click(); setShowExportMenu(false) }}>Importar imagem / GIF…</button>
                <button type="button" onClick={() => { videoInputRef.current?.click(); setShowExportMenu(false) }}>Importar vídeo(s) MP4 / WebM / MOV / MKV…</button>
                <button type="button" onClick={() => { backgroundDesignInputRef.current?.click(); setShowExportMenu(false) }}>Definir imagem de fundo</button>
                <button type="button" onClick={() => { slideshowImportModeRef.current = 'replace'; slideshowTargetSceneRef.current = activeScene.id; slideshowInputRef.current?.click(); setShowExportMenu(false) }}>Criar carrossel de imagens…</button>
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
            <div className="preview-tools">
              <button type="button" className={`view-toggle ${showCompositionGuides ? 'active' : ''}`} aria-pressed={showCompositionGuides} onClick={() => setShowCompositionGuides((value) => !value)} title="Exibir linhas de centro e terços">Guias</button>
              <button type="button" className={`view-toggle ${showSafeArea ? 'active' : ''}`} aria-pressed={showSafeArea} onClick={() => setShowSafeArea((value) => !value)} title="Exibir margens de segurança">Área segura</button>
              <span className="local-badge"><i /> EDITOR</span>
            </div>
          </div>
          <div className="preview-frame">
            <div className="preview-canvas" ref={stageRef} style={{ ...sceneBackgroundStyle(activeScene, true), aspectRatio: `${activeScene.width ?? 1920} / ${activeScene.height ?? 1080}` }} onPointerDown={(event) => { if (!(event.target as HTMLElement).closest('.canvas-object')) clearSelection('background') }} onClick={(event) => { if (!(event.target as HTMLElement).closest('.canvas-object')) clearSelection('background') }}>
              {activeScene.background?.mode === 'animated' && <AnimatedBackgroundLayer background={activeScene.background} />}
              {activeScene.background?.mode === 'slideshow' && <BackgroundSlideshowLayer background={activeScene.background} />}
              {activeScene.background?.mode === 'video' && <BackgroundVideoLayer background={activeScene.background} />}
              {activeScene.background?.mode === 'screen' && <ScreenCaptureView editor variant="background" captureKey={`background:${activeScene.id}`} />}
              {activeScene.sources.filter((source) => source.visible).map((source, index) => (
                <div
                  className={`canvas-object object-${source.type} ${source.type === 'shape' ? `shape-${source.shapeKind ?? 'rectangle'}` : ''} ${source.locked ? 'locked' : ''} ${selectedSourceId === source.id && !isGoalPartSelectionFor(source) ? 'is-selected' : ''}`}
                  key={source.id}
                  style={sourceStyle(source, index)}
                  onPointerDown={(event) => beginInteraction(event, source, 'move')}
                  onClick={(event) => { event.stopPropagation(); selectSource(source.id, 'element') }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Selecionar e mover ${source.name}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectSource(source.id, 'element') }
                  }}
                >
                  {source.type === 'text' && <span className="object-text" style={{ textTransform: source.textTransform ?? 'none', textDecoration: source.textDecoration ?? 'none', textShadow: source.textShadowEnabled === false ? 'none' : undefined }}>{source.text || source.name}</span>}
                  {source.type === 'shape' && <span className={`shape-inner shape-inner-${source.shapeKind ?? 'rectangle'}`} />}
                  {source.type === 'image' && source.src && <img src={source.src} alt={source.name} draggable={false} style={{ objectFit: source.objectFit ?? 'contain', objectPosition: source.objectPosition ?? 'center center' }} />}
                  {source.type === 'video' && source.src && <TrimmedVideo source={source} className="video-asset" />}
                  {source.type === 'browser' && <iframe className="browser-frame" title={source.name} src={getBrowserUrl(source.url)} sandbox="allow-scripts allow-forms allow-popups" referrerPolicy="no-referrer" loading="lazy" tabIndex={-1} />}
                  {source.type === 'capture' && <ScreenCaptureView editor variant="source" captureKey={`source:${activeScene.id}:${source.id}`} />}
                  {source.type === 'camera' && (cameraStream
                    ? <video className="camera-video" autoPlay muted playsInline style={{ transform: source.cameraMirror === false ? 'none' : 'scaleX(-1)' }} ref={(element) => { if (element && element.srcObject !== cameraStream) element.srcObject = cameraStream }} />
                    : <div className="camera-placeholder"><span className="camera-symbol">◉</span><strong>{source.name}</strong><small>Clique em “Ativar webcam” nas propriedades</small></div>)}
                  {source.type === 'widget' && <WidgetContent source={source} testToken={alertTestTokens[source.id] ?? 0} editorMode selectedGoalPartId={isGoalPartSelectionFor(source) ? selectedGoalPartId : null} />}
                  {selectedSourceId === source.id && !isGoalPartSelectionFor(source) && <><span className="selection-label">{source.name}</span><button className="resize-handle" type="button" aria-label={`Redimensionar ${source.name}`} onPointerDown={(event) => beginInteraction(event, source, 'resize')} /></>}
                </div>
              ))}
              {showCompositionGuides && <div className="composition-guides" aria-hidden="true">
                <span className="guide guide-v guide-third-one" /><span className="guide guide-v guide-center" /><span className="guide guide-v guide-third-two" />
                <span className="guide guide-h guide-third-one" /><span className="guide guide-h guide-center" /><span className="guide guide-h guide-third-two" />
              </div>}
              {showSafeArea && <div className="safe-area-guides" aria-hidden="true"><span>ÁREA SEGURA · 5%</span></div>}
              {activeScene.sources.length > 0 && activeScene.sources.every((source) => !source.visible) && <div className="canvas-empty"><span>◫</span><strong>Nenhuma fonte visível</strong><small>Ative uma camada ou adicione um elemento.</small></div>}
              {activeScene.sources.length === 0 && activeScene.background?.mode !== 'screen' && <div className="canvas-empty"><span>＋</span><strong>Sua cena está vazia</strong><small>Adicione uma fonte pelo painel à direita.</small></div>}
            </div>
          </div>
          <div className="preview-caption"><span><span className="status-dot" /> Arraste para mover · canto inferior para redimensionar</span><span>Proporção {activeScene.width ?? 1920}:{activeScene.height ?? 1080}</span></div>
        </section>
        <footer className="studio-footer">
          <span className="footer-tip"><span className="tip-icon">i</span>{saveStatus === 'error' ? 'Não foi possível salvar. Exporte um backup do projeto.' : saveStatus === 'editing' ? 'Alterações em andamento; o salvamento ocorre ao concluir o movimento.' : `Salvo automaticamente neste navegador${lastSavedAt ? ` às ${lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}.`}</span>
          <span className={`footer-connection relay-${relayStatus}`} title="Estado do serviço local usado para sincronizar o editor com a Browser Source."><i />{relayStatus === 'connected' ? 'Relay local ativo' : relayStatus === 'connecting' ? 'Conectando relay…' : relayStatus === 'offline' ? 'Relay local desconectado' : 'Hospedagem externa'}</span>
          <span className="footer-version">WEBCAM_OVERLAY · 3.3.0</span>
        </footer>
      </main>

      <aside className="inspector-panel">
        <div className="inspector-heading">
          <div><p className="eyebrow">PROPRIEDADES</p><h2>Editar</h2></div>
          {inspectorTab === 'layers' && <button className="icon-button add-button" type="button" onClick={() => { clearSelection('layers'); setSourceMenuOpen((open) => !open) }} title="Adicionar fonte" aria-label="Adicionar fonte">+</button>}
        </div>
        <nav className="inspector-tabs" aria-label="Painéis do inspetor">
          <button type="button" className={inspectorTab === 'layers' ? 'active' : ''} onClick={() => { clearSelection('layers'); setSourceMenuOpen(false) }}>Camadas</button>
          <button type="button" className={inspectorTab === 'element' ? 'active' : ''} disabled={!selectedSource} onClick={() => { setInspectorTab('element'); setElementSection('content') }}>Elemento</button>
          <button type="button" className={inspectorTab === 'background' ? 'active' : ''} onClick={() => { clearSelection('background'); setSourceMenuOpen(false); setBackgroundUrlInput(activeScene.background?.imageSrc?.startsWith('http') ? activeScene.background.imageSrc : ''); setBackgroundVideoUrlInput(activeScene.background?.videoSrc?.startsWith('http') ? activeScene.background.videoSrc : '') }}>Fundo</button>
          <button type="button" className={inspectorTab === 'canvas' ? 'active' : ''} onClick={() => { clearSelection('canvas'); setSourceMenuOpen(false) }}>Tela</button>
        </nav>

        {inspectorTab === 'layers' && <>
          {sourceMenuOpen && <div className="source-menu"><p className="eyebrow">ELEMENTOS BÁSICOS</p>
            {(['text', 'shape', 'camera', 'capture', 'image', 'video', 'browser'] as Exclude<SourceType, 'widget'>[]).map((type) => <button key={type} type="button" onClick={() => addSource(type)}><span className={`source-icon icon-${type}`}>{sourceGlyph(type)}</span><span><strong>{sourceLabel(type)}</strong><small>{{ text: 'Texto, tipografia e efeitos', shape: 'Retângulo, círculo, linha ou pílula', camera: 'Webcam do dispositivo', capture: 'Compartilhar tela inteira, janela ou aba do navegador', image: 'Imagem, GIF animado, PNG, JPG, WebP ou SVG', video: 'MP4, WebM, MOV, MKV e outros; corte, loop e áudio', browser: 'Página ou widget web incorporado' }[type]}</small></span><span className="menu-arrow">›</span></button>)}
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
                <button className="source-select" type="button" onClick={() => { selectSource(source.id, 'element'); setElementSection('content') }}><span className={`source-icon icon-${source.type}`}>{sourceGlyph(source.type)}</span><span className="source-name">{source.name}</span></button>
                <button className="tiny-action layer-action" type="button" title="Subir camada" aria-label="Subir camada" disabled={index === activeScene.sources.length - 1} onClick={() => moveLayer(source.id, 1)}>↑</button>
                <button className="tiny-action layer-action" type="button" title="Descer camada" aria-label="Descer camada" disabled={index === 0} onClick={() => moveLayer(source.id, -1)}>↓</button>
                <button className={`tiny-action lock-action ${source.locked ? 'locked' : ''}`} type="button" onClick={() => toggleSourceLock(source.id)} title={source.locked ? 'Desbloquear movimento' : 'Bloquear movimento'} aria-label={source.locked ? 'Desbloquear movimento' : 'Bloquear movimento'}>{source.locked ? '■' : '□'}</button>
                <button className={`tiny-action ${source.visible ? 'visible' : ''}`} type="button" onClick={() => toggleVisibility(source.id)} title={source.visible ? 'Ocultar fonte' : 'Mostrar fonte'} aria-label={source.visible ? 'Ocultar fonte' : 'Mostrar fonte'}>{source.visible ? '◉' : '◌'}</button>
                <button className="tiny-action remove-action" type="button" onClick={() => deleteSource(source.id)} title="Remover fonte" aria-label={`Remover ${source.name}`}>×</button>
              </div>
            ))}
          </div>
          <div className="inspector-tip"><span className="note-icon">i</span><p>Clique em um item para editar. O fundo e o tamanho da tela ficam em suas próprias abas.</p></div>
        </>}

        {inspectorTab === 'element' && <div className="inspector-workspace">
          {!selectedSource && <div className="empty-state"><span>◇</span><strong>Nenhum elemento selecionado</strong><p>Escolha uma camada ou clique em um objeto na prévia.</p><button className="wide-action" type="button" onClick={() => setInspectorTab('layers')}>Ver camadas</button></div>}
          {selectedSource && <>
            <div className="properties-panel context-properties">
              <div className="properties-heading"><div><p className="eyebrow">ITEM SELECIONADO</p><h3>{selectedSource.name}</h3></div><span className="property-type">{sourceLabel(selectedSource.type)}</span></div>
              <div className="element-subtabs" role="tablist" aria-label="Opções do elemento">
                <button type="button" className={elementSection === 'content' ? 'active' : ''} onClick={() => setElementSection('content')}>Conteúdo</button>
                <button type="button" className={elementSection === 'style' ? 'active' : ''} onClick={() => setElementSection('style')}>Aparência</button>
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
                {selectedSource.type === 'video' && <>
                  <div className="feature-note"><span className="note-icon">i</span><p>Vídeos locais são guardados no armazenamento do navegador (IndexedDB), separados das configurações. Cada arquivo pode ter até 50 MB. Exporte o projeto JSON para levar os vídeos a outro computador. MP4/H.264 e WebM costumam oferecer boa compatibilidade.</p></div>
                  {selectedSource.src ? <VideoSourceControls source={selectedSource} onChange={updateSelected} onAddClips={() => { videoPlaylistTargetRef.current = selectedSource.id; videoInputRef.current?.click() }} /> : <p className="field-hint">Este elemento não tem um vídeo carregado. Exclua a camada e adicione uma nova fonte de vídeo para importar um arquivo.</p>}
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
                {selectedSource.type === 'capture' && <>
                  <div className="feature-note"><span className="note-icon">i</span><p>Para iniciar a captura, clique em “Escolher tela ou janela” na prévia. O navegador abrirá o seletor nativo e pedirá que você confirme a tela, janela ou aba. Isso só pode começar por um clique do usuário; clicar em Salvar ou em transmitir no OBS não abre o seletor. Para encaminhar a captura à Browser Source, mantenha npm run dev ativo e use a URL local do modo overlay.</p></div>
                  <p className="field-hint">Inicie a captura no botão da prévia. Mantenha o editor aberto enquanto usar o modo overlay; cada compartilhamento precisa ser iniciado manualmente.</p>
                </>}
                {selectedSource.type === 'widget' && <>
                  <div className="widget-inspector-note"><span className="note-icon">i</span><p>Este widget usa dados de exemplo. Você pode mudar o texto e a aparência aqui.</p></div>
                  <label className="field-label" htmlFor="widget-kind">Tipo de widget</label>
                  <select id="widget-kind" className="text-input" value={selectedSource.widgetKind ?? 'goal'} onChange={(event) => updateSelected({ widgetKind: event.target.value as WidgetKind, widgetVariant: 'default' })}>{WIDGET_OPTIONS.map((option) => <option key={option.kind} value={option.kind}>{option.label}</option>)}</select>
                  {selectedSource.widgetKind === 'webcam-frame' && <div className="frame-import-panel">
                    <p className="field-hint">Escolha um modelo abaixo ou use uma moldura PNG/WebP transparente criada por você. A imagem será colocada por cima da câmera.</p>
                    <label className="field-label" htmlFor="frame-overlay-url">Imagem de moldura por URL</label>
                    <input id="frame-overlay-url" className="text-input" type="url" value={frameOverlayUrlDraft} onChange={(event) => setFrameOverlayUrlDraft(event.target.value)} placeholder="https://.../moldura.png" />
                    <button className="wide-action" type="button" onClick={applyFrameOverlayUrl}>Aplicar imagem por URL</button>
                    <button className="wide-action" type="button" onClick={() => frameOverlayInputRef.current?.click()}>Importar moldura do computador</button>
                    {selectedSource.frameOverlayImage && <button className="wide-action quiet-action" type="button" onClick={() => { updateSelected({ frameOverlayImage: undefined }); setFrameOverlayUrlDraft('') }}>Remover imagem personalizada</button>}
                    <p className="field-hint">Também é possível exportar e importar o estilo deste widget para reutilizar suas cores e o modelo visual.</p>
                  </div>}
                  <label className="field-label" htmlFor="widget-title">Título / rótulo</label>
                  <input id="widget-title" className="text-input" value={selectedSource.widgetTitle ?? ''} maxLength={90} onChange={(event) => updateSelected({ widgetTitle: event.target.value })} placeholder="Título exibido" />
                  {['alert', 'latest', 'countdown', 'music', 'sponsor', 'ticker', 'goal', 'live-badge', 'webcam-frame', 'clock', 'viewer', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? 'goal') && <>
                    <label className="field-label" htmlFor="widget-text">Mensagem / descrição</label>
                    <textarea id="widget-text" className="text-input textarea-input" rows={3} maxLength={1000} value={selectedSource.widgetText ?? ''} onChange={(event) => updateSelected({ widgetText: event.target.value })} placeholder="Texto complementar" />
                  </>}
                  {['chat', 'events', 'poll', 'leaderboard'].includes(selectedSource.widgetKind ?? '') && <>
                    <label className="field-label" htmlFor="widget-items">Itens do widget</label>
                    <textarea id="widget-items" className="text-input textarea-input widget-items-input" rows={6} maxLength={3000} value={selectedSource.widgetItems ?? ''} onChange={(event) => updateSelected({ widgetItems: event.target.value })} placeholder={selectedSource.widgetKind === 'chat' ? 'Nome: mensagem (uma por linha)' : selectedSource.widgetKind === 'poll' ? 'Opção | votos' : selectedSource.widgetKind === 'leaderboard' ? 'Nome | valor (uma linha por apoiador)' : 'Tipo · nome · valor'} />
                    <p className="field-hint">Uma linha para cada item. Os dados serão exibidos como exemplos locais.</p>
                  </>}
                  {selectedSource.widgetKind === 'socials' && <div className="social-profile-editor">
                    <p className="field-hint">Adicione ou remova redes, edite o nome e o perfil, e use o logo original por URL ou arquivo de imagem. Para logos oficiais, importe um arquivo que você tenha direito de usar.</p>
                    {getSocialProfiles(selectedSource).map((profile, index) => <div className="social-profile-card" key={profile.id}>
                      <div className="social-profile-card-head"><span className="social-profile-preview">{(profile.logoSrc || profile.logoUrl) && isSafeImageSource(profile.logoSrc || profile.logoUrl || '') ? <img src={profile.logoSrc || profile.logoUrl} alt="" /> : socialGlyph(profile.platform)}</span><strong>Rede {index + 1}</strong><button type="button" className="tiny-action layer-action" title="Mover para cima" aria-label="Mover rede para cima" disabled={index === 0} onClick={() => moveSocialProfile(index, -1)}>↑</button><button type="button" className="tiny-action layer-action" title="Mover para baixo" aria-label="Mover rede para baixo" disabled={index === getSocialProfiles(selectedSource).length - 1} onClick={() => moveSocialProfile(index, 1)}>↓</button><button type="button" className="tiny-action remove-action" title="Remover rede" aria-label={`Remover ${profile.platform}`} onClick={() => removeSocialProfile(index)}>×</button></div>
                      <label className="field-label" htmlFor={`social-platform-${index}`}>Plataforma / nome exibido</label>
                      <input id={`social-platform-${index}`} className="text-input" value={profile.platform} maxLength={60} onChange={(event) => updateSocialProfile(index, { platform: event.target.value })} placeholder="Ex.: Twitch, Instagram, Kick…" />
                      <label className="field-label" htmlFor={`social-account-${index}`}>Usuário / endereço</label>
                      <input id={`social-account-${index}`} className="text-input" value={profile.account} maxLength={100} onChange={(event) => updateSocialProfile(index, { account: event.target.value })} placeholder="@seuperfil" />
                      <label className="field-label" htmlFor={`social-logo-url-${index}`}>Logo por URL</label>
                      <input id={`social-logo-url-${index}`} className="text-input" type="url" value={profile.logoUrl ?? ''} onChange={(event) => updateSocialProfile(index, { logoUrl: event.target.value, logoSrc: undefined })} placeholder="https://.../logo.png" />
                      <div className="social-profile-actions"><button type="button" className="file-button" onClick={() => { const logo = suggestedSocialLogoUrl(profile.platform); if (!logo) { setMessage('Não encontrei um logo padrão para essa plataforma. Importe um arquivo ou informe uma URL de imagem.'); return } updateSocialProfile(index, { logoUrl: logo, logoSrc: undefined }); setMessage(`Ícone de ${profile.platform} definido. Ele é carregado pela internet.`) }}>Usar logo padrão</button><label className="file-button">Importar logo do computador<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={async (event) => {
                        const input = event.currentTarget
                        const file = input.files?.[0]
                        input.value = ''
                        if (!file) return
                        if (!file.type.startsWith('image/')) { setMessage('Escolha um arquivo de imagem.'); return }
                        if (file.size > 150_000) { setMessage('Para manter o projeto leve, limite cada logo a 150 KB.'); return }
                        try {
                          const src = await parseLocalImageData(file)
                          const activeProject = projectRef.current
                          const targetSceneId = activeProject.activeSceneId
                          const targetSource = activeProject.scenes.find((scene) => scene.id === targetSceneId)?.sources.find((source) => source.id === selectedSourceId)
                          if (!targetSource || targetSource.widgetKind !== 'socials') return
                          const nextProfiles = getSocialProfiles(targetSource).map((item, itemIndex) => itemIndex === index ? { ...item, logoSrc: src, logoUrl: '' } : item)
                          const candidateProject: Project = { ...activeProject, scenes: activeProject.scenes.map((scene) => scene.id !== targetSceneId ? scene : { ...scene, sources: scene.sources.map((source) => source.id === targetSource.id ? { ...source, socialProfiles: nextProfiles, widgetItems: nextProfiles.map((item) => `${item.platform} · ${item.account}`).join('\n') } : source) }) }
                          if (JSON.stringify(candidateProject).length > MAX_LOCAL_PROJECT_CHARS) { setMessage('Este logo ultrapassaria o limite de armazenamento local. Use uma imagem menor ou remova logos/imagens antigos.'); return }
                          updateSocialProfile(index, { logoSrc: src, logoUrl: '' })
                          setMessage(`Logo de ${profile.platform} importado.`)
                        } catch { setMessage('Não foi possível carregar esse logo.') }
                      }} /></label><button type="button" className="small-text-button" onClick={() => updateSocialProfile(index, { logoSrc: undefined, logoUrl: '', color: undefined })}>Remover logo</button></div>
                      <label className="field-label" htmlFor={`social-color-${index}`}>Cor do ícone se não houver logo</label><ColorField id={`social-color-${index}`} value={profile.color ?? selectedSource.widgetAccent ?? '#8d85ff'} onChange={(color) => updateSocialProfile(index, { color })} />
                    </div>)}
                    <button className="wide-action" type="button" onClick={addSocialProfile}>＋ Adicionar rede social</button>
                    <p className="field-hint">Você pode adicionar até 30 redes. Uma imagem enviada fica salva no projeto; uma URL depende de o site continuar acessível.</p>
                  </div>}

                  {['goal', 'viewer', 'alert', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? '') && <>
                    <label className="field-label" htmlFor="widget-value">{selectedSource.widgetKind === 'goal' ? 'Valor atual' : selectedSource.widgetKind === 'tip-jar' ? 'Total arrecadado (R$)' : selectedSource.widgetKind === 'stream-boss' ? 'Vida atual do chefe (%)' : selectedSource.widgetKind === 'viewer' ? 'Espectadores (exemplo)' : 'Nome do evento (exemplo)'}</label>
                    <input id="widget-value" className="text-input" value={selectedSource.widgetValue ?? ''} onChange={(event) => updateSelected({ widgetValue: event.target.value })} placeholder={['goal', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? '') ? '68' : 'Exemplo'} />
                  </>}
                  {['goal', 'tip-jar', 'stream-boss'].includes(selectedSource.widgetKind ?? '') && <>
                    <label className="field-label" htmlFor="widget-target">{selectedSource.widgetKind === 'stream-boss' ? 'Vida total do chefe' : selectedSource.widgetKind === 'tip-jar' ? 'Meta de apoio (R$)' : 'Valor da meta'}</label>
                    <input id="widget-target" className="text-input" type="text" inputMode="decimal" value={selectedSource.widgetTarget ?? '100'} onChange={(event) => updateSelected({ widgetTarget: event.target.value })} placeholder="Ex.: R$ 2.000 ou 100" />
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
                {selectedSource.type === 'widget' && <>
                  <p className="eyebrow section-eyebrow">APARÊNCIA</p>
                  <label className="field-label" htmlFor="widget-variant">Estilo inicial</label>
                  <select id="widget-variant" className="text-input" value={selectedSource.widgetVariant ?? 'default'} onChange={(event) => updateSelected({ widgetVariant: event.target.value })}>{WIDGET_VARIANTS[selectedSource.widgetKind ?? 'goal'].map((variant) => <option key={variant.value} value={variant.value}>{variant.label}</option>)}</select>
                  <p className="field-hint">As opções variam conforme o tipo de widget. Você pode combinar o modelo com cores, fontes, fundo, bordas e animações abaixo.</p>
                  {selectedSource.widgetKind === 'goal' && <section className="goal-builder-panel">
                    <div className="field-divider" />
                    <h4>Montar minha barra de meta</h4>
                    <p className="field-hint">Selecione uma parte na lista abaixo para editar suas propriedades. Na prévia, arraste o widget inteiro para mover a barra; use o canto inferior para redimensioná-la.</p>
                    <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.goalFreeLayout)} onChange={(event) => {
                      const enabled = event.target.checked
                      updateSelected({ goalFreeLayout: enabled, goalPartEditMode: enabled, goalParts: enabled ? (Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : createDefaultGoalParts()) : selectedSource.goalParts, ...(enabled ? { widgetFillColor: selectedSource.widgetFillColor ?? '#ed386f', widgetTrackColor: selectedSource.widgetTrackColor ?? '#161616' } : {}) })
                      setSelectedGoalPartId(null)
                    }} /><span>Usar composição livre</span></label>
                    {selectedSource.goalFreeLayout && <>
                      <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.goalPartEditMode)} onChange={(event) => updateSelected({ goalPartEditMode: event.target.checked })} /><span>Destacar a parte selecionada na prévia</span></label>
                      <div className="goal-part-quicklist"><p className="field-label">Partes da barra</p>
                        {(Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : createDefaultGoalParts()).map((part) => <button type="button" key={part.id} className={`goal-part-chip ${selectedGoalPartId === part.id ? 'active' : ''}`} onClick={() => { setSelectedGoalPartId(part.id); setInspectorTab('element') }}><span>{part.label || ({title:'Título',subtitle:'Descrição',current:'Valor atual',separator:'Separador',target:'Meta',percent:'Percentual',bar:'Progresso',footer:'Texto auxiliar','custom-text':'Texto livre',icon:'Ícone',shape:'Forma',image:'Imagem'} as Record<GoalPartKind,string>)[part.type]}</span><small>{part.visible ? 'Visível' : 'Oculta'}</small></button>)}
                      </div>
                      <div className="goal-part-add-row"><button type="button" className="small-add-button" onClick={() => addGoalPart('custom-text')}>＋ Texto</button><button type="button" className="small-add-button" onClick={() => addGoalPart('icon')}>＋ Ícone</button><button type="button" className="small-add-button" onClick={() => addGoalPart('separator')}>＋ Separador</button><button type="button" className="small-add-button" onClick={() => addGoalPart('shape')}>＋ Forma</button><button type="button" className="small-add-button" onClick={() => addGoalPart('image')}>＋ Imagem</button><button type="button" className="small-add-button" onClick={() => addGoalPart('bar')}>＋ Barra</button></div><details className="goal-more-part-options"><summary>Adicionar outros campos</summary><div className="goal-part-add-row"><button type="button" className="small-add-button" onClick={() => addGoalPart('title')}>＋ Título</button><button type="button" className="small-add-button" onClick={() => addGoalPart('subtitle')}>＋ Descrição</button><button type="button" className="small-add-button" onClick={() => addGoalPart('current')}>＋ Valor atual</button><button type="button" className="small-add-button" onClick={() => addGoalPart('target')}>＋ Meta</button><button type="button" className="small-add-button" onClick={() => addGoalPart('percent')}>＋ Percentual</button><button type="button" className="small-add-button" onClick={() => addGoalPart('footer')}>＋ Texto auxiliar</button></div></details>
                      {(() => {
                        const parts = Array.isArray(selectedSource.goalParts) ? selectedSource.goalParts : createDefaultGoalParts()
                        const part = parts.find((candidate) => candidate.id === selectedGoalPartId) ?? parts[0]
                        if (!part) return <p className="field-hint">Adicione uma parte para começar.</p>
                        const updatePart = (changes: Partial<GoalPart>) => updateGoalPart(part.id, changes)
                        return <div className="goal-part-properties">
                          <div className="field-divider" /><p className="field-label">Editar parte selecionada</p>
                          {(part.type === 'custom-text' || part.type === 'icon' || part.type === 'separator' || part.type === 'footer' || part.type === 'image') && <><label className="field-label" htmlFor="goal-part-label">{part.type === 'image' ? 'Descrição da imagem' : 'Texto da parte'}</label><input id="goal-part-label" className="text-input" value={part.label ?? ''} onChange={(event) => updatePart({ label: event.target.value })} maxLength={120} placeholder="Texto livre" /></>}
                          <label className="lock-toggle"><input type="checkbox" checked={part.visible !== false} onChange={(event) => updatePart({ visible: event.target.checked })} /><span>Mostrar esta parte</span></label>
                          <div className="two-field-grid"><div><label className="field-label" htmlFor="goal-part-x">Horizontal (%)</label><input id="goal-part-x" className="text-input" type="number" min="0" max="100" step="0.5" value={Math.round(part.x * 10) / 10} onChange={(event) => updatePart({ x: clamp(Number(event.target.value) || 0, 0, 100 - part.w) })} /></div><div><label className="field-label" htmlFor="goal-part-y">Vertical (%)</label><input id="goal-part-y" className="text-input" type="number" min="0" max="100" step="0.5" value={Math.round(part.y * 10) / 10} onChange={(event) => updatePart({ y: clamp(Number(event.target.value) || 0, 0, 100 - part.h) })} /></div></div>
                          <div className="two-field-grid"><div><label className="field-label" htmlFor="goal-part-w">Largura (%)</label><input id="goal-part-w" className="text-input" type="number" min="1" max="100" step="0.5" value={Math.round(part.w * 10) / 10} onChange={(event) => updatePart({ w: clamp(Number(event.target.value) || 1, 1, 100 - part.x) })} /></div><div><label className="field-label" htmlFor="goal-part-h">Altura (%)</label><input id="goal-part-h" className="text-input" type="number" min="1" max="100" step="0.5" value={Math.round(part.h * 10) / 10} onChange={(event) => updatePart({ h: clamp(Number(event.target.value) || 1, 1, 100 - part.y) })} /></div></div>
                          <div className="goal-part-layer-actions"><button type="button" className="small-text-button" onClick={() => duplicateGoalPart(part.id)}>Duplicar parte</button><button type="button" className="small-text-button" onClick={() => moveGoalPart(part.id, 1)}>Trazer para frente</button><button type="button" className="small-text-button" onClick={() => moveGoalPart(part.id, -1)}>Enviar para trás</button></div>
                          {part.type === 'image' && <div className="goal-part-properties"><p className="field-hint">Imagens permitem criar logos, ornamentos e preenchimentos próprios dentro da barra.</p><button type="button" className="wide-action" onClick={() => { setPendingGoalPartImageId(part.id); goalPartImageInputRef.current?.click() }}>{part.src ? 'Trocar imagem' : 'Importar imagem'}</button>{part.src && <button type="button" className="wide-action quiet-action" onClick={() => updatePart({ src: undefined })}>Remover imagem</button>}<label className="field-label" htmlFor="goal-part-fit">Ajuste da imagem</label><select id="goal-part-fit" className="text-input" value={part.objectFit ?? 'contain'} onChange={(event) => updatePart({ objectFit: event.target.value as GoalPart['objectFit'] })}><option value="contain">Mostrar inteira</option><option value="cover">Preencher, cortando bordas</option><option value="fill">Esticar</option></select></div>}
                          {part.type === 'shape' && <><label className="field-label" htmlFor="goal-part-shape-kind">Formato</label><select id="goal-part-shape-kind" className="text-input" value={part.shapeKind ?? 'rectangle'} onChange={(event) => updatePart({ shapeKind: event.target.value as GoalPart['shapeKind'] })}><option value="rectangle">Retângulo</option><option value="circle">Círculo</option><option value="pill">Pílula</option></select><label className="field-label" htmlFor="goal-part-shape-color">Cor da forma</label><ColorField id="goal-part-shape-color" value={part.color ?? '#7776ff'} onChange={(color) => updatePart({ color })} /><label className="lock-toggle"><input type="checkbox" checked={Boolean(part.gradientEnabled)} onChange={(event) => updatePart({ gradientEnabled: event.target.checked })} /><span>Usar gradiente</span></label>{part.gradientEnabled && <><label className="field-label" htmlFor="goal-part-gradient-color">Segunda cor</label><ColorField id="goal-part-gradient-color" value={part.gradientColor ?? '#ffffff'} onChange={(gradientColor) => updatePart({ gradientColor })} /><label className="field-label" htmlFor="goal-part-gradient-angle">Direção do gradiente</label><div className="range-row"><input id="goal-part-gradient-angle" type="range" min="0" max="360" value={part.gradientAngle ?? 135} onChange={(event) => updatePart({ gradientAngle: Number(event.target.value) })} /><span>{part.gradientAngle ?? 135}°</span></div></>}<div className="two-field-grid"><div><label className="field-label" htmlFor="goal-part-shape-border">Espessura da borda</label><input id="goal-part-shape-border" className="text-input" type="number" min="0" max="12" value={part.borderWidth ?? 0} onChange={(event) => updatePart({ borderWidth: clamp(Number(event.target.value) || 0, 0, 12) })} /></div><div><label className="field-label" htmlFor="goal-part-shape-radius">Arredondamento</label><input id="goal-part-shape-radius" className="text-input" type="number" min="0" max="50" value={part.radius ?? 0} onChange={(event) => updatePart({ radius: clamp(Number(event.target.value) || 0, 0, 50) })} /></div></div><label className="field-label" htmlFor="goal-part-shape-border-color">Cor da borda</label><ColorField id="goal-part-shape-border-color" value={part.borderColor ?? '#ffffff'} onChange={(borderColor) => updatePart({ borderColor })} /></>}
                          {part.type !== 'bar' && part.type !== 'shape' && part.type !== 'image' && <><div className="two-field-grid"><div><label className="field-label" htmlFor="goal-part-font-size">Tamanho do texto</label><input id="goal-part-font-size" className="text-input" type="number" min="6" max="80" value={part.fontSize ?? 13} onChange={(event) => updatePart({ fontSize: clamp(Number(event.target.value) || 13, 6, 80) })} /></div><div><label className="field-label" htmlFor="goal-part-weight">Peso</label><select id="goal-part-weight" className="text-input" value={part.fontWeight ?? 700} onChange={(event) => updatePart({ fontWeight: Number(event.target.value) })}><option value="400">Normal</option><option value="500">Médio</option><option value="600">Seminegrito</option><option value="700">Negrito</option><option value="800">Extra negrito</option><option value="900">Preto</option></select></div></div><label className="field-label" htmlFor="goal-part-color">Cor do texto</label><ColorField id="goal-part-color" value={part.color ?? '#ffffff'} onChange={(color) => updatePart({ color })} /><label className="field-label" htmlFor="goal-part-align">Alinhamento horizontal</label><select id="goal-part-align" className="text-input" value={part.align ?? 'left'} onChange={(event) => updatePart({ align: event.target.value as GoalPart['align'] })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select><details className="settings-accordion goal-advanced-part"><summary>Mais opções de texto</summary><div className="settings-accordion-content"><label className="field-label" htmlFor="goal-part-valign">Alinhamento vertical</label><select id="goal-part-valign" className="text-input" value={part.verticalAlign ?? 'center'} onChange={(event) => updatePart({ verticalAlign: event.target.value as GoalPart['verticalAlign'] })}><option value="top">Em cima</option><option value="center">No meio</option><option value="bottom">Embaixo</option></select><label className="field-label" htmlFor="goal-part-letter-spacing">Espaçamento entre letras</label><div className="range-row"><input id="goal-part-letter-spacing" type="range" min="-5" max="30" step="0.25" value={part.letterSpacing ?? 0} onChange={(event) => updatePart({ letterSpacing: Number(event.target.value) })} /><span>{part.letterSpacing ?? 0}px</span></div><label className="lock-toggle"><input type="checkbox" checked={Boolean(part.italic)} onChange={(event) => updatePart({ italic: event.target.checked })} /><span>Itálico</span></label><label className="field-label" htmlFor="goal-part-transform">Transformação do texto</label><select id="goal-part-transform" className="text-input" value={part.textTransform ?? 'none'} onChange={(event) => updatePart({ textTransform: event.target.value as GoalPart['textTransform'] })}><option value="none">Como digitado</option><option value="uppercase">MAIÚSCULAS</option><option value="lowercase">minúsculas</option><option value="capitalize">Iniciais maiúsculas</option></select><label className="lock-toggle"><input type="checkbox" checked={Boolean(part.shadowEnabled)} onChange={(event) => updatePart({ shadowEnabled: event.target.checked })} /><span>Sombra no texto/elemento</span></label>{part.shadowEnabled && <><label className="field-label" htmlFor="goal-part-shadow-color">Cor da sombra</label><ColorField id="goal-part-shadow-color" value={part.shadowColor ?? '#000000'} onChange={(shadowColor) => updatePart({ shadowColor })} /></>}</div></details></>}
                          {part.type === 'bar' && <><label className="field-label" htmlFor="goal-part-fill">Cor do preenchimento</label><ColorField id="goal-part-fill" value={selectedSource.widgetFillColor ?? selectedSource.widgetAccent ?? '#8d85ff'} onChange={(widgetFillColor) => updateSelected({ widgetFillColor })} /><label className="field-label" htmlFor="goal-part-track">Cor do fundo da barra</label><ColorField id="goal-part-track" value={selectedSource.widgetTrackColor ?? '#292b35'} onChange={(widgetTrackColor) => updateSelected({ widgetTrackColor })} /><label className="field-label" htmlFor="goal-part-radius">Arredondamento da barra</label><input id="goal-part-radius" className="text-input" type="number" min="0" max="50" value={part.radius ?? 4} onChange={(event) => updatePart({ radius: clamp(Number(event.target.value) || 0, 0, 50) })} /></>}
                          {part.type !== 'shape' && part.type !== 'image' && <><label className="field-label" htmlFor="goal-part-bg">Fundo da parte</label><div className="two-field-grid"><label className="lock-toggle"><input type="checkbox" checked={Boolean(part.backgroundColor)} onChange={(event) => updatePart({ backgroundColor: event.target.checked ? '#222222' : undefined })} /><span>Usar fundo próprio</span></label>{part.backgroundColor && <ColorField id="goal-part-bg" value={part.backgroundColor} onChange={(backgroundColor) => updatePart({ backgroundColor })} />}</div></>}
                          <div className="two-field-grid"><div><label className="field-label" htmlFor="goal-part-opacity">Opacidade (%)</label><input id="goal-part-opacity" className="text-input" type="number" min="0" max="100" value={Math.round((part.opacity ?? 1) * 100)} onChange={(event) => updatePart({ opacity: clamp(Number(event.target.value) / 100 || 0, 0, 1) })} /></div><div><label className="field-label" htmlFor="goal-part-rotation">Rotação (°)</label><input id="goal-part-rotation" className="text-input" type="number" min="-180" max="180" value={part.rotation ?? 0} onChange={(event) => updatePart({ rotation: clamp(Number(event.target.value) || 0, -180, 180) })} /></div></div>
                          {part.type !== 'bar' && part.type !== 'shape' && part.type !== 'image' && <><label className="field-label" htmlFor="goal-part-font-family">Fonte desta parte</label><input id="goal-part-font-family" className="text-input" value={part.fontFamily ?? ''} onChange={(event) => updatePart({ fontFamily: event.target.value.slice(0, 120) })} placeholder="Herdar a fonte da barra" /></>}
                          {(part.type === 'custom-text' || part.type === 'icon' || part.type === 'separator' || part.type === 'footer' || part.type === 'shape' || part.type === 'image') && <button type="button" className="wide-action danger-action" onClick={() => removeGoalPart(part.id)}>Remover esta parte</button>}
                          <button type="button" className="wide-action" onClick={() => updatePart({ x: part.type === 'title' || part.type === 'current' ? 0 : 65, y: part.type === 'bar' ? 58 : part.type === 'footer' ? 82 : 8 })}>Restaurar posição sugerida</button>
                        </div>
                      })()}
                      <p className="field-hint">As posições são relativas à barra de meta. Para selecionar uma parte, clique no nome dela nesta lista. Para mover ou redimensionar a barra inteira, use a prévia central. Os demais widgets continuam no mesmo fluxo simples: Conteúdo, Aparência e Posição.</p>
                    </>}
                  </section>}
                </>}
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
                  <details className="settings-accordion"><summary>Mais opções de texto</summary><div className="settings-accordion-content">
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
                  </div></details>
                </>}
                {selectedSource.type === 'shape' && <>
                  <p className="eyebrow section-eyebrow">FORMA</p>
                  <label className="field-label" htmlFor="shape-color">Cor / preenchimento</label><ColorField id="shape-color" value={selectedSource.color ?? '#7772f2'} onChange={(color) => updateSelected({ color })} />
                  <label className="field-label" htmlFor="shape-radius">Arredondamento</label><div className="range-row"><input id="shape-radius" type="range" min="0" max="100" value={selectedSource.radius ?? 4} onChange={(event) => updateSelected({ radius: Number(event.target.value) })} /><span>{selectedSource.radius ?? 4}px</span></div>
                </>}
                {selectedSource.type === 'image' && <><p className="field-hint">Controle o corte, posição interna, borda e transparência desta imagem.</p><label className="field-label" htmlFor="image-fit-style">Ajuste</label><select id="image-fit-style" className="text-input" value={selectedSource.objectFit ?? 'contain'} onChange={(event) => updateSelected({ objectFit: event.target.value as 'contain' | 'cover' })}><option value="contain">Conter</option><option value="cover">Cobrir</option></select><label className="field-label" htmlFor="image-position-style">Posição dentro da moldura</label><select id="image-position-style" className="text-input" value={selectedSource.objectPosition ?? 'center center'} onChange={(event) => updateSelected({ objectPosition: event.target.value })}><option value="center center">Centro</option><option value="top center">Topo</option><option value="bottom center">Base</option><option value="left center">Esquerda</option><option value="right center">Direita</option><option value="top left">Superior esquerda</option><option value="top right">Superior direita</option><option value="bottom left">Inferior esquerda</option><option value="bottom right">Inferior direita</option></select></>}
                {selectedSource.type === 'video' && <><p className="eyebrow section-eyebrow">VÍDEO</p><label className="field-label" htmlFor="video-fit-style">Enquadramento</label><select id="video-fit-style" className="text-input" value={selectedSource.objectFit ?? 'cover'} onChange={(event) => updateSelected({ objectFit: event.target.value as 'contain' | 'cover' })}><option value="cover">Preencher / cortar bordas</option><option value="contain">Mostrar vídeo inteiro</option></select><label className="field-label" htmlFor="video-position-style">Posição do vídeo no quadro</label><select id="video-position-style" className="text-input" value={selectedSource.objectPosition ?? 'center center'} onChange={(event) => updateSelected({ objectPosition: event.target.value })}><option value="center center">Centro</option><option value="top center">Topo</option><option value="bottom center">Base</option><option value="left center">Esquerda</option><option value="right center">Direita</option><option value="top left">Superior esquerda</option><option value="top right">Superior direita</option><option value="bottom left">Inferior esquerda</option><option value="bottom right">Inferior direita</option></select></>}
                {selectedSource.type === 'widget' && <details className="settings-accordion">
                  <summary>Mais opções do widget</summary>
                  <div className="settings-accordion-content">
                  <p className="eyebrow section-eyebrow">FUNDO E CONTORNO</p>
                  <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetShowBackground !== false} onChange={(event) => updateSelected({ widgetShowBackground: event.target.checked, widgetBackdropBlur: event.target.checked ? (selectedSource.widgetBackdropBlur ?? 8) : 0 })} /><span>Mostrar fundo do widget</span></label>
                  <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetShowBorder !== false} onChange={(event) => updateSelected({ widgetShowBorder: event.target.checked })} /><span>Mostrar borda do contêiner</span></label>
                  <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetShowShadow !== false} onChange={(event) => updateSelected({ widgetShowShadow: event.target.checked })} /><span>Mostrar sombra do contêiner</span></label>
                  <label className="field-label" htmlFor="widget-blur">Desfoque do fundo · {selectedSource.widgetShowBackground === false ? '0' : selectedSource.widgetBackdropBlur ?? ((selectedSource.widgetTheme ?? 'glass') === 'glass' ? 8 : 0)} px</label><input id="widget-blur" className="video-trim-range" type="range" min="0" max="30" value={selectedSource.widgetShowBackground === false ? 0 : selectedSource.widgetBackdropBlur ?? ((selectedSource.widgetTheme ?? 'glass') === 'glass' ? 8 : 0)} disabled={selectedSource.widgetShowBackground === false} onChange={(event) => updateSelected({ widgetBackdropBlur: Number(event.target.value) })} />
                  <label className="field-label" htmlFor="widget-theme">Estilo base</label>
                  <select id="widget-theme" className="text-input" value={selectedSource.widgetTheme ?? 'glass'} onChange={(event) => updateSelected({ widgetTheme: event.target.value as WidgetTheme })}><option value="glass">Vidro translúcido</option><option value="neon">Neon gamer</option><option value="minimal">Minimalista</option><option value="solid">Fundo sólido</option></select>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-accent">Cor de destaque</label><ColorField id="widget-accent" value={selectedSource.widgetAccent ?? '#8d85ff'} onChange={(widgetAccent) => updateSelected({ widgetAccent })} /></div><div><label className="field-label" htmlFor="widget-bg-color">Fundo personalizado</label><ColorField id="widget-bg-color" value={selectedSource.widgetBackgroundColor ?? '#141722'} onChange={(widgetBackgroundColor) => updateSelected({ widgetBackgroundColor })} /></div></div>
                  <label className="field-label" htmlFor="widget-bg-opacity">Opacidade da cor de fundo</label><div className="range-row"><input id="widget-bg-opacity" type="range" min="0" max="1" step="0.05" value={selectedSource.widgetBackgroundOpacity ?? 0.92} onChange={(event) => updateSelected({ widgetBackgroundOpacity: Number(event.target.value) })} /><span>{Math.round((selectedSource.widgetBackgroundOpacity ?? 0.92) * 100)}%</span></div>
                  <p className="field-hint">A imagem de fundo é separada do conteúdo; o texto e os controles continuam editáveis por cima dela.</p>
                  <button className="wide-action" type="button" onClick={() => widgetBackgroundInputRef.current?.click()}>{selectedSource.widgetBackgroundImage?.startsWith('data:') ? 'Substituir imagem de fundo' : 'Importar imagem de fundo do widget'}</button>
                  <label className="field-label" htmlFor="widget-bg-url">Ou usar URL da imagem</label><input id="widget-bg-url" className="text-input" type="url" value={widgetBackgroundUrlDraft} onChange={(event) => setWidgetBackgroundUrlDraft(event.target.value)} placeholder="https://site.com/fundo.webp" />
                  <button className="wide-action" type="button" onClick={applyWidgetBackgroundUrl}>Aplicar URL do fundo</button>
                  {selectedSource.widgetBackgroundImage && <button className="wide-action danger-action" type="button" onClick={() => { updateSelected({ widgetBackgroundImage: undefined }); setWidgetBackgroundUrlDraft('') }}>Remover imagem de fundo</button>}
                  {selectedSource.widgetBackgroundImage && <><label className="field-label" htmlFor="widget-bg-image-fit">Ajuste da imagem</label><select id="widget-bg-image-fit" className="text-input" value={selectedSource.widgetBackgroundImageFit ?? 'cover'} onChange={(event) => updateSelected({ widgetBackgroundImageFit: event.target.value as SceneSource['widgetBackgroundImageFit'] })}><option value="cover">Cobrir</option><option value="contain">Mostrar inteira</option><option value="stretch">Esticar</option></select><label className="field-label" htmlFor="widget-bg-image-opacity">Opacidade da imagem</label><div className="range-row"><input id="widget-bg-image-opacity" type="range" min="0" max="1" step="0.05" value={selectedSource.widgetBackgroundImageOpacity ?? 1} onChange={(event) => updateSelected({ widgetBackgroundImageOpacity: Number(event.target.value) })} /><span>{Math.round((selectedSource.widgetBackgroundImageOpacity ?? 1) * 100)}%</span></div></>}
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-text-color">Cor do conteúdo</label><ColorField id="widget-text-color" value={selectedSource.widgetTextColor ?? '#f2f3fb'} onChange={(widgetTextColor) => updateSelected({ widgetTextColor })} /></div><div><label className="field-label" htmlFor="widget-title-color">Cor dos títulos</label><ColorField id="widget-title-color" value={selectedSource.widgetTitleColor ?? '#ffffff'} onChange={(widgetTitleColor) => updateSelected({ widgetTitleColor })} /></div></div>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-border-color">Cor da borda</label><ColorField id="widget-border-color" value={selectedSource.widgetBorderColor ?? '#555779'} onChange={(widgetBorderColor) => updateSelected({ widgetBorderColor })} /></div><div><label className="field-label" htmlFor="widget-border-width">Espessura</label><input id="widget-border-width" className="text-input" type="number" min="0" max="12" value={selectedSource.widgetBorderWidth ?? 1} onChange={(event) => updateSelected({ widgetBorderWidth: clamp(Number(event.target.value) || 0, 0, 12) })} /></div></div>
                  <label className="field-label" htmlFor="widget-radius">Cantos arredondados</label><div className="range-row"><input id="widget-radius" type="range" min="0" max="80" value={selectedSource.widgetRadius ?? 12} onChange={(event) => updateSelected({ widgetRadius: Number(event.target.value) })} /><span>{selectedSource.widgetRadius ?? 12}px</span></div>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-padding">Espaço interno</label><input id="widget-padding" className="text-input" type="number" min="0" max="48" value={selectedSource.widgetPadding ?? 12} onChange={(event) => updateSelected({ widgetPadding: clamp(Number(event.target.value) || 0, 0, 48) })} /></div><div><label className="field-label" htmlFor="widget-gap">Espaço entre itens</label><input id="widget-gap" className="text-input" type="number" min="0" max="32" value={selectedSource.widgetGap ?? 8} onChange={(event) => updateSelected({ widgetGap: clamp(Number(event.target.value) || 0, 0, 32) })} /></div></div>
                  {!['chat', 'clock'].includes(selectedSource.widgetKind ?? '') && <>
                  <label className="field-label" htmlFor="widget-font-family">Família tipográfica</label><input id="widget-font-family" className="text-input" value={selectedSource.widgetFontFamily ?? ''} onChange={(event) => updateSelected({ widgetFontFamily: event.target.value })} placeholder="Herdar padrão do widget" />
                  <label className="field-label" htmlFor="widget-font-url">Importar fonte para este widget por link</label><input id="widget-font-url" className="text-input" type="url" value={selectedSource.widgetFontUrl ?? ''} onChange={(event) => updateSelected({ widgetFontUrl: event.target.value })} placeholder="https://fonts.googleapis.com/css2?..." />
                  <button className="wide-action" type="button" onClick={applyWidgetFontUrl}>Carregar fonte do widget</button>
                  </>}
                  {!['chat', 'clock'].includes(selectedSource.widgetKind ?? '') && <>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-font-size">Tamanho base do texto (px)</label><input id="widget-font-size" className="text-input" type="number" min="6" max="100" value={selectedSource.widgetFontSize ?? 16} onChange={(event) => updateSelected({ widgetFontSize: clamp(Number(event.target.value) || 16, 6, 100) })} /></div><div><label className="field-label" htmlFor="widget-font-weight">Peso da fonte</label><select id="widget-font-weight" className="text-input" value={selectedSource.widgetFontWeight ?? 500} onChange={(event) => updateSelected({ widgetFontWeight: Number(event.target.value) })}><option value="300">Leve</option><option value="400">Normal</option><option value="500">Médio</option><option value="600">Seminegrito</option><option value="700">Negrito</option><option value="800">Extra negrito</option><option value="900">Preto</option></select></div></div>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-title-size">Tamanho do título (px)</label><input id="widget-title-size" className="text-input" type="number" min="6" max="80" value={selectedSource.widgetTitleSize ?? 12} onChange={(event) => updateSelected({ widgetTitleSize: clamp(Number(event.target.value) || 12, 6, 80) })} /></div><div><label className="field-label" htmlFor="widget-letter-spacing">Espaço entre letras (px)</label><input id="widget-letter-spacing" className="text-input" type="number" min="-5" max="20" step="0.1" value={selectedSource.widgetLetterSpacing ?? 0} onChange={(event) => updateSelected({ widgetLetterSpacing: clamp(Number(event.target.value) || 0, -5, 20) })} /></div></div>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-subtitle-color">Cor de subtítulos</label><ColorField id="widget-subtitle-color" value={selectedSource.widgetSubtitleColor ?? selectedSource.widgetTextColor ?? '#a7acbe'} onChange={(widgetSubtitleColor) => updateSelected({ widgetSubtitleColor })} /></div><div><label className="field-label" htmlFor="widget-value-color">Cor dos valores/números</label><ColorField id="widget-value-color" value={selectedSource.widgetValueColor ?? selectedSource.widgetTitleColor ?? '#ffffff'} onChange={(widgetValueColor) => updateSelected({ widgetValueColor })} /></div></div>
                  <div className="two-field-grid"><div><label className="field-label" htmlFor="widget-track-color">Cor da trilha</label><ColorField id="widget-track-color" value={selectedSource.widgetTrackColor ?? '#080a14'} onChange={(widgetTrackColor) => updateSelected({ widgetTrackColor })} /></div><div><label className="field-label" htmlFor="widget-fill-color">Cor de preenchimento</label><ColorField id="widget-fill-color" value={selectedSource.widgetFillColor ?? selectedSource.widgetAccent ?? '#8d85ff'} onChange={(widgetFillColor) => updateSelected({ widgetFillColor })} /></div></div>
                  <label className="field-label" htmlFor="widget-item-background">Fundo de cada item/linha</label><ColorField id="widget-item-background" value={selectedSource.widgetItemBackgroundColor ?? '#222432'} onChange={(widgetItemBackgroundColor) => updateSelected({ widgetItemBackgroundColor })} />
                  <label className="field-label" htmlFor="widget-item-border">Borda de cada item/linha</label><ColorField id="widget-item-border" value={selectedSource.widgetItemBorderColor ?? '#ffffff'} onChange={(widgetItemBorderColor) => updateSelected({ widgetItemBorderColor })} />
                  </>}
                  {selectedSource.widgetKind === 'chat' && <>
                    <div className="field-divider" /><p className="eyebrow section-eyebrow">CAIXA DE CHAT · BOLHAS E NOMES</p>
                    <label className="field-label" htmlFor="chat-base-font-family">Fonte padrão do chat</label><input id="chat-base-font-family" className="text-input" value={selectedSource.widgetFontFamily ?? ''} onChange={(event) => updateSelected({ widgetFontFamily: event.target.value })} placeholder="Ex.: Inter, sans-serif" />
                    <label className="field-label" htmlFor="chat-base-font-url">Carregar fonte pela internet (URL)</label><input id="chat-base-font-url" className="text-input" type="url" value={selectedSource.widgetFontUrl ?? ''} onChange={(event) => updateSelected({ widgetFontUrl: event.target.value })} placeholder="https://fonts.googleapis.com/css2?..." />
                    <button className="wide-action" type="button" onClick={applyWidgetFontUrl}>Carregar fonte base do chat</button>
                    <p className="field-hint">A fonte base é usada para nome e mensagem quando você não escolhe uma família específica abaixo.</p>
                    <label className="field-label" htmlFor="chat-layout">Organização das mensagens</label><select id="chat-layout" className="text-input" value={selectedSource.chatLayout ?? 'stacked'} onChange={(event) => updateSelected({ chatLayout: event.target.value as SceneSource['chatLayout'] })}><option value="stacked">Nome acima da mensagem (estilo live)</option><option value="inline">Nome e mensagem na mesma linha</option></select>
                    <label className="field-label" htmlFor="chat-username-placement">Onde mostrar o nome?</label><select id="chat-username-placement" className="text-input" value={selectedSource.chatUsernamePlacement ?? 'separate'} onChange={(event) => updateSelected({ chatUsernamePlacement: event.target.value as SceneSource['chatUsernamePlacement'] })}><option value="separate">Em uma etiqueta / balão separado</option><option value="same-bubble">Dentro do mesmo balão da mensagem</option></select>
                    <label className="lock-toggle"><input type="checkbox" checked={selectedSource.chatUsernamePill !== false} onChange={(event) => updateSelected({ chatUsernamePill: event.target.checked })} /><span>Mostrar etiqueta separada para o nome</span></label>
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-name-pill-color">Cor da etiqueta do nome</label><ColorField id="chat-name-pill-color" value={selectedSource.chatUsernamePillColor ?? '#b94780'} onChange={(chatUsernamePillColor) => updateSelected({ chatUsernamePillColor })} /></div><div><label className="field-label" htmlFor="chat-name-pill-opacity">Opacidade do nome (%)</label><input id="chat-name-pill-opacity" className="text-input" type="number" min="0" max="100" value={Math.round((selectedSource.chatUsernamePillOpacity ?? 0.95) * 100)} disabled={selectedSource.chatUsernamePill === false} onChange={(event) => updateSelected({ chatUsernamePillOpacity: clamp(Number(event.target.value) / 100 || 0, 0, 1) })} /></div></div>
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-name-pill-radius">Arredondamento do nome</label><input id="chat-name-pill-radius" className="text-input" type="number" min="0" max="100" value={selectedSource.chatUsernamePillRadius ?? 999} disabled={selectedSource.chatUsernamePill === false} onChange={(event) => updateSelected({ chatUsernamePillRadius: clamp(Number(event.target.value) || 0, 0, 100) })} /></div><div><label className="field-label" htmlFor="chat-name-weight">Peso do nome</label><select id="chat-name-weight" className="text-input" value={selectedSource.chatUsernameFontWeight ?? 800} onChange={(event) => updateSelected({ chatUsernameFontWeight: Number(event.target.value) })}><option value="400">Normal</option><option value="500">Médio</option><option value="600">Seminegrito</option><option value="700">Negrito</option><option value="800">Extra negrito</option><option value="900">Preto</option></select></div></div>
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-name-padding-x">Margem horizontal do nome</label><input id="chat-name-padding-x" className="text-input" type="number" min="0" max="40" value={selectedSource.chatUsernamePillPaddingX ?? 8} disabled={selectedSource.chatUsernamePill === false} onChange={(event) => updateSelected({ chatUsernamePillPaddingX: clamp(Number(event.target.value) || 0, 0, 40) })} /></div><div><label className="field-label" htmlFor="chat-name-padding-y">Margem vertical do nome</label><input id="chat-name-padding-y" className="text-input" type="number" min="0" max="30" value={selectedSource.chatUsernamePillPaddingY ?? 3} disabled={selectedSource.chatUsernamePill === false} onChange={(event) => updateSelected({ chatUsernamePillPaddingY: clamp(Number(event.target.value) || 0, 0, 30) })} /></div></div>
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-name-border-width">Borda da etiqueta</label><input id="chat-name-border-width" className="text-input" type="number" min="0" max="8" value={selectedSource.chatUsernamePillBorderWidth ?? 0} disabled={selectedSource.chatUsernamePill === false} onChange={(event) => updateSelected({ chatUsernamePillBorderWidth: clamp(Number(event.target.value) || 0, 0, 8) })} /></div><div><label className="field-label" htmlFor="chat-name-border-color">Cor da borda da etiqueta</label><ColorField id="chat-name-border-color" value={selectedSource.chatUsernamePillBorderColor ?? '#ffffff'} onChange={(chatUsernamePillBorderColor) => updateSelected({ chatUsernamePillBorderColor })} /></div></div>
                    <label className="field-label" htmlFor="chat-username-font-family">Fonte do nome (família CSS)</label><input id="chat-username-font-family" className="text-input" value={selectedSource.chatUsernameFontFamily ?? ''} onChange={(event) => updateSelected({ chatUsernameFontFamily: event.target.value })} placeholder="Herdar fonte do widget" />
                    <label className="field-label" htmlFor="chat-message-font-family">Fonte da mensagem (família CSS)</label><input id="chat-message-font-family" className="text-input" value={selectedSource.chatMessageFontFamily ?? ''} onChange={(event) => updateSelected({ chatMessageFontFamily: event.target.value })} placeholder="Herdar fonte do widget" />
                    <label className="lock-toggle"><input type="checkbox" checked={selectedSource.chatBubbleEnabled !== false} onChange={(event) => updateSelected({ chatBubbleEnabled: event.target.checked })} /><span>Mostrar balão atrás de cada mensagem</span></label>
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-bubble-color">Cor dos balões</label><ColorField id="chat-bubble-color" value={selectedSource.chatBubbleColor ?? '#e979b2'} onChange={(chatBubbleColor) => updateSelected({ chatBubbleColor })} /></div><div><label className="field-label" htmlFor="chat-bubble-opacity">Opacidade do balão</label><input id="chat-bubble-opacity" className="text-input" type="number" min="0" max="100" value={Math.round((selectedSource.chatBubbleOpacity ?? 0.78) * 100)} disabled={selectedSource.chatBubbleEnabled === false} onChange={(event) => updateSelected({ chatBubbleOpacity: clamp(Number(event.target.value) / 100 || 0, 0, 1) })} /></div></div>
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-bubble-radius">Arredondamento</label><input id="chat-bubble-radius" className="text-input" type="number" min="0" max="100" value={selectedSource.chatBubbleRadius ?? 18} disabled={selectedSource.chatBubbleEnabled === false} onChange={(event) => updateSelected({ chatBubbleRadius: clamp(Number(event.target.value) || 0, 0, 100) })} /></div><div><label className="field-label" htmlFor="chat-bubble-border-width">Borda do balão</label><input id="chat-bubble-border-width" className="text-input" type="number" min="0" max="8" value={selectedSource.chatBubbleBorderWidth ?? 0} disabled={selectedSource.chatBubbleEnabled === false} onChange={(event) => updateSelected({ chatBubbleBorderWidth: clamp(Number(event.target.value) || 0, 0, 8) })} /></div></div>
                    <label className="field-label" htmlFor="chat-bubble-border-color">Cor da borda do balão</label><ColorField id="chat-bubble-border-color" value={selectedSource.chatBubbleBorderColor ?? '#ffffff'} onChange={(chatBubbleBorderColor) => updateSelected({ chatBubbleBorderColor })} />
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-padding-x">Margem horizontal</label><input id="chat-padding-x" className="text-input" type="number" min="0" max="60" value={selectedSource.chatBubblePaddingX ?? 10} onChange={(event) => updateSelected({ chatBubblePaddingX: clamp(Number(event.target.value) || 0, 0, 60) })} /></div><div><label className="field-label" htmlFor="chat-padding-y">Margem vertical</label><input id="chat-padding-y" className="text-input" type="number" min="0" max="40" value={selectedSource.chatBubblePaddingY ?? 6} onChange={(event) => updateSelected({ chatBubblePaddingY: clamp(Number(event.target.value) || 0, 0, 40) })} /></div></div>
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-username-size">Tamanho do nome</label><input id="chat-username-size" className="text-input" type="number" min="6" max="60" value={selectedSource.chatUsernameFontSize ?? 12} onChange={(event) => updateSelected({ chatUsernameFontSize: clamp(Number(event.target.value) || 12, 6, 60) })} /></div><div><label className="field-label" htmlFor="chat-message-size">Tamanho da mensagem</label><input id="chat-message-size" className="text-input" type="number" min="6" max="60" value={selectedSource.chatMessageFontSize ?? 13} onChange={(event) => updateSelected({ chatMessageFontSize: clamp(Number(event.target.value) || 13, 6, 60) })} /></div></div>
                    <label className="field-label" htmlFor="chat-message-color">Cor do texto da mensagem</label><ColorField id="chat-message-color" value={selectedSource.chatMessageColor ?? selectedSource.widgetTextColor ?? '#ffffff'} onChange={(chatMessageColor) => updateSelected({ chatMessageColor })} />
                    <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.chatBubbleShadow)} onChange={(event) => updateSelected({ chatBubbleShadow: event.target.checked })} /><span>Sombra nos balões de mensagem</span></label>
                    <label className="field-label" htmlFor="chat-message-line-height">Altura de linha da mensagem</label><div className="range-row"><input id="chat-message-line-height" type="range" min="0.8" max="3" step="0.05" value={selectedSource.chatMessageLineHeight ?? 1.35} onChange={(event) => updateSelected({ chatMessageLineHeight: Number(event.target.value) })} /><span>{(selectedSource.chatMessageLineHeight ?? 1.35).toFixed(2)}</span></div>
                    <label className="field-label" htmlFor="chat-name-mode">Cores dos nomes</label><select id="chat-name-mode" className="text-input" value={selectedSource.chatUsernameColorMode ?? 'palette'} onChange={(event) => updateSelected({ chatUsernameColorMode: event.target.value as SceneSource['chatUsernameColorMode'] })}><option value="palette">Paleta colorida (por participante)</option><option value="uniform">Uma cor para todos os nomes</option></select>
                    {selectedSource.chatUsernameColorMode === 'uniform' && <><label className="field-label" htmlFor="chat-name-color">Cor dos nomes</label><ColorField id="chat-name-color" value={selectedSource.chatUsernameColor ?? '#ffffff'} onChange={(chatUsernameColor) => updateSelected({ chatUsernameColor })} /></>}
                    <div className="chat-user-colors">
                      <p className="field-label">Cores por participante</p>
                      <p className="field-hint">Escolha diretamente as cores dos nomes e dos balões dos participantes que aparecem nos exemplos. Quando o chat real for conectado, esta configuração poderá ser aplicada aos nomes recebidos.</p>
                      {getChatUserNames(selectedSource.widgetItems).map((username, index) => {
                        const nameColors = parseNamedColors(selectedSource.chatNameColors)
                        const bubbleColors = parseNamedColors(selectedSource.chatBubbleColors)
                        const palette = ['#b8a8ff', '#74dfc5', '#ffbd83', '#85c8ff', '#f68dc2', '#a8db77']
                        return <div className="chat-user-color-row" key={username}>
                          <span className="chat-user-color-name">{username}</span>
                          <div><small>Nome</small><ColorField id={`chat-user-name-color-${index}`} value={nameColors[username.toLowerCase()] ?? palette[index % palette.length]} onChange={(color) => updateChatNamedColor('name', username, color)} /></div>
                          <div><small>Balão</small><ColorField id={`chat-user-bubble-color-${index}`} value={bubbleColors[username.toLowerCase()] ?? selectedSource.chatBubbleColor ?? '#d85f9b'} disabled={selectedSource.chatBubbleEnabled === false} onChange={(color) => updateChatNamedColor('bubble', username, color)} /></div>
                        </div>
                      })}
                    </div>
                    <div className="two-field-grid"><div><label className="field-label" htmlFor="chat-max-items">Mensagens visíveis</label><input id="chat-max-items" className="text-input" type="number" min="1" max="30" value={selectedSource.widgetMaxItems ?? 8} onChange={(event) => updateSelected({ widgetMaxItems: clamp(Math.round(Number(event.target.value) || 1), 1, 30) })} /></div><div><label className="field-label" htmlFor="chat-gap">Distância entre mensagens</label><input id="chat-gap" className="text-input" type="number" min="0" max="40" value={selectedSource.chatLineGap ?? 8} onChange={(event) => updateSelected({ chatLineGap: clamp(Number(event.target.value) || 0, 0, 40) })} /></div></div>
                    <label className="field-label" htmlFor="chat-timestamp-color">Cor do horário</label><ColorField id="chat-timestamp-color" value={selectedSource.chatTimestampColor ?? '#f7d6e7'} onChange={(chatTimestampColor) => updateSelected({ chatTimestampColor })} />
                    <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.chatShowBadges)} onChange={(event) => updateSelected({ chatShowBadges: event.target.checked })} /><span>Mostrar emblema decorativo</span></label>
                    <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.chatShowTimestamp)} onChange={(event) => updateSelected({ chatShowTimestamp: event.target.checked })} /><span>Mostrar horário demonstrativo</span></label>
                    <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.chatTextShadow)} onChange={(event) => updateSelected({ chatTextShadow: event.target.checked })} /><span>Sombra no texto das mensagens</span></label>
                    <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.chatShowInput)} onChange={(event) => updateSelected({ chatShowInput: event.target.checked })} /><span>Mostrar campo de envio (visual)</span></label>
                  </>}
                  {selectedSource.widgetKind === 'clock' && <>
                    <div className="field-divider" /><p className="eyebrow section-eyebrow">RELÓGIO · NÚMEROS</p>
                    <label className="field-label" htmlFor="clock-font-family">Fonte dos números</label><input id="clock-font-family" className="text-input" value={selectedSource.widgetFontFamily ?? ''} onChange={(event) => updateSelected({ widgetFontFamily: event.target.value })} placeholder="Ex.: Inter, monospace" />
                    <label className="field-label" htmlFor="clock-font-url">Importar fonte pela internet (URL)</label><input id="clock-font-url" className="text-input" type="url" value={selectedSource.widgetFontUrl ?? ''} onChange={(event) => updateSelected({ widgetFontUrl: event.target.value })} placeholder="https://fonts.googleapis.com/css2?..." />
                    <button className="wide-action" type="button" onClick={applyWidgetFontUrl}>Carregar fonte dos números</button>
                    <label className="field-label" htmlFor="clock-font-size">Tamanho dos números (px)</label><input id="clock-font-size" className="text-input" type="number" min="8" max="200" value={selectedSource.widgetFontSize ?? 48} onChange={(event) => updateSelected({ widgetFontSize: clamp(Number(event.target.value) || 48, 8, 200) })} />
                    <label className="field-label" htmlFor="clock-color">Cor dos números</label><ColorField id="clock-color" value={selectedSource.clockColor ?? selectedSource.widgetTitleColor ?? '#ffffff'} onChange={(clockColor) => updateSelected({ clockColor })} />
                    <label className="field-label" htmlFor="clock-font-weight">Peso dos números</label><select id="clock-font-weight" className="text-input" value={selectedSource.widgetFontWeight ?? 800} onChange={(event) => updateSelected({ widgetFontWeight: Number(event.target.value) })}><option value="300">Leve</option><option value="400">Normal</option><option value="500">Médio</option><option value="600">Seminegrito</option><option value="700">Negrito</option><option value="800">Extra negrito</option><option value="900">Preto</option></select>
                    <label className="field-label" htmlFor="clock-spacing">Espaçamento dos números</label><input id="clock-spacing" className="text-input" type="number" min="-10" max="25" step="0.5" value={selectedSource.widgetLetterSpacing ?? -1} onChange={(event) => updateSelected({ widgetLetterSpacing: clamp(Number(event.target.value) || 0, -10, 25) })} />
                    <label className="field-label" htmlFor="clock-date-color">Cor da data</label><ColorField id="clock-date-color" value={selectedSource.clockDateColor ?? selectedSource.widgetTextColor ?? '#c6c8d5'} onChange={(clockDateColor) => updateSelected({ clockDateColor })} />
                    <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetShowHeader !== false} onChange={(event) => updateSelected({ widgetShowHeader: event.target.checked })} /><span>Mostrar título do relógio</span></label>
                    <label className="lock-toggle"><input type="checkbox" checked={selectedSource.clockShowDate !== false} onChange={(event) => updateSelected({ clockShowDate: event.target.checked })} /><span>Mostrar data</span></label>
                    <label className="lock-toggle"><input type="checkbox" checked={selectedSource.clockShowSeconds !== false} onChange={(event) => updateSelected({ clockShowSeconds: event.target.checked })} /><span>Mostrar segundos</span></label>
                    <label className="lock-toggle"><input type="checkbox" checked={selectedSource.clock24h !== false} onChange={(event) => updateSelected({ clock24h: event.target.checked })} /><span>Formato de 24 horas</span></label>
                    <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.clockTextShadow)} onChange={(event) => updateSelected({ clockTextShadow: event.target.checked })} /><span>Sombra nos números</span></label>
                    <label className="field-label" htmlFor="clock-date-format">Formato da data</label><select id="clock-date-format" className="text-input" value={selectedSource.clockDateFormat ?? 'short'} onChange={(event) => updateSelected({ clockDateFormat: event.target.value as SceneSource['clockDateFormat'] })}><option value="short">DD/MM/AAAA</option><option value="long">Data por extenso</option><option value="time">Dia e mês abreviados</option></select>
                  </>}
                  <div className="field-divider" />
                  <p className="eyebrow section-eyebrow">SALVAR E REUTILIZAR</p>
                  <button className="wide-action" type="button" onClick={() => downloadWidgetStyle(selectedSource)}>Exportar estilo deste widget (JSON)</button>
                  <button className="wide-action" type="button" onClick={() => widgetStyleInputRef.current?.click()}>Importar estilo para este widget (JSON)</button>
                  <p className="field-hint">O arquivo de estilo reutiliza a aparência e o conteúdo sem substituir a posição, o tamanho ou o nome da camada.</p>
                  <label className="field-label" htmlFor="widget-theme">Acabamento do widget</label><select id="widget-theme" className="text-input" value={selectedSource.widgetTheme ?? 'glass'} onChange={(event) => updateSelected({ widgetTheme: event.target.value as WidgetTheme })}><option value="glass">Vidro translúcido</option><option value="neon">Neon</option><option value="minimal">Minimalista</option><option value="solid">Sólido</option></select>
                  <label className="field-label" htmlFor="widget-motion">Animação</label><select id="widget-motion" className="text-input" value={selectedSource.widgetAnimation ?? 'subtle'} onChange={(event) => updateSelected({ widgetAnimation: event.target.value as SceneSource['widgetAnimation'] })}><option value="none">Sem animações</option><option value="subtle">Suave</option><option value="energetic">Mais chamativa</option></select>
                  <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetShowHeader !== false} onChange={(event) => updateSelected({ widgetShowHeader: event.target.checked })} /><span>Mostrar cabeçalho (quando suportado)</span></label>
                  <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.widgetCompact)} onChange={(event) => updateSelected({ widgetCompact: event.target.checked })} /><span>Modo compacto</span></label>
                  <label className="lock-toggle"><input type="checkbox" checked={selectedSource.widgetShowIcon !== false} onChange={(event) => updateSelected({ widgetShowIcon: event.target.checked })} /><span>Mostrar ícones</span></label>
                  </div>
                </details>}
                <div className="field-divider" />
                <p className="eyebrow section-eyebrow">APARÊNCIA GERAL</p>
                <label className="field-label" htmlFor="source-opacity">Opacidade geral</label><div className="range-row"><input id="source-opacity" type="range" min="0" max="1" step="0.05" value={selectedSource.opacity ?? 1} onChange={(event) => updateSelected({ opacity: Number(event.target.value) })} /><span>{Math.round((selectedSource.opacity ?? 1) * 100)}%</span></div>
                <label className="field-label" htmlFor="source-border-width">Espessura da borda externa</label><div className="range-row"><input id="source-border-width" type="range" min="0" max="20" step="1" value={selectedSource.borderWidth ?? 0} onChange={(event) => updateSelected({ borderWidth: Number(event.target.value) })} /><span>{selectedSource.borderWidth ?? 0}px</span></div>
                <label className="field-label" htmlFor="source-border-color">Cor da borda externa</label><ColorField id="source-border-color" value={selectedSource.borderColor ?? '#ffffff'} onChange={(borderColor) => updateSelected({ borderColor })} />
                {selectedSource.type !== 'shape' && <><label className="field-label" htmlFor="source-radius-general">Arredondamento externo</label><div className="range-row"><input id="source-radius-general" type="range" min="0" max="100" step="1" value={selectedSource.radius ?? 4} onChange={(event) => updateSelected({ radius: Number(event.target.value) })} /><span>{selectedSource.radius ?? 4}px</span></div></>}
                <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.shadow)} onChange={(event) => updateSelected({ shadow: event.target.checked })} /><span>Sombra projetada</span></label>
                {selectedSource.type === 'camera' && <label className="lock-toggle"><input type="checkbox" checked={selectedSource.cameraMirror !== false} onChange={(event) => updateSelected({ cameraMirror: event.target.checked })} /><span>Espelhar webcam</span></label>}
              </div>}

              {elementSection === 'transform' && <div className="property-fields">
                <p className="eyebrow section-eyebrow">POSIÇÃO E TAMANHO</p>
                <p className="field-hint">O jeito mais fácil é arrastar o item na prévia e puxar os cantos para redimensionar. Use os ajustes manuais apenas quando precisar de precisão.</p>
                <details className="settings-accordion"><summary>Ajustar tamanho manualmente</summary><div className="settings-accordion-content">
                <div className="geometry-grid">
                  <NumberField label="X" value={selectedSource.x} onChange={(x) => updateSelected({ x: clamp(x, 0, 100 - selectedSource.w) })} />
                  <NumberField label="Y" value={selectedSource.y} onChange={(y) => updateSelected({ y: clamp(y, 0, 100 - selectedSource.h) })} />
                  <NumberField label="Largura" value={selectedSource.w} onChange={(w) => updateSelected({ w: clamp(w, 4, 100 - selectedSource.x) })} />
                  <NumberField label="Altura" value={selectedSource.h} onChange={(h) => updateSelected({ h: clamp(h, 4, 100 - selectedSource.y) })} />
                </div>
                <label className="field-label" htmlFor="source-rotation">Rotação</label><div className="range-row"><input id="source-rotation" type="range" min="-180" max="180" step="1" value={selectedSource.rotation ?? 0} onChange={(event) => updateSelected({ rotation: Number(event.target.value) })} /><span>{selectedSource.rotation ?? 0}°</span></div>
                </div></details>
                <label className="field-label">Alinhar na tela</label>
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
          <select id="scene-background-mode" className="text-input" value={activeScene.background?.mode ?? 'transparent'} onChange={(event) => updateScene({ background: { ...(activeScene.background ?? { color: '#25233a', color2: '#10121a', angle: 135 }), mode: event.target.value as BackgroundConfig['mode'] } })}><option value="transparent">Transparente (overlay)</option><option value="solid">Cor sólida</option><option value="gradient">Gradiente</option><option value="image">Imagem de fundo</option><option value="video">Vídeo de fundo</option><option value="screen">Captura de tela/janela</option><option value="animated">Tema animado</option><option value="slideshow">Carrossel de imagens</option></select>
          {(activeScene.background?.mode === 'solid' || activeScene.background?.mode === 'gradient' || activeScene.background?.mode === 'image' || activeScene.background?.mode === 'video' || activeScene.background?.mode === 'screen') && <><label className="field-label" htmlFor="scene-bg-color">Cor base</label><ColorField id="scene-bg-color" value={activeScene.background?.color ?? '#171923'} onChange={(color) => updateScene({ background: { ...(activeScene.background ?? { mode: 'solid', color2: '#10121a', angle: 135 }), color } })} /></>}
          {activeScene.background?.mode === 'gradient' && <><label className="field-label" htmlFor="scene-bg-color2">Segunda cor</label><ColorField id="scene-bg-color2" value={activeScene.background.color2 ?? '#10121a'} onChange={(color2) => updateScene({ background: { ...activeScene.background!, color2 } })} /><label className="field-label" htmlFor="scene-bg-angle">Ângulo do gradiente</label><div className="range-row"><input id="scene-bg-angle" type="range" min="0" max="360" value={activeScene.background.angle ?? 135} onChange={(event) => updateScene({ background: { ...activeScene.background!, angle: Number(event.target.value) } })} /><span>{activeScene.background.angle ?? 135}°</span></div></>}
          {activeScene.background?.mode === 'animated' && <>
            <label className="field-label" htmlFor="animated-theme">Tema animado</label>
            <select id="animated-theme" className="text-input" value={activeScene.background.animatedTheme ?? 'aurora'} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedTheme: event.target.value as NonNullable<BackgroundConfig['animatedTheme']> } })}>
              <option value="custom">Tema livre · composição personalizada</option><option value="aurora">Aurora fluida</option><option value="stars">Espaço estrelado</option><option value="cyber-grid">Grade cyberpunk</option><option value="waves">Ondas luminosas</option><option value="gradient-flow">Gradiente líquido</option><option value="matrix-rain">Chuva Matrix</option><option value="liquid-lava">Lava líquida</option><option value="bokeh">Bokeh cinematográfico</option><option value="sunset-clouds">Nuvens de pôr do sol</option><option value="electric-pulse">Pulso elétrico</option><option value="particles">Partículas flutuantes</option><option value="laser-grid">Grade laser</option><option value="deep-ocean">Oceano profundo</option><option value="prism">Prisma iridescente</option>
            </select>
            <div className="animated-theme-actions">
              <button className="wide-action" type="button" onClick={() => animatedThemeInputRef.current?.click()}>Importar tema animado (.json)</button>
              <button className="wide-action secondary-action" type="button" onClick={exportAnimatedTheme}>Exportar tema atual</button>
            </div>
            <div className="background-import-card animated-media-import-card">
              <strong>Usar uma animação como fundo</strong>
              <small>Também é possível importar um GIF/WebP animado ou um vídeo MP4/WebM para usar como plano de fundo.</small>
              <button className="wide-action" type="button" onClick={() => backgroundDesignInputRef.current?.click()}>Importar GIF / WebP animado</button>
              <button className="wide-action secondary-action" type="button" onClick={() => { backgroundPlaylistAppendTargetRef.current = null; backgroundVideoInputRef.current?.click() }}>Importar vídeo MP4 / WebM…</button>
            </div>
            <p className="field-hint">Os arquivos JSON de tema guardam o preset, as cores, a velocidade e a intensidade. GIFs e vídeos são importados como mídia de fundo editável.</p>
            <div className="two-field-grid"><div><label className="field-label" htmlFor="animated-color-a">Cor principal</label><ColorField id="animated-color-a" value={activeScene.background.color ?? '#17142b'} onChange={(color) => updateScene({ background: { ...activeScene.background!, color } })} /></div><div><label className="field-label" htmlFor="animated-color-b">Cor secundária</label><ColorField id="animated-color-b" value={activeScene.background.color2 ?? '#0b111d'} onChange={(color2) => updateScene({ background: { ...activeScene.background!, color2 } })} /></div></div>
            <label className="field-label" htmlFor="animated-accent">Cor de destaque</label><ColorField id="animated-accent" value={activeScene.background.animatedAccent ?? '#8d85ff'} onChange={(animatedAccent) => updateScene({ background: { ...activeScene.background!, animatedAccent } })} />
            <label className="field-label" htmlFor="animated-speed">Velocidade · {Number(activeScene.background.animatedSpeed ?? 1).toFixed(2)}×</label><div className="range-row"><input id="animated-speed" type="range" min="0.25" max="3" step="0.25" value={activeScene.background.animatedSpeed ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedSpeed: Number(event.target.value) } })} /><span>{Number(activeScene.background.animatedSpeed ?? 1).toFixed(2)}×</span></div>
            <label className="field-label" htmlFor="animated-intensity">Intensidade · {Math.round((activeScene.background.animatedIntensity ?? 0.75) * 100)}%</label><div className="range-row"><input id="animated-intensity" type="range" min="0" max="1" step="0.05" value={activeScene.background.animatedIntensity ?? 0.75} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedIntensity: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.animatedIntensity ?? 0.75) * 100)}%</span></div>
            <div className="field-divider" /><p className="eyebrow section-eyebrow">MOVIMENTO E ACABAMENTO</p>
            <label className="field-label" htmlFor="animated-blur">Desfoque das camadas · {Math.round(activeScene.background.animatedBlur ?? 26)} px</label><div className="range-row"><input id="animated-blur" type="range" min="0" max="80" step="2" value={activeScene.background.animatedBlur ?? 26} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedBlur: Number(event.target.value) } })} /><span>{Math.round(activeScene.background.animatedBlur ?? 26)} px</span></div>
            <label className="field-label" htmlFor="animated-glow">Brilho / glow · {Math.round((activeScene.background.animatedGlow ?? 0.7) * 100)}%</label><div className="range-row"><input id="animated-glow" type="range" min="0" max="1" step="0.05" value={activeScene.background.animatedGlow ?? 0.7} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedGlow: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.animatedGlow ?? 0.7) * 100)}%</span></div>
            <label className="field-label" htmlFor="animated-grain">Textura / grão · {Math.round((activeScene.background.animatedGrain ?? 0.08) * 100)}%</label><div className="range-row"><input id="animated-grain" type="range" min="0" max="0.3" step="0.01" value={activeScene.background.animatedGrain ?? 0.08} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedGrain: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.animatedGrain ?? 0.08) * 100)}%</span></div>
            <label className="field-label" htmlFor="animated-vignette">Vinheta nas bordas · {Math.round((activeScene.background.animatedVignette ?? 0.25) * 100)}%</label><div className="range-row"><input id="animated-vignette" type="range" min="0" max="1" step="0.05" value={activeScene.background.animatedVignette ?? 0.25} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedVignette: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.animatedVignette ?? 0.25) * 100)}%</span></div>
            <label className="field-label" htmlFor="animated-density">Densidade dos efeitos · {Number(activeScene.background.animatedDensity ?? 1).toFixed(2)}×</label><div className="range-row"><input id="animated-density" type="range" min="0.25" max="3" step="0.25" value={activeScene.background.animatedDensity ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedDensity: Number(event.target.value) } })} /><span>{Number(activeScene.background.animatedDensity ?? 1).toFixed(2)}×</span></div>
            <label className="field-label" htmlFor="animated-scale">Escala dos efeitos · {Number(activeScene.background.animatedScale ?? 1).toFixed(2)}×</label><div className="range-row"><input id="animated-scale" type="range" min="0.5" max="2" step="0.1" value={activeScene.background.animatedScale ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedScale: Number(event.target.value) } })} /><span>{Number(activeScene.background.animatedScale ?? 1).toFixed(2)}×</span></div>
            <label className="field-label" htmlFor="animated-direction">Direção do movimento</label><select id="animated-direction" className="text-input" value={activeScene.background.animatedDirection ?? 'alternate'} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedDirection: event.target.value as NonNullable<BackgroundConfig['animatedDirection']> } })}><option value="normal">Normal</option><option value="reverse">Reversa</option><option value="alternate">Alternada</option></select>
            <label className="field-label" htmlFor="animated-layers">Complexidade visual</label><select id="animated-layers" className="text-input" value={activeScene.background.animatedLayers ?? 'balanced'} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedLayers: event.target.value as NonNullable<BackgroundConfig['animatedLayers']> } })}><option value="soft">Suave — menos camadas</option><option value="balanced">Equilibrada</option><option value="rich">Rica — camadas extras</option></select>
            <label className="field-label" htmlFor="animated-angle">Ângulo do tema · {activeScene.background.angle ?? 135}°</label><div className="range-row"><input id="animated-angle" type="range" min="0" max="360" step="5" value={activeScene.background.angle ?? 135} onChange={(event) => updateScene({ background: { ...activeScene.background!, angle: Number(event.target.value) } })} /><span>{activeScene.background.angle ?? 135}°</span></div>
            <div className="field-divider" /><p className="eyebrow section-eyebrow">AJUSTE DE COR GLOBAL</p>
            <label className="field-label" htmlFor="animated-brightness">Brilho global · {Math.round((activeScene.background.animatedBrightness ?? 1) * 100)}%</label><div className="range-row"><input id="animated-brightness" type="range" min="0" max="2" step="0.05" value={activeScene.background.animatedBrightness ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedBrightness: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.animatedBrightness ?? 1) * 100)}%</span></div>
            <label className="field-label" htmlFor="animated-contrast">Contraste global · {Math.round((activeScene.background.animatedContrast ?? 1) * 100)}%</label><div className="range-row"><input id="animated-contrast" type="range" min="0" max="2" step="0.05" value={activeScene.background.animatedContrast ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedContrast: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.animatedContrast ?? 1) * 100)}%</span></div>
            <label className="field-label" htmlFor="animated-saturation">Saturação global · {Math.round((activeScene.background.animatedSaturation ?? 1) * 100)}%</label><div className="range-row"><input id="animated-saturation" type="range" min="0" max="3" step="0.05" value={activeScene.background.animatedSaturation ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedSaturation: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.animatedSaturation ?? 1) * 100)}%</span></div>
            <label className="field-label" htmlFor="animated-hue">Matiz global · {Math.round(activeScene.background.animatedHueRotate ?? 0)}°</label><div className="range-row"><input id="animated-hue" type="range" min="0" max="360" step="5" value={activeScene.background.animatedHueRotate ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedHueRotate: Number(event.target.value) } })} /><span>{Math.round(activeScene.background.animatedHueRotate ?? 0)}°</span></div>
            <label className="field-label" htmlFor="animated-blend">Modo de mistura</label><select id="animated-blend" className="text-input" value={activeScene.background.animatedBlendMode ?? 'normal'} onChange={(event) => updateScene({ background: { ...activeScene.background!, animatedBlendMode: event.target.value as NonNullable<BackgroundConfig['animatedBlendMode']> } })}><option value="normal">Normal</option><option value="screen">Clarear (screen)</option><option value="lighten">Mais claro</option><option value="overlay">Sobrepor</option><option value="multiply">Multiplicar</option></select>
            <p className="field-hint">Temas em CSS, sem precisar renderizar um vídeo. Reduzir brilho, glow, textura e densidade ajuda a manter o uso de recursos moderado.</p>
          </>}
          {activeScene.background?.mode === 'slideshow' && <>
            <div className="background-import-card"><strong>Carrossel de imagens · {activeScene.background.slideshowImages?.length ?? 0} arquivo(s)</strong><small>Escolha várias fotos de uma vez. Não há um número fixo de fotos no editor; a quantidade prática depende do espaço disponível no navegador. Cada arquivo deve ter até 1,5 MB.</small>
              <button className="wide-action" type="button" onClick={() => { slideshowImportModeRef.current = 'append'; slideshowTargetSceneRef.current = activeScene.id; slideshowInputRef.current?.click() }}>＋ Adicionar fotos</button>
              <button className="wide-action secondary-action" type="button" onClick={() => { slideshowImportModeRef.current = 'replace'; slideshowTargetSceneRef.current = activeScene.id; slideshowInputRef.current?.click() }}>Substituir lista de fotos</button>
            </div>
            <div className="slideshow-image-list"><p className="eyebrow">ORDEM DAS FOTOS</p>
              {(activeScene.background.slideshowImages ?? []).map((image, index, images) => <div className="slideshow-image-row" key={image.id}><span className="slideshow-order">{index + 1}</span><span className="slideshow-image-name" title={image.name}>{image.name}</span><div className="slideshow-image-actions"><button type="button" disabled={index === 0} aria-label="Mover foto para cima" onClick={() => { const next = [...images]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; updateScene({ background: { ...activeScene.background!, slideshowImages: next } }) }}>↑</button><button type="button" disabled={index === images.length - 1} aria-label="Mover foto para baixo" onClick={() => { const next = [...images]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; updateScene({ background: { ...activeScene.background!, slideshowImages: next } }) }}>↓</button><button type="button" aria-label={`Remover ${image.name}`} onClick={() => updateScene({ background: { ...activeScene.background!, slideshowImages: images.filter((item) => item.id !== image.id) } })}>×</button></div></div>)}
              {(activeScene.background.slideshowImages?.length ?? 0) === 0 && <p className="field-hint">Ainda não há fotos. Adicione uma seleção de imagens para começar.</p>}
              {(activeScene.background.slideshowImages?.length ?? 0) > 0 && <button type="button" className="wide-action danger-action" onClick={() => { if (window.confirm('Remover todas as fotos da lista do carrossel?')) updateScene({ background: { ...activeScene.background!, slideshowImages: [] } }) }}>Limpar lista de fotos</button>}
            </div>
            <div className="field-divider" /><p className="eyebrow section-eyebrow">TEMPO E TRANSIÇÃO</p>
            <label className="field-label" htmlFor="slideshow-interval">Tempo por foto · {activeScene.background.slideshowIntervalSeconds ?? 10} s</label><div className="range-row"><input id="slideshow-interval" type="range" min="1" max="600" step="1" value={activeScene.background.slideshowIntervalSeconds ?? 10} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowIntervalSeconds: Number(event.target.value) } })} /><span>{activeScene.background.slideshowIntervalSeconds ?? 10} s</span></div>
            <label className="field-label" htmlFor="slideshow-transition">Transição</label><select id="slideshow-transition" className="text-input" value={activeScene.background.slideshowTransition ?? 'fade'} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowTransition: event.target.value as NonNullable<BackgroundConfig['slideshowTransition']> } })}><option value="fade">Dissolver / fade</option><option value="slide">Deslizar</option><option value="zoom">Zoom</option><option value="blur">Desfoque</option><option value="none">Corte direto</option></select>
            <label className="field-label" htmlFor="slideshow-transition-time">Duração da transição · {Number(activeScene.background.slideshowTransitionDuration ?? 1.2).toFixed(1)} s</label><div className="range-row"><input id="slideshow-transition-time" type="range" min="0" max="5" step="0.1" value={activeScene.background.slideshowTransitionDuration ?? 1.2} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowTransitionDuration: Number(event.target.value) } })} /><span>{Number(activeScene.background.slideshowTransitionDuration ?? 1.2).toFixed(1)} s</span></div>
            <div className="two-field-grid"><label className="checkbox-row"><input type="checkbox" checked={activeScene.background.slideshowLoop !== false} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowLoop: event.target.checked } })} /><span>Repetir em loop</span></label><label className="checkbox-row"><input type="checkbox" checked={activeScene.background.slideshowShuffle === true} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowShuffle: event.target.checked } })} /><span>Ordem aleatória</span></label></div>
            <div className="field-divider" /><p className="eyebrow section-eyebrow">ENQUADRAMENTO E MOVIMENTO</p>
            <label className="field-label" htmlFor="slideshow-fit">Enquadramento</label><select id="slideshow-fit" className="text-input" value={activeScene.background.slideshowFit ?? 'cover'} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowFit: event.target.value as NonNullable<BackgroundConfig['slideshowFit']> } })}><option value="cover">Cobrir a tela (corta bordas)</option><option value="contain">Mostrar imagem inteira</option><option value="stretch">Esticar para preencher</option></select>
            <label className="field-label" htmlFor="slideshow-position">Ponto focal</label><select id="slideshow-position" className="text-input" value={activeScene.background.slideshowPosition ?? 'center center'} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowPosition: event.target.value } })}><option value="center center">Centro</option><option value="top center">Topo</option><option value="bottom center">Base</option><option value="left center">Esquerda</option><option value="right center">Direita</option><option value="top left">Superior esquerda</option><option value="top right">Superior direita</option><option value="bottom left">Inferior esquerda</option><option value="bottom right">Inferior direita</option></select>
            <label className="field-label" htmlFor="slideshow-zoom">Zoom base · {Number(activeScene.background.slideshowZoom ?? 1).toFixed(2)}×</label><div className="range-row"><input id="slideshow-zoom" type="range" min="0.8" max="1.5" step="0.05" value={activeScene.background.slideshowZoom ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowZoom: Number(event.target.value) } })} /><span>{Number(activeScene.background.slideshowZoom ?? 1).toFixed(2)}×</span></div>
            <label className="checkbox-row"><input type="checkbox" checked={activeScene.background.slideshowKenBurns === true} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowKenBurns: event.target.checked } })} /><span>Efeito Ken Burns (zoom e deslocamento suaves)</span></label>
            <div className="field-divider" /><p className="eyebrow section-eyebrow">COR E ACABAMENTO</p>
            <label className="field-label" htmlFor="slideshow-opacity">Opacidade · {Math.round((activeScene.background.slideshowOpacity ?? 1) * 100)}%</label><div className="range-row"><input id="slideshow-opacity" type="range" min="0" max="1" step="0.05" value={activeScene.background.slideshowOpacity ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowOpacity: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.slideshowOpacity ?? 1) * 100)}%</span></div>
            <label className="field-label" htmlFor="slideshow-brightness">Brilho · {Math.round((activeScene.background.slideshowBrightness ?? 1) * 100)}%</label><div className="range-row"><input id="slideshow-brightness" type="range" min="0" max="2" step="0.05" value={activeScene.background.slideshowBrightness ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowBrightness: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.slideshowBrightness ?? 1) * 100)}%</span></div>
            <label className="field-label" htmlFor="slideshow-contrast">Contraste · {Math.round((activeScene.background.slideshowContrast ?? 1) * 100)}%</label><div className="range-row"><input id="slideshow-contrast" type="range" min="0" max="2" step="0.05" value={activeScene.background.slideshowContrast ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowContrast: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.slideshowContrast ?? 1) * 100)}%</span></div>
            <label className="field-label" htmlFor="slideshow-saturation">Saturação · {Math.round((activeScene.background.slideshowSaturation ?? 1) * 100)}%</label><div className="range-row"><input id="slideshow-saturation" type="range" min="0" max="2" step="0.05" value={activeScene.background.slideshowSaturation ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowSaturation: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.slideshowSaturation ?? 1) * 100)}%</span></div>
            <label className="field-label" htmlFor="slideshow-hue">Matiz · {Math.round(activeScene.background.slideshowHueRotate ?? 0)}°</label><div className="range-row"><input id="slideshow-hue" type="range" min="0" max="360" step="5" value={activeScene.background.slideshowHueRotate ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowHueRotate: Number(event.target.value) } })} /><span>{Math.round(activeScene.background.slideshowHueRotate ?? 0)}°</span></div>
            <label className="field-label" htmlFor="slideshow-blur">Desfoque · {Math.round(activeScene.background.slideshowBlur ?? 0)} px</label><div className="range-row"><input id="slideshow-blur" type="range" min="0" max="20" step="1" value={activeScene.background.slideshowBlur ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowBlur: Number(event.target.value) } })} /><span>{Math.round(activeScene.background.slideshowBlur ?? 0)} px</span></div>
            <label className="field-label" htmlFor="slideshow-overlay-color">Sobreposição de cor</label><ColorField id="slideshow-overlay-color" value={activeScene.background.slideshowOverlayColor ?? '#000000'} onChange={(slideshowOverlayColor) => updateScene({ background: { ...activeScene.background!, slideshowOverlayColor } })} />
            <label className="field-label" htmlFor="slideshow-overlay-opacity">Intensidade da sobreposição · {Math.round((activeScene.background.slideshowOverlayOpacity ?? 0) * 100)}%</label><div className="range-row"><input id="slideshow-overlay-opacity" type="range" min="0" max="1" step="0.05" value={activeScene.background.slideshowOverlayOpacity ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, slideshowOverlayOpacity: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.slideshowOverlayOpacity ?? 0) * 100)}%</span></div>
            <button className="wide-action danger-action" type="button" onClick={() => updateScene({ background: { ...activeScene.background!, mode: 'transparent', slideshowImages: [] } })}>Remover carrossel do fundo</button>
          </>}
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
          {activeScene.background?.mode === 'video' && <>
            <div className="background-import-card"><strong>{activeScene.background.videoSrc ? 'Vídeo de fundo definido' : 'Nenhum vídeo de fundo'}</strong><small>Importe MP4, WebM, MOV ou outro formato aceito pelo navegador. Os vídeos locais ficam guardados no IndexedDB.</small><button className="wide-action" type="button" onClick={() => { backgroundPlaylistAppendTargetRef.current = null; backgroundVideoInputRef.current?.click() }}>Escolher vídeo(s) / substituir fundo</button>{activeScene.background.videoSrc && <button className="wide-action secondary-action" type="button" onClick={() => { backgroundPlaylistAppendTargetRef.current = activeScene.id; backgroundVideoInputRef.current?.click() }}>+ Acrescentar clipes ao fundo atual</button>}</div>
            {activeScene.background.videoClips && activeScene.background.videoClips.length > 1 && <div className="video-playlist-manager background-playlist-manager"><p className="eyebrow">SEQUÊNCIA DO FUNDO · {activeScene.background.videoClips.length} CLIPES</p>{activeScene.background.videoClips.map((clip, index, clips) => <div className="video-playlist-row" key={clip.id}><div className="video-playlist-row-heading"><strong>{index + 1}. {clip.name}</strong><div><button type="button" disabled={index === 0} aria-label="Mover clipe para cima" onClick={() => { const next = [...clips]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; updateScene({ background: { ...activeScene.background!, videoClips: next, videoSrc: next[0].src } }) }}>↑</button><button type="button" disabled={index === clips.length - 1} aria-label="Mover clipe para baixo" onClick={() => { const next = [...clips]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; updateScene({ background: { ...activeScene.background!, videoClips: next, videoSrc: next[0].src } }) }}>↓</button><button type="button" disabled={clips.length <= 1} aria-label="Remover clipe" onClick={() => { const next = clips.filter((item) => item.id !== clip.id); updateScene({ background: { ...activeScene.background!, videoClips: next.length > 1 ? next : undefined, videoSrc: next[0]?.src ?? undefined, videoStart: next[0]?.start ?? 0, videoEnd: next[0]?.end ?? 0, videoTrimEnabled: next[0]?.trimEnabled ?? false } }) }}>×</button></div></div><div className="video-playlist-trim-grid"><label>Início (s)<input className="text-input" type="number" min="0" max="3600" step="0.1" value={clip.start ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoClips: clips.map((item) => item.id === clip.id ? { ...item, start: Math.max(0, Number(event.target.value) || 0), trimEnabled: true } : item) } })} /></label><label>Fim (s, 0 = final)<input className="text-input" type="number" min="0" max="3600" step="0.1" value={clip.end ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoClips: clips.map((item) => item.id === clip.id ? { ...item, end: Math.max(0, Number(event.target.value) || 0), trimEnabled: true } : item) } })} /></label></div><label className="checkbox-row"><input type="checkbox" checked={clip.trimEnabled === true} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoClips: clips.map((item) => item.id === clip.id ? { ...item, trimEnabled: event.target.checked } : item) } })} /><span>Cortar este clipe</span></label></div>)}<button className="wide-action secondary-action" type="button" onClick={() => { backgroundPlaylistAppendTargetRef.current = activeScene.id; backgroundVideoInputRef.current?.click() }}>+ Acrescentar clipes</button><button className="wide-action" type="button" onClick={() => { backgroundPlaylistAppendTargetRef.current = null; backgroundVideoInputRef.current?.click() }}>Substituir sequência</button><p className="field-hint">Os clipes tocam em ordem no mesmo fundo. Você pode acrescentar arquivos à sequência existente ou substituí-la.</p></div>}
            <label className="field-label" htmlFor="background-video-url">Ou URL direta do vídeo</label>
            <input id="background-video-url" className="text-input" type="url" value={backgroundVideoUrlInput} onChange={(event) => setBackgroundVideoUrlInput(event.target.value)} placeholder="https://site.com/banner.mp4" />
            <button className="wide-action" type="button" onClick={applyBackgroundVideoUrl}>Aplicar link de vídeo</button>
            {activeScene.background.videoSrc && <>
              <div className="field-divider" />
              <label className="field-label" htmlFor="background-video-fit">Enquadramento</label>
              <select id="background-video-fit" className="text-input" value={activeScene.background.videoFit ?? 'cover'} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoFit: event.target.value as BackgroundConfig['videoFit'] } })}><option value="cover">Preencher a tela (corta bordas)</option><option value="contain">Mostrar vídeo inteiro</option><option value="stretch">Esticar para preencher</option></select>
              <label className="field-label" htmlFor="background-video-position">Posição do vídeo</label>
              <select id="background-video-position" className="text-input" value={activeScene.background.videoPosition ?? 'center center'} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoPosition: event.target.value } })}><option value="center center">Centro</option><option value="top center">Topo</option><option value="bottom center">Base</option><option value="left center">Esquerda</option><option value="right center">Direita</option></select>
              <label className="field-label" htmlFor="background-video-opacity">Opacidade do vídeo</label><div className="range-row"><input id="background-video-opacity" type="range" min="0" max="1" step="0.05" value={activeScene.background.videoOpacity ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoOpacity: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.videoOpacity ?? 1) * 100)}%</span></div>
              <label className="field-label" htmlFor="background-video-loop">Reprodução</label><label className="checkbox-row"><input id="background-video-loop" type="checkbox" checked={activeScene.background.videoLoop !== false} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoLoop: event.target.checked } })} /><span>Repetir em loop</span></label>
              <label className="checkbox-row"><input type="checkbox" checked={activeScene.background.videoMuted !== false} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoMuted: event.target.checked } })} /><span>Silenciar áudio (recomendado para autoplay)</span></label>
              <label className="field-label" htmlFor="background-video-volume">Volume · {Math.round((activeScene.background.videoVolume ?? 0.8) * 100)}%</label><div className="range-row"><input id="background-video-volume" type="range" min="0" max="1" step="0.05" value={activeScene.background.videoVolume ?? 0.8} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoVolume: Number(event.target.value), videoMuted: Number(event.target.value) === 0 ? true : activeScene.background!.videoMuted } })} /><span>{Math.round((activeScene.background.videoVolume ?? 0.8) * 100)}%</span></div>
              <label className="field-label" htmlFor="background-video-speed">Velocidade · {activeScene.background.videoPlaybackRate ?? 1}×</label><div className="range-row"><input id="background-video-speed" type="range" min="0.25" max="2" step="0.25" value={activeScene.background.videoPlaybackRate ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoPlaybackRate: Number(event.target.value) } })} /><span>{activeScene.background.videoPlaybackRate ?? 1}×</span></div>
              <div className="field-divider" />
              <p className="eyebrow section-eyebrow">COR E FILTROS DO VÍDEO</p>
              <label className="field-label" htmlFor="background-video-brightness">Brilho · {Math.round((activeScene.background.videoBrightness ?? 1) * 100)}%</label><div className="range-row"><input id="background-video-brightness" type="range" min="0" max="2" step="0.05" value={activeScene.background.videoBrightness ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoBrightness: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.videoBrightness ?? 1) * 100)}%</span></div>
              <label className="field-label" htmlFor="background-video-contrast">Contraste · {Math.round((activeScene.background.videoContrast ?? 1) * 100)}%</label><div className="range-row"><input id="background-video-contrast" type="range" min="0" max="2" step="0.05" value={activeScene.background.videoContrast ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoContrast: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.videoContrast ?? 1) * 100)}%</span></div>
              <label className="field-label" htmlFor="background-video-saturation">Saturação · {Math.round((activeScene.background.videoSaturation ?? 1) * 100)}%</label><div className="range-row"><input id="background-video-saturation" type="range" min="0" max="2" step="0.05" value={activeScene.background.videoSaturation ?? 1} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoSaturation: Number(event.target.value) } })} /><span>{Math.round((activeScene.background.videoSaturation ?? 1) * 100)}%</span></div>
              <label className="field-label" htmlFor="background-video-hue">Matiz · {Math.round(activeScene.background.videoHueRotate ?? 0)}°</label><div className="range-row"><input id="background-video-hue" type="range" min="0" max="360" step="5" value={activeScene.background.videoHueRotate ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoHueRotate: Number(event.target.value) } })} /><span>{Math.round(activeScene.background.videoHueRotate ?? 0)}°</span></div>
              <label className="checkbox-row"><input type="checkbox" checked={activeScene.background.videoTrimEnabled === true} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoTrimEnabled: event.target.checked, videoStart: activeScene.background!.videoStart ?? 0, videoEnd: event.target.checked ? Math.max(activeScene.background!.videoEnd ?? 0, (activeScene.background!.videoStart ?? 0) + 60) : activeScene.background!.videoEnd } })} /><span>Reproduzir apenas um trecho</span></label>
              {activeScene.background.videoTrimEnabled && <><label className="field-label" htmlFor="background-video-start">Início · {formatMediaTime(activeScene.background.videoStart ?? 0)}</label><input className="video-trim-range" id="background-video-start" type="range" min="0" max="600" step="0.1" value={activeScene.background.videoStart ?? 0} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoStart: Number(event.target.value), videoEnd: Math.max(Number(event.target.value) + 0.1, activeScene.background!.videoEnd ?? 0) } })} /><label className="field-label" htmlFor="background-video-end">Fim · {formatMediaTime(activeScene.background.videoEnd ?? 0)}</label><input className="video-trim-range" id="background-video-end" type="range" min={Math.max(0.1, (activeScene.background.videoStart ?? 0) + 0.1)} max="600" step="0.1" value={Math.max((activeScene.background.videoStart ?? 0) + 0.1, activeScene.background.videoEnd ?? 60)} onChange={(event) => updateScene({ background: { ...activeScene.background!, videoEnd: Number(event.target.value) } })} /><p className="field-hint">O corte é aplicado na reprodução, sem alterar o arquivo original. O limite dos controles é 10 minutos.</p></>}
              <button className="wide-action danger-action" type="button" onClick={() => updateScene({ background: { ...activeScene.background!, mode: 'transparent', videoSrc: undefined, videoTrimEnabled: false } })}>Remover vídeo de fundo</button>
            </>}
          </>}
          {activeScene.background?.mode === 'screen' && <>
            <div className="feature-note"><span className="note-icon">i</span><p>Compartilhe a tela inteira, uma janela de aplicativo ou uma aba. Clique em “Escolher tela ou janela” na pré-visualização para abrir o seletor nativo. O navegador exige um clique direto e confirmação manual; isso não acontece quando você clica em Salvar ou em transmitir no OBS. A captura é temporária e não fica no JSON. Para enviar o projeto e a captura à Browser Source, mantenha npm run dev ativo; o site estático não executa o relay local.</p></div>
            <p className="field-hint">A permissão é solicitada somente quando você clica em “Escolher tela ou janela” na prévia do editor — não ao clicar em salvar nem dentro do OBS. O navegador abre um seletor nativo e você precisa confirmar manualmente. Mantenha o editor e o relay local abertos enquanto a Browser Source recebe a captura. Para evitar o efeito de espelho, selecione a janela do jogo/aplicativo em vez do monitor que exibe o próprio editor.</p>
          </>}
          <p className="field-hint">O fundo é independente dos widgets. O modo transparente é indicado quando o jogo ou aplicativo já é capturado pelo OBS.</p>
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
      <input ref={videoInputRef} className="hidden-input" type="file" accept="video/*,.mp4,.m4v,.webm,.ogv,.ogg,.mov,.3gp,.mkv,.avi,.wmv,.mpeg,.mpg,.ts,.m2ts" multiple onChange={onVideoSelected} />
      <input ref={backgroundDesignInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={onBackgroundDesignSelected} />
      <input ref={slideshowInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif,.svg,.avif" multiple onChange={onSlideshowImagesSelected} />
      <input ref={backgroundVideoInputRef} className="hidden-input" type="file" accept="video/*,.mp4,.m4v,.webm,.ogv,.ogg,.mov,.3gp,.mkv,.avi,.wmv,.mpeg,.mpg,.ts,.m2ts" multiple onChange={onBackgroundVideoSelected} />
      <input ref={widgetBackgroundInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={onWidgetBackgroundSelected} />
      <input ref={frameOverlayInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={onFrameOverlaySelected} />
      <input ref={goalPartImageInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={onGoalPartImageSelected} />
      <input ref={widgetStyleInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={importWidgetStyle} />
      <input ref={animatedThemeInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={importAnimatedTheme} />
      <input ref={importInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={importProject} />
      {message && <div className="save-toast" role="status"><span>✓</span>{message}<button type="button" onClick={() => setMessage('')} aria-label="Fechar aviso">×</button></div>}
    </div>
  )
}

function ColorField({ id, value, onChange, disabled = false }: { id: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const safeValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : /^#[0-9a-fA-F]{3}$/.test(value) ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}` : '#000000'
  return <div className={`color-field ${disabled ? 'is-disabled' : ''}`}><input id={id} type="color" value={safeValue} disabled={disabled} onChange={(event) => onChange(event.target.value)} /><span>{value.toUpperCase()}</span></div>
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="number-field"><span>{label}</span><div><input type="number" min="0" max="100" step="1" value={Math.round(value * 10) / 10} onChange={(event) => onChange(Number(event.target.value) || 0)} /><small>%</small></div></label>
}

function AnimatedBackgroundLayer({ background }: { background: BackgroundConfig }) {
  const theme = background.animatedTheme ?? 'aurora'
  const speed = clamp(Number.isFinite(background.animatedSpeed) ? Number(background.animatedSpeed) : 1, 0.25, 3)
  const intensity = clamp(Number.isFinite(background.animatedIntensity) ? Number(background.animatedIntensity) : 0.75, 0, 1)
  const style = {
    backgroundColor: background.color ?? '#17142b',
    '--animated-color-a': background.color ?? '#17142b', '--animated-color-b': background.color2 ?? '#0b111d',
    '--animated-accent': background.animatedAccent ?? '#8d85ff', '--animated-intensity': intensity,
    '--animated-duration': `${14 / speed}s`, '--animated-duration-slow': `${24 / speed}s`,
    '--animated-blur': `${background.animatedBlur ?? 26}px`, '--animated-glow': background.animatedGlow ?? 0.7,
    '--animated-grain': background.animatedGrain ?? 0.08, '--animated-vignette': background.animatedVignette ?? 0.25,
    '--animated-density': background.animatedDensity ?? 1, '--animated-scale': background.animatedScale ?? 1,
    '--animated-direction': background.animatedDirection ?? 'alternate', '--animated-angle': `${background.angle ?? 135}deg`,
    filter: `brightness(${background.animatedBrightness ?? 1}) contrast(${background.animatedContrast ?? 1}) saturate(${background.animatedSaturation ?? 1}) hue-rotate(${background.animatedHueRotate ?? 0}deg)`,
    mixBlendMode: background.animatedBlendMode ?? 'normal',
  } as CSSProperties
  return <div className={`animated-background-layer animated-theme-${theme} animated-layers-${background.animatedLayers ?? 'balanced'}`} style={style} aria-hidden="true">
    <span className="animated-layer-orb animated-layer-orb-one" />
    <span className="animated-layer-orb animated-layer-orb-two" />
    <span className="animated-layer-grain" />
    <span className="animated-layer-particles" />
    <span className="animated-layer-vignette" />
  </div>
}

function BackgroundSlideshowLayer({ background }: { background: BackgroundConfig }) {
  const images = (background.slideshowImages ?? []).filter((item) => item && isSafeImageSource(item.src))
  const imageKey = images.map((item) => item.id).join('|')
  const shuffle = background.slideshowShuffle === true
  const order = useMemo(() => {
    const next = [...images]
    if (shuffle) {
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
      }
    }
    return next
  // The image ID signature identifies the list; URLs can be large data strings or IDB references.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageKey, shuffle])
  const [slideIndex, setSlideIndex] = useState(0)
  const [resolvedSources, setResolvedSources] = useState<Record<string, string>>({})
  useEffect(() => {
    setSlideIndex(0)
    let cancelled = false
    const objectUrls: string[] = []
    Promise.all(order.map(async (image) => {
      if (!image.src.startsWith('idb-video://')) return [image.id, image.src] as const
      const blob = await getVideoBlob(image.src)
      if (!blob) return [image.id, ''] as const
      const objectUrl = URL.createObjectURL(blob)
      objectUrls.push(objectUrl)
      return [image.id, objectUrl] as const
    })).then((pairs) => {
      if (!cancelled) setResolvedSources(Object.fromEntries(pairs))
    }).catch(() => { if (!cancelled) setResolvedSources({}) })
    return () => { cancelled = true; objectUrls.forEach((url) => URL.revokeObjectURL(url)) }
  }, [imageKey, order])
  useEffect(() => {
    if (order.length < 2 || (background.slideshowLoop === false && slideIndex >= order.length - 1)) return
    const duration = clamp(Number(background.slideshowIntervalSeconds ?? 10), 1, 3600) * 1000
    const timer = window.setTimeout(() => setSlideIndex((current) => {
      if (current >= order.length - 1) return background.slideshowLoop === false ? current : 0
      return current + 1
    }), duration)
    return () => window.clearTimeout(timer)
  }, [order.length, slideIndex, background.slideshowIntervalSeconds, background.slideshowLoop])
  useEffect(() => { if (slideIndex >= order.length) setSlideIndex(0) }, [slideIndex, order.length])
  const activeImage = order[slideIndex]
  if (!activeImage) return <div className="background-slideshow-layer slideshow-empty" aria-hidden="true" />
  const transition = background.slideshowTransition ?? 'fade'
  const duration = clamp(Number(background.slideshowTransitionDuration ?? 1.2), 0, 10)
  const fit = background.slideshowFit === 'contain' ? 'contain' : background.slideshowFit === 'stretch' ? 'fill' : 'cover'
  const imageStyle = {
    objectFit: fit, objectPosition: background.slideshowPosition ?? 'center center',
    opacity: background.slideshowOpacity ?? 1,
    '--slideshow-final-opacity': background.slideshowOpacity ?? 1,
    '--slideshow-zoom': background.slideshowZoom ?? 1,
    filter: `brightness(${background.slideshowBrightness ?? 1}) contrast(${background.slideshowContrast ?? 1}) saturate(${background.slideshowSaturation ?? 1}) hue-rotate(${background.slideshowHueRotate ?? 0}deg) blur(${background.slideshowBlur ?? 0}px)`,
    transform: `scale(${(background.slideshowZoom ?? 1) * (background.slideshowKenBurns ? 1.06 : 1)})`,
    animationDuration: `${Math.max(0.01, duration)}s`,
  } as CSSProperties
  return <div className="background-slideshow-layer" aria-hidden="true">
    {resolvedSources[activeImage.id] ? <img key={`${activeImage.id}-${slideIndex}`} src={resolvedSources[activeImage.id]} className={`slideshow-photo slideshow-transition-${transition} ${background.slideshowKenBurns ? 'slideshow-ken-burns' : ''}`} style={imageStyle} alt="" draggable={false} /> : <div className="slideshow-missing">Imagem não disponível neste navegador</div>}
    <div className="slideshow-color-overlay" style={{ backgroundColor: background.slideshowOverlayColor ?? '#000000', opacity: background.slideshowOverlayOpacity ?? 0 }} />
    {background.slideshowLoop === false && slideIndex === order.length - 1 && <span className="slideshow-complete-marker" />}
  </div>
}

function BackgroundVideoLayer({ background }: { background: BackgroundConfig }) {
  if (!background.videoSrc || !isSafeVideoSource(background.videoSrc)) {
    return <div className="background-media-layer background-video-empty" aria-hidden="true"><span>VÍDEO DE FUNDO</span></div>
  }
  const source: SceneSource = {
    id: 'background-video-layer', type: 'video', name: 'Vídeo de fundo', visible: true,
    x: 0, y: 0, w: 100, h: 100, src: background.videoSrc, videoClips: background.videoClips,
    objectFit: background.videoFit === 'stretch' ? 'contain' : (background.videoFit ?? 'cover'),
    objectPosition: background.videoPosition ?? 'center center',
    videoStart: background.videoStart ?? 0, videoEnd: background.videoEnd ?? 0,
    videoTrimEnabled: background.videoTrimEnabled === true, videoLoop: background.videoLoop !== false,
    videoMuted: background.videoMuted !== false, videoVolume: background.videoVolume ?? 0.8,
    videoPlaybackRate: background.videoPlaybackRate ?? 1,
    videoBrightness: background.videoBrightness ?? 1, videoContrast: background.videoContrast ?? 1, videoSaturation: background.videoSaturation ?? 1, videoHueRotate: background.videoHueRotate ?? 0,
  }
  return <div className="background-media-layer" style={{ opacity: background.videoOpacity ?? 1 }}>
    <TrimmedVideo source={source} className="background-video-asset" fit={background.videoFit === 'stretch' ? 'fill' : (background.videoFit ?? 'cover')} position={background.videoPosition ?? 'center center'} />
  </div>
}

type ScreenCaptureSignal =
  | { type: 'request'; captureKey: string; requestId: string; requesterId: string; targetProviderId?: string }
  | { type: 'available'; captureKey: string; providerId: string }
  | { type: 'offer'; captureKey: string; requestId: string; fromId: string; toId: string; description: RTCSessionDescriptionInit }
  | { type: 'answer'; captureKey: string; requestId: string; fromId: string; toId: string; description: RTCSessionDescriptionInit }
  | { type: 'ice'; captureKey: string; requestId: string; fromId: string; toId: string; candidate: RTCIceCandidateInit }
  | { type: 'ended'; captureKey: string; providerId: string }

type ScreenCaptureSignalEnvelope = ScreenCaptureSignal & { signalId?: string }

type CapturePeer = {
  connection: RTCPeerConnection
  peerId: string
  role: 'provider' | 'receiver'
  pendingCandidates: RTCIceCandidateInit[]
}

function makeCaptureId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `capture-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function ScreenCaptureView({ editor = false, variant, captureKey }: { editor?: boolean; variant: 'background' | 'source'; captureKey: string }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const relaySocketRef = useRef<WebSocket | null>(null)
  const pendingRelaySignalsRef = useRef<string[]>([])
  const seenSignalIdsRef = useRef<Set<string>>(new Set())
  const instanceIdRef = useRef(makeCaptureId())
  const peersRef = useRef<Map<string, CapturePeer>>(new Map())
  const orphanCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())
  const requestIdsRef = useRef<Set<string>>(new Set())
  const activeRemoteRequestRef = useRef<string | null>(null)

  const visibleStream = editor ? localStream : (remoteStream ?? localStream)

  function postSignal(signal: ScreenCaptureSignal) {
    const envelope = { ...signal, signalId: makeCaptureId() } as ScreenCaptureSignalEnvelope
    try { channelRef.current?.postMessage(envelope) } catch { /* A aba pode estar fechando. */ }
    const socket = relaySocketRef.current
    const serialized = JSON.stringify(envelope)
    if (socket?.readyState === WebSocket.OPEN) {
      try { socket.send(serialized) } catch { /* A conexão será recuperada pelo cliente de relay. */ }
    } else if (socket?.readyState === WebSocket.CONNECTING) {
      const queue = pendingRelaySignalsRef.current
      queue.push(serialized)
      if (queue.length > 80) queue.splice(0, queue.length - 80)
    }
  }

  function closePeersForProvider(providerId?: string) {
    for (const [requestId, peer] of peersRef.current.entries()) {
      if (peer.role === 'provider' && (!providerId || peer.peerId === providerId)) {
        peer.connection.close()
        peersRef.current.delete(requestId)
      }
    }
  }

  function closeAllPeers() {
    for (const peer of peersRef.current.values()) peer.connection.close()
    peersRef.current.clear()
    orphanCandidatesRef.current.clear()
  }

  async function flushIce(peer: CapturePeer) {
    if (!peer.connection.remoteDescription || peer.pendingCandidates.length === 0) return
    const pending = peer.pendingCandidates.splice(0)
    for (const candidate of pending) {
      try { await peer.connection.addIceCandidate(candidate) } catch { /* Candidato antigo ou incompatível. */ }
    }
  }

  function queueCandidate(requestId: string, candidate: RTCIceCandidateInit) {
    const peer = peersRef.current.get(requestId)
    if (peer) {
      if (peer.connection.remoteDescription) {
        void peer.connection.addIceCandidate(candidate).catch(() => peer.pendingCandidates.push(candidate))
      } else {
        peer.pendingCandidates.push(candidate)
      }
      return
    }
    const list = orphanCandidatesRef.current.get(requestId) ?? []
    list.push(candidate)
    orphanCandidatesRef.current.set(requestId, list)
  }

  function newPeer(requestId: string, peerId: string, role: CapturePeer['role']) {
    // STUN broadens ICE connectivity; local candidates are also retained for same-device connections.
    const connection = new RTCPeerConnection({ iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
    ] })
    const peer: CapturePeer = {
      connection,
      peerId,
      role,
      pendingCandidates: orphanCandidatesRef.current.get(requestId) ?? [],
    }
    orphanCandidatesRef.current.delete(requestId)
    peersRef.current.set(requestId, peer)
    const connectionTimeout = window.setTimeout(() => {
      if (connection.connectionState !== 'connected' && connection.connectionState !== 'closed') {
        if (role === 'receiver' && activeRemoteRequestRef.current === requestId) {
          activeRemoteRequestRef.current = null
          requestIdsRef.current.delete(requestId)
          setError('A captura ainda não chegou à saída. Para uma Browser Source do OBS, execute o projeto com npm run dev (o relay local usa ws://127.0.0.1:4174) e configure a URL do OBS usando o mesmo endereço/host do editor, por exemplo http://127.0.0.1:5173/?mode=overlay. O site hospedado sozinho não inclui esse relay local.')
        }
        connection.close()
        peersRef.current.delete(requestId)
      }
    }, 12000)
    connection.onicecandidate = (event) => {
      if (!event.candidate) return
      postSignal({
        type: 'ice',
        captureKey,
        requestId,
        fromId: instanceIdRef.current,
        toId: peerId,
        candidate: event.candidate.toJSON(),
      })
    }
    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'connected' || connection.connectionState === 'failed' || connection.connectionState === 'closed') window.clearTimeout(connectionTimeout)
      if (connection.connectionState === 'failed' || connection.connectionState === 'closed') {
        peersRef.current.delete(requestId)
        if (role === 'receiver' && activeRemoteRequestRef.current === requestId) {
          activeRemoteRequestRef.current = null
          remoteStreamRef.current = null
          setRemoteStream(null)
          if (!localStreamRef.current && connection.connectionState === 'failed') setError('A conexão de captura falhou. Confirme que o relay local está ativo (inicie o projeto com npm run dev), que o editor e a saída usam o mesmo host e que a porta 4174 não está bloqueada. Se estiver usando o site hospedado, a conexão com outro processo precisa de um relay remoto HTTPS/WSS.')
        }
      }
    }
    return peer
  }

  async function createProviderOffer(signal: Extract<ScreenCaptureSignal, { type: 'request' }>) {
    const stream = localStreamRef.current
    if (!editor || !stream || signal.captureKey !== captureKey) return
    if (typeof RTCPeerConnection === 'undefined') {
      setError('Este navegador não oferece conexão WebRTC para encaminhar a captura entre abas. A captura ainda pode ser usada nesta aba.')
      return
    }
    if (signal.targetProviderId && signal.targetProviderId !== instanceIdRef.current) return
    const previous = peersRef.current.get(signal.requestId)
    if (previous) previous.connection.close()
    const peer = newPeer(signal.requestId, signal.requesterId, 'provider')
    try {
      stream.getTracks().forEach((track) => peer.connection.addTrack(track, stream))
      const offer = await peer.connection.createOffer()
      await peer.connection.setLocalDescription(offer)
      if (!peer.connection.localDescription) throw new Error('Não foi possível preparar a captura para a outra aba.')
      postSignal({
        type: 'offer', captureKey, requestId: signal.requestId,
        fromId: instanceIdRef.current, toId: signal.requesterId,
        description: { type: peer.connection.localDescription.type, sdp: peer.connection.localDescription.sdp },
      })
    } catch {
      peer.connection.close()
      peersRef.current.delete(signal.requestId)
      setError('Não foi possível compartilhar a captura com o modo overlay. Reabra o modo overlay e tente novamente.')
    }
  }

  async function acceptProviderOffer(signal: Extract<ScreenCaptureSignal, { type: 'offer' }>) {
    if (editor || signal.toId !== instanceIdRef.current || signal.captureKey !== captureKey) return
    if (!requestIdsRef.current.has(signal.requestId)) return
    if (remoteStreamRef.current) return
    if (activeRemoteRequestRef.current && activeRemoteRequestRef.current !== signal.requestId) return
    if (typeof RTCPeerConnection === 'undefined') {
      setError('Este navegador não oferece conexão WebRTC. Inicie a captura diretamente nesta aba.')
      return
    }
    if (activeRemoteRequestRef.current && activeRemoteRequestRef.current !== signal.requestId && remoteStreamRef.current) return
    activeRemoteRequestRef.current = signal.requestId
    const peer = newPeer(signal.requestId, signal.fromId, 'receiver')
    peer.connection.ontrack = (event) => {
      if (activeRemoteRequestRef.current !== signal.requestId) return
      const incoming = event.streams?.[0] ?? new MediaStream([event.track])
      remoteStreamRef.current = incoming
      requestIdsRef.current.clear()
      setRemoteStream(incoming)
      // Se o usuário iniciou uma captura própria na saída antes de o editor conectar,
      // libere-a e passe a utilizar a captura autorizada no editor.
      const local = localStreamRef.current
      if (local) {
        localStreamRef.current = null
        local.getTracks().forEach((track) => track.stop())
        setLocalStream(null)
      }
      setError('')
    }
    try {
      await peer.connection.setRemoteDescription(signal.description)
      await flushIce(peer)
      const answer = await peer.connection.createAnswer()
      await peer.connection.setLocalDescription(answer)
      if (!peer.connection.localDescription) throw new Error('Não foi possível responder à conexão de captura.')
      postSignal({
        type: 'answer', captureKey, requestId: signal.requestId,
        fromId: instanceIdRef.current, toId: signal.fromId,
        description: { type: peer.connection.localDescription.type, sdp: peer.connection.localDescription.sdp },
      })
    } catch {
      peer.connection.close()
      peersRef.current.delete(signal.requestId)
      activeRemoteRequestRef.current = null
      setError('Não foi possível receber a captura. Confirme que npm run dev está rodando, que a porta 4174 está livre e que a Browser Source usa http://127.0.0.1:5173/?mode=overlay.')
    }
  }

  const lastRequestAtRef = useRef(0)
  function requestProvider(targetProviderId?: string) {
    if (editor || remoteStreamRef.current || Date.now() - lastRequestAtRef.current < 900) return
    lastRequestAtRef.current = Date.now()
    const requestId = `${instanceIdRef.current}-${makeCaptureId()}`
    requestIdsRef.current.add(requestId)
    // Requests can arrive while sharing is not yet started. Retire stale request IDs so a later offer is not rejected forever.
    window.setTimeout(() => requestIdsRef.current.delete(requestId), 12000)
    postSignal({ type: 'request', captureKey, requestId, requesterId: instanceIdRef.current, targetProviderId })
  }

  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel(`webcam-overlay-screen-capture-v3:${window.location.origin}${window.location.pathname}`)
      : null
    channelRef.current = channel
    let disposed = false
    let relaySocket: WebSocket | null = null
    let reconnectTimer: number | undefined

    const onSignal = (rawSignal: unknown) => {
      if (!rawSignal || typeof rawSignal !== 'object' || !('type' in rawSignal)) return
      const envelope = rawSignal as ScreenCaptureSignalEnvelope
      if (envelope.signalId) {
        if (seenSignalIdsRef.current.has(envelope.signalId)) return
        seenSignalIdsRef.current.add(envelope.signalId)
        if (seenSignalIdsRef.current.size > 500) {
          const oldest = seenSignalIdsRef.current.values().next().value
          if (oldest) seenSignalIdsRef.current.delete(oldest)
        }
      }
      const signal = envelope as ScreenCaptureSignal

      if (signal.type === 'request' && editor && signal.captureKey === captureKey && signal.requesterId !== instanceIdRef.current) {
        void createProviderOffer(signal)
      } else if (signal.type === 'available' && !editor && signal.captureKey === captureKey && signal.providerId !== instanceIdRef.current) {
        requestProvider(signal.providerId)
      } else if (signal.type === 'offer') {
        void acceptProviderOffer(signal)
      } else if (signal.type === 'answer' && editor && signal.captureKey === captureKey && signal.toId === instanceIdRef.current) {
        const peer = peersRef.current.get(signal.requestId)
        if (peer?.role === 'provider') {
          void peer.connection.setRemoteDescription(signal.description).then(() => flushIce(peer)).catch(() => {
            peer.connection.close()
            peersRef.current.delete(signal.requestId)
          })
        }
      } else if (signal.type === 'ice' && signal.captureKey === captureKey && signal.toId === instanceIdRef.current) {
        queueCandidate(signal.requestId, signal.candidate)
      } else if (signal.type === 'ended' && !editor && signal.captureKey === captureKey) {
        for (const [requestId, peer] of peersRef.current.entries()) {
          if (peer.role === 'receiver' && peer.peerId === signal.providerId) {
            peer.connection.close()
            peersRef.current.delete(requestId)
            requestIdsRef.current.delete(requestId)
            if (activeRemoteRequestRef.current === requestId) activeRemoteRequestRef.current = null
          }
        }
        if (!activeRemoteRequestRef.current) {
          remoteStreamRef.current = null
          setRemoteStream(null)
          if (!localStreamRef.current) setError('O compartilhamento foi encerrado no editor. Inicie novamente pela prévia.')
        }
      }
    }
    const onChannelMessage = (event: MessageEvent<ScreenCaptureSignalEnvelope>) => onSignal(event.data)
    channel?.addEventListener('message', onChannelMessage)

    // BroadcastChannel só conecta documentos do mesmo contexto de armazenamento. O relay local
    // também permite que uma Browser Source do OBS (outro processo Chromium) troque a sinalização.
    const isLoopbackHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const canUseLocalRelay = isLoopbackHost && window.location.protocol === 'http:'
    const connectRelay = () => {
      if (disposed || !canUseLocalRelay) return
      try {
        const socket = new WebSocket('ws://127.0.0.1:4174')
        relaySocket = socket
        relaySocketRef.current = socket
        socket.onopen = () => {
          if (disposed) { socket.close(); return }
          const queued = pendingRelaySignalsRef.current.splice(0)
          for (const serialized of queued) {
            if (socket.readyState !== WebSocket.OPEN) break
            try { socket.send(serialized) } catch { pendingRelaySignalsRef.current.unshift(serialized); break }
          }
        }
        socket.onmessage = (event) => {
          try { onSignal(JSON.parse(String(event.data))) } catch { /* Ignora mensagens malformadas do relay local. */ }
        }
        socket.onerror = () => { /* onclose agenda a reconexão; BroadcastChannel continua como fallback. */ }
        socket.onclose = () => {
          if (relaySocketRef.current === socket) relaySocketRef.current = null
          if (!disposed) reconnectTimer = window.setTimeout(connectRelay, 1800)
        }
      } catch {
        if (!disposed) reconnectTimer = window.setTimeout(connectRelay, 1800)
      }
    }
    if (canUseLocalRelay) connectRelay()

    let discoveryInterval: number | undefined
    if (!editor) {
      requestProvider()
      // The receiver may open before the editor has started sharing. Retry briefly instead of relying on one lost request.
      discoveryInterval = window.setInterval(() => {
        if (remoteStreamRef.current) {
          if (discoveryInterval !== undefined) window.clearInterval(discoveryInterval)
          return
        }
        requestProvider()
      }, 1500)
    }

    return () => {
      if (discoveryInterval !== undefined) window.clearInterval(discoveryInterval)
      disposed = true
      channel?.removeEventListener('message', onChannelMessage)
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer)
      if (editor && localStreamRef.current) {
        try { postSignal({ type: 'ended', captureKey, providerId: instanceIdRef.current }) } catch { /* Ignorar canal/relay já fechado. */ }
      }
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      channel?.close()
      if (channelRef.current === channel) channelRef.current = null
      if (relaySocket && relaySocket.readyState < WebSocket.CLOSING) relaySocket.close()
      if (relaySocketRef.current === relaySocket) relaySocketRef.current = null
      pendingRelaySignalsRef.current = []
      seenSignalIdsRef.current.clear()
      closeAllPeers()
    }
    // These keys identify the capture endpoint; streams and peer connections are kept in refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, captureKey])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.srcObject = visibleStream
    if (visibleStream) {
      void video.play().catch(() => {
        setError('O navegador bloqueou a reprodução da captura. Clique novamente em “Selecionar tela ou janela”.')
      })
    }
    return () => {
      if (video.srcObject === visibleStream) video.srcObject = null
    }
  }, [visibleStream])

  function finishLocalCapture(stream: MediaStream, stoppedByUser: boolean) {
    if (localStreamRef.current !== stream) return
    localStreamRef.current = null
    if (editor) {
      postSignal({ type: 'ended', captureKey, providerId: instanceIdRef.current })
      closePeersForProvider()
    }
    setLocalStream((current) => current === stream ? null : current)
    if (!stoppedByUser) setError('O compartilhamento foi encerrado pelo navegador. Selecione a tela novamente para continuar.')
  }

  async function startCapture(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setError('')
    if (!window.isSecureContext || !navigator.mediaDevices?.getDisplayMedia) {
      setError('A captura exige um navegador compatível em HTTPS ou localhost. Abra o projeto pelo endereço local do Vite ou pelo endereço HTTPS publicado.')
      return
    }
    try {
      // A chamada fica diretamente no clique do usuário, exigido pela API do navegador.
      const next = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30, max: 60 }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      localStreamRef.current = next
      setLocalStream(next)
      next.getVideoTracks()[0]?.addEventListener('ended', () => finishLocalCapture(next, false), { once: true })
      if (editor) postSignal({ type: 'available', captureKey, providerId: instanceIdRef.current })
    } catch (reason) {
      const name = reason instanceof DOMException ? reason.name : ''
      if (name === 'NotAllowedError' || name === 'AbortError') setError('Você cancelou a seleção ou negou a permissão. Clique em “Selecionar tela ou janela” e autorize o compartilhamento.')
      else if (name === 'InvalidStateError') setError('O navegador exige que a seleção seja iniciada diretamente por um clique e que esta aba esteja ativa. Tente novamente nesta aba.')
      else if (name === 'NotReadableError') setError('O sistema não conseguiu capturar essa origem. Tente escolher outra janela ou a tela inteira.')
      else setError(`Não foi possível iniciar a captura${name ? ` (${name})` : ''}. Verifique as permissões do navegador e tente novamente.`)
    }
  }

  function stopCapture(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    const current = localStreamRef.current
    if (current) {
      finishLocalCapture(current, true)
      current.getTracks().forEach((track) => track.stop())
    }
    setError('')
  }

  const isCapturing = Boolean(visibleStream)
  return <div className={`screen-capture-view screen-capture-${variant} ${editor ? 'screen-capture-editor' : 'screen-capture-output'} ${isCapturing ? 'is-capturing' : 'is-idle'}`}>
    {visibleStream ? <>
      <video ref={videoRef} className="screen-capture-video" autoPlay muted playsInline />
      {editor && error && <small className="screen-capture-error" role="status">{error}</small>}
      {editor && <div className="screen-capture-toolbar"><span><i /> Captura ativa · pronta para o modo overlay</span><button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={stopCapture}>Parar captura</button></div>}
    </> : <div className="screen-capture-prompt">
      <span className="screen-capture-symbol">▣</span>
      <strong>{editor ? 'Iniciar compartilhamento de tela' : 'Aguardando captura do editor'}</strong>
      <small>{editor ? 'Ao clicar, o navegador abrirá o seletor. Escolha uma tela, janela ou aba e confirme o compartilhamento.' : 'Inicie a captura na prévia do editor. A Browser Source do OBS recebe esse fluxo pelo relay local.'}</small>
      {editor && <button type="button" style={{ pointerEvents: 'auto' }} onPointerDown={(event) => event.stopPropagation()} onClick={startCapture}>Escolher tela ou janela</button>}
      {error && <small className="screen-capture-error" role="status">{error}</small>}
      {!editor && <small>Para uma Browser Source do OBS, rode o projeto com npm run dev e use http://127.0.0.1:5173/?mode=overlay. Mantenha o servidor em execução. Em um site hospedado, o relay local não existe: será necessário um relay HTTPS/WSS remoto.</small>}
    </div>}
  </div>
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
          if (isValidProject(parsed)) setProject(normalizeProject(parsed))
        } catch {
          // Ignorar uma gravação transitória inválida.
        }
      }
    }
    window.addEventListener('storage', onStorage)

    // OBS Browser Source usa um contexto de navegador separado e não compartilha
    // necessariamente o localStorage do Chrome. Em desenvolvimento local, a saída
    // solicita a última composição ao relay e recebe atualizações do editor.
    const isLoopback = ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.protocol === 'http:'
    let disposed = false
    let socket: WebSocket | null = null
    let retryTimer: number | undefined
    const connect = () => {
      if (disposed || !isLoopback) return
      try {
        socket = new WebSocket('ws://127.0.0.1:4174')
        socket.onopen = () => {
          try { socket?.send(JSON.stringify({ type: 'project-sync', action: 'request', captureKey: 'webcam-overlay-project-sync' })) } catch { /* Reconexão será tentada se o socket fechar. */ }
        }
        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(String(event.data)) as { type?: string; action?: string; project?: unknown }
            if (message.type !== 'project-sync' || message.action !== 'snapshot' || !isValidProject(message.project)) return
            const normalized = normalizeProject(message.project)
            setProject((current) => JSON.stringify(current) === JSON.stringify(normalized) ? current : normalized)
          } catch {
            // Ignorar snapshots inválidos ou interrompidos.
          }
        }
        socket.onclose = () => { if (!disposed) retryTimer = window.setTimeout(connect, 1500) }
        socket.onerror = () => { /* onclose agenda a reconexão */ }
      } catch {
        if (!disposed) retryTimer = window.setTimeout(connect, 1500)
      }
    }
    connect()
    return () => {
      disposed = true
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
      if (socket && socket.readyState < WebSocket.CLOSING) socket.close()
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
    {activeScene.background?.mode === 'animated' && <AnimatedBackgroundLayer background={activeScene.background} />}
    {activeScene.background?.mode === 'slideshow' && <BackgroundSlideshowLayer background={activeScene.background} />}
    {activeScene.background?.mode === 'video' && <BackgroundVideoLayer background={activeScene.background} />}
    {activeScene.background?.mode === 'screen' && <ScreenCaptureView variant="background" captureKey={`background:${activeScene.id}`} />}
    {activeScene.sources.filter((source) => source.visible).map((source, index) => <div key={source.id} className={`overlay-object overlay-${source.type} ${source.type === 'shape' ? `shape-${source.shapeKind ?? 'rectangle'}` : ''}`} style={sourceStyle(source, index)}>
      {source.type === 'text' && <span className="object-text" style={{ textTransform: source.textTransform ?? 'none', textDecoration: source.textDecoration ?? 'none', textShadow: source.textShadowEnabled === false ? 'none' : undefined }}>{source.text || source.name}</span>}
      {source.type === 'shape' && <span className={`shape-inner shape-inner-${source.shapeKind ?? 'rectangle'}`} style={{ background: source.color ?? '#7772f2', borderRadius: source.shapeKind === 'circle' ? '50%' : source.shapeKind === 'pill' ? '999px' : source.shapeKind === 'line' ? '999px' : `${source.radius ?? 4}px` }} />}
      {source.type === 'image' && source.src && <img src={source.src} alt={source.name} draggable={false} style={{ objectFit: source.objectFit ?? 'contain', objectPosition: source.objectPosition ?? 'center center' }} />}
      {source.type === 'video' && source.src && <TrimmedVideo source={source} className="video-asset" />}
      {source.type === 'capture' && <ScreenCaptureView variant="source" captureKey={`source:${activeScene.id}:${source.id}`} />}
      {source.type === 'browser' && <iframe className="browser-frame" title={source.name} src={getBrowserUrl(source.url)} sandbox="allow-scripts allow-forms allow-popups" referrerPolicy="no-referrer" loading="lazy" tabIndex={-1} />}
      {source.type === 'camera' && (cameraStream ? <video className="camera-video" autoPlay muted playsInline style={{ transform: source.cameraMirror === false ? 'none' : 'scaleX(-1)' }} ref={(element) => { if (element && element.srcObject !== cameraStream) element.srcObject = cameraStream }} /> : <div className="overlay-camera-placeholder" />)}
      {source.type === 'widget' && <WidgetContent source={source} />}
    </div>)}
  </div>
}

export default App
