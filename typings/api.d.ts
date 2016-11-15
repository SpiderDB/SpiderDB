/**
 * DatabaseAPI
 */

declare interface IDatabaseManagement {
    getDatabase(id: number) : SpiderDatabase;
    createDatabase() : SpiderDatabase;
    updateDatabase(database: SpiderDatabase) : SpiderDatabase;
    removeDatabase();
}

/**
 * FindAPI
 */

declare interface IDatabaseQuery {
    find(where) : [SpiderNode]
}

/**
 * NodeAPI
 */

declare interface INodeManagement {
    /**Returns a node based  */
    getNode(id: number) : SpiderNode;
    createNode() : SpiderNode;
    updateNode(node: SpiderNode) : SpiderNode;
    removeNode();
}

/**
 * QueryApi
 */

declare interface IQueryApi {
    executeQuery(query:string);
}