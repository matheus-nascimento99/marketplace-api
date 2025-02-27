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
[X] - Deve ser possível deslogar da aplicação
[X] - Deve ser possível realizar o upload de arquivos
[X] - Deve ser possível listar todas as categorias
  [X] - Qualquer usuário deve poder obter a lista de categorias
[X] - Deve ser possível criar e editar um Produto
  [X] - Deve ser possível armazenar o valor do produto em centavos
  [X] - Não deve ser possível criar/editar um Produto com um usuário inexistente
  [X] - Não deve ser possível criar/editar um Produto com uma categoria inexistente
  [X] - Não deve ser possível criar/editar um Produto com imagens inexistentes
  [X] - Não deve ser possível editar um Produto inexistente
  [X] - Não deve ser possível alterar um Produto de outro usuário
  [X] - Não deve ser possível editar um Produto já vendido
[X] - Deve ser possível obter dados de um Produto
  [X] - Qualquer usuário deve poder obter dados do Produto
[X] - Deve ser possível listar todos os produtos por ordem de criação (mais recente)
  [X] - Qualquer usuário deve poder obter a lista de produtos
  [X] - Deve ser possível realizar paginação pela lista de produtos
  [X] - Deve ser possível filtrar pelo Status
  [X] - Deve ser possível buscar pelo título ou pela descrição do produto
[X] - Deve ser possível listar todos os produtos de um usuário
  [X] - Não deve ser possível listar os produtos de um usuário inexistente
  [X] - Deve ser possível filtrar pelo Status
  [X] - Deve ser possível buscar pelo título ou pela descrição do produto
[X] - Deve ser possível alterar o Status do Produto
  [X] - Não deve ser possível alterar o Status de um Produto com um usuário inexistente
  [X] - Não deve ser possível alterar o Status de um Produto inexistente
  [X] - Não deve ser possível alterar o Status de um Produto de outro usuário
  [X] - Não deve ser possível marcar como Cancelado um Produto já Vendido
  [X] - Não deve ser possível marcar como Vendido um Produto Cancelado
[X] - Deve ser possível obter informações do perfil de um usuário
  [X] - Não deve ser possível obter informações do perfil de um usuário inexistente
  [X] - Não deve ser possível obter a senha do usuário
[X] - Deve ser possível registrar uma visualização em um produto
  [X] - Não deve ser possível registrar uma visualização em um produto inexistente
  [X] - Não deve ser possível registrar uma visualização de um usuário inexistente
  [X] - Não deve ser possível registrar uma visualização do próprio dono do produto
  [X] - Não deve ser possível registrar uma visualização duplicada
[X] - Métricas
  [X] - Não deve ser possível obter métricas de usuários inexistentes
  [X] - Deve ser possível obter a métrica de produtos vendidos nos últimos 30 dias
  [X] - Deve ser possível obter a métrica de produtos disponíveis nos últimos 30 dias
  [X] - Deve ser possível obter a métrica de visualizações nos últimos 30 dias
  [X] - Deve ser possível obter a métrica de visualizações por dia dos últimos 30 dias
  [X] - Deve ser possível obter a métrica de visualizações de um produto nos últimos 7 dias