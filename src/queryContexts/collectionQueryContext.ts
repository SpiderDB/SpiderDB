import {TerminalQueryContext} from './terminalQueryContext';
import {FilterableAggregatableQueryContext} from './filterableAggregatableQueryContext';
import {FilterableQueryContext} from './filterableQueryContext';
//import {QueryType} from '../enums';

export class CollectionQueryContext implements ICollectionQueryContext {

    private query: IDocumentQuery;

    constructor(query: IDocumentQuery) { 
        this.query = query;
    }

    find(): IFilterableAggregatableQueryContext {
        let documentRetrievalQuery: IDocumentRetrievalQuery = Object.assign(this.query, { 
            type: QueryType.documentRetrieval,
            filters: [],
            aggregate: null
        });

        return new FilterableAggregatableQueryContext(documentRetrievalQuery);
    }

    delete(): IFilterableQueryContext {
        let documentDeletionQuery : IDocumentDeletionQuery = Object.assign(this.query, {
            type: QueryType.documentDeletion,
            filters: []
        });

        return new FilterableQueryContext(documentDeletionQuery);
    }

    update(value: Object): IFilterableQueryContext {
        if (value === null || typeof value !== "object") {
            throw new Error("Update value must be an object");
        }

        let documentUpdateQuery: IDocumentUpdateQuery = Object.assign(this.query, {
            type: QueryType.documentUpdate,
            value: value,
            filters: []
        });

        return new FilterableQueryContext(documentUpdateQuery);
    }

    insert(value: Object): ITerminalQueryContext {
        if (value === null || typeof value !== "object") {
            throw new Error("Insert value must be an object");
        }

        let documentCreationQuery: IDocumentCreationQuery = Object.assign(this.query, {
            type: QueryType.documentCreation,
            value: value
        });

        return new TerminalQueryContext(documentCreationQuery);
    }

    createConstraint(constraintParameter: ConstraintParameter): ITerminalQueryContext {

        let constraintType: ConstraintType;
        switch (constraintParameter.type.toLowerCase()) {
            case "unique":
                constraintType = ConstraintType.Unique;
                break;
            case "exists":
                constraintType = ConstraintType.Exists;
                break;
        }

        let constraintCreationQuery: IConstraintCreationQuery = Object.assign(this.query, {
            type: QueryType.constraintCreation,
            constraintName: constraintParameter.name,
            fieldName: constraintParameter.field,
            constraintType: constraintType
        });

        return new TerminalQueryContext(constraintCreationQuery);
    }

    retrieveConstraint(name: string): ITerminalQueryContext {
        let constraintRetrievalQuery: IConstraintRetrievalQuery = Object.assign(this.query, {
            type: QueryType.constraintRetrieval,
            constraintName: name,
        });

        return new TerminalQueryContext(constraintRetrievalQuery);
    }

    listConstraints(): ITerminalQueryContext {
        let collectionListConstraintsQuery: ICollectionListConstraintsQuery = Object.assign(this.query, {
            type: QueryType.collectionListConstraints,
            collectionName: name
        });

        return new TerminalQueryContext(collectionListConstraintsQuery);
    }

    deleteConstraint(name: string): ITerminalQueryContext {
        let constraintDeletionQuery: IConstraintDeletionQuery = Object.assign(this.query, {
            type: QueryType.constraintDeletion,
            constraintName: name,
        });

        return new TerminalQueryContext(constraintDeletionQuery);
    }
}