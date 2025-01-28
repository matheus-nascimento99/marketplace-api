export abstract class Cryptographer {
  abstract encrypt(
    record: Record<string, unknown>,
    expiresIn?: string,
  ): Promise<string>
}
