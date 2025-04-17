import { useAppStore, WindowMessage } from './app';

// Fields that need to be synced
const SYNC_FIELDS = ['counter', 'theme', 'messages'] as const;
type SyncField = typeof SYNC_FIELDS[number];

// Sync state type (only includes fields that need syncing)
interface SyncState {
    counter?: number;
    theme?: 'light' | 'dark';
    messages?: WindowMessage[];
    [key: string]: number | 'light' | 'dark' | WindowMessage[] | undefined;
}

/**
 * Initialize window sync service
 * 
 * This function sets up state synchronization between windows:
 * 1. Listen for state updates from other windows
 * 2. Broadcast state changes from this window to others
 */
export function setupWindowSync() {
    if (typeof window === 'undefined') return;

    // Get store state update method
    const { setWindowId } = useAppStore.getState();

    // Set window ID (from electron)
    window.electronAPI.onWindowId((windowId) => {
        setWindowId(windowId);
    });

    // Listen for state updates from other windows
    window.electronAPI.onWindowMessage('sync-state', (stateUpdate: SyncState) => {
        // Only update allowed sync fields
        const safeUpdate = Object.fromEntries(
            Object.entries(stateUpdate).filter(([key]) =>
                SYNC_FIELDS.includes(key as SyncField)
            )
        );

        // Apply updates
        useAppStore.setState(safeUpdate);
    });

    // Listen for state changes, send updates to other windows
    useAppStore.subscribe((state, prevState) => {
        // Check if any sync fields have changed
        const hasChanges = SYNC_FIELDS.some(field =>
            state[field as keyof typeof state] !== prevState[field as keyof typeof prevState]
        );

        if (hasChanges && state.windowId) {
            // Only extract fields that need syncing
            const syncState: SyncState = {};

            // Handle each sync field based on its type
            if (state.counter !== prevState.counter) {
                syncState.counter = state.counter;
            }

            if (state.theme !== prevState.theme) {
                syncState.theme = state.theme;
            }

            if (state.messages !== prevState.messages) {
                syncState.messages = state.messages;
            }

            // Send message to selected window
            if (state.selectedWindow) {
                window.electronAPI.sendMessageToWindow(
                    state.selectedWindow,
                    'sync-state',
                    syncState
                );
            }
            // Or broadcast message to all windows
            else if (state.windowsList.length > 0) {
                // Send state update to each window
                state.windowsList.forEach(winId => {
                    if (winId !== state.windowId) {
                        window.electronAPI.sendMessageToWindow(
                            winId,
                            'sync-state',
                            syncState
                        );
                    }
                });
            }
        }
    });
}