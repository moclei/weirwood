import browser from 'webextension-polyfill';
import { Weirwood } from './weirwood';

export class Porter {
    private ports: { [tabId: number]: { [frameId: number]: browser.Runtime.Port } } = {};
    private onInstanceConnectListener: (port: browser.Runtime.Port) => void = () => { };
    private instanceDisconnectListener: (port: browser.Runtime.Port) => void = () => { };

    constructor(private stateManager: Weirwood<any>) {
        browser.runtime.onConnect.addListener(port => {
            if (port.name === 'weirwood') {
                console.log("Porter, heard port connect to weirwood. port tabId: ", port.sender!.tab!.id!);
                this.addPort(port);
                this.sendStateUpdate(port.sender!.tab!.id!,)
            }
        });
    }

    private addPort(port: browser.Runtime.Port): void {
        console.log("Porter, adding port: ", port);
        const tabId = port.sender!.tab!.id!;
        const frameId = port.sender!.frameId!;
        if (!!this.ports[tabId] && this.ports[tabId].hasOwnProperty(frameId)) {
            console.log('Porter, tabId already exists. Ignoring add request.');
            return;
        }
        if (!this.ports[tabId]) {
            this.ports[tabId] = { [frameId]: port };
        } else {
            this.ports[tabId][frameId] = port;
        }
        console.log("Porter, added port. Ports: ", this.ports);
        port.onMessage.addListener(message => this.handleMessage(tabId, message));
        port.onDisconnect.addListener(() => {
            console.log('Ports disconnected. tabId: ', tabId);
            delete this.ports[tabId];
            this.instanceDisconnectListener(port);
        });
        this.onInstanceConnectListener(port);
    }

    public onInstanceConnect(handler: (port: browser.Runtime.Port) => void): void {
        this.onInstanceConnectListener = handler;
    }

    public onInstanceDisconnect(handler: (port: browser.Runtime.Port) => void): void {
        this.instanceDisconnectListener = handler;
    }

    private handleMessage(tabId: number, message: any): void {
        if (message.type === 'setState') {
            console.log('handleMessage, setState');
            this.stateManager.set(message.state, tabId);
        }
        if (message.type === 'setInstanceState') {
            console.log('handleMessage, setInstanceState');
            this.stateManager.set(message.state, message.tabId);
        }
    }

    private sendStateUpdate(tabId: number): void {
        if (this.ports[tabId]) {
            console.log('sendStateUpdate: tab', tabId, ' state: ', this.stateManager.get(tabId));
            Object.keys(this.ports[tabId]).forEach(frameId => {
                this.ports[tabId][Number(frameId)].postMessage({
                    type: 'stateUpdate',
                    state: {
                        ...this.stateManager.get(tabId),
                    }
                });
            });
            // this.ports[tabId].postMessage({
            //     type: 'stateUpdate',
            //     state: {
            //         ...this.stateManager.get(tabId),
            //     }
            // });
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
