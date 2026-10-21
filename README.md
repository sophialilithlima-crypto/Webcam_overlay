# Webcam_overlay 

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

As configurações aparecem de acordo com o elemento selecionado, separando o conteúdo, o estilo e o posicionamento para tornar a edição mais organizada.

### Chat personalizável

O widget de chat oferece controles visuais independentes para diferentes partes da mensagem.

- Tornar transparente o fundo geral do chat.
- Remover o desfoque e a caixa ao redor das mensagens.
- Personalizar a cor, opacidade, borda, sombra e arredondamento dos balões.
- Alterar a cor dos nomes dos participantes.
- Definir cores específicas para nomes e balões.
- Personalizar a etiqueta que identifica cada participante.
- Ajustar fontes, tamanhos, pesos e cores do texto.
- Controlar espaçamento, alinhamento e quantidade de mensagens exibidas.
- Exibir ou ocultar horários e identificadores disponíveis.

### Relógio personalizável

O relógio pode ser exibido apenas com os números, sem fundo, borda ou sombra.

Entre as opções disponíveis estão:
- Família tipográfica e fonte externa.
- Tamanho, cor e peso dos números.
- Espaçamento entre caracteres.
- Exibição da data e dos segundos.
- Formato de 12 ou 24 horas.
- Sombra e outros ajustes visuais disponíveis.

### Fontes externas

O editor permite utilizar fontes externas informando um link para uma folha CSS do Google Fonts ou para um arquivo de fonte compatível, como `.woff2`, `.woff`, `.ttf` ou `.otf`.

O carregamento depende da disponibilidade do endereço e das permissões do servidor de origem. Algumas fontes podem não funcionar devido a bloqueios CORS, autenticação ou restrições de acesso.

Utilize fontes que você tenha permissão para incorporar.

---

## Importação e gerenciamento de projetos

O Webcam_overlay permite manter os projetos no navegador e transferir configurações entre ambientes.

- Salvamento automático local.
- Exportação de projetos em JSON.
- Importação de projetos editáveis em JSON.
- Importação de imagens como elementos independentes.
- Importação de uma imagem como fundo.
- Importação e recuperação de vídeos locais por meio do projeto exportado.
- Exportação e importação de configurações visuais individuais de widgets.
- Histórico de desfazer e refazer.
- Opção **Redefinir tudo**, com confirmação.

A opção de redefinição restaura a estrutura inicial do projeto. Exporte um backup antes de utilizá-la caso queira conservar seu trabalho.

**Importante:** uma imagem achatada, como um PNG ou JPG que reúne todos os elementos de um overlay, continua sendo uma única camada. Para editar cada texto, forma ou mídia separadamente, importe os elementos individuais ou um projeto JSON com suas camadas separadas.

---

## Interface e organização

A interface foi estruturada para separar as áreas de edição:

- **Cenas:** gerenciamento dos diferentes layouts.
- **Camadas:** organização e seleção dos elementos da composição.
- **Elemento:** propriedades específicas do item selecionado.
- **Fundo:** controles do plano de fundo da cena.
- **Tela:** configurações da área de composição.

A intenção é reduzir a complexidade da edição, permitindo encontrar os controles relevantes sem misturar propriedades de widgets diferentes.

## Tecnologias utilizadas

- React 19
- TypeScript
- Vite 8
- CSS próprio
- IndexedDB para armazenar vídeos locais
- LocalStorage para configurações e dados locais do projeto
- APIs de mídia do navegador para câmera e captura de tela

A estrutura utiliza um conjunto reduzido de dependências para manter a aplicação simples e facilitar sua evolução.

---

## Instalação e execução local

### Requisitos

- Node.js compatível com Vite 8; Node.js 24 é recomendado para este projeto.
- npm.
- Navegador atualizado, como Chrome, Edge ou Firefox.

### 1. Instale as dependências

Abra a pasta do projeto no VS Code e execute no terminal:

```bash
npm install
