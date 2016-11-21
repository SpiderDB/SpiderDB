import { QueryError } from './queryError';
import * as _ from 'lodash';

export class QueryEngine implements IQueryEngine {
    private documentStore: IDocumentStore;
    private collectionStore: ICollectionStore;

    private constructor(documentStore: IDocumentStore, collectionStore: ICollectionStore) {
        this.documentStore = documentStore;
        this.collectionStore = collectionStore;
    }

    static async create(documentStore: IDocumentStore, collectionStore: ICollectionStore): Promise<QueryEngine> {
        let collections = await collectionStore.listCollections();

        let indexCreationPromises = _.chain(collections)
            .flatMap(co => co.constraints.map(ct => documentStore.createIndex(co.name, ct)))
            .value();

        return Promise.all(indexCreationPromises).then(() => new QueryEngine(documentStore, collectionStore));
    }

    async evaluateDocumentRetrieval(query: IDocumentRetrievalQuery): Promise<any> {
        let documents = await this.documentStore.retrieveDocuments(query.collectionName, query.filters);

        if (!query.aggregate) {
            return documents;
        } else if (query.aggregate.type === AggregateType.sum) {
            let aggregate = query.aggregate as ISumAggregate;
            return this.sum(aggregate.field, documents);
        } else if (query.aggregate.type === AggregateType.avg) {
            let aggregate = query.aggregate as IAvgAggregate;
            return this.avg(aggregate.field, documents);
        } else if (query.aggregate.type === AggregateType.min) {
            let aggregate = query.aggregate as IMinAggregate;
            return this.min(aggregate.field, documents);
        } else if (query.aggregate.type === AggregateType.max) {
            let aggregate = query.aggregate as IMaxAggregate;
            return this.max(aggregate.field, documents);
        } else if (query.aggregate.type === AggregateType.count) {
            return documents.length;
        }

        throw new QueryError(`Invalid aggregate type: ${query.aggregate}`);
    }

    async evaluateDocumentCreation(query: IDocumentCreationQuery): Promise<IDocumentCreationOperation> {
        if ("_id" in query.value) {
            throw new QueryError("Document to insert cannot have _id property");
        }

        let conflictingDocuments = await this.retrieveConflictingDocuments(query.collectionName, query.value);

        if (conflictingDocuments.length !== 0) {
            throw new QueryError(`Cannot create document due to the uniqueness condition not being met because of the following documents ${JSON.stringify(conflictingDocuments)}`);
        }

        return {
            collectionName: query.collectionName,
            value: query.value
        };
    }

    async evaluateDocumentDeletion(query: IDocumentDeletionQuery): Promise<IDocumentDeletionOperation[]> {
        let deletionDocuments = await this.documentStore.retrieveDocuments(query.collectionName, query.filters);

        return _.map(deletionDocuments, (d) => {
            return {
                collectionName: query.collectionName,
                document: d
            };
        });
    }

    async evaluateDocumentUpdate(query: IDocumentUpdateQuery): Promise<IDocumentUpdateOperation[]> {
        if ("_id" in query.value) {
            throw new QueryError("Cannot have _id in update value");
        }

        let updateDocuments = await this.documentStore.retrieveDocuments(query.collectionName, query.filters);

        let constraints = await this.collectionStore.listConstraints(query.collectionName);
        let numUniqueConstraints = _.filter(constraints, c => c.type === ConstraintType.Unique).length;

        if (numUniqueConstraints !== 0 && updateDocuments.length > 1) {
            throw new QueryError(`Cannot update multiple documents with new value due to the uniqueness constraints on new value`);
        }

        if (numUniqueConstraints !== 0 && updateDocuments.length === 1) {
            let possibleConflictingDocuments = await this.retrieveConflictingDocuments(query.collectionName, query.value);

            if (possibleConflictingDocuments.length > 1) {
                let conflictingDocuments = _.differenceBy(possibleConflictingDocuments, updateDocuments, (cd, ud) => cd._id === ud._id);
                throw new QueryError(`Cannot update document with new value due to unqiueness constraints on the following documents ${JSON.stringify(conflictingDocuments)}`);
            }

            if (possibleConflictingDocuments.length === 1 && possibleConflictingDocuments[0]._id !== updateDocuments[0]._id) {
                throw new QueryError(`Cannot update document with new value due to uniqueness constraints on the following document ${JSON.stringify(possibleConflictingDocuments[0])}`);
            }
        }

        return _.map(updateDocuments, (d) => {
            return {
                collectionName: query.collectionName,
                document: d,
                value: query.value
            };
        });
    }

    evaluateCollectionRetrieval(query: ICollectionRetrievalQuery): Promise<ICollection> {
        return this.collectionStore.retrieveCollection(query.collectionName);
    }

    async evaluateCollectionCreation(query: ICollectionCreationQuery): Promise<ICollectionCreationOperation> {
        let collection = await this.collectionStore.retrieveCollection(query.collectionName);

        if (collection) {
            throw new QueryError(`Collection, ${query.collectionName}, already exists`);
        }

        return { name: query.collectionName };
    }

    async evaluateCollectionDeletion(query: ICollectionDeletionQuery): Promise<ICollectionDeletionOperation> {
        let collection = await this.collectionStore.retrieveCollection(query.collectionName);

        if (!collection) {
            throw new QueryError(`Collection, ${query.collectionName}, doesn't exist`);
        }

        let constraints = await this.collectionStore.listConstraints(query.collectionName);

        let constraintDeletionOperations: IConstraintDeletionOperation[] = _.map(constraints, c => {
            return {
                collectionName: query.collectionName,
                constraint: c
            };
        });

        let documents = await this.documentStore.retrieveDocuments(query.collectionName, []);

        let documentDeletionOperations: IDocumentDeletionOperation[] = _.map(documents, d => {
            return {
                collectionName: query.collectionName,
                document: d
            };
        });

        return {
            name: collection.name,
            collection: collection,
            documentDeletionOperations: documentDeletionOperations,
            constraintDeletionOperations: constraintDeletionOperations
        };
    }

    evaluateListConstraints(query: ICollectionListConstraintsQuery): Promise<IConstraint[]> {
        return this.collectionStore.listConstraints(query.collectionName);
    }

    async evaluateConstraintRetrieval(query: IConstraintRetrievalQuery): Promise<IConstraint> {
        return this.collectionStore.retrieveConstraint(query.collectionName, query.constraintName);
    }

    async evaluateConstraintCreation(query: IConstraintCreationQuery): Promise<IConstraintCreationOperation> {
        let collection = await this.collectionStore.retrieveCollection(query.collectionName);

        if (!collection) {
            throw new QueryError(`Collection, ${query.collectionName}, does not exist`);
        }

        let constraints = await this.collectionStore.listConstraints(query.collectionName);

        if (_.some(constraints, c => c.field === query.fieldName)) {
            throw new QueryError(`Constraint on ${query.fieldName} already exists on collection, ${query.collectionName}`);
        }

        if (_.some(constraints, c => c.name === query.constraintName)) {
            throw new QueryError(`Constraint, ${query.constraintName}, already exists on collection, ${query.collectionName}`);
        }

        let documents = await this.documentStore.retrieveDocuments(query.collectionName, []);

        let documentsMissingField = _.filter(documents, d => !(query.fieldName in d));

        if (documentsMissingField.length !== 0) {
            throw new QueryError(`Cannot create constraint due to the following documents missing the field ${query.fieldName}: ${JSON.stringify(documentsMissingField)}}`);
        }

        if (query.constraintType === ConstraintType.Unique && _.uniqBy(documents, d => d[query.fieldName]).length !== documents.length) {
            let nonUniqueDocuments = _.filter(documents, d1 => _.some(documents, d2 => d1._id !== d2._id && d2[query.fieldName] === d2[query.fieldName]));

            if (nonUniqueDocuments.length !== 0) {
                throw new QueryError(`Cannot create Unique constraint due to existing documents having similar values: ${JSON.stringify(nonUniqueDocuments)}`);
            }
        }

        return {
            collectionName: query.collectionName,
            type: query.constraintType,
            name: query.constraintName,
            field: query.fieldName
        };
    }

    async evaluateConstraintDeletion(query: IConstraintDeletionQuery): Promise<IConstraintDeletionOperation> {
        let collection = await this.collectionStore.retrieveCollection(query.collectionName);

        if (!collection) {
            throw new QueryError(`Collection, ${query.collectionName}, does not exist`);
        }

        let constraint = await this.collectionStore.retrieveConstraint(query.collectionName, query.constraintName);

        if (!constraint) {
            throw new QueryError(`Constraint, ${query.constraintName}, doesn't exist on collection, ${query.collectionName}`);
        }

        return {
            collectionName: query.collectionName,
            constraint: constraint
        };
    }

    evaluateDBListCollections(dbListCollectionsQuery: IDBListCollectionsQuery): Promise<ICollection[]> {
        return this.collectionStore.listCollections();
    }

    private async retrieveConflictingDocuments(collectionName: string, value: Object): Promise<IDocument[]> {
        let constraints = await this.collectionStore.listConstraints(collectionName);

        let matchingDocumentsRequests = _.chain(constraints)
            .filter(c => c.field in value && c.type === ConstraintType.Unique)
            .map(c => {
                let filter: IWhereFilter = {
                    type: FilterType.Where,
                    field: c.field,
                    operator: WhereOperator.equal,
                    value: value[c.field]
                };
                return this.documentStore.retrieveDocuments(collectionName, [filter]);
            })
            .value();

        let matchingDocuments = await Promise.all(matchingDocumentsRequests);

        let numMatchingDocuments = _.chain(matchingDocuments)
            .flatMap(md => md)
            .value();

        return numMatchingDocuments;
    }

    private avg(field: string, documents: IDocument[]) {
        return this.sum(field, documents) / documents.length;
    }

    private sum(field: string, documents: IDocument[]) {
        return _.sumBy(documents, field);
    }

    private min(field: string, documents: IDocument[]): any {
        let minDocument = _.minBy(documents, field);
        return !!minDocument ? minDocument[field] : null;
    }

    private max(field: string, documents: IDocument[]): any {
        let maxDocument = _.maxBy(documents, field);
        return !!maxDocument ? maxDocument[field] : null;
    }
}