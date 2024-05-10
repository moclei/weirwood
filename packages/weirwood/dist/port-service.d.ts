import browser from 'webextension-polyfill';
import { StateSyncService } from './state-service';
import { StorageState } from './app.state';
export declare class PortManager {
    private ports;
    stateSyncService: StateSyncService<StorageState>;
    constructor(stateSyncService: StateSyncService<StorageState>);
    addPort(tabId: number, tabUrl: string, port: browser.Runtime.Port): void;
    private handleMessage;
    private sendStateUpdate;
    broadcastStateUpdate(state: any): void;
}
//# sourceMappingURL=port-service.d.ts.map