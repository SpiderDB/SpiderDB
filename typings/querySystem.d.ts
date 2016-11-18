
interface IQueryError extends Error {

}

// Verifies the query is valid and constructs a transaction if necessary otherwise returns the data requested
interface IQueryEngine {
    initialize(): Promise<void>;
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
    executeDocumentCreation(documentCreationOperation: IDocumentCreationOperation): Promise<IDocument>;
    executeDocumentDeletion(documentDeletionOperations: IDocumentDeletionOperation[]): Promise<IDocument[]>;
    executeDocumentUpdate(documentUpdateOperations: IDocumentUpdateOperation[]): Promise<IDocument[]>;

    executeCollectionCreation(collectionCreationOperation: ICollectionCreationOperation): Promise<ICollection>;
    executeCollectionDeletion(collectionDeletionOperation: ICollectionDeletionOperation): Promise<ICollection>;

    executeConstraintCreation(constraintCreationOperation: IConstraintCreationOperation): Promise<IConstraint>;
    executeConstraintDeletion(constraintDeletionOperation: IConstraintDeletionOperation): Promise<IConstraint>;
}

type Transaction = IOperation | IOperation[];
interface IOperation { }

interface IDocumentCreationOperation extends IOperation { 
    collectionName: string;
    value: Object;
}

interface IDocumentDeletionOperation extends IOperation { 
    collectionName: string;
    document: IDocument;
}

interface IDocumentUpdateOperation extends IOperation { 
    collectionName: string;
    document: IDocument;
    value: Object;
}

interface ICollectionCreationOperation extends IOperation { 
    name: string;
}

interface ICollectionDeletionOperation extends IOperation { 
    name: string;
    documentDeletionOperations: IDocumentDeletionOperation[];
    constraintDeletionOperations: IConstraintDeletionOperation[];
    collection: ICollection;
}

interface IConstraintCreationOperation extends IOperation { 
    collectionName: string;
    type: ConstraintType;
    name: string;
    field: string;
}

interface IConstraintDeletionOperation extends IOperation { 
    collectionName: string;
    constraint: IConstraint;
}