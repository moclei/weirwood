import browser from 'webextension-polyfill';
import { AngularState, INITIAL_BACKGROUND_STATE, PortState, StorageState } from './app.state';

export class StateSyncService<T extends StorageState> {
    private state: T;
    private instanceStates: PortState = {};
    private onStateChangeListeners: Array<(state: T) => void> = [];

    constructor(private readonly storageKey: string, initialState: T) {
        this.state = initialState;
        this.loadStateFromStorage();
    }

    private async loadStateFromStorage(): Promise<void> {
        console.log('Loading state from storage');
        const storedState = await browser.storage.local.get(this.storageKey);
        if (storedState[this.storageKey]) {
            const allStates = JSON.parse(storedState[this.storageKey]);
            const { instanceStates, ...state } = allStates;
            this.state = state;
            this.instanceStates = instanceStates;
            this.notifyStateChange();
        }
    }

    private async saveStateToStorage(): Promise<void> {
        console.log('saveStateToStorage');
        const persistState = JSON.stringify({ ...this.state, instanceStates: { ...this.instanceStates } });
        await browser.storage.local.set({ [this.storageKey]: persistState });
    }

    public getState(): T {
        return this.state;
    }

    public async setState(newState: Partial<T>): Promise<void> {
        this.state = { ...this.state, ...newState };
        await this.saveStateToStorage();
        this.notifyStateChange();
    }

    public getAppState(tabId: number): T {
        console.log('Getting app state for tabId: ', tabId);
        return { ...this.state, ...this.instanceStates[tabId] };
    }

    public async setAppState(newState: Partial<AngularState>, tabId: number): Promise<void> {
        this.instanceStates = { ...this.instanceStates, [tabId]: { ...this.instanceStates[tabId], ...newState } };
        await this.saveStateToStorage();
        this.notifyStateChange();
    }

    public async removeInstance(tabId: number): Promise<void> {
        if (this.instanceStates.hasOwnProperty(tabId)) {
            console.log('stateSyncService.removeInstance, deleting instance state.')
            delete this.instanceStates[tabId];
        }
        await this.saveStateToStorage();
        this.notifyStateChange();
    }

    public async clearState(): Promise<void> {
        console.log('Clearing state');
        this.state = {
            ...INITIAL_BACKGROUND_STATE,
            version: browser.runtime.getManifest().version,
        } as T;
        this.instanceStates = {};
        await this.saveStateToStorage();
        this.notifyStateChange();
    }

    public onStateChange(listener: (state: T) => void): void {
        this.onStateChangeListeners.push(listener);
    }

    public getInstanceOpenStates(): { port: number, isOpen: boolean }[] {
        const result: Array<{ port: number, isOpen: boolean }> = [];

        for (const [key, value] of Object.entries(this.instanceStates)) {
            const portNumber = Number(key);
            if (!isNaN(portNumber)) {
                result.push({ port: portNumber, isOpen: value.isOpen });
            }
        }

        return result;
    }

    private notifyStateChange(): void {
        // Update computed state properties. Could pass these in as handler functions to the constructor.
        const numOpen = this.getInstanceOpenStates().filter(state => state.isOpen).length;
        const ports = Object.keys(this.instanceStates).map((key: string) => {
            return { tabId: key, isOpen: this.instanceStates[Number(key)].isOpen }
        });
        this.state = { ...this.state, stats: { ...this.state.stats, open: numOpen }, ports: ports };
        // Todo: we pass in this.state to the listener, but the broadcast function that uses it just calls getState(). 
        // Do one or the other.
        this.onStateChangeListeners.forEach(listener => listener(this.state));
    }
}
