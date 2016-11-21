import { DataStore } from "./dataStore";
import * as uuid from "node-uuid";
import * as _ from "lodash";

export class CollectionStore implements ICollectionStore {
    private collections: DataStore<ICollection>;

    private constructor(collections: DataStore<ICollection>) {
        this.collections = collections;
    }

    static async create(): Promise<CollectionStore> {
        let dataStore = await DataStore.create<ICollection>("db/collections.db");
        return new CollectionStore(dataStore);
    }

    async listConstraints(collectionName: string): Promise<IConstraint[]> {
        return (await this.getCollection(collectionName)).constraints;
    }

    async listCollections(): Promise<ICollection[]> {
        return this.collections.retrieve([]);
    }

    createCollection(name: string): Promise<ICollection> {
        return this.collections.insert({
            _id: uuid.v4(),
            name: name,
            constraints: []
        });
    }

    async retrieveCollection(name: string): Promise<ICollection> {
        return this.getCollection(name);
    }

    async deleteCollection(id: string): Promise<ICollection> {
        return this.collections.delete(id);
    }

    async createConstraint(collectionName: string, constraintName: string, field: string, type: ConstraintType): Promise<IConstraint> {
        let newConstraint: IConstraint = {
            _id: uuid.v4(),
            field: field,
            type: type,
            name: constraintName
        };

        let collection = await this.getCollection(collectionName);
        collection.constraints.push(newConstraint);

        return newConstraint;
    }

    async deleteConstraint(collectionName: string, constraintName: string): Promise<IConstraint> {
        let collection = await this.getCollection(collectionName);
        let constraint = _.find(collection.constraints, c => c.name === constraintName);
        collection.constraints = collection.constraints.filter(c => c.name !== constraintName);

        return constraint;
    }

    async retrieveConstraint(collectionName: string, constraintName: string): Promise<IConstraint> {
        return (await this.getCollection(collectionName)).constraints.filter(c => c.name === constraintName)[0];
    }

    private async getCollection(collectionName: string): Promise<ICollection> {
        if (!this.collections.hasIndex("name")) {
            await this.collections.createIndex("name", true);
        }

        let filter: IWhereFilter = {
            type: FilterType.Where,
            field: "name",
            operator: WhereOperator.equal,
            value: collectionName
        };

        let result = await this.collections.retrieve([filter]);

        return result.length === 1 ? result[0] : null;
    }
}
