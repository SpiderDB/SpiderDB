import { DBQueryContext } from './queryContexts/dbQueryContext';
import { WeaveEngine } from './engines/weaveEngine';
import { InfoApi } from './api/api.info';

/**
 * SpiderCli
 */
export class SpiderCli implements ICliExecution {
    weaveEngine: IWeaveEngine;

    constructor(weaveEngine: IWeaveEngine) {
        this.weaveEngine = weaveEngine;
    }

    /**
    * ICliExecution
    */
    process(instructionSet: string[]): Promise<string> {
        switch (this.typeForInstruction(instructionSet)) {
            case CliInstructionType.help:
                return Promise.resolve(this.presentHelp());
            case CliInstructionType.query:
                return Promise.resolve(this.executeQuery(instructionSet[1]));
            case CliInstructionType.version:
                return Promise.resolve(InfoApi.getVersion());
            case CliInstructionType.none:
                return Promise.reject(new SpiderError(CliErrorType.unknownFlag));
        }
    }

    executeQuery(query: string): string {
        return "";
    }

    typeForInstruction(instructionSet: string[]): CliInstructionType {

        //Iterate over known flags. If nothing matches, return no known type
        for (let flag in cliFlags) {
            if (flag === instructionSet[0]) {
                return cliFlags[flag].type
            }
        }

        if (instructionSet[0] === "-v") {
            return CliInstructionType.version
        }
        else if (instructionSet[0] === "-q") {
            return CliInstructionType.query
        }

        return CliInstructionType.none;
    }

    presentHelp(): string {
        let helpString = "Below are a list of available commands and flags in spiderDB.\n\n";
        for (let key in cliFlags) {
            let flag = cliFlags[key];
            helpString = helpString + flag.flag + "\t" + flag.name + "\t" + flag.description + "\n"
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
                return "SpiderError"
            default:
                return "";
        }
    }

    private descriptionForType(type: CliErrorType): string {
        switch (type) {
            case CliErrorType.unknownFlag:
                return "Unknown flag. For a list of available flags, type -h"
            default:
                return "";
        }
    }
}

/**
 * SpiderCliFlag
 */
class SpiderCliFlag {
    type: CliInstructionType
    flag: string;
    name: string;
    description: string

    constructor(type: CliInstructionType, flag: string, name: string, description: string) {
        this.type = type;
        this.flag = flag;
        this.name = name;
        this.description = description;
    }
}

let cliFlags: { [flag: string]: SpiderCliFlag } = {}
cliFlags["-h"] = new SpiderCliFlag(CliInstructionType.help, "-h", "help", "Displays a list of available flags with name and description");
cliFlags["-q"] = new SpiderCliFlag(CliInstructionType.query, "-q", "query", "Executes a given database query");
cliFlags["-v"] = new SpiderCliFlag(CliInstructionType.version, "-v", "version", "Displays the installed version of SpiderDB");