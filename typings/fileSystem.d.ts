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
interface DocumentStore {
    createDocument(collectionId: uuid.UUID, data: { [attr: string]: any }): Promise<IDocument>;
    updateDocuments(collectionId: uuid.UUID, data: { [attr: string]: any }): Promise<IDocument[]>;
    findDocuments(collectionId: uuid.UUID, filters: IFilter[], data: { [attr: string]: any }): Promise<IDocument[]>; 
    deleteDocuments(collectionId: uuid.UUID, data: { [attr: string]: any }): Promise<IDocument[]>;
    // TODO: Add index cretion here
}

interface CollectionStore { }

// Collection Stores and Document stores are dumb
// For example, a document might not be valid because it doesn't satisfy uniqueness condition on some field due to a constraint. 
// However, Document Store doesn't know or care about constraints
// Whoever created the document and is requesting for it to be saved should verify things like that