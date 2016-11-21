import { FileSystemError } from "./fileSystemError";
const btree = require('btreejs');

export class SpiderIndex {
    private tree: any;
    private unique: boolean;

    constructor(unique: boolean) {
        const Tree = this.tree = btree.create(2, btree.strcmp);
        this.tree = new Tree();
        this.unique = unique;
    }

    insert(key: any, blockId: number): void {
        let blockIds = this.tree.get(key);

        if (this.exists(blockIds) && this.unique) {
            throw new FileSystemError(`Key, ${key}, already exists in the index which requires unique keys.`);
        }

        if (this.unique) {
            this.tree.put(key, [blockId]);
        } else {
            this.tree.put(key, blockIds.concat(blockId), true);
        }
    }

    get(key: any): number[] {
        let blockIds = this.tree.get(key);

        if (!this.exists(blockIds)) {
            throw new FileSystemError(`Key, ${key}, does not exist to get`);
        }

        return blockIds;
    }

    delete(key: any, blockId: number): void {
        let blockIds = this.tree.get(key);

        if (!this.exists(blockIds) || blockIds.indexOf(blockId) === -1) {
            throw new FileSystemError(`Key, ${key}, or value ${blockId} does not exist to delete`);
        }

        blockIds = blockIds.filter(v => v !== blockId);

        if (blockIds.length === 0) {
            this.tree.del(key);
        } else {
            this.tree.put(key, blockIds, true);
        }
    }

    getRange(min: any, max: any): number[] {
        let result = [];

        this.tree.walk(min, max, (key, val) => {
            result = result.concat(val);
        });

        return result;
    }

    filter(filter: (key: string) => boolean): number[] {
        let result = [];

        this.tree.walk((key, val) => {
            if (filter(key)) {
                result = result.concat(val);
            }
        });

        return result;
    }

    private exists(value: number[]): boolean {
        return typeof value !== "undefined";
    }
}