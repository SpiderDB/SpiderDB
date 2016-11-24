
// Verifies the query is valid and constructs a transaction if necessary otherwise returns the data requested
interface IQueryEngine {
    // We can't know we get back since it could be an aggregation
    evaluateDocumentRetrieval(query: IDocumentRetrievalQuery): Promise<any>;
    evaluateDocumentCreation(query: IDocumentCreationQuery): Promise<IDocumentCreationOperation>;
    evaluateDocumentDeletion(query: IDocumentDeletionQuery): Promise<IDocumentDeletionOperation[]>;
    evaluateDocumentUpdate(query: IDocumentUpdateQuery): Promise<IDocumentUpdateOperation[]>;

    evaluateCollectionRetrieval(query: ICollectionRetrievalQuery): Promise<ICollection>;
    evaluateCollectionCreation(query: ICollectionCreationQuery): Promise<ICollectionCreationOperation>;
    evaluateCollectionDeletion(query: ICollectionDeletionQuery): Promise<ICollectionDeletionOperation>;
    evaluateListConstraints(query: ICollectionListConstraintsQuery): Promise<IConstraint[]>;

    evaluateConstraintRetrieval(query: IConstraintRetrievalQuery): Promise<IConstraint>;
    evaluateConstraintCreation(query: IConstraintCreationQuery): Promise<IConstraintCreationOperation>;
    evaluateConstraintDeletion(query: IConstraintDeletionQuery): Promise<IConstraintDeletionOperation>;

    evaluateDBListCollections(query: IDBListCollectionsQuery): Promise<ICollection[]>;
    evaluateDBClear(query: IDBClearQuery): Promise<IDBClearOperation>;
}

/*
Rollback with includeCommitted will be able to rollback committed changes
This will be used to allow undos
For example, the log looks like:
CHKPT
DELETEDOCUMENT ....
DELETEDOCUMENT ...
CHKPT

rollback(false) will do nothing.
rollback(true) will delete until the top CHKPT
*/
interface ITransactionProcessor {
    hasError(): Promise<boolean>; // Returns true if entries in log are not checkpointed
    rollback(includeCommitted: boolean): Promise<void>;
    executeDocumentCreation(documentCreationOperation: IDocumentCreationOperation, save?: boolean): Promise<IDocument>;
    executeDocumentDeletion(documentDeletionOperations: IDocumentDeletionOperation[], save?: boolean): Promise<IDocument[]>;
    executeDocumentUpdate(documentUpdateOperations: IDocumentUpdateOperation[], save?: boolean): Promise<IDocument[]>;

    executeCollectionCreation(collectionCreationOperation: ICollectionCreationOperation, save?: boolean): Promise<ICollection>;
    executeCollectionDeletion(collectionDeletionOperation: ICollectionDeletionOperation, save?: boolean): Promise<ICollection>;

    executeConstraintCreation(constraintCreationOperation: IConstraintCreationOperation, save?: boolean): Promise<IConstraint>;
    executeConstraintDeletion(constraintDeletionOperation: IConstraintDeletionOperation, save?: boolean): Promise<IConstraint>;

    executeDBClear(dbClearOperation: IDBClearOperation, save?: boolean): Promise<ICollection[]>;
}

type Transaction = IOperation | IOperation[];

declare const enum OperationType {
    documentCreation = 0,
    documentDeletion = 1,
    documentUpdate = 2,
    collectionCreation = 3,
    collectionDeletion = 4,
    constraintCreation = 5,
    constraintDeletion = 6,
    checkpoint = 7,
    dbClear = 8
}

type IOperation = IDocumentCreationOperation | IDocumentDeletionOperation | IDocumentUpdateOperation 
    | ICollectionCreationOperation | ICollectionDeletionOperation | IConstraintCreationOperation 
    | IConstraintDeletionOperation | ICheckpoint | IDBClearOperation;

interface IDBClearOperation { 
    type: OperationType.dbClear;
    collectionDeletionOperations: ICollectionDeletionOperation[];
}

interface IDocumentCreationOperation { 
    type: OperationType.documentCreation;
    collectionName: string;
    document: IDocument;
}

interface IDocumentDeletionOperation { 
    type: OperationType.documentDeletion;
    collectionName: string;
    document: IDocument;
}

interface IDocumentUpdateOperation { 
    type: OperationType.documentUpdate;
    collectionName: string;
    oldDocument: IDocument;
    newDocument: IDocument;
}

interface ICollectionCreationOperation { 
    type: OperationType.collectionCreation;
    collection: ICollection;
}

interface ICollectionDeletionOperation { 
    type: OperationType.collectionDeletion;
    documentDeletionOperations: IDocumentDeletionOperation[];
    constraintDeletionOperations: IConstraintDeletionOperation[];
    collection: ICollection;
}

interface IConstraintCreationOperation { 
    type: OperationType.constraintCreation;
    collectionName: string;
    constraint: IConstraint;
}

interface IConstraintDeletionOperation { 
    type: OperationType.constraintDeletion;
    collectionName: string;
    constraint: IConstraint;
}

interface ICheckpoint {
    type: OperationType.checkpoint;
}