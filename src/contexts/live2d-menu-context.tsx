import { createContext, ReactNode, useContext, useState } from 'react'

interface Live2DMenuContextType {
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
}

interface Live2DMenuContextProviderProps {
  children: ReactNode
}

const Live2DMenuContext = createContext<Live2DMenuContextType | undefined>(undefined)

export const Live2DMenuContextProvider = ({ children }: Live2DMenuContextProviderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return <Live2DMenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>{children}</Live2DMenuContext.Provider>
}

export const useLive2DMenu = () => {
  return useContext(Live2DMenuContext)
}
