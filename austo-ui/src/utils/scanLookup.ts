import { productsApi, stockItemsApi } from '../api/client'
import type { Product, StockItem } from '../types'

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type ScanResult =
  | { kind: 'stockItem'; item: StockItem; productId: string }
  | { kind: 'product';   product: Product; productId: string }
  | { kind: 'none' }

/**
 * Printed labels carry two different payloads: a product QR encodes the product
 * GUID (ProductService.GetQRAsync), a piece QR encodes the item code such as
 * AUSTO-00001 (StockItemService.GetQRAsync). Third-party labels may wrap either
 * in a URL, so take the last path segment when one shows up.
 */
export function normalizeScan(raw: string): string {
  const text = raw.trim()
  if (!/^https?:\/\//i.test(text)) return text
  try {
    const segment = new URL(text).pathname.split('/').filter(Boolean).pop()
    return segment ? decodeURIComponent(segment) : text
  } catch { return text }
}

const orNull = async <T,>(p: Promise<{ data: T }>): Promise<T | null> => {
  try { return (await p).data } catch { return null }
}

/** Resolves a scanned payload to the piece or product it points at. */
export async function lookupScan(raw: string): Promise<ScanResult> {
  const code = normalizeScan(raw)
  if (!code) return { kind: 'none' }

  if (GUID_RE.test(code)) {
    const product = await orNull<Product>(productsApi.getById(code))
    if (product) return { kind: 'product', product, productId: product.id }
    const item = await orNull<StockItem>(stockItemsApi.getById(code))
    if (item) return { kind: 'stockItem', item, productId: item.productId }
    return { kind: 'none' }
  }

  const item = await orNull<StockItem>(stockItemsApi.getByCode(code))
  if (item) return { kind: 'stockItem', item, productId: item.productId }
  // Falls back to the barcode field so shop-printed barcodes scan too.
  const product = await orNull<Product>(productsApi.getByBarcode(code))
  if (product) return { kind: 'product', product, productId: product.id }
  return { kind: 'none' }
}
