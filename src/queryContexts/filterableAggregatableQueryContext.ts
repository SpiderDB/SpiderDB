import {TerminalQueryContext} from './terminalQueryContext';
//import {QueryType, FilterType, AggregateType} from '../enums';

export class FilterableAggregatableQueryContext implements IFilterableAggregatableQueryContext {

    private query: IFilterableAggregatableQuery;
    
    constructor(query: IFilterableAggregatableQuery) {
        this.query = query;
    }

    sum(field: string): ITerminalQueryContext {
        return this.constructFieldAggregate(AggregateType.sum, field);
    }

    min(field: string): ITerminalQueryContext {
        return this.constructFieldAggregate(AggregateType.min, field);
    }

    max(field: string): ITerminalQueryContext {
        return this.constructFieldAggregate(AggregateType.max, field);
    }

    avg(field: string): ITerminalQueryContext {
        return this.constructFieldAggregate(AggregateType.avg, field);
    }

    count(): ITerminalQueryContext {
        this.query.aggregate = {
            type: AggregateType.count
        };

        return new TerminalQueryContext(this.query);
    }

    where(filter: ((x: any) => boolean) | IWhereFilterParameter): IFilterableAggregatableQueryContext {
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
                case "==": 
                    operator = WhereOperator.equal;
                    break;
                case "!=": 
                    operator = WhereOperator.notEqual;
                    break;
                default:
                    throw new Error(`Provided operator, ${filter.operator} is not valid.`);
            }

            let whereFilter: IWhereFilter = {
                type: FilterType.Where,
                field: filter.field,
                operator: operator,
                value: filter.value
            };

            this.query.filters.push(whereFilter);
        }

        return new FilterableAggregatableQueryContext(this.query);
    }

    construct(): IQuery {
        return this.query;
    }

    private constructFieldAggregate(type: AggregateType, field: string) {
        let fieldAggregate: IFieldAggregate = {
            type: type,
            field: field
        };

        this.query.aggregate = fieldAggregate;

        return new TerminalQueryContext(this.query);
    }
}