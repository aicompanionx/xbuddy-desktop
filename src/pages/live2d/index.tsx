import { Live2DContainer } from '@/pages/live2d/components/live2d-container'
import { Live2DMenuContextProvider } from '@/contexts/live2d-menu-context'
import { Live2DProvider } from '@/contexts/live2d-context'

const Live2DPage: React.FC = () => {
  return (
    <>
      <Live2DMenuContextProvider>
        <Live2DProvider>
          <Live2DContainer />
        </Live2DProvider>
      </Live2DMenuContextProvider>
    </>
  )
}

export default Live2DPage
