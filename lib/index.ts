import FMWRouter, {HTTPVersion} from 'find-my-way';
import compose from 'koa-compose';
import type Router from "find-my-way";

export type SyntheticalRequest = {
    url: string
    method: Router.HTTPMethod
}

export type SyntheticalResponse = {
    status: number
    body: string
}

export type HTTPMethod = Router.HTTPMethod;

class Context {
    _status: number = 0
    _body: string = ''
    _headers: {[key: string]: string} = {}
    constructor(private _req: SyntheticalRequest) {
    }
    status(status: number): Context {
        this._status = status;
        return this;
    }
    json(data: object): Context {
        const json = JSON.stringify(data);
        return this.body(json);
    }
    body(data: string): Context {
        this._body = data;
        return this;
    }
    header(key: string, value: string): Context {
        this._headers[key] = value;
        return this;
    }
}

export type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>

class RouterProxy {
    _fmwRouter: Router.Instance<HTTPVersion.V1>
    constructor() {
        this._fmwRouter = FMWRouter({
            caseSensitive: false,
            // @ts-ignore
            defaultRoute(req: any,  resolve: (res: HttpResponse) => void) {
                resolve({
                    status: 404,
                    body: 'not found'
                })
            }
        });
    }
    on(method: Router.HTTPMethod, path: string, middlewares: Middleware[]) {
        // @ts-ignore
        this._fmwRouter.on('GET', path, (req: any, resolve: (res: HttpResponse) => void) => {
            const ctx = new Context(req);
            const fn = compose(middlewares)

            fn(ctx)
                .then(() => {
                    resolve({
                        status: ctx._status,
                        body: ctx._body
                    })
                })
                .catch((err) => {
                    resolve({
                        status: 500,
                        body: err.message
                    })
                })
        })
    }
    lookup(req: SyntheticalRequest): Promise<SyntheticalResponse> {
        return new Promise((resolve) => {
            // @ts-ignore
            this._fmwRouter.lookup(req, resolve)
        })
    }
}


class Synthetical {
    _middlewares: Middleware[] = []
    _router: RouterProxy = new RouterProxy()
    use(middleware: Middleware) {
        this._middlewares.push(middleware)
    }
    on(method: Router.HTTPMethod, path: string, handler: Middleware) {
        this._router.on(method, path, [...this._middlewares, handler])
    }
    handleRequest(req: SyntheticalRequest): Promise<SyntheticalResponse> {
        return this._router.lookup(req);
    }
}



export default Synthetical;