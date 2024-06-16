# ProjetoEW

# Autores

#### Equipa: ENAMETOOLONG

- **Diogo Alexandre Correia Marques a100897** 
- **Ivan Sérgio Rocha Ribeiro - a100538**
- **Pedro Miguel Meruge Ferreira a100709**


*******

- [Processamento de dados](#Processamento_de_dados)
- [Docker](#Docker)
- [Importação e exportação de dados](#Importacao_e_exportacao_de_dados)
- [Autenticação](#Autenticacao)
- [Páginas do website](#Paginas_do_website)

*******

<div id="Processamento_de_dados"/>

# Processamento de dados

Inicialmente, desenvolvemos o script `validateXml.py` que verifica se os dados (`.xml`) têm a estrutura correta (`.xsd`)

Verificamos que existiam tags e atributos nos sítios incorretos/que não deviam existir. Por exemplo:

- Tag `<vista>` -> aparecia na 2ª posição (incorretamente), dentro do elemento `<casa>`. Foi movido para o fim do elemento `<casa>`.
- Atributo `"entidade"` dentro da tag `<entidade>` não existia. Foi substituído para o atributo correto `"tipo"`

De seguida desenvolvemos o script `convXMLtoJSON.py`, que transforma os dados `xml` em `json`:

- Fizemos a conversão inicial de XML para JSON, com recurso à biblioteca lxml, guardando, para cada rua, os lugares, entidades e datas encontrados nas tags dos parágrafos de descrição da respetiva rua.
- De seguida, percorremos todos os jsons de ruas e criamos dicionários de todos os lugares, entidades e datas encontrados nas várias ruas, e associamos um ID único a cada um.
- Depois, substituímos nas várias ruas os lugares, entidades e datas pelo seu ID.
- Exportamos as ruas, entidades, lugares e datas para ficheiros json diferentes, de modo a serem facilmente importados para coleções diferentes no mongodb.

No entanto, ao tentar fazer a ligação com as imagens, surgiram novas dificuldades devido à desformatação dos nomes. Assim, tivemos de os corrigir manualmente, e decidimos passar a relacionar ruas e as suas imagens através de um ID e não do nome.

Como seria necessário importar as imagens de forma a gerar o seu ID, acabamos por fazer com que o script `convXMLtoJSON.py`, ao invés de exportar os novos dados, os carregue diretamente para as diferentes coleções no mongodb.

Devido ao tamanho inconsistente das imagens, usamos o script `padding.sh` para lhes colocar padding.

Por fim, as colecoes geradas foram:
```
antigo   -> imagens antigas
atual    -> imagens atuais
comments -> comentarios sobre posts
dates    -> datas    \
entities -> entidades > mencionados nas ruas
places   -> lugares  /
streets  -> dados sobre cada rua
users    -> utilizadores
```

Com os seguintes formatos:

- **antigo/atual**

O nome da imagem será, implicitamente, igual ao seu `_id`, pelo que guardamos a extensão de modo a conseguir obter o nome completo do ficheiro respetivo
```
subst: <string> - descricao da imagem
extension: <string> - extensao da imagem
```

- **comments**
```
    streetId: String,
    baseCommentId: String, // comentário a que se está a dar reply, se for o caso
    owner: {type: String, required: true},
    text: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: [String],
    dislikes: [String]
```

- **dates/entities/places**
```
name: <string> - data guardada como string
ruas: [<string>] - lista dos IDs das ruas onde esta data aparece
```

- **streets**
```
name: <string> - nome da rua
owner: <string> - ID do utilizador que registou a rua
favorites: [<string>] - IDs dos utilizadores que gostam da rua
description: [<string>] - texto descritivo da história da rua
dates: [<string>] - IDs das datas referenciadas pela rua
places: [<string>] - IDs dos lugares referenciados pela rua
entities: [<string>] - IDs das entidades referenciadas pela rua
houses: [<string>] - IDs das casas que aparecem na rua
old_images: [<id>] - IDs das imagens antigas da rua
new_images: [<id>] - IDs das imagens atuais da rua
```

- **users**
```
username: <string> - nome??????????????????????????????????????????????????????????????????????????????????
password: <string> - hash base64 da password
name: <string> - nome??????????????????????????????????????????????????????????????????????????????????
level: String,??????????????????????????????????????????????????????????????????????????????????
active: Boolean,??????????????????????????????????????????????????????????????????????????????????
dateCreated: <string> - data de criacao da conta
```

*******

<div id="Docker"/>

# Docker:

Criamos dois _docker compose_. Um deles usa o script de python para converter os XML e povoar a base de dados, como mencionado anteriormente, colocando também as imagens no serviço de dados:
```bash
sudo ./docker_setup.sh
```

O outro inicia o serviço de dados e o frontend em si, aproveitando o container de mongodb já povoado pelo script anterior:
```bash
sudo ./docker_servico.sh
```

> **_NOTA:_**  Enquanto medida de segunça, os *containers* `mongodb` e `serviço de dados` não exteriorizam as suas portas, apenas o `frontend` pode ser acedido através do *localhost*.

*******

<div id="Importacao_e_exportacao_de_dados"/>

# Importação e exportação de dados

No serviço de dados, utilizam-se os scripts `import.sh` e `export.sh` para importar e exportar os dados. Estes sao também executados pelo proprio serviço de dados, atraves das rotas:

- '/impexp/exportar': download de um ficheiro de exportação de dados
- '/impexp/importar': recebe form com o ficheiro a importar

Estas duas rotas sao utilizadas pelo frontend, estando as funcionalidades disponíveis apenas a administradores.

O ficheiro de exportação, `dados.tar`, tem os seguintes conteúdos:

```bash
dados.tar
├── files.tar.xz
│   ├── antigo                            -> imagens antigas
│   │   ├── 666cc1f7ac573c823263d94e.jpg
│   │   └── 666cc1f7ac573c823263da38.jpg
│   ├── antigo.json                       -> collection exportada
│   ├── atual                             -> imagens atuais
│   │   ├── 666cc1f7ac573c823263d950.JPG
│   │   └── 666cc1f7ac573c823263da3a.JPG
│   ├── atual.json                        -> outra collection
│   ├── comments.json
│   ├── dates.json
│   ├── entities.json
│   ├── places.json
│   ├── streets.json
│   └── users.json
└── manifest.json                         -> manifesto
```

O manifesto tem o formato:
```js
{
  "meta": {
    "size": 37768137 // tamanho em bytes dos ficheiros
  },
  "dados": { // todas as colecoes exportadas
    "streets": {
      "collection": "streets",
      "filename": "streets.json",
      "records": 60
    },
    "dates": {
      "collection": "dates",
      "filename": "dates.json",
      "records": 265
    },
    "entities": {
      "collection": "entities",
      "filename": "entities.json",
      "records": 913
    },
    "places": {
      "collection": "places",
      "filename": "places.json",
      "records": 587
    },
    "antigo": {
      "collection": "antigo",
      "filename": "antigo.json",
      "records": 116
    },
    "atual": {
      "collection": "atual",
      "filename": "atual.json",
      "records": 121
    },
    "comments": {
      "collection": "comments",
      "filename": "comments.json",
      "records": 0
    },
    "users": {
      "collection": "users",
      "filename": "users.json",
      "records": 3
    }
  }
}
```

Ao importar, consideramos apenas as coleções mencionadas no manifesto, verificando também:
- se o numero de records corresponde ao indicado
- se o ficheiro de dados existe
- se uma coleção de imagens for indicada, verificamos se todas as imagens mencionadas existem

*******

<div id="Autenticacao"/>

# Autenticação

Apesar de existirem servidores dedicados única e exclusivamente à auntenticação de utilizadores, consideramos que tal estratégia seria desnecessária, além de envolver necessariamente mais trocas de mensagens entre serviços e consequente aumento do tempo de resposta sentido pelo utilizador. 

Assim sendo, o `serviço de dados` garante a autenticação de utilizadores e a manutenção do estado de sessão, sendo que para tal são combinados os *middlewares* do *Passport* e *JSON Web Tokens*.

## Passport

Testa a validade das credencias de acesso, sendo que para tal usufrui da estratégia `local`, além disso não guarda as *passwords* diretamente na base de dados, mas sim o código de *hash* resultante e *salt* utilizado para randomizar.  

## JSON Web Tokens

Para manter o estado de sessão é gerado um *token* com a validade de 1 hora, este é sucessivamente trocado entre o *browser* e a aplicação em todos os pedidos realizados, garantindo assim que apenas utilizadores autenticados recebem respostas corretas.

Durante a criação de um *token*, o *ID* e nível de acesso do utilizador são inseridos no *payload*, desta forma, mais tarde, é possível verificar se um dado pedido tem privilégios suficientes para aceder a um determinado recurso.

Por fim, para efetuar *logout*, uma vez que não é possível remover *tokens* do *browser*, a estratégia utilizada para por tornar o *token* inválido, alterando assim a sua data de expiração para o momento atual.

## Login

![login](https://github.com/pedromeruge/ProjetoEW/assets/87565693/d2ad9f06-4b86-4345-810d-977781518d67)

## Obter Recursos

![get](https://github.com/pedromeruge/ProjetoEW/assets/87565693/72d3086f-9b1f-44d6-bc4c-294fe1476f28)

*******

<div id="Paginas_do_website"/>

# Páginas do website

## Autenticação

Quando estabelecemos uma ligação ao `frontend` somos imediatamente encaminhados para a página de *login*, contudo se tivermos previamente uma sessão aberta tal não acontece e obtemos a página pretendida.

No caso das credenciais de autenticaçãos estarem incorretas é fornecido um pequeno *feedback*, sendo que nas situações de perda da palavra-passe é necessário criar um novo registo.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/7a984b73-f47f-4e60-b1a2-9db0d51aa19b

## Índices de datas/entidades/lugares

Os registos das ruas mencionam várias datas, entidades e lugares, pelo que foram desenvolvidos índices para permitir obter uma listagem completa das ruas visadas por cada um.

Os índices são todos semelhantes, ou seja, utilizam *collapsibles* para esconder/apresentar os nomes das ruas, que por sua vez são um *link* para a página da própria rua. 

https://github.com/pedromeruge/ProjetoEW/assets/87565693/a5257880-e596-4de9-9da3-82e1d52879e5

## Apresentação das ruas

O primeiro elemento da página é um *slideshow* que apresenta as imagens antigas e atuais da rua, sendo que para cada uma é fornecida uma breve legenda.

De seguida estão posicionados alguns botões que permitem:

- Retroceder
- Editar
- Eliminar
- Adicionar aos favoritos
- Apresentar as datas/entidades/lugares

Convém destacar que os botões de edição e eliminação apenas estão acessíveis aos administradores do sistema e ao utilizador que registou a rua. Por fim é fornecida uma breve descrição da rua, tabela das famílias residentes e zona de comentários onde os utilizadores podem interagir.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/ba6afc8d-f784-4a5b-a20f-dd0410ee623b

## Registo de ruas

Os registo das ruas pode ser efetuado por qualquer utilizador, efetuado através de um formulário dividido em quatro zonas:

- **Informações:** identificação do nome da rua e descrição da mesma.
- **Datas/Entidades/Lugares:** parâmetros referenciados pela ruas.
- **Casas:** caracterização das casas e famílias residentes na rua.
- **Fotografias:** imagens antigas e atuais da rua, bem como uma legenda sobre cada uma.

Em algumas das zonas apresentadas não é possível prever quantos campos o utilizador irá preencher, como tal foram adicionados botões que permitem adicionar/remover campos do formulário.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/b6dc82b4-ed3a-488b-a491-6ab2b36bd84f

## Edição de ruas

Para alterar o registo de uma rua é possível reutilizar o formulário utilizado durante o seu registo, sendo que desta vez os campos estão preenchidos com os valores atuais.

<!-- previsualizar ta errado, mas entre prever e visualizar nao sei qual usar -->
Desta forma as funcionalidades de adicionar/remover campos estão novamente presentes, e além disso é possível perver as imagens da rua através de um *modal*.

Posto isto, após efetuar as alterações pretendidas é necessário clicar no botão `Atualizar`, sendo que para cancelar tudo basta clicar em `Voltar`.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/7b088128-4019-478f-8a8f-35a7ecb73c14

## Favoritos e comentários

Para além de apresentar os dados pessoais, a página do utilizador regista ainda as ruas criadas e favoritas, bem como os comentários.

Para adicionar uma rua aos favoritos basta clicar na estrela posicionada na sua página, sendo que a partir daí o botão fica preenchido, e para remover basta clicar novamente.

Já em relação aos comentários, estão disponíveis várias funcionalidades:

- Responder a outro utilizador.
- Alterar o texto.
- Eliminar (remove as respostas encadeadas).

Os comentários são mostrados encadeados relativamente à resposta anterior, usando uma linha vertical para permitir facilmente visualizar a sua origem.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/947eaf23-b176-49b4-b046-8dbe480a0305

## Importação e exportação

Estas funcionalidades estão expostas na rota `/`, apenas acessíveis aos administradores, bastando clicar no botão `Dados`, onde se podem escolher as duas opções:

<!-- As funcionalidades para importar/exportar apenas estão acessíveis aos administradores, sendo que para visualizar estas opções é necessário clicar em `Dados`. -->

- **Importar:** o *browser* abre o selecionador de ficheiros, permitindo escolher um ficheiro `.tar`. De seguida é apresentada uma barra de progresso até que os dados tenham sido todos importados, finalmente sendo o utilizador informado acerca do sucesso (ou não) da operação.  
- **Exportar:** o *browser* inicia automaticamente o *download* do ficheiro `dados.tar`, contendo todos os dados presentes no _backend_.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/972265ba-d509-4f0f-9696-6738f94eaf78
