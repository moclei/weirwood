import browser from 'webextension-polyfill';
import { ConfigItem, DerivedInstanceState, DerivedState, DerivedWorkerState, WeirwoodConnect } from './model/weirwood.model';
export declare class Weirwood<TConfig extends Record<string, ConfigItem<any>>> {
    private config;
    private defaultInstanceState;
    private defaultWorkerState;
    private instanceStates;
    private workerState;
    private onStateChangeListeners;
    private instanceConnectListener;
    private instanceDisconnectListener;
    private STORAGE_PREFIX;
    private porter;
    constructor(config: TConfig, storagePrefix?: string);
    get(): DerivedState<TConfig>;
    get(tabId: number): DerivedInstanceState<TConfig> & DerivedWorkerState<TConfig>;
    set(state: Partial<DerivedWorkerState<TConfig>>): Promise<void>;
    set(state: Partial<DerivedInstanceState<TConfig> & DerivedWorkerState<TConfig>>, tabId: number): Promise<void>;
    setWorkerState(state: Partial<DerivedWorkerState<TConfig>>): Promise<void>;
    setInstanceState(tabId: number, state: Partial<DerivedInstanceState<TConfig>>): Promise<void>;
    clear(): Promise<void>;
    subscribe(listener: (state: Partial<DerivedState<TConfig>>, tabId?: number) => void): void;
    private notify;
    addInstance(tabId: number, context?: any): Promise<void>;
    onInstanceConnect(handler: (port: browser.Runtime.Port, instances: {
        [tabId: number]: DerivedInstanceState<TConfig>;
    }, workerState: DerivedWorkerState<TConfig>) => any): any;
    onInstanceDisconnect(handler: (port: browser.Runtime.Port, instances: {
        [tabId: number]: DerivedInstanceState<TConfig>;
    }, workerState: DerivedWorkerState<TConfig>) => any): void;
    removeInstance(tabId: number): Promise<void>;
    private persist;
    private hydrate;
    getDefaultStates(): DerivedInstanceState<TConfig> & DerivedWorkerState<TConfig>;
    private initializeInstanceDefault;
    private initializeWorkerDefault;
    private removePrefix;
    private deepEqual;
}
export declare function create<TConfig extends Record<string, ConfigItem<any>>>(config: TConfig, storagePrefix?: string): Weirwood<TConfig>;
export declare function connect<TConfig extends Record<string, ConfigItem<any>>>(config: TConfig, context?: string): WeirwoodConnect<TConfig>;
//# sourceMappingURL=weirwood.d.ts.map