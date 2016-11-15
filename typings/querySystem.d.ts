
// Verifies the query is valid and constructs a transaction if necessary otherwise returns the data requested
interface IQueryEngine {
    evaluateDocumentRetrieval(documentRetrievalQuery: IDocumentRetrievalQuery): Promise<any>;
    evaluateDocumentCreation(documentCreationQuery: IDocumentCreationQuery): Promise<IDocumentCreationOperation>;
    evaluateDocumentDeletion(documentCreationQuery: IDocumentCreationQuery): Promise<IDocumentDeletionOperation[]>;
    evaluateDocumentUpdate(documentUpdateQuery: IDocumentUpdateQuery): Promise<IDocumentUpdateOperation[]>;

    evaluateCollectionRetrieval(collectionRetrievalQuery: ICollectionRetrievalQuery): Promise<ICollection>;
    evaluateCollectionCreation(collectionCreationQuery: ICollectionCreationQuery): Promise<ICollectionCreationOperation>;
    evaluateCollectionDeletion(collectionDeletionQuery: ICollectionDeletionQuery): Promise<ICollectionDeletionOperation>;
    evaluateListConstraints(collectionListConstraintsQuery: ICollectionListConstraintsQuery): Promise<IConstraint[]>;

    evaluateConstraintRetrieval(constraintRetrievalQuery: IConstraintRetrievalQuery): Promise<IConstraint>;
    evaluateConstraintCreation(constraintCreationQuery: IConstraintCreationQuery): Promise<IConstraintCreationOperation>;
    evaluateConstraintDeletion(constraintDeletionQuery: IConstraintDeletionQuery): Promise<IConstraintDeletionOperation>;

    evaluateDBListCollections(dbListCollectionsQuery: IDBListCollectionsQuery): Promise<ICollection[]>;
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
    document: Document;
}

interface IDocumentUpdateOperation extends IOperation { 
    collectionName: string;
    document: Document;
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
    type: ConstraintType;
    name: string;
    field: string;
}

interface IConstraintDeletionOperation extends IOperation { 
    constraint: IConstraint;
}