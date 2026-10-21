# Webcam_overlay

Um estúdio web leve para criar cenas e overlays de transmissão. A primeira versão concentra-se na composição visual: cenas, fontes, textos, formas, imagens, webcam local, posicionamento, redimensionamento, propriedades e exportação/importação de projetos.

## Requisitos

- Node.js 22.12+ (recomendado: Node.js 24)
- npm
- Navegador atualizado

## Executar localmente

1. Extraia o ZIP e abra a pasta `Webcam_overlay` no VS Code.
2. Abra **Terminal → New Terminal**.
3. Instale as dependências:

   ```powershell
   npm install
   ```

4. Inicie o modo de desenvolvimento:

   ```powershell
   npm run dev
   ```

5. Abra o endereço local impresso pelo Vite, normalmente `http://127.0.0.1:5173/`.

Para gerar uma versão de produção, execute `npm run build`. O resultado ficará na pasta `dist`.

## Recursos incluídos

- Cenas iniciais, criação, renomeação e remoção de cenas.
- Fontes de texto, formas, imagens e câmera.
- Arrastar e redimensionar elementos diretamente na prévia.
- Controles de conteúdo, cor, tamanho, posição e dimensões.
- Ativação da webcam por permissão do navegador.
- Salvamento automático no armazenamento local do navegador.
- Exportação e importação de projetos em JSON.
- Modo de overlay sem a interface: adicione `?mode=overlay` ao endereço. O overlay acompanha projetos salvos em outra aba do mesmo navegador/origem.

## Limites da versão

Este protótipo monta a composição visual e pode funcionar como uma página de overlay. Ele **não codifica nem envia uma transmissão RTMP/SRT diretamente** para Twitch, YouTube ou outro serviço. Para publicar a transmissão, use um encoder como OBS ou desenvolva posteriormente uma camada dedicada de captura, codificação e envio. O acesso à câmera exige permissão e um contexto seguro (localhost ou HTTPS).

## Persistência

O projeto é salvo no `localStorage` do navegador. Use **Exportar** para criar uma cópia `.json`; imagens importadas são incorporadas ao projeto e podem aumentar o tamanho do arquivo. O projeto salvo em um navegador não é automaticamente sincronizado com outro computador.

## GitHub

Se o repositório remoto `Webcam_overlay` já existe, copie os arquivos extraídos para sua pasta local do repositório, mantendo a pasta `.git` existente. Depois confira as mudanças com `git status` antes de fazer commit.
