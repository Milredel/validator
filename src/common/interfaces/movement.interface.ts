import { IsString, IsNumber, IsDate } from 'class-validator';

export class Movement {
    @IsNumber()
    id: number;

    @IsDate()
    date: string;

    @IsString()
    label: string;

    @IsNumber()
    amount: number;

    isDuplicate?: boolean;
}