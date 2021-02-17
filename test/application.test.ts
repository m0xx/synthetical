import Synthetical from '../lib';

test('returns 404 when no handler found', async () => {
    const app = new Synthetical();

    const res = await app.handleRequest({
        url: '/',
        method: 'GET'
    })

    expect(res.status).toBe(404);
});

test('execute handler when route is found', async () => {
    const app = new Synthetical();

    const message = "foo";
    app.on('GET', '/test', async (ctx) => {
        ctx.status(200).body(message)
    })

    const res = await app.handleRequest({ url: '/test', method: 'GET' })

    expect(res.status).toBe(200);
    expect(res.body).toBe(message);
});

test('should execute middleware', async () => {
    const app = new Synthetical();

    app.use(async (ctx, next) => {
        ctx.header('ping', 'pong')

        await next();
    })
    app.on('GET', '/test', async (ctx) => {
        expect(ctx._headers['ping']).toBe('pong');
        ctx.status(200).body('')
    })

    await app.handleRequest({ url: '/test', method: 'GET' })
});

test('should handle middleware errors', async () => {
    const app = new Synthetical();
    const errorMsg = 'oops';

    app.use(async () => {
        throw new Error(errorMsg);
    })

    app.on('GET', '/test', async (ctx) => {
        ctx.status(200).body('')
    })

    const resp = await app.handleRequest({ url: '/test', method: 'GET' })
    expect(resp.status).toBe(500);
    expect(resp.body).toBe(errorMsg);

});

test('should execute middleware for default route', async () => {
})