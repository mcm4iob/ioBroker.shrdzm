/**
 * MeanValue
 *
 * This class calculates numeric mean values
 *
 */
export class MeanValue {
    private _sum: number;
    private _count: number;

    /**
     * constructor
     *
     */
    constructor() {
        this._sum = 0;
        this._count = 0;
    }

    /**
     * reset
     *
     * reinitializes a meanvalue
     *
     */
    reset(): void {
        this._sum = 0;
        this._count = 0;
    }

    /**
     * add
     *
     * updates meanvalue by adding a new value and returns the new meanValue
     *
     * @param value new value to add
     * @returns current meanValue
     */
    add(value: number): number {
        this._sum += value;
        this._count++;
        return this._sum / this._count;
    }

    /**
     * get
     *
     * returns current meanValue
     *
     * @returns current meanValue
     */
    get(): number {
        return this._sum / this._count;
    }
}
