# Synthetical

Small framework designed for serverless environment, it's not a server, it's more like a router.

## Goals
- Support for middlewares that can:
    - mutate request
    - send a response (circuit breaker)
- JIT handler evaluation and execution
- Quick to boot
- Promise API

## Limitation
- no stream
- payload size limitation


# API draft

```javascript
const synthetical = require('synthetical');
const app = synthetical({
    fallbackRoute: (ctx) => {
        return ctx.status(404).json({msg: 'oops not found...'})
    }
});

const logger = async (ctx, next) => {
    console.log(ctx);
    
    await next();
}
app.use(logger);

app.route({
  methd: "GET",
  path: "/me",
  handler: async (ctx) => {
      ctx.status(200).json({
        username: 'john'
      })
  }
});

const { body } = await app.handleRequest({method: 'GET', url: 'http://localhost/me'});

console.log(`Hello ${body.username}!`) 
```
