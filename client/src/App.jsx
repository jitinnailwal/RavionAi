import React, { lazy, Suspense, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { assets } from './assets/assets'
import './assets/prism.css'
import { useAppContext } from './context/AppContext'
import {Toaster} from 'react-hot-toast'

// Lazy load all route components
const Sidebar = lazy(() => import('./components/Sidebar'))
const ChatBox = lazy(() => import('./components/ChatBox'))
const Credits = lazy(() => import('./pages/Credits'))
const Profile = lazy(() => import('./pages/Profile'))
const Community = lazy(() => import('./pages/Community'))
const Login = lazy(() => import('./pages/Login'))

const Loading = () => (
  <div className='bg-bg-deep flex items-center justify-center h-screen w-screen'>
    <div className='w-10 h-10 rounded-full border-3 border-accent-blue border-t-transparent animate-spin'></div>
  </div>
)

const RouteLoader = () => (
  <div className='flex-1 flex items-center justify-center'>
    <div className='w-8 h-8 rounded-full border-2 border-accent-blue border-t-transparent animate-spin'></div>
  </div>
)

const App = () => {

  const { loadingUser } = useAppContext()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  if (pathname === '/loading' || loadingUser) return <Loading />

  // Login page is full-screen, no sidebar
  if (pathname === '/login') {
    return (
      <>
        <Toaster/>
        <Suspense fallback={<Loading />}>
          <Login />
        </Suspense>
      </>
    )
  }

  return (
    <>
        <Toaster/>
      {!isMenuOpen && <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8
    cursor-pointer md:hidden not-dark:invert z-30' onClick={() => setIsMenuOpen(true)} />}

      <div className='bg-bg-deep text-primary'>
        <div className='flex h-dvh w-screen overflow-hidden'>
          {/* Mobile overlay backdrop */}
          {isMenuOpen && (
            <div
              className='fixed inset-0 bg-black/50 z-40 md:hidden'
              onClick={() => setIsMenuOpen(false)}
            />
          )}
          <Suspense fallback={null}>
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          </Suspense>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path='/' element={<ChatBox />} />
              <Route path='/credits' element={<Credits />} />
              <Route path='/community' element={<Community />} />
              <Route path='/profile' element={<Profile />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default App
