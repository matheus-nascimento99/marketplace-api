export class InvalidAttachmentTypeError extends Error {
  constructor(public types: string[] = []) {
    super(
      `${types.length > 1 ? `Tipos de arquivos "${types.join('; ')}" são inválidos` : `Tipo de arquivo ${types[0]} é inválido`}`,
    )
  }
}
