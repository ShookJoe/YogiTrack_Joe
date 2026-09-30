import { useEffect, useState } from 'react'
import { fetchList } from '../api'
import PackageForm from '../components/PackageForm'
import PackageList from '../components/PackageList'

// same fetch-on-mount, append-on-create
// pattern as the other pages
function PackagesPage() {
  const [packages, setPackages] = useState([])

  useEffect(() => {
    fetchList('/api/packages').then(setPackages).catch(() => setPackages([]))
  }, [])

  return (
    <div>
      <PackageForm onCreated={(record) => setPackages((prev) => [record, ...prev])} />
      <div className="card">
        <h2>Packages</h2>
        <PackageList packages={packages} />
      </div>
    </div>
  )
}

export default PackagesPage
