export class ResourceNotFoundError extends Error {
  constructor(
    public resource: string,
    public field: string,
    public resourceIdentifiers: string | string[],
  ) {
    super(
      `Recurso "${resource}" com identificador(es) "${Array.isArray(resourceIdentifiers) ? resourceIdentifiers.join(', ') : resourceIdentifiers}" não foi/foram encontrado(s) no campo "${field}"`,
    )
  }
}
