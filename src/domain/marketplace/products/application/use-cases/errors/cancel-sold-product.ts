export class CancelSoldProductError extends Error {
  constructor() {
    super('Não é possivel cancelar um produto já vendido')
  }
}
