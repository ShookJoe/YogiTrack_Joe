import { useState } from 'react'
import { createRecord } from '../api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const EMPTY_FORM = {
  instructorId: '',
  day: 'Monday',
  time: '09:00',
  classType: 'General',
  payRate: '',
}

// Add-class form. `instructors` populates the dropdown
// passed in from ClassesPage, which fetches it so a class can only
// be scheduled for an instructor that already exists.
function ClassForm({ instructors, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [conflict, setConflict] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Fills the form with a suggested open slot from a 409 response;
  // the manager still has to click Save again to actually submit it
  function applySuggestion(suggestion) {
    setForm((prev) => ({ ...prev, day: suggestion.day, time: suggestion.time }))
    setConflict(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setConflict(null)
    setSubmitting(true)

    const { ok, status, data } = await createRecord('/api/classes', {
      ...form,
      payRate: Number(form.payRate),
    })
    setSubmitting(false)

    if (ok) {
      setSuccessMessage(data.message)
      setForm((prev) => ({ ...EMPTY_FORM, instructorId: prev.instructorId }))
      onCreated(data.record)
      return
    }

    if (status === 409 && data.conflict) {
      setConflict(data)
      return
    }

    setError(data.error || 'Something went wrong')
  }

  return (
    <div className="card">
      <h2>Add class</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Instructor *
          <select value={form.instructorId} onChange={(e) => updateField('instructorId', e.target.value)} required>
            <option value="" disabled>
              Select an instructor
            </option>
            {instructors.map((instructor) => (
              <option key={instructor.instructorId} value={instructor.instructorId}>
                {instructor.firstName} {instructor.lastName} ({instructor.instructorId})
              </option>
            ))}
          </select>
        </label>
        <label>
          Day *
          <select value={form.day} onChange={(e) => updateField('day', e.target.value)}>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </label>
        <label>
          Time *
          <input type="time" value={form.time} onChange={(e) => updateField('time', e.target.value)} required />
        </label>
        <label>
          Class type *
          <select value={form.classType} onChange={(e) => updateField('classType', e.target.value)}>
            <option value="General">General</option>
            <option value="Special">Special</option>
          </select>
        </label>
        <label>
          Pay rate ($) *
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.payRate}
            onChange={(e) => updateField('payRate', e.target.value)}
            required
          />
        </label>
        <p className="empty-state">* Required field</p>
        <button type="submit" disabled={submitting || instructors.length === 0}>
          Save class
        </button>
        {instructors.length === 0 && (
          <p className="empty-state">Add an instructor first before scheduling a class.</p>
        )}
      </form>

      {conflict && (
        <div className="notice notice-warning">
          <p>{conflict.message}</p>
          {conflict.suggestions.length > 0 && (
            <div className="notice-actions">
              {conflict.suggestions.map((s) => (
                <button key={`${s.day}-${s.time}`} onClick={() => applySuggestion(s)}>
                  {s.day} {s.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="notice notice-error">{error}</p>}
      {successMessage && <p className="notice notice-success">{successMessage}</p>}
    </div>
  )
}

export default ClassForm
