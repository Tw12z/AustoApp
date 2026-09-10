export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Resolves a period type + anchor date (yyyy-mm-dd) into a [from, to] ISO date range. */
export function getPeriodRange(anchorISO: string, period: ReportPeriod): { from: string; to: string } {
  const anchor = new Date(anchorISO + 'T00:00:00')

  switch (period) {
    case 'daily':
      return { from: anchorISO, to: anchorISO }

    case 'weekly': {
      const mondayOffset = (anchor.getDay() + 6) % 7 // 0 = Monday
      const monday = new Date(anchor)
      monday.setDate(anchor.getDate() - mondayOffset)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return { from: toISO(monday), to: toISO(sunday) }
    }

    case 'monthly': {
      const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
      const last  = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
      return { from: toISO(first), to: toISO(last) }
    }

    case 'yearly': {
      const first = new Date(anchor.getFullYear(), 0, 1)
      const last  = new Date(anchor.getFullYear(), 11, 31)
      return { from: toISO(first), to: toISO(last) }
    }
  }
}
