import browser from 'webextension-polyfill';
import { INITIAL_BACKGROUND_STATE, StorageState } from '../models/app.state';
import StateSyncService from './services/state-service';
import { FetchRequest } from '../models/http.model';

class BackgroundScript {
    private stateSyncService: StateSyncService<StorageState>;
    private portManager: PortManager;
    private httpService: HttpService;

    constructor() {
        console.log("background script constructor called")
        this.stateSyncService = new StateSyncService<StorageState>('BackgroundState', {
            ...INITIAL_BACKGROUND_STATE,
            version: browser.runtime.getManifest().version,
        });

        this.httpService = new HttpService(this.stateSyncService);
        this.portManager = new PortManager(this.stateSyncService);
        this.establishListeners();
    }

    // public setBackgroundState(state: StorageState) {
    //     console.log('setBackgroundState');
    //     this.stateSyncService.setState(state);
    // }

    private establishListeners() {
        browser.action.onClicked.addListener((tab) => {
            browser.tabs.sendMessage(tab.id!, { type: 'toggleApp' });
        });

        browser.runtime.onConnect.addListener(port => {
            if (port.name === 'stateSyncChannel') {
                console.log("Connecting stateSyncChannel");
                const tabId = port.sender!.tab!.id!;
                const tabUrl = port.sender!.tab!.url!;
                this.portManager.addPort(tabId, tabUrl, port);
            }
            if (port.name === 'fetchChannel') {
                console.log("Connecting fetchChannel");
                port.onMessage.addListener(request => {
                    this.httpService.handleFetchRequest(request);
                });
            }
        });
        browser.runtime.onInstalled.addListener(details => {
            console.log('onInstalled listener heard. details: ', details);
            if (details.reason === 'install') {
                this.stateSyncService.clearState();
            }
            if (details.reason === 'update') {
                this.stateSyncService.clearState();
            }
        });
        browser.runtime.onStartup.addListener(() => {
            console.log('onStartup listener heard.');
        });
        browser.runtime.onSuspend.addListener(() => {
            console.log('onSuspend listener heard.');
        });
        browser.runtime.onSuspendCanceled.addListener(() => {
            console.log('onSuspendCanceled listener heard.');
        });
        browser.runtime.onUpdateAvailable.addListener(() => {
            console.log('onUpdateAvailable listener heard.');
        });
    }
}

class PortManager {
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

class HttpService {
    private stateSyncService: StateSyncService<StorageState>;

    constructor(stateSyncService: StateSyncService<StorageState>) {
        this.stateSyncService = stateSyncService;
    }

    public async handleFetchRequest(request: FetchRequest) {
        try {
            const response = await fetch(request.url, {
                method: request.method,
                headers: request.headers,
                body: request.body,
            });

            if (response.ok) {
                const data = await response.json();

                // Update the state based on the response data
                if (request.type === 'card') {
                    this.stateSyncService.setState({
                        ...this.stateSyncService.getState(),
                        magicCard: data,
                    });
                }
            } else {
                console.error('HTTP request failed:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during HTTP request:', error);
        }
    }
}

new BackgroundScript();