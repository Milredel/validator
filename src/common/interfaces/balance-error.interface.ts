import { Balance } from "./balance.interface";
import { Movement } from "./movement.interface";

export class DiffError {
    expected: number;
    computed: number;
    delta: number;
}

export class BalanceError {
    start: Balance;
    end: Balance;
    diff: DiffError;
    movements: Movement[];
}