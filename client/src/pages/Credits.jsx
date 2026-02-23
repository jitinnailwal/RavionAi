// src/components/Credits.jsx
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { dummyPlans } from '../assets/assets'
import Loading from './Loading'
import toast from 'react-hot-toast'

const Credits = () => {
  const { user } = useAppContext()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // simulate fetch
    setPlans(dummyPlans || [])
    setLoading(false)
  }, [])

  if (loading) return <Loading />

  function openBuy() {
    toast('Credit purchase will be available in the future!', { icon: '🚀' })
  }

  return (
    <div className='max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-3xl font-semibold text-gradient'>Credit Plans</h2>
        <div className='text-right'>
          <div className='text-sm text-text-muted'>Your credits</div>
          <div className='text-2xl font-bold text-accent-blue'>{user?.credits ?? '—'}</div>
        </div>
      </div>

      <div className='flex flex-wrap justify-center gap-8'>
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`glass rounded-lg hover:glow-gradient transition-shadow p-6 w-full sm:w-[300px] flex flex-col
              ${plan._id === 'pro' ? 'border-accent-violet/30' : ''}`}
          >
            <div className='flex-1'>
              <h3 className='text-xl font-semibold text-primary mb-2'>{plan.name}</h3>
              <p className='text-2xl font-bold text-accent-blue mb-4'>
                ₹{plan.price}
                <span className='text-base font-normal text-text-muted'>{' '}/ {plan.credits} credits</span>
              </p>
              <ul className='list-disc list-inside text-sm text-text-muted space-y-1'>
                {plan.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                )) || <li>No features listed</li>}
              </ul>
            </div>

            <button
              onClick={openBuy}
              className='mt-6 bg-gradient-to-r from-accent-blue to-accent-violet text-white font-medium py-2 rounded glow-btn active:scale-97 cursor-pointer'
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Credits
