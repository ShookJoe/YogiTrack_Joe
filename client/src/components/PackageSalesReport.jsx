import { formatMoney } from '../format'

function PackageSalesReport({ data }) {
  if (data.rows.length === 0) {
    return <p className="empty-state">No packages yet.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Category</th>
          <th>Classes</th>
          <th>Type</th>
          <th>Price</th>
          <th>Sales</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>
        {data.rows.map((r) => (
          <tr key={r.packageId}>
            <td>
              {r.packageName} ({r.packageId})
            </td>
            <td>{r.packageCategory}</td>
            <td>{r.numClasses}</td>
            <td>{r.classType}</td>
            <td>{formatMoney(r.price)}</td>
            <td>{r.salesCount}</td>
            <td>{formatMoney(r.revenue)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="total-row">
          <td colSpan={5}>Total</td>
          <td>{data.totalSales}</td>
          <td>{formatMoney(data.totalRevenue)}</td>
        </tr>
      </tfoot>
    </table>
  )
}

export default PackageSalesReport
