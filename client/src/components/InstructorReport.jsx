import { formatMoney } from '../format'

function InstructorReport({ data }) {
  if (data.instructors.length === 0) {
    return <p className="empty-state">No instructors yet.</p>
  }

  return (
    <div>
      {data.instructors.map((i) => (
        <div key={i.instructorId} className="report-section">
          <h3>
            {i.name} ({i.instructorId}) - {i.totalCheckIns} check-ins
          </h3>
          {i.classes.length === 0 ? (
            <p className="empty-state">No classes scheduled.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Pay rate</th>
                  <th>Check-ins</th>
                </tr>
              </thead>
              <tbody>
                {i.classes.map((c) => (
                  <tr key={c.classId}>
                    <td>{c.day}</td>
                    <td>{c.time}</td>
                    <td>{c.classType}</td>
                    <td>{formatMoney(c.payRate)}</td>
                    <td>{c.checkIns}</td>
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

export default InstructorReport
