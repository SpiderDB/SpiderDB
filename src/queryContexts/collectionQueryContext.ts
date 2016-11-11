import {TerminalQueryContext} from './terminalQueryContext';
import {FilterableAggregatableQueryContext} from './filterableAggregatableQueryContext';
import {FilterableQueryContext} from './filterableQueryContext';
//import {QueryType} from '../enums';

export class CollectionQueryContext implements ICollectionQueryContext {

    private query: IRecordQuery;

    constructor(query: IRecordQuery) { 
        this.query = query;
    }

    find(): IFilterableAggregatableQueryContext {
        let recordRetrievalQuery: IRecordRetrievalQuery = Object.assign(this.query, { 
            type: QueryType.recordRetrieval,
            filters: [],
            aggregate: null
        });

        return new FilterableAggregatableQueryContext(recordRetrievalQuery);
    }

    delete(): IFilterableQueryContext {
        let recordDeletionQuery : IRecordDeletionQuery = Object.assign(this.query, {
            type: QueryType.recordDeletion,
            filters: []
        });

        return new FilterableQueryContext(recordDeletionQuery);
    }

    update(value: any): IFilterableQueryContext {
        let recordUpdateQuery: IRecordUpdateQuery = Object.assign(this.query, {
            type: QueryType.recordUpdate,
            value: value,
            filters: []
        });

        return new FilterableQueryContext(recordUpdateQuery);
    }

    insert(value: any): ITerminalQueryContext {
        let recordCreationQuery: IRecordCreationQuery = Object.assign(this.query, {
            type: QueryType.recordCreation,
            value: value
        });

        return new TerminalQueryContext(recordCreationQuery);
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

    deleteConstraint(name: string): ITerminalQueryContext {
        let constraintDeletionQuery: IConstraintDeletionQuery = Object.assign(this.query, {
            type: QueryType.constraintDeletion,
            constraintName: name,
        });

        return new TerminalQueryContext(constraintDeletionQuery);
    }
}