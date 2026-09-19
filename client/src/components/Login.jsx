import { useState } from 'react'
import { encodeCredentials, setStoredAuth } from '../auth'

// Shown instead of the app when the server requires credentials.
// Verifies them by hitting the health endpoint directly rather than duplicating that check.
function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const header = encodeCredentials(username, password)
    const res = await fetch('/api/health', { headers: { Authorization: header } })
    setSubmitting(false)

    if (res.ok) {
      setStoredAuth(header)
      onSuccess()
    } else {
      setError('Incorrect username or password.')
    }
  }

  return (
    <div className="login-screen">
      <div className="card login-card">
        <h1>YogiTrack</h1>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        {error && <p className="notice notice-error">{error}</p>}
      </div>
    </div>
  )
}

export default Login
