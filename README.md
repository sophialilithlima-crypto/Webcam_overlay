# Webcam_overlay — Estúdio editável de transmissão

**Editor visual de cenas e overlays para streamers**, criado com React, TypeScript e Vite. A proposta desta versão é permitir personalizar a composição da transmissão sem editar código, mantendo os recursos visuais locais e leves.

## Abrir a aplicação

**Aplicação web (GitHub Pages):** https://sophialilithlima-crypto.github.io/Webcam_overlay/

> O link abre a versão publicada quando o GitHub Pages concluir o workflow de deploy da branch `main`. A publicação da versão nova ainda precisa ser concluída após enviar este pacote.

**Repositório:** https://github.com/sophialilithlima-crypto/Webcam_overlay

## Editar a composição

### Fontes
- Texto: conteúdo, cor, família tipográfica, tamanho, peso, alinhamento, itálico, espaçamento, altura da linha e fundo.
- Formas: retângulo, círculo/elipse, pílula e linha; cores, bordas e arredondamento.
- Imagens: PNG, JPG/JPEG, WebP, GIF e SVG; importação de vários arquivos como elementos separados (1,5 MB por lote).
- Design completo: importe uma imagem para ocupar a tela como camada de fundo, mantendo as outras camadas por cima.
- Projeto editável: importe um arquivo JSON exportado pelo Webcam_overlay para recuperar cenas e fontes individualmente editáveis.
- Webcam do dispositivo: acesso por permissão do navegador e opção de espelhamento; sem captura de áudio.
- Página web incorporada: para widgets externos que aceitem iframe.

Imagens importadas podem ser movidas, redimensionadas, rotacionadas, recortadas para caber ou preencher, ter opacidade, borda, sombra e arredondamento ajustados. Uma imagem achatada (PNG/JPG/SVG único) continua sendo uma camada única; seus objetos internos não são separados automaticamente. Para editar as partes individualmente, importe o JSON com as camadas separadas ou adicione os elementos como arquivos independentes.

### Biblioteca de widgets de transmissão
- Alertas de evento de demonstração, com animação de teste.
- Caixa de chat e atividade recente.
- Metas de seguidores/inscrições, último seguidor/apoiador e contador ilustrativo de espectadores.
- Redes sociais, faixa de avisos e música configurada manualmente.
- Contagem regressiva e relógio.
- Enquete demonstrativa e patrocinador/marca.
- Moldura de webcam e selo AO VIVO.
- Jarra de apoio com valor/meta, barra de vida de “chefe da transmissão” e ranking de apoiadores.

Os widgets podem ser movidos, redimensionados, rotacionados, alinhados, reposicionados numericamente, ocultados, bloqueados, duplicados e excluídos. Cores, estilos e conteúdo disponíveis podem ser editados no painel de propriedades.

### Cenas e organização
- Kits de cenas: Gaming neon, Just chatting, Minimalista e Vertical/mobile, com variações de Ao vivo, Começando, Intervalo e Encerramento.
- Criar cenas vazias, renomear, duplicar ou excluir cenas.
- Resoluções: 1920×1080, 1280×720, 1080×1920, 1080×1080 e 2560×1440.
- Fundo transparente, cor sólida ou gradiente ajustável.
- Camadas: subir/descer, ocultar/mostrar, bloquear e duplicar.
- Desfazer/refazer com botões ou `Ctrl+Z` / `Ctrl+Y`.
- Salvamento local automático, exportação/importação JSON e opção **Projeto → Redefinir tudo** com confirmação.
- O posicionamento automático tenta evitar sobreposições ao inserir textos, widgets e imagens. Em cenas muito cheias, revise manualmente a composição.
- A marca d'água foi removida da saída do overlay; o logotipo da interface do editor não aparece na composição transmitida.
- Modo de composição: acrescente `?mode=overlay` ao endereço para abrir só a saída visual no navegador.

## Executar no Windows / VS Code

Requisito: Node.js 22.12 ou superior (Node.js 24 recomendado).

```powershell
npm install
npm run dev
```

Abra o endereço indicado pelo Vite, normalmente `http://127.0.0.1:5173/`.

Para compilar a versão de produção:

```powershell
npm run build
```

## Publicar com GitHub Pages

O projeto inclui `.github/workflows/deploy.yml` para compilar e publicar quando alterações são enviadas à branch `main`.

1. Extraia este ZIP numa pasta temporária e copie os arquivos para a pasta do repositório, preservando a pasta `.git`.
2. Execute `npm install` e `npm run build`.
3. Envie as alterações para `main` com `git add .`, `git commit -m "Improve design import and editor stability"` e `git push origin main`.
4. Em **Settings → Pages**, selecione **GitHub Actions** como origem, caso necessário.
5. Em **Actions**, confira o sucesso do workflow antes de usar o link público.

## Limites desta versão

- Alertas, chat, atividade recente, metas, contador, enquete, jarra e ranking usam dados demonstrativos editáveis. Ainda não recebem eventos reais de Twitch, YouTube, Kick, Streamlabs ou StreamElements.
- O widget de música é manual e não lê um player automaticamente.
- A webcam usa o vídeo do navegador, sem áudio; requer permissão e `localhost` ou HTTPS.
- Algumas páginas impedem incorporação em iframe por política própria.
- O salvamento é local, não uma conta em nuvem. O modo overlay lê os dados salvos na mesma origem/perfil do navegador; um navegador embutido no OBS pode usar armazenamento separado.
- Esta aplicação não codifica nem envia o sinal de vídeo às plataformas de transmissão. Essa etapa será feita separadamente.

## Referências para os elementos escolhidos

A biblioteca foi baseada em recursos de overlay documentados por ferramentas utilizadas por streamers: fontes de cena no OBS, alertas/metas/chat no StreamElements e widgets/listas de eventos no Streamlabs.

- [OBS Studio — Sources Guide](https://obsproject.com/kb/sources-guide)
- [OBS Studio — Browser Source](https://obsproject.com/kb/browser-source)
- [StreamElements — Overlays](https://docs.streamelements.com/overlays)
- [StreamElements — Chat Widget](https://docs.streamelements.com/overlays/chat-widget)
- [StreamElements — Widget Data Dashboard](https://docs.streamelements.com/overlays/widget-data)
- [Streamlabs — Event List Widget](https://streamlabs.com/stream-widgets/event-list)
