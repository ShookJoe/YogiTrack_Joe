import { useState } from 'react'
import { createRecord } from '../api'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  address: '',
  phone: '',
  email: '',
  preferredContact: 'email',
}

// Reusable "add person" form used by both the Instructors and Customer pages
function PersonForm({ label, apiPath, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [duplicatePrompt, setDuplicatePrompt] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Called twice for a duplicate name: once with confirmDuplicate=false
  // the normal submit, and again with true if the manager confirms
  // the "Yes, this is a different person" prompt.
  async function submit(confirmDuplicate) {
    setSubmitting(true)
    setError(null)
    const { ok, status, data } = await createRecord(apiPath, { ...form, confirmDuplicate })
    setSubmitting(false)

    if (ok) {
      setSuccessMessage(data.message)
      setDuplicatePrompt(null)
      setForm(EMPTY_FORM)
      onCreated(data.record)
      return
    }

    if (status === 409 && data.duplicate) {
      setDuplicatePrompt(data.message)
      return
    }

    setError(data.error || 'Something went wrong')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSuccessMessage(null)
    submit(false)
  }

  return (
    <div className="card">
      <h2>Add {label}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          First name *
          <input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required />
        </label>
        <label>
          Last name *
          <input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} required />
        </label>
        <label>
          Address *
          <input value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
        </label>
        <label>
          Phone *
          <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
        </label>
        <label>
          Email *
          <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
        </label>
        <label>
          Preferred contact *
          <select value={form.preferredContact} onChange={(e) => updateField('preferredContact', e.target.value)}>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </label>
        <p className="empty-state">* Required field</p>
        <button type="submit" disabled={submitting}>
          Save {label}
        </button>
      </form>

      {duplicatePrompt && (
        <div className="notice notice-warning">
          <p>{duplicatePrompt}</p>
          <div className="notice-actions">
            <button onClick={() => submit(true)} disabled={submitting}>
              Yes, this is a different person
            </button>
            <button onClick={() => setDuplicatePrompt(null)}>Cancel</button>
          </div>
        </div>
      )}

      {error && <p className="notice notice-error">{error}</p>}
      {successMessage && <p className="notice notice-success">{successMessage}</p>}
    </div>
  )
}

export default PersonForm
