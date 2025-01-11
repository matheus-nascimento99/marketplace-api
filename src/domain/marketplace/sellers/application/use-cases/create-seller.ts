import { Either, left, right } from '@/core/either'
import { SellersRepository } from '../repositories/sellers'
import { Seller } from '../../enterprise/seller'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { HashCreator } from '@/core/hash/hash-creator'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { Injectable } from '@nestjs/common'
import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { SellerAvatar } from '../../enterprise/seller-avatar'
import { SellerWithEmailAlreadyExists } from './errors/seller-with-email-already-exists'
import { SellerWithPhoneAlreadyExists } from './errors/seller-with-phone-already-exists'

export type CreateSellerUseCaseRequest = {
  name: string
  phone: string
  email: string
  avatarId: string | null
  password: string
}

export type CreateSellerUseCaseResponse = Either<
  | ResourceNotFoundError
  | SellerWithEmailAlreadyExists
  | SellerWithPhoneAlreadyExists,
  {
    seller: Seller
    avatar: Attachment | null
  }
>

@Injectable()
export class CreateSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private attachmentsRepository: AttachmentsRepository,
    private hashCreator: HashCreator,
  ) {}

  async execute({
    name,
    email,
    phone,
    password,
    avatarId,
  }: CreateSellerUseCaseRequest): Promise<CreateSellerUseCaseResponse> {
    const rawPhone = Raw.createFromText(phone)

    const [sellerByEmail, sellerByPhone] = await Promise.all([
      this.sellersRepository.findByEmail(email),
      this.sellersRepository.findByPhone(rawPhone),
    ])

    if (sellerByEmail) {
      return left(new SellerWithEmailAlreadyExists(email))
    }

    if (sellerByPhone) {
      return left(new SellerWithPhoneAlreadyExists(phone))
    }

    let avatarById: Attachment | null = null

    if (avatarId) {
      avatarById = await this.attachmentsRepository.findById(
        new UniqueEntityId(avatarId),
      )

      if (!avatarById) {
        return left(new ResourceNotFoundError('Avatar', 'ID', avatarId))
      }
    }

    const passwordHash = await this.hashCreator.hash(password)

    const seller = Seller.create({
      name,
      email,
      phone: rawPhone,
      password: passwordHash,
    })

    if (avatarById) {
      const sellerAvatar = SellerAvatar.create({
        avatarId: avatarById.id,
        sellerId: seller.id,
      })

      seller.avatar = sellerAvatar
    }

    await this.sellersRepository.create(seller)

    return right({
      seller,
      avatar: avatarById,
    })
  }
}
