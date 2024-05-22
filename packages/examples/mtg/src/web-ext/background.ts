import browser from 'webextension-polyfill';
import { create, Weirwood } from 'weirwood';
import { HttpService } from './services/http.service';
import { StateConfig } from './weirwood/config';

class BackgroundScript {
    // private stateSyncService: StateSyncService<StorageState>;
    // private portManager: PortManager;
    private httpService: HttpService;
    private weirwood: Weirwood<typeof StateConfig>;


    constructor() {
        console.log("Hello");
        console.log("background script constructor called");
        console.log("Performance measurement started.");
        this.httpService = new HttpService();
        this.weirwood = create(StateConfig);
        // Add custom derived state to any newly created instance
        this.weirwood.onInstanceConnect((port, instances, workerState) => {
            const tabId = port.sender!.tab!.id!;
            const tabUrl = port.sender!.tab!.url!;
            this.weirwood.set({ ports: Object.keys(instances).map(instanceId => Number(instanceId)) });
            this.weirwood.set({ stats: { active: Object.keys(instances).length, open: Object.keys(instances).filter(instanceId => instances[Number(instanceId)].isOpen).length } });
            return { tabUrl, tabId, initialized: new Date().getTime().toString() };
        });
        this.weirwood.onInstanceDisconnect((port, instances, workerState) => {
            this.weirwood.set({ ports: Object.keys(instances).map(instanceId => Number(instanceId)) });
            this.weirwood.set({ stats: { active: Object.keys(instances).length, open: Object.keys(instances).filter(instanceId => instances[Number(instanceId)].isOpen).length } });
        });
        this.weirwood.subscribe((changes,) => {
            if (changes.hasOwnProperty('isOpen')) {
                const { stats } = this.weirwood.get();
                const openCount = changes.isOpen ? stats.open + 1 : stats.open - 1;
                const newStats = { ...stats, open: openCount };
                this.weirwood.set({ stats: newStats });
            }
        });
        this.establishListeners();
    }


    private establishListeners() {
        browser.action.onClicked.addListener((tab) => {
            browser.tabs.sendMessage(tab.id!, { type: 'toggleApp' });
        });

        browser.runtime.onConnect.addListener(port => {
            if (port.name === 'fetchChannel') {
                console.log("Connecting fetchChannel");
                port.onMessage.addListener(request => {
                    console.log("Fetch request heard: ", request);
                    this.httpService.handleFetchRequest(request).then((card) => {
                        if (card) {
                            // console.log("Setting magicCard in weirwood: ", card);
                            const cardSimplified = {
                                flavor_name: card.flavor_name,
                                colors: card.colors,
                                image_uris: { normal: card.image_uris.normal },
                                name: card.name,
                                power: card.power,
                                toughness: card.toughness,
                            }
                            this.weirwood.set({ magicCard: cardSimplified })
                        }
                    });
                });
            }
        });
        browser.runtime.onInstalled.addListener(details => {
            console.log('onInstalled listener heard. details: ', details);
            if (details.reason === 'install') {
                this.weirwood.clear();
            }
            if (details.reason === 'update') {
                this.weirwood.clear();
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