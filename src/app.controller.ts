import { Controller, Request, Get, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller()
export class AppController {

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }

    /**
     * Utility endpoint for test
     *
     * @returns 'Hello World!'
     */
    @Get()
    async hashPass(@Request() req) {
        return 'Hello World!';
    }

}