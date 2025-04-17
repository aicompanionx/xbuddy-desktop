import { Button } from '../button';

interface ScreenAnalysisProps {
    isAnalyzing: boolean;
    analyzeResult: string | null;
    isImageCaptured: boolean;
    onScreenshot: () => Promise<void>;
    onAnalyzeScreen: () => Promise<void>;
}

export function ScreenAnalysis({
    isAnalyzing,
    analyzeResult,
    isImageCaptured,
    onScreenshot,
    onAnalyzeScreen
}: ScreenAnalysisProps) {
    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Screen Analysis</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Button 
                    onClick={onScreenshot}
                    variant="outline"
                    className="w-full"
                >
                    Capture Screen
                </Button>
                
                <Button 
                    onClick={onAnalyzeScreen}
                    variant="default"
                    className="w-full"
                    disabled={!isImageCaptured || isAnalyzing}
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Current Screen'}
                </Button>
            </div>
            
            {isAnalyzing ? (
                <div className="border rounded-md p-4">
                    <div className="w-full h-24 animate-pulse bg-gray-200 rounded-md"></div>
                    <div className="mt-2">
                        <div className="w-full h-4 mt-1 animate-pulse bg-gray-200 rounded-md"></div>
                        <div className="w-4/5 h-4 mt-1 animate-pulse bg-gray-200 rounded-md"></div>
                        <div className="w-3/5 h-4 mt-1 animate-pulse bg-gray-200 rounded-md"></div>
                    </div>
                </div>
            ) : analyzeResult ? (
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{analyzeResult}</pre>
                </div>
            ) : (
                <div className="border rounded-md p-4 text-center text-gray-500">
                    {isImageCaptured ? 'Click "Analyze Current Screen" to start analysis' : 'Please capture screen first'}
                </div>
            )}
        </div>
    );
} 