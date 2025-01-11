export abstract class HashCreator {
  abstract hash(value: string): Promise<string>
}
