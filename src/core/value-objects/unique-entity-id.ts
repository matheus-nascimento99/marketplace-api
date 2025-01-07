import { randomUUID } from 'node:crypto'

import { ValueObject } from './value-object'

export class UniqueEntityId extends ValueObject<string> {
  private _id: string

  toString() {
    return this._id.toString()
  }

  toValue() {
    return this._id
  }

  constructor(id?: string) {
    super(id ?? randomUUID())
  }
}
