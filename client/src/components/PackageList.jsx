
function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC' })
}

function PackageList({ packages }) {
  if (packages.length === 0) {
    return <p className="empty-state">No packages yet.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>Classes</th>
          <th>Type</th>
          <th>Start</th>
          <th>End</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {packages.map((p) => (
          <tr key={p.packageId}>
            <td>{p.packageId}</td>
            <td>{p.packageName}</td>
            <td>{p.packageCategory}</td>
            <td>{p.numClasses}</td>
            <td>{p.classType}</td>
            <td>{formatDate(p.startDate)}</td>
            <td>{formatDate(p.endDate)}</td>
            <td>${p.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default PackageList
