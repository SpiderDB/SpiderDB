import { DataStore } from "./dataStore";
import * as uuid from "node-uuid";

export class DocumentStore implements IDocumentStore {
    private collections: { [name: string]: DataStore<IDocument> };

    private constructor() {
        this.collections = {};
    }

    static async create(collections: ICollection[]): Promise<IDocumentStore> {
        let documentStore = new DocumentStore();

        for (let collection of collections) {
            await documentStore.createCollection(collection);
        }

        return documentStore;
    }

    async createCollection(collection: ICollection): Promise<void> {
        let dataStore = await DataStore.create<IDocument>(`db/documents/${collection.name}.db`);
        this.collections[collection.name] = dataStore;

        for (let constraint of collection.constraints) {
            await this.createIndex(collection.name, constraint);
        }
    }

    async deleteCollection(collection: ICollection): Promise<void> {
        await this.collections[collection.name].destroy();
        delete this.collections[collection.name];
    }

    async createDocument(collectionName: string, data: Object): Promise<IDocument> {
        let document: IDocument = Object.assign({ _id: uuid.v4() }, data);
        return (await this.getCollection(collectionName)).insert(document);
    }

    async updateDocument(collectionName: string, id: string, data: Object): Promise<IDocument> {
        return (await this.getCollection(collectionName)).update(id, data);
    }

    async retrieveDocuments(collectionName: string, filters: IFilter[]): Promise<IDocument[]> {
        return (await this.getCollection(collectionName)).retrieve(filters);
    }

    async deleteDocument(collectionName: string, id: string): Promise<IDocument> {
        return (await this.getCollection(collectionName)).delete(id);
    }

    async createIndex(collectionName: string, constraint: IConstraint): Promise<void> {
        return (await this.getCollection(collectionName)).createIndex(constraint.field, constraint.type === ConstraintType.Unique);
    }

    async removeIndex(collectionName: string, constraint: IConstraint): Promise<void> {
        return (await this.getCollection(collectionName)).removeIndex(constraint.field);
    }

    private async getCollection(collectionName: string): Promise<DataStore<IDocument>> {
        if (!this.collections[collectionName]) {
            let dataStore = await DataStore.create<IDocument>(`db/documents/${collectionName}.db`);
            this.collections[collectionName] = dataStore;
        }

        return this.collections[collectionName];
    }
}