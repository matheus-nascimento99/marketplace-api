import { Either, left, right } from '@/core/either'
import { SellersRepository } from '../repositories/sellers'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found'
import { AttachmentsRepository } from '@/domain/marketplace/attachments/application/repositories/attachments'
import { Injectable } from '@nestjs/common'
import { Raw } from '@/core/value-objects/raw'
import { UniqueEntityId } from '@/core/value-objects/unique-entity-id'
import { Attachment } from '@/domain/marketplace/attachments/enterprise/entities/attachment'
import { SellerWithEmailAlreadyExists } from './errors/seller-with-email-already-exists'
import { SellerWithPhoneAlreadyExists } from './errors/seller-with-phone-already-exists'
import { StorageDownloader } from '@/core/storage/storage-downloader'
import { SellersAvatarsRepository } from '../repositories/sellers-avatars'
import { SellerAvatar } from '../../enterprise/entities/seller-avatar'
import { SellerWithDetails } from '../../enterprise/value-objects/seller-with-details'
import { HashCreator } from '@/core/hash/hash-creator'

export type EditSellerUseCaseRequest = {
  sellerId: string
  name: string
  phone: string
  email: string
  avatarId: string | null
  password?: string | null
}

export type EditSellerUseCaseResponse = Either<
  | ResourceNotFoundError
  | SellerWithEmailAlreadyExists
  | SellerWithPhoneAlreadyExists,
  {
    seller: SellerWithDetails
  }
>

@Injectable()
export class EditSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private attachmentsRepository: AttachmentsRepository,
    private sellersAvatarsRepository: SellersAvatarsRepository,
    private storageDownloader: StorageDownloader,
    private hashCreator: HashCreator,
  ) {}

  async execute({
    sellerId,
    name,
    email,
    phone,
    avatarId,
    password,
  }: EditSellerUseCaseRequest): Promise<EditSellerUseCaseResponse> {
    const seller = await this.sellersRepository.findById(
      new UniqueEntityId(sellerId),
    )

    if (!seller) {
      return left(new ResourceNotFoundError('Seller', 'ID', sellerId))
    }

    const rawPhone = Raw.createFromText(phone)

    const [sellerByEmail, sellerByPhone] = await Promise.all([
      this.sellersRepository.findByEmail(email),
      this.sellersRepository.findByPhone(rawPhone),
    ])

    if (sellerByEmail && !sellerByEmail.equals(seller)) {
      return left(new SellerWithEmailAlreadyExists(email))
    }

    if (sellerByPhone && !sellerByPhone.equals(seller)) {
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

    if (avatarById) {
      const currentSellerAvatar =
        await this.sellersAvatarsRepository.findBySellerId(seller.id)

      if (currentSellerAvatar) {
        const currentAvatar = await this.attachmentsRepository.findById(
          currentSellerAvatar.avatarId,
        )

        if (currentAvatar && !currentAvatar.equals(avatarById)) {
          await Promise.all([
            this.storageDownloader.download([currentAvatar.key]),
            this.sellersAvatarsRepository.deleteByAvatarId(currentAvatar.id),
          ])
        }

        if (
          !currentAvatar ||
          (currentAvatar && !currentAvatar.equals(avatarById))
        ) {
          const sellerAvatar = SellerAvatar.create({
            avatarId: avatarById.id,
            sellerId: seller.id,
          })

          seller.avatar = sellerAvatar
        }
      } else {
        const sellerAvatar = SellerAvatar.create({
          avatarId: avatarById.id,
          sellerId: seller.id,
        })

        seller.avatar = sellerAvatar
      }
    }

    seller.name = name
    seller.phone = rawPhone
    seller.email = email

    if (password) {
      seller.password = await this.hashCreator.hash(password)
    }

    const sellerWithDetails = await this.sellersRepository.save(
      seller.id,
      seller,
    )

    return right({
      seller: sellerWithDetails,
    })
  }
}
