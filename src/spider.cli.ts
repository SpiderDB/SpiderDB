import {DBQueryContext} from './queryContexts/dbQueryContext';
import {WeaveEngine} from './engines/weaveEngine';
import {InfoApi} from './api/api.info';

/**
 * SpiderCli
 */
export class SpiderCli implements ICliExecution {
    weaveEngine: IWeaveEngine; 

    constructor(weaveEngine: IWeaveEngine)  {
        this.weaveEngine = weaveEngine;
    }

    /**
    * ICliExecution
    */
    process(instructionSet:string[]) : string {
        switch (this.typeForInstruction(instructionSet)) {
            case CliInstructionType.help:
                return this.presentHelp();
            case CliInstructionType.query:
                return this.executeQuery(instructionSet[1]);
            case CliInstructionType.version:
                return InfoApi.getVersion();
            case CliInstructionType.none:
                return this.presentCliError(new SpiderError(CliErrorType.unknownFlag));
        }
    }

    executeQuery(query:string) : string {
        return "";
    }

    typeForInstruction(instructionSet:string[]) : CliInstructionType {

        //Iterate over known flags. If nothing matches, return no known type
        for (let flag in cliFlags) {
            if(flag == instructionSet[0]) {
                return cliFlags[flag].type
            }
        }

        if(instructionSet[0] == "-v") {
            return CliInstructionType.version
        }
        else if(instructionSet[0] == "-q") {
            return CliInstructionType.query
        }

        return CliInstructionType.none;
    }

    presentHelp() : string {
        var helpString = "Below are a list of available commands and flags in spiderDB.\n\n";
        for (var key in cliFlags) {
            var flag = cliFlags[key];
            helpString  = helpString + flag.flag+"\t"+flag.name+"\t"+flag.description+"\n"
        }

        return  helpString;
    }

    presentCliError(error:ICliError) : string {
        return error.type + " - " + error.description;
    }
}

/**
 * SpiderCliError
 */
class SpiderError implements ICliError {
    type : CliErrorType;
    description : string;

    constructor(type: CliErrorType) {
        this.type = type;
        this.description = this.descriptionForType(type);
    }

    private descriptionForType(type: CliErrorType) : string {
        switch (type) {
            case CliErrorType.unknownFlag:
                "Unkown flag. For a list of available flags, type -h"
                break;
        
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
    flag:string; 
    name:string; 
    description:string

    constructor(type:CliInstructionType, flag:string, name:string, description:string) {
        this.type = type;
        this.flag = flag;
        this.name = name;
        this.description = description;
    }
}

// TODO: Write tests for all of this...
let db = new DBQueryContext();

let cliFlags: {[flag : string]: SpiderCliFlag} = {}
cliFlags["-h"] = new SpiderCliFlag(CliInstructionType.help, "-h", "help", "Displays a list of available flags with name and description");
cliFlags["-q"] = new SpiderCliFlag(CliInstructionType.query, "-q", "query", "Executes a given database query");
cliFlags["-v"] = new SpiderCliFlag(CliInstructionType.version, "-v", "version", "Displays the installed version of SpiderDB");


// let tests = [
//     `db.using("person").find().where({ field: "name", operator: "==", value: "Ben" }).where(x => x.name !== null).sum("age")`,
//     `db.using("person").find().count()`,
//     `db.using("person").createConstraint({ name: "uniqueName", field: "name", type: "unique" })`
// ];

// for (let test of tests) {
//     console.log(`Input: ${test}`);
//     console.log(weaveEngine.parse(test));
//     console.log();
// }