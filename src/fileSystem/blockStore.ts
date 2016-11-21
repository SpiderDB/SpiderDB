import * as path from "path";
import { Block } from "./block";
import * as fs from "async-file";
import * as fs2 from "fs";
import SmartBuffer = require("smart-buffer");
import * as _ from "lodash";

// TODO: ADD LRU cache
export class BlockStore<T extends IIdentifiable> {
    private freeSpace: { free: number, id: number }[];
    private blockSize: number;
    private recordsPerBlock: number;
    private filePath: string;
    private numBlocks: number;

    private constructor(filePath: string) {
        this.recordsPerBlock = 5;
        this.blockSize = 500;
        this.freeSpace = [];
        this.numBlocks = 0;
        this.filePath = filePath;
    }

    static async create<R extends IIdentifiable>(fileName: string): Promise<BlockStore<R>> {
        let blockStore = new BlockStore<R>(fileName);
        await blockStore.initialize();
        return blockStore;
    }

    async initialize(): Promise<void> {
        let dir = path.dirname(this.filePath);

        try {
            await fs.access(dir, fs.constants.F_OK);
        } catch (e) {
            await fs.mkdirp(this.filePath);
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
        // await fs.read(fd, buffer, 0, buffer.length, blockId * this.blockSize);

        await new Promise((resolve: (obj: { bytesRead: number }) => void, reject) => {
            fs2.read(fd, buffer, 0, buffer.length, null, (err, bytesRead) => {
                if (!err) { 
                    resolve({ bytesRead: bytesRead }); 
                } else { 
                    reject({ bytesRead: -1 }); 
                }
            });
        });

        return this.deserializeBuffer(buffer);
    }

    async writeBlock(block: Block<T>): Promise<void> {
        let fd = await fs.open(this.filePath, "w");

        // the async function exposed in async-file never resolves. Need to default back to original fs
        await new Promise((resolve, reject) => {
            fs2.write(fd, this.serializeBlock(block), this.blockSize * block.id, this.blockSize, err => {
                if (!err) { resolve(); } else { reject(); }
            });
        });

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

    // TODO: FIX THIS !!!!!!!!!!!!!!!!
    async scan(callback: (block: Block<T>) => void): Promise<void> {
        let buffer = Buffer.alloc(this.blockSize);

        let fd = await fs.open(this.filePath, "r");

        let result = await new Promise((resolve: (obj: { bytesRead: number }) => void, reject) => {
            fs2.read(fd, buffer, 0, buffer.length, null, (err, bytesRead) => {
                if (!err) { 
                    resolve({ bytesRead: bytesRead }); 
                } else { 
                    reject({ bytesRead: -1 }); 
                }
            });
        });

        // let result = await fs.read(fd, buffer, 0, buffer.length, null);

        while (result.bytesRead !== 0) {
           callback(this.deserializeBuffer(buffer));

            result = await new Promise((resolve: (obj: { bytesRead: number }) => void, reject) => {
                fs2.read(fd, buffer, 0, buffer.length, null, (err, bytesRead) => {
                    if (!err) { 
                        resolve({ bytesRead: bytesRead }); 
                    } else { 
                        reject({ bytesRead: -1 }); 
                    }
                });
            });
        //    result = await fs.read(fd, buffer, 0, buffer.length, null);
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
        return new Block(this.numBlocks++, 4, []);
    }
}