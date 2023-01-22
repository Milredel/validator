import { ValidationDataDto } from './common/dto/validationData.dto';
import { Reasons } from './common/interfaces/reasons.interface';
import { DuplicateError } from './common/interfaces/duplicate-error.interface';
import { BalanceError } from './common/interfaces/balance-error.interface';
import { Injectable } from '@nestjs/common';
import { Balance } from './common/interfaces/balance.interface';
import { Movement } from './common/interfaces/movement.interface';
import { Utils } from './common/utils/utils';
import * as moment from 'moment';

export type Line = Movement | Balance;

@Injectable()
export class AppService {

    constructor() {
        // nothing to see here
    }

    validate(validationDataDto: ValidationDataDto): {result: string, reasons: Reasons} {

        const inputDataMerged = this.mergeAndSortData(validationDataDto);

        const markedInputDataMerged = this.flagDuplicates(inputDataMerged);

        const reasons = this.checkForErrors(markedInputDataMerged);

        return {result: 'ok', reasons: reasons};
    }

    mergeAndSortData(validationDataDto: ValidationDataDto): Line[] {
        const inputDataMerged = [...validationDataDto.movements, ...validationDataDto.balances]; // we first merge movemnets and balances
        // below I'm not assuming any specific date format, hence the use of moment.diff() and the simple string declaration in interfaces
        // if we are sure we have this or that format, we can refine the test, maybe using a simple < operator, much faster
        return inputDataMerged.sort((a: Line, b: Line) => moment(a.date).isBefore(b.date) ? -1 : 1); // we sort everything by date asc
    }

    flagDuplicates(inputDataMerged: Line[]): Line[] {
        return inputDataMerged.reduce((p,c) => p.some(o => Utils.compareObjects(o, c)) ? (c.isDuplicate = true, p.concat(c)) : p.concat(c),[]); // marking duplicate movement or balance, maybe the test (Utils.compareObjects) should not be so strict
    }

    checkForErrors(markedInputDataMerged: Line[]): Reasons {
        let currentFoundBalance = 0;
        let currentComputedBalance = 0;
        let isNewBalance = false;
        let currentBalance, nextBalance = null;
        let movementsForBalance = [];
        const balanceErrors = [] as BalanceError[];
        const duplicateErrors = {
            movements: [],
            balances: []
        };
        for (const line of markedInputDataMerged) { // first we check potential balance errors, id est differences between Balance.balance and summed movements.amount for the given interval
            currentComputedBalance = Object.prototype.hasOwnProperty.call(line, 'amount') ? (currentComputedBalance + (line as Movement).amount) : currentComputedBalance;
            isNewBalance = Object.prototype.hasOwnProperty.call(line, 'balance') ? true : false;
            if (isNewBalance) { // we need to check if sum is same as announced balance
                // assuming here Balance.balance has just the balance of the last movements, not the sum of all Movement.amount from the beginning
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
                        },
                        movements: movementsForBalance
                    });
                }
                currentComputedBalance = 0;
                currentBalance = nextBalance;
                nextBalance = null;
                movementsForBalance = [];
            } else {
                movementsForBalance.push(line);
            }
            if (Object.prototype.hasOwnProperty.call(line, 'isDuplicate') && line.isDuplicate === true) {
                const key = isNewBalance ? 'balances' : 'movements';
                delete line.isDuplicate;
                duplicateErrors[key].push(line);
            }
        }

        return this.buildErrorObject(balanceErrors, duplicateErrors);
    }

    buildErrorObject(balanceErrors: BalanceError[], duplicateErrors: DuplicateError): Reasons {
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
        return reasons;
    }

}