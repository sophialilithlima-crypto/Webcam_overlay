# Webcam_overlay Studio 3.3.0

**Editor visual de overlays e widgets para usar com o OBS Studio.**

O Webcam_overlay foi pensado para ficar entre dois extremos: oferecer mais liberdade de personalização do que uma fonte de texto/imagem configurada manualmente no OBS, sem exigir a estrutura pesada de um estúdio de produção completo. A montagem é visual; os controles avançados aparecem somente quando o elemento selecionado precisa deles.

> **Estado atual:** protótipo funcional de edição local. A saída é uma página que pode ser carregada pela Browser Source do OBS; o aplicativo ainda não codifica nem envia uma transmissão para Twitch, YouTube ou outras plataformas. Chat, alertas, metas e métricas usam dados demonstrativos quando não há uma integração real conectada.

### Melhorias da versão 3.3.0

- Indicador de salvamento local com estado visível durante a edição e horário do último salvamento confirmado.
- Indicador separado do relay local: informa se o serviço de sincronização está conectado, reconectando ou indisponível. Ele não afirma que o OBS está transmitindo; apenas mostra o estado da conexão local do editor.
- Guias de composição com linhas de terços e centro, além de margens de área segura de 5%/10%, sem aparecerem na saída final do overlay.
- Bloqueio e desbloqueio de movimento diretamente na lista de camadas, sem precisar abrir as propriedades do elemento.
- Correção de três declarações TypeScript não utilizadas que impediam a compilação estrita.

## O que você pode criar

### Cenas e camadas

- Criar, renomear, duplicar e remover cenas.
- Adicionar texto, formas, imagens, GIFs, vídeos, webcam, captura de tela/janela, páginas incorporadas e widgets.
- Arrastar e redimensionar fontes na prévia.
- Ocultar, bloquear, duplicar, remover e ordenar camadas.
- Ajustar posição, dimensões, rotação, opacidade, alinhamento, bordas e sombras.
- Desfazer/refazer, salvar localmente e importar/exportar projetos JSON.

### Barra de metas com composição livre

A barra de metas não fica presa aos modelos visuais. Ative **Montar minha barra de meta** em **Elemento → Aparência** para editar as partes de modo independente:

- título, descrição, valor atual, separador, meta, percentual e texto auxiliar;
- barra de progresso, formas, ícones e imagens importadas;
- selecionar cada parte pela lista de composição e editar suas propriedades; a prévia permite mover e redimensionar a barra inteira sem interferir nos textos e valores;
- ajustar X/Y, largura/altura, ordem, visibilidade e duplicação;
- configurar fontes, tamanho, peso, itálico, alinhamentos horizontal/vertical, espaçamento, transformação, cor, transparência, sombra, fundo, borda, raio, rotação e gradientes para formas.

É possível deixar o valor atual e a meta separados, colocar qualquer parte nos cantos, sobrepor o texto ao preenchimento e colocar um logo ou ornamento importado dentro da composição. Há um limite de segurança de 100 partes por barra para evitar que um projeto enorme deixe a interface lenta.

### Chat personalizável

- Mostrar o nome de usuário dentro do mesmo balão da mensagem ou em uma etiqueta separada.
- Alterar cores de nomes e balões individualmente para os participantes de demonstração.
- Ajustar transparência do fundo geral, cor/opacidade dos balões, arredondamento, borda, preenchimento, sombra, fonte, tamanho, peso, altura de linha, espaçamento e alinhamento.
- Escolher o número de mensagens visíveis e mostrar/ocultar horários e emblemas.

As cores individuais são associadas aos nomes configurados no widget. Quando o chat real for integrado, essa mesma configuração poderá ser aplicada aos nomes recebidos; por enquanto, as mensagens exibidas são locais demonstrativas.

### Redes sociais editáveis

- Adicionar, remover, reordenar e renomear plataformas.
- Editar o nome do perfil ou identificador.
- Usar um ícone padrão sugerido para plataformas comuns, informar a URL de um logo ou importar uma imagem local.
- Ajustar a cor de reserva do ícone e o estilo geral do widget.

Os ícones sugeridos são carregados por URL externa e precisam de conexão com a internet. Para usar um logo próprio/offline, importe o arquivo. Respeite os direitos de uso e as regras de marca de cada plataforma.

### Molduras de webcam

Escolha um estilo predefinido ou importe uma moldura própria, preferencialmente em PNG/WebP com transparência. A imagem pode ser aplicada por arquivo ou URL e fica sobreposta à fonte de webcam. O widget tem controles visuais de bordas, cantos, rótulo e cores.

### Widgets incluídos

- Alertas de evento.
- Caixa de chat e atividade recente.
- Barra de metas e último apoiador.
- Redes sociais.
- Relógio e contagem regressiva.
- Status ao vivo e contador demonstrativo de espectadores.
- Faixa de avisos e widget de música.
- Enquete e ranking de apoiadores.
- Patrocinador/marca.
- Moldura de webcam.
- Jarra de apoio e chefe da transmissão.

Cada widget tem um conjunto de controles adequado à sua função, além das opções visuais compartilhadas: modelo visual inicial, cor de destaque, cores, fundo/transparência, tipografia, borda, raio, espaçamento, ícones, sombras, animação e modo compacto.

### Fundos e mídia

O fundo de uma cena pode ser transparente, cor sólida, gradiente, imagem, vídeo, captura de tela/janela, carrossel de imagens ou tema animado.

**Carrossel:** importe várias imagens, reordene, acrescente/substitua fotos, escolha intervalo de exibição, loop, ordem aleatória, transição e duração, encaixe, ponto focal, zoom, efeito Ken Burns, opacidade, brilho, contraste, saturação, matiz, desfoque e sobreposição.

**Vídeos e banners animados:** é possível importar sequências de clipes como uma única fonte. Os controles disponíveis incluem corte inicial/final, ordem dos clipes, loop, silêncio, volume, velocidade, enquadramento, posição, brilho, contraste, saturação e matiz. Vídeos locais são guardados no IndexedDB e podem ser incluídos em um projeto JSON exportado, dentro dos limites de tamanho.

**Temas animados:** há estilos como aurora, espaço estrelado, cyberpunk, ondas, gradiente líquido, chuva Matrix, lava, bokeh, nuvens, pulso elétrico, partículas, laser, oceano e prisma. Os temas compartilham controles de cores, velocidade, intensidade, desfoque, glow, textura, vinheta, densidade, escala, direção, camadas, brilho, contraste, saturação, matiz e modo de mistura. Os temas podem ser importados/exportados em JSON sem executar código arbitrário.

### Captura de tela e webcam

Uma fonte de captura permite escolher uma tela/monitor, janela ou aba por meio do seletor nativo do navegador. É preciso clicar para iniciar e autorizar o compartilhamento; o navegador não permite captura silenciosa. A captura é temporária e não é salva no projeto JSON.

A webcam também exige autorização explícita. A versão atual captura a imagem, mas não integra áudio da webcam.

## Instalação e execução local

### Requisitos

- Node.js compatível com Vite 8 (Node.js 22.12+ ou versão 24 é recomendado).
- npm.
- Chrome, Edge ou outro navegador recente.

### Instalar e iniciar

Abra a pasta do projeto no VS Code e execute:

```powershell
npm install
npm run dev
```

O script `npm run dev` inicia o servidor de desenvolvimento Vite e o relay local de mídia/sinalização. A página do editor costuma estar em `http://127.0.0.1:5173/`; o relay WebSocket usa `127.0.0.1:4174`.

### Usar com o OBS

1. Deixe `npm run dev` em execução.
2. No OBS, adicione uma fonte **Navegador (Browser Source)**.
3. Use esta URL:

   ```text
   http://127.0.0.1:5173/?mode=overlay
   ```

4. Configure a resolução conforme sua cena, por exemplo, 1920 × 1080.
5. Edite cenas no editor mantendo o servidor ativo.

O compartilhamento entre o editor e a Browser Source utiliza o relay local; essa arquitetura é um protótipo de desenvolvimento, não um serviço público hospedado. A tela/janela ainda precisa ser selecionada manualmente no editor. Para usar a saída em outra máquina ou em um site estático, será necessário projetar e proteger um relay remoto.

### Testar a compilação

```powershell
npm run build
```

Para ver a saída local de produção:

```powershell
npm run preview
```

Atenção: o `preview` isolado não inicia o relay. Para o teste atual com captura/mídias sincronizadas no OBS, use `npm run dev`.

## Projetos, importação e backups

- O projeto é salvo no armazenamento do navegador.
- Exporte o projeto como JSON antes de limpar os dados do navegador ou redefinir o projeto.
- Importar uma imagem achatada (PNG/JPG com todos os elementos unidos) continua sendo uma única camada; para editar partes individuais, importe os assets separadamente ou use a barra de metas em composição livre.
- Os estilos de widgets e os temas animados podem ser exportados/importados em JSON.
- Imagens locais são limitadas para evitar ultrapassar o armazenamento do navegador; vídeos usam IndexedDB. Um JSON exportado com muitos arquivos pode ficar grande.

## Limitações atuais

- O projeto ainda não codifica nem transmite áudio/vídeo diretamente para serviços de streaming.
- Chat, alertas, novos seguidores, espectadores, eventos, metas, votações e rankings são demonstrativos enquanto as integrações oficiais não forem implementadas.
- A compatibilidade de vídeo depende do navegador e do codec; MP4/H.264 e WebM/VP8/VP9 são escolhas comuns.
- URLs externas podem falhar por CORS, autenticação, bloqueio de incorporação ou indisponibilidade do site.
- A captura de tela exige `localhost`/HTTPS e permissão do usuário.
- A conexão do overlay ao OBS depende do relay local e precisa ser testada no ambiente real; ainda não é um plugin nativo instalado dentro do OBS.

## Direção do projeto

A meta é oferecer um editor de overlays flexível, visual e leve: modelos prontos servem apenas como ponto de partida; o usuário pode reorganizar e estilizar componentes, importar assets próprios e exportar composições reutilizáveis. A prioridade do desenvolvimento é estabilizar o fluxo de edição e integração com o OBS antes de adicionar sistemas pesados ou integrações de plataforma.

## Seleção no editor

O editor começa sem elementos selecionados. A seleção é exclusiva: ao clicar em outra camada, a seleção anterior é removida; ao clicar numa área vazia da prévia ou mudar para as abas Camadas, Fundo ou Tela, a seleção é limpa. As partes da barra de metas só ficam realçadas dentro do widget atualmente selecionado.

A seleção é exclusiva: clicar em outra fonte substitui a seleção anterior. As guias da prévia são auxiliares de edição e não são enviadas para a Browser Source.
