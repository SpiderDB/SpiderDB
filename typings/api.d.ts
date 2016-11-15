/**
 * Database Management Api
 */

declare interface IDatabaseManagement {
    getDatabase(id: number) : SpiderDatabase;
    createDatabase() : SpiderDatabase;
    updateDatabase(database: SpiderDatabase) : SpiderDatabase;
    removeDatabase();
}

/**
 * Find Api
 */

declare interface IDatabaseQuery {
    execute(query);
    find(where);
}

/**
 * Document Management Api
 */

declare interface IDocumentManagement {
    /**Returns a node based  */
    getDocument(id: number) : SpiderDocument;
    createDocument() : SpiderDocument;
    updateDocument(node: SpiderDocument) : SpiderDocument;
    removeDocument();
}