import browser from 'webextension-polyfill';
import { ConfigItem, DerivedInstanceState, DerivedState, DerivedWorkerState, StateSubscriber } from './model/weirwood.model';
import { Porter } from './porter';

export class Weirwood<TConfig extends Record<string, ConfigItem<any>>> {
    private defaultInstanceState: DerivedInstanceState<TConfig>;
    private defaultWorkerState: DerivedWorkerState<TConfig>;
    private instanceStates: { [tabId: number]: DerivedInstanceState<TConfig> };
    private workerState: DerivedWorkerState<TConfig>;
    private onStateChangeListeners: Array<(state: Partial<DerivedState<TConfig>>, tabId?: number) => void> = [];
    private STORAGE_PREFIX = 'ww_';
    private porter: Porter;

    constructor(private config: TConfig, storagePrefix?: string) {
        this.defaultInstanceState = this.instanceStates = this.initializeInstanceDefault();
        this.defaultWorkerState = this.workerState = this.initializeWorkerDefault();
        this.hydrate();
        this.porter = new Porter(this);
        if (storagePrefix) {
            this.STORAGE_PREFIX = storagePrefix;
        }
    }

    public get(): (DerivedWorkerState<TConfig>)
    public get(tabId: number): DerivedInstanceState<TConfig> & DerivedWorkerState<TConfig>;
    public get(tabId?: number): (DerivedInstanceState<TConfig> | DerivedWorkerState<TConfig>) {
        if (!tabId) {
            return { ...this.workerState, ...{} as Partial<DerivedInstanceState<TConfig>> };
        }
        return { ...this.workerState, ...this.instanceStates[tabId] };
    }

    public async set(state: Partial<DerivedWorkerState<TConfig>>): Promise<void>
    public async set(state: Partial<DerivedInstanceState<TConfig> & DerivedWorkerState<TConfig>>, tabId: number): Promise<void>
    public async set(state: Partial<DerivedInstanceState<TConfig> | DerivedWorkerState<TConfig>>, tabId?: number): Promise<void> {
        const instance = {} as Partial<DerivedInstanceState<TConfig>>;
        const worker = {} as Partial<DerivedWorkerState<TConfig>>;

        for (const key in state) {
            const item = this.config[key as keyof TConfig] as ConfigItem<any>;
            if (item.partition === 'instance') {
                const instanceKey = key as keyof DerivedInstanceState<TConfig>;
                const instanceState = state as Partial<DerivedInstanceState<TConfig>>;
                instance[instanceKey] = instanceState[instanceKey];
            } else if (item.partition === 'worker') {
                const workerKey = key as keyof DerivedWorkerState<TConfig>;
                const workerState = state as Partial<DerivedWorkerState<TConfig>>;
                worker[workerKey] = workerState[workerKey]!;
            }
        }
        if (tabId) this.setInstanceState(tabId, instance);
        this.setWorkerState(worker);
    }

    public async setWorkerState(state: Partial<DerivedWorkerState<TConfig>>): Promise<void> {
        const update = { ...this.workerState, ...state };
        if (!this.deepEqual(this.workerState, update)) {
            this.workerState = update;
            await this.persist();
            this.notify(state as Partial<DerivedState<TConfig>>);
        }
    }

    public async setInstanceState(tabId: number, state: Partial<DerivedInstanceState<TConfig>>): Promise<void> {
        const update = { ...this.defaultInstanceState, ...this.instanceStates[tabId], ...state };
        if (!this.deepEqual(this.instanceStates[tabId], update)) {
            this.instanceStates[tabId] = update;
            this.notify(state as Partial<DerivedState<TConfig>>, tabId);
        }
    }

    public async clear(): Promise<void> {
        this.workerState = this.defaultWorkerState;
        this.instanceStates = {};
        await this.persist();
        this.notify({});
    }

    public subscribe(listener: (state: Partial<DerivedState<TConfig>>, tabId?: number) => void): void {
        this.onStateChangeListeners.push(listener);
    }

    private notify(state: Partial<DerivedState<TConfig>>, tabId?: number): void {
        this.onStateChangeListeners.forEach(listener => listener(state, tabId));
    }

    public async addInstance(tabId: number, context?: any): Promise<void> {
        if (!this.instanceStates.hasOwnProperty(tabId)) {
            const initialInstanceState = { ...this.defaultInstanceState } as DerivedInstanceState<TConfig>;
            if (context) {
                initialInstanceState.context = { ...context };
            }
            this.instanceStates[tabId] = initialInstanceState;
        }
    }

    public async removeInstance(tabId: number): Promise<void> {
        if (this.instanceStates.hasOwnProperty(tabId)) {
            delete this.instanceStates[tabId];
        }
    }

    private async persist(): Promise<void> {
        for (const key in this.workerState) {
            const item = this.config[key] as ConfigItem<any>;
            const persistence = item.persistance || 'none';
            const value = this.workerState[key];
            switch (persistence) {
                case 'session':
                    await browser.storage.session.set({ [this.STORAGE_PREFIX + (key as string)]: value });
                    break;
                case 'local':
                    await browser.storage.local.set({ [this.STORAGE_PREFIX + (key as string)]: value });
                    break;
                default:
                    break;
            }
        }
    }

    private async hydrate(): Promise<void> {
        const local = await browser.storage.local.get(null);
        const session = await browser.storage.session.get(null);
        const combined = { ...local, ...session };
        const update: Partial<DerivedWorkerState<TConfig>> = {}; // Cast update as Partial<DerivedState<TConfig>>
        for (const prefixedKey in combined) {
            const key = this.removePrefix(prefixedKey);
            if (this.config.hasOwnProperty(key)) {
                const value = combined[key];
                update[key as keyof DerivedWorkerState<TConfig>] = value;
            }
        }
        this.workerState = { ...this.defaultWorkerState, ...update };
    }

    public getDefaultStates(): DerivedInstanceState<TConfig> & DerivedWorkerState<TConfig> {
        return { ...this.defaultWorkerState, ...this.defaultInstanceState };
    }

    private initializeInstanceDefault(): DerivedInstanceState<TConfig> {
        const instanceState: any = {};
        Object.keys(this.config).forEach(key => {
            const item: ConfigItem<any> = this.config[key];
            if (item.partition === 'instance') {
                instanceState[key] = item.default;
            }
        });
        return instanceState;
    }

    private initializeWorkerDefault(): DerivedWorkerState<TConfig> {
        const workerState: any = {};
        Object.keys(this.config).forEach(key => {
            const item: ConfigItem<any> = this.config[key];
            if (item.partition === 'worker') {
                workerState[key] = item.default;
            }
        });
        return workerState;
    }

    private isInstanceState(state: Partial<DerivedInstanceState<TConfig> | DerivedWorkerState<TConfig>>): state is Partial<DerivedInstanceState<TConfig>> {
        return (state as Partial<DerivedInstanceState<TConfig>>).context !== undefined;
    }

    private isWorkerState(state: Partial<DerivedInstanceState<TConfig> | DerivedWorkerState<TConfig>>): state is Partial<DerivedWorkerState<TConfig>> {
        return (state as Partial<DerivedInstanceState<TConfig>>).context === undefined;
    }

    private removePrefix(key: string): string {
        if (key.startsWith(this.STORAGE_PREFIX)) {
            return key.replace(this.STORAGE_PREFIX, '');
        }
        return key;
    }

    private deepEqual(a: any, b: any): boolean {
        if (a === b) return true;

        if (a == null || typeof a !== 'object' || b == null || typeof b !== 'object') return false;

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        keysA.sort();
        keysB.sort();

        for (let i = 0; i < keysA.length; i++) {
            const key = keysA[i];
            if (key !== keysB[i] || !this.deepEqual(a[key], b[key])) return false;
        }
        return true;
    }
}

export function create<TConfig extends Record<string, ConfigItem<any>>>(config: TConfig, storagePrefix?: string): Weirwood<TConfig> {
    return new Weirwood(config, storagePrefix);
}

export function connect<TConfig extends Record<string, ConfigItem<any>>>(config: TConfig): { get: () => DerivedState<TConfig>; set: (newState: Partial<DerivedState<TConfig>>) => void; subscribe: (key: keyof TConfig, callback: StateSubscriber) => number; unsubscribe: (id: number) => void; } {
    // If we're connecting from a content script or app, call browser.runtime.connect
    const port = browser.runtime.connect({ name: 'weirwood' });
    let _state = getDerivedState(config);
    let changes: Partial<DerivedState<TConfig>> | null = null;
    const listeners = new Map<number, StateSubscriber<TConfig>>();
    let listenerId = 0;
    port.onMessage.addListener(message => {
        if (message.type === 'stateUpdate') {
            console.log('stateUpdate received');
            changes = message.payload.state;
            _state = { ..._state, ...changes };

            listeners.forEach(listener => {
                if (changes && Object.keys(changes).includes(String(listener.key))) {
                    listener.callback(changes);
                }
            });
        }
    });

    const get = () => _state;
    const set = (newState: Partial<DerivedState<TConfig>>) => {
        port.postMessage({ type: 'setState', payload: { state: newState } });
    }
    const subscribe = (key: keyof DerivedState<TConfig>, callback: StateSubscriber): number => {
        listeners.set(++listenerId, { key, callback });
        return listenerId;
    }
    const unsubscribe = (id: number) => {
        listeners.delete(id);
    }
    return { get, set, subscribe, unsubscribe };
}

function getDerivedState<TConfig extends Record<string, ConfigItem<any>>>(config: TConfig): DerivedState<TConfig> {
    const instanceState = {} as DerivedInstanceState<TConfig>;

    Object.keys(config).forEach(key => {
        const item: ConfigItem<any> = config[key];
        if (item.partition === 'instance') {
            instanceState[key as keyof DerivedInstanceState<TConfig>] = item.default;
        }
    });

    const workerState = {} as DerivedWorkerState<TConfig>;
    Object.keys(config).forEach(key => {
        const item: ConfigItem<any> = config[key];
        if (item.partition === 'instance') {
            workerState[key as keyof DerivedWorkerState<TConfig>] = item.default;
        }
    });

    return { ...instanceState, ...workerState } as DerivedState<TConfig>;
}
// export function useState(): [
//     () => DerivedWorkerState<TConfig>,
//     (newState: Partial<DerivedWorkerState<TConfig>>) => Promise<void>,
//     (tabId: number) => DerivedInstanceState<TConfig>,
//     (tabId: number, newState: Partial<DerivedInstanceState<TConfig>>) => Promise<void>,
// ] {
//     if (!stateInstance) {
//         stateInstance = createWeirwood({});
//     }
//     if (!portManagerInstance) {
//         portManagerInstance = new Porter(stateInstance);
//         browser.runtime.onConnect.addListener(port => {
//             if (port.name === 'weirwood') {
//                 portManagerInstance!.addPort(port);
//             }
//         });
//     }

//     const getState = () => stateInstance!.getWorkerState();
//     const setState = (newState: Partial<DerivedWorkerState<TConfig>>) => stateInstance!.setWorkerState(newState);
//     const getInstanceState = (tabId: number) => stateInstance!.getInstanceState(tabId);
//     const setInstanceState = (tabId: number, newState: Partial<DerivedInstanceState<TConfig>>) => stateInstance!.setInstanceState(tabId, newState);

//     return [getState, setState, getInstanceState, setInstanceState]
// }

// import { create } from 'weirwood';

const config = {
    name: {
        default: 'John Doe',
        partition: 'instance' as 'instance',
    },
    numbers: {
        default: 123,
        partition: 'worker' as 'worker', // partition needs to be explicitly set. Should default to 'worker'
    }
};


// Usage in background script

const myStore = create(config);

myStore.subscribe((state) => {
    console.log(state.name);
});

myStore.set({ numbers: 123 });
const { numbers: nums } = myStore.get(); // Doesn't complain if you don't pass tabId
const tabId = 123;

const { numbers: nums2 } = myStore.get(tabId);
myStore.set({ name: 'John Doe' }, tabId);

// Usage in content script

// const myCSStore = connect();

