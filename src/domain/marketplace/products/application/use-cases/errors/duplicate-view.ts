export class DuplicateViewError extends Error {
  constructor() {
    super('Este produto já possui uma visualização deste usuário')
  }
}
