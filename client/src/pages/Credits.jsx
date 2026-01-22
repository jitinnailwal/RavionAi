// src/components/Credits.jsx
import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { dummyPlans } from '../assets/assets'
import Loading from './Loading'
import toast from 'react-hot-toast'

const Credits = () => {
  const { user, purchaseCreditsLocal } = useAppContext()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    // simulate fetch
    setPlans(dummyPlans || [])
    setLoading(false)
  }, [])

  if (loading) return <Loading />

  function openBuy(plan) {
    setSelectedPlan(plan)
    setShowModal(true)
  }

  function confirmPurchase() {
    if (!selectedPlan) {
      toast.error('Select a plan first')
      return
    }
    const added = Number(selectedPlan.credits || 0)
    if (added <= 0) {
      toast.error('Invalid plan')
      return
    }
    const newTotal = purchaseCreditsLocal(added) // simulated purchase
    toast.success(`Purchased ${added} credits.`)
    setShowModal(false)
    setSelectedPlan(null)
  }

  return (
    <div className='max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='flex items-center justify-between mb-8'>
        <h2 className='text-3xl font-semibold text-gray-800 dark:text-white'>Credit Plans</h2>
        <div className='text-right'>
          <div className='text-sm text-gray-500'>Your credits</div>
          <div className='text-2xl font-bold text-purple-600 dark:text-purple-300'>{user?.credits ?? '—'}</div>
        </div>
      </div>

      <div className='flex flex-wrap justify-center gap-8'>
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`border border-gray-200 dark:border-purple-700 rounded-lg shadow hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col
              ${plan._id === 'pro' ? 'bg-purple-50 dark:bg-purple-900' : 'bg-white dark:bg-transparent'}`}
          >
            <div className='flex-1'>
              <h3 className='text-xl font-semibold text-gray-800 dark:text-white mb-2'>{plan.name}</h3>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-300 mb-4'>
                ₹{plan.price}
                <span className='text-base font-normal text-gray-600 dark:text-purple-200'>{' '}/ {plan.credits} credits</span>
              </p>
              <ul className='list-disc list-inside text-sm text-gray-700 dark:text-purple-200 space-y-1'>
                {plan.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                )) || <li>No features listed</li>}
              </ul>
            </div>

            <button
              onClick={() => openBuy(plan)}
              className='mt-6 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-2 rounded transition-colors cursor-pointer'
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black opacity-30' onClick={() => setShowModal(false)} />
          <div className='relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 z-60'>
            <h3 className='text-xl font-semibold mb-2'>Confirm Purchase</h3>
            <p className='text-sm text-gray-500 mb-4'>Confirm your purchase to get credits.</p>

            <div className='mb-4'>
              <div className='text-sm text-gray-500'>Plan</div>
              <div className='font-medium text-lg'>{selectedPlan.name}</div>
              <div className='text-sm text-gray-600'>Price: ₹{selectedPlan.price} • Credits: {selectedPlan.credits}</div>
            </div>

            <div className='flex items-center justify-end gap-3'>
              <button onClick={() => setShowModal(false)} className='px-4 py-2 rounded bg-gray-100 cursor-pointer'>Cancel</button>
              <button onClick={confirmPurchase} className='px-4 py-2 rounded bg-purple-600 text-white cursor-pointer'>Confirm Purchase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Credits
