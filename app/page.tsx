"use client"

import { AppProvider, useApp } from '@/lib/context'
import { LoginScreen } from '@/components/login-screen'
import { Sidebar, Topbar, ToastContainer } from '@/components/app-shell'
import { DashboardPage } from '@/components/dashboard-page'
import { PosPage } from '@/components/pos-page'
import { ProductsPage } from '@/components/products-page'
import { StockPage } from '@/components/stock-page'
import { TransactionsPage } from '@/components/transactions-page'
import { ReportsPage } from '@/components/reports-page'
import { BranchesPage } from '@/components/branches-page'
import { UsersPage } from '@/components/users-page'

function AppContent() {
  const { currentUser, currentPage } = useApp()

  if (!currentUser) {
    return <LoginScreen />
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    pos: <PosPage />,
    products: <ProductsPage />,
    stock: <StockPage />,
    transactions: <TransactionsPage />,
    reports: <ReportsPage />,
    branches: <BranchesPage />,
    users: <UsersPage />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 230 }} className="app-main">
        <Topbar />
        <main style={{ padding: 24 }}>
          {pages[currentPage] || <DashboardPage />}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

export default function Page() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
