import { DuplicateError } from './common/interfaces/duplicate-error.interface';
import { Controller, Request, Get, Param, Body, Post, HttpException, HttpStatus, Req, Res, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationDataDto } from './common/dto/validationData.dto';
import * as moment from 'moment';
import { Movement } from './common/interfaces/movement.interface';
import { Balance } from './common/interfaces/balance.interface';
import { Utils } from './common/utils/utils';
import { Reasons } from './common/interfaces/reasons.interface';

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
    validation(@Body() validationDataDto: ValidationDataDto, @Req() request: Request, @Res() response) {

        const inputDataMerged = [...validationDataDto.movements, ...validationDataDto.balances]; // we first merge movemnets and balances
        inputDataMerged.sort((a: Movement | Balance, b: Movement | Balance) => moment(a.date).isBefore(b.date) ? -1 : 1); // we sort everything by date asc

        const markedinputDataMerged = inputDataMerged.reduce((p,c) => p.some(o => Utils.compareObjects(o, c)) ? (c.isDuplicate = true, p.concat(c)) : p.concat(c),[]); // marking duplicate movement or balance, maybe the test (Utils.compareObjects) should not be so strict

        // TODO remove potential duplicate balances before checking balance errors

        let currentFoundBalance = 0;
        let currentComputedBalance = 0;
        let isNewBalance = false;
        let currentBalance, nextBalance = null;
        const balanceErrors = [];
        const duplicateErrors = {
            movements: [],
            balances: []
        };
        for (const line of markedinputDataMerged) { // first we check potential balance errors, id est differences between Balance.balance and summed movements.amount for the given interval
            currentComputedBalance = Object.prototype.hasOwnProperty.call(line, 'amount') ? (currentComputedBalance + (line as Movement).amount) : currentComputedBalance;
            isNewBalance = Object.prototype.hasOwnProperty.call(line, 'balance') ? true : false;
            if (isNewBalance) { // we need to check if sum is same as announced balance
                nextBalance = line;
                currentFoundBalance = (line as Balance).balance;
                if (currentComputedBalance !== currentFoundBalance) {
                    balanceErrors.push({
                        start: currentBalance,
                        end: nextBalance,
                        diff: {
                            expected: currentFoundBalance,
                            computed: currentComputedBalance,
                            delta: currentFoundBalance - currentComputedBalance
                        }
                    });
                }
                currentComputedBalance = 0;
                currentBalance = nextBalance;
                nextBalance = null;
            }
            if (Object.prototype.hasOwnProperty.call(line, 'isDuplicate') && line.isDuplicate === true) {
                const key = isNewBalance ? 'balances' : 'movements';
                delete line.isDuplicate;
                duplicateErrors[key].push(line);
            }
        }

        const reasons = {} as Reasons; // preparing reasons error object
        if (balanceErrors.length > 0) {
            reasons.balances = balanceErrors;
        }
        if (duplicateErrors.balances.length > 0 || duplicateErrors.movements.length > 0) {
            reasons.duplicates = {} as DuplicateError;
            if (duplicateErrors.movements.length > 0) {
                reasons.duplicates.movements = duplicateErrors.movements;
            }
            if (duplicateErrors.balances.length > 0) {
                reasons.duplicates.balances = duplicateErrors.balances;
            }
        }

        if (reasons) { // if errors, returning a HttpStatus.I_AM_A_TEAPOT
            return response.status(HttpStatus.I_AM_A_TEAPOT).send({statusCode: HttpStatus.I_AM_A_TEAPOT, reasons: reasons});
        }

        return response.status(HttpStatus.ACCEPTED).send({statusCode: HttpStatus.ACCEPTED, message: 'Accepted'});
    }

}