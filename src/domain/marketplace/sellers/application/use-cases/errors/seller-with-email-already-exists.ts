export class SellerWithEmailAlreadyExists extends Error {
  constructor(public email: string) {
    super(`Vendedor com e-mail "${email}" já existe`)
  }
}
