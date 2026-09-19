import { useEffect, useState } from 'react'
import { fetchList } from '../api'
import PersonForm from '../components/PersonForm'
import PersonList from '../components/PersonList'

// Add an Instructor: fetches the current list once on mount, 
// then appends new records locally as they are created
function InstructorsPage() {
  const [instructors, setInstructors] = useState([])

  useEffect(() => {
    fetchList('/api/instructors').then(setInstructors).catch(() => setInstructors([]))
  }, [])

  return (
    <div className="page">
      <PersonForm
        label="instructor"
        apiPath="/api/instructors"
        onCreated={(record) => setInstructors((prev) => [record, ...prev])}
      />
      <div className="card">
        <h2>Instructors</h2>
        <PersonList label="instructor" idField="instructorId" records={instructors} />
      </div>
    </div>
  )
}

export default InstructorsPage
