
import { useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'

type SourceType = 'camera' | 'text' | 'shape'

type Source = {
  id: string
  type: SourceType
  name: string
  visible: boolean
  text?: string
  color?: string
}

type Scene = {
  id: string
  name: string
  sources: Source[]
}

const STORAGE_KEY = 'webcam-overlay-scenes-v1'

const INITIAL_SCENES: Scene[] = [
  {
    id: 'scene-main',
    name: 'Principal',
    sources: [
      {
        id: 'main-camera',
        type: 'camera',
        name: 'Webcam',
        visible: true,
      },
      {
        id: 'main-title',
        type: 'text',
        name: 'Título da transmissão',
        text: 'Sua live começa aqui.',
        visible: true,
      },
      {
        id: 'main-shape',
        type: 'shape',
        name: 'Elemento decorativo',
        color: '#7776ff',
        visible: true,
      },
    ],
  },
  {
    id: 'scene-start',
    name: 'Começando',
    sources: [
      {
        id: 'start-title',
        type: 'text',
        name: 'Mensagem de início',
        text: 'A transmissão começa em instantes.',
        visible: true,
      },
    ],
  },
  {
    id: 'scene-break',
    name: 'Intervalo',
    sources: [
      {
        id: 'break-shape',
        type: 'shape',
        name: 'Fundo decorativo',
        color: '#5b8cff',
        visible: true,
      },
      {
        id: 'break-title',
        type: 'text',
        name: 'Mensagem de intervalo',
        text: 'Voltamos já.',
        visible: true,
      },
    ],
  },
]

function loadScenes(): Scene[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      const parsed: unknown = JSON.parse(saved)

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Scene[]
      }
    }
  } catch {
    // Se os dados salvos forem inválidos, usamos as cenas iniciais.
  }

  return INITIAL_SCENES
}

function sourceLabel(type: SourceType): string {
  const labels: Record<SourceType, string> = {
    camera: 'Câmera',
    text: 'Texto',
    shape: 'Forma',
  }

  return labels[type]
}

function sourceIcon(type: SourceType): string {
  const icons: Record<SourceType, string> = {
    camera: '◉',
    text: 'T',
    shape: '▰',
  }

  return icons[type]
}

function App() {
  const [scenes, setScenes] = useState<Scene[]>(loadScenes)
  const [activeSceneId, setActiveSceneId] = useState(
    () => loadScenes()[0]?.id ?? 'scene-main',
  )
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    'main-title',
  )
  const [showSourceMenu, setShowSourceMenu] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const activeScene =
    scenes.find((scene) => scene.id === activeSceneId) ??
    scenes[0] ??
    INITIAL_SCENES[0]

  const selectedSource =
    activeScene.sources.find((source) => source.id === selectedSourceId) ??
    null

  function updateActiveScene(updater: (scene: Scene) => Scene) {
    setScenes((current) =>
      current.map((scene) =>
        scene.id === activeScene.id ? updater(scene) : scene,
      ),
    )
    setSaveMessage('')
  }

  function createScene() {
    const sceneNumber = scenes.length + 1

    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      name: `Cena ${sceneNumber}`,
      sources: [],
    }

    setScenes((current) => [...current, newScene])
    setActiveSceneId(newScene.id)
    setSelectedSourceId(null)
    setSaveMessage('')
  }

  function addSource(type: SourceType) {
    const count =
      activeScene.sources.filter((source) => source.type === type).length + 1

    const newSource: Source = {
      id: `source-${Date.now()}`,
      type,
      name: `${sourceLabel(type)} ${count}`,
      visible: true,
      ...(type === 'text' ? { text: 'Escreva sua mensagem' } : {}),
      ...(type === 'shape' ? { color: '#7776ff' } : {}),
    }

    updateActiveScene((scene) => ({
      ...scene,
      sources: [...scene.sources, newSource],
    }))

    setSelectedSourceId(newSource.id)
    setShowSourceMenu(false)
  }

  function updateSelectedSource(changes: Partial<Source>) {
    if (!selectedSource) return

    updateActiveScene((scene) => ({
      ...scene,
      sources: scene.sources.map((source) =>
        source.id === selectedSource.id
          ? { ...source, ...changes }
          : source,
      ),
    }))
  }

  function toggleSource(sourceId: string) {
    updateActiveScene((scene) => ({
      ...scene,
      sources: scene.sources.map((source) =>
        source.id === sourceId
          ? { ...source, visible: !source.visible }
          : source,
      ),
    }))
  }

  function removeSource(sourceId: string) {
    updateActiveScene((scene) => ({
      ...scene,
      sources: scene.sources.filter((source) => source.id !== sourceId),
    }))

    if (selectedSourceId === sourceId) {
      setSelectedSourceId(null)
    }
  }

  function selectScene(scene: Scene) {
    setActiveSceneId(scene.id)
    setSelectedSourceId(scene.sources[0]?.id ?? null)
    setShowSourceMenu(false)
  }

  function saveProject() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
      setSaveMessage('Projeto salvo neste navegador.')
    } catch {
      setSaveMessage('Não foi possível salvar o projeto.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="app-rail">
        <div className="brand-mark" title="Webcam_overlay">
          W<span>.</span>
        </div>

        <div className="rail-divider" />

        <div className="rail-active" title="Estúdio">
          ◫
        </div>

        <div className="rail-bottom">
          <span className="rail-version">BETA</span>
        </div>
      </aside>

      <aside className="scenes-panel">
        <div className="panel-brand">
          <div>
            <p className="eyebrow">WEBCAM_OVERLAY</p>
            <h1>Estúdio</h1>
          </div>
          <span className="beta-dot" />
        </div>

        <div className="scene-heading">
          <span className="eyebrow">CENAS</span>
          <button
            className="icon-button"
            type="button"
            onClick={createScene}
            title="Criar cena"
            aria-label="Criar cena"
          >
            +
          </button>
        </div>

        <div className="scene-list">
          {scenes.map((scene, index) => (
            <button
              className={`scene-card ${
                scene.id === activeScene.id ? 'active' : ''
              }`}
              key={scene.id}
              type="button"
              onClick={() => selectScene(scene)}
            >
              <div className="scene-thumbnail">
                <span className="thumbnail-mark">W.</span>
                <span className="thumbnail-lines">
                  <i />
                  <i />
                </span>
                <span className="scene-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <span className="scene-info">
                <strong>{scene.name}</strong>
                <small>
                  {scene.sources.length}{' '}
                  {scene.sources.length === 1 ? 'fonte' : 'fontes'}
                </small>
              </span>
              <span className="scene-arrow">›</span>
            </button>
          ))}
        </div>

        <div className="scenes-footer">
          <span className="status-dot" />
          <span>Projeto local</span>
        </div>
      </aside>

      <main className="studio-main">
        <header className="topbar">
          <div className="topbar-title">
            <p className="eyebrow">ÁREA DE TRABALHO</p>
            <h2>{activeScene.name}</h2>
          </div>

          <div className="topbar-actions">
            <span className="resolution-badge">1920 × 1080</span>
            <button
              className="save-button"
              type="button"
              onClick={saveProject}
            >
              <span>↓</span> Salvar projeto
            </button>
          </div>
        </header>

        <section className="preview-section">
          <div className="preview-heading">
            <div>
              <span className="eyebrow">TELA DE COMPOSIÇÃO</span>
              <h3>Pré-visualização</h3>
            </div>
            <span className="local-badge">
              <i /> LOCAL
            </span>
          </div>

          <div className="preview-frame">
            <div className="preview-canvas">
              <div className="canvas-background-mark">W.</div>

              {activeScene.sources
                .filter((source) => source.visible)
                .map((source, index) => {
                  const sourceStyle: CSSProperties =
                    source.type === 'camera'
                      ? { left: '7%', top: '12%' }
                      : source.type === 'shape'
                        ? {
                            left: `${65 + (index % 2) * 8}%`,
                            top: `${15 + (index % 2) * 16}%`,
                            backgroundColor: source.color ?? '#7776ff',
                          }
                        : {
                            left: '7%',
                            top: `${67 - (index % 3) * 14}%`,
                          }

                  if (source.type === 'camera') {
                    return (
                      <button
                        className={`canvas-source source-camera ${
                          selectedSourceId === source.id ? 'is-selected' : ''
                        }`}
                        key={source.id}
                        style={sourceStyle}
                        type="button"
                        onClick={() => setSelectedSourceId(source.id)}
                        aria-label={`Selecionar ${source.name}`}
                      >
                        <span className="camera-label">WEBCAM</span>
                        <span className="camera-symbol">◉</span>
                        <strong>{source.name}</strong>
                        <small>Prévia da câmera</small>
                        <span className="camera-note">
                          Conexão real será configurada em outra etapa
                        </span>
                      </button>
                    )
                  }

                  if (source.type === 'shape') {
                    return (
                      <button
                        className={`canvas-source source-shape ${
                          selectedSourceId === source.id ? 'is-selected' : ''
                        }`}
                        key={source.id}
                        style={sourceStyle}
                        type="button"
                        onClick={() => setSelectedSourceId(source.id)}
                        aria-label={`Selecionar ${source.name}`}
                      />
                    )
                  }

                  return (
                    <button
                      className={`canvas-source source-text ${
                        selectedSourceId === source.id ? 'is-selected' : ''
                      }`}
                      key={source.id}
                      style={sourceStyle}
                      type="button"
                      onClick={() => setSelectedSourceId(source.id)}
                    >
                      {source.text || source.name}
                    </button>
                  )
                })}

              {activeScene.sources.every((source) => !source.visible) && (
                <div className="canvas-empty">
                  <span>◫</span>
                  <strong>Nenhuma fonte visível</strong>
                  <small>Ative uma fonte ou adicione um elemento.</small>
                </div>
              )}

              {activeScene.sources.length === 0 && (
                <div className="canvas-empty">
                  <span>＋</span>
                  <strong>Sua cena está vazia</strong>
                  <small>Adicione uma fonte pelo painel à direita.</small>
                </div>
              )}
            </div>
          </div>

          <div className="preview-caption">
            <span>
              <span className="status-dot" /> Prévia de composição
            </span>
            <span>Proporção 16:9</span>
          </div>
        </section>

        <footer className="studio-footer">
          <span className="footer-tip">
            <span className="tip-icon">i</span>
            Selecione uma fonte na tela ou na lista para editar suas propriedades.
          </span>
          <span className="footer-version">WEBCAM_OVERLAY · 0.1</span>
        </footer>
      </main>

      <aside className="inspector-panel">
        <div className="inspector-heading">
          <div>
            <p className="eyebrow">ORGANIZAÇÃO</p>
            <h2>Fontes</h2>
          </div>

          <button
            className="icon-button add-button"
            type="button"
            onClick={() => setShowSourceMenu((open) => !open)}
            title="Adicionar fonte"
            aria-label="Adicionar fonte"
          >
            +
          </button>
        </div>

        {showSourceMenu && (
          <div className="source-menu">
            <p className="eyebrow">ADICIONAR ELEMENTO</p>
            <button type="button" onClick={() => addSource('camera')}>
              <span className="source-icon camera-icon-small">◉</span>
              <span>
                <strong>Câmera</strong>
                <small>Espaço reservado para webcam</small>
              </span>
              <span className="menu-arrow">›</span>
            </button>
            <button type="button" onClick={() => addSource('text')}>
              <span className="source-icon">T</span>
              <span>
                <strong>Texto</strong>
                <small>Uma mensagem personalizável</small>
              </span>
              <span className="menu-arrow">›</span>
            </button>
            <button type="button" onClick={() => addSource('shape')}>
              <span className="source-icon shape-icon-small">▰</span>
              <span>
                <strong>Forma</strong>
                <small>Um elemento colorido</small>
              </span>
              <span className="menu-arrow">›</span>
            </button>
          </div>
        )}

        <div className="source-list-heading">
          <span className="eyebrow">CAMADAS DA CENA</span>
          <span className="count-badge">{activeScene.sources.length}</span>
        </div>

        <div className="source-list">
          {activeScene.sources.length === 0 && (
            <p className="empty-list">
              Ainda não existem fontes nesta cena.
              Use o botão + para adicionar uma.
            </p>
          )}

          {[...activeScene.sources].reverse().map((source) => (
            <div
              className={`source-row ${
                selectedSourceId === source.id ? 'selected' : ''
              }`}
              key={source.id}
            >
              <button
                className="source-select"
                type="button"
                onClick={() => setSelectedSourceId(source.id)}
              >
                <span className={`source-icon icon-${source.type}`}>
                  {sourceIcon(source.type)}
                </span>
                <span className="source-name">{source.name}</span>
              </button>

              <button
                className={`tiny-action ${
                  source.visible ? 'visible' : ''
                }`}
                type="button"
                onClick={() => toggleSource(source.id)}
                title={source.visible ? 'Ocultar fonte' : 'Mostrar fonte'}
                aria-label={
                  source.visible ? 'Ocultar fonte' : 'Mostrar fonte'
                }
              >
                {source.visible ? '◉' : '◌'}
              </button>

              <button
                className="tiny-action remove-action"
                type="button"
                onClick={() => removeSource(source.id)}
                title="Remover fonte"
                aria-label={`Remover ${source.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="properties-panel">
          <div className="properties-heading">
            <div>
              <p className="eyebrow">PERSONALIZAÇÃO</p>
              <h3>Propriedades</h3>
            </div>
            {selectedSource && (
              <span className="property-type">
                {sourceLabel(selectedSource.type)}
              </span>
            )}
          </div>

          {!selectedSource && (
            <p className="empty-properties">
              Selecione uma fonte para visualizar suas propriedades.
            </p>
          )}

          {selectedSource && (
            <div className="property-fields">
              <label className="field-label" htmlFor="source-name">
                Nome da fonte
              </label>
              <input
                id="source-name"
                className="text-input"
                value={selectedSource.name}
                onChange={(event) =>
                  updateSelectedSource({ name: event.target.value })
                }
              />

              {selectedSource.type === 'text' && (
                <>
                  <label className="field-label" htmlFor="source-text">
                    Conteúdo do texto
                  </label>
                  <textarea
                    id="source-text"
                    className="text-input textarea-input"
                    rows={3}
                    value={selectedSource.text ?? ''}
                    onChange={(event) =>
                      updateSelectedSource({ text: event.target.value })
                    }
                    placeholder="Digite sua mensagem..."
                  />
                  <p className="field-hint">
                    A alteração aparece imediatamente na pré-visualização.
                  </p>
                </>
              )}

              {selectedSource.type === 'shape' && (
                <>
                  <label className="field-label" htmlFor="source-color">
                    Cor da forma
                  </label>
                  <div className="color-field">
                    <input
                      id="source-color"
                      type="color"
                      value={selectedSource.color ?? '#7776ff'}
                      onChange={(event) =>
                        updateSelectedSource({ color: event.target.value })
                      }
                    />
                    <span>
                      {(selectedSource.color ?? '#7776ff').toUpperCase()}
                    </span>
                  </div>
                </>
              )}

              {selectedSource.type === 'camera' && (
                <div className="feature-note">
                  <span className="note-icon">i</span>
                  <p>
                    Esta fonte ainda é ilustrativa. O acesso à webcam será
                    desenvolvido em uma próxima etapa, com permissão do
                    navegador.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="inspector-footer">
          <span className="status-dot" />
          Modo de edição local
        </div>
      </aside>

      {saveMessage && (
        <div className="save-toast" role="status">
          <span>✓</span> {saveMessage}
        </div>
      )}
    </div>
  )
}

export default App
