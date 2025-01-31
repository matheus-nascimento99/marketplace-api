import { UniqueEntityId } from '../value-objects/unique-entity-id'

export abstract class Entity<Props> {
  private _id: UniqueEntityId
  protected props: Props

  get id() {
    return this._id
  }

  protected constructor(props: Props, id?: UniqueEntityId) {
    this.props = props
    this._id = id ?? new UniqueEntityId()
  }

  equals(entity: Entity<unknown>) {
    if (!entity) {
      return false
    }

    if (!entity.id.equals(this._id)) {
      return false
    }

    return true
  }
}
