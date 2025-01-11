export class SellerWithPhoneAlreadyExists extends Error {
  constructor(public phone: string) {
    super(`Vendedor com telephone "${phone}" já existe`)
  }
}
