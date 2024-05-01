export interface BackgroundState {
    stats: {
        active: number;
        open: number;
    };
    version: string;
    magicCard: any;
    ports: Instance[];
}
export interface Instance {
    isOpen: boolean;
    tabId: number;
}

export interface AngularState {
    url: string;
    clicks: number;
    isOpen: boolean;
    tabUrl: string;
    tabId: number;
    initialized: string;
}

export interface PortState {
    [key: number]: AngularState;
}


export type StorageState = BackgroundState & PortState;

export type AppState = BackgroundState & AngularState;

export const INITIAL_BACKGROUND_STATE: BackgroundState = {
    stats: {
        active: 0,
        open: 0
    },
    version: '',
    magicCard: null,
    ports: []
}
export const INITIAL_APP_STATE: AngularState = {
    url: '',
    clicks: 0,
    isOpen: false,
    tabId: 0,
    tabUrl: '',
    initialized: '',
}