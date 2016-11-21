export class Block<T extends IIdentifiable> {
    id: number;
    size: number;
    records: T[];

    constructor(id: number, size: number, records: T[]) {
        this.id = id;
        this.size = size;
        this.records = records;
    }
}