import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import { CostProvider } from "./Context/CostContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
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
    
  </StrictMode>,
)
