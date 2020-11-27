import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Collection, MongoClient } from 'mongodb';
import { getCollection } from '../util/my-mongo';
import * as fetch from 'node-fetch';
import { OpenFoodFactBaseProduct } from '../models/openFoodFactBaseProduct';
import { OpenFoodFactsResponse } from '../models/openFoodFactResponse';
import { ValidateAuth } from '../util/temp-auth';

const cleanUpProduct = (prd: OpenFoodFactBaseProduct): OpenFoodFactBaseProduct => {
    const rtnObj: OpenFoodFactBaseProduct = {
        categories: prd.categories,
        code: prd.code,
        product_name: prd.product_name,
        branch_owner: prd.branch_owner,
    };

    if (prd.image_url) {
        rtnObj.image_url = prd.image_url;
    }
    if (prd.brands) {
        rtnObj.brands = prd.brands;
    }

    if (!prd.branch_owner && prd.brands) {
        prd.branch_owner = prd.brands;
    }
    return rtnObj;
};

const getEntry = async (collection: Collection,  code: string): Promise<OpenFoodFactBaseProduct> => {
    const query = { code };
    let content: OpenFoodFactBaseProduct = await collection.findOne(query);
    // console.log('content from mongo', content, query);
    // if it wasn't in the cache, look it up an open food facts...
    if (!content) {
        console.log(`not in cache, looking up remote [${code}]`);
        const reply = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
        const cnt = await reply.json() as OpenFoodFactsResponse;
        if (cnt && cnt.status === 1) {
            content = cleanUpProduct(cnt.product);
            collection.insertOne(content);
        }
    }
    return content;
};

const removeEntry = async (collection: Collection,  code: string): Promise<boolean> => {
    const query = { code };
    const reply = await collection.deleteOne(query);
    return (reply && reply.deletedCount > 0);
};

const updateEntry = async (collection: Collection,  content: OpenFoodFactBaseProduct): Promise<boolean> => {
    const query = { code: content.code };
    const reply = await collection.updateOne(query,  { $set: content}, {upsert: true});
    return (reply && (reply.result.ok === 1));
};

const isValidCache = (prd: OpenFoodFactBaseProduct): boolean => {
    if (!prd) {
        return false;
    }
    if (!prd.code || !prd.product_name) {
        return false;
    }
    return true;
};

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
    if (!ValidateAuth(req)) {
        context.res = {
            status: 403
        };
        return;
    }
    const code = String(context.bindingData.code);
    let content: OpenFoodFactBaseProduct = null;
    let isDelete = false;
    let isCreated = false;
    // attempt to look it up in the cache

    try {
        const [collection, client] = await getCollection('currentLog', 'cache');
        try {
            switch (req.method) {
                case 'GET':
                    content = await getEntry(collection, code);
                    break;
                case 'DELETE':
                    isDelete = await removeEntry(collection, code);
                    break;
                case 'POST':
                    const body: OpenFoodFactBaseProduct = req.body;
                    if (body && isValidCache(body)) {
                        isCreated = await updateEntry(collection, body);
                    }
                    break;
            }
        } finally {
            client.close();
        }
    } catch (ex) {
        console.error(ex);
    }

    if (content) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: cleanUpProduct(content)
        };
    } else if (isDelete) {
        context.res = {
            status: 410
        };
    } else if (isCreated) {
        context.res = {
            status: 201
        };
    }else {
        context.res = {
            status: 404
        };
    }

};

export default httpTrigger;
