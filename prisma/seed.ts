import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const seed = async () => {
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()
  await prisma.attachment.deleteMany()

  await Promise.all([
    prisma.category.create({ data: { slug: 'moveis', title: 'Móveis' } }),
    prisma.category.create({
      data: { slug: 'eletrodomesticos', title: 'Eletrodomésticos' },
    }),
    prisma.category.create({
      data: { slug: 'cama-mesa-e-banho', title: 'Cama, Mesa e Banho' },
    }),
    prisma.category.create({ data: { slug: 'moda', title: 'Moda' } }),
    prisma.category.create({ data: { slug: 'infantil', title: 'Infantil' } }),
  ])
}

seed()
  .then(() => {
    console.log('Seed generated successfully!')
  })
  .catch((error) => {
    console.log(error)
  })
  .finally(async () => {
    prisma.$disconnect()
  })
