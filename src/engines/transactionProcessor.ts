import * as fs from "async-file";
import * as path from "path";
import * as stream from "stream";
import SmartBuffer = require("smart-buffer");
import { FileSystemError } from "../fileSystem/fileSystemError";
let fsR = require("fs-reverse");

export class TransactionProcessor implements ITransactionProcessor {
    private documentStore: IDocumentStore;
    private collectionStore: ICollectionStore;
    private filePath = "db/transaction.log";

    private constructor(documentStore: IDocumentStore, collectionStore: ICollectionStore) {
        this.documentStore = documentStore;
        this.collectionStore = collectionStore;
    }

    static async create(documentStore: IDocumentStore, collectionStore: ICollectionStore): Promise<ITransactionProcessor> {
        let transactionProcessor = new TransactionProcessor(documentStore, collectionStore);
        await transactionProcessor.initialize();

        return transactionProcessor;
    }

    private async initialize(): Promise<void> {
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

        if (this.hasError()) {
            return this.rollback(false);
        }
    }

    async hasError(): Promise<boolean> {
        let operations = await this.read(false);
        return operations.length !== 0;
    }

    async rollback(includeCommitted: boolean): Promise<void> {
        let operations = await this.read(includeCommitted);

        if (operations.length === 0) {
            return;
        }

        // NOTE:Operations might not have ben fully executed so only attempt to undo
        // A better way to do this is to possibly have both an attempt and complete log message, but I'm too lazy to implement...
        for (let operation of operations) {
            if (operation.type === OperationType.documentCreation) {
                let documentDeletion: IDocumentDeletionOperation = {
                    type: OperationType.documentDeletion,
                    collectionName: operation.collectionName,
                    document: operation.document
                };

                try {
                    await this.executeDocumentDeletion([documentDeletion], false);
                } catch (e) { 
                    throw e;
                }

            } else if (operation.type === OperationType.documentDeletion) {
                let documentCreation: IDocumentCreationOperation = {
                    type: OperationType.documentCreation,
                    collectionName: operation.collectionName,
                    document: operation.document
                };

                try {
                    await this.executeDocumentCreation(documentCreation, false); 
                } catch (e) { }

            } else if (operation.type === OperationType.documentUpdate) {
                let documentUpdate: IDocumentUpdateOperation = {
                    type: OperationType.documentUpdate,
                    collectionName: operation.collectionName,
                    oldDocument: operation.newDocument,
                    newDocument: operation.oldDocument
                };

                try {
                    await this.executeDocumentUpdate([documentUpdate], false);
                } catch (e) { }
            } else if (operation.type === OperationType.collectionCreation) {
                let collectionDeletion: ICollectionDeletionOperation = {
                    type: OperationType.collectionDeletion,
                    collection: operation.collection,
                    constraintDeletionOperations: [],
                    documentDeletionOperations: []
                };

                try {
                    await this.executeCollectionDeletion(collectionDeletion, false);
                } catch (e) { }
            } else if (operation.type === OperationType.collectionDeletion) {
                // Note: clearing out constraints, because subsequent constraintCreation operations will deal with it.
                operation.collection.constraints = [];
                let collectionCreation: ICollectionCreationOperation = {
                    type: OperationType.collectionCreation,
                    collection: operation.collection
                };

                try {
                    await this.executeCollectionCreation(collectionCreation, false);
                } catch (e) { }
            } else if (operation.type === OperationType.constraintCreation) {
                let constraintDeletion: IConstraintDeletionOperation = {
                    type: OperationType.constraintDeletion,
                    collectionName: operation.collectionName,
                    constraint: operation.constraint
                };

                try {
                    await this.executeConstraintDeletion(constraintDeletion, false);
                } catch (e) { }
            } else if (operation.type === OperationType.constraintDeletion) {
                let constraintCreation: IConstraintCreationOperation = {
                    type: OperationType.constraintCreation,
                    collectionName: operation.collectionName,
                    constraint: operation.constraint
                };

                try {
                    await this.executeConstraintCreation(constraintCreation, false);
                } catch (e) { }
            }
        }

        return this.save();
    }

    async executeDocumentCreation(operation: IDocumentCreationOperation, save?: boolean): Promise<IDocument> {
        await this.write(operation);

        let document = await this.documentStore.createDocument(operation.collectionName, operation.document);

        if (save) {
            await this.save();
        }

        return document;
    }

    async executeDocumentDeletion(operations: IDocumentDeletionOperation[], save?: boolean): Promise<IDocument[]> {
        let documents: IDocument[] = [];

        for (let operation of operations) {
            await this.write(operation);
            documents.push(await this.documentStore.deleteDocument(operation.collectionName, operation.document._id));
        }

        if (save) {
            await this.save();
        }

        return documents;
    }

    async executeDocumentUpdate(operations: IDocumentUpdateOperation[], save?: boolean): Promise<IDocument[]> {
        let documents: IDocument[] = [];

        for (let operation of operations) {
            await this.write(operation);
            documents.push(await this.documentStore.updateDocument(operation.collectionName, operation.oldDocument._id, operation.newDocument));
        }

        if (save) {
            await this.save();
        }

        return documents;
    }

    async executeCollectionCreation(operation: ICollectionCreationOperation, save?: boolean): Promise<ICollection> { 
        await this.write(operation);
        let collection = await this.collectionStore.createCollection(operation.collection);
        await this.documentStore.createCollection(collection);

        if (save) {
            await this.save();
        }

        return collection;
    }

    async executeCollectionDeletion(operation: ICollectionDeletionOperation, save?: boolean): Promise<ICollection> {
        await this.executeDocumentDeletion(operation.documentDeletionOperations, false);

        let collection = await this.collectionStore.retrieveCollection(operation.collection.name);

        for (let constraintDeletionOperation of operation.constraintDeletionOperations) {
            await this.executeConstraintDeletion(constraintDeletionOperation, false);
        }

        await this.write(operation);
        await this.collectionStore.deleteCollection(operation.collection._id);
        await this.documentStore.deleteCollection(collection);

        if (save) {
            await this.save();
        }

        return collection;
    }

    async executeConstraintCreation(operation: IConstraintCreationOperation, save?: boolean): Promise<IConstraint> { 
        await this.write(operation);
        let constraint = await this.collectionStore.createConstraint(operation.collectionName, operation.constraint);
        await this.documentStore.createIndex(operation.collectionName, operation.constraint);

        if (save) {
            await this.save();
        }

        return constraint;
    }

    async executeConstraintDeletion(operation: IConstraintDeletionOperation, save?: boolean): Promise<IConstraint> { 
        await this.write(operation);
        let constraint = await this.collectionStore.deleteConstraint(operation.collectionName, operation.constraint.name);
        await this.documentStore.removeIndex(operation.collectionName, operation.constraint);

        if (save) {
            await this.save();
        }

        return constraint;
    }

    async executeDBClear(operation: IDBClearOperation, save?: boolean): Promise<ICollection[]> {
        let collections: ICollection[] = [];
        for (let collectionDeletionOperation of operation.collectionDeletionOperations) {
            collections.push(await this.executeCollectionDeletion(collectionDeletionOperation, false));
        }

        if (save) {
            await this.save();
        }

        return collections;
    }

    private async save(): Promise<void> {
        let checkpoint: ICheckpoint = {
            type: OperationType.checkpoint
        };

        return this.write(checkpoint);
    }

    private async write(operation: IOperation): Promise<void> {
        let smartBuffer = new SmartBuffer();
        smartBuffer.writeStringNT(JSON.stringify(operation));

        return fs.appendFile(this.filePath, smartBuffer.toBuffer());
    }


    private async read(includeCommitted: boolean): Promise<IOperation[]> {
        let data: IOperation[] = [];
        let opts = { flags: 'r' , matcher: '\0' };
        
        let readStream: stream.Readable = fsR(this.filePath, opts);

        let firstEntry = true;
        let firstCheckpoint = true;
        let end = false;

        readStream.on("data", chunk => {
            if (end || chunk === "") {
                return;
            }

            let operation: IOperation;
            if (chunk instanceof Buffer) {
                operation = JSON.parse(chunk.toString());
            } else {
                operation = JSON.parse(chunk);
            }

            if (operation.type === OperationType.checkpoint) {
                if (!includeCommitted) {
                    end = true;
                    return;
                } else if (!firstEntry && firstCheckpoint) {
                    end = true;
                    return;
                } else if (!firstCheckpoint) {
                    end = true;
                    return;
                } else {
                    firstCheckpoint = false;
                }
            } else {
                data.push(operation);
            }

            firstEntry = false;
        });

        return new Promise<IOperation[]>((resolve, reject) => {
            readStream.on('end',function(){
                resolve(data);
            });

            readStream.on("error", () => {
                reject(new FileSystemError("Could not read from transaction log"));
            });
        });
    }
}