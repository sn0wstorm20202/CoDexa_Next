import { useState, useEffect } from 'react'
import { api } from './lib/api'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.checkHealth()
        setHealth(data)
      } catch (error) {
        console.error('Health check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          CoDexa Full-Stack App
        </h1>
        
        {loading ? (
          <div className="text-gray-600">Checking backend connection...</div>
        ) : health ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Backend connected</span>
            </div>
            <p className="text-sm text-gray-500">
              Status: {health.status}
            </p>
            <p className="text-sm text-gray-500">
              Uptime: {Math.floor(health.uptime)}s
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Backend disconnected</span>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-900">
            ✨ This app is connected to a backend API running on port 8000
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
