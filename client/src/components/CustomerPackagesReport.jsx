import { formatDate } from '../format'

function CustomerPackagesReport({ data }) {
  if (data.customers.length === 0) {
    return <p className="empty-state">No customers yet.</p>
  }

  return (
    <div>
      {data.customers.map((c) => (
        <div key={c.customerId} className="report-section">
          <h3>
            {c.name} ({c.customerId}) - class balance {c.classBalance}
          </h3>
          {c.packages.length === 0 ? (
            <p className="empty-state">No packages bought yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Valid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {c.packages.map((p) => (
                  <tr key={p.saleId}>
                    <td>
                      {p.packageName} ({p.packageId})
                    </td>
                    <td>
                      {formatDate(p.validityStart)} - {formatDate(p.validityEnd)}
                    </td>
                    <td>
                      <span className={`status status-${p.status}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}

export default CustomerPackagesReport
