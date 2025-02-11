export class ViewOwnProductError extends Error {
  constructor() {
    super('Não é possível registrar uma nova visualização no próprio produto')
  }
}
