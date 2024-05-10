import { StateSyncService, PortManager } from 'weirwood';
import { INITIAL_BACKGROUND_STATE, StorageState } from '../../models/app.state';
import { FetchRequest } from '../../models/http.model';

export class HttpService {
    private stateSyncService: StateSyncService<StorageState>;

    constructor(stateSyncService: StateSyncService<StorageState>) {
        this.stateSyncService = stateSyncService;
    }

    public async handleFetchRequest(request: FetchRequest) {
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
                    this.stateSyncService.setState({
                        ...this.stateSyncService.getState(),
                        magicCard: data,
                    });
                }
            } else {
                console.error('HTTP request failed:', response.status);
            }
        } catch (error) {
            console.error('Error occurred during HTTP request:', error);
        }
    }
}