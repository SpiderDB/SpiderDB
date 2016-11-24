import {TerminalQueryContext} from './terminalQueryContext';
import {CollectionQueryContext} from './collectionQueryContext';
//import {QueryType} from '../enums';

export class DBQueryContext implements IDBQueryContext {

    private query: IQuery;

    constructor() { 
        this.query = {};
    }

    using(name: string): ICollectionQueryContext {
        let documentQuery: IDocumentQuery = Object.assign(this.query, { 
            collectionName: name
        });

        return new CollectionQueryContext(documentQuery);
    }

    createCollection(name: string): ITerminalQueryContext {
        let collectionCreationQuery : ICollectionCreationQuery = Object.assign(this.query, {
            type: QueryType.collectionCreation,
            collectionName: name
        });

        return new TerminalQueryContext(collectionCreationQuery);
    }

    deleteCollection(name: string): ITerminalQueryContext {
        let collectionDeletionQuery: ICollectionDeletionQuery = Object.assign(this.query, {
            type: QueryType.collectionDeletion,
            collectionName: name
        });

        return new TerminalQueryContext(collectionDeletionQuery);
    }

    retrieveCollection(name: string): ITerminalQueryContext {
        let collectionRetrievalQuery: ICollectionRetrievalQuery = Object.assign(this.query, {
            type: QueryType.collectionRetrieval,
            collectionName: name
        });

        return new TerminalQueryContext(collectionRetrievalQuery);
    }

    listCollections(): ITerminalQueryContext {
        let databaseListCollectionsQuery: IDBListCollectionsQuery = Object.assign(this.query, {
            type: QueryType.databaseListCollections
        });

        return new TerminalQueryContext(databaseListCollectionsQuery);
    }

    clear(): ITerminalQueryContext {
        let databaseClearQuery: IDBClearQuery =  Object.assign(this.query, {
            type: QueryType.dbClear
        });

        return new TerminalQueryContext(databaseClearQuery);

    }
}