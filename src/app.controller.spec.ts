import { AppController } from './app.controller';
import { expect, stub, stubClass } from './test';
import * as winston from 'winston';
import { AppService } from './app.service';

describe('AppController', () => {
    let controller: AppController;
    const logger = winston.createLogger();
    let appService: AppService;

    const response = {
        status: () => null,
        send: () => null
    };

    beforeEach(() => {
        controller = new AppController(
            logger,
            appService = stubClass(AppService)
        );
    });

    it('should init the controller', () => {
        return expect(controller).to.not.be.undefined;
    });

    describe('helloWorld', () => {
        it('call logger.info and retour correct string', () => {
            stub(logger, 'info');
            const res = controller.helloWorld();
            return (expect(logger.info) as any).to.have.been.calledWith('Hello World!')
                && (expect(res) as any).to.be.deep.eq('Hello World!');
        });
    });

    describe('validation', () => {
        it('should call appService.validate and response.status().send() with correct params if reasons found', () => {
            stub(appService, 'validate').returns({result: 'ok', reasons: {some: 'reasons'}});
            stub(response, 'status');
            stub(response, 'send');
            controller.validation({some: 'data'} as any, response);
            return (expect(appService.validate) as any).to.have.been.calledWith({some: 'data'})
                && (expect(response.status) as any).to.have.been.calledWith(418)
                && (expect(response.send) as any).to.have.been.calledWith({statusCode: 418, reasons: {some: 'reasons'}});
        });

        it('should call appService.validate and response.status().send() with correct params if no reasons found', () => {
            stub(appService, 'validate').returns({result: 'ok', reasons: null});
            stub(response, 'status');
            stub(response, 'send');
            controller.validation({some: 'data'} as any, response);
            return (expect(appService.validate) as any).to.have.been.calledWith({some: 'data'})
                && (expect(response.status) as any).to.have.been.calledWith(202)
                && (expect(response.send) as any).to.have.been.calledWith({statusCode: 202, message: 'Accepted'});
        });
    });

});
