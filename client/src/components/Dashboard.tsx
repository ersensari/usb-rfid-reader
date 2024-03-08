import { useState, useEffect, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

type Product =
  {
    keycode: string
    department: string
    name: string
    barcode: string
    epc: string
    isApparel: boolean
  }


const Dashboard = () => {

  const [epcs, setEpcs] = useState<Product[]>([])

  const { lastMessage, readyState } = useWebSocket('ws://rpizero.local:8080/ws', {
    reconnectInterval: 1000,
    reconnectAttempts: 1000,
    shouldReconnect: (_closeEvent) => true,
  })

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
      <div className="flex gap-4 border border-gray-300 rounded-lg bg-white items-center p-4">
        <div className='w-8'>
          {connStatus}
        </div>
        <div className='font-bold text-6xl'>
          TOTAL PRODUCTS : {epcs.length}
        </div>
      </div>
      <div className='mx-auto'>
        {epcs ? <ul className='gap-4 justify-center flex max-lg:flex-col text-base-content flex-wrap'>
          {epcs.map(x => (<li key={x.epc} className="card w-80 bg-base-100 shadow-xl">
            <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
            <div className="card-body">
              <h2 className="card-title">
                {x.name}
              </h2>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">{x.keycode}</div>
                <div className="badge badge-outline">{x.department}</div>
              </div>
            </div>
          </li>))}
        </ul> : null}
      </div>
    </div>
  )
}

export default Dashboard
