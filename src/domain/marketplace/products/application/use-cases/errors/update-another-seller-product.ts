export class UpdateAnotherSellerProductError extends Error {
  constructor() {
    super('Não é possível alterar produtos de outro vendedor')
  }
}
