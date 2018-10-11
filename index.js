const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

router.get('/', (ctx, next) => {
  ctx.body = 'Hello KShot!'
})
router.get('/shot', (ctx, next) => {
  const url = ctx.request.query.url
  if (typeof url === 'undefined') {
    ctx.body = 'please set parameter `url`.'
    return
  }
  ctx.body = ctx.request.query.url
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(process.env.PORT || 80)
