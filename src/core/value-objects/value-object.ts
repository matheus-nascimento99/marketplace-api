export abstract class ValueObject<Props> {
  protected _value: Props

  protected constructor(props: Props) {
    this._value = props
  }

  equals(vo: ValueObject<unknown>) {
    if (!vo) {
      return false
    }

    return JSON.stringify(vo._value) === JSON.stringify(this._value)
  }
}
