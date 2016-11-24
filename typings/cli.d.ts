declare interface ICliExecution {
    process(instructionSet:string[]) : Promise<string>;
    executeQuery(query:string) : Promise<string>;
    typeForInstruction(instructionSet:string[]) : CliInstructionType;
    presentHelp() : string;
}

declare interface ICliError extends Error {
}

declare const enum CliInstructionType {
    query,
    version,
    help,
    rollback,
    none
}

declare const enum CliErrorType {
    unknownFlag
}