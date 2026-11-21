# Webcam_overlay Studio

**Editor visual de cenas, overlays e widgets personalizáveis para OBS Studio.**

O Webcam_overlay é um projeto em desenvolvimento que busca tornar a criação de overlays de transmissão mais simples e flexível. A proposta é oferecer uma experiência visual de edição, com liberdade para organizar e personalizar elementos, sem transformar a configuração em um processo complexo.

O projeto funciona como um complemento ao OBS Studio: ele cria a composição visual e disponibiliza uma página de overlay que pode ser exibida pelo recurso **Browser Source (Fonte de navegador)** do OBS. Ele não substitui o OBS e não realiza a transmissão de áudio ou vídeo por conta própria.

> **Status:** protótipo funcional para edição local — versão 3.3.0. Algumas informações exibidas pelos widgets são demonstrativas e as funções que dependem do relay precisam ser executadas localmente.

**[Repositório no GitHub](https://github.com/sophialilithlima-crypto/Webcam_overlay)** · **[Demonstração da interface no GitHub Pages](https://sophialilithlima-crypto.github.io/Webcam_overlay/)**

> A demonstração do GitHub Pages é uma versão estática da interface. Para usar a integração local com o OBS, captura de mídia e sincronização entre editor e Browser Source, siga as instruções de execução local deste README.

---

## Objetivo do projeto

O Webcam_overlay foi pensado para ocupar um meio-termo entre a configuração manual de fontes no OBS e plataformas de produção mais completas. A ideia é permitir que streamers criem composições próprias usando controles visuais, elementos reutilizáveis e modelos que funcionam como ponto de partida — não como limites de personalização.

As prioridades do projeto são:

- **Personalização:** ajustar aparência, posição e comportamento dos elementos sem editar CSS manualmente.
- **Praticidade:** reunir cenas, camadas, widgets e mídias em um único editor.
- **Leveza:** manter o foco na criação de overlays, sem tentar substituir as ferramentas de transmissão.
- **Integração com OBS:** exibir a composição por meio de uma Browser Source.

## Recursos

### Editor de cenas e camadas

- Criar, renomear, duplicar e remover cenas.
- Adicionar texto, formas, imagens, GIFs, vídeos, webcam, captura de tela/janela, páginas incorporadas e widgets.
- Mover e redimensionar elementos diretamente na prévia.
- Ajustar posição, dimensões, rotação, opacidade, alinhamento, bordas e sombras.
- Ocultar, bloquear, duplicar, remover e reorganizar camadas.
- Desfazer/refazer alterações e salvar projetos no armazenamento do navegador.
- Importar e exportar projetos em JSON.

### Widgets personalizáveis

O editor inclui elementos para compor uma transmissão, como:

- Chat e atividade recente.
- Alertas de eventos.
- Barra de metas e último apoiador.
- Redes sociais e faixa de avisos.
- Relógio e contagem regressiva.
- Status ao vivo e contador demonstrativo de espectadores.
- Música, enquete e ranking de apoiadores.
- Patrocinador/marca, moldura de webcam, jarra de apoio e chefe da transmissão.

Cada widget disponibiliza controles visuais adequados à sua função. As opções gerais podem incluir cores, fundo e transparência, tipografia, bordas, espaçamento, ícones, sombras, animações e modo compacto.

### Composição livre da barra de metas

A barra de metas pode ser montada com partes independentes, em vez de ficar limitada a modelos predefinidos. É possível organizar título, descrição, valor atual, meta, percentual, barra de progresso, formas, ícones e imagens. Cada parte pode ter posição, tamanho, ordem, visibilidade e estilo próprios.

### Chat e redes sociais

- No chat, o nome pode aparecer no mesmo balão da mensagem ou em uma etiqueta separada.
- É possível configurar cores dos nomes e balões, transparência, bordas, preenchimento, sombras, fontes, espaçamento e quantidade de mensagens visíveis.
- Nas redes sociais, é possível adicionar, remover, reordenar e renomear plataformas, editar identificadores e usar ícones sugeridos ou logos próprios.

### Webcam, fundos e mídia

- Molduras de webcam predefinidas ou importadas.
- Fundos transparentes, sólidos, em gradiente, imagens e vídeos.
- Carrossel de imagens com opções de intervalo, ordem, loop, transição e enquadramento.
- Sequências de vídeos em uma única fonte, com controles de corte, ordem, loop, volume, velocidade e enquadramento.
- Temas animados importáveis/exportáveis em JSON, com estilos como aurora, espaço, cyberpunk, ondas, partículas e outros.

### Captura e sincronização

O editor pode solicitar acesso à webcam e à captura de tela, janela ou aba por meio das permissões do navegador. A seleção e autorização são feitas pelo usuário; o navegador não permite captura silenciosa.

Na execução local, um relay conecta o editor à Browser Source e auxilia na sincronização do projeto e na comunicação de captura entre contextos do navegador.

### Melhorias da versão 3.3.0

- Indicador de salvamento local e horário do último salvamento confirmado.
- Indicador próprio para o estado do relay local, separado do estado de transmissão do OBS.
- Guias opcionais de centro, terços e margens de área segura de 5% e 10% na prévia do editor.
- Bloqueio e desbloqueio de movimento diretamente na lista de camadas.
- Correções para permitir a compilação TypeScript em modo estrito.

Consulte o [CHANGELOG](CHANGELOG.md) para ver o histórico de versões.

---

## Tecnologias

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/)
- [WebSocket (`ws`)](https://github.com/websockets/ws) para o relay local

## Requisitos

- Node.js 22.12 ou superior (Node.js 24 é recomendado).
- npm.
- Navegador atualizado, como Chrome ou Edge.
- OBS Studio para exibir a composição durante uma transmissão.

## Como executar localmente

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/sophialilithlima-crypto/Webcam_overlay.git
cd Webcam_overlay
```

Instale as dependências e inicie o editor:

```bash
npm install
npm run dev
```

O comando `npm run dev` inicia o servidor Vite e o relay local. Acesse o editor em:

```text
http://127.0.0.1:5173/
```

Mantenha o terminal aberto enquanto estiver usando o editor e a Browser Source. Por padrão, o editor usa a porta `5173` e o relay WebSocket local usa a porta `4174`.

### Atalho no Windows

Também é possível iniciar o projeto pelo arquivo `INICIAR-WINDOWS.bat`, localizado na raiz do repositório. Ele verifica/instala as dependências e executa o servidor local.

## Como usar no OBS Studio

1. Inicie o projeto com `npm run dev` e mantenha o terminal aberto.
2. No OBS Studio, adicione uma fonte **Navegador (Browser Source / Fonte de navegador)**.
3. Informe a URL abaixo:

   ```text
   http://127.0.0.1:5173/?mode=overlay
   ```

4. Configure a largura e a altura de acordo com a sua cena. Por exemplo, `1920 × 1080`.
5. Edite as cenas no Webcam_overlay. A Browser Source usa a composição sincronizada pelo relay local.

A integração descrita aqui é feita por uma página de navegador e um serviço local; o Webcam_overlay ainda não é um plugin nativo instalado dentro do OBS.

## Compilação e pré-visualização

Para verificar os tipos e gerar a versão de produção:

```bash
npm run build
```

Para abrir uma prévia local dos arquivos compilados:

```bash
npm run preview
```

**Observação:** `npm run preview` serve os arquivos compilados, mas não inicia o relay local. Para testar a integração completa com a Browser Source, use `npm run dev`.

## Publicação no GitHub Pages

O repositório inclui um workflow em `.github/workflows/deploy.yml`. Quando há um push para a branch `main`, o GitHub Actions instala as dependências, executa `npm run build` e publica a pasta `dist` no GitHub Pages. O workflow também pode ser iniciado manualmente pela aba **Actions**.

Para habilitar a publicação:

1. Abra o repositório no GitHub.
2. Acesse **Settings → Pages**.
3. Em **Build and deployment**, selecione **GitHub Actions** como origem da publicação.
4. Envie as alterações para a branch `main` ou execute manualmente o workflow pela aba **Actions**.
5. Aguarde o workflow terminar sem erros. O endereço do Pages aparecerá em **Settings → Pages**.

O endereço esperado para este repositório é:

```text
https://sophialilithlima-crypto.github.io/Webcam_overlay/
```

**Importante:** GitHub Pages hospeda arquivos estáticos; ele não executa o servidor Node.js nem o relay local do projeto. Portanto, o link público serve para apresentar a interface, mas não disponibiliza por si só a sincronização local com o OBS, captura de tela ou outros recursos que dependem do relay. Para esses recursos, execute o projeto no próprio computador seguindo as instruções acima.

---

## Dados, armazenamento e arquivos

- As configurações e os projetos são mantidos no armazenamento do navegador utilizado.
- Exporte um backup JSON antes de limpar os dados do navegador ou trocar de dispositivo.
- Vídeos locais são mantidos no IndexedDB e podem aumentar o tamanho do projeto exportado.
- A captura de tela/janela é temporária e exige autorização do usuário; ela não é incluída no projeto JSON.
- URLs externas podem depender de conexão com a internet e podem falhar por CORS, autenticação, bloqueio de incorporação ou indisponibilidade do serviço.
- O relay local mantém mídias em memória durante a execução e tem limites de tamanho; ele não é um armazenamento remoto permanente.

## Limitações conhecidas

O Webcam_overlay ainda está em desenvolvimento. Nesta versão:

- O projeto não codifica nem transmite áudio/vídeo para Twitch, YouTube ou outros serviços.
- Chat, alertas, novos seguidores, espectadores, eventos, metas, enquetes e rankings são demonstrativos enquanto integrações reais não forem implementadas.
- A conexão com a Browser Source depende do relay local em execução.
- O suporte a vídeo depende do navegador e dos codecs disponíveis.
- A captura de tela requer `localhost` ou HTTPS e permissão explícita do usuário.
- A captura de webcam disponibiliza imagem, mas ainda não integra o áudio da webcam.
- O projeto não é um plugin nativo do OBS.

## Contribuições e sugestões

Sugestões, relatos de bugs e propostas de melhoria são bem-vindos. Ao abrir uma issue, descreva o comportamento esperado, o que aconteceu e, quando possível, inclua os passos para reproduzir o problema e mensagens relevantes do console.

## Licença

Este repositório ainda não contém um arquivo `LICENSE`. A publicação do código no GitHub não significa, por si só, que ele pode ser reutilizado, redistribuído ou modificado por terceiros. Uma licença deverá ser adicionada quando os termos de uso e distribuição forem definidos.

---

**Webcam_overlay Studio 3.3.0** · Projeto em desenvolvimento
