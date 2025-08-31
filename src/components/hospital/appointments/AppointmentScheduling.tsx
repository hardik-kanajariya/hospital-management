import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AppointmentScheduling() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to the new appointment scheduling component
    navigate('/appointments/schedule', { replace: true })
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Redirecting to Appointments list...</span>
    </div>
  )
}