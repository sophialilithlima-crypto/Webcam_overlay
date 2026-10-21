# Webcam_overlay — 1.2

Estúdio web para montar overlays e cenas visuais de transmissão. Esta versão prioriza edição de composição; codificação e envio direto para Twitch/YouTube ficam para uma etapa futura.

## Requisitos

- Node.js 22.12+ (recomendado: Node.js 24)
- npm
- Navegador atualizado

## Executar no Windows / VS Code

1. Extraia o projeto e abra a pasta `Webcam_overlay` no VS Code.
2. Abra **Terminal → New Terminal**.
3. Instale as dependências: `npm install`
4. Inicie: `npm run dev`
5. Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173/`.

Para validar a versão de produção: `npm run build`.

## Recursos de edição

- Cenas: criar, renomear, duplicar e excluir. Cada cena mantém suas fontes, fundo e resolução.
- Fontes: texto, formas (retângulo, círculo/elipse, pílula e linha), imagem, webcam e página/widget de navegador.
- Manipulação: arrastar e redimensionar na prévia, editar X/Y/largura/altura em porcentagem, rotação, opacidade, borda, cantos arredondados, sombra e bloqueio.
- Texto: conteúdo, tamanho, cor, família tipográfica, peso, alinhamento, itálico, espaçamento entre letras, altura de linha e fundo opcional.
- Formas: tipo, cor e arredondamento. Imagens: ajuste contain/cover. Webcam: ativação via permissão do navegador e opção de espelhamento.
- Camadas: mostrar/ocultar, subir/descer, duplicar e remover.
- Fundo por cena: transparente, cor sólida ou gradiente editável.
- Resoluções de composição: 1920×1080, 1280×720, 1080×1920, 1080×1080 e 2560×1440.
- Histórico: desfazer/refazer as últimas alterações (`Ctrl+Z` / `Ctrl+Y`) e botões na barra superior.
- Persistência: salvamento automático local, exportação/importação de arquivo JSON.
- Modo overlay: acrescente `?mode=overlay` ao endereço. A página de overlay lê mudanças gravadas no mesmo navegador/origem.
- Atalhos: `Ctrl+S` salva, `Ctrl+D` duplica a fonte selecionada, `Ctrl+Z` desfaz, `Ctrl+Y` refaz, `Delete` remove a fonte e as setas movem a fonte selecionada (com `Shift`, movimento de 5%).

## Pontos a observar

- A webcam requer permissão do navegador e um contexto seguro (`localhost` ou HTTPS). O áudio não é capturado.
- Sites podem bloquear incorporação em iframe; isso depende das políticas do próprio site.
- Imagens são armazenadas como dados no projeto e podem aumentar seu tamanho.
- O projeto é salvo no armazenamento local do navegador, não em nuvem. Exporte o JSON como cópia de segurança.
- O modo overlay serve para testar a composição em ferramenta compatível com fonte de navegador. A aplicação ainda não codifica nem transmite diretamente para plataformas.

## GitHub

Para atualizar o repositório, copie os arquivos deste diretório para sua pasta local existente, sem apagar `.git`. Execute `git status`, revise as alterações e só então faça commit/push.
