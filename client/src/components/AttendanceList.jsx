// The attendance date is stored as UTC midnight, so format it in UTC
function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC' })
}

function AttendanceList({ attendance, classes, instructors, customers }) {
  if (attendance.length === 0) {
    return <p className="empty-state">No attendance recorded yet.</p>
  }

  // Records only store ids, so look the names up from the lists the page already fetched
  function classLabel(classId) {
    const c = classes.find((x) => x._id === classId)
    return c ? `${c.day} ${c.time}` : classId
  }

  function instructorName(instructorId) {
    const i = instructors.find((x) => x.instructorId === instructorId)
    return i ? `${i.firstName} ${i.lastName}` : instructorId
  }

  function customerNames(customerIds) {
    return customerIds
      .map((id) => {
        const c = customers.find((x) => x.customerId === id)
        return c ? `${c.firstName} ${c.lastName}` : id
      })
      .join(', ')
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Class</th>
          <th>Instructor</th>
          <th>Date</th>
          <th>Time</th>
          <th>Customers</th>
        </tr>
      </thead>
      <tbody>
        {attendance.map((a) => (
          <tr key={a.attendanceId}>
            <td>{a.attendanceId}</td>
            <td>{classLabel(a.classId)}</td>
            <td>{instructorName(a.instructorId)}</td>
            <td>{formatDate(a.date)}</td>
            <td>{a.time}</td>
            <td>{customerNames(a.customerIds)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default AttendanceList
