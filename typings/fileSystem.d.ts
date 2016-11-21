/* TODO: Finish fileSystem/Index/log writing interfaces */


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

// NOTE: MMap is blocking so it doesn't use async calls.
// However, for extensibility making the API async
interface IDocumentStore {
    createDocument(collectionName: string, data: Object): Promise<IDocument>;
    updateDocument(collectionName: string, id: string, data: Object): Promise<IDocument>;
    retrieveDocuments(collectionName: string, filters: IFilter[]): Promise<IDocument[]>; 
    deleteDocument(collectionName: string, data: Object): Promise<IDocument>;
    createIndex(collectionName: string, constraint: IConstraint): Promise<void>;
    removeIndex(collectionName: string, constraint: IConstraint): Promise<void>;
}

interface ICollectionStore { 
    listConstraints(collectionName: string): Promise<IConstraint[]>;
    listCollections(): Promise<ICollection[]>;
    createCollection(name: string): Promise<ICollection>;
    retrieveCollection(name: string): Promise<ICollection>;
    deleteCollection(id: string): Promise<ICollection>;

    createConstraint(collectionName: string, constraintName: string, field: string, type: ConstraintType): Promise<IConstraint>;
    deleteConstraint(collectionName: string, constraintName: string): Promise<IConstraint>;
    retrieveConstraint(collectionName: string, constraintName: string): Promise<IConstraint>;
}


interface MMapObject {
    close(): void;
    isData(key: any): boolean;
    isOpen(): boolean;
    isClosed(): boolean;
    [index: number]: any;
}