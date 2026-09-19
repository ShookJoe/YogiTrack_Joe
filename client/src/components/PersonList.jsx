// Table shared by Instructors/Customers pages. extraColumn lets the
// Customers page add its classBalance column without a separate component
function PersonList({ label, idField, records, extraColumn }) {
  if (records.length === 0) {
    return <p className="empty-state">No {label}s yet.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Contact</th>
          <th>Preferred</th>
          {extraColumn && <th>{extraColumn.header}</th>}
        </tr>
      </thead>
      <tbody>
        {records.map((record) => (
          <tr key={record[idField]}>
            <td>{record[idField]}</td>
            <td>{record.firstName} {record.lastName}</td>
            <td>{record.preferredContact === 'email' ? record.email : record.phone}</td>
            <td>{record.preferredContact}</td>
            {extraColumn && <td>{extraColumn.render(record)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default PersonList
