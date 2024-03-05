import '../assets/styles/loader.css'
import { useAppSelector } from '../redux/hooks'

const Loader = () => {
  const { loadingMessage } = useAppSelector((state) => state.data)
  return (
    <div className="w-full top-0 bottom-0 absolute flex justify-center items-center z-30">
      <div className="overlay"></div>
      <div className="absolute w-1/4 text-center p-3 bg-white border border-gray-400">
        <div className="lds-loader">
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div>{loadingMessage}</div>
      </div>
    </div>
  )
}

export default Loader
