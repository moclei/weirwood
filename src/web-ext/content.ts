import browser from 'webextension-polyfill';

const BORDER_COLOR = 'rgb(87, 102, 111)';
const APP_WIDTH = 350;
const APP_HEIGHT = 500;

type LensorState = {
    initialized: boolean,
    myTabId: number | null,
    myPort: browser.Runtime.Port | null,
    container: HTMLDivElement | null,
    frame: HTMLIFrameElement | null,
    open: boolean;
}

const state: LensorState = {
    initialized: false,
    myTabId: null,
    frame: null,
    container: null,
    open: false,
    myPort: null
}

function createMainCanvas() {
    const container = document.createElement('div');
    container.style.zIndex = '2147483647';
    container.style.display = 'block';
    container.style.visibility = 'hidden';
    container.style.opacity = '1';
    state.container = container;
    const iframe = document.createElement('iframe');
    iframe.src = browser.runtime.getURL('index.html');
    iframe.style.position = 'fixed';
    iframe.style.top = '10px';
    iframe.style.right = '10px';
    iframe.style.width = APP_WIDTH + 'px';
    iframe.style.height = APP_HEIGHT + 'px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '2147483647';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';
    iframe.style.background = 'wheat';
    iframe.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    iframe.style.borderRadius = '8px';
    state.frame = iframe;

    state.container.appendChild(state.frame);
    document.body.appendChild(state.container);

    state.myPort = browser.runtime.connect({ name: 'stateSyncChannel' });

    state.myPort.onMessage.addListener(message => {
        if (message.type === 'stateUpdate') {
            // iframe.contentWindow!.postMessage(message, '*');
            console.log('MOC stateUpdate', message);
            if (message.state.ports) {
                console.log('MOC stateUpdate, we had ports');
                message.state.ports.forEach((port: any) => {
                    console.log('MOC stateUpdate, comparing to myTabId: ', state.myTabId, ' and port.tabId: ', port.tabId);
                    if (port.tabId === state.myTabId) {
                        console.log('MOC matching port! opening');
                        state.open = port.isOpen;
                        if (state.open) {
                            state.container!.style.visibility = 'visible';
                        } else {
                            state.container!.style.visibility = 'hidden';
                        }
                    }
                });
            }
        }
    });
}

browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'toggleApp') {
        console.log('toggleApp heard. sending open state to background.');
        state.open = !state.open;
        state.myPort!.postMessage({ type: 'setState', state: { isOpen: state.open } });
        if (state.open) {
            state.container!.style.visibility = 'visible';
        } else {
            state.container!.style.visibility = 'hidden';
        }
    }
});

if (self === top) { createMainCanvas(); }
