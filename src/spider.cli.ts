import { InfoApi } from './api/api.info';

/**
 * SpiderCli
 */
export class SpiderCli implements ICliExecution {
    queryEngine: IQueryEngine;
    weaveEngine: IWeaveEngine;

    constructor(queryEngine: IQueryEngine, weaveEngine: IWeaveEngine) {
        this.queryEngine = queryEngine;
        this.weaveEngine = weaveEngine;
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
            result = await this.queryEngine.evaluateCollectionCreation(query as ICollectionCreationQuery);
        } else if (query.type === QueryType.documentRetrieval) {
            result = await this.queryEngine.evaluateDocumentRetrieval(query as IDocumentRetrievalQuery);
        }

        return JSON.stringify(result);
    }

    rollback(): string {
        return "rollback unimplemented";
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