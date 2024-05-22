import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { connect, WeirwoodConnect, StateUpdate, State } from 'weirwood';
import { StateConfig } from "../../web-ext/weirwood/config";

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private weirwood: WeirwoodConnect<typeof StateConfig>;
  private _state: State<typeof StateConfig>;
  private stateChangeSubject: BehaviorSubject<State<typeof StateConfig>>;
  public stateChange$: Observable<State<typeof StateConfig>>;


  constructor(private zone: NgZone) {
    this.weirwood = connect(StateConfig, "Angular service");
    this._state = this.weirwood.get();
    this.stateChangeSubject = new BehaviorSubject(this._state);
    this.stateChange$ = this.stateChangeSubject.asObservable();
    this.weirwood.subscribe((changes: StateUpdate<typeof StateConfig>) => {
      console.log("Angular service. State update received: ", changes)
      this.zone.run(() => {
        this._state = { ...this._state, ...changes };
        this.stateChangeSubject.next(this._state);
      });
    });
  }

  public send(newState: Partial<State<typeof StateConfig>>): void {
    console.log("Angular service setState called: ", newState);
    this.weirwood.set(newState);
    // this.port.postMessage({ type: 'setState', state: newState });
  }

}