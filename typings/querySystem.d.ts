
// Verifies the query is valid and constructs a transaction if necessary otherwise returns the data requested
interface QueryEngine {
    evaluateDocumentRetrieval(documentRetrievalQuery: IDocumentRetrievalQuery): Promise<IDocument[]>;
    evaluateDocumentCreation(documentCreationQuery: IDocumentCreationQuery): Promise<IDocumentCreationOperation>;
    evaluateDocumentDeletion(documentCreationQuery: IDocumentCreationQuery): Promise<IDocumentDeletionOperation[]>;
    evaluateDocumentUpdate(documentUpdateQuery: IDocumentUpdateQuery): Promise<IDocumentUpdateOperation[]>;

    evaluateCollectionRetrieval(collectionRetrievalQuery: ICollectionRetrievalQuery): Promise<ICollection>;
    evaluateCollectionCreation(collectionCreationQuery: ICollectionCreationQuery): Promise<ICollectionCreationOperation>;
    evaluateCollectionDeletion(collectionDeletionQuery: ICollectionDeletionQuery): Promise<ICollectionDeletionOperation>;

    evaluateConstraintRetrieval(constraintRetrievalQuery: IConstraintRetrievalQuery): Promise<IConstraint>;
    evaluateConstraintCreation(constraintCreationQuery: IConstraintCreationQuery): Promise<IConstraintCreationOperation>;
    evaluateConstraintDeletion(constraintDeletionQuery: IConstraintDeletionQuery): Promise<IConstraintDeletionOperation>;
}

interface TransactionProcessor {
    executeDocumentCreation(documentCreationOperation: IDocumentCreationOperation): Promise<IDocument>;
    executeDocumentDeletion(documentDeletionOperations: IDocumentDeletionOperation[]): Promise<IDocument[]>;
    executeDocumentUpdate(documentUpdateOperations: IDocumentUpdateOperation[]): Promise<IDocument[]>;

    executeCollectionCreation(collectionCreationOperation: ICollectionCreationOperation): Promise<ICollection>;
    evaluateCollectionDeletion(collectionDeletionOperation: ICollectionDeletionOperation): Promise<ICollection>;

    executeConstraintCreation(constraintCreationOperation: IConstraintCreationOperation): Promise<IConstraint>;
    executeConstraintDeletion(constraintDeletionOperation: IConstraintDeletionOperation): Promise<IConstraint>;
}

type Transaction = IOperation[];
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
    documents: IDocument[];
    collection: ICollection[];
}

interface IConstraintCreationOperation extends IOperation { 
    type: ConstraintType;
    name: string;
    field: string;
}

interface IConstraintDeletionOperation extends IOperation { 
    constraint: IConstraint;
}