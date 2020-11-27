export interface InventoryBase {
    _id?: string;
    brands?: string;
    product_name: string;
    image_url?: string;
    brand_owner: string;
    quantity?: number;
    code?: string;
    __key?: string;
    created?: string;
    expire?: string;
    session?: string;
    removed?: boolean;
    pending: boolean;
}
