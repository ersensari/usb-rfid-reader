import { useEffect } from 'react'
import Layout from './Layout'
import ContentWrapper from './components/ContentWrapper'
import Filters from './components/Filters'
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
        <Filters />
        <ContentWrapper />
      </Layout>
    </>
  )
}

export default App
