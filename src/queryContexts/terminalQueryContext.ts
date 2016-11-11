
export class TerminalQueryContext implements ITerminalQueryContext {

    private query: IQuery;
    
    constructor(query: IQuery) {
        this.query = query;
    }

    construct(): IQuery {
        return this.query;
    }
}