import React from 'react';
import { VisionAnalyzer } from '../components/ui/vision-analyzer';

export default function VisionPage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Intelligent Vision Control</h1>
            <p className="mb-6 text-gray-700">
                This feature uses screenshots and AI vision analysis technology to let you control your computer through natural language commands.
                Please set up your OpenAI API key first, then you can try analyzing the screen or executing commands.
            </p>
            <VisionAnalyzer className="bg-white rounded-lg shadow-md" />
        </div>
    );
}