import { Collection, MongoClient } from 'mongodb';

const uri = process.env.CONNECTION_STRING;

export function getCollection(databaseName: string, collectionName: string): Promise<[Collection, MongoClient]> {
    const rtnObj = new Promise<[Collection, MongoClient]>((resolve, reject): void => {
        const client = new MongoClient(uri);

        client.connect().then((cln) => {
            try {
                const database = client.db(databaseName);
                const collection = database.collection(collectionName);
                resolve([collection, cln]);
            } catch(ex) {
                cln.close();
                reject(ex);
            }
        }, (err) => {
            reject(err);
        });

    });
    return rtnObj;
}
