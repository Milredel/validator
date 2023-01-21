import { Balance } from './balance.interface';
import { Movement } from './movement.interface';

export class DuplicateError {
    movements: Movement[];
    balances: Balance[];
}