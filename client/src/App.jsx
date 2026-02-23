import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Profile from './pages/Profile'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import Login from './pages/Login'
import { useAppContext } from './context/AppContext'
import {Toaster} from 'react-hot-toast'

const App = () => {

  const { user, loadingUser } = useAppContext()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  if (pathname === '/loading' || loadingUser) return <Loading />
  return (
    <>
        <Toaster/>
      {!isMenuOpen && <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8
    cursor-pointer md:hidden not-dark:invert z-30' onClick={() => setIsMenuOpen(true)} />}

      {user ? (
        <div className='bg-bg-deep text-primary'>

          <div className='flex h-screen w-screen overflow-hidden'>
            {/* Mobile overlay backdrop */}
            {isMenuOpen && (
              <div
                className='fixed inset-0 bg-black/50 z-40 md:hidden'
                onClick={() => setIsMenuOpen(false)}
              />
            )}
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path='/' element={<ChatBox />} />
              <Route path='/credits' element={<Credits />} />
              <Route path='/community' element={<Community />} />
              <Route path='/profile' element={<Profile />} />
            </Routes>
          </div>

        </div>
      ) : (
        <Login/>
      )}


    </>
  )
}

export default App
