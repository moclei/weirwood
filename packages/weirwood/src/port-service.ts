import browser from 'webextension-polyfill';
import { StateSyncService } from './state-service';
import { StorageState } from './app.state';

export class PortManager {
    private ports: { [tabId: number]: browser.Runtime.Port } = {};
    public stateSyncService: StateSyncService<StorageState>;

    constructor(stateSyncService: StateSyncService<StorageState>) {
        this.stateSyncService = stateSyncService;
        this.stateSyncService.onStateChange((state: any) => {
            this.broadcastStateUpdate(state);
        });
    }

    public addPort(tabId: number, tabUrl: string, port: browser.Runtime.Port): void {
        this.ports[tabId] = port;
        this.stateSyncService.setAppState({ tabUrl, tabId, initialized: new Date().getTime().toString() }, tabId);
        const state = this.stateSyncService.getState();
        this.stateSyncService.setState({ stats: { ...state.stats, active: Object.keys(this.ports).length } });
        port.onMessage.addListener(message => this.handleMessage(tabId, message));
        port.onDisconnect.addListener(() => {
            console.log('Ports disconnected. tabId: ', tabId);
            delete this.ports[tabId];
            this.stateSyncService.removeInstance(tabId);
        });
        this.sendStateUpdate(tabId);
    }

    private handleMessage(tabId: number, message: any): void {
        if (message.type === 'setState') {
            console.log('handleMessage, setState');
            this.stateSyncService.setAppState(message.state, tabId);
        }
        if (message.type === 'setInstanceState') {
            console.log('handleMessage, setInstanceState');
            this.stateSyncService.setAppState(message.state, message.tabId);
        }
    }

    private sendStateUpdate(tabId: number): void {
        if (this.ports[tabId]) {
            this.ports[tabId].postMessage({
                type: 'stateUpdate',
                state: {
                    ...this.stateSyncService.getAppState(tabId),
                }
            });
        } else {
            console.log('sendStateUpdate: No port for tabId: ', tabId, ' yet.');
        }
    }

    public broadcastStateUpdate(state: any): void {
        console.log('Broadcasting state update');
        Object.keys(this.ports).forEach(tabId => {
            this.sendStateUpdate(Number(tabId))
        });
    }
}
