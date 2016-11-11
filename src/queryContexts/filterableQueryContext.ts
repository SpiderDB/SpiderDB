import {TerminalQueryContext} from './terminalQueryContext';
//import {QueryType, FilterType} from '../enums';

export class FilterableQueryContext implements IFilterableQueryContext {

    private query: IFilterableQuery;
    
    constructor(query: IFilterableQuery) {
        this.query = query;
    }

    where(filter: ((x: any) => boolean) | IWhereFilterParameter): ITerminalQueryContext {
        if (typeof(filter) === "function") {

            let functionalWhereFilter: IFunctionalWhereFilter = {
                type: FilterType.FunctionalWhere,
                filter: filter
            }

            this.query.filters.push(functionalWhereFilter);
        } else {

            let operator: WhereOperator;

            switch (filter.operator) {
                case "<": 
                    operator = WhereOperator.lessThan;
                    break;
                case ">": 
                    operator = WhereOperator.greaterThan;
                    break;
                case "<=": 
                    operator = WhereOperator.lessThanEqual;
                    break;
                case ">=": 
                    operator = WhereOperator.greaterThanEqual;
                    break;
                case "<=": 
                    operator = WhereOperator.lessThanEqual;
                    break;
                case ">=": 
                    operator = WhereOperator.greaterThanEqual;
                    break;
                default:
                    throw new Error(`Provided operator, ${filter.field} is not valid.`);
            }

            let whereFilter: IWhereFilter = {
                type: FilterType.Where,
                field: filter.field,
                operator: operator,
                value: filter.value
            };

            this.query.filters.push(whereFilter);
        }

        return new FilterableQueryContext(this.query);

    }

    construct(): IQuery {
        return this.query;
    }
}