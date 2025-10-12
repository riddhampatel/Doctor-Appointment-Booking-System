import React from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/reactToastify.css';

const App = () => {
  return (
    <div>
      <Login />
      <ToastContainer/>
    </div>
  )
}

export default App