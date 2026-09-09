import { useTranslation } from 'react-i18next'

const STATUS_CLASSES: Record<'stockItemStatus' | 'transactionStatus', Record<number, string>> = {
  stockItemStatus: { 1: 'badge-green', 2: 'badge-red', 3: 'badge-yellow', 4: 'badge-gray' },
  transactionStatus: { 1: 'badge-green', 2: 'badge-red', 3: 'badge-gray' },
}

/**
 * Translated equivalents of the backend's numeric enum labels
 * (purity, stock item status, movement type, transaction status, purchase source).
 * Mirrors the shape of the former static maps in src/types/index.ts so callers
 * can swap `PURITY_LABELS[p]` for `purityLabels[p]` with no other changes.
 */
export function useEnumLabels() {
  const { t } = useTranslation()

  const buildLabelMap = (namespace: string, keys: number[]): Record<number, string> =>
    Object.fromEntries(keys.map(k => [k, t(`enums.${namespace}.${k}`)]))

  const buildStatusMap = (
    namespace: 'stockItemStatus' | 'transactionStatus',
    keys: number[],
  ): Record<number, { label: string; cls: string }> =>
    Object.fromEntries(keys.map(k => [k, { label: t(`enums.${namespace}.${k}`), cls: STATUS_CLASSES[namespace][k] }]))

  return {
    purityLabels: buildLabelMap('purity', [0, 8, 14, 18, 21, 22, 24]),
    stockItemStatus: buildStatusMap('stockItemStatus', [1, 2, 3, 4]),
    stockMovementTypes: buildLabelMap('stockMovementType', [1, 2, 3, 4, 5]),
    transactionStatus: buildStatusMap('transactionStatus', [1, 2, 3]),
    purchaseSourceTypes: buildLabelMap('purchaseSourceType', [1, 2, 3]),
  }
}
