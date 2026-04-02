import './App.css'
import { Outlet } from 'react-router-dom'
import AuthEventListener from './components/common/AuthEventListener'

function App() {
  return (
    <>
      <AuthEventListener />
      <Outlet />
    </>
  )
}

export default App