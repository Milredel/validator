import { IsNumber, IsString } from 'class-validator';

export class Balance {
    @IsString()
    date: string;

    @IsNumber()
    balance: number;

    isDuplicate?: boolean;
}