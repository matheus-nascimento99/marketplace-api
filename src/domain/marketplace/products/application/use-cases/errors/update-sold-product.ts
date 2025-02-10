export class UpdateSoldProductError extends Error {
  constructor() {
    super('Não é possível alterar produtos que já estão vendidos')
  }
}
