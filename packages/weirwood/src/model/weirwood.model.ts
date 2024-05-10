type ConfigItem<T> = {
    partition?: 'instance' | 'worker';
    persistance?: 'local' | 'session';
    default: T;
};

type DerivedState<T extends Record<string, ConfigItem<any>>> = { [P in keyof T]: T[P]['default'];
};

type DerivedInstanceState<T extends Record<string, ConfigItem<any>>> = { [P in keyof T as T[P]['partition'] extends 'instance' ? P : never]: T[P]['default'];
} & {
    context?: any;
};

type DerivedWorkerState<T extends Record<string, ConfigItem<any>>> = { [P in keyof T as T[P]['partition'] extends 'worker' ? P : never]: T[P]['default'];
};

type StateSubscriber<TConfig extends Record<string, ConfigItem<any>>> = {
    key: keyof DerivedState<TConfig>;
    callback: (changes: Partial<DerivedState<TConfig>>) => void;
};

export { ConfigItem, DerivedState, DerivedInstanceState, DerivedWorkerState, StateSubscriber }