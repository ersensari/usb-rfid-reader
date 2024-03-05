import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import store from './redux/store'
import { Provider } from 'react-redux'
import './assets/styles/main.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <App />
  </Provider>
)
