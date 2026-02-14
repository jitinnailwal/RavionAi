import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { dummyChats, dummyUserData } from "../assets/assets";
import axios from 'axios'
import toast from "react-hot-toast";

// CREDIT SERVICE

import {
  getStoredCredits,
  setStoredCredits,
  addCredits as addCreditsLocal,
} from '../components/creditService'

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL || 'https://ravionai-server.vercel.app'


const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const [loadingUser, setLoadingUser] = useState(true)

    const fetchUser = async () => {
        try {
           const { data } = await axios.get('/api/user/data', {headers: {Authorization: token}})
            if(data.success){
                setUser(data.user)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }finally{
            setLoadingUser(false)
        }
    }

    const createNewChat = async () => {
        try {

            if(!user) return toast("Login to create a new chat")
            navigate('/')
        await axios.get('api/chat/create', {headers: {Authorization: token}})
        await fetchUsersChats()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUsersChats = async () => {
        try {
            const {data} = await axios.get('/api/chat/get', {headers: {Authorization: token}})
            if(data.success){
                setChats(data.chats)
                // if user has no chat , create one
                if(data.chats.length === 0){
                    await createNewChat();
                    return fetchUsersChats
                }else{
                    setSelectedChat(data.chats[0])
                }
            }
            else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=> {
        if(theme === 'dark'){
            document.documentElement.classList.add('dark');
        } else{
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme)
    },[theme])

    useEffect(()=>{
        if(user){
            fetchUsersChats()
        } else{
            setChats([])
            setSelectedChat(null)
        }
    },[user])

    useEffect(()=>{
        if(token){
            fetchUser()
        }else{
            setUser(null)
            setLoadingUser(false)
        }
    },[token])

    
    useEffect(() => {
      const onCreditsChanged = (e) => {
        const newCredits = e?.detail?.credits ?? getStoredCredits()
        setUser(prev => ({ ...(prev || {}), credits: newCredits }))
      }
      window.addEventListener('ravion_credits_changed', onCreditsChanged)

      const onStorage = (e) => {
        if (e.key === 'ravion_credits_v1') {
          const cur = getStoredCredits()
          setUser(prev => ({ ...(prev || {}), credits: cur }))
        }
      }
      window.addEventListener('storage', onStorage)

      return () => {
        window.removeEventListener('ravion_credits_changed', onCreditsChanged)
        window.removeEventListener('storage', onStorage)
      }
    }, [])

    // Minimal purchase helper: persist to server if logged in, else local-only
    const purchaseCreditsLocal = async (amount) => {
      const n = Number(amount || 0)
      if (!n || n <= 0) {
        toast.error('Invalid amount')
        return null
      }

      if (token) {
        try {
          const res = await axios.post('/api/credits/purchase', { amount: n }, { headers: { Authorization: token } })
          if (res?.data?.success) {
            const newCredits = res.data.credits
            setUser(prev => ({ ...(prev || {}), credits: newCredits }))
            try { setStoredCredits(newCredits) } catch (e) {"Failed to write credits to localStorage", e}
            toast.success('Credits purchased')
            return newCredits
          } else {
            toast.error(res?.data?.message || 'Purchase failed on server. Saved locally.')
          }
        } catch (err) {
          console.error('purchaseCreditsLocal server error', err)
          toast.error(err?.response?.data?.message || err.message || 'Server error; credits saved locally.')
        }
      }

     
      try {
        const newTotal = addCreditsLocal(n)
        setUser(prev => ({ ...(prev || {}), credits: newTotal }))
        toast.success(`Purchased ${n} credits (local). Balance: ${newTotal}`)
        return newTotal
      } catch (localErr) {
        console.error('purchaseCreditsLocal local error', localErr)
        toast.error('Could not save credits locally.')
        return null
      }
    }

    const value = {
        navigate, user, setUser, fetchUser, chats, setChats, selectedChat, setSelectedChat, theme, setTheme,
        createNewChat, loadingUser, setToken, fetchUsersChats, token, axios,
        // expose minimal credit helper
        purchaseCreditsLocal,
    }

    return (
        <AppContext.Provider value={value}>
            {children} 
        </AppContext.Provider>      
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = ()=> useContext(AppContext)
