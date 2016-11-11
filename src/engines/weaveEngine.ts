import * as vm from 'vm';
import {DBQueryContext} from '../queryContexts/dbQueryContext';

export class WeaveEngine implements IWeaveEngine {
    parse(code: string): IQuery {
        code = `this.result = ${code}.construct()`;

        let context: any = vm.createContext({
            db: new DBQueryContext
        });

        try {
            var script = new vm.Script(code);
            script.runInContext(context);
        } catch (e) {
            console.log(e);
        }

        return context.result as IQuery;
    }
}