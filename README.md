# ProjetoEW

Para processamento inicial de dados:
- `validateXml.py` -> validar se todos os .xml de acordo com o .xsd
  verificamos que havia atributos e tags nos sítios incorretos:
  - Tag `<vista>` -> aparecia na 2a posição (incorretamente), dentro do elemento `<casa>`. Foi movido para o fim do elemento `<casa>`.
  - atributo `"entidade"` dentro da tag `<entidade>` não existia. Foi substituído para o atributo correto `"tipo"`

- Com recurso ao script convXMLtoJSON.py, convertemos os dados xml das ruas para o formato json. Por passos:
    - Fizemos a conversão inicial de XML para JSON, com recurso à biblioteca lxml, guardando nomeadamente, para cada rua, os lugares,entidades, datas encontrados nas tags dos parágrafos de descrição da respetiva rua.
    - De seguida, percorrem todos os jsons de ruas e criamos dicionários de todos os lugares, entidades, datas encontrados nas várias ruas, e associamos-lhes um id único.
    - Depois, substituímos nas várias ruas as lugares, entidades, datas pelo seu id único criado.
    - Exportamos as ruas, entidades, lugares e datas para ficheiros json diferentes, de modo a serem facilmente importados como jsonArrays no mongoDB



novo tratamento das imagens:
passamos a ignorar o nome como identificador e usar o id do mongo
assim, no script de conv, fazemos ja a insercao das imagens para associar as ruas ao seu id
logo decidimos usar ja esse script para inserir todos os dados para alem de converted
problema: nomes das imagens estavam mal com ma conversao de caracteres portugueses, tivemos de corrigir a mao


# Docker:

Criamos dois docker compose. Um deles usa o script de python para converter os XML e povoar a base de dados, colocando tambem as imagens no servico de dados:
```bash
sudo ./docker_setup.sh
```

O outro inicia o servico de dados e o frontend em si, aproveitando o container de mongodb ja povoado pelo script anterior: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! frontend ainda nao esta feito!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
```bash
sudo ./docker_servico.sh
```

# Importacao e exportacao de dados

No servico de dados, utilizam-se os scripts `import.sh` e `export.sh` para importar e exportar os dados. Estes sao tambem executados pelo proprio servico de dados, atraves da rotas:

- '/impexp/exportar': download de um ficheiro de exportacao de dados
- '/impexp/importar': recebe form com o ficheiro a importar

Estas duas rotas sao utilizadas pelo frontend, estando as funcionalidades disponiveis apenas a administradores.

O ficheiro de exportacao, `dados.tar`, tem os seguintes conteudos:

```
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
```json
{
  "meta": {
    "size": 37768137 // tamanho em bytes dos ficheiros, para poder ver o progresso de extracao
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

Ao importar, importamos apenas as colecoes mencionadas no mesmo, verificando tambem:
- o numero de records corresponde ao indicado
- se o ficheiro de dados existe
- se uma colecao de imagens for indicada, verificamos se todas as imagens existem
