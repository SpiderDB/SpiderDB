/* TODO: Finish fileSystem/Index/log writing interfaces */

interface IDocument {
    _id: uuid.UUID;
    [attr: string]: any;
}

interface ICollection {
    _id: uuid.UUID;
    name: string;
    constraints: IConstraint[]
}

interface IConstraint {
    _id: uuid.UUID;
    name: string;
    type: ConstraintType;
    field: string;
}

// TODO: flesh out document and collection store
// findDocuments is used by the QueryEngine
// everything else is used by the TransactionProcessor
interface IDocumentStore {
    createDocument(collectionName: string, data: Object): Promise<IDocument>;
    updateDocument(collectionName: string, data: Object): Promise<IDocument[]>;
    retrieveDocuments(collectionName: string, filters: IFilter[], data: Object): Promise<IDocument>; 
    deleteDocument(collectionName: string, data: Object): Promise<IDocument>;
    createIndex(collectionName: string, constraint: IConstraint): Promise<void>;
    removeIndex(collectionName: string, constraint: IConstraint): Promise<void>;
}

interface ICollectionStore { 
    listConstraints(collectionName: string): Promise<IConstraint[]>;
    listCollections(): Promise<ICollection[]>;
    createCollection(name: string): Promise<ICollection>;
    retrieveCollection(name: string): Promise<ICollection>;
    deleteCollection(name: string): Promise<ICollection>;

    createConstraint(collectionName: string, constraintName: string, field: string, type: ConstraintType): Promise<IConstraint>;
    deleteConstraint(collectionName: string, constraintName: string): Promise<IConstraint>;
    retrieveConstraint(collectionName: string, constraintName: string): Promise<IConstraint>;
}

// Collection Stores and Document stores are dumb
// For example, a document might not be valid because it doesn't satisfy uniqueness condition on some field due to a constraint. 
// However, Document Store doesn't know or care about constraints
// Whoever created the document and is requesting for it to be saved should verify things like that