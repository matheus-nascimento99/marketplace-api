import { randomUUID } from 'node:crypto'

import { ValueObject } from './value-object'

export class UniqueEntityId extends ValueObject<string> {
  toString() {
    return this.props.toString()
  }

  toValue() {
    return this.props
  }

  constructor(id?: string) {
    super(id ?? randomUUID())
  }
}
