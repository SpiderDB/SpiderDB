
interface IWeaveEngine {
    parse(code: string): IQuery;
}

interface IQuery {
    type?: QueryType,
}

interface IRecordQuery extends IQuery {
    collectionName: string;
}

interface IFilterableAggregatableQuery extends IRecordQuery {
    filters: IFilter[];
    aggregate: IAggregate;
}

interface IFilterableQuery extends IRecordQuery {
    filters: IFilter[];
}

interface IRecordDeletionQuery extends IFilterableQuery { }

interface IRecordCreationQuery extends IRecordQuery {
    value: any;
}

interface IRecordUpdateQuery extends IFilterableQuery {
    value: any;
}

interface IRecordUpdateQuery extends IRecordQuery {
    value: any;
}

interface IRecordRetrievalQuery extends IFilterableAggregatableQuery { }

interface IFilter {
    type: FilterType
}

interface IFunctionalWhereFilter extends IFilter {
    filter: (x: any) => boolean;
}

interface IWhereFilter extends IFilter {
    field: string;
    operator: WhereOperator;
    value: any;
}

interface IAggregate {
    type: AggregateType;
}

interface ICountAggregate { }

interface IFieldAggregate extends IAggregate { field: string; }

interface IMinAggregate extends IFieldAggregate { }
interface IMaxAggregate extends IFieldAggregate { }
interface IAvgAggregate extends IFieldAggregate { }
interface ISumAggregate extends IFieldAggregate { }

declare const enum AggregateType {
    max,
    min,
    count,
    avg,
    sum
}

declare const enum WhereOperator {
    lessThan,
    greaterThan,
    lessThanEqual,
    greaterThanEqual,
    notEqual,
    equal
}

declare const enum FilterType {
    Where,
    FunctionalWhere
}

interface ICollectionQuery { 
    collectionName: string; 
}
interface ICollectionCreationQuery extends ICollectionQuery { }
interface ICollectionDeletionQuery extends ICollectionQuery { }
interface ICollectionRetrievalQuery extends ICollectionQuery { }

interface IConstraintQuery { 
    collectionName: string; 
    constraintName: string;
}

interface IConstraintCreationQuery extends IConstraintQuery { 
    fieldName: string;
    constraintType: ConstraintType;
}

interface IConstraintDeletionQuery extends IConstraintQuery { }
interface IConstraintRetrievalQuery extends IConstraintQuery { }

declare const enum ConstraintType {
    Exists,
    Unique
}

declare const enum QueryType {
    recordRetrieval,
    recordCreation,
    recordDeletion,
    recordUpdate,
    collectionCreation,
    collectionRetrieval,
    collectionDeletion,
    constraintCreation,
    constraintRetrieval,
    constraintDeletion
}

interface IQueryContext { }

interface ITerminalQueryContext extends IQueryContext {
    construct(): IQuery;
}

interface IDBQueryContext extends IQueryContext {
    using(name: string): ICollectionQueryContext;
    createCollection(name: string): ITerminalQueryContext;
    deleteCollection(name: string): ITerminalQueryContext;
    retrieveCollection(name: string): ITerminalQueryContext;
}

interface ICollectionQueryContext extends IQueryContext {
    find(): IFilterableAggregatableQueryContext;
    delete(): IFilterableQueryContext;
    insert(value: any): ITerminalQueryContext;
    update(value: any): IFilterableQueryContext;
    createConstraint(ConstraintParameter): ITerminalQueryContext;
    deleteConstraint(name: string): ITerminalQueryContext;
    retrieveConstraint(name: string): ITerminalQueryContext;
}

interface IAggregateQueryContext extends ITerminalQueryContext {
    sum(field: string): ITerminalQueryContext;
    min(field: string): ITerminalQueryContext;
    max(field: string): ITerminalQueryContext;
    avg(field: string): ITerminalQueryContext;
    count(): ITerminalQueryContext;
}

interface IFilterableAggregatableQueryContext extends IAggregateQueryContext {
    where(filter: ((x: any) => boolean) | IWhereFilterParameter): IFilterableAggregatableQueryContext;
}

interface IFilterableQueryContext extends ITerminalQueryContext {
    where(filter: ((x: any) => boolean) | IWhereFilterParameter): ITerminalQueryContext;
}

interface ConstraintParameter {
    name: string;
    field: string;
    type: string;
}

interface IWhereFilterParameter {
    field: string;
    operator: string,
    value: any;
}

/* Workspace

// DB operations
// createCollection, getCollection, deleteCollection

// Collection operations
// RecordOperations
// ConstraintOperations


// ConstraintOperations
// createConstraint, deleteConstraint, getConstraint

// Record Operations:
// delete, insert, find, update

// Filter Operations:
// where


// Aggregate Operations:
// min, max, sum, avg, count

// db.products.find().where(x => x.id == 5).min({ field: name }});
// db.products.find().where(x => x.id == 5).max({ field: name });
// db.products.find().where(x => x.id == 5).sum({ field: name }});
// db.products.find().where(x => x.id == 5).avg({ field: name });
// db.use("products").find().where(x => x.id == 5).count();


// db.products.find().where(x => x.id == 5).min({ field: name }});
// db.products.find().where(x => x.id == 5).max({ field: name });
// db.products.find().where(x => x.id == 5).sum({ field: name }});
// db.products.find().where(x => x.id == 5).avg({ field: name });
// db.use("products").find().where({ field: "name", operator: ">"}).count();
// db.use("products").find().where({ field: "name", operator: "<"}).count();
// db.use("products").find().where({ field: "name", operator: "=="}).count();
// db.use("products").find().where({ field: "name", operator: "!="}).count();
// db.use("products").find().where({ field: "name", operator: "<="}).count();
// db.use("products").find().where({ field: "name", operator: ">="}).count();
// db.use("products").find().where(x => x).count();


// Collection operations:
// db.

//db.collection.find().where({ field: "name", "operator": "=", value: "bob"}).max({ field: "age"});


{
    collectionName: "collection",
    operationType: "retrieval",
    retrieval: {
        filters: [{
            filterType: "Where",
            field: "name",
            operator: "=",
            value: "bob"
        }],
        aggregate: {
            aggregateType: "MAX",
            field: "age"
        }
    }
}


// db.collection

// QueryContext
{
    collectionName: "collection"
}

// db.collection.find()

// RetrievalQueryContext
{
    collectionName: "collection",
    type: "retrieval"
}

// db.collection.find().where({ field: "name", "operator": "=", value: "bob" })

// RetrievalQueryContext
{
    collectionName: "collection",
    type: "retrieval",
    filters: [{
        type: "Where",
        field: "name",
        operator: ">",
        value: "bob"
    }]
}

// db.collection.find().where({ field: "name", "operator": "=", value: "bob" }).max({ field: "age"})

// RetrievalQueryContext
{
    collectionName: "collection",
    type: "retrieval",
    filters: [{
        type: "Where",
        field: "name",
        operator: ">",
        value: "bob"
    }],
    aggregate: {
        type: "MAX",
        field: "age"
    }
}

*/

