import { useEffect } from 'react'
import Layout from './Layout'
import Dashboard from './components/Dashboard'
import Loader from './components/Loader'
import { useAppSelector } from './redux/hooks'

function App() {
  const loading = useAppSelector((state) => state.data.loading)
  useEffect(() => {
    document.title = APP_TITLE
  }, [])
  return (
    <>
      {loading && <Loader />}
      <Layout>
        <Dashboard />
      </Layout>
    </>
  )
}

export default App
