import { FileSystemError } from "./fileSystemError";
const btree = require('btreejs');

export class SpiderIndex {
    private tree: any;
    private unique: boolean;

    constructor(unique: boolean) {
        const Tree = this.tree = btree.create(2, (a, b) => a.localeCompare(b));
        this.tree = new Tree();
        this.unique = unique;
    }

    insert(key: any, blockId: number): void {
        let keyStr = "" + key;
        let blockIds = this.tree.get(keyStr);

        if (this.exists(blockIds) && this.unique) {
            throw new FileSystemError(`Key, ${keyStr}, already exists in the index which requires unique keys.`);
        }


        if (this.unique) {
            this.tree.put(keyStr, [blockId]);
        } else {
            blockIds = blockIds || [];
            this.tree.put(keyStr, blockIds.concat(blockId), true);
        }
    }

    get(key: any): number[] {
        let keyStr = "" + key;
        let blockIds = this.tree.get(keyStr);

        if (!this.exists(blockIds)) {
            throw new FileSystemError(`Key, ${keyStr}, does not exist to get`);
        }

        return blockIds;
    }

    delete(key: any, blockId: number): void {
        let keyStr = "" + key;
        let blockIds = this.tree.get(keyStr);

        if (!this.exists(blockIds) || blockIds.indexOf(blockId) === -1) {
            throw new FileSystemError(`Key, ${keyStr}, or value ${blockId} does not exist to delete`);
        }

        blockIds = blockIds.filter(v => v !== blockId);

        if (blockIds.length === 0) {
            this.tree.del(keyStr);
        } else {
            this.tree.put(keyStr, blockIds, true);
        }
    }

    getRange(min: any, max: any): number[] {
        let minStr = "" + min;
        let maxStr = "" + max;
        let result = [];

        this.tree.walk(minStr, maxStr, (key, val) => {
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