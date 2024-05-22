
const session = 'session' as const;
const local = 'local' as const;
const instance = 'instance' as const;

export const StateConfig = {
    stats: {
        default: {
            active: 0,
            open: 0
        },
        persistance: session
    },
    version: {
        default: '',
        persistance: session
    },
    magicCard: {
        default: null as string | null,
        persistance: session
    },
    ports: {
        default: [] as number[],
        persistance: session
    },
    // instance state
    isOpen: { default: false, partition: instance },
    initialized: { default: '', partition: instance },
}
