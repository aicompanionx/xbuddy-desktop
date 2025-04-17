import { Button } from '@/components/ui/button'

const Home: React.FC = () => {
  // Handler function for creating Live2D window
  const handleCreateLive2D = async () => {
    try {
      // Call electron API to create Live2D window with specific URL
      await window.electronAPI.createLive2DWindow({
        width: 300,
        height: 480,
        hash: '/#/live2d' // Specify URL to load in the new window
      });
    } catch (error) {
      console.error('Failed to create Live2D window:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleCreateLive2D} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        Create Live2D Character
      </Button>
    </div>
  )
}

export default Home
