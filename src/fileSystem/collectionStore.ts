import { DataStore } from "./dataStore";
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

    createCollection(collection: ICollection): Promise<ICollection> {
        return this.collections.insert(collection);
    }

    async retrieveCollection(name: string): Promise<ICollection> {
        return this.getCollection(name);
    }

    async deleteCollection(id: string): Promise<ICollection> {
        return this.collections.delete(id);
    }

    async createConstraint(collectionName: string, constraint: IConstraint): Promise<IConstraint> {
        let collection = await this.getCollection(collectionName);
        collection.constraints.push(constraint);

        await this.collections.update(collection._id, collection);

        return constraint;
    }

    async deleteConstraint(collectionName: string, constraintName: string): Promise<IConstraint> {
        let collection = await this.getCollection(collectionName);
        let constraint = _.find(collection.constraints, c => c.name === constraintName);

        collection.constraints = collection.constraints.filter(c => c.name !== constraintName);

        await this.collections.update(collection._id, collection);

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
