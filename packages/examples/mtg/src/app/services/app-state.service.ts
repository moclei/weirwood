import { Injectable, NgZone } from "@angular/core";
import { AngularState, AppState, BackgroundState, INITIAL_APP_STATE, INITIAL_BACKGROUND_STATE } from "../../models/app.state";
import { BehaviorSubject } from "rxjs";
import browser from 'webextension-polyfill';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private state: AppState = {
    ...INITIAL_BACKGROUND_STATE, ...INITIAL_APP_STATE
  };

  private stateChangeSubject = new BehaviorSubject<AppState>(this.state);
  public stateChange$ = this.stateChangeSubject.asObservable();

  private port: browser.Runtime.Port;

  constructor(private zone: NgZone) {
    console.log("Angular service created.")
    this.port = browser.runtime.connect({ name: 'stateSyncChannel' });
    this.port.onMessage.addListener(message => {
      if (message.type === 'stateUpdate') {
        console.log('State update received: ', message.state);
        this.zone.run(() => {
          this.state = message.state;
          this.stateChangeSubject.next(this.state);
        });
      }
    });

    // this.getState();
  }

  getInstances() {
    // Replace this with your actual implementation to fetch instances from the state
    return [
      { id: 1, isOpen: true },
      { id: 2, isOpen: false },
      // ...
    ];
  }

  public setState(newState: Partial<BackgroundState>): void {
    console.log("Angular service. setState called, passing to background: ", newState)
    this.port.postMessage({ type: 'setState', state: newState });
  }
  public setInstanceState(newState: Partial<AngularState>, tabId: number): void {
    console.log("Angular service. setInstanceState called, passing to background: ", newState)
    this.port.postMessage({ type: 'setInstanceState', tabId, state: newState });
  }
}