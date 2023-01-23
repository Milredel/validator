import { BalanceError } from './balance-error.interface';
import { DuplicateError } from './duplicate-error.interface';

export class Reasons { // I chose to separate both balances and duplicates errors
    balances: BalanceError[];
    duplicates: DuplicateError;
}