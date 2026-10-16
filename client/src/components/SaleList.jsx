// Dates from date inputs are stored as UTC midnight, so format in UTC
// to avoid showing the day before
function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC' })
}

function SaleList({ sales, customers, packages }) {
  if (sales.length === 0) {
    return <p className="empty-state">No sales yet.</p>
  }

  // Sales only store ids, so look the names up from the lists the page already fetched
  function customerName(customerId) {
    const c = customers.find((x) => x.customerId === customerId)
    return c ? `${c.firstName} ${c.lastName}` : customerId
  }

  function packageName(packageId) {
    const p = packages.find((x) => x.packageId === packageId)
    return p ? p.packageName : packageId
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Package</th>
          <th>Paid</th>
          <th>Mode</th>
          <th>Paid on</th>
          <th>Valid</th>
        </tr>
      </thead>
      <tbody>
        {sales.map((s) => (
          <tr key={s.saleId}>
            <td>{s.saleId}</td>
            <td>{customerName(s.customerId)}</td>
            <td>{packageName(s.packageId)}</td>
            <td>${s.amountPaid}</td>
            <td>{s.paymentMode}</td>
            <td>{new Date(s.paymentDate).toLocaleString()}</td>
            <td>
              {formatDate(s.validityStart)} - {formatDate(s.validityEnd)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default SaleList
