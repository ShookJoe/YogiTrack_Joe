import { useEffect, useState } from 'react'
import { fetchList } from '../api'
import PersonForm from '../components/PersonForm'
import PersonList from '../components/PersonList'

// Add a Customer: same pattern as InstructorsPage, plus the classBalance column
function CustomersPage() {
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    fetchList('/api/customers').then(setCustomers).catch(() => setCustomers([]))
  }, [])

  return (
    <div className="page">
      <PersonForm
        label="customer"
        apiPath="/api/customers"
        onCreated={(record) => setCustomers((prev) => [record, ...prev])}
      />
      <div className="card">
        <h2>Customers</h2>
        <PersonList
          label="customer"
          idField="customerId"
          records={customers}
          extraColumn={{ header: 'Class balance', render: (record) => record.classBalance }}
        />
      </div>
    </div>
  )
}

export default CustomersPage
