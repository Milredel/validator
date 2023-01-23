import { Controller, Request, Get, Body, Post, HttpStatus, Req, Res, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationDataDto } from './common/dto/validationData.dto';
import { AppService } from './app.service';
import { Utils } from './common/utils/utils';

@Controller()
export class AppController {

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private appService: AppService,
    ) { }

    /**
     * Utility endpoint for test
     *
     * @returns 'Hello World!'
     */
    @Get()
    helloWorld(): string {
        this.logger.info('Hello World!');
        return 'Hello World!';
    }

    /**
     * Compute validation and return result accordingly
     *
     * @returns response
     */
    @Post('/movements/validation')
    validation(@Body() validationDataDto: ValidationDataDto, @Res() response) {

        const {result, reasons} = this.appService.validate(validationDataDto);

        if (reasons) { // if errors, returning a HttpStatus.I_AM_A_TEAPOT
            response.status(HttpStatus.I_AM_A_TEAPOT);
            return response.send({statusCode: HttpStatus.I_AM_A_TEAPOT, reasons: reasons});
        }

        response.status(HttpStatus.ACCEPTED);
        return response.send({statusCode: HttpStatus.ACCEPTED, message: 'Accepted'});
    }

}