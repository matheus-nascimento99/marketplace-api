import { randomUUID } from 'node:crypto'

import { ValueObject } from './value-object'

export class UniqueEntityId extends ValueObject<string> {
  toString() {
    return this._value.toString()
  }

  toValue() {
    return this._value
  }

  constructor(id?: string) {
    super(id ?? randomUUID())
  }
}
