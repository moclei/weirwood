import browser from 'webextension-polyfill';
import { Weirwood } from './weirwood';

export class Porter {
    private ports: { [tabId: number]: browser.Runtime.Port } = {};

    constructor(private stateManager: Weirwood<any>) {
        // this.stateManager.onStateChange((state: any) => {
        //     this.broadcastStateUpdate(state);
        // });
        browser.runtime.onConnect.addListener(port => {
            if (port.name === 'weirwood') {
                this.addPort(port);
                // send initial state?
            }
        });
    }

    private addPort(port: browser.Runtime.Port): void {
        const tabId = port.sender!.tab!.id!;
        const tabUrl = port.sender!.tab!.url!;
        this.ports[tabId] = port;
        this.stateManager.addInstance(tabId, { tabUrl, tabId, initialized: new Date().getTime().toString() });
        port.onMessage.addListener(message => this.handleMessage(tabId, message));
        port.onDisconnect.addListener(() => {
            console.log('Ports disconnected. tabId: ', tabId);
            delete this.ports[tabId];
            this.stateManager.removeInstance(tabId);
        });
        this.sendStateUpdate(tabId);
    }

    private handleMessage(tabId: number, message: any): void {
        if (message.type === 'setState') {
            console.log('handleMessage, setState');
            this.stateManager.setState(message.state, tabId);
        }
        if (message.type === 'setInstanceState') {
            console.log('handleMessage, setInstanceState');
            this.stateManager.setState(message.state, message.tabId);
        }
    }

    private sendStateUpdate(tabId: number): void {
        if (this.ports[tabId]) {
            this.ports[tabId].postMessage({
                type: 'stateUpdate',
                state: {
                    ...this.stateManager.getState(tabId),
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
