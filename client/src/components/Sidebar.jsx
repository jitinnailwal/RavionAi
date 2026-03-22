import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import toast from 'react-hot-toast'

const timeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};
import RavionLogo from './RavionLogo'

// minimal import to show local credits fallback
import { getStoredCredits } from '../components/creditService'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {

    const {chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUsersChats, setToken, token} = useAppContext()
    const [search, setSearch] = useState('')
    const [collapsed, setCollapsed] = useState(false)

    const logout = () => {
      localStorage.removeItem('token')
      setToken(null)
      toast.success('Successfully logged out')
    }

    const deleteChat = async (e, chatId) =>{
        try {
          e.stopPropagation()
          const confirm = window.confirm('Are you sure you want to delete this chat?')
          if(!confirm) return
          const {data} = await axios.post('/api/chat/delete', {chatId}, {
            headers: {Authorization: token }})

            if(data.success){
              setChats(prev => prev.filter(chat => chat._id !== chatId))
              await fetchUsersChats()
              toast.success(data.message)
            }
        } catch (error) {
          toast.success(error.message)
        }
    }

  return (
    <div className={`flex flex-col h-dvh shrink-0 p-4 glass
  transition-all duration-300 max-md:fixed max-md:top-0 left-0 z-50 max-md:h-dvh max-md:shadow-2xl
  ${collapsed ? 'w-16' : 'w-72'} ${!isMenuOpen && 'max-md:-translate-x-full'}`}>
        {/* Logo + Toggle */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <RavionLogo size={40} />
            {!collapsed && <span className='text-lg font-bold tracking-widest text-gradient uppercase'>Ravion AI</span>}
          </div>
          <button onClick={() => setCollapsed(!collapsed)}
            className='p-1.5 rounded-md hover:bg-bg-surface/50 transition-colors cursor-pointer max-md:hidden'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`w-5 h-5 text-text-muted transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

      {/* Collapsible content */}
      {!collapsed ? (
        <>
        {/* New Chat Button - redirects to login if not authenticated */}
        <button onClick={() => user ? createNewChat() : navigate('/login')} className='flex justify-center items-center w-full py-2 mt-10 text-white
        bg-gradient-to-r from-accent-blue to-accent-violet text-sm rounded-md cursor-pointer
        glow-btn active:scale-97'>
          <span className='mr-2 text-xl'>+</span> New Chat
        </button>

        {/* Search & Chats - only for logged in users */}
        {user && (
          <>
            {/* Search Conversations */}
            <div className='flex items-center gap-2 p-3 mt-4 border border-border-subtle
            rounded-md'>
               <img src={assets.search_icon} className='w-4 not-dark:invert' alt="" />
               <input onChange={(e)=> setSearch(e.target.value)} value={search} type="text"
               placeholder="Search Conversations" className='text-xs bg-transparent
               placeholder:text-text-muted text-primary outline-none'/>
            </div>

            {/* Recent Chats */}
            {chats.length > 0 && <p className='mt-4 text-sm text-text-muted'>Recent Chats </p>}

            <div className='flex-1 overflow-y-auto mt-3 text-sm space-y-3 min-h-0'>
              {
                chats.filter((chat)=> chat.messages[0] ? chat.messages[0]?.content.
                toLowerCase().includes(search.toLowerCase()) : chat.name.toLowerCase().
              includes(search.toLowerCase())).map((chat)=>(

                <div onClick={()=> {navigate('/'); setSelectedChat(chat);
                  setIsMenuOpen(false)
                }}
                key={chat._id} className='p-2 px-4 bg-bg-surface/40 border
                border-border-subtle rounded-md cursor-pointer flex justify-between group
                hover:bg-bg-surface/70 transition-colors'>
                  <div>
                    <p className='truncate w-full text-primary'>
                      {chat.messages.length > 0 ? chat.messages[0].content.slice(0,32) : chat.name}
                    </p>

                    <p className='text-xs text-text-muted'>
                      {timeAgo(chat.updatedAt)}
                    </p>
                  </div>
                  <img src={assets.bin_icon} className='hidden group-hover:block w-4
                  cursor-pointer not-dark:invert' alt="" onClick={e=> toast.promise(deleteChat(e,chat._id),
                  {loading:'deleting...'})} />
                 </div>
              ))
              }
            </div>
          </>
        )}

        {/* Spacer when not logged in */}
        {!user && <div className='flex-1' />}

      {/* Community Images */}
      <div onClick={()=> {navigate('/community'); setIsMenuOpen (false)}} className='flex items-center gap-2 p-3 mt-4 border border-border-subtle
      rounded-md cursor-pointer hover:bg-bg-surface/50 transition-all'>
        <img src={assets.gallery_icon} className='w-4.5 not-dark:invert' alt="" />
        <div className='flex flex-col text-sm'>
          <p className='text-primary'>Community Images</p>
        </div>
      </div>

      {/* Credit Purchase Option */}
      {user && (
        <div onClick={()=> {navigate('/credits'); setIsMenuOpen (false)}} className='flex items-center gap-2 p-3 mt-4 border border-border-subtle
        rounded-md cursor-pointer hover:bg-bg-surface/50 transition-all'>
          <img src={assets.diamond_icon} className='w-4.5 dark:invert' alt="" />
          <div className='flex flex-col text-sm'>
            <p className='text-primary'>Credits : {user?.credits ?? getStoredCredits()}</p>
            <p className='text-xs text-text-muted'>Purchase credits to use ravion ai</p>
          </div>
        </div>
      )}

      {/* Dark Mode Toggle */}
      <div className='flex items-center justify-between gap-2 p-3 mt-4 border border-border-subtle
      rounded-md'>
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.theme_icon} className='w-4 not-dark:invert' alt=""/>
          <p className='text-primary'>Dark Mode</p>
        </div>
        <label className="relative inline-flex cursor-pointer">
          <input onChange={()=> setTheme(theme==='dark' ? 'light' : 'dark')}
          type='checkbox' className='sr-only peer' checked={theme === 'dark'}/>
          <div className='w-9 h-5 bg-bg-surface rounded-full peer-checked:bg-accent-blue transition-all'></div>
          <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform
          peer-checked:translate-x-4'></span>
        </label>
      </div>

      {/* User Account / Login Button */}
      {user ? (
        <div onClick={()=> {navigate('/profile'); setIsMenuOpen(false)}} className='flex items-center gap-3 p-3 mt-4 border border-border-subtle
        rounded-md cursor-pointer group hover:bg-bg-surface/50 transition-all'>
          <img src={user?.profilePicture || assets.user_icon} className='w-7 h-7 rounded-full object-cover' alt="" />
          <p className='flex-1 text-sm text-primary truncate'>{user.name}</p>
          <img onClick={(e)=> {e.stopPropagation(); logout()}} src={assets.logout_icon} className='h-5 cursor-pointer hidden not-dark:invert group-hover:block'/>
        </div>
      ) : (
        <button onClick={()=> {navigate('/login'); setIsMenuOpen(false)}}
          className='flex justify-center items-center w-full py-2.5 mt-4 text-white
          bg-gradient-to-r from-accent-blue to-accent-violet text-sm rounded-md cursor-pointer
          glow-btn active:scale-97'>
          Login / Sign Up
        </button>
      )}
        </>
      ) : (
        /* Collapsed icon buttons */
        <div className='flex flex-col items-center gap-3 mt-6 flex-1'>
          <button onClick={() => user ? createNewChat() : navigate('/login')}
            className='w-9 h-9 flex items-center justify-center rounded-md bg-gradient-to-r from-accent-blue to-accent-violet text-white cursor-pointer glow-btn active:scale-97'
            title='New Chat'>
            <span className='text-lg'>+</span>
          </button>
          <button onClick={()=> navigate('/community')}
            className='w-9 h-9 flex items-center justify-center rounded-md border border-border-subtle hover:bg-bg-surface/50 transition-colors cursor-pointer'
            title='Community'>
            <img src={assets.gallery_icon} className='w-4 not-dark:invert' alt="" />
          </button>
          {user && (
            <button onClick={()=> navigate('/credits')}
              className='w-9 h-9 flex items-center justify-center rounded-md border border-border-subtle hover:bg-bg-surface/50 transition-colors cursor-pointer'
              title='Credits'>
              <img src={assets.diamond_icon} className='w-4 dark:invert' alt="" />
            </button>
          )}
          <div className='flex-1' />
          <button onClick={()=> setTheme(theme==='dark' ? 'light' : 'dark')}
            className='w-9 h-9 flex items-center justify-center rounded-md border border-border-subtle hover:bg-bg-surface/50 transition-colors cursor-pointer'
            title='Toggle Theme'>
            <img src={assets.theme_icon} className='w-4 not-dark:invert' alt="" />
          </button>
          {user ? (
            <button onClick={()=> navigate('/profile')}
              className='w-9 h-9 flex items-center justify-center rounded-md border border-border-subtle hover:bg-bg-surface/50 transition-colors cursor-pointer'
              title='Profile'>
              <img src={user?.profilePicture || assets.user_icon} className='w-6 h-6 rounded-full object-cover' alt="" />
            </button>
          ) : (
            <button onClick={()=> navigate('/login')}
              className='w-9 h-9 flex items-center justify-center rounded-md bg-gradient-to-r from-accent-blue to-accent-violet text-white cursor-pointer glow-btn active:scale-97'
              title='Login'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='w-4 h-4'>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" x2="3" y1="12" y2="12"/>
              </svg>
            </button>
          )}
        </div>
      )}

      <img onClick={()=> setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5
      cursor-pointer md:hidden not-dark:invert' alt='' />

    </div>
  )
}

export default Sidebar
