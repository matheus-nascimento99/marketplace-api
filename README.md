# Funcionalidades e Regras

[X] - Deve ser possível cadastrar novos usuários
  [X] - Deve ser feito o hash da senha do usuário
  [X] - Não deve ser possível cadastrar usuário com e-mail duplicado
  [X] - Não deve ser possível cadastrar usuário com telefone duplicado
[X] - Deve ser possível atualizar os dados do usuário
  [X] - Não deve ser possível atualizar para um e-mail duplicado
  [X] - Não deve ser possível atualizar para um telefone duplicado
[X] - Deve ser possível obter o token de autenticação
  [X] - Não deve ser possível se autenticar com credenciais incorretas
[X] - Deve ser possível realizar o upload de arquivos
[X] - Deve ser possível listar todas as categorias
  [X] - Qualquer usuário deve poder obter a lista de categorias
[ ] - Deve ser possível criar e editar um Produto
  [ ] - Deve ser possível armazenar o valor do produto em centavos
  [ ] - Não deve ser possível criar/editar um Produto com um usuário inexistente
  [ ] - Não deve ser possível criar/editar um Produto com uma categoria inexistente
  [ ] - Não deve ser possível criar/editar um Produto com imagens inexistentes
  [ ] - Não deve ser possível editar um Produto inexistente
  [ ] - Não deve ser possível alterar um Produto de outro usuário
  [ ] - Não deve ser possível editar um Produto já vendido
[ ] - Deve ser possível obter dados de um Produto
  [ ] - Qualquer usuário deve poder obter dados do Produto
[ ] - Deve ser possível listar todos os produtos por ordem de criação (mais recente)
  [ ] - Qualquer usuário deve poder obter a lista de produtos
  [ ] - Deve ser possível realizar paginação pela lista de produtos
  [ ] - Deve ser possível filtrar pelo Status
  [ ] - Deve ser possível buscar pelo título ou pela descrição do produto
[ ] - Deve ser possível listar todos os produtos de um usuário
  [ ] - Não deve ser possível listar os produtos de um usuário inexistente
  [ ] - Deve ser possível filtrar pelo Status
  [ ] - Deve ser possível buscar pelo título ou pela descrição do produto
[ ] - Deve ser possível alterar o Status do Produto
  [ ] - Não deve ser possível alterar o Status de um Produto com um usuário inexistente
  [ ] - Não deve ser possível alterar o Status de um Produto inexistente
  [ ] - Não deve ser possível alterar o Status de um Produto de outro usuário
  [ ] - Não deve ser possível marcar como Cancelado um Produto já Vendido
  [ ] - Não deve ser possível marcar como Vendido um Produto Cancelado
[ ] - Deve ser possível obter informações do perfil de um usuário
  [ ] - Não deve ser possível obter informações do perfil de um usuário inexistente
  [ ] - Não deve ser possível obter a senha do usuário
[ ] - Deve ser possível registrar uma visualização em um produto
  [ ] - Não deve ser possível registrar uma visualização em um produto inexistente
  [ ] - Não deve ser possível registrar uma visualização de um usuário inexistente
  [ ] - Não deve ser possível registrar uma visualização do próprio dono do produto
  [ ] - Não deve ser possível registrar uma visualização duplicada
[ ] - Métricas
  [ ] - Não deve ser possível obter métricas de usuários inexistentes
  [ ] - Deve ser possível obter a métrica de produtos vendidos nos últimos 30 dias
  [ ] - Deve ser possível obter a métrica de produtos disponíveis nos últimos 30 dias
  [ ] - Deve ser possível obter a métrica de visualizações nos últimos 30 dias
  [ ] - Deve ser possível obter a métrica de visualizações por dia dos últimos 30 dias
  [ ] - Deve ser possível obter a métrica de visualizações de um produto nos últimos 7 dias