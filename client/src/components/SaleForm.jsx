import { useState } from 'react'
import { createRecord } from '../api'

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:MM" in local time
function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function emptyForm() {
  return {
    customerId: '',
    packageId: '',
    amountPaid: '',
    paymentMode: 'Cash',
    paymentDate: nowLocal(),
    validityStart: '',
    validityEnd: '',
  }
}

function describePackage(pkg) {
  const classes = pkg.numClasses === 'unlimited' ? 'Unlimited classes' : `${pkg.numClasses} classes`
  return `${pkg.packageCategory} / ${pkg.classType} / ${classes}`
}

// Record a sale form. Picking a package fills in its type, price, and
// validity dates, which the manager can still change before saving.
function SaleForm({ customers, packages, onCreated }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedPackage = packages.find((p) => p.packageId === form.packageId)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function selectPackage(packageId) {
    const pkg = packages.find((p) => p.packageId === packageId)
    setForm((prev) => ({
      ...prev,
      packageId,
      amountPaid: pkg ? String(pkg.price) : '',
      validityStart: pkg ? pkg.startDate.slice(0, 10) : '',
      validityEnd: pkg ? pkg.endDate.slice(0, 10) : '',
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setSubmitting(true)

    const { ok, data } = await createRecord('/api/sales', {
      ...form,
      amountPaid: Number(form.amountPaid),
      paymentDate: new Date(form.paymentDate).toISOString(),
    })
    setSubmitting(false)

    if (ok) {
      setSuccessMessage(data.message)
      setForm(emptyForm())
      onCreated(data)
      return
    }

    setError(data.error || 'Something went wrong')
  }

  const missingData = customers.length === 0 || packages.length === 0

  return (
    <div className="card">
      <h2>Record sale</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Customer *
          <select value={form.customerId} onChange={(e) => updateField('customerId', e.target.value)} required>
            <option value="" disabled>
              Select a customer
            </option>
            {customers.map((c) => (
              <option key={c.customerId} value={c.customerId}>
                {c.firstName} {c.lastName} ({c.customerId}) - balance {c.classBalance}
              </option>
            ))}
          </select>
        </label>
        <label>
          Package *
          <select value={form.packageId} onChange={(e) => selectPackage(e.target.value)} required>
            <option value="" disabled>
              Select a package
            </option>
            {packages.map((p) => (
              <option key={p.packageId} value={p.packageId}>
                {p.packageName} ({p.packageId}) - ${p.price}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type of package
          <input value={selectedPackage ? describePackage(selectedPackage) : ''} placeholder="Filled in from the package" readOnly />
        </label>
        <label>
          Amount paid ($) *
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amountPaid}
            onChange={(e) => updateField('amountPaid', e.target.value)}
            required
          />
        </label>
        <label>
          Mode of payment *
          <select value={form.paymentMode} onChange={(e) => updateField('paymentMode', e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Credit card">Credit card</option>
            <option value="Debit card">Debit card</option>
            <option value="Check">Check</option>
          </select>
        </label>
        <label>
          Date and time of payment *
          <input
            type="datetime-local"
            value={form.paymentDate}
            onChange={(e) => updateField('paymentDate', e.target.value)}
            required
          />
        </label>
        <label>
          Validity start *
          <input type="date" value={form.validityStart} onChange={(e) => updateField('validityStart', e.target.value)} required />
        </label>
        <label>
          Validity end *
          <input type="date" value={form.validityEnd} onChange={(e) => updateField('validityEnd', e.target.value)} required />
        </label>
        <p className="empty-state">* Required field</p>
        <button type="submit" disabled={submitting || missingData}>
          Save sale
        </button>
        {missingData && <p className="empty-state">Add at least one customer and one package before recording a sale.</p>}
      </form>

      {error && <p className="notice notice-error">{error}</p>}
      {successMessage && <p className="notice notice-success">{successMessage}</p>}
    </div>
  )
}

export default SaleForm
