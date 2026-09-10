import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { DailySummary, Sale } from '../types'
import type { ReportPeriod } from './dateRanges'
import { buildLogoSvgMarkup, LOGO_ASPECT_RATIO } from './logoSvg'

const FONT = 'NotoSans'

interface ReportPdfLabels {
  title: string
  rangeLabel: string
  generatedAt: string
  salesCount: string
  salesRevenue: string
  salesWeight: string
  purchasesCount: string
  purchasesCost: string
  purchasesWeight: string
  netProfitLoss: string
  detailTitle: string
  colDate: string
  colCustomer: string
  colWeight: string
  colAmount: string
  colStatus: string
  retail: string
  noSales: string
}

interface BuildSalesReportPdfArgs {
  period: ReportPeriod
  from: string
  to: string
  summary: DailySummary
  sales: Sale[]
  locale: string
  labels: ReportPdfLabels
  statusLabel: (status: number) => string
}

/** Rasterizes the AUSTO wordmark (see utils/logoSvg.ts) to a PNG data URL —
 * jsPDF can only embed raster images, not arbitrary SVG paths, so the header
 * logo has to go through a throwaway <canvas> first. */
async function rasterizeLogo(color: string): Promise<{ dataUrl: string; aspect: number }> {
  const pixelHeight = 240
  const pixelWidth = Math.round(pixelHeight * LOGO_ASPECT_RATIO)
  const svg = buildLogoSvgMarkup(color, pixelWidth, pixelHeight)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('logo svg failed to load'))
      image.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = pixelWidth
    canvas.height = pixelHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d context unavailable')
    ctx.drawImage(img, 0, 0, pixelWidth, pixelHeight)
    return { dataUrl: canvas.toDataURL('image/png'), aspect: LOGO_ASPECT_RATIO }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Renders a daily/weekly/monthly/yearly sales report as a downloadable PDF —
 * a summary block (sales + purchases + net) followed by the itemized sale
 * list for the period, auto-paginated by jspdf-autotable for long ranges.
 *
 * Uses an embedded Noto Sans subset (utils/fonts/notoSansData.ts, loaded
 * lazily so it doesn't bloat the main app bundle) instead of jsPDF's built-in
 * fonts — those only cover WinAnsi and silently drop/garble Turkish letters
 * (ğ, ş, ı, İ) and the ₺ sign. */
export async function buildSalesReportPdf({ period, from, to, summary, sales, locale, labels, statusLabel }: BuildSalesReportPdfArgs) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 14

  const { NOTO_SANS_REGULAR_BASE64 } = await import('./fonts/notoSansData')
  doc.addFileToVFS('NotoSans.ttf', NOTO_SANS_REGULAR_BASE64)
  doc.addFont('NotoSans.ttf', FONT, 'normal')
  // No embedded bold instance (the source is a variable font's default —
  // regular — weight); registering it under 'bold' too just keeps
  // setFont(FONT, 'bold') from throwing when autoTable/headers ask for it.
  doc.addFont('NotoSans.ttf', FONT, 'bold')
  doc.setFont(FONT, 'normal')

  const fmt  = (n: number) => '₺' + n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const fmtW = (n: number) => n.toFixed(2) + 'g'

  // Header band
  doc.setFillColor(10, 10, 10)
  doc.rect(0, 0, pageWidth, 26, 'F')

  const logo = await rasterizeLogo('#D4AF37')
  const logoHeight = 9
  const logoWidth = logoHeight * logo.aspect
  doc.addImage(logo.dataUrl, 'PNG', marginX, 6, logoWidth, logoHeight)

  doc.setTextColor(225, 225, 225)
  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.text(labels.title, marginX, 21)

  doc.setTextColor(40, 40, 40)
  doc.setFontSize(10)
  doc.text(labels.rangeLabel, marginX, 34)
  doc.setFontSize(8)
  doc.setTextColor(130, 130, 130)
  doc.text(labels.generatedAt, marginX, 39)

  autoTable(doc, {
    startY: 44,
    head: [[labels.salesCount, labels.salesRevenue, labels.salesWeight]],
    body: [[summary.salesCount.toString(), fmt(summary.salesRevenueTRY), fmtW(summary.salesWeightGram)]],
    theme: 'grid',
    styles: { font: FONT, fontSize: 9, halign: 'center' },
    headStyles: { fillColor: [212, 175, 55], textColor: [10, 10, 10], fontStyle: 'bold' },
  })

  const afterFirst = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4

  autoTable(doc, {
    startY: afterFirst,
    head: [[labels.purchasesCount, labels.purchasesCost, labels.purchasesWeight]],
    body: [[summary.purchasesCount.toString(), fmt(summary.purchasesCostTRY), fmtW(summary.purchasesWeightGram)]],
    theme: 'grid',
    styles: { font: FONT, fontSize: 9, halign: 'center' },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
  })

  const afterSecond = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7

  const isPositive = summary.netRevenueTRY >= 0
  const netColor: [number, number, number] = isPositive ? [22, 140, 80] : [200, 45, 45]
  doc.setFontSize(12)
  doc.setFont(FONT, 'bold')
  doc.setTextColor(netColor[0], netColor[1], netColor[2])
  doc.text(`${labels.netProfitLoss}: ${fmt(summary.netRevenueTRY)}`, marginX, afterSecond)

  const detailStartY = afterSecond + 9
  doc.setFontSize(11)
  doc.setTextColor(20, 20, 20)
  doc.setFont(FONT, 'bold')
  doc.text(labels.detailTitle, marginX, detailStartY)

  if (sales.length === 0) {
    doc.setFont(FONT, 'normal')
    doc.setFontSize(10)
    doc.setTextColor(140, 140, 140)
    doc.text(labels.noSales, marginX, detailStartY + 8)
  } else {
    const sortedSales = [...sales].sort((a, b) => new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime())
    const dateOpts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    const body: string[][] = sortedSales.map(s => [
      new Date(s.saleDate).toLocaleString(locale, dateOpts),
      s.customerName || labels.retail,
      fmtW(s.totalWeightGram),
      fmt(s.totalAmountTRY),
      statusLabel(s.status),
    ])

    autoTable(doc, {
      startY: detailStartY + 4,
      head: [[labels.colDate, labels.colCustomer, labels.colWeight, labels.colAmount, labels.colStatus]],
      body,
      theme: 'striped',
      styles: { font: FONT, fontSize: 8.5 },
      headStyles: { fillColor: [20, 20, 20], textColor: [212, 175, 55], fontStyle: 'bold' },
      columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
    })
  }

  doc.save(`Austo-${period}-satis-raporu-${from}_${to}.pdf`)
}
