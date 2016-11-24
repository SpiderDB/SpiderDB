interface IIdentifiable {
    _id: string;
}

interface IDocument extends IIdentifiable {
    [attr: string]: any;
}

interface ICollection extends IIdentifiable {
    name: string;
    constraints: IConstraint[]
}

interface IConstraint extends IIdentifiable {
    name: string;
    type: ConstraintType;
    field: string;
} 

interface IDocumentStore {
    createCollection(collection: ICollection): Promise<void>;
    deleteCollection(collection: ICollection): Promise<void>;
    createDocument(collectionName: string, document: IDocument): Promise<IDocument>;
    updateDocument(collectionName: string, id: string, document: IDocument): Promise<IDocument>;
    retrieveDocuments(collectionName: string, filters: IFilter[]): Promise<IDocument[]>; 
    deleteDocument(collectionName: string, data: Object): Promise<IDocument>;
    createIndex(collectionName: string, constraint: IConstraint): Promise<void>;
    removeIndex(collectionName: string, constraint: IConstraint): Promise<void>;
}

interface ICollectionStore { 
    listConstraints(collectionName: string): Promise<IConstraint[]>;
    listCollections(): Promise<ICollection[]>;
    createCollection(collection: ICollection): Promise<ICollection>;
    retrieveCollection(name: string): Promise<ICollection>;
    deleteCollection(id: string): Promise<ICollection>;

    createConstraint(collectionName: string, constraint: IConstraint): Promise<IConstraint>;
    deleteConstraint(collectionName: string, constraintName: string): Promise<IConstraint>;
    retrieveConstraint(collectionName: string, constraintName: string): Promise<IConstraint>;
}