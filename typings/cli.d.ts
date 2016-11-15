declare interface ICliExecution {
    process(instructionSet:string[]) : string;
    executeQuery(query:string) : string;
    typeForInstruction(instructionSet:string[]) : CliInstructionType;
    presentCliError(error:ICliError) : string;
    presentHelp() : string;
}

declare interface ICliError {
    type: CliErrorType;
    description: string;
}

declare const enum CliInstructionType {
    query,
    version,
    help,
    none,
}

declare const enum CliErrorType {
    unknownFlag
}