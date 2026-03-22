import React, { useState, useRef, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../assets/assets'

const Profile = () => {
  const { user, fetchUser, token, axios, setToken, navigate } = useAppContext()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await axios.put('/api/user/update-profile',
        { firstName, lastName },
        { headers: { Authorization: token } }
      )
      if (data.success) {
        toast.success(data.message)
        await fetchUser()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      return toast.error('Please fill in both password fields')
    }
    setChangingPw(true)
    try {
      const { data } = await axios.put('/api/user/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: token } }
      )
      if (data.success) {
        toast.success(data.message)
        setCurrentPassword('')
        setNewPassword('')
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setChangingPw(false)
    }
  }

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be under 5MB')
    }

    setUploadingPic(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const { data } = await axios.put('/api/user/upload-picture',
          { imageBase64: reader.result },
          { headers: { Authorization: token } }
        )
        if (data.success) {
          toast.success(data.message)
          await fetchUser()
        } else {
          toast.error(data.message)
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        setUploadingPic(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const profileImg = user?.profilePicture || assets.user_icon

  return (
    <div className='max-w-2xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12 max-md:pt-16'>
      <h2 className='text-3xl font-semibold text-gradient mb-8'>Profile</h2>

      {/* Profile Picture */}
      <div className='flex flex-col items-center mb-8'>
        <div className='relative group'>
          <img
            src={profileImg}
            alt='Profile'
            className='w-24 h-24 rounded-full object-cover border-2 border-border-subtle'
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPic}
            className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full
            opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
          >
            <span className='text-white text-xs'>{uploadingPic ? 'Uploading...' : 'Change'}</span>
          </button>
          <input
            ref={fileRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handlePictureUpload}
          />
        </div>
        <p className='text-sm text-text-muted mt-2'>{user?.email}</p>
      </div>

      {/* Profile Info */}
      <div className='glass rounded-lg p-6 mb-6'>
        <h3 className='text-lg font-medium text-primary mb-4'>Personal Information</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm text-text-muted mb-1'>First Name</label>
            <input
              type='text'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder='First name'
              className='w-full p-2.5 bg-bg-surface/50 border border-border-subtle rounded-md
              text-primary text-sm outline-none focus:border-accent-blue transition-colors'
            />
          </div>
          <div>
            <label className='block text-sm text-text-muted mb-1'>Last Name</label>
            <input
              type='text'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder='Last name'
              className='w-full p-2.5 bg-bg-surface/50 border border-border-subtle rounded-md
              text-primary text-sm outline-none focus:border-accent-blue transition-colors'
            />
          </div>
        </div>
        <div className='mt-4'>
          <label className='block text-sm text-text-muted mb-1'>Email</label>
          <p className='p-2.5 bg-bg-surface/30 border border-border-subtle rounded-md text-primary text-sm opacity-60'>
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className='mt-5 px-6 py-2 bg-gradient-to-r from-accent-blue to-accent-violet text-white
          text-sm font-medium rounded-md glow-btn active:scale-97 cursor-pointer disabled:opacity-50'
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Change Password */}
      <div className='glass rounded-lg p-6'>
        <h3 className='text-lg font-medium text-primary mb-4'>Change Password</h3>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm text-text-muted mb-1'>Current Password</label>
            <input
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder='Enter current password'
              className='w-full p-2.5 bg-bg-surface/50 border border-border-subtle rounded-md
              text-primary text-sm outline-none focus:border-accent-blue transition-colors'
            />
          </div>
          <div>
            <label className='block text-sm text-text-muted mb-1'>New Password</label>
            <input
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder='Enter new password (min 6 characters)'
              className='w-full p-2.5 bg-bg-surface/50 border border-border-subtle rounded-md
              text-primary text-sm outline-none focus:border-accent-blue transition-colors'
            />
          </div>
        </div>
        <button
          onClick={handleChangePassword}
          disabled={changingPw}
          className='mt-5 px-6 py-2 bg-gradient-to-r from-accent-blue to-accent-violet text-white
          text-sm font-medium rounded-md glow-btn active:scale-97 cursor-pointer disabled:opacity-50'
        >
          {changingPw ? 'Changing...' : 'Change Password'}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem('token')
          setToken(null)
          navigate('/')
          toast.success('Successfully logged out')
        }}
        className='w-full mt-6 mb-8 py-3 border border-red-500/30 text-red-500 rounded-md
        text-sm font-medium hover:bg-red-500/10 transition-colors cursor-pointer active:scale-97'
      >
        Logout
      </button>
    </div>
  )
}

export default Profile
