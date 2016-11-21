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

        cli.process(line.split(" ")).then(result => {
            console.log(result);
        }).catch((error: ICliError) => {
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
//     // let cli = new SpiderCli(queryEngine, weaveEngine);
//     // return cli.executeQuery('db.using("name").find()');

//     await documentStore.createDocument("name", {
//         stuff: "hello",
//         moreData: [1,2,3],
//         nested: { a: 5 }
//     });

//     return await documentStore.retrieveDocuments("name", []);

//     // let query = weaveEngine.parse("db.createCollection('name')");
//     // await queryEngine.evaluateCollectionCreation(query as ICollectionCreationQuery);

//     // return await collectionStore.createCollection("name");

//     // query = weaveEngine.parse("db.retrieveCollection('name')");
//     // let result = await queryEngine.evaluateCollectionRetrieval(query as ICollectionRetrievalQuery);

//     // return await collectionStore.retrieveCollection(result.name);
// }

// temp().then(console.log).catch(console.log);