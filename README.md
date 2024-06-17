# ProjetoEW

# Autores

#### Equipa: ENAMETOOLONG

- **Diogo Alexandre Correia Marques - a100897** 
- **Ivan Sérgio Rocha Ribeiro - a100538**
- **Pedro Miguel Meruge Ferreira - a100709**


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

- A tag `<vista>` aparecia na 2ª posição (incorretamente), dentro do elemento `<casa>`. Foi movida para o fim do elemento `<casa>`.
- O atributo `"entidade"` dentro da tag `<entidade>` não existia. Foi substituído para o atributo correto `"tipo"`

De seguida desenvolvemos o script `convXMLtoJSON.py`, que transforma os dados `xml` em `json`:

- Fizemos a conversão inicial de XML para JSON, com recurso à biblioteca lxml, guardando, para cada rua, os lugares, entidades e datas encontrados nas tags dos parágrafos de descrição da respetiva rua.
- De seguida, percorremos todos os jsons de ruas obtidos e criamos dicionários de todos os lugares, entidades e datas encontrados nas várias ruas, e associamos um ID único a cada um.
- Depois, substituímos nas várias ruas os lugares, entidades e datas pelo seu ID.
- Exportamos as ruas, entidades, lugares e datas para ficheiros json diferentes, de modo a serem facilmente importados para coleções diferentes no mongodb.

[//]: # (acham relevante isto vvvv ?)
Separamos ruas, entidades, lugares e datas em coleções diferentes por serem conceitos independentes que várias ruas referenciam e, tendo em vista a expansão da plataforma no futuro, desta forma reduzimos o tempo de queries de procurar ruas por entidade/lugar/data e facilitamos a expansão dos conceitos de lugar/entidade/datas no futuro.

[//]: # (acaba aqui o parágrafo a que me refiro)

Ao tentar fazer a ligação com as imagens de cada rua, surgiram novas dificuldades devido à desformatação dos nomes. Assim, tivemos de os corrigir manualmente, e decidimos passar a relacionar ruas e as suas imagens através de um ID e não do nome.

Como seria necessário importar as imagens de forma a gerar o seu ID, acabamos por fazer com que o script `convXMLtoJSON.py`, ao invés de exportar os novos dados, os carregue diretamente para as diferentes coleções no mongodb.

Devido ao tamanho inconsistente das imagens, utilizámos o script `padding.sh` para lhes colocar padding.

Para popular as coordenadas geográficas de cada rua (utilizadas nos mapas do site), utilizámos o script `getStreetsGeoCords.py`que recorre à Geocoding API do MapBox.

Por fim, as coleções geradas no processamento do dataset foram:
```
antigo   -> imagens antigas
atual    -> imagens atuais
dates    -> datas mencionados nas ruas
entities -> entidades mencionados nas ruas
places   -> lugares mencionados nas ruas
streets  -> dados sobre cada rua
```

Adcionalmente, para suportar as restantes funcionalidades do site, criamos também outras coleções:
```
comments -> comentários sobre ruas
users    -> utilizadores
```

Em maior detalhe, as coleções têm os seguintes formatos:

- **antigo/atual**

O nome da imagem será, implicitamente, igual ao seu `_id`, pelo que guardamos a extensão de modo a conseguir obter o nome completo do ficheiro respetivo
```
subst: String - descrição da imagem
extension: String - extensão da imagem
```

- **dates/entities/places**
```
name: String - nome do objeto
ruas: [String] - lista dos IDs das ruas onde este objeto aparece
```

- **streets**
```
name: String - nome da rua
owner: String - ID do utilizador que registou a rua
favorites: [String] - IDs dos utilizadores que gostam da rua
description: [String] - texto descritivo da história da rua
dates: [String] - IDs das datas referenciadas pela rua
places: [String] - IDs dos lugares referenciados pela rua
entities: [String] - IDs das entidades referenciadas pela rua
houses: [String] - IDs das casas que aparecem na rua
old_images: [ObjectId] - IDs das imagens antigas da rua
new_images: [ObjectId] - IDs das imagens atuais da rua
geoCords: {
  longitude: String - longitude geográfica da rua
  latitude: String - latitude geográfica da rua
}
```

- **comments**
```
streetId: String - ID da rua sobre a qual se comenta
baseCommentId: String - ID de comentário a que se está a responder (se for o caso)
owner: String - ID do utilizador que registou o comentário
text: String - conteúdo do comentário
createdAt: Date - data de criação
updatedAt: Date - data de edição do conteúdo do comentário
likes: [String] - IDs de utilizadores que gostaram do comentário
dislikes: [String] - IDs de utilizadores que desgostaram do comentário
```

- **users**
```
username: String - nome de login do utilizador
password: String - hash base64 da password
name: String - nome do utilizador dentro do site
level: 'ADMIN' | 'USER' - nível de previlégio
active: Boolean - utilizador ativo ou não
dateCreated: String - data de criação da conta
```

*******

[//]: # (O que é que esta div está a fazer aqui ######################################################??)
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

[//]: # (O que é que esta div está a fazer aqui ######################################################??)
<div id="Importacao_e_exportacao_de_dados"/>

# Importação e exportação de dados

No serviço de dados, utilizam-se os scripts `import.sh` e `export.sh` para importar e exportar os dados. Estes são também executados pelo próprio serviço de dados, através das rotas:

- '/impexp/exportar': download de um ficheiro de exportação de dados
- '/impexp/importar': recebe form com o ficheiro a importar

Estas duas rotas são utilizadas pelo frontend, estando as funcionalidades disponíveis apenas a administradores.

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
- se o número de records corresponde ao indicado
- se o ficheiro de dados existe
- se uma coleção de imagens for indicada, verificamos se todas as imagens mencionadas existem

*******
[//]: # (O que é que esta div está a fazer aqui ######################################################??)
<div id="Autenticacao"/>

# Autenticação

Apesar de existirem servidores dedicados única e exclusivamente à auntenticação de utilizadores, consideramos que tal estratégia seria desnecessária, além de envolver necessariamente mais trocas de mensagens entre serviços e consequente aumento do tempo de resposta sentido pelo utilizador. 

Assim sendo, o `serviço de dados` garante a autenticação de utilizadores e a manutenção do estado de sessão, sendo que para tal são combinados os *middlewares* do *Passport* e *JSON Web Tokens*.

## Passport

Testa a validade das credencias de acesso, sendo que para tal usufrui da estratégia `local`, além disso não guarda as *passwords* diretamente na base de dados, mas sim o código de *hash* resultante e *salt* utilizado para randomizar.  

## JSON Web Tokens

Para manter o estado de sessão é gerado um *token* com a validade de 1 hora, este é sucessivamente trocado entre o *browser* e a aplicação em todos os pedidos realizados, garantindo assim que apenas utilizadores autenticados recebem respostas corretas.

Durante a criação de um *token*, o *ID* e nível de acesso do utilizador são inseridos no *payload*, desta forma, mais tarde, é possível verificar se um dado pedido tem privilégios suficientes para aceder a um determinado recurso.

Por fim, para efetuar *logout*, uma vez que não é possível remover *tokens* do *browser*, a estratégia utilizada envolve tornar o *token* inválido, alterando assim a sua data de expiração para o momento atual.

## Login

[//]: # (Frontend está mal escrito ######################################################)
![login](https://github.com/pedromeruge/ProjetoEW/assets/87565693/d2ad9f06-4b86-4345-810d-977781518d67)

## Obter Recursos
[//]: # (Frontend está mal escrito ######################################################)
[//]: # (Acho que é mais correto dizer frontend só "verifica que tem token" -> a cena que fiz de validar token no frontend é só para garantir que um user que tenha um token inválido não possa aceder às páginas do site (apesar de qualquer tentativa de falar com o backend resulta-se em erro) -> Mas na prática no frontend é so para "verificar", e nem sei se é boa prática/necessário validar no frontend ######################################################)
![get](https://github.com/pedromeruge/ProjetoEW/assets/87565693/72d3086f-9b1f-44d6-bc4c-294fe1476f28)

*******

<div id="Paginas_do_website"/>

# Páginas do website

## Registar/Login

Quando estabelecemos uma ligação ao `frontend` somos imediatamente encaminhados para a página de *login*, contudo se tivermos previamente uma sessão aberta tal não acontece e obtemos a página pretendida.

No caso das credenciais de autenticaçãos estarem incorretas é fornecido um pequeno *feedback*, sendo que nas situações de perda da palavra-passe é necessário criar um novo registo.

Um utilizador que ainda não tenha credenciais no sistema pode registar-se na secção "r"

https://github.com/pedromeruge/ProjetoEW/assets/87565693/7a984b73-f47f-4e60-b1a2-9db0d51aa19b

## Índices de ruas

É a página padrão para a qual o utilizador é redirecionado após login. Inclui uma lista dos nomes das várias ruas inseridas no sistema. Cada elemento da lista redireciona para a página da respetiva rua.

Inclui um mapa de Braga com um marcador para cada uma das ruas inseridas no sistema.

## Índices de datas/entidades/lugares

Os registos das ruas mencionam várias datas, entidades e lugares, pelo que foram desenvolvidos índices para permitir obter uma listagem completa das ruas visadas por cada um.

Os índices são todos semelhantes, ou seja, utilizam *collapsibles* para esconder/apresentar os nomes das ruas, que por sua vez são um *link* para a página da própria rua. 

https://github.com/pedromeruge/ProjetoEW/assets/87565693/a5257880-e596-4de9-9da3-82e1d52879e5

## Apresentação de rua

O primeiro elemento da página é um *slideshow* que apresenta as imagens antigas e atuais da rua, sendo que para cada uma é fornecida uma breve legenda.

De seguida estão posicionados alguns botões que permitem:

- Retroceder
- Editar
- Eliminar
- Adicionar aos favoritos
- Apresentar as datas/entidades/lugares

Convém destacar que os botões de edição e eliminação apenas estão acessíveis aos administradores do sistema e ao utilizador que registou a rua. Por fim é fornecida uma breve descrição da rua, tabela das famílias residentes e zona de comentários onde os utilizadores podem interagir.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/ba6afc8d-f784-4a5b-a20f-dd0410ee623b

## Registo de rua

Os registo das ruas pode ser efetuado por qualquer utilizador, efetuado através de um formulário dividido em cinco zonas:

- **Informações:** identificação do nome da rua e descrição da mesma.
- **Datas/Entidades/Lugares:** parâmetros referenciados pela ruas.
- **Casas:** caracterização das casas e famílias residentes na rua.
- **Fotografias:** imagens antigas e atuais da rua, bem como uma legenda sobre cada uma.
- **Localização:** coordendas geográficas da rua

Em algumas das zonas apresentadas não é possível prever quantos campos o utilizador irá preencher, como tal foram adicionados botões que permitem adicionar/remover campos do formulário.

Para facilitar a introdução das coordendas geográficas da rua, existe uma secção de pesquisa automática que comunica com a Geocoding API do Mapbox.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/b6dc82b4-ed3a-488b-a491-6ab2b36bd84f

## Edição de rua

Para alterar o registo de uma rua é possível reutilizar o formulário utilizado durante o seu registo, sendo que desta vez os campos estão preenchidos com os valores atuais.

<!-- previsualizar ta errado, mas entre prever e visualizar nao sei qual usar -->
Desta forma as funcionalidades de adicionar/remover campos estão novamente presentes, e além disso é possível perver as imagens da rua através de um *modal*.

Posto isto, após efetuar as alterações pretendidas é necessário clicar no botão `Atualizar`, sendo que para cancelar tudo basta clicar em `Voltar`.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/7b088128-4019-478f-8a8f-35a7ecb73c14

## Favoritos e comentários

Para além de apresentar os dados pessoais, a página do utilizador regista ainda as ruas criadas e favoritas, bem como os comentários.

Para adicionar uma rua aos favoritos basta clicar na estrela posicionada na sua página, sendo que a partir daí o botão fica preenchido, e para remover basta clicar novamente. O utilizador pode depois consultar no seu perfil as ruas favoritas.

Já em relação aos comentários, estão disponíveis várias funcionalidades:

- Responder a outro utilizador.
- Alterar o texto.
- Eliminar (remove as respostas encadeadas).
- Gostar/desgostar de comentário

Os comentários são mostrados encadeados relativamente à resposta anterior, usando uma linha vertical para permitir facilmente visualizar a sua origem. Um utilizador autor de comentário pode editá-lo ou apagá-lo. Um administrador (não autor) apenas pode apagá-lo.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/947eaf23-b176-49b4-b046-8dbe480a0305

## Importação e exportação

Estas funcionalidades estão expostas na rota `/`, apenas acessíveis aos administradores, bastando clicar no botão `Dados`, onde se podem escolher as duas opções:

<!-- As funcionalidades para importar/exportar apenas estão acessíveis aos administradores, sendo que para visualizar estas opções é necessário clicar em `Dados`. -->

- **Importar:** o *browser* abre o selecionador de ficheiros, permitindo escolher um ficheiro `.tar`. De seguida é apresentada uma barra de progresso até que os dados tenham sido todos importados, finalmente sendo o utilizador informado acerca do sucesso (ou não) da operação.  
- **Exportar:** o *browser* inicia automaticamente o *download* do ficheiro `dados.tar`, contendo todos os dados presentes no _backend_.

https://github.com/pedromeruge/ProjetoEW/assets/87565693/972265ba-d509-4f0f-9696-6738f94eaf78

## Mapas

Com recurso ao Mapbox, apresentamos mapas da localização das ruas. Existem botões de rodar, ampliar e desampliar para facilitar a navegação. Existem modelos 3D simplificados dos edifícios quando o utilizador amplia significativamente. O utilizador pode escolher entre diferentes estilos de mapa e clicar em "Câmara lateral" para obter uma perspetiva lateral das ruas.

[//]: # (Podiamos mover os título "importação e exportação" para dentor das páginas em que aparecem como subtópicos, já que esta secção do relatório é de "páginas do webiste", o mesmo para "Favoritos e comentários", "Mapas". E acho que isso traduzia melhor a forma como essas funcionalidades se enquadram no site e em que páginas são encontradas######################################################)

[//]: # (Alguns vídeos vão ter que ser refeitos porque agora há mapas :# upsii!! ######################################################)