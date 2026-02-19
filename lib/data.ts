export const BRANCHES = ['Bandung (Pusat)', 'Jakarta', 'Depok']
export const BRANCH_COLORS = ['#B45309', '#1D4ED8', '#15803D']

export const ROLES: Record<string, { label: string; color: string; pages: string[] }> = {
  owner: { label: 'Owner / Direksi', color: 'role-owner', pages: ['dashboard','pos','products','stock','transactions','reports','branches','users'] },
  admin: { label: 'Admin Toko', color: 'role-admin', pages: ['dashboard','pos','products','stock','transactions','reports','branches','users'] },
  finance: { label: 'Finance', color: 'role-finance', pages: ['dashboard','transactions','reports'] },
  head: { label: 'Kepala Toko', color: 'role-head', pages: ['dashboard','pos','products','stock','transactions','reports'] },
  cashier: { label: 'Kasir', color: 'role-cashier', pages: ['pos','transactions'] },
}

export const PERMS: Record<string, string[]> = {
  'Lihat Dashboard': ['owner','admin','finance','head'],
  'Akses POS / Kasir': ['owner','admin','head','cashier'],
  'Tambah Produk': ['owner','admin'],
  'Edit / Hapus Produk': ['owner','admin'],
  'Input Restock': ['owner','admin','head'],
  'Lihat Transaksi': ['owner','admin','finance','head','cashier'],
  'Lihat Laporan': ['owner','admin','finance','head'],
  'Kelola Cabang': ['owner','admin'],
  'Kelola Pengguna': ['owner'],
}

export const CATEGORIES = ['Semua','Bibit Parfum','Campuran / Base','Botol Kosong','Packaging','Aksesoris','Parfum Jadi']

export const CATEGORY_EMOJIS: Record<string, string> = {
  'Bibit Parfum': '🌺',
  'Campuran / Base': '💧',
  'Botol Kosong': '🍶',
  'Packaging': '📦',
  'Aksesoris': '✨',
  'Parfum Jadi': '🧴',
}

export interface User {
  id: number
  name: string
  username: string
  pass: string
  role: string
  branch: string
  phone: string
  active: boolean
  lastLogin: string | null
}

export interface Product {
  id: number
  name: string
  brand: string
  category: string
  unit: string
  buyPrice: number
  sellPrice: number
  stock: number[]
  minStock: number
  desc: string
  img: string | null
}

export interface TransactionItem {
  name: string
  qty: number
  price: number
  unit: string
}

export interface Transaction {
  id: string
  items: TransactionItem[]
  branch: number
  method: string
  cashier: string
  discount: number
  subtotal?: number
  total: number
  date: string
}

export interface CartItem {
  productId: number
  qty: number
}

export interface AppData {
  users: User[]
  products: Product[]
  transactions: Transaction[]
  nextTrxId: number
  nextUserId: number
  nextProductId: number
}

function generateInitialData(): AppData {
  const users: User[] = [
    { id:1, name:'Naufal Majid', username:'naufal', pass:'owner123', role:'owner', branch:'all', phone:'0812-0000-0001', active:true, lastLogin: new Date().toISOString() },
    { id:2, name:'Rina Safitri', username:'rina', pass:'admin123', role:'admin', branch:'all', phone:'0812-0000-0002', active:true, lastLogin: new Date(Date.now()-3600000).toISOString() },
    { id:3, name:'Dian Pratiwi', username:'dian', pass:'finance123', role:'finance', branch:'all', phone:'0812-0000-0003', active:true, lastLogin: new Date(Date.now()-7200000).toISOString() },
    { id:4, name:'Andi Saputra', username:'andi', pass:'kasir123', role:'cashier', branch:'0', phone:'0812-0000-0004', active:true, lastLogin: null },
    { id:5, name:'Siti Rahayu', username:'siti', pass:'kasir456', role:'cashier', branch:'1', phone:'0812-0000-0005', active:true, lastLogin: null },
    { id:6, name:'Budi Santoso', username:'budi', pass:'head123', role:'head', branch:'2', phone:'0812-0000-0006', active:true, lastLogin: null },
  ]

  const products: Product[] = [
    { id:1, name:'Bibit Sauvage', brand:'Dior Grade A', category:'Bibit Parfum', unit:'ml', buyPrice:120000, sellPrice:220000, stock:[80,50,40], minStock:20, desc:'Bibit murni, kuantitas terjamin', img:null },
    { id:2, name:'Bibit Black Opium', brand:'YSL Grade A', category:'Bibit Parfum', unit:'ml', buyPrice:140000, sellPrice:250000, stock:[60,30,25], minStock:15, desc:'Sweet & addictive', img:null },
    { id:3, name:'Bibit Oud Wood', brand:'Tom Ford Grade B', category:'Bibit Parfum', unit:'ml', buyPrice:180000, sellPrice:320000, stock:[40,20,15], minStock:10, desc:'Smoky & warm', img:null },
    { id:4, name:'Base Alkohol Food Grade', brand:'Local', category:'Campuran / Base', unit:'liter', buyPrice:35000, sellPrice:65000, stock:[120,80,90], minStock:30, desc:'Alkohol 96% food grade', img:null },
    { id:5, name:'Base Minyak Jojoba', brand:'Natural', category:'Campuran / Base', unit:'ml', buyPrice:25000, sellPrice:45000, stock:[200,150,160], minStock:50, desc:'Base minyak jojoba premium', img:null },
    { id:6, name:'Botol Kaca 30ml', brand:'Custom', category:'Botol Kosong', unit:'pcs', buyPrice:8000, sellPrice:18000, stock:[500,300,350], minStock:100, desc:'Botol kaca bening + tutup', img:null },
    { id:7, name:'Botol Spray 50ml', brand:'Custom', category:'Botol Kosong', unit:'pcs', buyPrice:12000, sellPrice:25000, stock:[400,250,280], minStock:80, desc:'Botol spray frosted premium', img:null },
    { id:8, name:'Botol Roll-On 10ml', brand:'Custom', category:'Botol Kosong', unit:'pcs', buyPrice:5000, sellPrice:12000, stock:[600,400,500], minStock:150, desc:'Botol roll-on kaca bola besi', img:null },
    { id:9, name:'Kotak Custom Branded', brand:'NM Parfum', category:'Packaging', unit:'pcs', buyPrice:7000, sellPrice:20000, stock:[300,200,220], minStock:60, desc:'Box branded NM Parfum', img:null },
    { id:10, name:'Label Stiker Custom', brand:'NM Parfum', category:'Packaging', unit:'pack', buyPrice:15000, sellPrice:35000, stock:[150,90,100], minStock:30, desc:'Stiker label premium per 50 lembar', img:null },
    { id:11, name:'Pengharum Mobil', brand:'NM Racikan', category:'Aksesoris', unit:'pcs', buyPrice:10000, sellPrice:30000, stock:[200,120,150], minStock:40, desc:'Diffuser parfum mobil', img:null },
    { id:12, name:'Tas Gift Bag', brand:'NM Parfum', category:'Aksesoris', unit:'pcs', buyPrice:4000, sellPrice:12000, stock:[8,5,4], minStock:20, desc:'Kantong kertas premium', img:null },
    { id:13, name:'Parfum Racikan Pria 50ml', brand:'NM Signature', category:'Parfum Jadi', unit:'botol', buyPrice:45000, sellPrice:95000, stock:[50,30,35], minStock:15, desc:'Racikan eksklusif NM untuk pria', img:null },
    { id:14, name:'Parfum Racikan Wanita 50ml', brand:'NM Signature', category:'Parfum Jadi', unit:'botol', buyPrice:45000, sellPrice:95000, stock:[55,35,40], minStock:15, desc:'Racikan eksklusif NM untuk wanita', img:null },
    { id:15, name:'Custom Order Parfum', brand:'NM Custom', category:'Parfum Jadi', unit:'botol', buyPrice:60000, sellPrice:150000, stock:[20,10,8], minStock:5, desc:'Parfum custom sesuai keinginan pelanggan', img:null },
  ]

  const transactions: Transaction[] = []
  let nextTrxId = 1001
  const methods = ['Tunai','QRIS','Transfer','Debit']
  const cashiers = ['Andi','Siti','Budi','Rina']
  const now = Date.now()
  for(let i = 0; i < 20; i++){
    const pIdx = Math.floor(Math.random() * products.length)
    const p = products[pIdx]
    const qty = Math.ceil(Math.random() * 5)
    const branch = Math.floor(Math.random() * 3)
    const disc = [0,0,0,5,10][Math.floor(Math.random() * 5)]
    const total = p.sellPrice * qty * (1 - disc / 100)
    transactions.unshift({
      id: `TRX-${nextTrxId++}`,
      items: [{ name: p.name, qty, price: p.sellPrice, unit: p.unit }],
      branch,
      method: methods[Math.floor(Math.random() * 4)],
      cashier: cashiers[branch] || cashiers[0],
      discount: disc,
      total,
      date: new Date(now - i * 3600000 * 1.5).toISOString(),
    })
  }

  return { users, products, transactions, nextTrxId, nextUserId: 7, nextProductId: 16 }
}

let _data: AppData | null = null

export function getDB(): AppData {
  if (!_data) {
    _data = generateInitialData()
  }
  return _data
}

export function rp(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function shortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function getBranchName(i: number): string {
  return BRANCHES[i] || '—'
}

export function imgOrEmoji(p: Product): string {
  return CATEGORY_EMOJIS[p.category] || '🧴'
}
