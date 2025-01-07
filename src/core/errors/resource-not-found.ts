export class ResourceNotFoundError extends Error {
  constructor(
    public resource: string,
    public resourceId: string,
  ) {
    super(
      `Recurso "${resource}" com identificador(es) "${resourceId}" não foi/foram encontrado(s)`,
    )
  }
}
