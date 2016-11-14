/**
 * DatabaseAPI
 */

declare interface IDatabaseManagement {
    getDatabase(id: number) : SpiderDatabase;
    createDatabase() : SpiderDatabase;
    updateDatabase(database: SpiderDatabase) : SpiderDatabase;
    removeDatabase();
}