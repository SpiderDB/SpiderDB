import * as path from "path";
import { Block } from "./block";
import * as fs from "async-file";
import * as fs2 from "./async-fs";
import SmartBuffer = require("smart-buffer");
import * as _ from "lodash";
import { FileSystemError } from "./fileSystemError";

// TODO: ADD LRU cache
export class BlockStore<T extends IIdentifiable> {
    private freeSpace: { free: number, id: number }[];
    private blockSize: number;
    private recordsPerBlock: number;
    private filePath: string;
    private numBlocks: number;

    private constructor(filePath: string) {
        this.recordsPerBlock = 5;
        this.blockSize = 10000;
        this.freeSpace = [];
        this.numBlocks = 0;
        this.filePath = filePath;
    }

    static async create<R extends IIdentifiable>(fileName: string): Promise<BlockStore<R>> {
        let blockStore = new BlockStore<R>(fileName);
        await blockStore.initialize();
        return blockStore;
    }

    destroy(): Promise<void> {
        return fs.delete(this.filePath);
    }

    async initialize(): Promise<void> {
        let dir = path.dirname(this.filePath);

        try {
            await fs.access(dir, fs.constants.F_OK);
        } catch (e) {
            await fs.mkdirp(dir);
        }

        try {
            await fs.access(this.filePath, fs.constants.F_OK);
        } catch (e) {
            await fs.writeFile(this.filePath, "");
        }

        return this.computeFreeSpace();
    }

    async getAll(): Promise<Block<T>[]> {
        let blocks = [];

        await this.scan(b => blocks.push(b));
        return blocks;
    }

    async getBlockWithFreeSpace(sizeRequired: number): Promise<Block<T>> {
        let index  = _.findIndex(this.freeSpace, f => sizeRequired <= f.free);

        if (index === -1) {
            return this.createNewBlock();
        }

        return await this.getBlock(this.freeSpace[index].id);
    }

    async getBlock(blockId: number): Promise<Block<T>> {
        let buffer = new Buffer(this.blockSize);

        let fd = await fs.open(this.filePath, "r");

        await fs2.read(fd, buffer, blockId * this.blockSize);
        return this.deserializeBuffer(buffer);
    }

    async writeBlock(block: Block<T>): Promise<void> {
        let fd: number;

        if (block.size > this.blockSize) {
            throw new FileSystemError("Record is too large. Cannot save!");
        }

        // TODO: Verify if this works on windows
        if (block.newBlock) {
            fd = await fs.open(this.filePath, "a");
            block.newBlock = false;
        } else {
            fd = await fs.open(this.filePath, "r+");
        }

        await fs2.write(fd, this.serializeBlock(block), 0, this.blockSize, this.blockSize * block.id);

        if (block.size < this.blockSize) {
            let index = _.findIndex(this.freeSpace, f => f.id === block.id);

            if (index === -1) {
                this.freeSpace.push({
                    free: this.blockSize - block.size,
                    id: block.id
                });
            } else {
                this.freeSpace[index].free = this.blockSize - block.size;
            }
        } else {
            _.remove(this.freeSpace, f => f.id === block.id);
        }

        return fs.close(fd);
    }

    async scan(callback: (block: Block<T>) => void): Promise<void> {
        let buffer = Buffer.alloc(this.blockSize);

        let fd = await fs.open(this.filePath, "r");

        let result = await fs2.read(fd, buffer, null);

        while (result.bytesRead !== 0) {
           callback(this.deserializeBuffer(buffer));
           result = await fs2.read(fd, buffer, null);
        }

        return fs.close(fd);
    }

    private computeFreeSpace(): Promise<void> {
        this.freeSpace = [];
        this.numBlocks = 0;

        return this.scan(block => {
            this.numBlocks++;

            if (block.size <= this.blockSize) {
                this.freeSpace.push({
                    free: this.blockSize - block.size,
                    id: block.id
                });
            }
        });
    }

    private serializeBlock(block: Block<T>): Buffer {
        let writer = new SmartBuffer();

        writer.writeUInt16BE(block.id);
        writer.writeUInt16BE(block.size);
        writer.writeUInt16BE(block.records.length);

        for (let record of block.records) {
            writer.writeStringNT(JSON.stringify(record));
        }

        let fullLengthBuffer = Buffer.alloc(this.blockSize);
        writer.toBuffer().copy(fullLengthBuffer);

        return fullLengthBuffer;
    }

    private deserializeBuffer(buffer: Buffer): Block<T> {
        let reader = new SmartBuffer(buffer);

        let id = reader.readUInt16BE();
        let size = reader.readUInt16BE();
        let numRecords = reader.readUInt16BE();

        let records: T[] = [];

        for (let i = 0; i < numRecords; i++) {
            records.push(JSON.parse(reader.readStringNT()));
        }

        return new Block(id, size, records);
    }

    private createNewBlock(): Block<T> {
        return new Block(this.numBlocks++, 4, [], true);
    }
}