import { useState } from 'react'
import { createRecord } from '../api'

const EMPTY_FORM = {
  packageName: '',
  packageCategory: 'General',
  numClasses: '4',
  classType: 'General',
  startDate: '',
  endDate: '',
  price: '',
}

// Add package form 
function PackageForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setSubmitting(true)

    const { ok, data } = await createRecord('/api/packages', {
      ...form,
      price: Number(form.price),
    })
    setSubmitting(false)

    if (ok) {
      setSuccessMessage(data.message)
      setForm(EMPTY_FORM)
      onCreated(data.record)
      return
    }

    setError(data.error || 'Something went wrong')
  }

  return (
    <div className="card">
      <h2>Add package</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Package name
          <input value={form.packageName} onChange={(e) => updateField('packageName', e.target.value)} required />
        </label>
        <label>
          Package category
          <select value={form.packageCategory} onChange={(e) => updateField('packageCategory', e.target.value)}>
            <option value="General">General</option>
            <option value="Senior">Senior</option>
          </select>
        </label>
        <label>
          Number of classes
          <select value={form.numClasses} onChange={(e) => updateField('numClasses', e.target.value)}>
            <option value="1">1</option>
            <option value="4">4</option>
            <option value="10">10</option>
            <option value="unlimited">Unlimited</option>
          </select>
        </label>
        <label>
          Class type
          <select value={form.classType} onChange={(e) => updateField('classType', e.target.value)}>
            <option value="General">General</option>
            <option value="Special">Special</option>
          </select>
        </label>
        <label>
          Start date
          <input type="date" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} required />
        </label>
        <label>
          End date
          <input type="date" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} required />
        </label>
        <label>
          Price ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          Save package
        </button>
      </form>

      {error && <p className="notice notice-error">{error}</p>}
      {successMessage && <p className="notice notice-success">{successMessage}</p>}
    </div>
  )
}

export default PackageForm
