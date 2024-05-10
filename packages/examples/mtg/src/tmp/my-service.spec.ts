import * as my_service from './my-service';
import { MyService } from './my-service';

describe('test my service', () => {
    let myService: MyService;
    let browserMock: any;
    let sendMessageMock: jasmine.Spy;
    let injectSpy: jasmine.Spy;
    beforeEach(() => {
        jasmine.clock().install();
        let merchant = 'www.amazon.com';
        myService = new MyService(merchant);
        injectSpy = spyOn(myService, 'inject').and.stub();
        browserMock = jasmine.createSpyObj('browser', ['runtime']);
        sendMessageMock = jasmine.createSpy('sendMessage').and.returnValue(Promise.resolve(false));
        browserMock.runtime.sendMessage = sendMessageMock;
        my_service.setPlatform(browserMock);
    });
    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should create my service', () => {
        let mockWindow = { location: { hostname: 'test' } };

        let mockDocument = {
            readyState: 'complete',
            getElementsByClassname: () => { },
            createElement: () => {
                return {
                    setAttribute: () => { },
                    appendChild: () => { }
                }
            }
        };

        my_service.setWindow(mockWindow);
        my_service.setDocument(mockDocument);

        myService.checkMainFrame();

        jasmine.clock().tick(251);

        expect(injectSpy).not.toHaveBeenCalled();
        expect(sendMessageMock).toHaveBeenCalledWith({
            action: 'my-action',
            payload: { hostname: 'test' }
        });

        sendMessageMock.and.returnValue(Promise.resolve(true));
        myService.checkMainFrame();

        jasmine.clock().tick(251);

        expect(injectSpy).toHaveBeenCalledTimes(1);
        expect(sendMessageMock).toHaveBeenCalledWith({
            action: 'my-action',
            payload: { hostname: 'test' }
        });
    });
});
