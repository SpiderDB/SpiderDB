import { SpiderCli } from './spider.cli';
import { WeaveEngine } from './engines/weaveEngine';
import * as readline from 'readline';

let cli = new SpiderCli(new WeaveEngine());
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
    })

}).on('close', () => {
    console.log();
    process.exit(0);
});