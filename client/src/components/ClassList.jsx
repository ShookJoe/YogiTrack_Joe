function ClassList({ classes, instructors }) {
  if (classes.length === 0) {
    return <p className="empty-state">No classes scheduled yet.</p>
  }

  // Class documents only store instructorId
  function instructorName(instructorId) {
    const instructor = instructors.find((i) => i.instructorId === instructorId)
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : instructorId
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Day</th>
          <th>Time</th>
          <th>Type</th>
          <th>Instructor</th>
          <th>Pay rate</th>
        </tr>
      </thead>
      <tbody>
        {classes.map((c) => (
          <tr key={c._id}>
            <td>{c.day}</td>
            <td>{c.time}</td>
            <td>{c.classType}</td>
            <td>{instructorName(c.instructorId)}</td>
            <td>${c.payRate}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ClassList
