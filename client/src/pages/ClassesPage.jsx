import { useEffect, useState } from 'react'
import { fetchList } from '../api'
import ClassForm from '../components/ClassForm'
import ClassList from '../components/ClassList'

// Add a Class: also loads the instructor list so ClassForm can offer a dropdown
function ClassesPage() {
  const [classes, setClasses] = useState([])
  const [instructors, setInstructors] = useState([])

  useEffect(() => {
    fetchList('/api/classes').then(setClasses).catch(() => setClasses([]))
    fetchList('/api/instructors').then(setInstructors).catch(() => setInstructors([]))
  }, [])

  return (
    <div>
      <ClassForm instructors={instructors} onCreated={(record) => setClasses((prev) => [...prev, record])} />
      <div className="card">
        <h2>Class schedule</h2>
        <ClassList classes={classes} instructors={instructors} />
      </div>
    </div>
  )
}

export default ClassesPage
