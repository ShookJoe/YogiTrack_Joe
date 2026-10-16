import { useEffect, useState } from 'react'
import { fetchList } from '../api'
import SaleForm from '../components/SaleForm'
import SaleList from '../components/SaleList'

// Record a Sale: needs customers and packages for the form's dropdowns,
// and updates the customer's balance in local state after a sale
function SalesPage() {
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [packages, setPackages] = useState([])

  useEffect(() => {
    fetchList('/api/sales').then(setSales).catch(() => setSales([]))
    fetchList('/api/customers').then(setCustomers).catch(() => setCustomers([]))
    fetchList('/api/packages').then(setPackages).catch(() => setPackages([]))
  }, [])

  function handleCreated({ record, customerId, classBalance }) {
    setSales((prev) => [record, ...prev])
    setCustomers((prev) => prev.map((c) => (c.customerId === customerId ? { ...c, classBalance } : c)))
  }

  return (
    <div>
      <SaleForm customers={customers} packages={packages} onCreated={handleCreated} />
      <div className="card">
        <h2>Sales</h2>
        <SaleList sales={sales} customers={customers} packages={packages} />
      </div>
    </div>
  )
}

export default SalesPage
