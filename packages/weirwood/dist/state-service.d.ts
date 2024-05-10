import { AngularState, StorageState } from './app.state';
export declare class StateSyncService<T extends StorageState> {
    private readonly storageKey;
    private state;
    private instanceStates;
    private onStateChangeListeners;
    constructor(storageKey: string, initialState: T);
    private loadStateFromStorage;
    private saveStateToStorage;
    getState(): T;
    setState(newState: Partial<T>): Promise<void>;
    getAppState(tabId: number): T;
    setAppState(newState: Partial<AngularState>, tabId: number): Promise<void>;
    removeInstance(tabId: number): Promise<void>;
    clearState(): Promise<void>;
    onStateChange(listener: (state: T) => void): void;
    getInstanceOpenStates(): {
        port: number;
        isOpen: boolean;
    }[];
    private notifyStateChange;
}
//# sourceMappingURL=state-service.d.ts.map