import { HttpRequest } from '@azure/functions';
import * as cookie from 'cookie';

export function ValidateAuth( req: HttpRequest): boolean {
    if (!req.headers.cookie) {
        return false;
    }
    try {
        const cookies = cookie.parse(req.headers.cookie);
        if (cookies.tempkey && cookies.tempkey === process.env.TEMP_KEY) {
            return true;
        }
    } catch (ex) {
        console.error(ex);
    }
    return false;
}
