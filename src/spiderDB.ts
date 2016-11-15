import {SpiderCli} from './spider.cli';
import {WeaveEngine} from './engines/weaveEngine';
var repl = require("repl");

//Create a repl for use with spiderDB
var replServer = repl.start({
            prompt: "spider > ",
         eval: spiderEval});

/**
 * Evaluation funciton for processing spiderDB REPL commands
 */
function spiderEval(cmd:string, context, filename, callback) {
    //Clean up any newlines
    var sanitizedCmdString = cmd.replace("\n", "");

    //Process query
    var cli = new SpiderCli(new WeaveEngine());
    callback(null, cli.process(sanitizedCmdString.split(" "))); 
}