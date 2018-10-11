const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

router.get('/', (ctx, next) => {
  ctx.body = 'Hello KShot!'
})
router.get('/shot', (ctx, next) => {
  ctx.body = 'Hello Shot!'
})

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(process.env.PORT || 80)
