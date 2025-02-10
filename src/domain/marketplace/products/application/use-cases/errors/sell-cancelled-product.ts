export class SellCancelledProductError extends Error {
  constructor() {
    super('Não é possível cancelar um produto já vendido')
  }
}
