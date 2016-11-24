import { InfoApi } from './api/api.info';

/**
 * SpiderCli
 */
export class SpiderCli implements ICliExecution {
    queryEngine: IQueryEngine;
    weaveEngine: IWeaveEngine;
    transactionProcessor: ITransactionProcessor;

    constructor(queryEngine: IQueryEngine, weaveEngine: IWeaveEngine, transactionProcessor: ITransactionProcessor) {
        this.queryEngine = queryEngine;
        this.weaveEngine = weaveEngine;
        this.transactionProcessor = transactionProcessor;
    }

    /**
    * ICliExecution
    */
    async process(instructionSet: string[]): Promise<string> {
        switch (this.typeForInstruction(instructionSet)) {
            case CliInstructionType.help:
                return this.presentHelp();
            case CliInstructionType.query:
                return this.executeQuery(instructionSet[1]);
            case CliInstructionType.rollback:
                return this.rollback();
            case CliInstructionType.version:
                return InfoApi.getVersion();
            case CliInstructionType.none:
                throw new SpiderError(CliErrorType.unknownFlag);
        }
    }

    async executeQuery(queryString: string): Promise<string> {
        let query = this.weaveEngine.parse(queryString);

        let result;

        if (query.type === QueryType.collectionCreation) {
                let operation = await this.queryEngine.evaluateCollectionCreation(query as ICollectionCreationQuery);
                result = await this.transactionProcessor.executeCollectionCreation(operation, true);

        } else if (query.type === QueryType.collectionDeletion) {
                let operation = await this.queryEngine.evaluateCollectionDeletion(query as ICollectionDeletionQuery);
                result = await this.transactionProcessor.executeCollectionDeletion(operation, true);

        } else if (query.type === QueryType.collectionListConstraints) {
                result = await this.queryEngine.evaluateListConstraints(query as ICollectionListConstraintsQuery);

        } else if (query.type === QueryType.collectionRetrieval) {
                result = await this.queryEngine.evaluateCollectionRetrieval(query as ICollectionCreationQuery);

        } else if (query.type === QueryType.constraintCreation) {
                let operation = await this.queryEngine.evaluateConstraintCreation(query as IConstraintCreationQuery);
                result = await this.transactionProcessor.executeConstraintCreation(operation, true);

        } else if (query.type === QueryType.constraintDeletion) {
                let operation = await this.queryEngine.evaluateConstraintDeletion(query as IConstraintDeletionQuery);
                result = await this.transactionProcessor.executeConstraintDeletion(operation, true);

        } else if (query.type === QueryType.constraintRetrieval) {
                result = await this.queryEngine.evaluateConstraintRetrieval(query as IConstraintRetrievalQuery);

        } else if (query.type === QueryType.databaseListCollections) {
                result = await this.queryEngine.evaluateDBListCollections(query as IDBListCollectionsQuery);

        } else if (query.type === QueryType.documentCreation) {
                let operation = await this.queryEngine.evaluateDocumentCreation(query as IDocumentCreationQuery);
                result = await this.transactionProcessor.executeDocumentCreation(operation, true);

        } else if (query.type === QueryType.documentDeletion) {
                let operation = await this.queryEngine.evaluateDocumentDeletion(query as IDocumentDeletionQuery);
                result = await this.transactionProcessor.executeDocumentDeletion(operation, true);

        } else if (query.type === QueryType.documentRetrieval) {
                result = await this.queryEngine.evaluateDocumentRetrieval(query as IDocumentRetrievalQuery);

        } else if (query.type === QueryType.documentUpdate) {
                let operation = await this.queryEngine.evaluateDocumentUpdate(query as IDocumentUpdateQuery);
                result = await this.transactionProcessor.executeDocumentUpdate(operation, true);

        } else if (query.type === QueryType.dbClear) {
                let operation = await this.queryEngine.evaluateDBClear(query as IDBClearQuery);
                result = await this.transactionProcessor.executeDBClear(operation, true);
        }

        return JSON.stringify(result);
    }

    async rollback(): Promise<string> {
        await this.transactionProcessor.rollback(true);
        return "Rollback successful!";
    }

    typeForInstruction(instructionSet: string[]): CliInstructionType {

        //Iterate over known flags. If nothing matches, return no known type
        for (let flag in cliFlags) {
            if (flag === instructionSet[0]) {
                return cliFlags[flag].type;
            }
        }

        if (instructionSet[0] === "-v") {
            return CliInstructionType.version;
        }

        else if (instructionSet[0] === "-q") {
            return CliInstructionType.query;
        }

        return CliInstructionType.none;
    }

    presentHelp(): string {
        let helpString = "Below are a list of available commands and flags in spiderDB.\n\n";
        for (let key in cliFlags) {
            let flag = cliFlags[key];
            helpString = helpString + flag.flag + "\t" + flag.name + " - " + flag.description + "\n";
        }

        return helpString;
    }
}

/**
 * SpiderCliError
 */
class SpiderError implements ICliError {
    name: string;
    message: string;

    constructor(type: CliErrorType) {
        this.name = this.nameForType(type);
        this.message = this.descriptionForType(type);
    }

    private nameForType(type: CliErrorType): string {
        switch (type) {
            case CliErrorType.unknownFlag:
                return "SpiderError";
            default:
                return "";
        }
    }

    private descriptionForType(type: CliErrorType): string {
        switch (type) {
            case CliErrorType.unknownFlag:
                return "Unknown flag. For a list of available flags, type -h";
            default:
                return "";
        }
    }
}

/**
 * SpiderCliFlag
 */
class SpiderCliFlag {
    type: CliInstructionType;
    flag: string;
    name: string;
    description: string;

    constructor(type: CliInstructionType, flag: string, name: string, description: string) {
        this.type = type;
        this.flag = flag;
        this.name = name;
        this.description = description;
    }
}

let cliFlags: { [flag: string]: SpiderCliFlag } = {};
cliFlags["-h"] = new SpiderCliFlag(CliInstructionType.help, "-h", "help", "Displays a list of available flags with name and description");
cliFlags["-q"] = new SpiderCliFlag(CliInstructionType.query, "-q", "query", "Executes a given database query");
cliFlags["-v"] = new SpiderCliFlag(CliInstructionType.version, "-v", "version", "Displays the installed version of SpiderDB");
cliFlags["-r"] = new SpiderCliFlag(CliInstructionType.rollback, "-r", "rollback", "Initiates a rollback procedure");