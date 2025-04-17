import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-xl mb-8 text-[hsl(var(--muted-foreground))]">Page Not Found</p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}

export default NotFound
