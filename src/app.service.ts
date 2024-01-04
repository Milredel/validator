import { ValidationDataDto } from './common/dto/validationData.dto';
import { Reasons } from './common/interfaces/reasons.interface';
import { DuplicateError } from './common/interfaces/duplicate-error.interface';
import { BalanceError } from './common/interfaces/balance-error.interface';
import { Injectable } from '@nestjs/common';
import { Balance } from './common/interfaces/balance.interface';
import { Movement } from './common/interfaces/movement.interface';
import { Utils } from './common/utils/utils';
import * as moment from 'moment';
import * as fs from 'fs';

export type Line = Movement | Balance;

@Injectable()
export class AppService {

    constructor() {
        // nothing to see here
    }

    /**
     * Main function, prepare data and check for errors
     *
     * @param {ValidationDataDto} validationDataDto
     * @returns {{result: string, reasons: Reasons}}
     * @memberof AppService
     */
    validate(validationDataDto: ValidationDataDto): {result: string, reasons: Reasons, mergedData: Line[]} {

        const inputDataMerged = this.mergeAndSortData(validationDataDto); // first I merge movements and balances in one single array, I then sort them by date asc

        const markedInputDataMerged = this.flagDuplicates(inputDataMerged); // I then mark as duplicates movement or balance I find more than one in the array

        const reasons = this.checkForErrors(markedInputDataMerged); // Finally, I loop through the array to find potential balance error or duplicate error

        return {result: 'ok', reasons: reasons, mergedData: inputDataMerged};
    }

    /**
     * Merge movements and balances and sort them by date asc
     *
     * @param {ValidationDataDto} validationDataDto
     * @returns {Line[]}
     * @memberof AppService
     */
    mergeAndSortData(validationDataDto: ValidationDataDto): Line[] {
        const inputDataMerged = [...validationDataDto.movements, ...validationDataDto.balances]; // we first merge movemnets and balances
        // below I'm not assuming any specific date format, hence the use of moment.diff() and the simple string declaration in interfaces
        // if we are sure we have this or that format, we can refine the test, maybe using a simple < operator, much faster
        return inputDataMerged.sort((a: Line, b: Line) => moment(a.date).isBefore(b.date) ? -1 : 1); // we sort everything by date asc
    }

    /**
     * Search and flag potential duplicates (adding isDuplicate: true)
     *
     * @param {Line[]} inputDataMerged
     * @returns {Line[]}
     * @memberof AppService
     */
    flagDuplicates(inputDataMerged: Line[]): Line[] {
        return inputDataMerged.reduce((p,c) => p.some(o => Utils.compareObjects(o, c)) ? (c.isDuplicate = true, p.concat(c)) : p.concat(c),[]); // marking duplicate movement or balance, maybe the test (Utils.compareObjects) should not be so strict
    }

    /**
     * Parse given lines and populate potential errors
     *
     * @param {Line[]} markedInputDataMerged
     * @returns {Reasons}
     * @memberof AppService
     */
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
        } as DuplicateError;

        for (const line of markedInputDataMerged) { // first we check potential balance errors, id est differences between Balance.balance and summed movements.amount for the given interval
            currentComputedBalance = Object.prototype.hasOwnProperty.call(line, 'amount') ? (currentComputedBalance + (line as Movement).amount) : currentComputedBalance;
            isNewBalance = Object.prototype.hasOwnProperty.call(line, 'balance') ? true : false;
            if (isNewBalance) { // we need to check if sum is same as announced balance
                // assuming here Balance.balance has just the balance of the last movements, not the sum of all Movement.amount from the beginning
                nextBalance = line;
                currentFoundBalance = (line as Balance).balance;
                if (currentComputedBalance !== currentFoundBalance) {
                    balanceErrors.push({
                        start: currentBalance ? currentBalance : null,
                        end: nextBalance,
                        diff: {
                            expected: currentFoundBalance,
                            computed: currentComputedBalance,
                            delta: parseFloat((currentFoundBalance - currentComputedBalance).toFixed(10)) // to have a human readable number if floating numbers
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
                delete line.isDuplicate;
                isNewBalance ? duplicateErrors.balances.push(<Balance>line) : duplicateErrors.movements.push(<Movement>line);
            }
        }

        return this.buildErrorObject(balanceErrors, duplicateErrors);
    }

    /**
     * Build error object for output
     *
     * @param {BalanceError[]} balanceErrors
     * @param {DuplicateError} duplicateErrors
     * @returns {Reasons}
     * @memberof AppService
     */
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
        return !Utils.isEmpty(reasons) ? reasons : null;
    }

    getContentFromFile(fileName: string) {
        const data = fs.readFileSync('./uploads/' + fileName , 'utf8')
        return JSON.parse(data)
    }

    deleteFile(fileName: string) {
        fs.unlinkSync('./uploads/' + fileName)
    }

}