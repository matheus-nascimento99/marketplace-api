export class InvalidAttachmentSizeError extends Error {
  constructor(
    public maxSize: number,
    public filenames: string[] = [],
  ) {
    super(
      `${filenames.length > 1 ? `Arquivo(s) "${filenames.join('; ')}"` : 'Esse arquivo'} possui(em) o(s) tamanho(s) maior(es) que o aceitável. O limite é ${maxSize}MB`,
    )
  }
}
