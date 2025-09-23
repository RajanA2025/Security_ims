import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './index.css'
import { CostProvider } from "./Context/CostContext";
// import "../dist/output.css"

createRoot(document.getElementById('root')).render(

  <ConfigProvider
    theme={{
      token: {
        fontFamily: " Roboto, sans-serif",
        fontSize: 16
      }
    }}
  >
    <CostProvider>
      <App />
    </CostProvider>
  </ConfigProvider>

)
