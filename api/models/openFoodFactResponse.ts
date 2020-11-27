import { OpenFoodFactBaseProduct } from './openFoodFactBaseProduct';

export interface OpenFoodFactsResponse {
    status: number;
    product: OpenFoodFactBaseProduct;
    status_verbose: string;
    code: string;
}