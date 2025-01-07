export class ValueObject<Props> {
  protected props: Props

  protected constructor(props: Props) {
    this.props = props
  }

  equals(vo: ValueObject<unknown>) {
    if (!vo) {
      return false
    }

    return JSON.stringify(vo.props) === JSON.stringify(this.props)
  }
}
