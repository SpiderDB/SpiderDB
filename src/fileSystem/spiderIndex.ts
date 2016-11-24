import { FileSystemError } from "./fileSystemError";
import * as _ from "lodash";
const BPlusTree = require('bplustree');

export class SpiderIndex {
    private tree: any;
    private unique: boolean;

    constructor(unique: boolean) {
        this.tree = new BPlusTree();
        this.unique = unique;
    }

    insert(key: any, blockId: number): void {
        let keyStr = "" + key;
        let blockIds = this.tree.fetch(keyStr);

        if (this.exists(blockIds) && this.unique) {
            throw new FileSystemError(`Key, ${keyStr}, already exists in the index which requires unique keys.`);
        }

        this.tree.store(keyStr, blockId);
    }

    get(key: any): number[] {
        let keyStr = "" + key;
        let blockIds = this.tree.fetch(keyStr);

        if (!this.exists(blockIds)) {
            throw new FileSystemError(`Key, ${keyStr}, does not exist to get`);
        }

        return blockIds;
    }

    delete(key: any, blockId: number): void {
        let keyStr = "" + key;
        let blockIds = this.tree.fetch(keyStr);

        if (!this.exists(blockIds) || blockIds.indexOf(blockId) === -1) {
            throw new FileSystemError(`Key, ${keyStr}, or value ${blockId} does not exist to delete`);
        }

        blockIds = blockIds.filter(v => v !== blockId);

        this.tree.remove(keyStr, blockId);
    }

    getRange(min: any, max: any): number[] {
        let minStr = "" + min;
        let maxStr = "" + max;

        return this.tree.fetchRange(minStr, maxStr);
    }

    filter(filter: (key: string) => boolean): number[] {
        let result = [];

        let generator = this.tree.values();

        let value = generator.next();

        while (typeof value.value !== "undefined") {
            if (filter(value.value.k)) {
                result = result.concat(value.value.v);
            }

            value = generator.next();
        }

        return result;
    }

    private exists(value: number[]): boolean {
        return !!value;
    }
}