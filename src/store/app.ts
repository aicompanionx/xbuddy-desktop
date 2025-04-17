import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Window message type definition
export interface WindowMessage {
    from: string;
    content: string;
    time: Date;
}

// Define application state type
interface AppState {
    // Window related states
    windowId: string | null;
    windowsList: string[];
    selectedWindow: string | null;
    messages: WindowMessage[];

    // Some test data
    counter: number;
    theme: 'light' | 'dark';

    // Operations
    setWindowId: (id: string) => void;
    setWindowsList: (list: string[]) => void;
    selectWindow: (id: string | null) => void;
    addMessage: (message: WindowMessage) => void;
    incrementCounter: () => void;
    toggleTheme: () => void;
}

// Create store
export const useAppStore = create<AppState>()(
    // Use persist middleware for persistent storage
    persist(
        (set) => ({
            // Initial state
            windowId: null as string | null,
            windowsList: [] as string[],
            selectedWindow: null as string | null,
            messages: [] as WindowMessage[],
            counter: 0,
            theme: 'light' as const,

            // Set current window ID
            setWindowId: (id) => set({ windowId: id }),

            // Update window list
            setWindowsList: (list) => set({ windowsList: list }),

            // Select window
            selectWindow: (id) => set({ selectedWindow: id }),

            // Add message
            addMessage: (message) => set((state) => ({
                messages: [message, ...state.messages.slice(0, 49)] // Keep maximum 50 messages
            })),

            // Increment counter
            incrementCounter: () => set((state) => ({ counter: state.counter + 1 })),

            // Toggle theme
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'light' ? 'dark' : 'light'
            })),
        }),
        {
            name: 'electron-app-storage', // Storage key name
            storage: createJSONStorage(() => localStorage), // Use localStorage
            partialize: (state) => ({
                // Only persist these fields
                counter: state.counter,
                theme: state.theme,
                messages: state.messages,
            }),
        }
    )
);