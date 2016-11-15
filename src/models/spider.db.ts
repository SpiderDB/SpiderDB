/**
 * SpiderDatabase
 */
class SpiderDatabase implements IDatabaseManagement, IDatabaseQuery {
    constructor() {
        
    }

    //IDatabaseManagement
    getDatabase(id: number) : SpiderDatabase {
        var database = new SpiderDatabase();
        return database;
    }

    createDatabase() : SpiderDatabase {
        var database = new SpiderDatabase();
        return database;
    }

    updateDatabase(database: SpiderDatabase) : SpiderDatabase {
        return database;
    }

    removeDatabase() {

    }

    //IDatabaseQuery
    find(where){
       
    }
}