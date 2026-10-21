# Webcam_overlay

Editor visual de cenas e overlays para streamers, desenvolvido com **React, TypeScript e Vite**. O objetivo é permitir que a pessoa organize e personalize os elementos visuais de uma transmissão em uma interface web, sem precisar editar código.

> **Status:** protótipo em desenvolvimento. A edição visual funciona localmente; integrações com plataformas e transmissão do sinal de vídeo não fazem parte desta versão.

## Aplicação online

**Endereço planejado:** https://sophialilithlima-crypto.github.io/Webcam_overlay/

## Recursos

### Editor de cenas

- Criar, renomear, duplicar e excluir cenas.
- Alternar entre cenas como **Ao vivo**, **Começando**, **Intervalo** e outras composições.
- Escolher resoluções horizontais, verticais e quadradas, incluindo 1920 × 1080, 1280 × 720, 1080 × 1920, 1080 × 1080 e 2560 × 1440.
- Configurar o fundo como transparente, cor sólida ou gradiente.
- Pré-visualizar o design na proporção da cena.

### Elementos editáveis

- **Texto:** conteúdo, família tipográfica, tamanho, peso, cor, alinhamento, itálico, espaçamento, altura da linha e fundo.
- **Formas:** retângulo, círculo/elipse, pílula e linha, com cores e acabamento personalizáveis.
- **Imagens:** importar PNG, JPG/JPEG, WebP, GIF e SVG, como elementos separados ou como design de fundo.
- **Webcam:** usar a câmera autorizada pelo navegador, com opção de espelhamento; esta versão não captura áudio.
- **Página web incorporada:** adicionar páginas e widgets externos que permitam exibição em iframe.
- **Widgets de streaming:** alterar conteúdo, cores e aparência dos componentes disponíveis.

Os elementos podem ser movidos, redimensionados, rotacionados, alinhados, ajustados numericamente, ocultados, bloqueados, duplicados e removidos. O editor tenta evitar sobreposições ao inserir elementos, mas cenas complexas podem precisar de ajustes manuais.

### Widgets para transmissão

A biblioteca inclui componentes demonstrativos para:

- Alertas de eventos.
- Chat e atividade recente.
- Metas de seguidores/inscrições e último seguidor/apoiador.
- Contador ilustrativo de espectadores.
- Redes sociais, avisos e informação de música preenchida manualmente.
- Relógio e contagem regressiva.
- Enquete, marca/patrocinador e selo **AO VIVO**.
- Moldura de webcam, jarra de apoio, barra de vida de chefe e ranking de apoiadores.

**Importante:** os valores de seguidores, chat, alertas, espectadores, metas e ranking são demonstrativos. A aplicação ainda não recebe eventos reais de Twitch, YouTube, Kick, Streamlabs ou StreamElements.

### Importação, salvamento e histórico

- Importar várias imagens como elementos separados.
- Importar uma imagem como design de fundo.
- Exportar e importar projetos editáveis em JSON.
- Salvar automaticamente no armazenamento local do navegador.
- Desfazer e refazer alterações.
- Usar **Projeto → Redefinir tudo** para retornar às cenas iniciais, após confirmação.
- Abrir apenas a composição visual com `?mode=overlay` no endereço da aplicação.
- A saída do overlay não inclui a marca do editor.

Limites atuais de importação: até **1,5 MB por imagem** e **1,5 MB por lote de imagens**. O tamanho máximo de um projeto JSON é limitado para proteger o armazenamento do navegador. Uma imagem achatada (por exemplo, um PNG com vários elementos dentro) continua sendo uma única camada; para manter cada objeto editável, importe os assets separados ou um projeto JSON com camadas.

## Executar localmente

### Requisitos

- Node.js 22.12 ou superior (Node.js 24 recomendado).
- npm, incluído com o Node.js.
- Git, caso queira enviar as alterações ao GitHub.

### Instalação

Clone o repositório ou abra a pasta local do projeto e execute no terminal:

```powershell
npm install
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://127.0.0.1:5173/`.

Para verificar a compilação de produção:

```powershell
npm run build
```

Para testar localmente a versão compilada:

```powershell
npm run preview
```

## Publicação no GitHub Pages

O projeto contém o workflow `.github/workflows/deploy.yml`, preparado para compilar a aplicação e publicar a pasta `dist` quando há um `push` para `main`.

1. Envie os arquivos do projeto para a branch `main`, incluindo a pasta `.github/workflows/`.
2. No repositório, abra **Settings → Pages** e escolha **GitHub Actions** em *Build and deployment → Source*.
3. Abra a aba **Actions** e acompanhe o workflow **Publicar Webcam_overlay no GitHub Pages**.
4. Só considere o site publicado quando a execução terminar com sucesso. O endereço esperado é `https://sophialilithlima-crypto.github.io/Webcam_overlay/`.

### Se o GitHub Pages mostrar “There isn't a GitHub Pages site here”

Verifique, nesta ordem:

1. **Visibilidade e plano:** no GitHub Free, o Pages está disponível para repositórios públicos. A publicação a partir de repositórios privados depende de um plano compatível. Tornar o repositório público expõe o código e o histórico de commits; faça isso somente depois de confirmar que não há dados privados, tokens ou senhas no repositório.
2. **Workflow no GitHub:** confira se `.github/workflows/deploy.yml` aparece na branch `main` do repositório remoto.
3. **Origem de publicação:** em **Settings → Pages**, selecione **GitHub Actions**.
4. **Resultado do deploy:** em **Actions**, abra a execução mais recente. Se estiver vermelha, leia o primeiro passo que falhou e corrija o erro antes de tentar novamente.
5. **Permissões:** nas configurações do repositório, confira se o GitHub Actions está autorizado a executar workflows e publicar Pages.

Documentação oficial: [GitHub Pages — configurar a origem de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) e [GitHub Pages — início rápido e requisitos de plano](https://docs.github.com/en/pages/quickstart).

## Conferir commits e sincronização

No terminal do VS Code, dentro da pasta do projeto, execute:

```powershell
git status -sb
git branch -vv
git log --oneline --decorate -8
git remote -v
```

- Se a branch aparecer como **ahead** (à frente de `origin/main`), há commits locais que ainda precisam ser enviados com `git push origin main`.
- Se aparecerem arquivos modificados ou não rastreados, eles ainda precisam ser adicionados e commitados.
- Se aparecer **behind** (atrás de `origin/main`), não use `push --force`; primeiro confira as diferenças e sincronize com o remoto.
- Se estiver `up to date` e sem alterações, os commits da pasta atual já estão sincronizados. Nesse caso, confirme se está na pasta correta e se o arquivo que você editou pertence a esse repositório.

Para enviar apenas este README, depois de copiá-lo para a raiz do repositório com o nome `README.md`:

```powershell
git add README.md
git commit -m "docs: improve README and deployment instructions"
git push origin main
```

Se o Git disser `nothing to commit`, não crie um commit vazio: confirme o conteúdo do README, o caminho atual e o resultado de `git status -sb`.

## Limitações conhecidas

- A aplicação é um editor visual e overlay, não um encoder/serviço de transmissão. Ela não envia diretamente o vídeo para uma plataforma.
- Widgets relacionados a eventos, espectadores, metas, chat e apoiadores usam conteúdo de demonstração até que integrações reais sejam implementadas.
- A webcam depende da permissão do navegador e de um contexto seguro (`localhost` ou HTTPS); o áudio não é capturado nesta versão.
- Alguns sites bloqueiam o uso dentro de iframe.
- O projeto é salvo no armazenamento local do navegador, não em uma conta na nuvem. Um navegador incorporado em outro aplicativo pode usar armazenamento separado.
- O acesso ao dispositivo e o comportamento de páginas incorporadas variam de acordo com o navegador.

## Referências

Os recursos de cena e widgets foram escolhidos a partir de padrões comuns em ferramentas de transmissão e overlays:

- [OBS Studio — Sources Guide](https://obsproject.com/kb/sources-guide)
- [OBS Studio — Browser Source](https://obsproject.com/kb/browser-source)
- [StreamElements — Overlays](https://docs.streamelements.com/overlays)
- [StreamElements — Chat Widget](https://docs.streamelements.com/overlays/chat-widget)
- [StreamElements — Widget Data](https://docs.streamelements.com/overlays/widget-data)
- [Streamlabs — Event List Widget](https://streamlabs.com/stream-widgets/event-list)

---

Desenvolvido como protótipo para explorar uma experiência de edição visual de overlays simples e personalizável.
