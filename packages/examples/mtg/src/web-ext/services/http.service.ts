
import { FetchRequest } from '../../models/http.model';

export class HttpService {

    constructor() {
    }

    public async handleFetchRequest(request: FetchRequest): Promise<any> {
        try {
            const response = await fetch(request.url, {
                method: request.method,
                headers: request.headers,
                body: request.body,
            });

            if (response.ok) {
                const data = await response.json();

                // Update the state based on the response data
                if (request.type === 'card') {
                    return data;
                    // this.stateSyncService.setState({
                    //     ...this.stateSyncService.getState(),
                    //     magicCard: data,
                    // });
                }
            } else {
                console.error('HTTP request failed:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during HTTP request:', error);
        }
    }
}