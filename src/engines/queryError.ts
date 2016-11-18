
export class QueryError extends Error implements IQueryError {
    constructor(message:string) {
        super(message);
        this.name = "QueryError";
    }
}