import { SpiderCli } from './spider.cli';
import { WeaveEngine } from './engines/weaveEngine';
import { QueryEngine } from './engines/queryEngine';
import { DocumentStore } from './fileSystem/documentStore';
import { CollectionStore } from './fileSystem/collectionStore';
import * as readline from 'readline';

async function start() {
    let collectionStore = await CollectionStore.create();
    let documentStore = new DocumentStore();
    let queryEngine = await QueryEngine.create(documentStore, collectionStore);
    let weaveEngine = new WeaveEngine();
    let cli = new SpiderCli(queryEngine, weaveEngine);

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

        cli.process(line.split(" "))
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

// NOTE: Temporary function to test database functionality
// async function temp() {

//     let collectionStore = await CollectionStore.create();
//     let documentStore = new DocumentStore();
//     let queryEngine = await QueryEngine.create(documentStore, collectionStore);
//     let weaveEngine = new WeaveEngine();
//     let cli = new SpiderCli(queryEngine, weaveEngine);
//     await documentStore.createDocument("name", { data: "cat" });

//     await collectionStore.createCollection("name");
//     await documentStore.createDocument("name", { data: "works" });
//     await documentStore.createDocument("name", { data: "works2" });
//     return await collectionStore.deleteConstraint("name", "constraintName");
//     return await collectionStore.createConstraint("name", "constraintName", "data", ConstraintType.Unique);
// }

// temp().then(console.log).catch(e => { console.error(e); });