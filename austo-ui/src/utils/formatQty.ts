// Stock/movement quantities are typed as `decimal` on the backend (a
// fractional adjustment or scrap-weight-as-quantity is possible in theory),
// but the overwhelming majority are whole pieces. Always showing 2-3 fixed
// decimals ("10.00", "1.000") reads as noise for what's almost always a
// plain piece count — this only keeps decimals when the value actually has
// a fractional part.
export function formatQty(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}
