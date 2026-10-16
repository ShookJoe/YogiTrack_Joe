import { useEffect, useState } from 'react'
import { fetchList } from '../api'
import AttendanceForm from '../components/AttendanceForm'
import AttendanceList from '../components/AttendanceList'

// Record Class Attendance: needs instructors, classes, and customers for the
// form, and updates the customers' balances in local state after a save
function AttendancePage() {
  const [attendance, setAttendance] = useState([])
  const [instructors, setInstructors] = useState([])
  const [classes, setClasses] = useState([])
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    fetchList('/api/attendance').then(setAttendance).catch(() => setAttendance([]))
    fetchList('/api/instructors').then(setInstructors).catch(() => setInstructors([]))
    fetchList('/api/classes').then(setClasses).catch(() => setClasses([]))
    fetchList('/api/customers').then(setCustomers).catch(() => setCustomers([]))
  }, [])

  function handleCreated({ record, customers: updated }) {
    setAttendance((prev) => [record, ...prev])
    setCustomers((prev) =>
      prev.map((c) => {
        const match = updated.find((u) => u.customerId === c.customerId)
        return match ? { ...c, classBalance: match.classBalance } : c
      })
    )
  }

  return (
    <div>
      <AttendanceForm
        instructors={instructors}
        classes={classes}
        customers={customers}
        onCreated={handleCreated}
      />
      <div className="card">
        <h2>Attendance</h2>
        <AttendanceList
          attendance={attendance}
          classes={classes}
          instructors={instructors}
          customers={customers}
        />
      </div>
    </div>
  )
}

export default AttendancePage
