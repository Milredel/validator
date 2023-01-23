import { Balance } from "./balance.interface";
import { Movement } from "./movement.interface";

export class DiffError {
    expected: number; // the sum we should have (given by the end balance)
    computed: number; // the sum we calculated
    delta: number; // the delta (could be positive or negative)
}

export class BalanceError {
    start: Balance; // the previous balance found (can be null if none)
    end: Balance; // the balance we use to compare the movements amount on
    diff: DiffError; // some precision on the calculus
    movements: Movement[]; // all the movements used to calculate the sum before comparing with announced balance
}