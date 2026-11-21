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


## Dados, armazenamento e arquivos

- As configurações e os projetos são mantidos no armazenamento do navegador utilizado.
- Exporte um backup JSON antes de limpar os dados do navegador ou trocar de dispositivo.
- Vídeos locais são mantidos no IndexedDB e podem aumentar o tamanho do projeto exportado.
- A captura de tela/janela é temporária e exige autorização do usuário; ela não é incluída no projeto JSON.
- URLs externas podem depender de conexão com a internet e podem falhar por CORS, autenticação, bloqueio de incorporação ou indisponibilidade do serviço.
- O relay local mantém mídias em memória durante a execução e tem limites de tamanho; ele não é um armazenamento remoto permanente.


