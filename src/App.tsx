import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ChangeEvent, CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import './App.css'

type SourceType = 'text' | 'shape' | 'camera' | 'image'
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
}
type Scene = { id: string; name: string; sources: SceneSource[] }
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

const STORAGE_KEY = 'webcam-overlay-project-v1'
const MAX_IMAGE_BYTES = 1_500_000

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
  return candidate.version === 1 && Array.isArray(candidate.scenes) && candidate.scenes.length > 0 &&
    candidate.scenes.every((scene) => scene && typeof scene.id === 'string' && typeof scene.name === 'string' && Array.isArray(scene.sources))
}

function readProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (isValidProject(parsed)) {
        const activeSceneId = parsed.scenes.some((scene) => scene.id === parsed.activeSceneId)
          ? parsed.activeSceneId
          : parsed.scenes[0].id
        return { ...parsed, activeSceneId }
      }
    }
  } catch {
    // Dados ausentes ou corrompidos: iniciar com um projeto padrão.
  }
  return makeDefaultProject()
}

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function sourceLabel(type: SourceType) {
  return ({ text: 'Texto', shape: 'Forma', camera: 'Câmera', image: 'Imagem' })[type]
}

function sourceGlyph(type: SourceType) {
  return ({ text: 'T', shape: '◇', camera: '◉', image: '▧' })[type]
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
  if (source.type === 'text') {
    style.color = source.color ?? '#ffffff'
    style.fontSize = `clamp(8px, ${(source.fontSize ?? 30) / 19.2}cqw, 100px)`
  }
  if (source.type === 'shape') style.backgroundColor = source.color ?? '#7772f2'
  return style
}

function App() {
  const overlayMode = new URLSearchParams(window.location.search).get('mode') === 'overlay'
  return overlayMode ? <OverlayView /> : <Editor />
}

function Editor() {
  const [project, setProject] = useState<Project>(() => readProject())
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>('source-title')
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [interaction, setInteraction] = useState<Interaction | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const activeScene = useMemo(
    () => project.scenes.find((scene) => scene.id === project.activeSceneId) ?? project.scenes[0],
    [project],
  )
  const selectedSource = activeScene?.sources.find((source) => source.id === selectedSourceId) ?? null

  useEffect(() => {
    // Evita gravar no localStorage a cada movimento do mouse enquanto o usuário arrasta.
    if (interaction) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    } catch {
      setMessage('Não foi possível salvar. Exporte o projeto e remova imagens grandes.')
    }
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

  function selectScene(scene: Scene) {
    setProject((current) => ({ ...current, activeSceneId: scene.id }))
    setSelectedSourceId(scene.sources[0]?.id ?? null)
    setSourceMenuOpen(false)
    setMessage('')
  }

  function addScene() {
    const scene: Scene = { id: newId('scene'), name: `Cena ${project.scenes.length + 1}`, sources: [] }
    setProject((current) => ({ ...current, scenes: [...current.scenes, scene], activeSceneId: scene.id }))
    setSelectedSourceId(null)
    setMessage('')
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

  function addSource(type: SourceType) {
    if (type === 'image') {
      imageInputRef.current?.click()
      setSourceMenuOpen(false)
      return
    }
    const count = activeScene.sources.filter((source) => source.type === type).length + 1
    const defaults: Record<Exclude<SourceType, 'image'>, Partial<SceneSource>> = {
      text: { x: 34, y: 38, w: 32, h: 12, text: 'Seu texto', color: '#ffffff', fontSize: 34 },
      shape: { x: 38, y: 30, w: 20, h: 22, color: '#7772f2', radius: 10 },
      camera: { x: 35, y: 20, w: 30, h: 45, radius: 5 },
    }
    const source: SceneSource = {
      id: newId('source'), type, name: `${sourceLabel(type)} ${count}`, visible: true,
      ...defaults[type],
    } as SceneSource
    updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, source] }))
    setSelectedSourceId(source.id)
    setSourceMenuOpen(false)
  }

  function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('Escolha um arquivo de imagem válido.')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage('A imagem deve ter até 1,5 MB para manter o projeto leve.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      const source: SceneSource = {
        id: newId('source'), type: 'image', name: file.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'Imagem',
        visible: true, x: 34, y: 28, w: 28, h: 28, src: reader.result, objectFit: 'contain', radius: 4,
      }
      updateActiveScene((scene) => ({ ...scene, sources: [...scene.sources, source] }))
      setSelectedSourceId(source.id)
      setMessage('Imagem adicionada.')
    }
    reader.onerror = () => setMessage('Não foi possível ler essa imagem.')
    reader.readAsDataURL(file)
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
      setMessage('Projeto salvo neste navegador.')
    } catch {
      setMessage('Falha ao salvar. Exporte o JSON e reduza o tamanho das imagens.')
    }
  }

  function importProject(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result))
        if (!isValidProject(parsed)) throw new Error('invalid')
        const repaired: Project = {
          ...parsed,
          activeSceneId: parsed.scenes.some((scene) => scene.id === parsed.activeSceneId) ? parsed.activeSceneId : parsed.scenes[0].id,
          scenes: parsed.scenes.map((scene) => ({
            ...scene,
            sources: scene.sources.map((source) => ({
              visible: true, x: 10, y: 10, w: 30, h: 20, ...source,
            })),
          })),
        }
        setProject(repaired)
        const active = repaired.scenes.find((scene) => scene.id === repaired.activeSceneId)
        setSelectedSourceId(active?.sources[0]?.id ?? null)
        setMessage('Projeto importado com sucesso.')
      } catch {
        setMessage('O arquivo não parece ser um projeto Webcam_overlay válido.')
      }
    }
    reader.onerror = () => setMessage('Não foi possível ler o arquivo selecionado.')
    reader.readAsText(file)
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
          <button className="icon-button" type="button" onClick={addScene} title="Criar cena" aria-label="Criar cena">+</button>
        </div>
        <div className="scene-list">
          {project.scenes.map((scene, index) => (
            <div className={`scene-card-wrap ${scene.id === activeScene.id ? 'active' : ''}`} key={scene.id}>
              <button className={`scene-card ${scene.id === activeScene.id ? 'active' : ''}`} type="button" onClick={() => selectScene(scene)}>
                <div className="scene-thumbnail"><span className="thumbnail-mark">W.</span><span className="thumbnail-lines"><i /><i /></span><span className="scene-number">{String(index + 1).padStart(2, '0')}</span></div>
                <span className="scene-info"><strong>{scene.name}</strong><small>{scene.sources.length} {scene.sources.length === 1 ? 'fonte' : 'fontes'}</small></span>
              </button>
              <div className="scene-actions">
                <button type="button" aria-label={`Renomear ${scene.name}`} title="Renomear cena" onClick={() => {}}>···</button>
                <div className="scene-action-menu">
                  <button type="button" onClick={() => renameScene(scene)}>Renomear</button>
                  <button type="button" onClick={() => deleteScene(scene)}>Excluir</button>
                </div>
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
            <span className="resolution-badge">1920 × 1080</span>
            <div className="export-wrapper">
              <button className="secondary-button" type="button" onClick={() => setShowExportMenu((open) => !open)}>Projeto <span>⌄</span></button>
              {showExportMenu && <div className="export-menu">
                <button type="button" onClick={() => { downloadProject(project); setShowExportMenu(false); setMessage('Arquivo JSON exportado.') }}>Exportar JSON</button>
                <button type="button" onClick={() => { importInputRef.current?.click(); setShowExportMenu(false) }}>Importar JSON</button>
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
            <div className="preview-canvas" ref={stageRef} onPointerDown={() => setSelectedSourceId(null)}>
              <div className="canvas-background-mark">W.</div>
              {activeScene.sources.filter((source) => source.visible).map((source, index) => (
                <div
                  className={`canvas-object object-${source.type} ${source.locked ? 'locked' : ''} ${selectedSourceId === source.id ? 'is-selected' : ''}`}
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
                  {source.type === 'shape' && <span className="shape-inner" />}
                  {source.type === 'image' && source.src && <img src={source.src} alt={source.name} draggable={false} style={{ objectFit: source.objectFit ?? 'contain' }} />}
                  {source.type === 'camera' && (cameraStream
                    ? <video className="camera-video" autoPlay muted playsInline ref={(element) => { if (element && element.srcObject !== cameraStream) element.srcObject = cameraStream }} />
                    : <div className="camera-placeholder"><span className="camera-symbol">◉</span><strong>{source.name}</strong><small>Clique em “Ativar webcam” nas propriedades</small></div>)}
                  {selectedSourceId === source.id && <><span className="selection-label">{source.name}</span><button className="resize-handle" type="button" aria-label={`Redimensionar ${source.name}`} onPointerDown={(event) => beginInteraction(event, source, 'resize')} /></>}
                </div>
              ))}
              {activeScene.sources.every((source) => !source.visible) && <div className="canvas-empty"><span>◫</span><strong>Nenhuma fonte visível</strong><small>Ative uma camada ou adicione um elemento.</small></div>}
              {activeScene.sources.length === 0 && <div className="canvas-empty"><span>＋</span><strong>Sua cena está vazia</strong><small>Adicione uma fonte pelo painel à direita.</small></div>}
            </div>
          </div>
          <div className="preview-caption"><span><span className="status-dot" /> Arraste para mover · canto inferior para redimensionar</span><span>Proporção 16:9</span></div>
        </section>
        <footer className="studio-footer"><span className="footer-tip"><span className="tip-icon">i</span> As alterações são salvas automaticamente neste navegador.</span><span className="footer-version">WEBCAM_OVERLAY · 1.0</span></footer>
      </main>

      <aside className="inspector-panel">
        <div className="inspector-heading"><div><p className="eyebrow">ORGANIZAÇÃO</p><h2>Fontes</h2></div><button className="icon-button add-button" type="button" onClick={() => setSourceMenuOpen((open) => !open)} title="Adicionar fonte" aria-label="Adicionar fonte">+</button></div>
        {sourceMenuOpen && <div className="source-menu"><p className="eyebrow">ADICIONAR ELEMENTO</p>
          {(['text', 'shape', 'camera', 'image'] as SourceType[]).map((type) => <button key={type} type="button" onClick={() => addSource(type)}><span className={`source-icon icon-${type}`}>{sourceGlyph(type)}</span><span><strong>{sourceLabel(type)}</strong><small>{{ text: 'Mensagem personalizável', shape: 'Elemento colorido', camera: 'Webcam do dispositivo', image: 'Arquivo PNG, JPG ou WebP' }[type]}</small></span><span className="menu-arrow">›</span></button>)}
        </div>}
        <div className="source-list-heading"><span className="eyebrow">CAMADAS DA CENA</span><span className="count-badge">{activeScene.sources.length}</span></div>
        <div className="source-list">
          {activeScene.sources.length === 0 && <p className="empty-list">Ainda não existem fontes nesta cena. Use o botão + para adicionar uma.</p>}
          {[...activeScene.sources].map((source, index) => ({ source, index })).reverse().map(({ source, index }) => (
            <div className={`source-row ${selectedSourceId === source.id ? 'selected' : ''}`} key={source.id}>
              <button className="source-select" type="button" onClick={() => setSelectedSourceId(source.id)}><span className={`source-icon icon-${source.type}`}>{sourceGlyph(source.type)}</span><span className="source-name">{source.name}</span></button>
              <button className="tiny-action layer-action" type="button" title="Subir camada" aria-label="Subir camada" disabled={index === activeScene.sources.length - 1} onClick={() => moveLayer(source.id, 1)}>↑</button>
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
            </>}
            {selectedSource.type === 'shape' && <>
              <label className="field-label" htmlFor="shape-color">Cor da forma</label>
              <ColorField id="shape-color" value={selectedSource.color ?? '#7772f2'} onChange={(color) => updateSelected({ color })} />
              <label className="field-label" htmlFor="shape-radius">Arredondamento</label>
              <div className="range-row"><input id="shape-radius" type="range" min="0" max="40" value={selectedSource.radius ?? 4} onChange={(event) => updateSelected({ radius: Number(event.target.value) })} /><span>{selectedSource.radius ?? 4}px</span></div>
            </>}
            {selectedSource.type === 'image' && <>
              <label className="field-label" htmlFor="image-fit">Ajuste da imagem</label>
              <select id="image-fit" className="text-input" value={selectedSource.objectFit ?? 'contain'} onChange={(event) => updateSelected({ objectFit: event.target.value as 'contain' | 'cover' })}><option value="contain">Mostrar imagem inteira</option><option value="cover">Preencher área</option></select>
              <p className="field-hint">Para trocar a imagem, remova esta fonte e adicione outra.</p>
            </>}
            {selectedSource.type === 'camera' && <>
              <div className="feature-note"><span className="note-icon">i</span><p>A webcam aparece após conceder permissão ao navegador. O áudio não é capturado nesta versão.</p></div>
              <button className="wide-action" type="button" onClick={enableCamera}>{cameraStream ? 'Reativar webcam' : 'Ativar webcam'}</button>
              {cameraStream && <button className="wide-action quiet-action" type="button" onClick={() => { cameraStream.getTracks().forEach((track) => track.stop()); setCameraStream(null); setMessage('Webcam desativada.') }}>Desativar webcam</button>}
              {cameraError && <p className="error-note">{cameraError}</p>}
            </>}
            <div className="field-divider" />
            <p className="eyebrow geometry-label">POSIÇÃO E TAMANHO · % DA TELA</p>
            <div className="geometry-grid">
              <NumberField label="X" value={selectedSource.x} onChange={(x) => updateSelected({ x: clamp(x, 0, 100 - selectedSource.w) })} />
              <NumberField label="Y" value={selectedSource.y} onChange={(y) => updateSelected({ y: clamp(y, 0, 100 - selectedSource.h) })} />
              <NumberField label="Largura" value={selectedSource.w} onChange={(w) => updateSelected({ w: clamp(w, 4, 100 - selectedSource.x) })} />
              <NumberField label="Altura" value={selectedSource.h} onChange={(h) => updateSelected({ h: clamp(h, 4, 100 - selectedSource.y) })} />
            </div>
            <label className="lock-toggle"><input type="checkbox" checked={Boolean(selectedSource.locked)} onChange={(event) => updateSelected({ locked: event.target.checked })} /><span>Bloquear posição</span></label>
          </div>}
        </div>
        <div className="inspector-footer"><span className="status-dot" /> Modo de edição local</div>
      </aside>

      <input ref={imageInputRef} className="hidden-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onImageSelected} />
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
  return <div className="overlay-output" aria-label={`Overlay: ${activeScene.name}`}>
    {activeScene.sources.filter((source) => source.visible).map((source, index) => <div key={source.id} className={`overlay-object overlay-${source.type}`} style={sourceStyle(source, index)}>
      {source.type === 'text' && <span className="object-text">{source.text || source.name}</span>}
      {source.type === 'shape' && <span className="shape-inner" style={{ background: source.color ?? '#7772f2', borderRadius: `${source.radius ?? 4}px` }} />}
      {source.type === 'image' && source.src && <img src={source.src} alt={source.name} draggable={false} style={{ objectFit: source.objectFit ?? 'contain' }} />}
      {source.type === 'camera' && (cameraStream ? <video className="camera-video" autoPlay muted playsInline ref={(element) => { if (element && element.srcObject !== cameraStream) element.srcObject = cameraStream }} /> : <div className="overlay-camera-placeholder" />)}
    </div>)}
  </div>
}

export default App
