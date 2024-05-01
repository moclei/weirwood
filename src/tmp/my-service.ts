import { inject } from '@angular/core';
import browser from 'webextension-polyfill';

let browserPlatform = browser;

export function setPlatform(newPlatform: any) {
    browserPlatform = newPlatform;
}

let _window: any = window;
export function setWindow(newWindow: any) {
    _window = newWindow;
}

let _document: any = document;
export function setDocument(newDocument: any) {
    _document = newDocument;
}

const MERCHANTS: { [key: string]: any } = {
    'www.amazon.com': {
        name: 'Amazon',
        logo: 'amazon.png'
    },
    'www.ebay.com': {
        name: 'Ebay',
        logo: 'ebay.png'
    }
}

export class MyService {
    merchant: string;
    contentFrame: any;
    checkLoadedInterval: NodeJS.Timeout | null = null;

    constructor(merchant: string) {
        this.merchant = merchant;
    }

    static loaded(): boolean {
        console.log("MyService loaded");
        return true;
    }
    initialize() {
        if (MERCHANTS[this.merchant]) {
            this.checkMainFrame();
        }
    }

    checkMainFrame() {
        this.checkLoadedInterval = setInterval(() => {
            if (this.merchant) {
                browserPlatform.runtime.sendMessage({ action: 'my-action', payload: { hostname: _window.location.hostname } }).then((response) => {
                    if (response) {
                        this.iframeSuccess(response);
                    } else {
                        clearInterval(this.checkLoadedInterval!);
                        this.inject();
                    }
                })
            }
        }, 250)
    }

    inject() {
        if (this.merchant) {
            this.contentFrame = _document.createElement('iframe');
            this.contentFrame.src = 'https://' + this.merchant;
            this.contentFrame.style.display = 'none';
            _document.body.appendChild(this.contentFrame);
        }
    }

    iframeSuccess(response: any) {
        console.log('iframeSuccess');
        clearInterval(this.checkLoadedInterval!);
    }

}