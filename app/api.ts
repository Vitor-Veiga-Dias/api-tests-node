import 'dotenv/config'
import * as jwt from 'jsonwebtoken';
import { once } from 'node:events';
import {
     createServer,
     IncomingMessage, 
     ServerResponse,
     IncomingHttpHeaders,
     } from 'node:http';
import { CATEGORIES, TOKEN_KEY, VALID } from './constants';
import { ProductParams, UserParams } from './types';

const { PORT } = process.env

async function loginRoute(
    request: IncomingMessage,
    response: ServerResponse
     ) {
    const records: UserParams[] = await once(request, 'data');
    const {user, password} = JSON.parse(String(records));
    if(user !== VALID.user || password !== VALID.password) {
        console.log(user, password)
        response.writeHead(400)
        response.end(JSON.stringify({error: 'user invalid'}));
        return
    }
    const token = jwt.sign({ user, mensage: 'heyduude' }, TOKEN_KEY);
    response.end(JSON.stringify({token}))
};

async function createProductsRoute(
    request: IncomingMessage,
     response: ServerResponse
     ) {
        const records: ProductParams[] = await once(request, "data");
        const {name, description, price} = JSON.parse(String(records));

        const [result] = Object.keys(CATEGORIES).filter(key => {
            const category = CATEGORIES[key];
            return price >= category.from && price <= category.to;
        })

        response.end(JSON.stringify({category: result}));
     };

function validateHeaders(headers: IncomingHttpHeaders) {
    try {
        const auth  = headers.authorization.replace(/bearer\s/ig, '');
        jwt.verify(auth, TOKEN_KEY)
        return true;
    } catch (error) {
        return false;
    }

}
async function handler(
    request: IncomingMessage,
    response: ServerResponse
) {

    if(request.url === '/login' && request.method === 'POST') {
            return loginRoute(request, response);
    };

    if(!validateHeaders(request.headers)) {
        response.writeHead(404);
    };

    if(request.url === '/products' && request.method === 'POST') {
        return createProductsRoute(request, response);
    };

    response.writeHead(404)
    response.end('not found!')
};

const server = createServer(handler)
.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));

export {server};