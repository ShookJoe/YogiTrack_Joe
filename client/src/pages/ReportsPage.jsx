import { useEffect, useState } from 'react'
import { fetchList } from '../api'
import PackageSalesReport from '../components/PackageSalesReport'
import InstructorReport from '../components/InstructorReport'
import CustomerPackagesReport from '../components/CustomerPackagesReport'
import TeacherPaymentReport from '../components/TeacherPaymentReport'

const REPORTS = [
  { key: 'package-sales', label: 'Package sales', View: PackageSalesReport },
  { key: 'instructors', label: 'Instructors and their classes', View: InstructorReport },
  { key: 'customers', label: 'Customers and their packages', View: CustomerPackagesReport },
  { key: 'teacher-payments', label: 'Teacher payments', View: TeacherPaymentReport },
]

function pad(n) {
  return String(n).padStart(2, '0')
}

function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// pick a report and it loads from /api/reports. The browser sends its own date and month so "active/expired"
// and "this month" match the manager's calendar, not the server's.
function ReportsPage() {
  const [report, setReport] = useState('package-sales')
  const [month, setMonth] = useState(() => todayLocal().slice(0, 7))
  const [loaded, setLoaded] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let url = `/api/reports/${report}`
    if (report === 'customers') url += `?today=${todayLocal()}`
    if (report === 'teacher-payments') {
      if (!month) return
      url += `?month=${month}`
    }

    let current = true
    setError(null)
    fetchList(url)
      .then((data) => current && setLoaded({ report, data }))
      .catch(() => current && setError('Could not load the report'))
    return () => {
      current = false
    }
  }, [report, month])

  const selected = REPORTS.find((r) => r.key === report)

  return (
    <div>
      <div className="card">
        <h2>Reports</h2>
        <form>
          <label>
            Report
            <select value={report} onChange={(e) => setReport(e.target.value)}>
              {REPORTS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          {report === 'teacher-payments' && (
            <label>
              Month
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
            </label>
          )}
        </form>
      </div>
      <div className="card">
        <h2>{selected.label}</h2>
        {error && <p className="notice notice-error">{error}</p>}
        {loaded && loaded.report === report ? (
          <selected.View data={loaded.data} />
        ) : (
          !error && <p className="empty-state">Loading...</p>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
