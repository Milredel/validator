import { Movement } from '../interfaces/movement.interface';
import { Balance } from '../interfaces/balance.interface';
import { IsArray } from 'class-validator';

export class ValidationDataDto {
    @IsArray()
    movements: Movement[];

    @IsArray()
    balances: Balance[];
}
