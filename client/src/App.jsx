import { useEffect, useState } from 'react'
import './App.css'
import InstructorsPage from './pages/InstructorsPage'
import CustomersPage from './pages/CustomersPage'
import ClassesPage from './pages/ClassesPage'
import PackagesPage from './pages/PackagesPage'
import Login from './components/Login'
import { checkAuth, clearStoredAuth } from './auth'

// Root component: gates the app behind a login screen when the server
// has APP_USERNAME/APP_PASSWORD configured (see server/middleware/basicAuth.js),
// then acts as a simple tab switcher
// between the three manager facing pages. 
// Each tab unmounts the others, so switching tabs always re-fetches fresh data
function App() {
  const [tab, setTab] = useState('instructors')
  const [authStatus, setAuthStatus] = useState('checking') // checking | none | required | ok

  useEffect(() => {
    checkAuth().then(setAuthStatus)
  }, [])

  if (authStatus === 'checking') {
    return null
  }

  if (authStatus === 'required') {
    return <Login onSuccess={() => setAuthStatus('ok')} />
  }

  function logOut() {
    clearStoredAuth()
    setAuthStatus('required')
  }

  return (
    <div className="app">
      <header>
        <h1>YogiTrack</h1>
        <nav>
          <button className={tab === 'instructors' ? 'active' : ''} onClick={() => setTab('instructors')}>
            Instructors
          </button>
          <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}>
            Customers
          </button>
          <button className={tab === 'classes' ? 'active' : ''} onClick={() => setTab('classes')}>
            Classes
          </button>
          <button className={tab === 'packages' ? 'active' : ''} onClick={() => setTab('packages')}>
            Packages
          </button>
          {authStatus === 'ok' && <button onClick={logOut}>Log out</button>}
        </nav>
      </header>
      <main>
        {tab === 'instructors' && <InstructorsPage />}
        {tab === 'customers' && <CustomersPage />}
        {tab === 'classes' && <ClassesPage />}
        {tab === 'packages' && <PackagesPage />}
      </main>
    </div>
  )
}

export default App
