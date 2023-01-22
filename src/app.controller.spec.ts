import { AppController } from './app.controller';
import { expect, stub, stubClass } from './test';
import * as winston from 'winston';
import { AppService } from './app.service';

describe('AppController', () => {
    let controller: AppController;
    const logger = winston.createLogger();
    let appService;

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

});
