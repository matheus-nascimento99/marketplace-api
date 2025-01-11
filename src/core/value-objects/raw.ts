import { ValueObject } from './value-object'

export class Raw extends ValueObject<string> {
  get value() {
    return this._value
  }

  static create(value: string) {
    return new Raw(value)
  }

  /**
   * This is a function that take off any special character or spaces from string
   *
   * @example
   *   createFromText('+55 (11) 99384-7372 '); // '5511993847372'
   *
   * @param   {String} value *mandatory*
   */

  static createFromText(value: string) {
    const raw = value
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-ZÀ-ÿ0-9\s]/gi, '')
      .replace(/\s+/g, '')
      .normalize('NFD')

    return new Raw(raw)
  }
}
