export interface Product {
  id: string
  name: string
  categoryId: string
  categoryName: string
  weightGram: number
  purity: number
  purchasePrice: number
  salePrice: number
  stockQuantity: number
  barcode?: string
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface Location {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface Customer {
  id: string
  fullName: string
  phone: string
  email?: string
  taxNumber?: string
  notes?: string
  isActive: boolean
}

export interface Supplier {
  id: string
  companyName: string
  contactName?: string
  phone: string
  email?: string
  taxNumber?: string
  isActive: boolean
}

export interface GoldPriceLog {
  id: string
  date: string
  gramGoldBuyTRY: number
  gramGoldSellTRY: number
  gramK14BuyTRY?: number
  gramK14SellTRY?: number
  gramK18BuyTRY?: number
  gramK18SellTRY?: number
  gramK22BuyTRY?: number
  gramK22SellTRY?: number
  source: string
}

export interface FinanceItem {
  code: string
  name: string
  buyingPrice: number
  sellingPrice: number
  changeRate: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPriceTRY: number
  weightGram: number
}

export interface Sale {
  id: string
  customerName?: string
  saleDate: string
  totalAmountTRY: number
  totalWeightGram: number
  status: number
  notes?: string
  items: SaleItem[]
}

export interface Purchase {
  id: string
  supplierName?: string
  customerName?: string
  purchaseDate: string
  totalAmountTRY: number
  weightGram: number
  purity: number
  sourceType: number
  status: number
  notes?: string
}

export interface StockMovement {
  id: string
  productName: string
  locationName?: string
  toLocationName?: string
  quantity: number
  type: number
  description?: string
  createdAt: string
}

export interface StockValuation {
  calculatedAt: string
  totalWeightGram: number
  totalEstimatedValueTRY: number
  byPurity: {
    purity: number
    totalWeightGram: number
    totalPiecesCount: number
    estimatedValueTRY: number
  }[]
}

export interface DailySummary {
  date: string
  salesCount: number
  salesRevenueTRY: number
  salesWeightGram: number
  purchasesCount: number
  purchasesCostTRY: number
  purchasesWeightGram: number
  netRevenueTRY: number
}

export interface StockReport {
  generatedAt: string
  totalProducts: number
  totalWeightGram: number
  totalEstimatedValueTRY: number
  items: {
    productName: string
    categoryName: string
    weightGram: number
    purity: string
    stockQuantity: number
    totalWeightGram: number
    estimatedValueTRY: number
  }[]
}

export const PURITY_LABELS: Record<number, string> = {
  0: 'Diğer', 8: '8 Ayar', 14: '14 Ayar',
  18: '18 Ayar', 21: '21 Ayar', 22: '22 Ayar', 24: '24 Ayar (Has)',
}

export const STOCK_MOVEMENT_TYPES: Record<number, string> = {
  1: 'Satın Alma', 2: 'Satış', 3: 'Transfer', 4: 'Düzeltme', 5: 'Fire',
}

export const TRANSACTION_STATUS: Record<number, { label: string; cls: string }> = {
  1: { label: 'Tamamlandı', cls: 'badge-green' },
  2: { label: 'İptal',      cls: 'badge-red'   },
  3: { label: 'Bekliyor',   cls: 'badge-gray'  },
}

export const PURCHASE_SOURCE_TYPES: Record<number, string> = {
  1: 'Tedarikçi', 2: 'Müşteri', 3: 'Hurda',
}
