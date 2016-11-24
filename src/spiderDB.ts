import { SpiderCli } from './spider.cli';
import { WeaveEngine } from './engines/weaveEngine';
import { TransactionProcessor } from './engines/transactionProcessor';
import { QueryEngine } from './engines/queryEngine';
import { DocumentStore } from './fileSystem/documentStore';
import { CollectionStore } from './fileSystem/collectionStore';
import * as readline from 'readline';

async function start() {
    let collectionStore = await CollectionStore.create();
    let documentStore = await DocumentStore.create((await collectionStore.listCollections()));
    let queryEngine = await QueryEngine.create(documentStore, collectionStore);
    let weaveEngine = new WeaveEngine();
    let transactionProcessor = await TransactionProcessor.create(documentStore, collectionStore);
    let cli = new SpiderCli(queryEngine, weaveEngine, transactionProcessor);

    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.setPrompt("spider > ");
    rl.prompt();

    rl.on('line', line => {
        if (line === ".exit") {
            rl.close();
        }

        // TODO: hacky. Use something like yargs to parse arguments

        let flag: string = line.split(" ")[0];
        let query: string = line.split(" ").splice(1).join(" ");
        let result = [flag, query];

        cli.process(result)
            .then(console.log)
            .catch((error: ICliError) => {
                console.log(error.name + " - " + error.message);
            }).then(() => {
                rl.prompt();
            });

    }).on('close', () => {
        console.log();
        process.exit(0);
    });
}

start();