import Router from '@/router'
import { Toaster } from 'sonner'

const App = () => {
  return (
    <div className="app">
      <Router />
      <Toaster position="top-right" />
    </div>
  )
}

export default App
