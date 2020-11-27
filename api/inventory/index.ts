import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { Collection } from 'mongodb';
import { InventoryBase } from '../models/inventory-base';
import { getCollection } from '../util/my-mongo';
import { ValidateAuth } from '../util/temp-auth';
import { v4 as uuidv4 } from 'uuid';
import { format, addMonths } from 'date-fns';

const doesInvExist = { $or: [
    { removed: { $exists: false } }
    , {removed: false}
]};

const getEntry = async (collection: Collection,  id: string, pending: boolean = false): Promise<InventoryBase[]> => {
    const query: {[key: string]: any} = {};
    if (pending) {
        query.pending = true;
        Object.assign(query, doesInvExist);
    } else {
        Object.assign(query, {$and: [
            doesInvExist,
            { $or: [
                { pending: { $exists: false } }
                , {pending: false}
            ]}
        ]});
    }
    if (id) {
        query._id = id;
    }
    const content: InventoryBase[] = await collection.find(query).toArray();
    // console.log('content from mongo', content, query);
    // if it wasn't in the cache, look it up an open food facts...

    return content;
};


const removeEntry = async (collection: Collection,  id: string, purge: boolean = false): Promise<boolean> => {
    const query = { _id: id };
    if (purge) {
        const reply = await collection.deleteOne(query);
        return (reply && reply.deletedCount > 0);
    }
    Object.assign(query, doesInvExist);
    const upReply = await collection.updateOne(query,  { $set: {removed: true}}, { upsert: true});
    return (upReply && (upReply.result.ok === 1));
};

const insertEntry = async (collection: Collection, itm: InventoryBase): Promise<InventoryBase> => {
    const rtnEntry = cleanupSubmission(itm);

    const reply = await collection.insertOne(rtnEntry);
    if (!reply || !reply.insertedId) {
        return null;
    }
    rtnEntry._id = reply.insertedId;
    return rtnEntry;
};

const cleanupSubmission = (itm: InventoryBase): InventoryBase => {
    const rtnItem = JSON.parse(JSON.stringify(itm)) as InventoryBase;
    if (!rtnItem._id) {
        rtnItem._id = uuidv4();
    }
    if (!rtnItem.quantity) {
        rtnItem.quantity = 1;
    }
    if (!rtnItem.created) {
        rtnItem.created = format(new Date((new Date()).toUTCString()), 'yyyy-MM-dd')
    }
    if (!rtnItem.expire) {
        rtnItem.expire = format(new Date((addMonths(new Date(), 3)).toUTCString()), 'yyyy-MM-dd')
    }
    return rtnItem;
};

const updateEntry = async (collection: Collection, id: string, content: InventoryBase): Promise<boolean> => {
    const query = Object.assign({ _id: id }, doesInvExist);
    const reply = await collection.updateOne(query,  { $set: content}, {upsert: true});
    return (reply && (reply.result.ok === 1));
};


const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest): Promise<void> => {
    if (!ValidateAuth(req)) {
        context.res = {
            status: 403
        };
        return;
    }
    const id = context.bindingData.id ? String(context.bindingData.id) : null;
    let content: InventoryBase[] = null;
    let statusCode = 404;
    const isPurge = req.query.purge === 'true' ? true : false;
    const isPending = typeof req.query.pending !== 'undefined' ? true : false;
    // attempt to look it up in the cache
    const body: InventoryBase = req.body;

    try {
        const [collection, client] = await getCollection('currentLog', 'f_log');
        try {
            switch (req.method) {
                case 'GET':
                    content = await getEntry(collection, id, isPending);
                    break;
                case 'DELETE':
                    const delSus = await removeEntry(collection, id, isPurge);
                    statusCode = delSus ? 410 : 404;
                    break;
                case 'POST':
                    if (!id) {
                        const entry = await insertEntry(collection, body);
                        if (entry) {
                            content = [entry];
                        } else {
                            statusCode = 405;
                        }
                    }
                    break;
                case 'PUT':
                    const updated = await updateEntry(collection, id, body);
                    if (updated) {
                        statusCode = 204;
                        content = null;
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
            body: content
        };
    } else {
        context.res = {
            status: statusCode
        };
    }

};

export default httpTrigger;
