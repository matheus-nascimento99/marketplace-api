import { WatchedList } from '@/core/watched-list'
import { ProductImage } from '../entities/product-image'

export class ProductImageList extends WatchedList<ProductImage> {
  compareItems(a: ProductImage, b: ProductImage): boolean {
    return a.equals(b)
  }
}
