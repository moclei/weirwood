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
export declare const INITIAL_BACKGROUND_STATE: BackgroundState;
export declare const INITIAL_APP_STATE: AngularState;
//# sourceMappingURL=app.state.d.ts.map