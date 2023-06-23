/**
 * Stores n amount of most recent data. If buffer is full, it will override oldest data with new one.
 */
export class CircularBuffer<T> {

    private _size: number;
    private pointer: number;
    private data: T[];

    constructor(size: number, data: T[] = []) {
        if (data && data.length > size) {
            throw new Error('CircularBuffer error: Starting data set is bigger than declared size of CircularBuffer');
        }
        this._size = size;
        this.data = data;
        this.pointer = 0;
    }

    public clear(): CircularBuffer<T> {
        this.data = [];
        return this;
    }

    public push(obj: T): CircularBuffer<T> {
        if (this.data.length < this._size) {
            this.data.push(obj);
            return this;
        }
        this.data[this.pointer] = obj;
        this.pointer = (this.pointer + 1) % this._size;
        return this;
    }

    public get(index: number): T {
        return this.data[index];
    }

    public getAll(): T[] {
        return this.data;
    }

    public show(): void {
        console.log(this.data);
    }

    get size(): number { return this._size; }
}
