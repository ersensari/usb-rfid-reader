import React from 'react'
import Navbar from './components/Navbar'
interface Props {
  children: React.ReactNode
}
const Layout = (props: Props) => {
  return (
    <div className="w-full">
      {/* <Navbar /> */}
      {props.children}
    </div>
  )
}

export default Layout
