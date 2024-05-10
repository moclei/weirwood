import browser from 'webextension-polyfill';
import { INITIAL_BACKGROUND_STATE, StorageState } from '../models/app.state';
import { StateSyncService, PortManager } from 'weirwood';
import { HttpService } from './services/http.service';


class BackgroundScript {
    private stateSyncService: StateSyncService<StorageState>;
    private portManager: PortManager;
    private httpService: HttpService;


    constructor() {
        console.log("Hello");
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

new BackgroundScript();