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
