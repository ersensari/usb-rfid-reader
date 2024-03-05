import React from 'react'
import Navbar from './components/Navbar'
interface Props {
  children: React.ReactNode
}
const Layout = (props: Props) => {
  return (
    <div className="container mx-auto">
      <Navbar />
      {props.children}
    </div>
  )
}

export default Layout
