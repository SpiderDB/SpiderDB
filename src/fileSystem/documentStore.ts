import { DataStore } from "./dataStore";
import * as uuid from "node-uuid";

export class DocumentStore implements IDocumentStore {
    private collections: { [name: string]: DataStore<IDocument> };

    constructor() {
        this.collections = {};
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