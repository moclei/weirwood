import { Injectable, NgZone } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import browser from 'webextension-polyfill';
import { FetchRequest } from "../../models/http.model";

@Injectable({
  providedIn: 'root'
})
export class FetchService {
  private fetchPort: browser.Runtime.Port;

  constructor() {
    this.fetchPort = browser.runtime.connect({ name: 'fetchChannel' });
  }

  public sendFetchRequest(request: FetchRequest) {
    this.fetchPort.postMessage(request);
  }
}