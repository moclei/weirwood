import browser from 'webextension-polyfill';
import { Weirwood } from './weirwood';
export declare class Porter {
    private stateManager;
    private ports;
    private onInstanceConnectListener;
    private instanceDisconnectListener;
    constructor(stateManager: Weirwood<any>);
    private addPort;
    onInstanceConnect(handler: (port: browser.Runtime.Port) => void): void;
    onInstanceDisconnect(handler: (port: browser.Runtime.Port) => void): void;
    private handleMessage;
    private sendStateUpdate;
    broadcastStateUpdate(state: any): void;
}
//# sourceMappingURL=porter.d.ts.map