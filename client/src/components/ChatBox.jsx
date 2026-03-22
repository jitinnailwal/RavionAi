import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'
import RavionLogo from './RavionLogo'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

const ChatBox = () => {

  const containerRef = useRef(null)
  const recognitionRef = useRef(null)

  const { selectedChat, theme, user, axios, token, setUser, navigate } = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const promptBeforeVoiceRef = useRef('')

  const toggleListening = () => {
    if (!user) return navigate('/login')
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    // Capture the prompt text before voice starts so we can append to it
    promptBeforeVoiceRef.current = prompt

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognitionRef.current = recognition

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      const base = promptBeforeVoiceRef.current
      const separator = base && !base.endsWith(' ') ? ' ' : ''
      setPrompt(base + separator + transcript)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone permission.')
      } else if (event.error !== 'aborted') {
        toast.error('Speech recognition error: ' + event.error)
      }
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognition.start()
  }

  const onSubmit = async (e) => {
    try {
      e.preventDefault()
      if (!user) return navigate('/login')
      if (loading) return
      setLoading(true)
      const promptCopy = prompt
      setPrompt('')
      setMessages(prev => [...prev, {
        role: 'user', content: prompt, timestamp: Date.now(),
        isImage: false
      }])

      const { data } = await axios.post(`/api/message/${mode}`, { chatId: selectedChat._id, prompt, isPublished },
        { headers: { Authorization: token } })

      if (data.success) {
        setMessages(prev => [...prev, data.reply])
        //minus credit
        if (mode == 'image') {
          setUser(prev => ({ ...prev, credits: prev.credits - 2 }))
        } else {
          setUser(prev => ({ ...prev, credits: prev.credits - 1 }))
        }
      } else {
        toast.error(data.message)
        setPrompt(promptCopy)
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message
      toast.error(msg)
    }finally {
      setPrompt(''),
      setLoading(false)

    }
  }


  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  return (
    <div className='flex-1 flex flex-col h-dvh max-h-dvh mx-3 sm:mx-5 md:mx-10 xl:mx-24 2xl:mx-36 pt-3 sm:pt-5 md:pt-10 max-md:pt-14 pb-3 sm:pb-5 md:pb-10 min-w-0 overflow-hidden'>

      {/* Chat Messages  */}
      <div className='relative flex-1 min-h-0 mb-3 sm:mb-5'>
        <div ref={containerRef} className='absolute inset-0 overflow-y-auto'>
          {messages.length === 0 && (
            <div className='h-full flex flex-col items-center justify-center gap-2 px-4'>
              <RavionLogo size={120} />
              <p className='mt-5 text-4xl sm:text-6xl text-center text-gradient font-semibold'>
                Start your conversation.</p>
            </div>
          )}

          {messages.map((message, index) => <Message key={index} message={message} chatId={selectedChat?._id} />)}

          {/* Three Dots loading  */}
          {
            loading && <div className='loader flex items-center gap-1.5'>
              <div className='w-1.5 h-1.5 rounded-full bg-accent-blue
                    animate-bounce'></div>
              <div className='w-1.5 h-1.5 rounded-full bg-accent-violet
                    animate-bounce'></div>
              <div className='w-1.5 h-1.5 rounded-full bg-accent-blue
                    animate-bounce'></div>
            </div>
          }
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className='absolute bottom-4 left-1/2 -translate-x-1/2 w-9 h-9 flex items-center justify-center
            rounded-full glass glow-gradient cursor-pointer hover:scale-110 active:scale-95
            transition-all duration-200 z-10'
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className='w-5 h-5 text-accent-blue'>
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-3 mb-3 text-sm mx-auto text-text-muted'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type="checkbox" className='cursor-pointer' checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)} />
        </label>
      )}

      {/* Prompt Input Box  */}

      <div className='shrink-0'>
        <form onSubmit={onSubmit} className='glass
          rounded-full w-full max-w-2xl p-2 sm:p-3 pl-3 sm:pl-4 mx-auto flex gap-1.5 sm:gap-4 items-center'>
          <select onChange={(e) => setMode(e.target.value)} value={mode} className='text-xs sm:text-sm pl-1 sm:pl-3 pr-0.5 sm:pr-2 outline-none bg-transparent text-primary shrink-0'>
            <option className='bg-bg-surface' value="text">Text</option>
            <option className='bg-bg-surface' value="image">Image</option>

          </select>
          <input onChange={(e) => setPrompt(e.target.value)} value={prompt} type="text" placeholder='Write your prompt...'
            className='flex-1 min-w-0 text-xs sm:text-sm outline-none bg-transparent text-primary placeholder:text-text-muted' required />

          {/* Mic Button */}
          <button type='button' onClick={toggleListening}
            className={`shrink-0 p-1 sm:p-1.5 rounded-full cursor-pointer transition-colors ${isListening ? 'bg-red-500/20' : 'hover:bg-bg-surface/50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-text-muted'}`}>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </button>

          <button disabled={loading} className='shrink-0'>
            <img src={loading ? assets.stop_icon : assets.send_icon} className='w-6 sm:w-8 cursor-pointer transform transition ease-in-out active:scale-95'
              alt="" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatBox
