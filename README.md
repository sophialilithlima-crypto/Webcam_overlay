# Webcam_overlay — Estúdio editável de transmissão

**Editor visual de overlays e cenas para streamers**, construído com React, TypeScript e Vite. A proposta é permitir que quem está começando personalize o visual da transmissão sem precisar editar código.

## Abrir a aplicação

**Aplicação web (GitHub Pages):** https://sophialilithlima-crypto.github.io/Webcam_overlay/

> O endereço ficará ativo depois que esta versão for enviada para a branch `main`, o GitHub Pages estiver configurado para usar GitHub Actions e o workflow de publicação terminar com sucesso.

**Repositório:** https://github.com/sophialilithlima-crypto/Webcam_overlay

## O que é editável

### Fontes básicas
- Texto: conteúdo, cor, fonte, tamanho, peso, alinhamento, itálico, espaçamento, altura das linhas e fundo.
- Formas: retângulo, círculo/elipse, pílula e linha; cor e arredondamento.
- Imagens: PNG, JPG, WebP e GIF; tamanho limitado a 1,5 MB por arquivo para evitar projetos excessivamente pesados.
- Webcam do dispositivo: permissão pelo navegador e opção de espelhamento; sem captura de áudio.
- Página web incorporada: para widgets externos que permitam incorporação por iframe.

### Biblioteca de widgets de transmissão
- Alertas de evento com animação de teste.
- Caixa de chat com nomes e mensagens editáveis.
- Lista de atividade recente (seguidores, inscrições, apoios e raids em dados demonstrativos).
- Barra de meta com valor atual, objetivo e progresso.
- Etiqueta de último seguidor/apoiador.
- Faixa de redes sociais.
- Contagem regressiva com opção de pausar/iniciar.
- Relógio local.
- Selo de status ao vivo e contador demonstrativo de espectadores.
- Faixa rolante para avisos e mensagens.
- Widget “tocando agora”, com título e artista configuráveis manualmente.
- Enquete visual com opções e percentuais demonstrativos.
- Bloco de patrocinador/marca.
- Moldura decorativa de webcam.

Todos os widgets podem ser movidos, redimensionados, rotacionados, reposicionados numericamente, ocultados, bloqueados, duplicados e excluídos. Também têm paletas de estilo (vidro, neon, minimalista e sólido) e cor de destaque editável.

### Cenas e projeto
- Kits prontos: Gaming neon, Just chatting, Minimalista e Vertical/mobile. Cada kit adiciona cenas para transmissão, início e intervalo.
- Cenas próprias: criar, renomear, duplicar e excluir.
- Resoluções: 1920×1080, 1280×720, 1080×1920, 1080×1080 e 2560×1440.
- Fundo transparente, cor sólida ou gradiente ajustável.
- Organização de camadas: mover para cima/baixo, mostrar/ocultar e bloquear.
- Histórico: desfazer/refazer, `Ctrl+Z` / `Ctrl+Y`.
- Salvamento local automático e importação/exportação do projeto em JSON.
- Modo de composição: acrescente `?mode=overlay` ao endereço para abrir a cena sem os painéis do editor no mesmo navegador/perfil.

## Começar localmente (Windows + VS Code)

Requisito: Node.js 22.12 ou superior (Node.js 24 recomendado).

```powershell
npm install
npm run dev
```

Abra o endereço indicado pelo Vite, normalmente `http://127.0.0.1:5173/`.

Para compilar uma versão de produção:

```powershell
npm run build
```

## Publicação pelo GitHub Pages

Este projeto já inclui `.github/workflows/deploy.yml` para compilar e publicar ao enviar alterações para `main`.

1. Envie os arquivos atualizados para a branch `main` do repositório.
2. No GitHub, abra **Settings → Pages** e escolha **GitHub Actions** como origem de publicação, se ainda não estiver configurada.
3. Abra a aba **Actions** e aguarde o workflow “Publicar Webcam_overlay no GitHub Pages” terminar com sucesso.
4. Abra o link público no início deste README.

O endereço base para o GitHub Pages está configurado em `vite.config.ts`.

## Limites desta versão

- Widgets de alertas, metas, chat, atividades e contador usam **dados fictícios editáveis para demonstração**. Eles ainda não estão conectados a Twitch, YouTube, Kick, Streamlabs ou StreamElements.
- O widget de música é manual; não lê automaticamente um player ou serviço de música.
- A webcam usa o vídeo do navegador, sem áudio. O acesso exige permissão e um contexto seguro (`localhost` ou HTTPS).
- Algumas páginas web impedem incorporação em iframe pelas suas próprias políticas.
- O salvamento é local no navegador, não é uma conta em nuvem.
- O modo overlay lê o projeto salvo na mesma origem e no mesmo perfil de navegador. O navegador embutido de OBS pode usar armazenamento separado, então a sincronização com OBS ainda precisa de uma integração própria.
- Esta aplicação **não codifica nem envia o sinal de vídeo** para plataformas de transmissão. Isso será considerado em uma fase posterior.

## Por que estes widgets foram escolhidos

O conjunto foi pensado a partir dos componentes documentados pelas próprias ferramentas: o OBS descreve fontes de cena como vídeo, imagem, texto e navegador; o StreamElements documenta overlays com alertas, labels, metas e chat; e o Streamlabs oferece listas de eventos para follows, inscrições, apoios e raids.

Referências oficiais:
- [OBS Studio — Sources Guide](https://obsproject.com/kb/sources-guide)
- [OBS Studio — Browser Source](https://obsproject.com/kb/browser-source)
- [StreamElements — Overlays](https://docs.streamelements.com/overlays)
- [StreamElements — Chat Widget](https://docs.streamelements.com/overlays/chat-widget)
- [StreamElements — Widget Data Dashboard](https://docs.streamelements.com/overlays/widget-data)
- [Streamlabs — Event List Widget](https://streamlabs.com/stream-widgets/event-list)
