import Logo from '/logo.svg'

const Navbar = () => {
  return (
    <div className="navbar bg-blue-950 text-white shadow w-full">
      <div className="flex-1">
        <img src={Logo} alt="logo" className="w-36 h-auto" />
        <div className="ml-10 text-xl font-bold">{APP_TITLE}</div>
      </div>
      <div className="flex-none gap-2">
        <div className="form-control mr-4">v{APP_VERSION}</div>
      </div>
    </div>
  )
}

export default Navbar
