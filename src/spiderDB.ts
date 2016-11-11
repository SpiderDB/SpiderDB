import {DBQueryContext} from './queryContexts/dbQueryContext';
import {WeaveEngine} from './engines/weaveEngine';


// TODO: Write tests for all of this...
let db = new DBQueryContext();

let weaveEngine = new WeaveEngine();

let tests = [
    `db.using("person").find().where({ field: "name", operator: "==", value: "Ben" }).where(x => x.name !== null).sum("age")`,
    `db.using("person").find().count()`,
    `db.using("person").createConstraint({ name: "uniqueName", field: "name", type: "unique" })`
];

for (let test of tests) {
    console.log(`Input: ${test}`);
    console.log(weaveEngine.parse(test));
    console.log();
}
