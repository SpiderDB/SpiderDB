export class Block<T extends IIdentifiable> {
    newBlock: boolean;
    id: number;
    size: number;
    records: T[];

    constructor(id: number, size: number, records: T[], newBlock?: boolean) {
        this.newBlock = !!newBlock;
        this.id = id;
        this.size = size;
        this.records = records;
    }
}