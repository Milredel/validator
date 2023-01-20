import { Movement } from '../interfaces/movement.interface';
import { Balance } from '../interfaces/balance.interface';

export class ValidationDataDto {
    movements: Movement[];
    balances: Balance[];
}
