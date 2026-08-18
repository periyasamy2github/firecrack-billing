import type { Product, ProductCategory } from '../types'
import type { PillTone } from '../components/StatusPill'

export const products: Product[] = [
  { code: 'SPK-30', name: 'Sparklers 30cm (10 pkt)', category: 'Sparklers', hsn: '3604 90 00', unit: 'packet', mrp: 180, gstRate: 18, stock: 4, lowStockThreshold: 15 },
  { code: 'SPK-15', name: 'Sparklers 15cm (10 pkt)', category: 'Sparklers', hsn: '3604 90 00', unit: 'packet', mrp: 110, gstRate: 18, stock: 62, lowStockThreshold: 15 },
  { code: 'SPK-COL', name: 'Colour Sparklers (10 pkt)', category: 'Sparklers', hsn: '3604 90 00', unit: 'packet', mrp: 150, gstRate: 18, stock: 48, lowStockThreshold: 15 },
  { code: 'FLP-07S', name: '7cm Flower Pot (Special)', category: 'Flower Pots', hsn: '3604 10 00', unit: 'box of 10', mrp: 350, gstRate: 18, stock: 142, lowStockThreshold: 15 },
  { code: 'FLP-05', name: '5cm Flower Pot', category: 'Flower Pots', hsn: '3604 10 00', unit: 'box of 10', mrp: 220, gstRate: 18, stock: 96, lowStockThreshold: 15 },
  { code: 'FLP-09J', name: '9cm Flower Pot (Jumbo)', category: 'Flower Pots', hsn: '3604 10 00', unit: 'box of 5', mrp: 480, gstRate: 18, stock: 33, lowStockThreshold: 15 },
  { code: 'CHK-15', name: 'Ground Chakkar 15cm', category: 'Chakkar', hsn: '3604 10 00', unit: 'box of 10', mrp: 420, gstRate: 18, stock: 14, lowStockThreshold: 15 },
  { code: 'CHK-10', name: 'Ground Chakkar 10cm', category: 'Chakkar', hsn: '3604 10 00', unit: 'box of 10', mrp: 300, gstRate: 18, stock: 71, lowStockThreshold: 15 },
  { code: 'CHK-WHL', name: 'Wheel Chakkar (Deluxe)', category: 'Chakkar', hsn: '3604 10 00', unit: 'box of 5', mrp: 380, gstRate: 18, stock: 44, lowStockThreshold: 15 },
  { code: 'RKT-F5', name: 'Fancy Rocket (5 pcs)', category: 'Rockets', hsn: '3604 90 00', unit: 'box of 12', mrp: 550, gstRate: 18, stock: 11, lowStockThreshold: 15 },
  { code: 'RKT-WHS', name: 'Whistling Rocket (10 pcs)', category: 'Rockets', hsn: '3604 90 00', unit: 'box of 10', mrp: 420, gstRate: 18, stock: 58, lowStockThreshold: 15 },
  { code: 'RKT-SKY', name: 'Sky Shot Rocket (Single)', category: 'Rockets', hsn: '3604 90 00', unit: 'piece', mrp: 90, gstRate: 18, stock: 210, lowStockThreshold: 40 },
  { code: 'LKD-BG', name: 'Lakshmi Deepam (Big)', category: 'Bombs', hsn: '3604 10 00', unit: 'box of 10', mrp: 480, gstRate: 18, stock: 6, lowStockThreshold: 15 },
  { code: 'BJL-100', name: "Bijili Crackers 100's", category: 'Bombs', hsn: '3604 10 00', unit: 'box', mrp: 260, gstRate: 18, stock: 88, lowStockThreshold: 15 },
  { code: 'ATOM-BM', name: 'Atom Bomb', category: 'Bombs', hsn: '3604 10 00', unit: 'box of 10', mrp: 600, gstRate: 18, stock: 27, lowStockThreshold: 15 },
  { code: 'TWK-05', name: 'Twinkling Star 5cm', category: 'Fancy', hsn: '3604 90 00', unit: 'packet', mrp: 120, gstRate: 18, stock: 306, lowStockThreshold: 30 },
  { code: 'FCY-PEA', name: 'Peacock Fountain', category: 'Fancy', hsn: '3604 90 00', unit: 'piece', mrp: 340, gstRate: 18, stock: 39, lowStockThreshold: 15 },
  { code: 'FCY-COL', name: 'Colour Smoke (Set of 4)', category: 'Fancy', hsn: '3604 90 00', unit: 'set', mrp: 260, gstRate: 18, stock: 74, lowStockThreshold: 15 },
  { code: 'GFT-D40', name: 'Gift Box — Deluxe 40', category: 'Gift Boxes', hsn: '9505 90 90', unit: 'box', mrp: 2400, gstRate: 18, stock: 15, lowStockThreshold: 15 },
  { code: 'GFT-F60', name: 'Gift Box — Family 60', category: 'Gift Boxes', hsn: '9505 90 90', unit: 'box', mrp: 3600, gstRate: 18, stock: 22, lowStockThreshold: 10 },
  { code: 'GFT-MN20', name: 'Gift Box — Mini 20', category: 'Gift Boxes', hsn: '9505 90 90', unit: 'box', mrp: 1200, gstRate: 18, stock: 51, lowStockThreshold: 15 },
]

export const findProduct = (code: string): Product | undefined =>
  products.find((p) => p.code === code)

export const productCategories: ProductCategory[] = ['Sparklers', 'Flower Pots', 'Chakkar', 'Rockets', 'Bombs', 'Fancy', 'Gift Boxes']

export const stockStatus = (p: Product): { label: string; tone: PillTone } => {
  if (p.stock <= p.lowStockThreshold / 2) return { label: 'Low', tone: 'due' }
  if (p.stock <= p.lowStockThreshold) return { label: 'Reorder', tone: 'hold' }
  return { label: 'In stock', tone: 'paid' }
}
