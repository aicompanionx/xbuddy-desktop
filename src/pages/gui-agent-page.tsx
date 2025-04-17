import React from 'react';
import { GuiAgent } from '@/components/ui/gui-agent';

const GuiAgentPage: React.FC = () => {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">GUI Automation Agent</h1>
            <p className="mb-6 text-gray-700">
                Use AI agents to automate control of your desktop applications. Tell the AI what task you want to perform, and it will analyze the screen and execute the corresponding actions.
            </p>
            
            <GuiAgent />
        </div>
    );
};

export default GuiAgentPage;