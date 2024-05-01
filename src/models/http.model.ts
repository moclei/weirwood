
export interface FetchRequest {
    type: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: any;
}
