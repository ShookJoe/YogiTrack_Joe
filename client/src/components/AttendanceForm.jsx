import { useState } from 'react'
import { createRecord } from '../api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function pad(n) {
  return String(n).padStart(2, '0')
}

function todayLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function nowTime() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Built from the date's parts so the timezone can't shift it to another day
function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return WEEKDAYS[new Date(y, m - 1, d).getDay()]
}

function minutesOf(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function byDayAndTime(a, b) {
  return DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time)
}

// Only a warning, it doesn't stop the save.
// Within an hour of the start counts as a match so the default "now" doesn't warn every time.
function scheduleWarning(cls, date, time) {
  if (!cls || !date || !time) return null
  const day = weekdayOf(date)
  if (day !== cls.day || Math.abs(minutesOf(time) - minutesOf(cls.time)) > 60) {
    return `This class is scheduled for ${cls.day} at ${cls.time}, but the attendance is for ${day} at ${time}.`
  }
  return null
}

// Record attendance form: pick an instructor, one of their classes, then
// add the customers who came
function AttendanceForm({ instructors, classes, customers, onCreated }) {
  const [instructorId, setInstructorId] = useState('')
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(todayLocal)
  const [time, setTime] = useState(nowTime)
  const [attendeeIds, setAttendeeIds] = useState([])
  const [pickId, setPickId] = useState('')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [insufficient, setInsufficient] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const instructorClasses = classes.filter((c) => c.instructorId === instructorId).sort(byDayAndTime)
  const selectedClass = classes.find((c) => c._id === classId)
  const warning = scheduleWarning(selectedClass, date, time)
  const attendees = attendeeIds.map((id) => customers.find((c) => c.customerId === id)).filter(Boolean)
  const addable = customers.filter((c) => !attendeeIds.includes(c.customerId))

  function selectInstructor(id) {
    setInstructorId(id)
    setClassId('')
  }

  function addAttendee() {
    if (!pickId) return
    setAttendeeIds((prev) => [...prev, pickId])
    setPickId('')
    setInsufficient(null)
  }

  function removeAttendee(id) {
    setAttendeeIds((prev) => prev.filter((x) => x !== id))
    setInsufficient(null)
  }

  // Called with true when the instructor chooses to save even though some
  // customers don't have a class left
  async function submit(allowNegative) {
    setSubmitting(true)
    setError(null)
    setInsufficient(null)
    const { ok, status, data } = await createRecord('/api/attendance', {
      classId,
      instructorId,
      date,
      time,
      customerIds: attendeeIds,
      allowNegative,
    })
    setSubmitting(false)

    if (ok) {
      setResult(data)
      setAttendeeIds([])
      setClassId('')
      setDate(todayLocal())
      setTime(nowTime())
      onCreated(data)
      return
    }

    if (status === 409 && data.insufficient) {
      setInsufficient(data)
      return
    }

    setError(data.error || 'Something went wrong')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setResult(null)
    submit(false)
  }

  const missingData = instructors.length === 0 || customers.length === 0

  return (
    <div className="card">
      <h2>Record attendance</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Instructor *
          <select value={instructorId} onChange={(e) => selectInstructor(e.target.value)} required>
            <option value="" disabled>
              Select an instructor
            </option>
            {instructors.map((i) => (
              <option key={i.instructorId} value={i.instructorId}>
                {i.firstName} {i.lastName} ({i.instructorId})
              </option>
            ))}
          </select>
        </label>
        <label>
          Class *
          <select value={classId} onChange={(e) => setClassId(e.target.value)} disabled={!instructorId} required>
            <option value="" disabled>
              {instructorId && instructorClasses.length === 0 ? 'No classes for this instructor' : 'Select a class'}
            </option>
            {instructorClasses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.day} {c.time} ({c.classType})
              </option>
            ))}
          </select>
        </label>
        <label>
          Date *
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Time *
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
        {warning && <p className="notice notice-warning">{warning}</p>}

        <div className="field-group">
          Customers in this class *
          <div className="add-row">
            <select value={pickId} onChange={(e) => setPickId(e.target.value)}>
              <option value="">Select a customer</option>
              {addable.map((c) => (
                <option key={c.customerId} value={c.customerId}>
                  {c.firstName} {c.lastName} ({c.customerId}) - balance {c.classBalance}
                </option>
              ))}
            </select>
            <button type="button" className="btn-secondary" onClick={addAttendee} disabled={!pickId}>
              Add
            </button>
          </div>
          {attendees.length > 0 && (
            <ul className="attendee-list">
              {attendees.map((c) => (
                <li key={c.customerId}>
                  <span>
                    {c.firstName} {c.lastName} ({c.customerId}) - balance {c.classBalance}
                  </span>
                  <button type="button" className="btn-secondary" onClick={() => removeAttendee(c.customerId)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="empty-state">* Required field</p>
        <button type="submit" disabled={submitting || !classId || attendeeIds.length === 0}>
          Save attendance
        </button>
        {missingData && <p className="empty-state">Add an instructor and some customers before recording attendance.</p>}
      </form>

      {insufficient && (
        <div className="notice notice-warning">
          <p>{insufficient.message}</p>
          <ul>
            {insufficient.customers.map((c) => (
              <li key={c.customerId}>
                {c.firstName} {c.lastName} - balance {c.classBalance}
              </li>
            ))}
          </ul>
          <div className="notice-actions">
            <button onClick={() => submit(true)} disabled={submitting}>
              Save anyway (balance goes negative)
            </button>
            <button onClick={() => setInsufficient(null)}>Cancel</button>
          </div>
        </div>
      )}

      {error && <p className="notice notice-error">{error}</p>}
      {result && (
        <div className="notice notice-success">
          <p>{result.message}</p>
          <ul>
            {result.messages.map((m) => (
              <li key={m.customerId}>{m.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default AttendanceForm
