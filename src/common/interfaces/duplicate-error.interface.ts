import { Balance } from './balance.interface';
import {┬áMovement } from './movement.interface';

export class DuplicateError {
    movements: Movement[];
    balances: Balance[];
}