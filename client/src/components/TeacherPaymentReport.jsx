import { formatMoney } from '../format'

function TeacherPaymentReport({ data }) {
  if (data.instructors.length === 0) {
    return <p className="empty-state">No classes were recorded in {data.month}.</p>
  }

  return (
    <div>
      <p className="empty-state report-note">
        Pay is the class pay rate times the number of classes taught. A class counts as taught on a day when attendance
        was recorded for it.
      </p>
      {data.instructors.map((i) => (
        <div key={i.instructorId} className="report-section">
          <h3>
            {i.name} ({i.instructorId})
          </h3>
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Type</th>
                <th>Pay rate</th>
                <th>Classes taught</th>
                <th>Check-ins</th>
                <th>Pay</th>
              </tr>
            </thead>
            <tbody>
              {i.classes.map((c) => (
                <tr key={c.classId}>
                  <td>
                    {c.day} {c.time}
                  </td>
                  <td>{c.classType}</td>
                  <td>{formatMoney(c.payRate)}</td>
                  <td>{c.sessions}</td>
                  <td>{c.checkIns}</td>
                  <td>{formatMoney(c.pay)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={5}>Total for {i.name}</td>
                <td>{formatMoney(i.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
      <p className="report-total">
        Total payments for {data.month}: {formatMoney(data.grandTotal)}
      </p>
    </div>
  )
}

export default TeacherPaymentReport
