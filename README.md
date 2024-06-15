# ProjetoEW

*******

- [Processamento de dados](#Processamento_de_dados)
- [Docker](#Docker)
- [Importacao e exportacao de dados](#Importacao_e_exportacao_de_dados)

*******

<div id="Processamento_de_dados"/>

# Processamento de dados

Inicialmente, desenvolvemos o script `validateXml.py` que verifica se os dados (`.xml`) tem a estrutura correta (`.xsd`)

Verificamos que existiam tags e atributos nos sitios incorretos/que nao existem. Por exemplo:

- Tag `<vista>` -> aparecia na 2a posição (incorretamente), dentro do elemento `<casa>`. Foi movido para o fim do elemento `<casa>`.
- Atributo `"entidade"` dentro da tag `<entidade>` não existia. Foi substituído para o atributo correto `"tipo"`

De seguida desenvolvemos o script `convXMLtoJSON.py`, que trasnforma os dados xml em json:

- Fizemos a conversão inicial de XML para JSON, com recurso à biblioteca lxml, guardando nomeadamente, para cada rua, os lugares,entidades, datas encontrados nas tags dos parágrafos de descrição da respetiva rua.
- De seguida, percorrem todos os jsons de ruas e criamos dicionários de todos os lugares, entidades, datas encontrados nas várias ruas, e associamos-lhes um id único.
- Depois, substituímos nas várias ruas as lugares, entidades, datas pelo seu id único criado.
- Exportamos as ruas, entidades, lugares e datas para ficheiros json diferentes, de modo a serem facilmente importados como jsonArrays no mongoDB

No entanto, ao tentar fazer a ligacao com as imagens, surgiram novas dificuldades devido a desformatacao dos nomes. Assim, tivemos de os corrigir manualmente, e decidimos passar a relacionar ruas e as suas imagens atraves de um ID e nao do nome.

Como seria necessario importar as imagens de forma a gerar o seu ID, acabamos por fazer com que o script `convXMLtoJSON.py`, ao inves de exportar os novos dados, os carregue diretamente para as diferentes colecoes no mongodb.

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

- antigo/atual
O nome da imagem sera, implicitamente, igual ao seu _id, pelo que guardamos a extensao de modo a ter o nome completo da mesma
```
subst: <string> - descricao da imagem
extension: <string> - extensao da imagem
```

- comments
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

- dates/entities/places
```
name: <string> - data guardada como string
ruas: [<string>] - lista dos IDs das ruas onde esta data aparece
```

- streets
```
owner: <string> - nome do dono
name: <string> - nome da rua
favorites: [<string>] - ????????????????????????????????????????????????????????????
description: [<string>] - ????????????????????????????????????????????????????????????
places: [<string>] - IDs dos lugares que aparecem nesta rua????????????????????????????????????????????????????????????
entities: [<string>] - IDs das entidades que aparecem nesta rua????????????????????????????????????????????????????????????
dates: [<string>] - IDs das datas que aparecem nesta rua????????????????????????????????????????????????????????????
old_images: [<id>] - IDs das imagens antigas que aparecem nesta rua
houses: [<string>] - IDs das casas que aparecem nesta rua ????????????????????????????????????????????????????????????
new_images: [<id>] - IDs das imagens novas que aparecem nesta rua
```

- users
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

Criamos dois docker compose. Um deles usa o script de python para converter os XML e povoar a base de dados, colocando tambem as imagens no servico de dados:
```bash
sudo ./docker_setup.sh
```

O outro inicia o servico de dados e o frontend em si, aproveitando o container de mongodb ja povoado pelo script anterior: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! frontend ainda nao esta feito!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```bash
sudo ./docker_servico.sh
```

*******

<div id="Importacao_e_exportacao_de_dados"/>

# Importacao e exportacao de dados

No servico de dados, utilizam-se os scripts `import.sh` e `export.sh` para importar e exportar os dados. Estes sao tambem executados pelo proprio servico de dados, atraves da rotas:

- '/impexp/exportar': download de um ficheiro de exportacao de dados
- '/impexp/importar': recebe form com o ficheiro a importar

Estas duas rotas sao utilizadas pelo frontend, estando as funcionalidades disponiveis apenas a administradores.

O ficheiro de exportacao, `dados.tar`, tem os seguintes conteudos:

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

Ao importar, consideramos apenas as colecoes mencionadas no manifesto, verificando tambem:
- se o numero de records corresponde ao indicado
- se o ficheiro de dados existe
- se uma colecao de imagens for indicada, verificamos se todas as imagens mencionadas existem
