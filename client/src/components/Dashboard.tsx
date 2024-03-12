import { useState, useEffect, useMemo, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Logo from '/logo.svg'
type Product =
  {
    keycode: string
    department: string
    name: string
    barcode: string
    image: string
    epc: string
  }


const Dashboard = () => {

  const [epcs, setEpcs] = useState<Product[]>([])

  const { lastMessage, readyState } = useWebSocket('ws://rpizero.local:8080/ws', {
    reconnectInterval: 1000,
    reconnectAttempts: 1000,
    shouldReconnect: (_closeEvent) => true,
  })

  const getImageUrl = useCallback((product: Product) => {
    return product.image
      ? `https://kmartau.mo.cloudinary.net/${product.image}?tx=w_600,h_600`
      : Logo;
  }, [epcs])


  useEffect(() => {
    if (lastMessage !== null) {
      const mEpcs: Product[] = JSON.parse(lastMessage.data);
      setEpcs(mEpcs)
    }
  }, [lastMessage]);

  const connectionStatusColors = {
    [ReadyState.CONNECTING]: 'bg-yellow-500',
    [ReadyState.OPEN]: 'bg-green-500',
    [ReadyState.CLOSING]: 'bg-orange-500',
    [ReadyState.CLOSED]: 'bg-red-500',
    [ReadyState.UNINSTANTIATED]: 'bg-black',
  }[readyState];

  const connStatus = useMemo(() => {
    const classes = `${connectionStatusColors} rounded-full p-2 justify-center items-center flex`
    return (<span className={classes}><i className='i-mdi-access-point-network text-white' /></span>)
  }
    , [readyState]
  )

  return (
    <div className="m-2 flex flex-col gap-4">
      <div className="flex justify-between border border-gray-300 rounded-lg bg-white items-center p-4">
        <div className="flex gap-4 items-center">
          <div className='w-8'>
            {connStatus}
          </div>
          <div className='font-bold text-6xl'>
            TOTAL PRODUCTS : {epcs.length}
          </div>
        </div>
        <div className="m-2">
          <img src={Logo} alt="Kmart" className="w-36 h-auto" />
        </div>
      </div>
      <div className='mx-auto'>
        {epcs ? <ul className='gap-4 justify-center flex max-lg:flex-col text-base-content flex-wrap'>
          {epcs.map(x => (<li key={x.epc} className="w-[240px] bg-base-100 shadow-xl card-compact rounded-lg">
            <figure><img src={getImageUrl(x)} alt={x.name} className={`rounded-t-lg w-[240px] h-[240px] ${!x.image && 'opacity-25' }`} /></figure>
            <div className="card-body">
              <h2 className="card-title !text-lg">
                {x.name}
              </h2>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">{x.keycode}</div>
                <div className="badge badge-outline !justify-start text-ellipsis text-nowrap overflow-hidden">{x.department}</div>
              </div>
            </div>
          </li>))}
        </ul> : null}
      </div>
    </div>
  )
}

export default Dashboard
