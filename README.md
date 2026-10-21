# Webcam Overlay

**Um editor visual de cenas e overlays para streamers, feito para facilitar a criação de transmissões personalizadas diretamente no navegador.**

O Webcam_overlay permite organizar elementos visuais, criar cenas, importar mídias e personalizar widgets sem precisar editar código para cada alteração. O projeto prioriza uma interface organizada, liberdade criativa e uma estrutura leve.

> **Status do projeto:** protótipo funcional de edição visual. A composição pode incluir imagens, vídeos, webcam, captura de tela e widgets personalizáveis. A codificação e o envio da transmissão para plataformas como Twitch e YouTube ainda não fazem parte desta versão.

---

## Recursos

### Editor visual de cenas

Monte a composição da sua transmissão em uma área de trabalho visual, com elementos independentes e controles de edição.

- Criar, renomear, duplicar e excluir cenas.
- Alternar entre diferentes layouts de transmissão.
- Adicionar, selecionar, mover, redimensionar, alinhar, duplicar e remover elementos.
- Ajustar posição, largura, altura, rotação e opacidade.
- Organizar camadas, alterar a visibilidade e bloquear elementos.
- Trabalhar com diferentes proporções de tela, incluindo formatos horizontais, verticais e quadrados.
- Desfazer e refazer alterações.
- Salvar projetos e recuperar configurações no navegador.

### Fundos personalizáveis

Escolha como deseja compor o fundo de cada cena:

- Cor sólida.
- Gradiente.
- Transparência.
- Imagem importada do computador ou de uma URL.
- Vídeo local ou link direto compatível.
- Captura de tela, janela ou aba do navegador.

Para imagens e vídeos, é possível ajustar o enquadramento, a posição, a opacidade e outros parâmetros visuais disponíveis.

O fundo pode ser combinado com textos, formas, widgets, webcam e outros elementos sobrepostos.

### Importação de imagens, GIFs e vídeos

Importe mídias para utilizar como elementos independentes ou como parte do fundo.

**Imagens e GIFs**
- Adicionar arquivos como camadas.
- Ajustar posição, dimensões, opacidade e enquadramento.
- Personalizar bordas, sombras e aparência.
- Utilizar imagens como fundo da cena.

**Vídeos**
- Importar arquivos como fontes de vídeo.
- Usar vídeos locais ou URLs diretas compatíveis.
- Definir o ponto inicial e final do trecho reproduzido.
- Ativar ou desativar o loop.
- Silenciar o áudio e ajustar o volume.
- Alterar a velocidade de reprodução.
- Controlar o enquadramento, a posição e a opacidade.
- Utilizar um vídeo como fundo da cena.

Formatos como MP4, WebM, MOV, OGV, AVI e outros contêineres de vídeo podem ser selecionados, mas a reprodução depende do codec e do suporte do navegador. MP4 com H.264 e WebM com VP8/VP9 são opções recomendadas para compatibilidade.

**Limites de mídia local:**
- Até 50 MB por vídeo.
- Até 75 MB por lote de importação.
- Até 75 MB de vídeos locais por projeto.
- Exportação de projetos com mídia sujeita a um limite aproximado de 125 MB para o arquivo JSON.

Os vídeos são armazenados no IndexedDB do navegador para evitar colocar todo o conteúdo diretamente no armazenamento das configurações. Ao exportar um projeto, os vídeos locais são incorporados ao JSON para facilitar o backup e a transferência.

### Captura de tela, janela ou aba

Adicione uma fonte de captura para exibir o conteúdo que deseja mostrar na transmissão.

O navegador permite selecionar:
- Uma tela ou monitor inteiro.
- Uma janela específica de aplicativo.
- Uma aba do navegador.

A captura pode ser utilizada como fonte independente ou como fundo da cena, permitindo sobrepor webcam, textos e outros elementos.

Por segurança, o navegador exige autorização explícita. A captura é temporária, não é incluída no arquivo JSON exportado e precisa ser autorizada novamente quando necessário.

O recurso depende de um navegador compatível com `getDisplayMedia` e de um contexto seguro, como `localhost` ou HTTPS.

### Webcam

Adicione uma fonte de câmera à composição, com acesso mediante autorização do navegador.

A webcam pode ser posicionada e dimensionada independentemente dos outros elementos. O protótipo também oferece a opção de espelhamento.

A captura de áudio da webcam não faz parte dos recursos atuais.

---

## Widgets para transmissões

O editor inclui uma biblioteca de widgets visuais que podem ser adicionados às cenas e personalizados individualmente.

| Widget | Finalidade |
|---|---|
| Caixa de chat | Exibir mensagens e nomes de participantes |
| Alertas de evento | Demonstrar alertas de seguidores, inscrições, raids e apoios |
| Atividade recente | Mostrar uma lista de eventos recentes |
| Barra de meta | Representar progresso de seguidores, inscrições ou arrecadação |
| Último apoiador | Destacar o último seguidor ou inscrito |
| Redes sociais | Apresentar perfis e nomes de redes sociais |
| Contagem regressiva | Exibir um temporizador |
| Relógio | Mostrar a hora local |
| Status ao vivo | Exibir um indicador de transmissão |
| Faixa rolante | Apresentar avisos, mensagens e comandos |
| Tocando agora | Exibir informações sobre música |
| Enquete | Mostrar opções e resultados demonstrativos |
| Patrocinador | Exibir uma marca ou parceria |
| Moldura de webcam | Aplicar uma moldura decorativa |
| Jarra de apoio | Representar contribuições e metas |
| Chefe da transmissão | Exibir uma barra de vida para interações da comunidade |
| Ranking de apoiadores | Organizar uma lista de apoiadores |

### Personalização dos widgets

Cada widget possui controles específicos de conteúdo e aparência, conforme o tipo de elemento selecionado.

É possível personalizar opções como:

- Textos, títulos, subtítulos e valores.
- Cores de destaque, fundo e conteúdo.
- Transparência do fundo.
- Bordas, espessura, arredondamento e sombras.
- Espaçamento interno e entre elementos.
- Família tipográfica, tamanho, peso e espaçamento das letras.
- Exibição de cabeçalhos e ícones.
- Modo compacto e animações disponíveis.
- Imagem de fundo do widget.
- Propriedades específicas de cada tipo de widget.

As configurações aparecem de acordo com o elemento selecion
