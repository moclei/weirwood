import browser from 'webextension-polyfill';
type ConfigItem<T> = {
    partition?: 'instance' | 'worker';
    persistance?: 'local' | 'session';
    default: T;
};
type DerivedState<T extends Record<string, ConfigItem<any>>> = {
    [P in keyof T]: T[P]['default'];
};
type DerivedInstanceState<T extends Record<string, ConfigItem<any>>> = {
    [P in keyof T as T[P]['partition'] extends 'instance' ? P : never]: T[P]['default'];
} & {
    context?: any;
};
type DerivedWorkerState<T extends Record<string, ConfigItem<any>>> = {
    [P in keyof T as T[P]['partition'] extends 'worker' ? P : never]: T[P]['default'];
};
type StateSubscriber<TConfig extends Record<string, ConfigItem<any>>> = {
    key?: keyof DerivedState<TConfig>;
    callback: (changes: Partial<DerivedState<TConfig>>) => void;
};
type WeirwoodConnect<TConfig extends Record<string, ConfigItem<any>>> = {
    get: () => DerivedState<TConfig>;
    set: (newState: Partial<DerivedState<TConfig>>) => void;
    subscribe: (callback: (changes: Partial<DerivedState<TConfig>>) => void, key?: keyof TConfig) => number;
    unsubscribe: (id: number) => void;
    port: browser.Runtime.Port;
};
type StateUpdate<TConfig extends Record<string, ConfigItem<any>>> = Partial<DerivedState<TConfig>>;
export { ConfigItem, DerivedState, DerivedInstanceState, DerivedWorkerState, StateSubscriber, WeirwoodConnect, StateUpdate, DerivedState as State };
//# sourceMappingURL=weirwood.model.d.ts.map