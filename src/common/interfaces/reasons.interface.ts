import { BalanceError } from './balance-error.interface';
import { DuplicateError } from './duplicate-error.interface';

export class Reasons {
    balances: BalanceError[];
    duplicates: DuplicateError;
}