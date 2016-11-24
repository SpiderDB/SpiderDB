import * as _ from "lodash";
import { SpiderIndex } from "./spiderIndex";
import { BlockStore } from "./blockStore";

export class DataStore<T extends IIdentifiable> {
    private blockStore : BlockStore<T>;
    private indexes: { [fieldName: string]: SpiderIndex };

    private constructor(blockStore: BlockStore<T>) {
        this.blockStore = blockStore;
        this.indexes = {};
    }

    static async create<R extends IIdentifiable>(fileName: string): Promise<DataStore<R>> {
        let blockStore = await BlockStore.create<R>(fileName);
        let dataStore = new DataStore<R>(blockStore);
        await dataStore.createIndex("_id", true);
        return dataStore;
    }

    destroy(): Promise<void> {
        return this.blockStore.destroy();
    }

    // TODO: Optimize this to perform all IWhereFilters using index
    async retrieve(filters: IFilter[]): Promise<T[]> {
        let whereFilterIndex = _.findIndex(filters, f => f.type === FilterType.Where && !!this.indexes[(f as IWhereFilter).field]);
        let records: T[] = [];

        // First whereFilter found can use an index to speed up retrieval
        if (whereFilterIndex !== -1) {
            let whereFilter = filters[whereFilterIndex] as IWhereFilter;

            let extractRecords = async (blockIds: number[], filter: (record: T) => boolean): Promise<T[]> => {
                let promises = _.map(blockIds, b => this.blockStore.getBlock(b));
                let blocks = await Promise.all(promises);
                records = _.flatMap(blocks, b => b.records.filter(filter));
                return records;
            };

            if (whereFilter.operator === WhereOperator.equal) {
                let blockIds = this.indexes[whereFilter.field].filter(k => k === whereFilter.value);
                records = await extractRecords(blockIds, (r) => r[whereFilter.field] === whereFilter.value);
            } else if (whereFilter.operator === WhereOperator.notEqual) {
                let blockIds = this.indexes[whereFilter.field].filter(k => k !== whereFilter.value);
                records = await extractRecords(blockIds, (r) => r[whereFilter.field] !== whereFilter.value);
            } else if (whereFilter.operator === WhereOperator.greaterThan) {
                let blockIds = this.indexes[whereFilter.field].getRange(whereFilter.value, null);
                records = await extractRecords(blockIds, (r) => r[whereFilter.field] > whereFilter.value);
            } else if (whereFilter.operator === WhereOperator.greaterThanEqual) {
                let blockIds = this.indexes[whereFilter.field].filter(k => k >= whereFilter.value);
                records = await extractRecords(blockIds, (r) => r[whereFilter.field] >= whereFilter.value);
            } else if (whereFilter.operator === WhereOperator.lessThan) {
                let blockIds = this.indexes[whereFilter.field].getRange(null, whereFilter.value);
                records = await extractRecords(blockIds, (r) => r[whereFilter.field] < whereFilter.value);
            } else if (whereFilter.operator === WhereOperator.lessThanEqual) {
                let blockIds = this.indexes[whereFilter.field].filter(k => k <= whereFilter.value);
                records = await extractRecords(blockIds, (r) => r[whereFilter.field] <= whereFilter.value);
            }
        } else {
            await this.blockStore.scan(b => {
                records = records.concat(b.records);
            });
        }

        for (let i = 0; i < filters.length; i++) {
            if (i === whereFilterIndex) {
                continue;
            }

            let filter = filters[i];

            if (filter.type === FilterType.FunctionalWhere) {
                records = _.filter(records, (filter as IFunctionalWhereFilter).filter);
            } else {
                let whereFilter = filter as IWhereFilter;

                if (whereFilter.operator === WhereOperator.equal) {
                    records = _.filter(records, r => whereFilter.field in r && r[whereFilter.field] === whereFilter.value);
                } else if (whereFilter.operator === WhereOperator.notEqual) {
                    records = _.filter(records, r => !(whereFilter.field in r) || r[whereFilter.field] !== whereFilter.value);
                } else if (whereFilter.operator === WhereOperator.greaterThan) {
                    records = _.filter(records, r => whereFilter.field in r && r[whereFilter.field] > whereFilter.value);
                } else if (whereFilter.operator === WhereOperator.greaterThanEqual) {
                    records = _.filter(records, r => whereFilter.field in r && r[whereFilter.field] >= whereFilter.value);
                } else if (whereFilter.operator === WhereOperator.lessThan) {
                    records = _.filter(records, r => whereFilter.field in r && r[whereFilter.field] < whereFilter.value);
                } else if (whereFilter.operator === WhereOperator.lessThanEqual) {
                    records = _.filter(records, r => whereFilter.field in r && r[whereFilter.field] <= whereFilter.value);
                }
            }
        }

        return records;
    }

    async insert(record: T): Promise<T> {
        let serializedRecord = JSON.stringify(record);
        let serializedRecordSize = Buffer.byteLength(serializedRecord);
        let block = await this.blockStore.getBlockWithFreeSpace(serializedRecordSize);

        block.records.push(record);
        block.size += serializedRecordSize;

        await this.blockStore.writeBlock(block);

        for (let fieldName in this.indexes) {
            console.log(`CREATING ${fieldName} : ${record[fieldName]} : ${block.id}`);
            this.indexes[fieldName].insert(record[fieldName], block.id);
        }

        return record;
    }

    async delete(id: string): Promise<T> {
        let blockId = this.indexes["_id"].get(id)[0];
        let block = await this.blockStore.getBlock(blockId);
        let record = _.filter(block.records, r => r._id === id)[0];
        block.records = _.filter(block.records, r => r._id !== id);
        block.size -= Buffer.byteLength(JSON.stringify(record));

        for (let fieldName in this.indexes) {
            let hasCommonField = _.some(block.records, r => r[fieldName] === record[fieldName]);
            if (!hasCommonField) {
                console.log(`DELETING ${fieldName} : ${record[fieldName]} : ${block.id}`);
                this.indexes[fieldName].delete(record[fieldName], blockId);
            }
        }

        await this.blockStore.writeBlock(block);

        return record;
    }

    async update(id: string, data: Object): Promise<T> {
        await this.delete(id);
        let newRecord = data as T;
        newRecord._id = id;
        return this.insert(newRecord);
    }

    createIndex(fieldName: string, isUnique: boolean): Promise<void> {
        let index = this.indexes[fieldName] = new SpiderIndex(isUnique);

        return this.blockStore.scan(block => {
            for (let record of block.records) {
                index.insert(record[fieldName], block.id);
            }
        });
    }

    removeIndex(fieldName: string): void {
        delete this.indexes[fieldName];
    }

    hasIndex(fieldName: string): boolean {
        return !!this.indexes[fieldName];
    }
}